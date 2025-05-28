using Microsoft.AspNetCore.SignalR;

namespace EduLive.Hubs
{
    public class LiveSessionHub:Hub
    {
       
        public async Task NotifySessionStarted(string sessionId)
        {
            await Clients.All.SendAsync("SessionStarted", sessionId);
        }
        
        public async Task NotifySessionEnded(string sessionId)
        {
            await Clients.All.SendAsync("SessionEnded", sessionId);
        }
        //Allow students to join a specific session group
        public async Task JoinSessionGroup(string sessionCode)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).SendAsync("UserJoined", Context.ConnectionId);
        }
        //Allow students to leave a specific session group
        public async Task LeaveSessionGroup(string sessionCode)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).SendAsync("UserLeft", Context.ConnectionId);
        }
        // User joins session
        public async Task JoinMeeting(string sessionCode)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).SendAsync("UserJoined", Context.ConnectionId);
        }
        // User leaves session
        public async Task LeaveMeeting(string sessionCode)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionCode);
            await Clients.Group(sessionCode).SendAsync("UserLeft", Context.ConnectionId);
        }
        
    }
}
