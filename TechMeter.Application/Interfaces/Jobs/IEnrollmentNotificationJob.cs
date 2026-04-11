using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Jobs
{
    public interface IEnrollmentNotificationJob
    {
        public Task SendNotification(string userId, string Title, string Message, DateTime CreatedAt);
    }
}
