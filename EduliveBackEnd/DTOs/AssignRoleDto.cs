using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EduLive.DTOs
{
    public class AssignRoleDto
    {

        [Required(ErrorMessage = "User Email is Required")]
        [EmailAddress]
        public string Email { get; set; } = null!;
        public string RoleName { get; set; } = null!;

    }
}