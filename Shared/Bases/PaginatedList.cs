using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Shared.Bases
{
    public class PaginatedList<T>(List<T> Items, int PageNumber, int PageSize, int Count)
    {
        public List<T> Items { get; private set; } = Items;
        public int PageSize { get; private set; } = PageSize;
        public int PageNumber { get; private set; } = PageNumber;
        public int Count { get; private set; } = Count;
        public int TotalPages => (int)Math.Ceiling(Count / (double)PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => TotalPages > PageNumber;

        public async static Task<PaginatedList<T>> CreatePaginatedList(IQueryable<T> source, int PageNumber, int PageSize)
        {
            var Count = await source.CountAsync();
            var Items = await source.Skip((PageNumber - 1) * PageSize).Take(PageSize).ToListAsync();
            return new PaginatedList<T>(Items, PageNumber, PageSize, Count);
        }

    }
}
