using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.WhishList
{
    public class GetWishListResponse
    {
        public string Id { get; set; }
        public string StudentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<WishListItemResponse> Items { get; set; } = new List<WishListItemResponse>();
    }
}
