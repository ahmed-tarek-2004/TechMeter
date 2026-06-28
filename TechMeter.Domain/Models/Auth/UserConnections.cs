using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models.Auth
{
    public class UserConnections
    {
        public string Id {  get; set; }
        public string userId { get; set; }
        public string UserName { get; set; }
        public User User { get; set; }

    }
}
