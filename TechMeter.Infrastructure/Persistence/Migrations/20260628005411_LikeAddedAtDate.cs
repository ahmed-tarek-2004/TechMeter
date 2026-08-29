using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechMeter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LikeAddedAtDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LessonComment_AspNetUsers_UserId",
                table: "LessonComment");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonComment_Lessons_LessonId",
                table: "LessonComment");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLike_AspNetUsers_UserId",
                table: "LessonCommentLike");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLike_LessonComment_CommentId",
                table: "LessonCommentLike");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLike_Lessons_LessonsId",
                table: "LessonCommentLike");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LessonCommentLike",
                table: "LessonCommentLike");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LessonComment",
                table: "LessonComment");

            migrationBuilder.RenameTable(
                name: "LessonCommentLike",
                newName: "LessonCommentLikes");

            migrationBuilder.RenameTable(
                name: "LessonComment",
                newName: "lessonComments");

            migrationBuilder.RenameIndex(
                name: "IX_LessonCommentLike_LessonsId",
                table: "LessonCommentLikes",
                newName: "IX_LessonCommentLikes_LessonsId");

            migrationBuilder.RenameIndex(
                name: "IX_LessonCommentLike_CommentId",
                table: "LessonCommentLikes",
                newName: "IX_LessonCommentLikes_CommentId");

            migrationBuilder.RenameIndex(
                name: "IX_LessonComment_UserId",
                table: "lessonComments",
                newName: "IX_lessonComments_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_LessonComment_LessonId",
                table: "lessonComments",
                newName: "IX_lessonComments_LessonId");

            migrationBuilder.AddColumn<DateTime>(
                name: "AddedAt",
                table: "LessonCommentLikes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_LessonCommentLikes",
                table: "LessonCommentLikes",
                columns: new[] { "UserId", "CommentId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_lessonComments",
                table: "lessonComments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLikes_AspNetUsers_UserId",
                table: "LessonCommentLikes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLikes_Lessons_LessonsId",
                table: "LessonCommentLikes",
                column: "LessonsId",
                principalTable: "Lessons",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLikes_lessonComments_CommentId",
                table: "LessonCommentLikes",
                column: "CommentId",
                principalTable: "lessonComments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_lessonComments_Lessons_LessonId",
                table: "lessonComments",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLikes_AspNetUsers_UserId",
                table: "LessonCommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLikes_Lessons_LessonsId",
                table: "LessonCommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonCommentLikes_lessonComments_CommentId",
                table: "LessonCommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_lessonComments_AspNetUsers_UserId",
                table: "lessonComments");

            migrationBuilder.DropForeignKey(
                name: "FK_lessonComments_Lessons_LessonId",
                table: "lessonComments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_lessonComments",
                table: "lessonComments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LessonCommentLikes",
                table: "LessonCommentLikes");

            migrationBuilder.DropColumn(
                name: "AddedAt",
                table: "LessonCommentLikes");

            migrationBuilder.RenameTable(
                name: "lessonComments",
                newName: "LessonComment");

            migrationBuilder.RenameTable(
                name: "LessonCommentLikes",
                newName: "LessonCommentLike");

            migrationBuilder.RenameIndex(
                name: "IX_lessonComments_UserId",
                table: "LessonComment",
                newName: "IX_LessonComment_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_lessonComments_LessonId",
                table: "LessonComment",
                newName: "IX_LessonComment_LessonId");

            migrationBuilder.RenameIndex(
                name: "IX_LessonCommentLikes_LessonsId",
                table: "LessonCommentLike",
                newName: "IX_LessonCommentLike_LessonsId");

            migrationBuilder.RenameIndex(
                name: "IX_LessonCommentLikes_CommentId",
                table: "LessonCommentLike",
                newName: "IX_LessonCommentLike_CommentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LessonComment",
                table: "LessonComment",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LessonCommentLike",
                table: "LessonCommentLike",
                columns: new[] { "UserId", "CommentId" });

            migrationBuilder.AddForeignKey(
                name: "FK_LessonComment_AspNetUsers_UserId",
                table: "LessonComment",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonComment_Lessons_LessonId",
                table: "LessonComment",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLike_AspNetUsers_UserId",
                table: "LessonCommentLike",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLike_LessonComment_CommentId",
                table: "LessonCommentLike",
                column: "CommentId",
                principalTable: "LessonComment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonCommentLike_Lessons_LessonsId",
                table: "LessonCommentLike",
                column: "LessonsId",
                principalTable: "Lessons",
                principalColumn: "Id");
        }
    }
}
