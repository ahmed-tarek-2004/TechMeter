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
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationSenderService _notificationSenderService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly ResponseHandler _responseHandler;
        public NotificationService(INotificationSenderService notificationSenderService
            , ILogger<NotificationService> logger, ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _notificationSenderService = notificationSenderService;
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
        }

        public async Task EnrollmantNotification(string userId, string Titile, string Message, DateTime dateTime)
        {
            await _notificationSenderService.EnrollmantNotification(userId, Titile, Message, dateTime);
        }

        public async Task FinishCourseNotification(string userId, string Titile, string Message, DateTime dateTime)
        {
            await _notificationSenderService.FinishCourseNotification(userId, Titile, Message, dateTime);
        }

        public async Task<Response<List<NotificationResponseDto>>> GetUserNotification(string userId)
        {
            var notifications = await _context.Notification.AsNoTracking().Where(n => n.ReceiptId == userId && !n.IsRead).Select(n => new NotificationResponseDto
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
    }
}
