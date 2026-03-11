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
    public class UserCoursesConfiguration : IEntityTypeConfiguration<CourseStudent>
    {
        public void Configure(EntityTypeBuilder<CourseStudent> builder)
        {
            builder.HasKey(b => new { b.StudentId, b.CourseId });

            builder.HasOne(b => b.Student)
                .WithMany(b => b.CourseStudent)
                .HasForeignKey(b => b.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Course)
                .WithMany(b => b.CourseStudent)
                .HasForeignKey(b => b.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
