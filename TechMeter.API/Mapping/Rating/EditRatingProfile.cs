using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.EditStudentRating;

namespace TechMeter.Application.Mapping.Rating
{
    public class EditRatingProfile : Profile
    {
        public EditRatingProfile()
        {
            CreateMap<EditStudentRatingRequest, EditStudentRatingCommand>()
                .ForMember(des => des.StudentId, opt => opt.Ignore());
        }
    }
}
