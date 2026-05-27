using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Enums;
using SQLDropbox.Models;

namespace SQLDropbox.Services
{
    public class UserService(AppDbContext db)
    {
        private readonly AppDbContext _db = db;

        public async Task<User> CreateStudentAsync(string userCode, string email)
        {
            if (string.IsNullOrEmpty(userCode) || string.IsNullOrEmpty(email))
                throw new ArgumentException("Usercode and Email are required.");

            User newStudent = new()
            {
                UserCode = userCode,
                Email = email,
                Role = Role.Student,
                CreatedAt = DateTime.UtcNow
            };

            var entity = _db.Users.Add(newStudent);
            await _db.SaveChangesAsync();
            return entity.Entity;
        }

        public async Task<(bool Success, bool AlreadyExists, string? Error)> AddStudentToCourse(Course course, StudentDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.UserCode) || string.IsNullOrWhiteSpace(dto.Email))
                    return (false, false, "Usercode and Email are required.");

                if (course == null)
                    return (false, false, "Course not found");

                var user = await _db.Users.Include(x => x.StudentCourses.Where(sc => sc.DeletedAt == null)).FirstOrDefaultAsync(u => u.DeletedAt == null && u.UserCode == dto.UserCode);

                if (user != null)
                {
                    if (user.StudentCourses.Any(c => c.CourseId == course.CourseId))
                        return (false, true, "Already assigned");

                    // update info
                    user.FirstName = dto.FirstName;
                    user.LastName = dto.LastName;
                    user.Email = dto.Email;
                    user.DeletedAt = null;
                    user.UpdatedAt = DateTime.UtcNow;

                    user.StudentCourses.Add(course);
                }
                else
                {
                    var newStudent = new User
                    {
                        UserCode = dto.UserCode,
                        FirstName = dto.FirstName,
                        LastName = dto.LastName,
                        Email = dto.Email,
                        Role = Role.Student,
                        CreatedAt = DateTime.UtcNow,
                        StudentCourses = new List<Course> { course }
                    };

                    _db.Users.Add(newStudent);
                }

                await _db.SaveChangesAsync();

                return (true, false, null);
            }
            catch (Exception ex)
            {
                return (false, false, null);
            }
        }
    }
}
