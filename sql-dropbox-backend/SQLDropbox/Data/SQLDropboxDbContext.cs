using Microsoft.EntityFrameworkCore;
using SQLDropbox.Models;

namespace SQLDropbox.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Chapter> Chapters => Set<Chapter>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Exercise> Exercises => Set<Exercise>();
        public DbSet<Requirement> Requirements => Set<Requirement>();
        public DbSet<Schema> Schemas => Set<Schema>();
        public DbSet<Solution> Solutions => Set<Solution>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserExercise> StudentExercises => Set<UserExercise>();
        public DbSet<UserSolution> StudentSolutions => Set<UserSolution>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Students - Courses
            modelBuilder.Entity<Course>()
                .HasMany(c => c.Students)
                .WithMany(u => u.StudentCourses)
                .UsingEntity<Dictionary<string, object>>(
                    "CourseStudents",
                    j => j
                        .HasOne<User>()
                        .WithMany()
                        .HasForeignKey("UserId"),
                    j => j
                        .HasOne<Course>()
                        .WithMany()
                        .HasForeignKey("CourseId"),
                    j =>
                    {
                        j.HasKey("CourseId", "UserId");
                        j.ToTable("CourseStudents");
                    }
                );

            // Lecturers - Courses
            modelBuilder.Entity<Course>()
                .HasMany(c => c.Lecturers)
                .WithMany(u => u.LecturerCourses)
                .UsingEntity<Dictionary<string, object>>(
                    "CourseLecturers",
                    j => j
                        .HasOne<User>()
                        .WithMany()
                        .HasForeignKey("UserId"),
                    j => j
                        .HasOne<Course>()
                        .WithMany()
                        .HasForeignKey("CourseId"),
                    j =>
                    {
                        j.HasKey("CourseId", "UserId");
                        j.ToTable("CourseLecturers");
                    }
                );
        }
    }
}
