using System.Text.Json.Serialization;

namespace Chats.BE.Services.Keycloak;

public record MtlsEndpointAliases
{
    [JsonPropertyName("token_endpoint")]
    public string? TokenEndpoint { get; init; }

    [JsonPropertyName("revocation_endpoint")]
    public string? RevocationEndpoint { get; init; }

    [JsonPropertyName("introspection_endpoint")]
    public string? IntrospectionEndpoint { get; init; }

    [JsonPropertyName("device_authorization_endpoint")]
    public string? DeviceAuthorizationEndpoint { get; init; }

    [JsonPropertyName("registration_endpoint")]
    public string? RegistrationEndpoint { get; init; }

    [JsonPropertyName("userinfo_endpoint")]
    public string? UserinfoEndpoint { get; init; }

    [JsonPropertyName("pushed_authorization_request_endpoint")]
    public string? PushedAuthorizationRequestEndpoint { get; init; }

    [JsonPropertyName("backchannel_authentication_endpoint")]
    public string? BackchannelAuthenticationEndpoint { get; init; }
}