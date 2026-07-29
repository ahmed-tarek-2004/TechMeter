using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Features.Section.Command.AddSection;
using TechMeter.Application.Features.Section.Command.EditSection;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Services.Section
{
    public interface ISectionService
    {
        Task<Response<List<GetSectionResponse>>> GetAllCourseSectionsAsync(string courseId);
        Task<Response<GetSectionResponse>> GetSectionDetailedByIdAsync(string courseId, string sectionId);
        Task<Response<string>> AddSectionAsync(string providerId,string courseId, string sectionName);
        Task<Response<string>> EditSectionAsync(string Id,string providerId,EditSectionRequest request);
        Task<Response<string>>DeleteSectionByIdAsync(string providerId,string courseId,string sectionId);
        //Task<Response<List<GetSectionResponse>>> GetCourseSectionsAsync(string courseId);

    }
}
