using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;

namespace TechMeter.Application.DTO.Course
{
    public class AddCourseResponse
    {
        public string Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string CourseProfileImageUrl { get; set; }
        public string CategoryId { get; set; }
<<<<<<< HEAD
=======
        public string CategoryName { get; set; }
>>>>>>> feature/transaction/AddtransactionModule
        public string Currency { get; set; }
        public decimal Price { get; set; }
    }
}
