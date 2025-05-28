using EduLive.DTOs;
using EduLive.Models;
using EduLive.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EduLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IImageService _imageService;

        private readonly IEmailService _emailService;

        public AccountController(IImageService imageService, UserManager<ApplicationUser> userManager,
                                 RoleManager<IdentityRole> roleManager, AddDbContext context,
                                 IConfiguration configuration, IEmailService emailService)
        {
            _imageService = imageService;
            _userManager = userManager;
            _configuration = configuration;
            _emailService = emailService;
        }
        //Done
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTOs model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

               
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return BadRequest("User with this email already exists.");
                }

                var user = new ApplicationUser
                {
                    UserName = model.UserName,
                    Email = model.Email,
                    PhoneNumber = model.phoneNumber,
                    PhoneNumberConfirmed = true,
                    EmailConfirmed = false,
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // حفظ صورة البروفايل (بعد إنشاء اليوزر)
                if (model.ProfileImage != null)
                {
                    var imagePath = await _imageService.SaveImageAsync(model.ProfileImage, "profile_images");
                    user.ProfileImageUrl = imagePath;
                    await _userManager.UpdateAsync(user); // لازم تحدث اليوزر بعد تعديل الصورة
                }

                // إعداد الرول
                var roleManager = HttpContext.RequestServices.GetService<RoleManager<IdentityRole>>();
                if (roleManager == null)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "RoleManager service is not available.");
                }

                if (!await roleManager.RoleExistsAsync("User"))
                {
                    await roleManager.CreateAsync(new IdentityRole("User"));
                }
                await _userManager.AddToRoleAsync(user, "User");

                // إرسال تأكيد الإيميل
                var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = Uri.EscapeDataString(confirmationToken);

                var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/Account/confirm-email?userId={user.Id}&token={encodedToken}";
                var templatePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "confirmEmailTemplate.html");
                var emailTemplate = await System.IO.File.ReadAllTextAsync(templatePath);

                emailTemplate = emailTemplate.Replace("{{confirmationLink}}", confirmationLink);

                await _emailService.SendEmailAsync(user.Email, "Confirm your Email", emailTemplate);

                return Ok(new
                {
                    Message = "User created successfully. Please check your email to confirm your account."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Invalid email confirmation request");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("User not found");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
                return Redirect("http://localhost:4200/login");

            return BadRequest("Invalid token or email already confirmed.");
        }

        //Done
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDtos loginDtos)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var user = await _userManager.FindByEmailAsync(loginDtos.Email);
                if (user is null)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found"
                    });
                }

                if (!user.LockoutEnabled)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = user.Email + " is Blocked"
                    });
                }
                var result = await _userManager.CheckPasswordAsync(user, loginDtos.Password);
                if (!result)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "InValid Password"
                    }
                );
                }
                if (!user.EmailConfirmed)
                {
                    return Unauthorized(new AuthResponseDto
                    {
                        IsSuccess = false,
                        Message = "Please confirm your email before logging in."
                    });
                }

                var token = GenerateTokenAsync(user);
               
                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Tokens = await token,
                    Message = "Login Succes"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        private async Task<string> GenerateTokenAsync(ApplicationUser user)
        {
            try
            {
                var tokenHeader = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWTSetting:securityKey"]!);
                var roles = await _userManager.GetRolesAsync(user);
                List<Claim> claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email,user.Email?? ""),
                new Claim(JwtRegisteredClaimNames.NameId,user.Id?? ""),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName ?? ""),
                //Claim img
                new Claim("profileImageUrl", user.ProfileImageUrl ?? ""),
                new Claim(JwtRegisteredClaimNames.Aud, _configuration.GetSection("JWTSetting:ValidAudience").Value!),
        new Claim(JwtRegisteredClaimNames.Iss, _configuration.GetSection("JWTSetting:ValidIssuer").Value!)


            };
                
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
                var tokenDes = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(1),
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256)
                };
                var token = tokenHeader.CreateToken(tokenDes);
                return tokenHeader.WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [Authorize]
        [HttpPut("UpdatePassword")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto updatePasswordDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return BadRequest("User not found");
                }
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }
                if (updatePasswordDto.NewPassword != updatePasswordDto.ConfirmPassword)
                {
                    return BadRequest("New password and confirm password do not match");
                }
                var result = await _userManager.ChangePasswordAsync(user, updatePasswordDto.OldPassword!, updatePasswordDto.NewPassword!);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }
                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return BadRequest("User not found");
                }
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }
                var studentProfile = new
                {
                    user.UserName,
                    user.Email,
                    user.PhoneNumber,
                    user.ProfileImageUrl
                };
                return Ok(studentProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpPut("UpdateProfile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfile model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest("User not found");
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                user.UserName = model.UserName;

                if (model.ProfileImage != null)
                {
                  
                    if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                    {
                        await _imageService.DeleteImageAsync(user.ProfileImageUrl);
                    }
                    var imagePath = await _imageService.SaveImageAsync(model.ProfileImage, "profile_images");
                    user.ProfileImageUrl = imagePath;
                }

                    var result = await _userManager.UpdateAsync(user);
                    if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //Get user Profile
        [Authorize]
        [HttpGet("GetUserProfile")]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return NotFound("User not found");
                }
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }
                var roles = await _userManager.GetRolesAsync(user);

                var userProfile = new
                {
                    userName = user.UserName,
                    email=user.Email,
                    pohone=user.PhoneNumber,
                    profileImageUrl=user.ProfileImageUrl,
                    roles=roles
                    
                };
                return Ok(userProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


    }
}
