using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Models
{
    public class Lessons
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string SectionId {  get; set; }
        public Sections section { get; set; }
    }
}
