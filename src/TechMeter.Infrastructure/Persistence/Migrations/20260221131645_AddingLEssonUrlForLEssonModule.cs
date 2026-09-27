using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddingLEssonUrlForLEssonModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LessonUrl",
                table: "Lessons",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LessonUrl",
                table: "Lessons");
        }
    }
}
