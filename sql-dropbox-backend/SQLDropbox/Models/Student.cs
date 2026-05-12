using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models;

[Table("Student")]
public class Student
{
    [Key]
    public Guid StudentId { get; set; }
    
    [Required(ErrorMessage = "Student code is mandatory.")]
    [StringLength(8, ErrorMessage =  "Student code must be 8 digits long.")]
    public string StudentCode {get; set;} = string.Empty;
    
    [Required(ErrorMessage = "Student name is mandatory.")]
    [StringLength(20, MinimumLength = 2, ErrorMessage = "Student name must be between 2 and 20 characters long.")]
    public string FullName {get; set;} = string.Empty;
    
    [Required(ErrorMessage = "Year is mandatory.")]
    [Range(1900, 2100, ErrorMessage = "Fill in a valid year.")]
    public int Year {get; set;}
    
    [Required(ErrorMessage = "Group is mandatory.")]
    [StringLength(20, MinimumLength = 2, ErrorMessage = "Group name must be between 2 and 20 characters long.")]
    public string Group {get; set;} = string.Empty;
    
    [Required]
    public DateTime CreatedAt {get; set;} = DateTime.Now;
    
    public DateTime? UpdatedAt {get; set;}
    
    public DateTime? DeletedAt {get; set;}
}