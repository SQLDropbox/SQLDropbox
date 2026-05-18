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
        [Required(ErrorMessage = "Student code is mandatory.")]
        [StringLength(8, ErrorMessage = "Student code must be 8 digits long.")]
        public string StudentCode { get; set; } = string.Empty;
        [Required(ErrorMessage = "Student name is mandatory.")]
        public string FullName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Year is mandatory.")]
        [Range(2025, 2050, ErrorMessage = "Fill in a valid year.")]
        public int Year { get; set; }
        [Required(ErrorMessage = "Group is mandatory.")]
        public string Group { get; set; } = string.Empty;
        //public required string Password { get; set; }

        [JsonIgnore]
        public Course? Course { get; set; }
        public ICollection<StudentExercise> StudentExercises { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}