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
    public class FcmUserTokensConfiguration : IEntityTypeConfiguration<FcmUserTokens>
    {
        public void Configure(EntityTypeBuilder<FcmUserTokens> builder)
        {
            builder.HasKey(x => x.Id);
            builder.HasOne(b => b.User)
                .WithMany(b => b.FcmUserTokens)
                .HasForeignKey(b => b.userId);
        }
    }
}
