using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models
{
    public class UserFcmToken
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
        public string DeviceType { get; set; }
        public DateTime CreatedAt { get; set; }
        public User User { get; set; }
    }
}
