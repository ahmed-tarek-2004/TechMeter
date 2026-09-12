using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.Services.Message;

//using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Application.Interfaces.Services.UserConnections;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Hubs
{
    public class MessgaeHub(IUserConnectionService userConnectionService, IMessageService messageService,
        INotificationService notificationService) : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier
                ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? Context.User?.FindFirst("sub")?.Value
                ?? "";
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                ?? Context.User?.Identity?.Name
                ?? "";
            if (!string.IsNullOrEmpty(userId))
            {
                await userConnectionService.StoreUserConnections(userId, Context.ConnectionId, userName);
            }
            await base.OnConnectedAsync();
        }

        [HubMethodName("sendmessage")]
        public async Task SendMessage(string msg, string userId)
        {
            var senderId = Context.UserIdentifier?? throw new HubException("User not authenticated");
           
            var senderInfo = await userConnectionService.GetSenderInfo(senderId);
            var messageStored = await messageService.StoreMessages(senderInfo.SenderId, userId, msg);
            if (messageStored == null)
            {
                return;
            }
            await Clients.Users(userId, senderId).SendAsync("ReceiveMessage", new
            {
                Id = messageStored.MessageId,
                Content = messageStored.Message,
                SentAt = messageStored.SentAt,
                isRead = false,
                Sender = senderInfo
            });

            await notificationService.SendUserNotifications(userId, "New Message", msg, NotificationType.Message);
        }
        [HubMethodName("isonline")]
        public async Task IsOnline(string recieverId)
        {
            var isOnline = await userConnectionService.IsOnline(recieverId);
            await Clients.Caller.SendAsync("CheckReceiverAvailability", isOnline);
        }
        [HubMethodName("markasread")]
        public async Task MarkAsRead(string messageId, string senderId)
        {
            var userId = Context.UserIdentifier?? throw new HubException("User not authenticated");
            var isRead = await messageService.ReadMessage(int.TryParse(messageId, out int messageIdValue) ? messageIdValue : 0, userId);
            await Clients.User(senderId).SendAsync("IsRead", isRead);
        }

        //public async Task OpenChat(string userId)
        //{
        //    var currentUserId = Context.UserIdentifier!;

        //    await _userActivityService.SetActiveChat(currentUserId,userId);
        //}

        //public async Task CloseChat()
        //{
        //    var currentUserId = Context.UserIdentifier!;

        //    await _userActivityService.ClearActiveChat(currentUserId);
        //}


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await userConnectionService.RemoveUserConnections(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
