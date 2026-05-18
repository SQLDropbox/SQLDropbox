using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models
{
    [Table("Lecturer")]
    public class Lecturer
    {
        [Key]
        public required string LecturerCode { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public required string Password { get; set; }

        public ICollection<Course> Courses { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
