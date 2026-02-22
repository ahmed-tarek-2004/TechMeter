using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.WhishList
{
    public class AddToWishListRequest
    {
        [Required(ErrorMessage = "CourseId Is Required")]
        public string CourseId { get; set; }
    }
}
