using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Notification
{
    public class NotificationRequest
    {
        public string? Token { get; set; }

        public string? Topic { get; set; }

        public string? Condition { get; set; }

        public string Title { get; set; } = default!;

        public string Body { get; set; } = default!;
    }
}
