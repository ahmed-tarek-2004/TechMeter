using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Infrastructure.Adapters.EmailSender;

namespace TechMeter.Infrastructure.BackgroundJob.Jobs
{
    public class SendEmailJob
    {
        private readonly IEmailService _emailService;

        public SendEmailJob(IEmailService emailService)
        {
            _emailService = emailService;
        }

        public async Task SendOtpEmail(string UserName, string Email, string otp)
        {
            await _emailService.SendOtpEmailAsync(UserName,Email, otp);
        }
    }
}
