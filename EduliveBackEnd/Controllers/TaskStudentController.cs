using EduLive.DTOs;
using EduLive.Models;
using EduLive.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace EduLive.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskStudentController : ControllerBase
    {

        private readonly AddDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public TaskStudentController(AddDbContext context, UserManager<ApplicationUser> userManager, IImageService imageService)
        {

            _context = context;
            _userManager = userManager;
        }
        [HttpGet("deadline")]
        public async Task<IActionResult> GetByDeadline([FromQuery] DateTime dateTime)
        {
            var tasks = await _context.TaskStudents.Where(t => t.Deadline.Date == dateTime.Date).ToListAsync();
            var result = tasks.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                description = c.Description,
                done = c.Done,
                level = c.Laval,
                deadline = c.Deadline
            });
            return Ok(result);

        }
        [HttpPost]
        public async Task<IActionResult> CreateTask(TaskStDTOs model)
        {
            try
            {
                var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (teacherId == null)
                    return BadRequest("Teacher not found");


                if (string.IsNullOrWhiteSpace(model.Name))
                    return BadRequest("Task title is required");
                var task = new TaskStudent
                {
                    Name = model.Name,
                    Description = model.Description,
                    Done = false,
                    Laval = model.Laval!,
                    StudentId = teacherId,
                    Deadline=model.Deadline.Date
                };
                _context.TaskStudents.Add(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Task created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherId == null)
                return BadRequest("Teacher not found");


            var tasks = await _context.TaskStudents.Where(t=>t.StudentId==teacherId).ToListAsync();
            if (tasks == null || tasks.Count == 0)
                return NotFound("No courses found");
            var result = tasks.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                description = c.Description,
                done = c.Done,
                level = c.Laval,
                deadline = c.Deadline,

            });
            return Ok(result);

        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("User not found");
            var task = await _context.TaskStudents.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");
            if (task.StudentId != teacherid)
                return BadRequest("You are not authorized to delete this Task");
            _context.TaskStudents.Remove(task);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Task deleted successfully" });
        }
        [HttpPut("taskDone/{id}")]
        public async Task<IActionResult> Done(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("User not found");
            var task = await _context.TaskStudents.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");
            if (task.StudentId != teacherid)
                return BadRequest("You are not authorized to delete this Task");
            task.Done = true;
            _context.TaskStudents.Update(task);
            await _context.SaveChangesAsync();
            return Ok("is Done");
        }
        [HttpPut("taskNotDone/{id}")]
        public async Task<IActionResult> NotDone(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("User not found");
            var task = await _context.TaskStudents.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");
            if (task.StudentId != teacherid)
                return BadRequest("You are not authorized to delete this Task");
            task.Done = false   ;
            _context.TaskStudents.Update(task);
            await _context.SaveChangesAsync();
            return Ok("is Not Done");
        }
        [HttpGet("getAllDegree")]
        public async Task<IActionResult> AllDegree()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            if (userId==null)
            {
                return Unauthorized("User Unauthorized");
            }
            var Degree = await _context.Degrees.Include(d => d.SubmitTask).ThenInclude(d => d.Task)
                .Where(d => d.SubmitTask.StudentId == userId).ToListAsync();
            if (Degree == null)
                return NotFound("Not found");
            var result = Degree.Select(c => new
            {
                taskName=c.SubmitTask.Task.Name,
                fill=c.SubmitTask.FillUrl,
                degree=c.SubmitDegree
            });
            return Ok(result);
        }
    }
}
