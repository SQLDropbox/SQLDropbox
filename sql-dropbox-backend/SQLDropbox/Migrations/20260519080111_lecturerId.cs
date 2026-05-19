using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SQLDropbox.Migrations
{
    /// <inheritdoc />
    public partial class lecturerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseLecturer_Lecturer_LecturersLecturerCode",
                table: "CourseLecturer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Lecturer",
                table: "Lecturer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseLecturer",
                table: "CourseLecturer");

            migrationBuilder.DropIndex(
                name: "IX_CourseLecturer_LecturersLecturerCode",
                table: "CourseLecturer");

            migrationBuilder.DropColumn(
                name: "LecturersLecturerCode",
                table: "CourseLecturer");

            migrationBuilder.AddColumn<Guid>(
                name: "LecturerId",
                table: "Lecturer",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "LecturersLecturerId",
                table: "CourseLecturer",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Lecturer",
                table: "Lecturer",
                column: "LecturerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseLecturer",
                table: "CourseLecturer",
                columns: new[] { "CoursesCourseId", "LecturersLecturerId" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseLecturer_LecturersLecturerId",
                table: "CourseLecturer",
                column: "LecturersLecturerId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseLecturer_Lecturer_LecturersLecturerId",
                table: "CourseLecturer",
                column: "LecturersLecturerId",
                principalTable: "Lecturer",
                principalColumn: "LecturerId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseLecturer_Lecturer_LecturersLecturerId",
                table: "CourseLecturer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Lecturer",
                table: "Lecturer");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseLecturer",
                table: "CourseLecturer");

            migrationBuilder.DropIndex(
                name: "IX_CourseLecturer_LecturersLecturerId",
                table: "CourseLecturer");

            migrationBuilder.DropColumn(
                name: "LecturerId",
                table: "Lecturer");

            migrationBuilder.DropColumn(
                name: "LecturersLecturerId",
                table: "CourseLecturer");

            migrationBuilder.AddColumn<string>(
                name: "LecturersLecturerCode",
                table: "CourseLecturer",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Lecturer",
                table: "Lecturer",
                column: "LecturerCode");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseLecturer",
                table: "CourseLecturer",
                columns: new[] { "CoursesCourseId", "LecturersLecturerCode" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseLecturer_LecturersLecturerCode",
                table: "CourseLecturer",
                column: "LecturersLecturerCode");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseLecturer_Lecturer_LecturersLecturerCode",
                table: "CourseLecturer",
                column: "LecturersLecturerCode",
                principalTable: "Lecturer",
                principalColumn: "LecturerCode",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
