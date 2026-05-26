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
    private readonly PasswordService _passwordService = passwordService;
    private readonly JwtService _jwtService = jwtService;
    private readonly RefreshTokenService _refreshTokenService = refreshTokenService;


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

                string accessToken = _jwtService.GenerateAccessToken(user);
                string refreshToken = _refreshTokenService.GenerateRefreshToken();
                RefreshToken validRefreshToken = await _refreshTokenService.CreateRefreshToken(user, HttpContext.Connection.RemoteIpAddress!.ToString(), refreshToken);

                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, //true,
                    SameSite = SameSiteMode.None,
                    Expires = validRefreshToken.ExpiresAt,
                    Path = "/auth"
                });

                return Ok(new { token = accessToken });
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

                string accessToken = _jwtService.GenerateAccessToken(user);
                string refreshToken = _refreshTokenService.GenerateRefreshToken();
                RefreshToken validRefreshToken = await _refreshTokenService.CreateRefreshToken(user, HttpContext.Connection.RemoteIpAddress!.ToString(), refreshToken);

                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, //true,
                    SameSite = SameSiteMode.None,
                    Expires = validRefreshToken.ExpiresAt,
                    Path = "/auth"
                });

                return Ok(new { token = accessToken });
            }

            return BadRequest("Incorrect credentials.");
        }
        catch (Exception)
        {
            return BadRequest("Incorrect credentials.");
        }
    }

    [HttpGet("refresh")]
    public async Task<ActionResult> Refresh()
    {
        string? refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null)
            return Unauthorized();

        RefreshToken? oldRefreshToken = await _refreshTokenService.ValidateRefreshToken(refreshToken);
        if (oldRefreshToken == null)
            return Unauthorized();

        await _refreshTokenService.RevokeRefreshToken(oldRefreshToken);

        string newAccessToken = _jwtService.GenerateAccessToken(oldRefreshToken.User);
        string newRefreshToken = _refreshTokenService.GenerateRefreshToken();
        RefreshToken newValidRefreshToken = await _refreshTokenService.CreateRefreshToken(oldRefreshToken.User, HttpContext.Connection.RemoteIpAddress!.ToString(), newRefreshToken);

        Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, //true,
            SameSite = SameSiteMode.None,
            Expires = newValidRefreshToken.ExpiresAt,
            Path = "/auth"
        });

        return Ok(new { token = newAccessToken });
    }

    [HttpGet("logout")]
    public async Task<ActionResult> Logout()
    {
        string? refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null)
            return Unauthorized();

        RefreshToken? oldRefreshToken = await _refreshTokenService.ValidateRefreshToken(refreshToken);
        if (oldRefreshToken == null)
            return Unauthorized();

        await _refreshTokenService.RevokeRefreshToken(oldRefreshToken);

        return Ok(new { Message = "Successfully logged out" });
    }
}
