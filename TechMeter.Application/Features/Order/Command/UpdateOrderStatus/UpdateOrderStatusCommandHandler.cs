using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Common;
using TechMeter.Application.DTO.Order;
using TechMeter.Domain.Enums;
using TechMeter.Domain.Shared.Bases;

namespace TechMeter.Application.Features.Order.Command.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandHandler(IApplicationDbContext context, ResponseHandler responseHandler) : 
        IRequestHandler<UpdateOrderStatusCommand, Response<string>>
    {
        public async Task<Response<string>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (!Enum.TryParse<OrderStatus>(request.Status, true, out OrderStatus orderStatus))
                {
                    return responseHandler.BadRequest<string>("New Status is not defined");
                }

                var order = await context.Order.FirstOrDefaultAsync(b => b.Id == request.OrderId);
                if (order == null)
                {
                    return responseHandler.NotFound<string>("order is not found");
                }

                order.Status = orderStatus;
                order.UpdatedAt = DateTime.Now;
                context.Order.Update(order);
                await context.SaveChangesAsync(cancellationToken);

                return responseHandler.Success(string.Empty, "Status Updated Successfully");
            }
            catch (Exception ex)
            {
                return responseHandler.InternalServerError<string>("Internal Server Error check Log Files");
            }

        }
    }
}
