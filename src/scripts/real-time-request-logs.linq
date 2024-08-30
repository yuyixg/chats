<Query Kind="Statements" />

DateTime current = RequestLogs.Select(x => (DateTime?)x.CreatedAt).Max() ?? DateTime.MinValue;
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