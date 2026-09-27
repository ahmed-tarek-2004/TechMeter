using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Transaction;

namespace TechMeter.Infrastructure.Persistence.Transaction
{
    public class EfTransaction:ITransaction
    {

        private readonly IDbContextTransaction _transaction;

        public EfTransaction(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public async Task CommitAsync(CancellationToken cancellationToken = default)
        {
            await _transaction.CommitAsync(cancellationToken);
        }

        public async Task RollbackAsync(CancellationToken cancellationToken = default)
        {
            await _transaction.RollbackAsync(cancellationToken);
        }

        public async ValueTask DisposeAsync()
        {
            await _transaction.DisposeAsync();
        }
    }
}
