namespace SQLDropbox.DTO;

public class CreateLecturerDTO
{
    public required string UserCode { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
}