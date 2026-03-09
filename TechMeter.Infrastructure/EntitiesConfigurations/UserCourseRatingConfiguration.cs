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
    public class UserCourseRatingConfiguration : IEntityTypeConfiguration<UserCourseRating>
    {
        public void Configure(EntityTypeBuilder<UserCourseRating> builder)
        {
            builder.HasKey(b => new { b.CourseId, b.StudentId });

            builder.HasOne(cpr => cpr.Student)
                  .WithMany(c => c.UserCourseRating)
                  .HasForeignKey(cpr => cpr.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);


            builder.HasOne(cpr => cpr.Course)
                   .WithMany(p => p.UserCourseRating)
                   .HasForeignKey(cpr => cpr.CourseId)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
