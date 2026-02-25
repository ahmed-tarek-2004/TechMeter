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
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.HasKey(x => x.Id);


            builder.HasOne(oi => oi.Order)
                .WithOne(o => o.Item)
                .HasForeignKey<Order>(o => o.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(oi => oi.Course)
                .WithMany(s => s.OrderItems)
                .HasForeignKey(oi => oi.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
