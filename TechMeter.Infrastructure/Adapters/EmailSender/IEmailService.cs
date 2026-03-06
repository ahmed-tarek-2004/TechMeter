using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Infrastructure.Adapters.EmailSender
{
    public interface IEmailService
    {
        public Task SendOtpEmailAsync(User user, string otp);
        public Task InvoiceEmailAsync(User user, PaymentTransaction transaction,List<GetCourseResponse>courseResponses);
    }
}
