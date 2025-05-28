
using EduLive.DTOs;
using EduLive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduLive.Controllers
{
    //[Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/Dashpord/[controller]")]

    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AddDbContext _context;
        public RolesController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager, AddDbContext context)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
        }
        [HttpPost("CreateRole")]
        public async Task<IActionResult> CreateRole(CreateRoleDto RoleDto)
        {
            try
            {

                if (string.IsNullOrEmpty(RoleDto.RoleName))
                    return BadRequest("Role name is required");
                var RoleExists = await _roleManager.RoleExistsAsync(RoleDto.RoleName);
                if (RoleExists)
                    return BadRequest("Role already exist");
                var role = new IdentityRole
                {
                    Name = RoleDto.RoleName
                };
                var result = await _roleManager.CreateAsync(role);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role Created successfully" });
                }
                return BadRequest("Role Can not falied\n" + result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("AssignRole")]
        public async Task<IActionResult> AssignRole(AssignRoleDto assignRoleDto)
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(assignRoleDto.Email);
                if (user == null)
                    return BadRequest("User not found");
                var role = await _roleManager.FindByNameAsync(assignRoleDto.RoleName);
                if (role == null)
                    return BadRequest("Role not found");
                var result = await _userManager.AddToRoleAsync(user, role.Name!);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role assigned successfully" });
                }
                return BadRequest("Role Can not falied\n" + result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetAllRoles")]
        public IActionResult GetAllRoles()
        {
            try
            {

                var roles = _roleManager.Roles.ToList();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetAllUsers")]
        public IActionResult GetAllUsers()
        {
            try
            {
                var users = _userManager.Users.ToList();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetUserRoles")]
        public async Task<IActionResult> GetUserRoles(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return BadRequest("User not found");
                var roles = await _userManager.GetRolesAsync(user);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetRoleUsers")]
        public async Task<IActionResult> GetRoleUsers(string roleName)
        {
            try
            {

                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null)
                    return BadRequest("Role not found");
                var users = await _userManager.GetUsersInRoleAsync(role.Name!);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
       
        [HttpGet("GetUsers")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _userManager.GetUsersInRoleAsync("User");
                var allUser = users.Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.UserName,
                });
                return Ok(allUser);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("DeleteRole")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            try
            {

                var role = await _roleManager.FindByNameAsync(roleName);
                if (role == null)
                    return BadRequest("Role not found");
                var result = await _roleManager.DeleteAsync(role);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role deleted successfully" });
                }
                return BadRequest("Role Can not falied\n" + result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("RemoveRole")]
        public async Task<IActionResult> RemoveRole(AssignRoleDto assignRoleDto)
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(assignRoleDto.Email);
                if (user == null)
                    return BadRequest("User not found");
                var role = await _roleManager.FindByNameAsync(assignRoleDto.RoleName);
                if (role == null)
                    return BadRequest("Role not found");
                var result = await _userManager.RemoveFromRoleAsync(user, role.Name!);
                if (result.Succeeded)
                {
                    return Ok(new { message = "Role removed successfully" });
                }
                return BadRequest("Role Can not falied\n" + result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}