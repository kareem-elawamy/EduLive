namespace EduLive.DTOs
{
    public class AuthResponseDto
    {
        public string Tokens { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
    }
}
