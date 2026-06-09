using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class NameChangesToPreventConfusion3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserExercise_User_StudentUserId",
                table: "UserExercise");

            migrationBuilder.RenameColumn(
                name: "StudentUserId",
                table: "UserExercise",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserExercise_StudentUserId",
                table: "UserExercise",
                newName: "IX_UserExercise_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserExercise_User_UserId",
                table: "UserExercise",
                column: "UserId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserExercise_User_UserId",
                table: "UserExercise");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "UserExercise",
                newName: "StudentUserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserExercise_UserId",
                table: "UserExercise",
                newName: "IX_UserExercise_StudentUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserExercise_User_StudentUserId",
                table: "UserExercise",
                column: "StudentUserId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
