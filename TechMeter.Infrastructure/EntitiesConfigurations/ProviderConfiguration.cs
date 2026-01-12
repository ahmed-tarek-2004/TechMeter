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
    public class ProviderConfiguration : IEntityTypeConfiguration<Provider>
    {
        public void Configure(EntityTypeBuilder<Provider> builder)
        {
            builder.HasKey(x => x.Id);


            builder.Property(b => b.BankAccount)
                .IsRequired();


            builder.Property(b => b.Brief)
                .HasMaxLength(500)
                .IsRequired();


            builder.HasMany(p => p.certificatesUrls)
                .WithOne(c => c.Provider)
                .HasForeignKey(p => p.ProviderId);


            builder.HasOne(s => s.User)
                 .WithOne(u=>u.Provider)
                 .HasForeignKey<Provider>(b => b.Id)
                 .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
