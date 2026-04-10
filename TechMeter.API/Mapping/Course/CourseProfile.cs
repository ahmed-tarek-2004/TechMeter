using AutoMapper;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.EditCourse;

namespace TechMeter.API.Mapping.Course
{
    public class CourseProfile : Profile
    {
        public CourseProfile()
        {
            CreateMap<EditCourseRequest, EditCourseCommand>()
                .ForMember(des => des.courseId, opt => opt.Ignore())
                .ForMember(des => des.providerId, opt => opt.Ignore());
        }
    }
}
