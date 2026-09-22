using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Profile
{
    public class GetAdminUsersResponse
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool IsConfirmed { get; set; }
        public bool IsLocked { get; set; }
        public bool IsTwoFactorEnabled { get; set; }
        public string? profileImageUrl { get; set; }
        public List<string> Roles { get; set; }
    }
}
