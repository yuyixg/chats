using Chats.BE.Controllers.Auth.Dtos;
using Chats.BE.Services;
using Chats.BE.Services.Keycloak;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Auth;

[Route("api/auth/signin/keycloak")]
public class KeycloakController(CsrfTokenService csrf, KeycloakConfigStore kcStore) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SignIn(KeycloakSigninRequest req, CancellationToken cancellationToken)
    {
        if (!csrf.VerifyToken(req.CsrfToken))
        {
            return BadRequest("Invalid CSRF token");
        }

        KeycloakConfig? config = await kcStore.GetKeycloakConfig(cancellationToken);
        if (config == null)
        {
            return NotFound("Keycloak config not found");
        }

        string keycloakRedirectUrl = await config.GenerateLoginUrl(req.CallbackUrl, cancellationToken);
        return Redirect(keycloakRedirectUrl);
    }
}
