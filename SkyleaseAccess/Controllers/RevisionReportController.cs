using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SkyleaseAccess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class RevisionReportController : ControllerBase
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public RevisionReportController(IHostingEnvironment hostingEnvironment)
        {
            this._hostingEnvironment = hostingEnvironment;
        }

        [HttpPost, DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = 2147483647)]
        [Route("uploadfile")]
        [Authorize(Roles = "Admin")]
        public ActionResult UploadFile()
        {
            try
            {
                var folderName = _hostingEnvironment.WebRootPath;

                var files = Request.Form.Files;
                //adicionar nuevos fichero
                if (files.Any(f => f.Length == 0))
                {
                    return BadRequest("Files size 0");
                }

                foreach (var file in files)
                {
                    var fullPath = Path.Combine(folderName, file.Name);
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }
                }
                files = null;
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("document")]
        public ActionResult getDocument([FromQuery]string fileName)
        {
            string ruta = Path.Combine(_hostingEnvironment.WebRootPath, fileName);
            if (!System.IO.File.Exists(ruta))
                return BadRequest("File not found.");

            FileInfo a = new FileInfo(ruta);

            string mimeType = "application/unknown";
            string ext = System.IO.Path.GetExtension(ruta).ToLower();
            Microsoft.Win32.RegistryKey regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (regKey != null && regKey.GetValue("Content Type") != null)
                mimeType = regKey.GetValue("Content Type").ToString();

            MemoryStream pdf = new MemoryStream(System.IO.File.ReadAllBytes(ruta));
            var prueba = File(pdf, mimeType, a.Name, true);
            return prueba;
        }
    }
}