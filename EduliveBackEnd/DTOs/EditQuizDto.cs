namespace EduLive.DTOs
{
    public class EditQuizDto
    {

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public int Duration { get; set; } // in minutes
        public int TotalMarks { get; set; }
        public int PassingMarks { get; set; }



    }
}