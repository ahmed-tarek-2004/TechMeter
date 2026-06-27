using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.LessonComment
{
    public class LessonCommentRequest
    {
        [Required]
        public string Content { get; set; }
    }
}
