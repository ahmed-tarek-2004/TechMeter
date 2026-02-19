using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Section;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.SectionService
{
    public interface ISectionService
    {
        Task<Response<List<GetSectionResponse>>> GetAllCourseSectionsAsync(string providerId, string courseId);
        Task<Response<GetSectionResponse>> GetSectionByIdAsync(string responsiable, string courseId, string sectionId);
        Task<Response<AddSectionResponse>> AddSectionAsync(string providerId,AddSectionRequest request);
        Task<Response<GetSectionResponse>> EditSectionAsync(string providerId, EditSectionRequest request);
        Task<Response<string>>DeleteSectionByIdAsync(string providerId,string courseId,string sectionId);

    }
}
