using System.Text.Json.Serialization;

namespace Chats.BE.Services.Keycloak;

public record KeycloakOAuthConfig
{
    [JsonPropertyName("issuer")]
    public required string Issuer { get; init; }

    [JsonPropertyName("authorization_endpoint")]
    public required string AuthorizationEndpoint { get; init; }

    [JsonPropertyName("token_endpoint")]
    public required string TokenEndpoint { get; init; }

    [JsonPropertyName("introspection_endpoint")]
    public required string IntrospectionEndpoint { get; init; }

    [JsonPropertyName("userinfo_endpoint")]
    public required string UserinfoEndpoint { get; init; }

    [JsonPropertyName("end_session_endpoint")]
    public string? EndSessionEndpoint { get; init; }

    [JsonPropertyName("frontchannel_logout_session_supported")]
    public bool? FrontchannelLogoutSessionSupported { get; init; }

    [JsonPropertyName("frontchannel_logout_supported")]
    public bool? FrontchannelLogoutSupported { get; init; }

    [JsonPropertyName("jwks_uri")]
    public required string JwksUri { get; init; }

    [JsonPropertyName("check_session_iframe")]
    public string? CheckSessionIframe { get; init; }

    [JsonPropertyName("grant_types_supported")]
    public required string[] GrantTypesSupported { get; init; }

    [JsonPropertyName("acr_values_supported")]
    public string[]? AcrValuesSupported { get; init; }

    [JsonPropertyName("response_types_supported")]
    public required string[] ResponseTypesSupported { get; init; }

    [JsonPropertyName("subject_types_supported")]
    public required string[] SubjectTypesSupported { get; init; }

    [JsonPropertyName("id_token_signing_alg_values_supported")]
    public required string[] IdTokenSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("id_token_encryption_alg_values_supported")]
    public string[]? IdTokenEncryptionAlgValuesSupported { get; init; }

    [JsonPropertyName("id_token_encryption_enc_values_supported")]
    public string[]? IdTokenEncryptionEncValuesSupported { get; init; }

    [JsonPropertyName("userinfo_signing_alg_values_supported")]
    public string[]? UserinfoSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("userinfo_encryption_alg_values_supported")]
    public string[]? UserinfoEncryptionAlgValuesSupported { get; init; }

    [JsonPropertyName("userinfo_encryption_enc_values_supported")]
    public string[]? UserinfoEncryptionEncValuesSupported { get; init; }

    [JsonPropertyName("request_object_signing_alg_values_supported")]
    public string[]? RequestObjectSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("request_object_encryption_alg_values_supported")]
    public string[]? RequestObjectEncryptionAlgValuesSupported { get; init; }

    [JsonPropertyName("request_object_encryption_enc_values_supported")]
    public string[]? RequestObjectEncryptionEncValuesSupported { get; init; }

    [JsonPropertyName("response_modes_supported")]
    public required string[] ResponseModesSupported { get; init; }

    [JsonPropertyName("registration_endpoint")]
    public string? RegistrationEndpoint { get; init; }

    [JsonPropertyName("token_endpoint_auth_methods_supported")]
    public required string[] TokenEndpointAuthMethodsSupported { get; init; }

    [JsonPropertyName("token_endpoint_auth_signing_alg_values_supported")]
    public string[]? TokenEndpointAuthSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("introspection_endpoint_auth_methods_supported")]
    public string[]? IntrospectionEndpointAuthMethodsSupported { get; init; }

    [JsonPropertyName("introspection_endpoint_auth_signing_alg_values_supported")]
    public string[]? IntrospectionEndpointAuthSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("authorization_signing_alg_values_supported")]
    public string[]? AuthorizationSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("authorization_encryption_alg_values_supported")]
    public string[]? AuthorizationEncryptionAlgValuesSupported { get; init; }

    [JsonPropertyName("authorization_encryption_enc_values_supported")]
    public string[]? AuthorizationEncryptionEncValuesSupported { get; init; }

    [JsonPropertyName("claims_supported")]
    public required string[] ClaimsSupported { get; init; }

    [JsonPropertyName("claim_types_supported")]
    public required string[] ClaimTypesSupported { get; init; }

    [JsonPropertyName("claims_parameter_supported")]
    public bool? ClaimsParameterSupported { get; init; }

    [JsonPropertyName("scopes_supported")]
    public required string[] ScopesSupported { get; init; }

    [JsonPropertyName("request_parameter_supported")]
    public bool? RequestParameterSupported { get; init; }

    [JsonPropertyName("request_uri_parameter_supported")]
    public bool? RequestUriParameterSupported { get; init; }

    [JsonPropertyName("require_request_uri_registration")]
    public bool? RequireRequestUriRegistration { get; init; }

    [JsonPropertyName("code_challenge_methods_supported")]
    public string[]? CodeChallengeMethodsSupported { get; init; }

    [JsonPropertyName("tls_client_certificate_bound_access_tokens")]
    public bool? TlsClientCertificateBoundAccessTokens { get; init; }

    [JsonPropertyName("revocation_endpoint")]
    public string? RevocationEndpoint { get; init; }

    [JsonPropertyName("revocation_endpoint_auth_methods_supported")]
    public string[]? RevocationEndpointAuthMethodsSupported { get; init; }

    [JsonPropertyName("revocation_endpoint_auth_signing_alg_values_supported")]
    public string[]? RevocationEndpointAuthSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("backchannel_logout_supported")]
    public bool? BackchannelLogoutSupported { get; init; }

    [JsonPropertyName("backchannel_logout_session_supported")]
    public bool? BackchannelLogoutSessionSupported { get; init; }

    [JsonPropertyName("device_authorization_endpoint")]
    public string? DeviceAuthorizationEndpoint { get; init; }

    [JsonPropertyName("backchannel_token_delivery_modes_supported")]
    public string[]? BackchannelTokenDeliveryModesSupported { get; init; }

    [JsonPropertyName("backchannel_authentication_endpoint")]
    public string? BackchannelAuthenticationEndpoint { get; init; }

    [JsonPropertyName("backchannel_authentication_request_signing_alg_values_supported")]
    public string[]? BackchannelAuthenticationRequestSigningAlgValuesSupported { get; init; }

    [JsonPropertyName("require_pushed_authorization_requests")]
    public bool? RequirePushedAuthorizationRequests { get; init; }

    [JsonPropertyName("pushed_authorization_request_endpoint")]
    public string? PushedAuthorizationRequestEndpoint { get; init; }

    [JsonPropertyName("mtls_endpoint_aliases")]
    public MtlsEndpointAliases? MtlsEndpointAliases { get; init; }

    [JsonPropertyName("authorization_response_iss_parameter_supported")]
    public bool? AuthorizationResponseIssParameterSupported { get; init; }
}
