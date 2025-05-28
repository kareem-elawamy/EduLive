namespace EduLive.Models
{
    public class Quiz
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int Duration { get; set; } // in minutes
        public int TotalMarks { get; set; }
        public int PassingMarks { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CourseId { get; set; }
        public Course? Course { get; set; }
        public ICollection<Question>? Questions { get; set; }

    }
}
