using Domain;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TechMeter.Domain.Identity;

namespace TechMeter.Infrastructure.ApplicationContext
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, Guid>, IDataProtectionKeyContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
        public DbSet<Order> orders { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}
