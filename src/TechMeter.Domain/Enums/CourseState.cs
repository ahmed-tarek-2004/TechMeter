using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Enums
{
    public enum CourseState
    {
        Draft = 1,
        PendingReview = 2,
        Published = 3,
        Rejected = 4,
        Archived = 5
    }
}
