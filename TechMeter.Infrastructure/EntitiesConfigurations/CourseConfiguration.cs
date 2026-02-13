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
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(b => b.Title)
                .HasMaxLength(100)
                .IsRequired();


            builder.Property(b => b.Description)
                .HasMaxLength(500)
                .IsRequired();

            builder.HasOne(b => b.Provider)
                .WithMany(b => b.Courses)
                .HasForeignKey(b => b.ProviderId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Property(b => b.CourseProfileImageUrl)
                .IsRequired();

        }
    }
}
