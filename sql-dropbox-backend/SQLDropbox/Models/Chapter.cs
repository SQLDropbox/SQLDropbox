using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models;

public enum DbSchemaType
{
    Standard,
    Advanced,
    Custom
}

[Table("Chapter")]
public class Chapter
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ChapterId { get; set; }
    public string ChapterNameNL { get; set; } = string.Empty;
    public string ChapterNameEN { get; set; }  = string.Empty;
    public string ChapterDescriptionNL { get; set; }  = string.Empty;
    public string ChapterDescriptionEN { get; set; }   = string.Empty;
    public DbSchemaType DbSchema { get; set; }

    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
    
    [Required]
    public DateTime CreatedAt {get; set;}
    public DateTime? UpdatedAt {get; set;}
    public DateTime? DeletedAt {get; set;}

}