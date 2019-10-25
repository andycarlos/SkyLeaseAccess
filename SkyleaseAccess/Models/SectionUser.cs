using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SkyleaseAccess.Models
{
    public class SectionUser
    {
        public int SectionId { get; set; }
        public Section Section { get; set; }

        public string UserId { get; set; }
        public  ApplicationUser User { get; set; }
    }
}
