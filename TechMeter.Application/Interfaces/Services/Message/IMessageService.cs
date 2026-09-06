using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Messeage;

namespace TechMeter.Application.Interfaces.Services.Message
{
    public interface IMessageService
    {
        Task<MessageResponse> StoreMessages(string sendeerId, string recipientId, string message);
        Task<bool> ReadMessage(int messageId, string userId);
    }
}
