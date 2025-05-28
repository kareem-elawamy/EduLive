namespace EduLive.Models
{
    public class Meeting
    {
        public int Id { get; set; }

        public string? MeetingName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? TeacherId { get; set; } // User ID of the creator
        public ApplicationUser? Teacher { get; set; } // Navigation property to the user who created the meeting
        public string RoomId { get; set; } = Guid.NewGuid().ToString();
    }
}
