namespace EduLive.Models
{
    public class SubmitTask
    {
        public int Id { get; set; }
        public string? FillUrl { get; set; }
        public bool IsCompleted { get; set; }
        public int TaskId { get; set; }
        public Tasks Task { get; set; }
        public string StudentId { get; set; }
        public ApplicationUser Student { get; set; }
    }
}
