using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models.Auth.Identity
{
    public class User:IdentityUser<string>
    {
        public string Country {  get; set; }
        public string? ProfileUrl { get; set; }
        public Gender Gender { get; set; }
        public Student Student { get; set; }
        public Provider Provider { get; set; }
    }
}
