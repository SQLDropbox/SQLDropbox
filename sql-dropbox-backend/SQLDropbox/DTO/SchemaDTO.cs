using System.ComponentModel.DataAnnotations;

namespace SQLDropbox.DTO
{
    public class SchemaDTO
    {
        [Required]
        public string SchemaName { get; set; } = null!;
        public IFormFile? Image { get; set; }
    }
}