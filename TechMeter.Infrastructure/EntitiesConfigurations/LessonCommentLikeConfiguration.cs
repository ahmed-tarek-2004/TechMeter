using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;

namespace TechMeter.Infrastructure.EntitiesConfigurations
{
    public class LessonCommentLikeConfiguration : IEntityTypeConfiguration<LessonCommentLike>
    {
        public void Configure(EntityTypeBuilder<LessonCommentLike> builder)
        {
            builder.HasKey(b => new { b.UserId, b.CommentId });

            builder.HasOne(b => b.User)
                .WithMany(b => b.LessonCommentLikes)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(b => b.LessonComment)
                .WithMany(b => b.LessonCommentLikes)
                .HasForeignKey(b => b.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
