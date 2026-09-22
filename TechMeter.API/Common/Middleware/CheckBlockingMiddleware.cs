using Microsoft.AspNetCore.Identity;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.API.Common.Middleware
{
    public class CheckBlockingMiddleware : IMiddleware
    {
        private readonly UserManager<User> _userManager;
        public CheckBlockingMiddleware(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var user = await _userManager.GetUserAsync(context.User);
                if (user != null && await _userManager.IsLockedOutAsync(user))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("User is locked by admin.");
                    return;
                }
            }
            await next.Invoke(context);
        }
    }
}
