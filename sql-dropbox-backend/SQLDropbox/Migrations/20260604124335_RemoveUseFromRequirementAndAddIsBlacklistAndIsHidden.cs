using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUseFromRequirementAndAddIsBlacklistAndIsHidden : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Use",
                table: "Requirement",
                newName: "IsHidden");

            migrationBuilder.AddColumn<bool>(
                name: "IsBlacklist",
                table: "Requirement",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBlacklist",
                table: "Requirement");

            migrationBuilder.RenameColumn(
                name: "IsHidden",
                table: "Requirement",
                newName: "Use");
        }
    }
}
