using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Public.Sms;

[Route("api/public/sms")]
public class SmsController(ChatsDB db) : ControllerBase
{

}
