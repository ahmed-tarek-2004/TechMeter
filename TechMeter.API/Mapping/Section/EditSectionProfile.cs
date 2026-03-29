using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Features.Section.Command.EditSection;

namespace TechMeter.Application.Mapping.Section
{
    public class EditSectionProfile:Profile
    {
        public EditSectionProfile()
        {
            CreateMap<EditSectionRequest, EditSectionCommand>()
                .ForMember(des=>des.Id , opt=>opt.Ignore())
                .ForMember(des=>des.providerId , opt=>opt.Ignore());
        }
    }
}
