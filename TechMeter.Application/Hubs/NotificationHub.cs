using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;


namespace TechMeter.Application.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            //await Clients.All.SendAsync("", "A new user has connected to the notification hub.");
            await base.OnConnectedAsync();
        }
        [HubMethodName("sendmessage")]
        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
           // await Clients.All.SendAsync("", "A user has disconnected from the notification hub.");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
