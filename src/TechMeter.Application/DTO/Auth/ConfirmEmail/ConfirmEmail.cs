using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Auth.ConfirmEmail
{
    public sealed record ConfirmEmail(string userId, string token);
}
