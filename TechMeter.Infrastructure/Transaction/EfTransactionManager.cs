using Microsoft.EntityFrameworkCore;
using System.Data;
using TechMeter.Application.Interfaces.Transaction;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Transaction
{
    public class EfTransactionManager(ApplicationDbContext context) : ITransactionManager
    {
        public async Task<ITransaction> BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadUncommitted,
            CancellationToken cancellationToken = default)
        {
            var transaction = await context.Database.BeginTransactionAsync(isolationLevel, cancellationToken);

            return new EfTransaction(transaction);
        }
    }
}
