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
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.CancelOrder
{
    public class CancelOrderCommandHandler(IApplicationDbContext context, ILogger<CancelOrderCommandHandler> logger, 
        ResponseHandler responseHandler) : IRequestHandler<CancelOrderCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await context.Order.FirstOrDefaultAsync(b => b.Id == request.OrderId);
                if (order == null)
                {
                    return responseHandler.NotFound<string>("Order is Not Found");
                }
                if (order.Status == OrderStatus.Canceled)
                {
                    return responseHandler.BadRequest<string>("order is already canceled"); ;
                }
                order.Status = OrderStatus.Canceled;
                //context.Update(order);
                await context.SaveChangesAsync(cancellationToken);
                return responseHandler.Success(string.Empty, "order cancled Successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling order {OrderId}", request.OrderId);
                return responseHandler.InternalServerError<string>("Server Error , Check Log Files ");
            }
        }
    }
}
