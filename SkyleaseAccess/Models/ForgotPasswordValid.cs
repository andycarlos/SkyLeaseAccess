using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkyleaseAccess.Models
{
    public class ForgotPasswordValid
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string Passwrod { get; set; }
    }
}
