using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Application.Interfaces.Services.Message;
using TechMeter.Infrastructure.Persistence.AppDbContext;

namespace TechMeter.Infrastructure.Services.Message
{
    public class MessageService(ApplicationDbContext context) : IMessageService
    {
        public async Task<MessageResponse> StoreMessages(string senderId, string recipientId, string message)
        {
            var SenderExists = await context.Users.AnyAsync(b => b.Id == senderId);
            var RecipientExists = await context.Users.AnyAsync(b => b.Id == recipientId);
            if (!SenderExists || !RecipientExists)
            {
                return null!;
            }
            try
            {
                var messageEntity = new Domain.Models.Auth.UserMessages
                {
                    Content = message,
                    SenderId = senderId,
                    ReciptId = recipientId,
                    SentAt = DateTime.UtcNow,
                    isRead = false,
                    isDeleted = false,
                };
                await context.UserMessages.AddAsync(messageEntity);
                await context.SaveChangesAsync();

                return new MessageResponse
                {
                    Message = message,
                    MessageId = messageEntity.Id,
                    SentAt = messageEntity.SentAt,
                    isRead = messageEntity.isRead
                };
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<bool> ReadMessage(int messageId, string userId)
        {
            var message = await context.UserMessages.FirstOrDefaultAsync(m => m.Id == messageId && m.ReciptId == userId);
            if (message == null)
            {
                return false;
            }
            message.isRead = true;
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMessage(int messageId, string userId)
        {
            var affectedRows = await context.UserMessages
                .Where(m => m.Id == messageId && m.SenderId == userId)
                .ExecuteUpdateAsync(b =>
                    b.SetProperty(m => m.isDeleted, true));

            return affectedRows > 0;
        }
    }
}
