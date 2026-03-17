using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using TechMeter.Domain.Shared;

namespace TechMeter.API.Common.Exceptions
{
    public class GlobalExceptionHandler : IExceptionHandler
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
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "An unexpected error has occurred, check Logger files ",
                Detail = exception.Message,
                Instance = httpContext.Request.Path
            };
            _logger.LogError(exception.Message);
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            // await httpContext.Response.WriteAsJsonAsync(problemDeatils, cancellationToken: default);
            await _problemDetailsService.WriteAsync(new ProblemDetailsContext
            {
                ProblemDetails = problemDeatils,
                HttpContext = httpContext,
            });
            return true;
        }
    }
}
