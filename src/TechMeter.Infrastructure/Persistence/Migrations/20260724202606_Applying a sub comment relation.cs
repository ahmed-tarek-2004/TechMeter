using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Applyingasubcommentrelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments");

            migrationBuilder.DropTable(
                name: "UserFcmToken");

            migrationBuilder.AddColumn<string>(
                name: "ParentCommentId",
                table: "lessonComments",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_lessonComments_ParentCommentId",
                table: "lessonComments",
                column: "ParentCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_lessonComments_lessonComments_ParentCommentId",
                table: "lessonComments",
                column: "ParentCommentId",
                principalTable: "lessonComments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments");

            migrationBuilder.DropForeignKey(
                name: "FK_lessonComments_lessonComments_ParentCommentId",
                table: "lessonComments");

            migrationBuilder.DropIndex(
                name: "IX_lessonComments_ParentCommentId",
                table: "lessonComments");

            migrationBuilder.DropColumn(
                name: "ParentCommentId",
                table: "lessonComments");

            migrationBuilder.CreateTable(
                name: "UserFcmToken",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeviceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFcmToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserFcmToken_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFcmToken_UserId",
                table: "UserFcmToken",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
