using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class AddedQueryActionToExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QueryAction",
                table: "Exercise",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QueryAction",
                table: "Exercise");
        }
    }
}
