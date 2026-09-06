using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;

namespace TechMeter.Application.Interfaces.Services.UserConnections
{
    public interface IUserConnectionService
    {
        Task<bool> StoreUserConnections(string userId, string connectionId,string userName);
        Task<bool>IsOnline(string userId);
        Task<bool> JoinConversation(string coversationId,string userId);
        Task<bool> RemoveUserConnections(string connectionId);
        Task<SenderInfoResponse> GetSenderInfo(string sendeerId);
        //Task<bool> RemoveUserFromGroup(string userId, string groupId);
    }
}
