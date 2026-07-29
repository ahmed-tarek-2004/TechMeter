using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Models.Auth.UserTokens;

namespace TechMeter.Application.Common
{
    public interface IApplicationDbContext
    {
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
        public DbSet<Order> Order { get; set; }
        //public DbSet<UserCourses> UserCourses { get; set; }
        public DbSet<OrderItem> OrderItem { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<UserRefreshToken> UserRefreshTokens { get; set; }
        public DbSet<UserCourseRating> UserCourseRating { get; set; }
        public DbSet<CourseStudent> CourseStudent { get; set; }
        public DbSet<StudentLessonWatched> StudentLessonWatched { get; set; }
        public DbSet<Notification> Notification { get; set; }
        public DbSet<LessonComment> lessonComments { get; set; }
        public DbSet<LessonCommentLike> LessonCommentLikes { get; set; }
        public DbSet<UserConnections> UserConnections { get; set; }
        public DbSet<UserMessages> UserMessages { get; set; }
        public DbSet<FcmUserTokens> FcmUserTokens { get; set; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
