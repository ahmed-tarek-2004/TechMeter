using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.DeleteCourse
{
    public class DeleteCourseCommandHandler(UserManager<Domain.Models.Auth.Identity.User> userManager,
        IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<DeleteCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
        {
            var responisble = await userManager.FindByIdAsync(request.responsibleId);
            if (responisble == null)
            {
                return responseHandler.BadRequest<string>("Responsible Is Not Found");
            }
            var course = await context.Course.FindAsync(request.courseId);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not Found");
            }
            try
            {
                context.Course.Remove(course);
                await context.SaveChangesAsync(cancellationToken);
                /*
                 checking role for provider for Sending notification and email message 
                 */


                return responseHandler.Success("", "course Deleted Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("Internal Server Error");
            }
        }
    }
}
