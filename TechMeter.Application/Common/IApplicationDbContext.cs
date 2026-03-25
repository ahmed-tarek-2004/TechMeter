using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Models.Auth.UserTokens;

namespace TechMeter.Application.Common
{
    public interface IApplicationDbContext
    {
        //public DbSet<DataProtectionKey> DataProtectionKeys { get; }
        public DbSet<Student> Student { get; }
        public DbSet<Provider> Provider { get; }
        public DbSet<Category> Category { get; }
        public DbSet<Course> Course { get; }
        public DbSet<Sections> Section { get; }
        public DbSet<Cart> Cart { get; }
        public DbSet<CartItem> CartItem { get; }
        public DbSet<Lessons> Lessons { get; }
        public DbSet<Wishlist> Wishlist { get; }
        public DbSet<WishlistItem> WishlistItem { get; }
        public DbSet<Order> Order { get; }
        public DbSet<OrderItem> OrderItem { get; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; }
        public DbSet<UserRefreshToken> UserRefreshTokens { get; }
        public DbSet<UserCourseRating> UserCourseRating { get; }
        public DbSet<CourseStudent> CourseStudent { get; }
        public DbSet<StudentLessonWatched> StudentLessonWatched { get; }
        public DatabaseFacade Database { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
