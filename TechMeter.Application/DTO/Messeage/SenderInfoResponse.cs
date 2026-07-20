using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Messeage
{
    public class SenderInfoResponse
    {
        //public string MessageId { get; set; }
        public string SenderId { get; set; }
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
        public string RecipientImageUrl { get; set; }
    }
}
