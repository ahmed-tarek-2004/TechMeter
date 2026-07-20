using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Stripe;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;
using TechMeter.Application.Interfaces;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.UserConnection
{
    public class UserConnectionService(ApplicationDbContext context) : IUserConnectionService
    {

        public async Task<bool> JoinConversation(string conversationId, string userId)
        {
            //var userExists = await context.Groups.Where(b => b.Id == conversationId)
            //    .ToListAsync();
            //if (userExists == null)
            //{
            //    return false;
            //}


            return true;
        }

        public async Task<bool> IsOnline(string userId)
        {
            return await context.UserConnections.AnyAsync(b => b.userId == userId);
        }

        public async Task<bool> StoreUserConnections(string userId, string connectionId, string userName)
        {
            var userExists = await context.Users.AnyAsync(b => b.Id == userId);
            if (!userExists)
            {
                return false;
            }
            try
            {
                var connection = new Domain.Models.Auth.UserConnections
                {
                    Id = connectionId,
                    userId = userId,
                    UserName = userName,
                };
                await context.UserConnections.AddAsync(connection);
                await context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public async Task<bool> RemoveUserConnections(string connectionId)
        {
            var userExists = await context.UserConnections
                //.Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == connectionId);
            if (userExists == null)
            {
                return false;
            }
            try
            {

                context.UserConnections.Remove(userExists);
                await context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public Task<bool> RemoveUserFromGroup(string userId, string groupId)
        {
            throw new NotImplementedException();
        }

        public async Task<SenderInfoResponse> GetSenderInfo(string senderId)
        {
            
            var user = await context.Users
                .Where(u => u.Id == senderId)
                .Select(u => new SenderInfoResponse
                {
                    SenderId = u.Id,
                    SenderName = u.UserName,
                    SenderEmail = u.Email,
                    RecipientImageUrl = u.ProfileUrl,
                })
                .FirstOrDefaultAsync();
            return user!;
        }
        public async Task<MessageResponse> StoreMessages(string sendeerId, string recipientId, string message)
        {
            var SenderExists = await context.Users.AnyAsync(b => b.Id == sendeerId);
            var RecipientExists = await context.Users.AnyAsync(b => b.Id == recipientId);
            if (!SenderExists || !RecipientExists)
            {
                return null;
            }
            try
            {
                var messageEntity = new Domain.Models.Auth.UserMessages
                {
                    Content = message,
                    SenderId = sendeerId,
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
    }
}
