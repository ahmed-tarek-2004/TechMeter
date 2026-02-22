using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Domain.Models
{
    public class WishlistItem
    {
        public string Id { get; set; }
        public string WishlistId { get; set; }
        public string courseId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public Wishlist Wishlist { get; set; }
        public Course Course { get; set; }
    }
}
