using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace SkyleaseAccess.Models
{
    public class ApplicationUser:IdentityUser
    {
        public string UserFistName { get; set; }
        public string UserLastName { get; set; }
        public string Category { get; set; }
        public List<SectionUser> SectionUsers { get; set; }
    }
}
