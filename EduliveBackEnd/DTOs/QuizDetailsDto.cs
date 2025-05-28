namespace EduLive.DTOs
{
    public class QuizDetailsDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? TeacherName { get; set; }
        public List<QuestionDto>? Questions { get; set; }
    }
}
