using Chats.BE.Controllers.Public.AccountLogin.Dtos;
using Chats.BE.DB;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace Chats.BE.Services.Sessions;

public class SessionManager(JwtKeyManager jwtKeyManager)
{
    private const string ValidIssuer = "chats";
    private const string ValidAudience = "chats";
    private static readonly TimeSpan ValidPeriod = TimeSpan.FromHours(8);

    public async Task<SessionEntry> GetCachedUserInfoBySession(string jwt, CancellationToken cancellationToken = default)
    {
        ClaimsPrincipal claims = ValidateJwt(jwt, await GetSecurityKey(cancellationToken));
        return SessionEntry.FromClaims(claims);
    }

    private static ClaimsPrincipal ValidateJwt(string jwt, SecurityKey signingKey)
    {
        // 创建一个令牌验证参数对象
        TokenValidationParameters validationParameters = new()
        {
            ValidateIssuer = true,              // 验证发行者
            ValidIssuer = ValidIssuer,          // 设置有效的发行者

            ValidateAudience = true,            // 验证受众
            ValidAudience = ValidAudience,      // 设置有效的受众

            ValidateIssuerSigningKey = true,    // 验证签名密钥
            IssuerSigningKey = signingKey,      // 设置用于验证签名的密钥

            ValidateLifetime = true,            // 验证令牌的生存期
            ClockSkew = TimeSpan.FromSeconds(3) // 设置时钟偏移为3秒
        };

        // 创建一个 JwtSecurityTokenHandler 实例
        JwtSecurityTokenHandler handler = new();

        // 调用 ValidateToken 方法来验证令牌
        ClaimsPrincipal principal = handler.ValidateToken(jwt, validationParameters, out _);
        return principal; // 验证成功，返回 ClaimsPrincipal
    }

    internal static byte[] Pdkdf2StringToByte32(string input)
    {
        byte[] salt = new byte[16];
        return new Rfc2898DeriveBytes(input, salt, 10000, HashAlgorithmName.SHA256).GetBytes(32);
    }

    private async Task<SymmetricSecurityKey> GetSecurityKey(CancellationToken cancellationToken) => new(Pdkdf2StringToByte32(await jwtKeyManager.GetOrCreateSecretKey(cancellationToken)));

    public async Task<LoginResponse> GenerateSessionForUser(User user, CancellationToken cancellationToken)
    {
        SigningCredentials cred = new(await GetSecurityKey(cancellationToken), SecurityAlgorithms.HmacSha256);
        SessionEntry sessionEntry = new()
        {
            UserId = user.Id,
            UserName = user.Username,
            Role = user.Role,
            Sub = user.Sub,
            Provider = user.Provider
        };
        JwtSecurityToken token = new(
            issuer: ValidIssuer,
            audience: ValidAudience,
            claims: sessionEntry.ToClaims(),
            expires: DateTime.UtcNow.Add(ValidPeriod),
            signingCredentials: cred);

        string jwt = new JwtSecurityTokenHandler().WriteToken(token);
        bool hasPayService = false;
        return new LoginResponse
        {
            SessionId = jwt,
            UserName = user.Username,
            Role = user.Role,
            CanReCharge = hasPayService,
        };
    }
}
