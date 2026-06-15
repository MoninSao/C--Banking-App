using Api.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
var connectionString = builder.Configuration.GetConnectionString("Default");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql($"{connectionString};Password={password}"));

// Allow the React dev server (Vite) to call this API
builder.Services.AddCors(opt =>
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

app.UseCors("frontend");
app.MapControllers();

// On startup: create the table if missing, seed one account at balance 0
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    if (!db.Accounts.Any())
    {
        db.Accounts.Add(new Api.Models.Account { Balance = 0 });
        db.SaveChanges();
    }
}

app.Run();