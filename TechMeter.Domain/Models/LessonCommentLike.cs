using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models
{
    public class LessonCommentLike
    {
        public string CommentId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string? UserImage { get; set; }
        public User User { get; set; }
        public LessonComment LessonComment { get; set; }
    }
}
