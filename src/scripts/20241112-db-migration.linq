<Query Kind="Program">
  <Connection>
    <ID>0397d1ca-d774-43d2-965d-8797d2cc52f1</ID>
    <NamingServiceVersion>2</NamingServiceVersion>
    <Persist>true</Persist>
    <Driver Assembly="(internal)" PublicKeyToken="no-strong-name">LINQPad.Drivers.EFCore.DynamicDriver</Driver>
    <AllowDateOnlyTimeOnly>true</AllowDateOnlyTimeOnly>
    <Server>home.starworks.cc,37965</Server>
    <SqlSecurity>true</SqlSecurity>
    <UserName>sa</UserName>
    <Password>AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAVbvrs6Jk5ESNEegA7jfNnwAAAAACAAAAAAAQZgAAAAEAACAAAABBe4Cv13ASn/ipSipWlPY2mowD6zfbngQJ+Z3+KTcGVAAAAAAOgAAAAAIAACAAAABMtXPZtcXWRzq2o3sHXx1+BVuNY62ubQdNn8IrSrXSxiAAAADcCHwb5SZfaPyiOsqcpFEU4/Lnue6fZBOLd4rAOBXt0UAAAADS65U3H6M+54aUZec9Yj/zdoSeT/Jb3S4gVVhk51Sje3lBRb4jCfUa42pVHALQoRPrtMP5lJSaJ/hB6XoT2mV6</Password>
    <Database>ChatsSTG</Database>
    <DriverData>
      <EncryptSqlTraffic>False</EncryptSqlTraffic>
      <PreserveNumeric1>True</PreserveNumeric1>
      <EFProvider>Microsoft.EntityFrameworkCore.SqlServer</EFProvider>
      <NoMARS>True</NoMARS>
      <TrustServerCertificate>False</TrustServerCertificate>
    </DriverData>
  </Connection>
  <NuGetReference>Microsoft.Extensions.Caching.Memory</NuGetReference>
  <Namespace>Microsoft.EntityFrameworkCore.Storage</Namespace>
  <Namespace>Microsoft.Data.SqlClient</Namespace>
  <Namespace>System.Text.Json</Namespace>
  <Namespace>System.Text.Json.Nodes</Namespace>
</Query>

Dictionary<string, string> TableMapping = new()
{
	["ApiKeyModel"] = "UserApiModel",       /* 01 */
	["ModelKey"] = "ModelKey2",             /* 02 */
	["ChatModel"] = "Model",                /* 03 */
	["UserModel"] = "UserModel2",           /* 04 */
	["ApiUsage"] = "UserModelUsage",        /* 05 */
	["Conversation"] = "Conversation2",     /* 06 */
	["Message"] = "Message2",               /* 07 */
	["MessageContent"] = "MessageContent2", /* 08 */
	["MessageResponse"] = "UserModelUsage", /* 09 */
	["UserApiUsage"] = "UserModelUsage",    /* 10 */
};

void Main()
{
	ResetTablesAndIdentity();
	Dictionary<string, short> modelProviderNameIdMapping = ModelProviders.ToDictionary(k => k.Name, v => v.Id);
	_01_ApiKeyModels();
	GuidInt16Mapping modelKeyMapping = _02_ModelKey(modelProviderNameIdMapping);
	GuidInt16Mapping modelMapping = _03_ChatModel(modelProviderNameIdMapping, modelKeyMapping);
	_04_UserModel(modelMapping);
}

UserModelMapping _04_UserModel(GuidInt16Mapping modelMapping)
{
	UserModelMapping userModelMapping = new();
	foreach (UserModel olds in UserModels)
	{
		JsonArray oldUserModels = JsonSerializer.Deserialize<JsonArray>(olds.Models)!;		
		foreach (JsonObject old in oldUserModels.Select(x => (JsonObject)x!))
		{
			Guid modelGuid = (Guid)old!["modelId"]!;
			short modelId = modelMapping[modelGuid];
			int tokens = int.Parse(old["tokens"]!.ToString());
			int counts = int.Parse(old["counts"]!.ToString());
			bool enabled = (bool)old["enabled"]!;
			DateTime expires = (string)old["expires"]! switch
			{
				"-" => new DateTime(2029, 12, 31),
				var x => DateTime.Parse(x),
			};
			int userModelId = userModelMapping.Add(new UserAndModelId(olds.UserId, modelMapping[modelGuid]));
			UserModel2 toBeInserted = new UserModel2()
			{
				Id = userModelId,
				ModelId = modelId,
				CountBalance = counts,
				TokenBalance = tokens,
				ExpiresAt = expires,
				IsDeleted = !enabled,
				CreatedAt = olds.CreatedAt,
				UpdatedAt = olds.UpdatedAt,
				UserId = olds.UserId,
			};
			if (counts > 0 || tokens > 0)
			{
				toBeInserted.UserModelUsageTransactionLogs.Add(new UsageTransactionLog()
				{
					CreatedAt = olds.UpdatedAt,
					TokenAmount = tokens,
					CountAmount = counts,
					TransactionTypeId = 1, // charge
				});
			}
			UserModel2s.Add(toBeInserted);
		}
	}
	using (IdentityInsertScope idInsert = new(this, "UserModel2"))
	{
		SaveChanges();
	}
	return userModelMapping;
}

//void _05_ApiUsage()
//{
//	foreach (ApiUsage old in ApiUsages)
//	{
//		UserModelUsages.Add(new UserModelUsage()
//		{
//			BalanceTransactionId = old.TransactionLogId,
//			ClientInfoId = 1,
//			CreatedAt = old.CreatedAt,
//			DurationMs = old.DurationMs,
//			InputCost = old.InputCost,
//			OutputCost = old.OutputCost,
//			InputTokenCount = old.InputTokenCount,
//			OutputTokenCount = old.OutputTokenCount,
//			UsageTransactionId = null,
//			UserModelId = old.ChatModelId,
//		});
//	}
//}

GuidInt16Mapping _03_ChatModel(Dictionary<string, short> modelProviderNameIdMapping, GuidInt16Mapping modelKeyMapping)
{
	Dictionary<ModelIdentifier, short> modelReferenceIdMapping = ModelReferences.ToDictionary(k => new ModelIdentifier(k.ProviderId, k.Name), v => v.Id);
	GuidInt16Mapping modelMapping = new();
	foreach (ChatModel old in ChatModels)
	{
		short modelId = modelMapping.Add(old.Id);
		JsonObject modelConfig = JsonSerializer.Deserialize<JsonObject>(old.ModelConfig)!;
		JsonObject priceConfig = JsonSerializer.Deserialize<JsonObject>(old.PriceConfig)!;
		Models.Add(new Model()
		{
			Id = modelId,
			CreatedAt = old.CreatedAt,
			DeploymentName = (string?)(modelConfig["model"] ?? modelConfig["deploymentName"] ?? modelConfig["version"]),
			FileServiceId = old.FileServiceId,
			IsDeleted = !old.Enabled,
			ModelKeyId = modelKeyMapping[old.ModelKeysId],
			ModelReferenceId = modelReferenceIdMapping[new ModelIdentifier(modelProviderNameIdMapping[old.ModelProvider], old.ModelVersion)],
			Name = old.Name,
			PromptTokenPrice1M = (decimal)priceConfig["input"]! * 1_000_000,
			ResponseTokenPrice1M = (decimal)priceConfig["out"]! * 1_000_000,
			UpdatedAt = old.UpdatedAt,
			Order = (short?)old.Rank,
		});
	}
	using (IdentityInsertScope idInsert = new(this, "Model"))
	{
		SaveChanges();
	}
	return modelMapping;
}

GuidInt16Mapping _02_ModelKey(Dictionary<string, short> modelProviderNameIdMapping)
{
	GuidInt16Mapping modelKeyMapping = new();
	foreach (ModelKey old in ModelKeys)
	{
		short modelKeyId = modelKeyMapping.Add(old.Id);
		JsonObject configs = JsonSerializer.Deserialize<JsonObject>(old.Configs)!;
		string host = (string)configs["host"]!;
		string apiKey = (string)configs["apiKey"]!;
		string? secret = (string?)configs["secret"];
		ModelKey2s.Add(new ModelKey2()
		{
			Id = modelKeyId,
			CreatedAt = old.CreatedAt,
			Host = host,
			ModelProviderId = modelProviderNameIdMapping[old.Type],
			Name = old.Name,
			Secret = secret == null ? apiKey : JsonSerializer.Serialize(new
			{
				apiKey = apiKey,
				secret = secret,
			}),
			UpdatedAt = old.UpdatedAt,
		});
	}

	using (IdentityInsertScope idInsert = new(this, "ModelKey2"))
	{
		SaveChanges();
	}
	return modelKeyMapping;
}

void _01_ApiKeyModels() { /* No Data, Skip */ }

// 清空表数据并重置自增 ID
void ResetTablesAndIdentity()
{
	using (IDbContextTransaction tran = Database.BeginTransaction())
	{
		string resetTablesSql = """
				DELETE FROM [dbo].[UserApiModel];
				DELETE FROM [dbo].[Message2];DBCC CHECKIDENT ('[dbo].[Message2]', RESEED, 0);
				DELETE FROM [dbo].[UserModelUsage];DBCC CHECKIDENT ('[dbo].[UserModelUsage]', RESEED, 0);
				DELETE FROM [dbo].[MessageContent2];DBCC CHECKIDENT ('[dbo].[MessageContent2]', RESEED, 0);
				DELETE FROM [dbo].[Conversation2];DBCC CHECKIDENT ('[dbo].[Conversation2]', RESEED, 0);
				DELETE FROM [dbo].[UserModel2];DBCC CHECKIDENT ('[dbo].[UserModel2]', RESEED, 0);
				DELETE FROM [dbo].[Model];DBCC CHECKIDENT ('[dbo].[Model]', RESEED, 0);
				DELETE FROM [dbo].[ModelKey2];DBCC CHECKIDENT ('[dbo].[ModelKey2]', RESEED, 0);
			""";
		Database.ExecuteSqlRaw(resetTablesSql);
		tran.Commit();
	}
}

public class IdentityInsertScope : IDisposable
{
	private readonly DbContext _context;
	private readonly string _tableName;
	private readonly IDbContextTransaction _tran;

	public IdentityInsertScope(DbContext context, string tableName)
	{
		_context = context;
		_tableName = tableName;
		_tran = context.Database.BeginTransaction();
		TrySetIdentityInsert(tableName, true);
	}

	public void Dispose()
	{
		TrySetIdentityInsert(_tableName, false);
		_tran.Commit();
		_tran.Dispose();
	}

	public void TrySetIdentityInsert(string table, bool enable)
	{
		try
		{
			string state = enable ? "ON" : "OFF";
			_context.Database.ExecuteSqlRaw($"SET IDENTITY_INSERT [dbo].[{table}] {state}");
		}
		catch (SqlException ex)
		{
			Console.WriteLine($"Error setting IDENTITY_INSERT for table '{table}': {ex.Message}");
			throw;
		}
	}
}

public class GuidInt16Mapping
{
	Int16 _nextId = 1;
	public Dictionary<Guid, Int16> _mapping = new();
	public Int16 Add(Guid guid) { _mapping.Add(guid, _nextId); return _nextId++; }
	public Int16 this[Guid guid] => _mapping[guid];
}

public class UserModelMapping
{
	int _nextId = 1;
	public Dictionary<UserAndModelId, int> _mapping = new();
	public int Add(UserAndModelId guid) { _mapping.Add(guid, _nextId); return _nextId++; }
	public int this[UserAndModelId guid] => _mapping[guid];
}

public record UserAndModelId(Guid UserId, short ModelId);

public record ModelIdentifier(short ProviderId, string Name);