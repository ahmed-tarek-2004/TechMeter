using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Profile
{
    public class GetAdminUsersRequest
    {
        public string? UserName { get; set; }
        public string? role { get; set; }
        public bool? IsLocked { get; set; } = false;
        public bool? IsTwoFactorEnabled { get; set; } = false;
    }
}
