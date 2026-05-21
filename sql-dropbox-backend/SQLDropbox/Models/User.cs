using SQLDropbox.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models
{
    [Table("User")]
    public class User
    {
        [Key]
        public Guid UserId { get; set; }
        public string? UserCode { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public required string Email { get; set; }
        public string? Password { get; set; }
        public required Role Role { get; set; }

        public ICollection<Course> LecturerCourses { get; set; } = [];
        public ICollection<Course> StudentCourses { get; set; } = [];
        public ICollection<UserExercise> UserExercises { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
