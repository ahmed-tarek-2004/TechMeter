using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Cart.Command.ClearStudentCart;
using TechMeter.Application.Features.Cart.Command.RemoveCartItem;
using TechMeter.Application.Features.Cart.Query.GetProviderStudentCart;
using TechMeter.Application.Features.Cart.Query.GetStudentCart;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CartController> _logger;
        //private readonly ICartService _cartService;
        //private readonly ApplicationDbContext _context;
        //private readonly ResponseHandler _responseHandler;
        //private readonly IValidator<UpdateCartItemRequest> _updateCartItemRequestValidator;
        public CartController(IMediator mediator,ILogger<CartController> logger)
        {
            _logger = logger;
            //_context = context;
            //_cartService = cartService;
            _mediator = mediator;
            //_responseHandler = responseHandler;
            //_updateCartItemRequestValidator = updateCartItemRequestValidator;
        }

        [Authorize(Roles = "student")]
        [HttpGet("student")]
        public async Task<ActionResult<Response<CartResponse>>> GetCartAsync()
        {
            var command = new GetStudentCartQuery(GetUserId());
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("provider/{studentId}")]
        [Authorize(Roles = "provider")]
        public async Task<ActionResult<Response<CartResponse>>> GetProviderCartAsync([FromRoute] string studentId)
        {
            var command = new GetProviderStudentCartCommand(GetUserId(), studentId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPost("student")]
        public async Task<ActionResult<Response<CartResponse>>> AddToCartAsync([FromBody] CartRequest cartRequest)
        {
            var response = await _mediator.Send(new AddToCartCommand { StudentId = GetUserId(), CourseId = cartRequest.CourseId });
            return StatusCode((int)response.StatusCode, response);
        }
        //[Authorize(Roles = "student")]
        //[HttpPut("Student/update/cartItem")]
        //public async Task<ActionResult<Response<CartResponse>>> UpdateCartItemAsync([FromBody] UpdateCartItemRequest request)
        //{
        //    var Validation = await _updateCartItemRequestValidator.ValidateAsync(request);
        //    if (!Validation.IsValid)
        //    {
        //        var error = string.Join(",", Validation.Errors.Select(b => b.ErrorMessage));
        //        return StatusCode((int)_responseHandler.BadRequest<CartResponse>(error).StatusCode,
        //            _responseHandler.BadRequest<CartResponse>(error));
        //    }
        //    var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var response = await _cartService.UpdateCartAsync(StudentId ?? "", request);
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [HttpDelete("student/{cartItemId}")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<CartResponse>>> RemoveFromCartAsync([FromRoute] string cartItemId)
        {
            var command = new RemoveCartItemCommand(GetUserId(), cartItemId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpDelete("clear")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<Response<CartResponse>>> ClearStudentCartAsync()
        {
            var response = await _mediator.Send(new ClearStudentCartCommand(GetUserId()));
            return StatusCode((int)response.StatusCode, response);
        }
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        }
    }
}
