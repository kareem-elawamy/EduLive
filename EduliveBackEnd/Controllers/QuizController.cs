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

    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IImageService _imageService;
        private readonly AddDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public QuizController(AddDbContext context, UserManager<ApplicationUser> userManager, IImageService imageService)
        {
            _imageService = imageService;
            _context = context;
            _userManager = userManager;
        }
        //Create Course
        [Authorize(Roles = "Admin")]
        [HttpPost("createCourse")]
        public async Task<IActionResult> CreateCourse(CreateCourseDto model)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            if (string.IsNullOrWhiteSpace(model.Title))
                return BadRequest("Course title is required");
            if (string.IsNullOrWhiteSpace(model.Description))
                return BadRequest("Course description is required");
            var course = new Course
            {
                Title = model.Title,
                Description = model.Description,
                CreatedAt = DateTime.UtcNow,
                TeacherId = teacherid
            };

            if (model.Image != null)
            {
                var imageUrl = await _imageService.SaveImageAsync(model.Image, "course_images");
                course.ImageUrl = imageUrl;
            }
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Course created successfully" });
        }
        //Delete Course
        [Authorize(Roles = "Admin")]
        [HttpDelete("deleteCourse/{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound("Course not found");
            if (course.TeacherId != teacherid)
                return BadRequest("You are not authorized to delete this course");
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Course deleted successfully" });
        }
        //Assign Course to Teacher
        [Authorize(Roles = "Admin")]
        [HttpPost("assignCourseToTeacher")]
        public async Task<IActionResult> AssignCourseToTeacher([FromBody] AssignCourseToTeacherDto model)
        {
            var teacherId = await _userManager.Users.Where(u => u.Email == model.TeacherEmail).Select(u => u.Id).FirstOrDefaultAsync();
            var teacher = await _userManager.FindByEmailAsync(model.TeacherEmail);
            var role = await _userManager.GetRolesAsync(teacher);
            if (role == null || !role.Contains("Teacher"))
                return BadRequest("User is not a teacher");

            if (teacherId == null)
                return BadRequest("Teacher not found");
            var course = await _context.Courses.FindAsync(model.CourseId);
            if (course == null)
                return NotFound("Course not found");
            course.TeacherId = teacherId;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Course assigned to teacher successfully" });
        }

        //Get All Courses from Teacher
        [HttpGet("getAllCoursesForTeacher")]
        public async Task<IActionResult> GetAllCourses(string teacherEmail)
        {
            try
            {

                var teacherId = await _userManager.Users.Where(u => u.Email == teacherEmail).Select(u => u.Id).FirstOrDefaultAsync();
                if (teacherId == null)
                    return BadRequest("Teacher not found");
                var courses = await _context.Courses.Where(c => c.TeacherId == teacherId).ToListAsync();
                if (courses == null || courses.Count == 0)
                    return NotFound("No courses found");
                var quizCountFromCourse = await _context.Quizzes
                    .GroupBy(q => q.CourseId)
                    .Select(g => new { CourseId = g.Key, QuizCount = g.Count() })
                    .ToListAsync();
                var result = courses.Select(c => new
                {
                    id = c.Id,
                    title = c.Title,
                    description = c.Description,
                    createdAt = c.CreatedAt,
                    img = c.ImageUrl,
                    numberQuizzes = quizCountFromCourse
                        .FirstOrDefault(q => q.CourseId == c.Id)?.QuizCount ?? 0
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

            }
        }
        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto model)
        {
            try
            {
                // التحقق من هوية المعلم
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

                // التحقق من صحة المدخلات
                if (string.IsNullOrWhiteSpace(model.Title))
                    return BadRequest("Quiz title is required");
                if (model.TotalMarks <= 0)
                    return BadRequest("Total marks must be greater than 0");
                if (model.PassingMarks <= 0 || model.PassingMarks > model.TotalMarks)
                    return BadRequest("Passing marks must be greater than 0 and less than or equal to total marks");
                if (model.Duration <= 0)
                    return BadRequest("Duration must be greater than 0");

                // إنشاء الكويز
                var quiz = new Quiz
                {
                    Title = model.Title,
                    CourseId = model.courseId,
                    Description = model.Description,
                    CreatedAt = DateTime.UtcNow,
                    PassingMarks = model.PassingMarks,
                    TotalMarks = model.TotalMarks,
                    Duration = model.Duration,
                };

                // إضافة الكويز إلى قاعدة البيانات
                _context.Quizzes.Add(quiz);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Quiz created successfully" });
            }
            catch (Exception ex)
            {
                // معالجة الأخطاء غير المتوقعة
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        //Get All Quizzes
        [HttpGet("getAllQuizzes")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var quizzes = await _context.Quizzes.ToListAsync();
            if (quizzes == null || quizzes.Count == 0)
                return NotFound("No quizzes found");
            var result = quizzes.Select(q => new
            {
                id = q.Id,
                title = q.Title,
                description = q.Description,
                createdAt = q.CreatedAt,
                passingMarks = q.PassingMarks,
                totalMarks = q.TotalMarks,
                duration = q.Duration,
                courseId = q.CourseId,
                courseTitle = _context.Courses.FirstOrDefaultAsync(c => c.Id == q.CourseId).Result.Title,
            });
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("getAllQuizFromCourse/{id}")]
        public async Task<IActionResult> GetAllQuizFromCourse(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return BadRequest("Course not found");

            var quizzes = await _context.Quizzes.Where(q => q.CourseId == id).ToListAsync();
            var teacher = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == course.TeacherId);
            if (quizzes.Count != 0)
            {

                var result = new
                {
                    courseId = course.Id,
                    courseTitle = course.Title,
                    courseDescription = course.Description,
                    courseCreatedAt = course.CreatedAt,
                    courseTeacherName = teacher!.UserName,
                    courseTeacherEmail = teacher.Email,
                    courseTeacherPhone = teacher.PhoneNumber,
                    courseTeacherImage = teacher.ProfileImageUrl,
                    courseImage = course.ImageUrl,
                    numberQuizzes = quizzes.Count(),
                    quizzes = quizzes.Select(q => new
                    {
                        id = q.Id,
                        title = q.Title,
                        description = q.Description,
                        createdAt = q.CreatedAt,
                        passingMarks = q.PassingMarks,
                        totalMarks = q.TotalMarks,
                        duration = q.Duration,
                        questionNum = _context.Questions
                            .Where(qs => qs.QuizId == q.Id)
                            .Count(),
                    })

                };
                
                return Ok(result);

            }
            else
            {
                var result = new
                {
                    courseId = course.Id,
                    courseTitle = course.Title,
                    courseDescription = course.Description,
                    courseCreatedAt = course.CreatedAt,
                    courseTeacherName = teacher.UserName,
                    courseTeacherEmail = teacher.Email,
                    courseTeacherPhone = teacher.PhoneNumber,
                    courseTeacherImage = teacher.ProfileImageUrl,
                    courseImage = course.ImageUrl,
                    numberQuizzes = 0,
                };
                return Ok(result);
            }

        }


        [HttpGet("getAllCoursesTeacher/{id}")]
        public async Task<IActionResult> getAllCoursesTeacher(string id)
        {
            if (id == null)
                return BadRequest("Teacher not found");
            var teacher = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            // Courses Taught by the teacher
            var courses = await _context.Courses.Where(c => c.TeacherId == id).ToListAsync();
            if (courses == null || courses.Count == 0)
                return NotFound("No courses found for this teacher");
            var result =
                 new
                 {
                     teacherName = teacher.UserName,
                     teacherEmail = teacher.Email,
                     teacherPhone = teacher.PhoneNumber,
                     teacherImage = teacher.ProfileImageUrl,
                     numberCourses = courses.Count(),
                     courses = courses.Select(c => new
                     {
                         id = c.Id,
                         title = c.Title,
                         description = c.Description,
                         createdAt = c.CreatedAt,
                         img = c.ImageUrl,
                         numberQuizzes = _context.Quizzes
                             .Where(q => q.CourseId == c.Id)
                             .Count(),
                     })
                 };


            return Ok(result);
        }
        [Authorize(Roles = "Teacher,Admin")]
        [HttpPut("editQuiz/{id}")]
        public async Task<IActionResult> EditQuiz(int id, [FromBody] EditQuizDto model)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
                return NotFound("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to edit this quiz");

            quiz.Title = model.Title;
            quiz.Description = model.Description;
            quiz.PassingMarks = model.PassingMarks;
            quiz.TotalMarks = model.TotalMarks;
            quiz.Duration = model.Duration;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Quiz updated successfully" });
        }
        //Delete Quiz
        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("deleteQuiz/{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var quiz = await _context.Quizzes.FindAsync(id!);
            if (quiz == null)
                return NotFound("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to delete this quiz");
            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Quiz deleted successfully" });
        }
        //get Quiz By Id
        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("getQuizById/{id}")]
        public async Task<IActionResult> GetQuizById(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
                return NotFound("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to get this quiz");
            // Get the quiz Questions
            var questions = await _context.Questions.Where(q => q.QuizId == id).ToListAsync();
            var result = new
            {
                id = quiz.Id,
                title = quiz.Title,
                description = quiz.Description,
                createdAt = quiz.CreatedAt,
                passingMarks = quiz.PassingMarks,
                totalMarks = quiz.TotalMarks,
                duration = quiz.Duration,
                courseId = quiz.CourseId,
                courseTitle = _context.Courses.FirstOrDefaultAsync(c => c.Id == quiz.CourseId).Result.Title,
                questions = questions.Select(q => new
                {
                    id = q.Id,
                    text = q.Text,
                    optionA = q.OptionA,
                    optionB = q.OptionB,
                    optionC = q.OptionC,
                    optionD = q.OptionD,
                    correctAnswer = q.CorrectAnswer,
                    marks = q.Marks,
                    degreeOfDifficulty = q.DegreeOfDifficulty
                })
            };
            return Ok(result);
        }
        [Authorize]
        [HttpGet("getQuizStudentById/{id}")]
        public async Task<IActionResult> GetQuizStudentById(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
                return NotFound("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");

            // Get the quiz Questions
            var questions = await _context.Questions.Where(q => q.QuizId == id).ToListAsync();
            var result = new
            {
                id = quiz.Id,
                title = quiz.Title,
                description = quiz.Description,
                createdAt = quiz.CreatedAt,
                passingMarks = quiz.PassingMarks,
                totalMarks = quiz.TotalMarks,
                duration = quiz.Duration,
                courseId = quiz.CourseId,
                courseTitle = _context.Courses.FirstOrDefaultAsync(c => c.Id == quiz.CourseId).Result.Title,
                questions = questions.Select(q => new
                {
                    id = q.Id,
                    text = q.Text,
                    optionA = q.OptionA,
                    optionB = q.OptionB,
                    optionC = q.OptionC,
                    optionD = q.OptionD,
                    correctAnswer = q.CorrectAnswer,
                    marks = q.Marks,
                    degreeOfDifficulty = q.DegreeOfDifficulty
                })
            };
            return Ok(result);
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("addQuestion")]
        public async Task<IActionResult> AddQuestion([FromBody] CreateQuestionDto model)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");

            var quiz = await _context.Quizzes.FindAsync(model.QuizId);
            if (quiz == null)
                return BadRequest("Quiz not found");
            var totalMarks = quiz.TotalMarks;

            // Total Mark Question in Quiz
            var totalQuestionMarks = await _context.Questions.Where(q => q.QuizId == model.QuizId).SumAsync(q => q.Marks);


            if (totalQuestionMarks > totalMarks)
                return BadRequest("You have reached the maximum number of questions for this quiz");


            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");

            if (course.TeacherId != teacherid)
                return BadRequest("You are not authorized to add questions to this course");
            var question = new Question
            {
                Text = model.Text,
                QuizId = model.QuizId,
                OptionA = model.OptionA,
                OptionB = model.OptionB,
                OptionC = model.OptionC,
                OptionD = model.OptionD,
                CorrectAnswer = model.CorrectAnswer,
                Marks = model.Marks,
                DegreeOfDifficulty = model.DegreeOfDifficulty
            };
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question added successfully" });
        }
        //Delete Question
        [Authorize(Roles = "Teacher,Admin")]
        [HttpDelete("deleteQuestion/{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                return NotFound("Question not found");
            var quiz = await _context.Quizzes.FindAsync(question.QuizId);
            if (quiz == null)
                return BadRequest("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to delete this question");
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question deleted successfully" });
        }
        //Get All Questions
        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("getAllQuestions")]
        public async Task<IActionResult> GetAllQuestions()
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var questions = await _context.Questions.ToListAsync();
            if (questions == null || questions.Count == 0)
                return NotFound("No questions found");
            return Ok(questions);
        }
        //Get All Questions By Quiz Id
        [Authorize(Roles = "Teacher,Admin")]
        [HttpGet("getAllQuestionsByQuizId/{id}")]
        public async Task<IActionResult> GetAllQuestionsByQuizId(int id)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
                return BadRequest("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to get questions for this quiz");
            var questions = await _context.Questions.Where(q => q.QuizId == id).ToListAsync();
            if (questions == null || questions.Count == 0)
                return NotFound("No questions found for this quiz");
            return Ok(new
            {
                title = questions.Select(q => q.Text),
                optionA = questions.Select(q => q.OptionA),
                optionB = questions.Select(q => q.OptionB),
                optionC = questions.Select(q => q.OptionC),
                optionD = questions.Select(q => q.OptionD),
                correctAnswer = questions.Select(q => q.CorrectAnswer),
            });
        }
        //Get Quiz By Id
        [Authorize(Roles = "Teacher,Admin")]
        [HttpPut("editQuestion/{id}")]
        public async Task<IActionResult> EditQuestion(int id, [FromBody] CreateQuestionDto model)
        {
            var teacherid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (teacherid == null)
                return BadRequest("Teacher not found");
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                return NotFound("Question not found");
            var quiz = await _context.Quizzes.FindAsync(question.QuizId);
            if (quiz == null)
                return BadRequest("Quiz not found");
            var course = await _context.Courses.FindAsync(quiz?.CourseId);
            if (course == null)
                return BadRequest("Course not found");
            var totalMarks = quiz.TotalMarks;
            // Total Mark Question in Quiz
            var totalQuestionMarks = await _context.Questions.Where(q => q.QuizId == question.QuizId).SumAsync(q => q.Marks);
            if (totalQuestionMarks + model.Marks > totalMarks)
                return BadRequest("You have reached the maximum number of questions for this quiz");
            if (course?.TeacherId != teacherid)
                return BadRequest("You are not authorized to edit this question");
            question.Text = model.Text;
            question.OptionA = model.OptionA;
            question.OptionB = model.OptionB;
            question.OptionC = model.OptionC;
            question.OptionD = model.OptionD;
            question.CorrectAnswer = model.CorrectAnswer;
            question.Marks = model.Marks;
            question.DegreeOfDifficulty = model.DegreeOfDifficulty;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question updated successfully" });
        }
        [HttpGet("getAllCourse")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCourse()
        {
            var courses = await _context.Courses.ToListAsync();
            if (courses == null || courses.Count == 0)
                return NotFound("No courses found");
            // Get the number of quizzes from this course
            var quizCountFromCourse = await _context.Quizzes
       .GroupBy(q => q.CourseId)
       .Select(g => new { CourseId = g.Key, QuizCount = g.Count() })
       .ToListAsync();
            var taskCountFromCourse = await _context.Tasks
       .GroupBy(q => q.CourseId)
       .Select(g => new { CourseId = g.Key, taskCount = g.Count() })
       .ToListAsync();
            // Get the Teacher assigned to this course

            var result = courses.Select(c => new
            {
                id = c.Id,
                title = c.Title,
                description = c.Description,
                createdAt = c.CreatedAt,
                adminName = GetTeacherById(c.TeacherId).Result,
                teacher = _userManager.Users.FirstOrDefaultAsync(u => u.Id == c.TeacherId).Result.UserName,
                teacherId = c.TeacherId,
                img = (c.ImageUrl),
                numberQuizzes = quizCountFromCourse
            .FirstOrDefault(q => q.CourseId == c.Id)?.QuizCount ?? 0,
                tasks= taskCountFromCourse.FirstOrDefault(t=>t.CourseId==c.Id)?.taskCount??0

            });
            return Ok(result);
        }

        private async Task<string> GetTeacherById(string id)
        {
            var teacher = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (teacher == null)
                return ("Teacher not found");
            string teacherName = teacher.UserName;
            return (teacherName);
        }

    }
    
}
