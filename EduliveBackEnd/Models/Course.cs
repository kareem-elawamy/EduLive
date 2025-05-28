namespace EduLive.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? TeacherId { get; set; }
        public ApplicationUser? Teacher { get; set; }
        public string? ImageUrl { get; set; }
        public ICollection<Quiz>? Quizzes { get; set; } = new List<Quiz>();

    }
}
