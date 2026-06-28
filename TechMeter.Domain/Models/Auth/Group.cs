using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models.Auth
{
    public class Groups
    {
        public string Id {  get; set; }
        public string GroupName { get; set; }
        public List<User> User { get; set; }
    }
}
