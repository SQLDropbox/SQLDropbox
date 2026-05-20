using Microsoft.AspNetCore.Mvc;
using SQLDropbox.Enums;
using SQLDropbox.Helpers;

namespace SQLDropbox.Controllers
{
    public class BaseController : ControllerBase
    {
        protected Guid? GetUserId()
        {
            var result = AuthHelper.GetUserClaims(this);
            if (result.Result != null) return null;
            return (result.Value.id);
        }

        protected Role? GetUserRole()
        {
            var result = AuthHelper.GetUserClaims(this);
            if (result.Result != null) return null;
            return result.Value.role;
        }
    }
}
