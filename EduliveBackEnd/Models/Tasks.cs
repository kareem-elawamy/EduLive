namespace EduLive.Models
{
    public class Tasks
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string Laval { get; set; }
        public bool Done { get; set; }
        public DateTime Deadline { get; set; }
        public int Degree { get; set; }
        public int? CourseId { get; set; }
        public Course? Course { get; set; }
        public string Userid { get; set; }
        public ApplicationUser User { get; set; }   
        
    }
}
