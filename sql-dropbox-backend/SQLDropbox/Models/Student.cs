using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Student")]
    public class Student
    {
        [Key]
        public Guid StudentId { get; set; }
        public required string StudentCode { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public required string Email { get; set; }
        public string? Password { get; set; }
        //public int? Year { get; set; }
        //public string? Group { get; set; }

        public ICollection<Course> Courses { get; set; } = [];
        public ICollection<StudentExercise> StudentExercises { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}