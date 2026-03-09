using TechMeter.Domain.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Infrastructure.EntitiesConfigurations;
using TechMeter.Domain.Models.Auth.UserTokens;

namespace TechMeter.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, string>, IDataProtectionKeyContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
        public DbSet<Student> Student { get; set; }
        public DbSet<Provider> Provider { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Course> Course { get; set; }
        public DbSet<Sections> Section { get; set; }
        public DbSet<Cart> Cart { get; set; }
        public DbSet<CartItem> CartItem { get; set; }
        public DbSet<Lessons> Lessons { get; set; }
        public DbSet<Wishlist> Wishlist { get; set; }
        public DbSet<WishlistItem> WishlistItem { get; set; }
        public DbSet<Order>Order { get; set; }
        //public DbSet<UserCourses> UserCourses { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }  
        public DbSet<UserRefreshToken> UserRefreshTokens { get; set; }
        public DbSet<UserCourseRating>UserCourseRating {  get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder
                .Properties<Enum>()
                .HaveConversion<string>();
        }
    }
}
