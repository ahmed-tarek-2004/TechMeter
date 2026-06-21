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
    public class LessonCommentConfiguration : IEntityTypeConfiguration<LessonComment>
    {
        public void Configure(EntityTypeBuilder<LessonComment> builder)
        {
            builder.HasKey(b => b.Id);

            builder.HasOne(b => b.Lesson)
                .WithMany(b => b.lessonComments)
                .HasForeignKey(b => b.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.User)
                .WithMany(b => b.LessonComments)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
