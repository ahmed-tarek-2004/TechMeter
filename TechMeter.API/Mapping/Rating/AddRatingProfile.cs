using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Rating;
using TechMeter.Application.Features.Rating.Command.AddStudentRating;

namespace TechMeter.Application.Mapping.Rating
{
    public class AddRatingProfile:Profile
    {
        public AddRatingProfile()
        {
             CreateMap<AddStudentRatingRequest,AddStudentRatingCommand>()
                .ForMember(des=>des.StudentId,opt=>opt.Ignore());
        }
    }
}
