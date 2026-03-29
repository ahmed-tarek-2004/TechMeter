using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using TechMeter.Domain.Shared;

namespace TechMeter.API.Common.Exceptions
{
    public sealed class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        private readonly IProblemDetailsService _problemDetailsService;
        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger,IProblemDetailsService problemDetailsService)
        {
            _logger = logger;
            _problemDetailsService = problemDetailsService;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {

            var problemDeatils = new ProblemDetails()
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "An unexpected error has occurred, check Logger files ",
                Detail = exception.Message,
                Instance = httpContext.Request.Path
            };
            if (exception is ValidationException validationException)
            {
                var errors = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

                problemDeatils = new ValidationProblemDetails(errors)
                {
                    Title = "Validation Failed",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = string.Join(",",errors.SelectMany(b=>b.Value.ToList())),
                    Instance = httpContext.Request.Path
                };
            }
            _logger.LogError(exception.Message);
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await httpContext.Response.WriteAsJsonAsync(problemDeatils, cancellationToken: default);
            //await _problemDetailsService.WriteAsync(new ProblemDetailsContext
            //{
            //    ProblemDetails = problemDeatils,
            //    HttpContext = httpContext,
            //});
            return true;
        }
    }
}
