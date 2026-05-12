using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models
{
    [Table("Course")]
    public class Course
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CourseId { get; set; }
        public string? CourseNameNL { get; set; }
        public string? CourseNameEN { get; set; }
        public string? CourseDescriptionNL { get; set; }
        public string? CourseDescriptionEN { get; set; }
        public DateTime? Deadline { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Student> Students { get; set; } = [];
        public ICollection<Chapter> Chapters { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}