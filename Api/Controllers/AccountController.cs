using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _db;
    public AccountController(AppDbContext db) => _db = db;

    // GET /api/account
    [HttpGet]
    public async Task<ActionResult<Account>> Get()
    {
        var account = await _db.Accounts.FirstOrDefaultAsync();
        if (account is null) return NotFound();
        return account;
    }

    // POST /api/account/deposit   body: { "amount": 50 }
    [HttpPost("deposit")]
    public async Task<ActionResult<Account>> Deposit([FromBody] AmountDto dto)
    {
        if (dto.Amount <= 0) return BadRequest("Amount must be positive.");
        var account = await _db.Accounts.FirstOrDefaultAsync();
        if (account is null) return NotFound();

        account.Balance += dto.Amount;
        await _db.SaveChangesAsync();
        return account;
    }

    // POST /api/account/withdraw   body: { "amount": 50 }
    [HttpPost("withdraw")]
    public async Task<ActionResult<Account>> Withdraw([FromBody] AmountDto dto)
    {
        if (dto.Amount <= 0) return BadRequest("Amount must be positive.");
        var account = await _db.Accounts.FirstOrDefaultAsync();
        if (account is null) return NotFound();

        if (dto.Amount > account.Balance) return BadRequest("Insufficient funds.");

        account.Balance -= dto.Amount;
        await _db.SaveChangesAsync();
        return account;
    }
}

public record AmountDto(decimal Amount);