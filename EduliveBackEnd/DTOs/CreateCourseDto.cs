namespace EduLive.DTOs
{
    public class CreateCourseDto
    {
        public string Title  { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

}
