using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.WhishList
{
    public class WishListItemResponse
    {
        public string Id { get; set; }
        public string CourseId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
