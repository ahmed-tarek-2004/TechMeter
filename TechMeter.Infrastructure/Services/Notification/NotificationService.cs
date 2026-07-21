using FirebaseAdmin.Messaging;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Notification;
using TechMeter.Application.Interfaces.Fcm;
using TechMeter.Application.Interfaces.Jobs;
using TechMeter.Application.Interfaces.Notification;
using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;
using TechMeter.Infrastructure.Services.Fcm;

namespace TechMeter.Infrastructure.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly ResponseHandler _responseHandler;
        private readonly INotificationSenderService _notificationSenderService;
        private readonly IBackgroundJobService _backgroundJobService;
        private readonly IFcmService _fcmService;


        public NotificationService(ILogger<NotificationService> logger, ApplicationDbContext context,IFcmService fcmService,
            ResponseHandler responseHandler,INotificationSenderService notificationSenderService,IBackgroundJobService backgroundJobService)
        {
            _logger = logger;
            _context = context;
            _responseHandler = responseHandler;
            _notificationSenderService = notificationSenderService;
            _backgroundJobService = backgroundJobService;
            _fcmService = fcmService;
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
        public async Task<Response<string>> SendUserNotifications(string userId, string Title, string message, NotificationType type)
        {

            try
            {
                var storeNotification = await StoreUserNotidication(userId, Title, message, type);
                if (!storeNotification)
                {
                    return _responseHandler.NotFound<string>("user is not found");
                }
                var isOnline = await _context.UserConnections.AnyAsync(b => b.userId == userId);
                if (isOnline)
                {
                    await _notificationSenderService.SendNotificationAsync(userId, Title, message, DateTime.UtcNow);
                    //_logger.LogInformation("First send fcm ");
                    ////await _fcmService.SendToTokensAsync(userId, Title, message);
                    //_backgroundJobService.Enqueue<IFcmService>(b => b.SendToTokensAsync(userId, Title, message));
                }
                else
                {
                    _backgroundJobService.Enqueue<IFcmService>(b => b.SendToTokensAsync(userId, Title, message));
                }
                return _responseHandler.Success(string.Empty, "Notification Sent Successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred.");
                return _responseHandler.InternalServerError<string>("internal server error");
            }
        }
        public async Task<Response<bool>> StoreUserTokensAsync(string userId, string token)
        {
            var user = await _context.Users.AnyAsync(b => b.Id == userId);
            if (!user)
            {
                return _responseHandler.NotFound<bool>("User is not found");
            }

            var userFcmTokenExists = await _context.FcmUserTokens.AnyAsync(b => b.token == token && b.userId == userId);
            if (!userFcmTokenExists)
            {
                var FcmUserToken = new FcmUserTokens
                {
                    token = token,
                    userId = userId
                };
                await _context.FcmUserTokens.AddAsync(FcmUserToken);
                await _context.SaveChangesAsync();
                return _responseHandler.Success(true, "Token Stored Successfully");
            }
            return _responseHandler.Success(true, "Token is Already Stored");
        }
        private async Task<bool> StoreUserNotidication(string userId, string Title, string message, NotificationType type)
        {
            var userExists = await _context.Users.AnyAsync(b => b.Id == userId);
            if (!userExists)
            {
                return false;
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
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred.");
                throw new Exception();
            }
        }
    }
}
