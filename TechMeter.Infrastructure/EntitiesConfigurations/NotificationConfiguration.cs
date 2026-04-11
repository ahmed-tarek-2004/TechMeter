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
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.Id);
            builder.Property(n => n.ReceiptId).IsRequired();
            builder.Property(n => n.Title).IsRequired().HasMaxLength(100);
            builder.Property(n => n.Message).IsRequired().HasMaxLength(500);
            builder.Property(n => n.IsRead).IsRequired();
            builder.Property(n => n.notificationType).IsRequired();
        }
    }
}
