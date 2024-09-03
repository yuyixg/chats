<Query Kind="Program">
  <Connection>
    <ID>35a33e06-2204-4d18-88ea-ce7dedb2c722</ID>
    <NamingServiceVersion>2</NamingServiceVersion>
    <Persist>true</Persist>
    <Server>home.starworks.cc,37965</Server>
    <SqlSecurity>true</SqlSecurity>
    <UserName>sa</UserName>
    <Password>AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAmOMyzcMZ5ka3bwTJ5AmIAwAAAAACAAAAAAAQZgAAAAEAACAAAACgg8NDg49czDMsZVdzq0y270QbNlJreQzmHHylcaOAlwAAAAAOgAAAAAIAACAAAAA1kH5y8TgdeVizkX0gG0DZt5z6nAJLL4Y0djorJiZ7fCAAAACiWyAkQ+ISVpGnhPB4xAyJDsOPI0hd8DQa9L6IyOo/oUAAAABshwYQgiVMG/CpeAqgSnxR5z5/wCjv+GHgbUPOpYZV+Aue7TCSybx1R1e0hJKq285TBIpwrJVD6373TkwMSj9Y</Password>
    <EncryptTraffic>true</EncryptTraffic>
    <AllowDateOnlyTimeOnly>true</AllowDateOnlyTimeOnly>
    <Database>ChatsSTG</Database>
    <DriverData>
      <LegacyMFA>false</LegacyMFA>
    </DriverData>
  </Connection>
</Query>

void Main()
{
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
			int newId = _nextId++;;
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