using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Infrastructure.Adapters.EmailSender
{
    public interface IEmailService
    {
        public Task SendOtpEmailAsync(User user, string otp);
    }
}
