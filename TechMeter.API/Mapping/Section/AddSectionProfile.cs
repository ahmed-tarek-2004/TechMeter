using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Features.Section.Command.AddSection;

namespace TechMeter.Application.Mapping.Section
{
    public class AddSectionProfile:Profile
    {
        public AddSectionProfile()
        {
            CreateMap<AddSectionRequest, AddSectionCommand>()
             .ForMember(des=>des.providerId,opt=>opt.Ignore());
        }
    }
}
