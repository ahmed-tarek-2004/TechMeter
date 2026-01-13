using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Auth.Register
{
    public class StudentRegisterResponseDto
    {
        public string Id { get; set; }
        public string UserName {  get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
        public string Country { get; set; }
        public string? ProfileUrl { get; set; }
        public Gender Gender { get; set; }
        public string EmailAddress { get; set; }
        public string EducationLeveL {  get; set; }
        public int? Age { get; set; }
        public bool isEmailConfirmed { get; set; }
        public string accessToken { get; set; }
        public string refreshToken { get; set; }
        
    }
}
