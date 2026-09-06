using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Interfaces.Services.MediaUpload;

//using TechMeter.Application.Interfaces.Services.Course;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Course.Command.AddCourse
{
    public class AddCourseCommandHandler(IApplicationDbContext context,ResponseHandler responseHandler,
        ILogger<AddCourseCommandHandler> logger,IMediaUploading imageUploading) : IRequestHandler<AddCourseCommand, Response<AddCourseResponse>>
    {
        public async Task<Response<AddCourseResponse>> Handle(AddCourseCommand request, CancellationToken cancellationToken)
        {
            var provider = await context.Provider.FirstOrDefaultAsync(b => b.Id == request.providerId);
            if (provider == null)
            {
                return responseHandler.BadRequest<AddCourseResponse>("Provider Is Not Found");
            }

            var category = await context.Category.FirstOrDefaultAsync(b => b.Id == request.addCourseRequest.CategoryId);
            if (category == null)
            {
                return responseHandler.NotFound<AddCourseResponse>("Category Is Not Found");
            }

            string imageUrl = "";
            try
            {
                imageUrl = request.addCourseRequest.CourseProfileImageUrl == null ? "Empty" : await imageUploading.UploadAsync(request.addCourseRequest.CourseProfileImageUrl);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error Occurred while uploading Image");
                imageUrl = "Empty";
            }


            //await using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var course = new Domain.Models.Course()
                {
                    Id = Guid.NewGuid().ToString(),
                    CourseProfileImageUrl = imageUrl,
                    CategoryId = request.addCourseRequest.CategoryId,
                    Description = request.addCourseRequest.Description,
                    Title = request.addCourseRequest.Title,
                    ProviderId = request.providerId,
                    Price = request.addCourseRequest.Price,
                    Currency = request.addCourseRequest.Currency,

                };
                await context.Course.AddAsync(course);
                await context.SaveChangesAsync(cancellationToken);
                var response = new AddCourseResponse()
                {
                    Id = course.Id,
                    CourseProfileImageUrl = course.CourseProfileImageUrl,
                    Description = course.Description,
                    Title = course.Title,
                    CategoryId = course.CategoryId,
                    Currency = course.Currency,
                    Price = course.Price,
                };
                //await transaction.CommitAsync();
                return responseHandler.Success(response, "Course Created Successfully");
            }
            catch (Exception ex)
            {
                //await transaction.RollbackAsync();
                return responseHandler.InternalServerError<AddCourseResponse>(ex.Message);
            }
        }
    }
}
