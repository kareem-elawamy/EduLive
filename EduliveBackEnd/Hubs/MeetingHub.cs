using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace EduLive.Hubs
{
    public class MeetingHub : Hub
    {
        private static readonly ConcurrentDictionary<string, (string UserName, string State)> _userStates = new();
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _roomConnections = new();
        private static readonly ConcurrentDictionary<string, string> _pendingOffers = new();
        private List<string> userIn=new List<string>();
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"New connection: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _userStates.TryRemove(Context.ConnectionId, out _);
            _pendingOffers.TryRemove(Context.ConnectionId, out _);

            foreach (var kvp in _roomConnections)
            {
                string roomId = kvp.Key;
                var connections = kvp.Value;

                if (connections.TryRemove(Context.ConnectionId, out _))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
                    await Clients.Group(roomId).SendAsync("UserLeftCall", Context.ConnectionId);

                    if (connections.IsEmpty)
                    {
                        _roomConnections.TryRemove(roomId, out _);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        // الانضمام للمحادثة النصية
        public async Task JoinRoom(string roomName, string userName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

            await Clients.Group(roomName).SendAsync("UserJoined", userName);
        }
        // مغادرة المحادثة النصية
        public async Task LeaveRoom(string roomName, string userName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserLeft", userName);
        }
        // إرسال رسالة نصية
        public async Task SendMessage(string roomId, string userName, string message)
        {
            await Clients.Group(roomId).SendAsync("ReceiveMessage", userName, message);
        }

        // الانضمام للمكالمة
        public async Task JoinCall(string roomId, string userName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            var room = _roomConnections.GetOrAdd(roomId, _ => new ConcurrentDictionary<string, byte>());
            room.TryAdd(Context.ConnectionId, 0);

            _userStates[Context.ConnectionId] = (userName, "joined");

            await Clients.OthersInGroup(roomId).SendAsync("UserJoinedCall", Context.ConnectionId, userName);
            var usersInCall = room.Keys
                .Where(id => _userStates.ContainsKey(id))
                .Select(id => new { ConnectionId = id, _userStates[id].UserName })
                .ToList();

            Console.WriteLine($"Users in room {roomId}: {string.Join(", ", usersInCall.Select(u => u.UserName))}");


            await Clients.Group(roomId).SendAsync("UsersInCall", usersInCall);


        }

        // مغادرة المكالمة
        public async Task LeaveCall(string roomId, string userName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

            if (_roomConnections.TryGetValue(roomId, out var connections))
            {
                connections.TryRemove(Context.ConnectionId, out _);

                if (connections.IsEmpty)
                {
                    _roomConnections.TryRemove(roomId, out _);
                }
            }

            _userStates.TryRemove(Context.ConnectionId, out _);
            _pendingOffers.TryRemove(Context.ConnectionId, out _);

            await Clients.Group(roomId).SendAsync("UserLeftCall", Context.ConnectionId, userName);
        }

        // إرسال Offer
        public async Task SendOffer(string roomId, string targetUserId, object offer)
        {
            if (_userStates.TryGetValue(targetUserId, out var state) && state.State == "joined")
            {
                // Store the pending offer
                _pendingOffers[targetUserId] = Context.ConnectionId;

                await Clients.Client(targetUserId).SendAsync("ReceiveOffer", Context.ConnectionId, offer);
                if (_userStates.TryGetValue(Context.ConnectionId, out var current))
                    _userStates[Context.ConnectionId] = (current.UserName, "offering");
            }
        }

        // إرسال Answer
        public async Task SendAnswer(string roomId, string targetUserId, object answer)
        {
            if (_userStates.TryGetValue(targetUserId, out var state) &&
                state.State == "offering" &&
                _pendingOffers.TryGetValue(Context.ConnectionId, out var pendingOfferFrom) &&
                pendingOfferFrom == targetUserId)
            {
                await Clients.Client(targetUserId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
                if (_userStates.TryGetValue(Context.ConnectionId, out var current))
                    _userStates[Context.ConnectionId] = (current.UserName, "answering");

                // Clear the pending offer
                _pendingOffers.TryRemove(Context.ConnectionId, out _);
            }
        }

        // إرسال Ice Candidate
        public async Task SendIceCandidate(string roomId, string targetUserId, object candidate)
        {
            if (_userStates.TryGetValue(targetUserId, out var state) &&
                (state.State == "offering" || state.State == "answering" || state.State == "connected"))
            {
                await Clients.Client(targetUserId).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
            }
        }

        // إنهاء الإشارة
        public async Task SignalingComplete(string roomId, string targetUserId)
        {
            if (_userStates.TryGetValue(Context.ConnectionId, out var current))
            {
                _userStates[Context.ConnectionId] = (current.UserName, "connected");
                await Clients.Client(targetUserId).SendAsync("SignalingComplete", Context.ConnectionId);
            }
        }

        // إرسال إشارة عامة بأي نوع
        public async Task SendSignal(string roomId, string targetUserId, object signal, string type)
        {
            await Clients.Client(targetUserId).SendAsync("ReceiveSignal", Context.ConnectionId, signal, type);
        }
        public async Task ToggleMute(string roomName, string userName, bool isMuted)
        {
            await Clients.Group(roomName).SendAsync("UserMuteChanged", userName, isMuted);
        }
        public async Task UserSpeaking(string roomName, string userName)
        {
            await Clients.Group(roomName).SendAsync("UserSpeaking", userName);
        }
    }
}
