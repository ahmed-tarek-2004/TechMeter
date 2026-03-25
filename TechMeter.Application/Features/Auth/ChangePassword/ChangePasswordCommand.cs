using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Auth.ChangePassword
{
    public sealed class ChangePasswordCommand: IRequest<Response<string>>
    {
        public string UserId{ get; set;}
        public string CurrentPassword {  get; set;}
        public string NewPassword { get; set; } 
        public string ConfirmNewPassword { get; set; } 
     }
}
