using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models
{
    public class FcmUserTokens
    {
        public int Id { get; set; }
        public string token { get; set; }
        public string userId { get; set; }
        public DateTime CreatedAt {  get; set; } = DateTime.UtcNow;
        public User User {  get; set; }
    }
}
