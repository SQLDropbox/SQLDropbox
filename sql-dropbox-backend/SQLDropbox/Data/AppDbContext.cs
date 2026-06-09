using Microsoft.EntityFrameworkCore;
using SQLDropbox.Models;

namespace SQLDropbox.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Chapter> Chapters => Set<Chapter>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Exercise> Exercises => Set<Exercise>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Requirement> Requirements => Set<Requirement>();
        public DbSet<Schema> Schemas => Set<Schema>();
        public DbSet<Solution> Solutions => Set<Solution>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserExercise> UserExercises => Set<UserExercise>();
        public DbSet<UserSolution> UserSolutions => Set<UserSolution>();

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


            modelBuilder.Entity<Chapter>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<Course>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<Exercise>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<Requirement>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<Schema>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<Solution>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<User>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<UserExercise>()
                .HasQueryFilter(x => x.DeletedAt == null);

            modelBuilder.Entity<UserSolution>()
                .HasQueryFilter(x => x.DeletedAt == null);
        }
    }
}
