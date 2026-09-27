using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.Rating
{
    public class DeleteAdminRatingRequest
    {
        public string StudentId {  get; set; }
        public string CourseId {  get; set; }
    }
}
