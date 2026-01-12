using TechMeter.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth.Users;

namespace TechMeter.Infrastructure.EntitiesConfigurations
{
    public class StudentConfiguration : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.HasKey(x => x.Id);


            builder.Property(b => b.BirthDate)
                .IsRequired();


            builder.Property(b => b.EducationLevel)
                .HasMaxLength(20)
                .IsRequired();


            builder.HasOne(s => s.User)
                 .WithOne(u => u.Student)
                 .HasForeignKey<Student>(b => b.Id)
                 .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Cart)
              .WithOne(b => b.Student)
              .HasForeignKey<Cart>(b => b.StudentId);

        }
    }
}
