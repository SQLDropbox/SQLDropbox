using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Data;
using SQLDropbox.Models;
using System.Data;

namespace SQLDropbox.Services
{
    public class UserService(AppDbContext db) : ControllerBase
    {
        private readonly AppDbContext _db = db;

        public async Task<Student> CreateStudentAsync(string studentCode, string email)
        {
            if (string.IsNullOrEmpty(studentCode) || string.IsNullOrEmpty(email))
                throw new ArgumentException("Student code and Email are required.");

            Student newStudent = new()
            {
                StudentCode = studentCode,
                Email = email,
                CreatedAt = DateTime.UtcNow
            };           
           
            var entity = _db.Students.Add(newStudent);
            await _db.SaveChangesAsync();
            return entity.Entity;
        }
    }
}
