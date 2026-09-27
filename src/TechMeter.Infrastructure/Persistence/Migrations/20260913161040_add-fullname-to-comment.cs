using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addfullnametocomment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserFullName",
                table: "lessonComments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserFullName",
                table: "lessonComments");
        }
    }
}
