using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.Events.Course.AdminTriggeredCourseEvent
{
    public sealed record AdminTriggeredCourseEvent(string ProviderId, string courseTitle, CourseState State) : INotification;
}
