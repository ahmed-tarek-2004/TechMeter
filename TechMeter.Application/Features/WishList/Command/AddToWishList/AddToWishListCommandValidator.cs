using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Validators;

namespace TechMeter.Application.Features.WishList.Command.AddToWishList
{
    public class AddToWishListCommandValidator:AbstractValidator<AddToWishListCommand>
    {
        public AddToWishListCommandValidator()
        {
            RuleFor(b => b.courseId)
                .Must(b => !string.IsNullOrEmpty(b))
                .WithMessage("courseId is required");
        }
    }
}