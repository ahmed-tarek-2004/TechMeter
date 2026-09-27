using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addinglessonorder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LessonOrder",
                table: "Lessons",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LessonOrder",
                table: "Lessons");
        }
    }
}
