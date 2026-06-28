using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.LessonComment
{
    public class LessonCommentLikesResponse
    {
        public string CommentId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string? UserImage { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
