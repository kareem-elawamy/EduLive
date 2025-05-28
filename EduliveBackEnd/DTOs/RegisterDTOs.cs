using System.ComponentModel.DataAnnotations;

namespace EduLive.DTOs
{
    public class RegisterDTOs
    {
        public string UserName { get; set; } = string.Empty;

         //[Required, DataType(DataType.EmailAddress), EmailAddress, RegularExpression(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$", ErrorMessage = "Invalid Email Address")]

        public IFormFile? ProfileImage { get; set; }
        public string Email { get; set; } = string.Empty;

        //[Required, DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
        //[Required, DataType(DataType.PhoneNumber), MaxLength(11), MinLength(11), RegularExpression(@"^0[0-9]{10}$", ErrorMessage = "Invalid Phone Number")]
        public string phoneNumber { get; set; } = string.Empty;
    }
}
