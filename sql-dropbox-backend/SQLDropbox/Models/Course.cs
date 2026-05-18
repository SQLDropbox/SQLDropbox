using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Course")]
    public class Course
    {
        [Key]
        public required string CourseId { get; set; }
        public string? CourseNameNL { get; set; }
        public string? CourseNameEN { get; set; }
        public string? CourseDescriptionNL { get; set; }
        public string? CourseDescriptionEN { get; set; }
        public bool IsActive { get; set; }
        public string? Lecturer { get; set; }

        public ICollection<Chapter> Chapters { get; set; } = [];
        [JsonIgnore]
        public ICollection<Lecturer> Lecturers { get; set; } = [];
        [JsonIgnore]
        public ICollection<Student> Students { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}