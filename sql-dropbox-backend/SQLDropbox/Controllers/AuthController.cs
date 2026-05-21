using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;
using Watchlist_Backend.DTOs;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db, PasswordService passwordService, JwtService jwtService) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _passwordService = passwordService;
    private readonly JwtService _jwtService = jwtService;


    [HttpGet("setup/{userId}")]
    public async Task<ActionResult> GetAccountSetup(string userId)
    {
        if (!Guid.TryParse(userId, out Guid guid))
            return BadRequest("Not a valid setup code.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == guid);
        if (user != null)
        {
            if (user.Password != null) return BadRequest("This account is already set up.");
            return Ok(new { type = user.Role.ToString(), userId = user.UserCode, firstName = user.FirstName });
        }

        return NotFound("This Account does not exist.");
    }

    [HttpPost("setup")]
    public async Task<ActionResult> SetupAccount(SetupDTO dto)
    {
        try
        {
            if (!Guid.TryParse(dto.Guid, out Guid guid))
                return BadRequest("Not a valid setup code.");

            User? user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == guid);
            if (user != null)
            {
                if (user.Password != null)
                    return BadRequest("This account is already set up.");

                string hashedPassword = _passwordService.HashPassword(dto.Password);
                user.Password = hashedPassword;
                _db.Users.Update(user);

                await _db.SaveChangesAsync();
                return Ok(new { token = _jwtService.GenerateAccessToken(user.UserId, user.UserCode!, user.FirstName!, user.LastName!, user.Role) });
            }

            return NotFound("This account does not exist.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDTO dto)
    {
        try
        {
            if (dto.EmailOrCode == null || dto.Password == null)
                return BadRequest("Email or code and password are required.");

            User? user = dto.EmailOrCode.Contains('@') ?
                await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.EmailOrCode.ToLower()) :
                await _db.Users.FirstOrDefaultAsync(u => u.UserCode!.ToLower() == dto.EmailOrCode.ToLower());

            if (user != null)
            {
                if (user.Password == null)
                    return BadRequest("This account has not yet been setup, please refer to the mail you received to do this.");

                if (!_passwordService.ValidatePassword(user.Password, dto.Password))
                    return BadRequest("Incorrect credentials.");

                return Ok(new { token = _jwtService.GenerateAccessToken(user.UserId, user.UserCode, user.FirstName, user.LastName, user.Role) });
            }

            return BadRequest("Incorrect credentials.");
        }
        catch (Exception)
        {
            return BadRequest("Incorrect credentials.");
        }
    }
}
