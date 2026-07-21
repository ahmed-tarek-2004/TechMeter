using FirebaseAdmin.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Fcm;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Infrastructure.Services.Fcm
{
    public class FcmService(ResponseHandler responseHandler) : IFcmService
    {

        public async Task<Response<string>> SendToTokenAsync(string token, string title, string body)
        {
            var message = new Message()
            {
                Token = token,

                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = title,
                    Body = body
                },


            };
            var response = await FirebaseMessaging
                .DefaultInstance
                .SendAsync(message);
            return responseHandler.Success(response, "Notification sent successfully");
        }

        public async Task<Response<string>> SendToTopicAsync(string topic, string title, string body)
        {
            var message = new Message()
            {
                Topic = topic,

                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = title,
                    Body = body
                },

            };

            var response = await FirebaseMessaging
                 .DefaultInstance
                 .SendAsync(message);
            return responseHandler.Success(response, "Notification sent successfully");
        }

        public async Task<Response<string>> SendConditionAsync(string condition, string title, string body)
        {
            var message = new Message()
            {
                Condition = condition,

                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = title,
                    Body = body
                }
            };

            var response = await FirebaseMessaging
                .DefaultInstance
                .SendAsync(message);
            return responseHandler.Success(response, "Notification sent successfully");
        }

        public async Task SubscribeToTopicAsync(
            List<string> tokens,
            string topic)
        {
            await FirebaseMessaging
                .DefaultInstance
                .SubscribeToTopicAsync(tokens, topic);
        }
    }
}
