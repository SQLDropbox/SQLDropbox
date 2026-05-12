using Microsoft.EntityFrameworkCore;
using SQLDropbox.Models;

namespace SQLDropbox.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Admin> Admins => Set<Admin>();
        public DbSet<Chapter> Chapters => Set<Chapter>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Exercise> Exercises => Set<Exercise>();
        public DbSet<Requirement> Requirements => Set<Requirement>();
        public DbSet<Solution> Solutions => Set<Solution>();
        public DbSet<Student> Students => Set<Student>();
        public DbSet<StudentExercise> StudentExercises => Set<StudentExercise>();
        public DbSet<StudentSolution> StudentSolutions => Set<StudentSolution>();        
    }
}
