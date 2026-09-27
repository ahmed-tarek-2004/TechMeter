using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Order;
using TechMeter.Application.Features.Order.Query;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.DeleteOrder
{
    public class DeleteOrderCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler, ILogger<DeleteOrderCommandHandler> logger) 
        : IRequestHandler<DeleteOrderCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {

                var order = await context.Order
                    .FirstOrDefaultAsync(b => b.Id == request.OrderId);

                if (order == null)
                {
                    logger.LogWarning("There is no Courses in Your Order");
                    return responseHandler.BadRequest<string>("Order Is Empty");
                }

                context.Order.Remove(order);
                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Success(string.Empty, "Order Deleted Successfully");

            }
            catch (Exception ex)
            {
                return responseHandler.BadRequest<string>("Internal Serevr Error Check Log files"); ;
            }
        }
    }
}
