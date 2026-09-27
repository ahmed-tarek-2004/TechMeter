using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class Wishlist
    {
        public string Id { get; set; }
        public string StudentId { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Student Student { get; set; }
        public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    }
}
