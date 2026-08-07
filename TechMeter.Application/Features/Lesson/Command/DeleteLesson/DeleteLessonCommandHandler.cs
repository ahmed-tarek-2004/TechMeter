using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.Interfaces.Services.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.DeleteLesson
{
    public class DeleteLessonCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<DeleteLessonCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteLessonCommand request, CancellationToken cancellationToken)
        {
            var lesson = await context.Lessons.FirstOrDefaultAsync(b => b.Id == request.Id);
            if (lesson == null)
            {
                return responseHandler.NotFound<string>("Lesson Not Found");
            }
            try
            {
                context.Lessons.Remove(lesson);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Deleted<string>($"Lesson {lesson.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>(ex.Message);
            }
        }
    }
}
