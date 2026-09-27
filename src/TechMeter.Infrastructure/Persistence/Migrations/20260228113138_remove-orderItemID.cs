using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class removeorderItemID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderItemId",
                table: "Order");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OrderItemId",
                table: "Order",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
