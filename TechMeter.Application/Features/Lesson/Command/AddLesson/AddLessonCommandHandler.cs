using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Services.Jobs;
using TechMeter.Application.Interfaces.Services.MediaUpload;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandHandler(IApplicationDbContext context, ITransactionManager transactionManager, ILogger<AddLessonCommandHandler> logger,
       IMediaUploadService mediaUpload, ResponseHandler responseHandler) : IRequestHandler<AddLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(AddLessonCommand request, CancellationToken cancellationToken)
        {
            var section = await context.Section.AsNoTracking()
                .Where(b => b.Id == request.SectionId)
                .Select(b => new
                {
                    b.Id,
                    LessonCount = b.Lessons.Count(),
                    b.CourseId
                }).FirstOrDefaultAsync(cancellationToken);

            if (section == null)
            {
                return responseHandler.NotFound<string>("Section is not found");
            }
            string LessonUrl = string.Empty;

            var course = await context.Course.FirstOrDefaultAsync(b => b.Id == section.CourseId);
            if (course == null)
            {
                return responseHandler.NotFound<string>("Course is not found");
            }
            await using var transaction = await transactionManager.BeginTransactionAsync();
            try
            {
                var Lesson = new TechMeter.Domain.Models.Lessons()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.AddLessonRequest.Name,
                    Description = request.AddLessonRequest.Description,
                    SectionId = request.SectionId,
                    LessonUrl = string.Empty,
                    LessonOrder = request.AddLessonRequest.LessonOrder.HasValue ? request.AddLessonRequest.LessonOrder.Value : section.LessonCount
                };

                await context.Lessons.AddAsync(Lesson);

                await context.Course
                    .Where(c => c.Id == section.CourseId)
                    .ExecuteUpdateAsync(x =>
                        x.SetProperty(c => c.LessonCount, c => c.LessonCount + 1));

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync();
                await mediaUpload.UploadLessonMedia(request.AddLessonRequest.LessonStream, Lesson.Id, request.AddLessonRequest.Name, cancellationToken);

                return responseHandler.Created("Lesson Created Successfully", $"Lesson {request.AddLessonRequest.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }


    }
}
