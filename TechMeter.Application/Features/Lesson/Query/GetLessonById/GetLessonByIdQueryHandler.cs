using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Lesson.Query.GetLessonById
{
    public class GetLessonByIdQueryHandler(IApplicationDbContext context, ResponseHandler responseHandler) : IRequestHandler<GetLessonByIdQuery, Response<GetLessonResponse>>
    {
        public async Task<Response<GetLessonResponse>> Handle(GetLessonByIdQuery request, CancellationToken cancellationToken)
        {
            var lesson = await context.Lessons
                .Where(b => b.Id == request.Id)
                .Select(b => new GetLessonResponse()
                {
                    Id = b.Id,
                    Description = b.Description,
                    //LessonUrl = lesson.LessonUrl,
                    Name = b.Name,
                    SectionId = b.SectionId,
                }).FirstOrDefaultAsync();
            if (lesson == null)
                return responseHandler.NotFound<GetLessonResponse>("Lesson is not found");

            return responseHandler.Success(lesson, "Lesson returned successfully");
        }

    }
}
