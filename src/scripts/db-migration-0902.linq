<Query Kind="Program">
  <Namespace>System.Text.Json.Serialization</Namespace>
  <Namespace>System.Text.Json</Namespace>
  <Namespace>Microsoft.EntityFrameworkCore.Storage</Namespace>
</Query>

void Main()
{
	ResetTablesAndIdentity();

	GuidInt64Mapping balanceLogIds = new();
	foreach (Guid id in BalanceLogs.Select(x => x.Id))
	{
		balanceLogIds.MapGuid(id);
	}

	GuidInt32Mapping chatsIds = new();
	foreach (Guid id in Chats.Select(x => x.Id))
	{
		chatsIds.MapGuid(id);
	}

	GuidInt64Mapping messageIds = new();
	foreach (Guid id in ChatMessages.Select(x => x.Id))
	{
		messageIds.MapGuid(id);
	}

	Dictionary<Guid, Guid> messageBalanceMap = BalanceLogs
		.Where(x => x.MessageId != null)
		.ToDictionary(k => k.MessageId!.Value, v => v.Id);

	Dictionary<Guid, Guid> userDefaultModelId = GetUserDefaultChatModelId();

	using (IDbContextTransaction tran = Database.BeginTransaction())
	using (var _ = new IdentityInsertScope(this))
	{
		foreach (BalanceLogs b in BalanceLogs.AsNoTracking())
		{
			TransactionLogs.Add(new TransactionLog()
			{
				Id = balanceLogIds.MapGuid(b.Id), 
				Amount = b.Value
			});
		}
		foreach (Chats c in Chats.Include(x => x.ChatMessages).AsNoTracking())
		{
			JsonUserModelConfig userModelConfig = JsonSerializer.Deserialize<JsonUserModelConfig>(c.UserModelConfig)!;
			Conversations.Add(new Conversation()
			{
				Id = chatsIds.MapGuid(c.Id),
				ChatModelId = c.ChatModelId ?? userDefaultModelId[c.UserId],
				CreatedAt = c.CreatedAt,
				Temperature = userModelConfig.Temperature,
				EnableSearch = userModelConfig.EnableSearch,
				IsDeleted = c.IsDeleted,
				IsShared = c.IsShared,
				Title = c.Title,
				UserId = c.UserId,
				Messages = c.ChatMessages.Select(ConvertMessage).ToList(),
			});
		}
		
		SaveChanges();
		tran.Commit();
	}

	Message ConvertMessage(ChatMessages msg)
	{
		return new Message()
		{
			Id = messageIds.MapGuid(msg.Id),
			ChatRoleId = msg.Role switch
			{
				"system" => 1,
				"user" => 2,
				"assistant" => 3,
				_ => throw new NotImplementedException(),
			},
			ConversationId = chatsIds.MapGuid(msg.ChatId),
			CreatedAt = msg.CreatedAt,
			ParentId = msg.ParentId != null ? messageIds.MapGuid(msg.ParentId.Value) : null,
			UserId = msg.UserId,
			MessageResponse = msg.ChatModelId != null ? new MessageResponse()
			{
				ChatModelId = msg.ChatModelId.Value,
				DurationMs = msg.Duration,
				InputCost = msg.InputPrice,
				InputTokenCount = msg.InputTokens,
				MessageId = messageIds.MapGuid(msg.Id),
				OutputCost = msg.OutputPrice,
				OutputTokenCount = msg.OutputTokens,
				TransactionLogId = balanceLogIds.MapGuid(messageBalanceMap[msg.Id]), 
			} : null, 
			MessageContents = MakeContents(msg.Messages), 
		};
	}
	
	List<MessageContent> MakeContents(string message)
	{
		MessageContentDto dto = JsonSerializer.Deserialize<MessageContentDto>(message)!;
		return 
		[
			new MessageContent { ContentTypeId = (byte)DBMessageContentType.Text, Content = Encoding.Unicode.GetBytes(dto.Text) },
			..(dto.Image ?? []).Select(x => new MessageContent()
			{
				ContentTypeId = (byte)DBMessageContentType.ImageUrl, 
				Content = Encoding.UTF8.GetBytes(x), 
			})
		];
	}
}

Dictionary<Guid, Guid> GetUserDefaultChatModelId()
{
	HashSet<Guid> availableModels = ChatModels
		.OrderBy(x => x.Rank)
		.Where(x => x.Enabled)
		.Select(x => x.Id)
		.ToHashSet();

	return UserModels
		.Select(x => new { x.UserId, x.Models })
		.AsEnumerable()
		.ToDictionary(k => k.UserId, v => JsonSerializer.Deserialize<JsonTokenBalance[]>(v.Models)!
			.Select(x => x.ModelId)
			.Where(x => availableModels.Contains(x))
			.First());
}

void ResetTablesAndIdentity()
{
	using (IDbContextTransaction tran = Database.BeginTransaction())
	{
		try
		{
			// 清空表数据并重置自增 ID
			string resetTablesSql = @"
                DELETE FROM [dbo].[Conversation]; DBCC CHECKIDENT ('[dbo].[Conversation]', RESEED, 0);
                DELETE FROM [dbo].[Message]; DBCC CHECKIDENT ('[dbo].[Message]', RESEED, 0);
                DELETE FROM [dbo].[TransactionLog]; DBCC CHECKIDENT ('[dbo].[TransactionLog]', RESEED, 0);
                DELETE FROM [dbo].[MessageContent]; DBCC CHECKIDENT ('[dbo].[MessageContent]', RESEED, 0);
            ";

			Database.ExecuteSqlRaw(resetTablesSql);

			// 提交事务
			tran.Commit();
		}
		catch
		{
			// 回滚事务
			tran.Rollback();
			throw;
		}
	}
}

public class IdentityInsertScope : IDisposable
{
	private readonly DbContext _context;
	private readonly List<string> _tables = new List<string> { "Conversation", "Message", "TransactionLog", "MessageContent" };

	public IdentityInsertScope(DbContext context)
	{
		_context = context;

		// 开启每个表的 IDENTITY_INSERT
		foreach (var table in _tables)
		{
			_context.Database.ExecuteSqlRaw($"SET IDENTITY_INSERT [dbo].[{table}] ON");
		}
	}

	public void Dispose()
	{
		// 关闭每个表的 IDENTITY_INSERT
		foreach (var table in _tables)
		{
			_context.Database.ExecuteSqlRaw($"SET IDENTITY_INSERT [dbo].[{table}] OFF");
		}
	}
}

public class GuidInt32Mapping
{
	int _nextId = 1;
	Dictionary<Guid, int> _mapping = new();

	public int MapGuid(Guid guid)
	{
		if (_mapping.TryGetValue(guid, out int id))
		{
			return id;
		}
		else
		{
			int newId = _nextId++; ;
			_mapping[guid] = newId;
			return newId;
		}
	}
}

public class GuidInt64Mapping
{
	long _nextId = 1;
	Dictionary<Guid, long> _mapping = new();

	public long MapGuid(Guid guid)
	{
		if (_mapping.TryGetValue(guid, out long id))
		{
			return id;
		}
		else
		{
			long newId = _nextId++; ;
			_mapping[guid] = newId;
			return newId;
		}
	}
}

public record JsonTokenBalance
{
	[JsonPropertyName("modelId")]
	public required Guid ModelId { get; init; }

	[JsonPropertyName("tokens"), JsonConverter(typeof(NumberToStringConverter))]
	public required string Tokens { get; init; }

	[JsonPropertyName("counts"), JsonConverter(typeof(NumberToStringConverter))]
	public required string Counts { get; init; }

	[JsonPropertyName("expires")]
	public required string Expires { get; init; }

	[JsonPropertyName("enabled")]
	public required bool Enabled { get; init; }
}

public class NumberToStringConverter : JsonConverter<string>
{
	public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
	{
		if (reader.TokenType == JsonTokenType.Number)
		{
			return reader.GetInt32().ToString();
		}
		else if (reader.TokenType == JsonTokenType.String)
		{
			return reader.GetString()!;
		}
		else
		{
			throw new JsonException($"Unsupported token type: {reader.TokenType}");
		}
	}

	public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
	{
		writer.WriteStringValue(value);
	}
}

public record JsonUserModelConfig
{
	[JsonPropertyName("temperature"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
	public float? Temperature { get; init; }

	[JsonPropertyName("enableSearch"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
	public bool? EnableSearch { get; init; }
}

public record MessageContentDto
{
	[JsonPropertyName("text")]
	public required string Text { get; init; }

	[JsonPropertyName("image"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
	public List<string>? Image { get; init; }
}

public enum DBMessageContentType : byte
{
	Text = 1,
	ImageUrl = 2,
}
