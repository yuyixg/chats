namespace Chats.BE.Controllers.Auth;

public record KeycloakSignInRequest(string CsrfToken, string CallbackUrl);