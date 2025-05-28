namespace EduLive.Models
{
    public class TaskStudent
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string Laval { get; set; }
        public bool Done { get; set; }
        public DateTime Deadline { get; set; }
        public string StudentId { get; set; }
        public ApplicationUser Student { get; set; }
    }
}
