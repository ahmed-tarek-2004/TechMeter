using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Models
{
    public class Sections
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string CourseId {  get; set; }
        public Course Course { get; set; }
        public List<Lessons> Lessons { get; set; }
    }
}
