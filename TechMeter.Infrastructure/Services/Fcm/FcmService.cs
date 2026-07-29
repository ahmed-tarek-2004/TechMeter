using FirebaseAdmin.Messaging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.Fcm;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Fcm
{
    public class FcmService(ApplicationDbContext context , ILogger <FcmService>logger) : IFcmService
    {

        //public async Task<Response<string>> SendToTokenAsync(string token, string title, string body)
        //{
        //    var message = new Message()
        //    {
        //        Token = token,

        //        Notification = new FirebaseAdmin.Messaging.Notification()
        //        {
        //            Title = title,
        //            Body = body
        //        },


        //    };
        //    var response = await FirebaseMessaging
        //        .DefaultInstance
        //        .SendAsync(message);
        //    return responseHandler.Success(response, "Notification sent successfully");
        //}

        //public async Task<Response<string>> SendToTopicAsync(string topic, string title, string body)
        //{
        //    var message = new Message()
        //    {
        //        Topic = topic,

        //        Notification = new FirebaseAdmin.Messaging.Notification()
        //        {
        //            Title = title,
        //            Body = body
        //        },

        //    };

        //    var response = await FirebaseMessaging
        //         .DefaultInstance
        //         .SendAsync(message);
        //    return responseHandler.Success(response, "Notification sent successfully");
        //}

        //public async Task<Response<string>> SendConditionAsync(string condition, string title, string body)
        //{
        //    var message = new Message()
        //    {
        //        Condition = condition,

        //        Notification = new FirebaseAdmin.Messaging.Notification()
        //        {
        //            Title = title,
        //            Body = body
        //        }
        //    };

        //    var response = await FirebaseMessaging
        //        .DefaultInstance
        //        .SendAsync(message);
        //    return responseHandler.Success(response, "Notification sent successfully");
        //}

        //public async Task SubscribeToTopicAsync(
        //    List<string> tokens,
        //    string topic)
        //{
        //    await FirebaseMessaging
        //        .DefaultInstance
        //        .SubscribeToTopicAsync(tokens, topic);
        //}

        public async Task SendToTokensAsync(string userId, string Title, string body)
        {
            var tokens = await context.FcmUserTokens.Where(b => b.userId == userId).Select(b => b.token).ToListAsync();
            var messages = new MulticastMessage
            {
                Tokens = tokens,
                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = Title,
                    Body = body,
                },
            };
            //logger.LogInformation("start senting fcm");
            await FirebaseMessaging.DefaultInstance
                .SendEachForMulticastAsync(messages);
            //logger.LogInformation("Fcm Service for user {id} is sent", userId);
        }
    }
}
