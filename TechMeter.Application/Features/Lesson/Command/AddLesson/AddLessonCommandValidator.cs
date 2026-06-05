using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Features.Lesson.Command.AddLesson
{
    public class AddLessonCommandValidator:AbstractValidator<AddLessonCommand>
    {
        private readonly string[] videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm", ".m4v", ".mpeg", ".mpg", ".3gp", ".ts", ".mts", ".m2ts", ".ogv" };
        private readonly string[] imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp" };
        public AddLessonCommandValidator()
        {
            RuleFor(b => b)
                .Must(b => !string.IsNullOrEmpty(b.request.Name) && b.request.LessonStream != null)
                .WithMessage("Lesson Name And LessonStream Is Required");

            RuleFor(b => b)
                .Must(b => videoExtensions.Contains(Path.GetExtension(b.request.LessonStream.FileName).ToLower()) || imageExtensions.Contains(Path.GetExtension(b.request.LessonStream.FileName).ToLower()))
                .WithMessage("Invalid file type. Please upload a video or image file.");
        }
    }
}
