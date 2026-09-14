using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Shared.Helpers;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandValidator:AbstractValidator<AddLessonCommand>
    {
        public AddLessonCommandValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.AddLessonRequest.Name) && b.AddLessonRequest.LessonStream != null)
                .WithMessage("Lesson Name And LessonStream Is Required");

            RuleFor(b => b)
                .Must(b => MediaExtension.GetMediaType(b.AddLessonRequest.LessonStream.FileName) == MediaType.Video ||
                MediaExtension.GetMediaType(b.AddLessonRequest.LessonStream.FileName) == MediaType.Image || 
                MediaExtension.GetMediaType(b.AddLessonRequest.LessonStream.FileName) == MediaType.File)
                .WithMessage("Invalid file type. Please upload a video or image or ICDL file.");
        }
    }
}
