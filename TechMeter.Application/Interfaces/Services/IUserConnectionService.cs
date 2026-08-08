using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;

namespace TechMeter.Application.Interfaces.Services
{
    public interface IUserConnectionService
    {
        Task<bool> StoreUserConnections(string userId, string connectionId,string userName);
        Task<bool>IsOnline(string userId);
        Task<bool> JoinConversation(string coversationId,string userId);
        Task<SenderInfoResponse> GetSenderInfo(string sendeerId);
        Task<bool> RemoveUserConnections(string connectionId);
        Task<MessageResponse> StoreMessages(string sendeerId , string recipientId , string message);
        Task<bool> ReadMessage(int messageId,string userId);
        //Task<bool> RemoveUserFromGroup(string userId, string groupId);
    }
}
