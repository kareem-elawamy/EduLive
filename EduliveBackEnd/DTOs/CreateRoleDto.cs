using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EduLive.DTOs
{
    public class CreateRoleDto
    {
        [Required(ErrorMessage ="Role Name is Required")]
        public string RoleName { get; set; }= null!;
    }
}