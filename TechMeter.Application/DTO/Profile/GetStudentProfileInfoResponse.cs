using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Profile
{
    public class GetStudentProfileInfoResponse
    {
        public string Id { get; set; }
        public string StudentName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public string EducationLevel { get; set; }
        public DateTime? BirthDay { get; set; }
        public string profileImage { get; set; }
    }
}
