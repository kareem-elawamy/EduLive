using Microsoft.AspNetCore.Identity;

namespace EduLive.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? ProfileImageUrl { get; set; }

    }
    
}
