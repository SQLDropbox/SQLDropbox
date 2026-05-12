using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SQLDropbox.Models;

public class Exercise
{
    public int ExerciseId {get; set;}
    public string QuestionNl {get; set;} = string.Empty;
    public string QuestionEN {get; set;}  = string.Empty;
    public string HintNl {get; set;}
    public string HintEN {get; set;}
    public ICollection<Solution> Solutions { get; set; } = new List<Solution>();
    public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
    
    [Required]
    public DateTime CreatedAt {get; set;}
    public DateTime? UpdatedAt {get; set;}
    public DateTime? DeletedAt {get; set;}
}