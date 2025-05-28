using EduLive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduLive.Controllers
{
    [Authorize(Roles ="Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class DashpordController : ControllerBase
    {
        private readonly AddDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashpordController(AddDbContext context, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }
        [HttpGet("GetDashboardData")]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var users = await _userManager.GetUsersInRoleAsync("User");
                var Teacher = await _userManager.GetUsersInRoleAsync("Teacher");

                var totalStudents = users.Count() - Teacher.Count();
                var totalUsers = users.Count();
                var totalTeachers = Teacher.Count();
                var totalCourses = await _context.Courses.CountAsync();
                var totalQuizzes = await _context.Quizzes.CountAsync();
                var totalLiveSessions = await _context.Meetings.CountAsync();
                var totalQuestions = await _context.Questions.CountAsync();
                var totalStudentQuizAnswers = await _context.StudentQuizAnswers.CountAsync();
                var totalCoursesCreatedByTeacher = await _context.Courses
                    .Where(c => c.TeacherId == Teacher.FirstOrDefault().Id)
                    .CountAsync();

                return Ok(new
                {
                    TotalStudents = totalStudents,
                    TotalTeachers = totalTeachers,
                    TotalCourses = totalCourses,
                    TotalQuizzes = totalQuizzes,
                    TotalLiveSessions = totalLiveSessions,
                    TotalQuestions = totalQuestions,
                    TotalStudentQuizAnswers = totalStudentQuizAnswers,
                    TotalCoursesCreatedByTeacher = totalCoursesCreatedByTeacher

                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetTotalTeacher")]
        public async Task<IActionResult> GetTotalTeacher()
        {
            try
            {
                var users = await _userManager.GetUsersInRoleAsync("Teacher");
                var totalTeachers = users.Count();
                // totalTeachers courses
                var totalCourses = await _context.Courses
                    .Where(c => c.TeacherId == users.FirstOrDefault().Id)
                    .CountAsync();
                // totalTeachers quizzes
                var totalQuizzes = await _context.Quizzes
                    .Where(q => q.Course.TeacherId == users.FirstOrDefault().Id)
                    .CountAsync();

                return Ok(new
                {
                    TotalTeachers = totalTeachers,
                    TotalCourses = totalCourses,
                    TotalQuizzes = totalQuizzes,

                });



            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("GetAllTeacher")]
        public async Task<IActionResult> GetAllTeacher()
        {
            try
            {
                var users = await _userManager.GetUsersInRoleAsync("Teacher");
                
               var result = users.Select(u => new
               {
                   Name = u.UserName,
                   Email = u.Email,
                   PhoneNumber = u.PhoneNumber,
                   ProfileImageUrl = u.ProfileImageUrl,
                   TotalCourses = _context.Courses.Count(c => c.TeacherId == u.Id),
                   TotalQuizzes = _context.Quizzes.Count(q => q.Course.TeacherId == u.Id),
                   TotalQuestions = _context.Questions.Count(q => q.Quiz.Course.TeacherId == u.Id),
               }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetAllStudent")]
        public async Task<IActionResult> GetAllStudent()
        {
            try
            {
                var users = await _userManager.GetUsersInRoleAsync("User");
                var result = users.Select(u => new
                {
                    Name = u.UserName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    ProfileImageUrl = u.ProfileImageUrl,
                   
                    TotalStudentQuizAnswers = _context.StudentQuizAnswers.Count(a => a.StudentId == u.Id)
                }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
