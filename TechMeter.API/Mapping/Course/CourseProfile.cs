using AutoMapper;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.Features.Course.Command.AddCourse;
using TechMeter.Application.Features.Course.Command.EditCourse;

namespace TechMeter.API.Mapping.Course
{
    public class CourseProfile : Profile
    {
        public CourseProfile()
        {
            CreateMap<EditCourseRequest, EditCourseCommand>()
                .ForMember(des => des.providerId, opt => opt.Ignore())
                .ForMember(des => des.courseId, opt => opt.Ignore());

            CreateMap<AddCourseRequest, AddCourseCommand>()
                .ForMember(des => des.providerId, opt => opt.Ignore());
        }
    }
}
