using EduLive.DTOs;
using EduLive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduLive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingsController : ControllerBase
    {
        private readonly AddDbContext _context;
        public MeetingsController(AddDbContext context)
        {
            _context = context;
        }
        [Authorize(Roles = "Admin, Teacher")]
        [HttpPost]
        public async Task<IActionResult> CreateMeeting([FromBody] MeetingDTOs meeting)
        {
            var teacherId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherId == null)
            {
                return BadRequest("User not found");
            }
            // Check if the user is a teacher
            if (meeting == null)
            {
                return BadRequest("Meeting data is required");
            }


            if (string.IsNullOrEmpty(meeting.MeetingName))
            {
                return BadRequest("Meeting name is required");
            }
            if (meeting.StartTime == default || meeting.EndTime == default)
            {
                return BadRequest("Start and end times are required");
            }
            if (meeting.StartTime >= meeting.EndTime)
            {
                return BadRequest("End time must be after start time");
            }

            // Create a new meeting object
            var meetings = new Meeting
            {
                MeetingName = meeting.MeetingName,
                StartTime = meeting.StartTime,
                EndTime = meeting.EndTime,
                TeacherId = teacherId 
            };
            _context.Meetings.Add(meetings);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Meeting created successfully",
     
            });
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetMeetings()
        {
            var meetings = await _context.Meetings
        .Include(m => m.Teacher)
        .ToListAsync();

            if (meetings == null || meetings.Count == 0)
            {
                return NotFound("No meetings found");
            }
            var result = new
            {
                TotalMeetings = meetings.Count,
                Meetings = meetings.Select(m => new
                {
                    m.Id,
                    m.MeetingName,
                    m.StartTime,
                    m.EndTime,
                    m.Teacher?.Email,
                    m.RoomId
                })
            };
        
            return Ok(result);
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMeetingById(int id)
        {
            var meeting = await _context.Meetings
        .Include(m => m.Teacher)
        .FirstOrDefaultAsync(m => m.Id == id);
            if (meeting == null)
            {
                return NotFound("Meeting not found");
            }
            return Ok(new
            {
                Id=meeting.Id,
                MeetingName=meeting.MeetingName,
                StartTime=meeting.StartTime,
                EndTime= meeting.EndTime,
                teacherName = meeting.Teacher!.Email
            });
        }
        // Get StertTime
        [Authorize]
        [HttpGet("StartTime")]
        public async Task<IActionResult> StartTime([FromQuery] string roomId)
        {
            var meeting = await _context.Meetings
                .Include(m => m.Teacher)
                .FirstOrDefaultAsync(m => m.RoomId == roomId);

            if (meeting == null)
            {
                return NotFound("Meeting not found.");
            }

            return Ok(new
            {
                startTime = meeting.StartTime,
                endTime = meeting.EndTime
            });
        }



    }
}
