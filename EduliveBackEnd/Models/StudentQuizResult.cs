namespace EduLive.Models
{
    public class StudentQuizResult
    {
       
            public int Id { get; set; }
            public string? StudentId { get; set; }
            public ApplicationUser? Student { get; set; }

            public int QuizId { get; set; }
            public Quiz? Quiz { get; set; }

            public int TotalMarksObtained { get; set; }
            public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
            public bool IsPassed { get; set; }
        }

    }

