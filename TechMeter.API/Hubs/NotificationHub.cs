using Microsoft.AspNetCore.SignalR;

namespace TechMeter.API.Hubs
{
    public class NotificationHub:Hub
    {
        //[HubMethodName("SendNotification")]
        public Task sendNotification()
        {
            return Clients.All.SendAsync("ReceiveMessage", "Welcome To TechMeter", DateTime.Now);
        }
    }
}
