using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.GlobalConfigs.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.GlobalConfigs;

[AuthorizeAdmin, Route("api/version")]
public class VersionController : ControllerBase
{
    const int buildVersion = 0;

    [HttpGet]
    public ActionResult<int> GetCurrentVersion()
    {
        return Ok(buildVersion);
    }

    [HttpPost("check-update")]
    public async Task<ActionResult<CheckUpdateResponse>> CheckUpdate(CancellationToken cancellationToken)
    {
        string tagName = await GitHubReleaseChecker.SdcbChats.GetLatestReleaseTagNameAsync(cancellationToken);
        bool hasNewVersion = GitHubReleaseChecker.IsNewVersionAvailableAsync(tagName, buildVersion);
        return Ok(new CheckUpdateResponse
        {
            CurrentVersion = buildVersion,
            HasNewVersion = hasNewVersion,
            TagName = tagName,
        });
    }
}
