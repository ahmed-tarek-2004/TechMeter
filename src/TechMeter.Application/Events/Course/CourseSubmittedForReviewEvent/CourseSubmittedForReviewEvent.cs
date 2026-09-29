using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Events.Course.ProviderAddedCourse
{
    public sealed record CourseSubmittedForReviewEvent(string ProviderId) : INotification;
}
