using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Messeage
{
    public class MessageHistoryResponse
    {
        public string Message { get; set; }
        public int MessageId { get; set; }
        public DateTime SentAt { get; set; }
        public string ReciverId { get; set; }
        public string SenderId { get; set; }
        public bool isRead { get; set; } = false;
    }
}
