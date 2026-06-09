using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class MoveValidationQueryFromSolutionToExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidationQuery",
                table: "Solution");

            migrationBuilder.AddColumn<string>(
                name: "ValidationQuery",
                table: "Exercise",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidationQuery",
                table: "Exercise");

            migrationBuilder.AddColumn<string>(
                name: "ValidationQuery",
                table: "Solution",
                type: "text",
                nullable: true);
        }
    }
}
