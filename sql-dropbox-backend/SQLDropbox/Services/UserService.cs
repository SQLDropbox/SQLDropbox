using SQLDropbox.Data;
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
    }
}
