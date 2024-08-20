<Query Kind="Statements">
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

DateTime current = RequestLogs.Select(x => x.CreatedAt).Max();
while (true)
{
	var data = RequestLogs
		.Select(x => new
		{
			x.Id, 
			x.Ip, 
			x.User.Username,
			x.Url,
			x.Method,
			x.StatusCode, 
			x.Request, 
			x.Response, 
			x.CreatedAt
		})
		.Where(x => x.CreatedAt > current)
		.ToList();
	if (data.Any())
	{
		data.Dump();
		current = data.Max(x => x.CreatedAt);
	}
	Thread.Sleep(1000);
}