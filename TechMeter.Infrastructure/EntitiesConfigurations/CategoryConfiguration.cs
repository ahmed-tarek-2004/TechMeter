using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;

namespace TechMeter.Infrastructure.EntitiesConfigurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(b => b.Name)
                .HasMaxLength(75)
                .IsRequired();


            builder.Property(b => b.Name)
                .HasMaxLength(75)
                .IsRequired();

            builder.HasMany(b => b.Courses)
                .WithOne(c => c.Category)
                .HasForeignKey(b => b.CategoryId)
                .IsRequired();
        }
    }
}
