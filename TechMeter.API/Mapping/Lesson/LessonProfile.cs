using AutoMapper;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Features.Lesson.Command.AddLesson;

namespace TechMeter.API.Mapping.Lesson
{
    public class LessonProfile : Profile
    {
        public LessonProfile()
        {
            CreateMap<AddLessonRequest, AddLessonCommand>()
                .ForMember(des => des.SectionId, opt => opt.Ignore());
        }

    }
}
