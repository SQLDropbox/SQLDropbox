using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Enums;
using System.Security.Claims;

namespace SQLDropbox.Helpers
{
    public class AuthHelper
    {
        public static ActionResult<(Guid id, Role role)> GetUserClaims(ControllerBase controller)
        {
            ClaimsPrincipal user = controller.HttpContext.User;

            if (!user.Identity?.IsAuthenticated ?? false)
                return controller.Unauthorized();

            string? idClaim = user.FindFirst("id")?.Value;
            string? roleClaim = user.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(idClaim) || string.IsNullOrEmpty(roleClaim))
                return controller.Unauthorized();
            if (!Guid.TryParse(idClaim, out Guid id))
                return controller.Unauthorized();
            if (!Enum.TryParse<Role>(roleClaim, true, out var role))
                return controller.Unauthorized();

            return (id, role);
        }
    }
}
