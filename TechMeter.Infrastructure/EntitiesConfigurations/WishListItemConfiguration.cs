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
    public class WishListItemConfiguration : IEntityTypeConfiguration<WishlistItem>
    {
        public void Configure(EntityTypeBuilder<WishlistItem> builder)
        {
            builder.HasKey(b => b.Id);


            builder.HasOne(b => b.Wishlist)
                .WithMany(b => b.WishlistItems)
                .HasForeignKey(b => b.WishlistId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasOne(wi => wi.Course)
                      .WithMany(wi => wi.WishlistItems)
                      .HasForeignKey(wi => wi.courseId)
                      .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
