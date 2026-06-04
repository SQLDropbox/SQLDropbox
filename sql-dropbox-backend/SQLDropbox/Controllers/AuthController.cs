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
public class AuthController(AppDbContext db, PasswordService passwordService, JwtService jwtService, RefreshTokenService refreshTokenService) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly PasswordService _pS = passwordService;
    private readonly JwtService _jwtS = jwtService;
    private readonly RefreshTokenService _rtS = refreshTokenService;


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
                
                dto.Password = dto.Password.Trim();

                string hashedPassword = _pS.HashPassword(dto.Password);
                user.Password = hashedPassword;

                _db.Users.Update(user);
                await _db.SaveChangesAsync();

                string accessToken = _jwtS.GenerateAccessToken(user);
                string refreshToken = _rtS.GenerateRefreshToken();
                RefreshToken validRefreshToken = await _rtS.CreateRefreshToken(user, HttpContext.Connection.RemoteIpAddress!.ToString(), refreshToken);

                _rtS.AttachCookie(Response, refreshToken, validRefreshToken.ExpiresAt);

                return Ok(new { token = accessToken });
            }

            return NotFound(new { message = "This account does not exist." });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Error occured during account setup." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDTO dto)
    {
        try
        {
            if (dto.EmailOrCode == null || dto.Password == null)
                return BadRequest("Email or code and password are required.");

            dto.EmailOrCode = dto.EmailOrCode.Trim();
            dto.Password = dto.Password.Trim();

            User? user = dto.EmailOrCode.Contains('@') ?
                await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.EmailOrCode.ToLower()) :
                await _db.Users.FirstOrDefaultAsync(u => u.UserCode.ToLower() == dto.EmailOrCode.ToLower());

            if (user != null)
            {
                if (user.Password == null)
                    return BadRequest("This account has not yet been setup, please refer to the mail you received to do this.");

                if (!_pS.ValidatePassword(user.Password, dto.Password))
                    return BadRequest("Incorrect credentials.");

                string accessToken = _jwtS.GenerateAccessToken(user);
                string refreshToken = _rtS.GenerateRefreshToken();
                RefreshToken validRefreshToken = await _rtS.CreateRefreshToken(user, HttpContext.Connection.RemoteIpAddress!.ToString(), refreshToken);

                _rtS.AttachCookie(Response, refreshToken, validRefreshToken.ExpiresAt);

                return Ok(new { token = accessToken });
            }

            return BadRequest(new { message = "Incorrect credentials." });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Incorrect credentials." });
        }
    }

    [HttpGet("refresh")]
    public async Task<ActionResult> Refresh()
    {
        try
        {
            string? refreshToken = Request.Cookies["refreshToken"];
            if (refreshToken == null)
                return Unauthorized();

            RefreshToken? oldRefreshToken = await _rtS.ValidateRefreshToken(refreshToken);
            if (oldRefreshToken == null || oldRefreshToken.User == null)
                return Unauthorized();

            await _rtS.RevokeRefreshToken(oldRefreshToken);

            string newAccessToken = _jwtS.GenerateAccessToken(oldRefreshToken.User);
            string newRefreshToken = _rtS.GenerateRefreshToken();
            RefreshToken newValidRefreshToken = await _rtS.CreateRefreshToken(oldRefreshToken.User, HttpContext.Connection.RemoteIpAddress!.ToString(), newRefreshToken);

            _rtS.AttachCookie(Response, newRefreshToken, newValidRefreshToken.ExpiresAt);

            return Ok(new { token = newAccessToken });
        }
        catch
        {
            return BadRequest(new { message = "Error occured refreshing" });
        }
    }

    [HttpGet("logout")]
    public async Task<ActionResult> Logout()
    {
        try
        {
            string? refreshToken = Request.Cookies["refreshToken"];
            if (refreshToken == null)
                return Unauthorized();

            RefreshToken? oldRefreshToken = await _rtS.ValidateRefreshToken(refreshToken);
            if (oldRefreshToken != null)
                await _rtS.RevokeRefreshToken(oldRefreshToken);

            _rtS.RemoveCookie(Response);

            return Ok(new { Message = "Successfully logged out" });
        }
        catch
        {
            return BadRequest(new { message = "Error occured logging out" });
        }
    }
}
