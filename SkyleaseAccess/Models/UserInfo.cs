using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkyleaseAccess.Models
{
    public class UserInfo
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Lastname { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Category { get; set; }
        public List<string> Roles { get; set; }

    }
    public class PassChange
    {
        public string Id { get; set; }
        public string OldPass { get; set; }
        public string NewPass { get; set; }
    }
    public class IRole
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string NormalizedName { get; set; }
        public string ConcurrencyStamp { get; set; }
    }
}
