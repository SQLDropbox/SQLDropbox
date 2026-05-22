using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class NameChangesToPreventConfusion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSolution_UserExercise_StudentExerciseUserExerciseId",
                table: "UserSolution");

            migrationBuilder.RenameColumn(
                name: "StudentExerciseUserExerciseId",
                table: "UserSolution",
                newName: "UserExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_UserSolution_StudentExerciseUserExerciseId",
                table: "UserSolution",
                newName: "IX_UserSolution_UserExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserSolution_UserExercise_UserExerciseId",
                table: "UserSolution",
                column: "UserExerciseId",
                principalTable: "UserExercise",
                principalColumn: "UserExerciseId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserSolution_UserExercise_UserExerciseId",
                table: "UserSolution");

            migrationBuilder.RenameColumn(
                name: "UserExerciseId",
                table: "UserSolution",
                newName: "StudentExerciseUserExerciseId");

            migrationBuilder.RenameIndex(
                name: "IX_UserSolution_UserExerciseId",
                table: "UserSolution",
                newName: "IX_UserSolution_StudentExerciseUserExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserSolution_UserExercise_StudentExerciseUserExerciseId",
                table: "UserSolution",
                column: "StudentExerciseUserExerciseId",
                principalTable: "UserExercise",
                principalColumn: "UserExerciseId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
