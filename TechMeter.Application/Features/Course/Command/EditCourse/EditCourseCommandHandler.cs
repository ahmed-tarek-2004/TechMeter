using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.EditCourse
{
    public class EditCourseCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler,
        IMediaUploading imageUploading) : IRequestHandler<EditCourseCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(EditCourseCommand request, CancellationToken cancellationToken)
        {

            var provider = await context.Provider.FirstOrDefaultAsync(b => b.Id == request.providerId);
            if (provider == null)
            {
                return responseHandler.BadRequest<string>("Provider Is Not Found");
            }
            var course = await context.Course.FindAsync(request.courseId);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not Found");
            }
            var category = await context.Category.FindAsync(request.editCourseRequest.CategoryId);
            if (category == null)
            {
                return responseHandler.NotFound<string>("category is not Found");
            }
            if (request.editCourseRequest.CourseProfileImageUrl != null)
            {
                course.CourseProfileImageUrl = await imageUploading.UploadAsync(request.editCourseRequest.CourseProfileImageUrl);
            }
            try
            {
                course.ProviderId = request.providerId;
                course.CategoryId = request.editCourseRequest.CategoryId;
                course.Description = request.editCourseRequest.Description;
                course.Title = request.editCourseRequest.Title;
                course.Price = request.editCourseRequest.Price;
                course.Currency = request.editCourseRequest.Currency;

                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "Course Updated Successfully");
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
