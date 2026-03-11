using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;

namespace TechMeter.Infrastructure.EntitiesConfigurations
{
    public class StudetLEssonWatchedConfiguration : IEntityTypeConfiguration<StudentLessonWatched>
    {
        public void Configure(EntityTypeBuilder<StudentLessonWatched> builder)
        {
            builder.HasKey(b => new { b.StudentId, b.LessonId });

            builder.HasOne(b => b.Student)
                .WithMany(b => b.StudentLessonsWatched)
                .HasForeignKey(b => b.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Lessons)
                .WithMany(b => b.StudentLessonsWatched)
                .HasForeignKey(b => b.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
