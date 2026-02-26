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
    public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.HasKey(b => b.Id);

            builder.HasOne(b => b.Provider)
                .WithMany(b => b.Transactions)
                .HasForeignKey(b => b.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Order)
                .WithMany(b => b.Transactions)
                .HasForeignKey(b => b.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Student)
                .WithMany(b => b.Transactions)
                .HasForeignKey(b => b.StudentId)
                .OnDelete(DeleteBehavior.Restrict); 
        }
    }
}
