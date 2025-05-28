using EduLive.DTOs;
using EduLive.Models;
using EduLive.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace EduLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AddDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IImageService _imageService;
        public TasksController(AddDbContext context, UserManager<ApplicationUser> userManager, IImageService imageService)
        {
            _imageService = imageService;
            _context = context;
            _userManager = userManager;
        }
        // create Task
        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateTask(TaskDTOs model)
        {
            try
            {
                var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (teacherId == null)
                    return BadRequest("Teacher not found");


                // التحقق من وجود الدورة التدريبية
                var course = await _context.Courses.FindAsync(model.courseId);
                if (course == null)
                    return NotFound("Course not found");

                // التحقق من أن المعلم هو صاحب الدورة
                if (course.TeacherId != teacherId)
                    return Forbid("You are not authorized to create a quiz for this course");
                if (string.IsNullOrWhiteSpace(model.Name))
                    return BadRequest("Quiz title is required");
                var task = new Tasks
                {
                    Name = model.Name,
                    Description = model.Description,
                    Done = false,
                    Laval = model.Laval,
                    CourseId = model.courseId,
                    Deadline = model.Deadline.Date,
                    Userid = teacherId,
                    Degree = model.Degree,
                };
                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Task created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherId == null)
                return BadRequest("Teacher not found");


            var tasks = await _context.Tasks.Include(t=>t.Course).ToListAsync();
            if (tasks == null || tasks.Count == 0)
                return NotFound("No courses found");
            var result = tasks.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                description = c.Description,
                corseId = c.CourseId,
                courseName = c.Course?.Title ?? "",
                done = c.Done,
                level = c.Laval,
                deadline = c.Deadline,
                degree = c.Degree,
                fill = FillName(c.Id).Result

            });
            return Ok(result);

        }
        [Authorize]
        [HttpGet("GetAllCourseTask/{id}")]
        public async Task<IActionResult> GetAllCourseTask(int id)
        {
            var tasks = await _context.Tasks.Include(t=>t.Course).Where(t => t.CourseId == id).ToListAsync();

            var num = tasks.Count;
            if (tasks == null || tasks.Count == 0)

                return NotFound("No task found");
            var result = tasks.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                description = c.Description,
                corseName = c.Course.Title??"",
                done = c.Done,
                level = c.Laval,
                taskCount=num,
                deadline=c.Deadline,

            });
            return Ok(result);

        }
        [Authorize]
        [HttpGet("deadline")]
        public async Task<IActionResult> GetByDeadline([FromQuery] DateTime dateTime)
        {
            var tasks= await _context.Tasks.Where(t=>t.Deadline.Date == dateTime.Date).ToListAsync();
            var result = tasks.Select(c => new
            {
                id = c.Id,
                name = c.Name,
                description = c.Description,
                done = c.Done,
                laval = c.Laval,
                deadline=c.Deadline
            });
            return Ok(result);

        }
        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("User not found");
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");
            if (task.Userid != teacherid)
                return BadRequest("You are not authorized to delete this Task");
            var submit = _context.Submits.Where(s => s.TaskId == task.Id);
            _context.Submits.RemoveRange(submit);
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Task deleted successfully" });
        }
        [Authorize]
        [HttpPost("SubmitTask")]
        public async Task<IActionResult> SubmitTask(SubmitTaskDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized("User not found");

            var task = await _context.Tasks.FindAsync(model.TaskId);
            if (task == null)
                return NotFound("Task not found");

            var existingSubmission = await _context.Submits
                .FirstOrDefaultAsync(s => s.TaskId == model.TaskId && s.StudentId == userId);

            if (existingSubmission != null)
                return BadRequest("You have already submitted this task.");

            var submit = new SubmitTask
            {
                IsCompleted = true,
                StudentId = userId,
                TaskId = model.TaskId
            };

            if (model.FillUrl!=null) 
            {
                var savedUrl = await _imageService.SaveImageAsync(model.FillUrl, "Tasks_fill");
                submit.FillUrl = savedUrl;
            }

            _context.Submits.Add(submit);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task submitted successfully" });
        }
        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("getAllTaskSubmit")]
        public async Task<IActionResult> AllTaskSubmit()
        {
            var submit = await _context.Submits.Include(s => s.Task)
      .ThenInclude(t => t.Course)
      .Include(s => s.Student).ToListAsync();
            if (submit==null||submit.Count==0)
            {
                return NotFound("Not Found any Task");
            }
            var result = submit.Select(s => new
            {
                id=s.Id,
                student = s.Student.UserName??"",
                course = s.Task.Course!.Title??"",
                task = s.Task.Name,
                degree = s.Task.Degree,
                fill = s.FillUrl
            });
            return Ok(result);
        }
        [Authorize]
        [HttpGet("taskIsDone/{id}")]
        public async  Task<IActionResult> IsDone(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            if (userId == null)
            {
                return BadRequest("User not found");
            }
            var task = await _context.Submits.FirstOrDefaultAsync(s => s.TaskId  == id && s.StudentId == userId);
            if (task==null)
            {
                return BadRequest("Task Not Found");
            }
            return Ok(task!.IsCompleted);
        }
        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("addDegree")]
        public async Task<IActionResult> AddDegree([FromForm] DegreeDto model)
        {
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            if (teacherId == null)
                return Unauthorized("Teacher not Found");
            var submit = await _context.Submits.Include(s => s.Task).ThenInclude(s=>s.Course).FirstOrDefaultAsync(s => s.Id == model.SubmitId); if (submit==null)
            {
                return BadRequest("Task Not Found");
            }
            
            var degree = new Degree
            {
                SubmitId=model.SubmitId,
                SubmitDegree=model.SubmitDegree
            };
            _context.Degrees.Add(degree);
            await _context.SaveChangesAsync();
            return Ok("Add degree done");
        }

        [HttpGet("DegreeDone/{id}")]
        public async Task<bool> DegreeDone(int id)
        {


            var res = await _context.Degrees.FirstOrDefaultAsync(d => d.SubmitId == id);
            return res != null;

        }
        private async Task<string> FillName(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            if (userId == null)
            {
                return ("User not found");
            }
            var task = await _context.Submits.FirstOrDefaultAsync(s => s.TaskId == id && s.StudentId == userId);
            if (task == null)
            {
                return ("Task Not Found");
            }
            return task.FillUrl;
        }

    }
}
