using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Models.Auth
{
    public class UserMessages
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string SenderId { get; set; }
        public string ReciptId { get; set; }
        public DateTime SentAt {  get; set; }
        public bool isRead { get; set; } = false;
        public bool isDeleted { get; set; } = false;
    }
}
