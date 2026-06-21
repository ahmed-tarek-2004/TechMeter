using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Domain.Models
{
    public class LessonComment
    {
        public string Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsEdited { get; set; } = false;
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string? UserImage { get; set; }
        public string LessonId { get; set; }
        public Lessons Lesson { get; set; }
        public User User { get; set; }
        public ICollection<LessonCommentLike> LessonCommentLikes { get; set; } = new List<LessonCommentLike>();
    }
}
