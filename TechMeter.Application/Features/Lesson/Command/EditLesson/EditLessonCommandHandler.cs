using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Command.EditLesson
{
    public class EditLessonCommandHandler(IApplicationDbContext context,ITransactionManager transactionManager, ResponseHandler responseHandler) : IRequestHandler<EditLessonCommand, Response<GetLessonResponse>>
    {
        public async Task<Response<GetLessonResponse>> Handle(EditLessonCommand request, CancellationToken cancellationToken)
        {
            var Lesson = await context.Lessons
              .FirstOrDefaultAsync(b => b.Id == request.Id);

            if (Lesson == null)
            {
                return responseHandler.NotFound<GetLessonResponse>("Lesson Not Found");
            }
            var section = await context.Section.FindAsync(request.EditLessonRequest.SectionId);
            if (section == null)
            {
                return responseHandler.NotFound<GetLessonResponse>("Section Not Found");
            }
            await using var transaction = await transactionManager.BeginTransactionAsync();
            try
            {
                Lesson.Description = request.EditLessonRequest.Description;
                Lesson.Name = request.EditLessonRequest.Name;
                Lesson.SectionId = request.EditLessonRequest.SectionId;
                await context.SaveChangesAsync(cancellationToken);

                var response = new GetLessonResponse()
                {
                    Id = Lesson.Id,
                    //LessonUrl = request.EditLessonRequest.LessonUrl,
                    SectionId = request.EditLessonRequest.SectionId,
                    Description = Lesson.Description,
                    Name = Lesson.Name,

                };
                await transaction.CommitAsync();
                return responseHandler.Success(response, $"Lesson {response.Name} updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }
    }
}
