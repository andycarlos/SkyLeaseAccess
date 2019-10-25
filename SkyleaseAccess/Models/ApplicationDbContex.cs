using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace SkyleaseAccess.Models
{
    public class ApplicationDbContex:IdentityDbContext<ApplicationUser>
    {

        public ApplicationDbContex(DbContextOptions<ApplicationDbContex> options)
            :base(options)
        {
        }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            modelBuilder.Entity<SectionUser>()
                .HasKey(bc => new { bc.SectionId ,bc.UserId });
            
            base.OnModelCreating(modelBuilder);
        }
        public DbSet<Section> Sections { get; set; }
        public DbSet<SectionUser> SectionUsers { get; set; }
                                           // public  
    }
}
