using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkyleaseAccess.Models
{
    public class FileData
    {
        public string Name { get; set; }
        public long Size { get; set; }
        public DateTime LastModified { get; set; }
    }
}
