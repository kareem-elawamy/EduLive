namespace EduLive.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string? Text { get; set; } 
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public int DegreeOfDifficulty { get; set; } // 1 to 5 scale
        public int Marks { get; set; } // Marks for the question
        public string? OptionD { get; set; }
        public string? CorrectAnswer { get; set; }


        public int QuizId { get; set; }
        public Quiz? Quiz { get; set; }
    }
}
