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
	TableDef[] tableDefs = new[]
	{
		"ModelReference",
		"ModelProvider"
	}
	.Select(tableName => TableDef.FromContextTableDef(this, tableName))
	.ToArray();
	SyntaxNode cu = GenerateReplaceDetailsForTables(tableDefs);
	Util.FixedFont(cu.ToFullString()).Dump();
	//File.WriteAllText("./BasicData2.cs", modelProvidersReplaced.ToFullString());
}

static CompilationUnitSyntax GenerateReplaceDetailsForTables(TableDef[] tableDefs)
{
	
	CompilationUnitSyntax cu = CompilationUnit()
		.AddUsings(
			UsingDirective(ParseName("Chats.BE.DB")),
			UsingDirective(ParseName("Chats.BE.DB.Enums")),
			UsingDirective(ParseName("Chats.BE.Services.Conversations"))
		)
		.AddMembers(
			FileScopedNamespaceDeclaration(ParseName("Chats.BE.Services.Init")).AddMembers(
				ClassDeclaration("BasicData2")
					.AddModifiers(Token(SyntaxKind.InternalKeyword), Token(SyntaxKind.StaticKeyword)))
		)
		.NormalizeWhitespace();
	ClassDeclarationSyntax cls = cu.DescendantNodes().OfType<ClassDeclarationSyntax>().First();
	ClassDeclarationSyntax newCls = cls.AddMembers(tableDefs.Select(x => MakeMethod(x)).ToArray());
	return cu.ReplaceNode(cls, newCls);
}

static MethodDeclarationSyntax MakeMethod(TableDef def)
{
	int ident = 4;
	return MethodDeclaration(PredefinedType(Token(SyntaxKind.VoidKeyword)), $"Insert{def.PropertyName}")
		.AddModifiers(Token(SyntaxKind.PublicKeyword), Token(SyntaxKind.StaticKeyword))
		.AddParameterListParameters(Parameter(Identifier("db")).WithType(IdentifierName("ChatsDB")))
		.NormalizeWhitespace()
		.WithBody(Block(
			OpenBrace(),
			[ExpressionStatement(
				InvocationExpression(ParseName($"db.{def.PropertyName}.AddRange"),
				ArgumentList(
					OpenParen(),
					[Argument(CollectionExpression(
						OpenBracket(),
						SeparatedList<CollectionElementSyntax>(def.TableData.Select(x => def.ToExpression(x).WithLeadingTrivia(WS())),
							Enumerable.Repeat(Token(SyntaxKind.CommaToken).WithTrailingTrivia(Whitespace("\n")), def.TableData.Length - 1)),
						CloseBracket()
						))],
					CloseParen()
				))).WithLeadingTrivia(WS(), Comment($"// Generated from data, hash: {def.GenerateDataHash()}\n"), WS())],
			CloseBrace()));

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

record TableDef
{
	public Type Type { get; }

	public object[] TableData { get; }

	public string PropertyName => Type.Name + 's';

	public FieldInfo[] Fields { get; }

	public Dictionary<string, int> FieldsMaxLength { get; }
	
	public static TableDef FromContextTableDef(object me, string tableName)
	{
		PropertyInfo prop = me.GetType().GetProperty($"{tableName}s") ?? throw new InvalidOperationException($"Property {tableName}s not found.");
		Type propType = prop.PropertyType.GenericTypeArguments[0];
		IEnumerable dataTable = (IEnumerable)prop.GetValue(me)!;
		return new TableDef(propType, dataTable.OfType<object>().ToArray());
	}

	public TableDef(Type type, object[] tableData)
	{
		Type = type;
		TableData = tableData;
		Fields = Type
			.GetFields()
			.Where(x => x.GetCustomAttribute<ColumnAttribute>() != null)
			.ToArray();
		FieldsMaxLength = Fields
			.ToDictionary(k => k.Name, v => TableData.Max(data => GetValueDisplayLength(v.GetValue(data))));
	}

	public string GenerateDataHash()
	{
		using (SHA256 sha256 = SHA256.Create())
		{
			StringBuilder builder = new StringBuilder();

			foreach (object item in TableData)
			{
				if (item != null)
				{
					foreach (FieldInfo field in Fields)
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

	public ExpressionElementSyntax ToExpression(object data)
	{
		return ExpressionElement(
			ImplicitObjectCreationExpression(
				ArgumentList(),
				InitializerExpression(
					SyntaxKind.ObjectInitializerExpression,
					Token(SyntaxKind.OpenBraceToken).WithTrailingTrivia(Whitespace(" ")),
					SeparatedList<ExpressionSyntax>(Fields.Select(x => AssignmentExpression(SyntaxKind.SimpleAssignmentExpression,
						IdentifierName(x.Name),
						ValueToLiteral(x.GetValue(data)))),
						Fields.Select(x => Token(SyntaxKind.CommaToken)
							.WithTrailingTrivia(Whitespace(new string(' ', FieldsMaxLength[x.Name] - GetValueDisplayLength(x.GetValue(data)) + 1))))
					),
					Token(SyntaxKind.CloseBraceToken)
				)
			)
		);
	}
}