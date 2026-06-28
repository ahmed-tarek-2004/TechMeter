using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models.Auth;

namespace TechMeter.Infrastructure.EntitiesConfigurations
{
    public class UserConnectionsConfiguration : IEntityTypeConfiguration<UserConnections>
    {
        public void Configure(EntityTypeBuilder<UserConnections> builder)
        {
            builder.HasKey(b => b.Id);

            builder.HasOne(b => b.User)
                .WithMany(b => b.UserConnections)
                .HasForeignKey(b => b.userId);
        }
    }
}
