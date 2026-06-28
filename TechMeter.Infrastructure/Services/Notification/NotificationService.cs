using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly ResponseHandler _responseHandler;
        public NotificationService(ILogger<NotificationService> logger, ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
        }

        public async Task<Response<List<NotificationResponseDto>>> GetUserNotifications(string userId)
        {
            var notifications = await _context.Notification
                .AsNoTracking()
                .Where(n => n.ReceiptId == userId)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    ReceiptId = n.ReceiptId
                }).ToListAsync();

            return _responseHandler.Success(notifications, "user notification returned successfully");
        }
        public async Task<Response<List<NotificationResponseDto>>> GetUnReadUserNotifications(string userId)
        {
            var notifications = await _context.Notification
                .AsNoTracking()
                .Where(n => n.ReceiptId == userId && n.IsRead == false)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    ReceiptId = n.ReceiptId
                }).ToListAsync();

            return _responseHandler.Success(notifications, "user notification returned successfully");
        }
        public async Task<Response<bool>> ReadNotification(string userId, string notificationId)
        {
            var rows = await _context.Notification
                .Where(n => n.ReceiptId == userId && n.Id == notificationId && !n.IsRead)
                .ExecuteUpdateAsync(b => b.SetProperty(b => b.IsRead, true));
            if (rows == 0)
            {
                return _responseHandler.Success(false, "notification not found or already read");
            }
            return _responseHandler.Success(true, "notification marked as read successfully");

        }
        public async Task<Response<string>> StoreUserNotifications(string userId, string Title, string message, NotificationType type)
        {
            var userExists = await _context.Users.AnyAsync(b => b.Id == userId);
            if (!userExists)
            {
                return _responseHandler.NotFound<string>("user is not found ");
            }
            try
            {
                var notification = new Domain.Models.Notification
                {
                    IsRead = false,
                    Message = message,
                    notificationType = type,
                    ReceiptId = userId,
                    Title = Title,
                };
                await _context.Notification.AddAsync(notification);
                await _context.SaveChangesAsync();
                return _responseHandler.Success(string.Empty, "notification stored successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred.");
                return _responseHandler.InternalServerError<string>("internal server error");
            }
        }
    }
}
