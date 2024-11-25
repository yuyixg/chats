<Query Kind="Program">
  <Connection>
    <ID>35a33e06-2204-4d18-88ea-ce7dedb2c722</ID>
    <NamingServiceVersion>2</NamingServiceVersion>
    <Persist>true</Persist>
    <Server>home.starworks.cc,37965</Server>
    <SqlSecurity>true</SqlSecurity>
    <UserName>sa</UserName>
    <Password>AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAmOMyzcMZ5ka3bwTJ5AmIAwAAAAACAAAAAAAQZgAAAAEAACAAAACgg8NDg49czDMsZVdzq0y270QbNlJreQzmHHylcaOAlwAAAAAOgAAAAAIAACAAAAA1kH5y8TgdeVizkX0gG0DZt5z6nAJLL4Y0djorJiZ7fCAAAACiWyAkQ+ISVpGnhPB4xAyJDsOPI0hd8DQa9L6IyOo/oUAAAABshwYQgiVMG/CpeAqgSnxR5z5/wCjv+GHgbUPOpYZV+Aue7TCSybx1R1e0hJKq285TBIpwrJVD6373TkwMSj9Y</Password>
    <AllowDateOnlyTimeOnly>true</AllowDateOnlyTimeOnly>
    <Database>ChatsSTG</Database>
    <DriverData>
      <LegacyMFA>false</LegacyMFA>
    </DriverData>
  </Connection>
  <NuGetReference>Microsoft.CodeAnalysis.Analyzers</NuGetReference>
  <NuGetReference>Microsoft.CodeAnalysis.CSharp</NuGetReference>
  <Namespace>Microsoft.CodeAnalysis</Namespace>
  <Namespace>Microsoft.CodeAnalysis.CSharp</Namespace>
  <Namespace>Microsoft.CodeAnalysis.CSharp.Syntax</Namespace>
  <Namespace>static Microsoft.CodeAnalysis.CSharp.SyntaxFactory</Namespace>
  <Namespace>System.Data.Linq.Mapping</Namespace>
  <Namespace>System.Security.Cryptography</Namespace>
</Query>

void Main()
{
	Environment.CurrentDirectory = Path.GetDirectoryName(Util.CurrentQueryPath)!;
	string path = "./BasicData.cs";
	SyntaxNode root = CSharpSyntaxTree.ParseText(File.ReadAllText(path)).GetRoot();
	SyntaxNode modelReferenceReplaced = GenerateReplaceDetailsForTable(root, ModelReferences);
	SyntaxNode modelProvidersReplaced = GenerateReplaceDetailsForTable(modelReferenceReplaced, ModelProviders);
	File.WriteAllText(path, modelProvidersReplaced.ToFullString());
}

static SyntaxNode GenerateReplaceDetailsForTable<T>(SyntaxNode root, Table<T> dataTable) where T : class
{
	string className = typeof(T).Name;
	BlockSyntax existingFunctionBlock = root.DescendantNodes()
		.OfType<MethodDeclarationSyntax>()
		.Where(x => x.Identifier.Text == $"Insert{className}s")
		.First()
		.ChildNodes()
		.OfType<BlockSyntax>()
		.First();
	int ident = existingFunctionBlock.GetLeadingTrivia()[0].Span.Length;
	T[] datas = dataTable.ToArray();
	FieldInfo[] fields = typeof(T)
			.GetFields()
			.Where(x => x.GetCustomAttribute<ColumnAttribute>() != null)
			.ToArray();
	Dictionary<string, int> fieldsMaxLength = fields
		.ToDictionary(k => k.Name, v => datas.Max(data => GetValueDisplayLength(v.GetValue(data))));

	BlockSyntax statement = Block(
		OpenBrace(),
		[ExpressionStatement(
			InvocationExpression(MemberAccess("db", $"{className}s", "AddRange"),
			ArgumentList(
				OpenParen(),
				[Argument(CollectionExpression(
					OpenBracket(),
					SeparatedList<CollectionElementSyntax>(datas.Select(x => ToExpression(x, fields, fieldsMaxLength).WithLeadingTrivia(WS())),
						Enumerable.Repeat(Token(SyntaxKind.CommaToken).WithTrailingTrivia(Whitespace("\n")), datas.Length - 1)),
					CloseBracket()
					))],
				CloseParen()
			))).WithLeadingTrivia(WS(), Comment($"// Generated from data, hash: {GenerateDataHash(datas, fields)}\n"), WS())],
		CloseBrace());
	return root.ReplaceNode(existingFunctionBlock, statement);

	// {}
	SyntaxToken OpenBrace() => Token(SyntaxKind.OpenBraceToken).WithLeadingTrivia(BeginWS()).WithTrailingTrivia(Whitespace("\n"));
	SyntaxToken CloseBrace() { ident -= 4; return Token(SyntaxKind.CloseBraceToken).WithLeadingTrivia(Whitespace("\n"), WS()).WithTrailingTrivia(Whitespace("\n")); }

	// []
	SyntaxToken OpenBracket() => Token(SyntaxKind.OpenBracketToken).WithLeadingTrivia(BeginWS()).WithTrailingTrivia(Whitespace("\n"));
	SyntaxToken CloseBracket() { ident -= 4; return Token(SyntaxKind.CloseBracketToken).WithLeadingTrivia(Whitespace("\n"), WS()); }

	// ()
	SyntaxToken OpenParen() { return Token(SyntaxKind.OpenParenToken).WithTrailingTrivia(Whitespace("\n")); }
	SyntaxToken CloseParen() { return Token(SyntaxKind.CloseParenToken); }

	SyntaxTrivia BeginWS()
	{
		SyntaxTrivia ws = WS();
		ident += 4;
		return ws;
	}

	SyntaxTrivia WS(int offset = 0) => Whitespace(new string(' ', ident + offset));

	static MemberAccessExpressionSyntax MemberAccess(params string[] identifiers)
	{
		if (identifiers == null || identifiers.Length == 0)
			throw new ArgumentException("No identifiers provided.");

		// 从第一个标识符开始
		ExpressionSyntax expression = IdentifierName(identifiers[0]);

		// 累积构建成员访问表达式
		for (int i = 1; i < identifiers.Length; i++)
		{
			expression = MemberAccessExpression(
				SyntaxKind.SimpleMemberAccessExpression,
				expression,
				IdentifierName(identifiers[i])
			);
		}

		// 返回完整的成员访问表达式
		return (MemberAccessExpressionSyntax)expression;
	}
}

static ExpressionElementSyntax ToExpression<T>(T data, FieldInfo[] fields, Dictionary<string, int> fieldMaxLength)
{
	if (data == null) throw new ArgumentNullException(nameof(data));

	return ExpressionElement(
		ImplicitObjectCreationExpression(
			ArgumentList(),
			InitializerExpression(
				SyntaxKind.ObjectInitializerExpression,
				Token(SyntaxKind.OpenBraceToken).WithTrailingTrivia(Whitespace(" ")),
				SeparatedList<ExpressionSyntax>(fields.Select(x => AssignmentExpression(SyntaxKind.SimpleAssignmentExpression,
					IdentifierName(x.Name),
					ValueToLiteral(x.GetValue(data)))),
					fields.Select(x => Token(SyntaxKind.CommaToken)
						.WithTrailingTrivia(Whitespace(new string(' ', fieldMaxLength[x.Name] - GetValueDisplayLength(x.GetValue(data)) + 1))))
				),
				Token(SyntaxKind.CloseBraceToken)
			)
		)
	);
}

static int GetValueDisplayLength(object? value)
{
	return value switch
	{
		null => 4,
		string str => str.Length + str.Count(ch => ch == '"') + 2,
		decimal d => d.ToString().Length + 1,
		not null => value.ToString()!.Length,
	};
}

static LiteralExpressionSyntax ValueToLiteral(object? value)
{
	if (value == null)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.NullLiteralExpression);
	}

	if (value is int intValue)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression, SyntaxFactory.Literal(intValue));
	}

	if (value is short shortValue)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression, SyntaxFactory.Literal(shortValue));
	}

	if (value is decimal decimalValue)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression, SyntaxFactory.Literal(decimalValue));
	}

	if (value is double doubleValue)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression, SyntaxFactory.Literal(doubleValue));
	}

	if (value is bool boolValue)
	{
		return boolValue
			? SyntaxFactory.LiteralExpression(SyntaxKind.TrueLiteralExpression)
			: SyntaxFactory.LiteralExpression(SyntaxKind.FalseLiteralExpression);
	}

	if (value is string stringValue)
	{
		return SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression, SyntaxFactory.Literal(stringValue));
	}

	throw new ArgumentException("Unsupported literal type", value.GetType().FullName);
}

static string GenerateDataHash<T>(T[] data, FieldInfo[] fields) where T : class
{
    if (data == null || fields == null)
    {
        throw new ArgumentNullException("Data or fields cannot be null.");
    }

    using (SHA256 sha256 = SHA256.Create())
    {
        StringBuilder builder = new StringBuilder();

        foreach (T item in data)
        {
            if (item != null)
            {
                foreach (FieldInfo field in fields)
                {
                    object? value = field.GetValue(item);
					builder.Append(value?.ToString() ?? string.Empty);
				}
			}
		}

		byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(builder.ToString()));

		StringBuilder hashString = new StringBuilder();
		foreach (byte b in hashBytes)
		{
			hashString.Append(b.ToString("x2"));
		}

		return hashString.ToString();
	}
}
