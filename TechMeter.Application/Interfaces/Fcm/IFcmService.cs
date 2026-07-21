using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Interfaces.Fcm
{
    public interface IFcmService
    {
        Task SendToTokensAsync(string userId, string Title, string body);
        //Task<Response<string>> SendToTokenAsync(string token,string title,string body);

        //Task<Response<string>> SendToTopicAsync(string topic,string title,string body);

        //Task<Response<string>> SendConditionAsync(string condition,string title,string body);

        //Task SubscribeToTopicAsync(List<string> tokens,string topic);
    }
}
