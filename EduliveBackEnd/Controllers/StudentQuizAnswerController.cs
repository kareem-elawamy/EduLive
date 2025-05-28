using EduLive.DTOs;
using EduLive.Models;
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
    public class StudentQuizAnswerController : ControllerBase
    {
        private readonly AddDbContext _context;
        public StudentQuizAnswerController(AddDbContext context)
        {
            _context = context;
        }
        [HttpPost("SubmitQuizAnswer")]
        public async Task<IActionResult> SubmitQuizAnswer([FromBody] QuizAnswerDto quizAnswerDto)
        {
            try
            {
                var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (studentId == null)
                {
                    return BadRequest("User not found");
                }

                // Get the question to retrieve QuizId
                var question = await _context.Questions
                    .Include(q => q.Quiz)
                    .FirstOrDefaultAsync(q => q.Id == quizAnswerDto.QuestionId);

                if (question == null || question.Quiz == null)
                {
                    return BadRequest("Question or related quiz not found");
                }

                

                // Store the answer
                var quizAnswer = new StudentQuizAnswer
                {
                    StudentId = studentId,
                    QuestionId = quizAnswerDto.QuestionId,
                    SelectedAnswer = quizAnswerDto.Answer,
                    AnsweredAt = DateTime.UtcNow
                };

                await _context.StudentQuizAnswers.AddAsync(quizAnswer);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Quiz answer submitted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetQuizAnswers")]
        public async Task<IActionResult> GetQuizAnswers()
        {
            try
            {
                var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (studentId == null)
                {
                    return BadRequest("User not found");
                }
                var quizAnswers = await _context.StudentQuizAnswers
                    .Where(a => a.StudentId == studentId)
                    .ToListAsync();
                return Ok(quizAnswers);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetQuizAnswerByQuestionId/{questionId}")]
        public async Task<IActionResult> GetQuizAnswerByQuestionId(int questionId)
        {
            try
            {
                var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (studentId == null)
                {
                    return BadRequest("User not found");
                }
                var quizAnswer = await _context.StudentQuizAnswers
                    .FirstOrDefaultAsync(a => a.StudentId == studentId && a.QuestionId == questionId);
                if (quizAnswer == null)
                {
                    return NotFound("Quiz answer not found");
                }
                return Ok(quizAnswer);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetQuizResult/{quizId}")]
        public async Task<IActionResult> GetQuizResult(int quizId)
        {
            try
            {
                var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (studentId == null)
                {
                    return BadRequest("User not found");
                }

                // Check if result already exists
                var existingResult = await _context.StudentQuizResults
                    .FirstOrDefaultAsync(r => r.StudentId == studentId && r.QuizId == quizId);

                if (existingResult != null)
                {
                    return Ok(new
                    {
                        QuizTitle = (await _context.Quizzes.FindAsync(quizId))?.Title ?? "",
                        TotalMarksObtained = existingResult.TotalMarksObtained,
                        TotalMarks = (await _context.Quizzes.FindAsync(quizId))?.TotalMarks ?? 0,
                        IsPassed = existingResult.IsPassed
                    });
                }

                // Get all answers
                var answers = await _context.StudentQuizAnswers
                    .Include(a => a.Question)
                    .Where(a => a.StudentId == studentId && a.Question.QuizId == quizId)
                    .ToListAsync();

                var quiz = await _context.Quizzes
                    .Include(q => q.Questions)
                    .FirstOrDefaultAsync(q => q.Id == quizId);

                if (quiz == null)
                {
                    return NotFound("Quiz not found");
                }

                int totalMarks = quiz.TotalMarks;
                int totalMarksObtained = 0;

                foreach (var answer in answers)
                {
                    if (answer.Question != null && answer.Question.CorrectAnswer == answer.SelectedAnswer)
                    {
                        totalMarksObtained += answer.Question.Marks;
                    }
                }

                var quizResult = new StudentQuizResult
                {
                    StudentId = studentId,
                    QuizId = quizId,
                    TotalMarksObtained = totalMarksObtained,
                    SubmittedAt = DateTime.UtcNow,
                    IsPassed = totalMarksObtained >= (totalMarks * 0.5)
                };

                await _context.StudentQuizResults.AddAsync(quizResult);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    QuizTitle = quiz.Title,
                    TotalMarksObtained = totalMarksObtained,
                    TotalMarks = totalMarks,
                    IsPassed = quizResult.IsPassed
                });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpGet("GetAllResult")]
        public async Task<IActionResult> GetAllResult()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentId == null)
            {
                return BadRequest("User Not Found");
            }

            var res = await _context.StudentQuizResults
                .Where(c => c.StudentId == studentId).Include(q=>q.Quiz)
                .ToListAsync();
            var allTotalMark = res.Select(c => c.TotalMarksObtained).Count(); ;
            


            var result = res.Select( c => new
            {
                StudentId = c.StudentId,
                TotalMarksObtained = c.TotalMarksObtained,
                IsPassed = c.IsPassed,
                SubmittedAt = c.SubmittedAt,
                QuizName=c.Quiz!.Title??"",
                totalMarks=c.Quiz.TotalMarks,
               
            });

            return Ok(result);
        }

        [HttpGet("IsGreenOrRed")]
        public async Task<IActionResult> IsGreenOrRed()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentId == null)
            {
                return BadRequest("User Not Found");
            }

            var res = await _context.StudentQuizResults
                .Where(c => c.StudentId == studentId).Include(q => q.Quiz)
                .ToListAsync();
            var allTotalMark = res.Select(c => c.TotalMarksObtained).Count();
            var allTotalQuizMark = res.Select(c => c.Quiz!.TotalMarks).Count(); ;
            return Ok((allTotalMark * 100) /allTotalQuizMark > 50 ? true : false);
        }


        }
    }