using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Domain.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string UserId { get; set; } = "";
        public string? UserName { get; set; }
        public UserAction Action { get; set; }
        public string TableName { get; set; } = "";
        public string? RecordId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
