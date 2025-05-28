namespace EduLive.Models
{
    public class StudentQuizAnswer
    {
        public int Id { get; set; }
        public string? StudentId { get; set; }
        public ApplicationUser? Student { get; set; }
        public int QuestionId { get; set; }
        public Question? Question { get; set; }

        public string? SelectedAnswer { get; set; }
        public DateTime AnsweredAt { get; set; }
    }
}
