using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SQLDropbox.Models
{
    [Table("Admin")]
    public class Admin
    {
        [Key]
        public Guid AdminId { get; set; }
        public required string Name { get; set; }
        public required string Password { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
