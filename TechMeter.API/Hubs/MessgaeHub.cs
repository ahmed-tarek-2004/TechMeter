using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TechMeter.Application.Interfaces;
//using TechMeter.Application.Interfaces.NotificationSender;
using TechMeter.Application.Interfaces.Services;
using TechMeter.Application.Interfaces.Services.Notification;
using TechMeter.Domain.Enums;

namespace TechMeter.API.Hubs
{
    public class MessgaeHub(IUserConnectionService userConnectionService, INotificationService notificationService) : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "";
            if (!string.IsNullOrEmpty(userId))
            {
                await userConnectionService.StoreUserConnections(userId, Context.ConnectionId, userName);
            }
            await base.OnConnectedAsync();
        }

        [HubMethodName("sendmessage")]
        public async Task SendMessage(string msg, string userId)
        {
            var senderId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(senderId))
            {
                return;
            }
            var senderInfo = await userConnectionService.GetSenderInfo(senderId);
            var messageStored = await userConnectionService.StoreMessages(senderInfo.SenderId, userId, msg);
            if (messageStored == null)
            {
                return;
            }
            await Clients.User(userId).SendAsync("ReceiveMessage", new
            {
                Id = messageStored.MessageId,
                Content = messageStored.Message,
                SentAt = messageStored.SentAt,
                Sender = senderInfo
            });
            await notificationService.SendUserNotifications(userId, "New Message", msg, NotificationType.Message);
        }
        [HubMethodName("isonline")]
        public async Task IsOnline(string recieverId)
        {
            var isOnline = await userConnectionService.IsOnline(recieverId);
            await Clients.User(recieverId).SendAsync("CheckReceiverAvailability", isOnline);
        }
        [HubMethodName("markasread")]
        public async Task MarkAsRead(string messageId, string senderId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId))
            {
                return;
            }
            var isRead = await userConnectionService.ReadMessage(int.TryParse(messageId, out int messageIdValue) ? messageIdValue : 0, userId);
            await Clients.User(senderId).SendAsync("IsRead", isRead);
        }


        //[HubMethodName("JoinConversation")]
        public void JoinConversation(string conversationId)
        {

        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await userConnectionService.RemoveUserConnections(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
