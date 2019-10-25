using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Net.Http.Headers;
using SkyleaseAccess.Models;

namespace SkyleaseAccess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class FilesController : ControllerBase
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private string FolderName = "Files";
        public FilesController(IHostingEnvironment hostingEnvironment)
        {
            this._hostingEnvironment = hostingEnvironment;
        }
        [HttpPost, DisableRequestSizeLimit,RequestFormLimits(MultipartBodyLengthLimit = 2147483647)]
        [Route("uploadfile")]
        [Authorize(Roles = "Admin,File_Add")]
        public ActionResult UploadFile()
        {
            try
            {
                var folderName = Path.Combine(_hostingEnvironment.WebRootPath,FolderName);
                if (!Directory.Exists(folderName))
                    Directory.CreateDirectory(folderName);

                var files = Request.Form.Files;
                //adicionar nuevos fichero
                if (files.Any(f => f.Length == 0))
                {
                    return BadRequest("Files size 0");
                }

                foreach (var file in files)
                {
                        var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                        var fullPath = Path.Combine(folderName, fileName);

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                }
                files = null;
                return Ok();
            }
            catch (Exception e )
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("getallfiles")]
        [Authorize(Roles = "Admin,File_Add,File_Del,File_DownLoad")]
        public ActionResult<IEnumerable<FileData>> GetAllFiles()
        {
           List<FileData> resul = new List<FileData>();
                var folderName = Path.Combine(_hostingEnvironment.WebRootPath, "Files");
                if (Directory.Exists(folderName))
                    resul.AddRange(Directory.GetFiles(folderName).Select(x=> {
                        var fi1 = new FileInfo(x);
                        FileData fileData = new FileData()
                        {
                            Name = fi1.Name,
                            Size = fi1.Length,
                            LastModified = fi1.LastWriteTime
                        };
                        return fileData;
                    }).ToList());
            return resul; //resul.OrderByDescending(x => x.LastModified).ToList();
        }

        [HttpGet("document")]
        [Authorize(Roles = "Admin,File_DownLoad")]
        public ActionResult getDocument([FromQuery]string fileName)
        {
            string ruta = Path.Combine(_hostingEnvironment.WebRootPath, "Files", fileName);
            if (!System.IO.File.Exists(ruta))
                return BadRequest("File not found.");

            FileInfo a = new FileInfo(ruta);

            string mimeType = "application/unknown";
            string ext = System.IO.Path.GetExtension(ruta).ToLower();
            Microsoft.Win32.RegistryKey regKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (regKey != null && regKey.GetValue("Content Type") != null)
                mimeType = regKey.GetValue("Content Type").ToString();
            
            MemoryStream pdf = new MemoryStream(System.IO.File.ReadAllBytes(ruta));
            var prueba =  File(pdf, mimeType,a.Name,true);
            return prueba;

            //var ruta = _hostingEnvironment.WebRootPath + "\\doc\\aa.pdf";
            //MemoryStream pdf = new MemoryStream(System.IO.File.ReadAllBytes(ruta));
            //return File(pdf.ToArray(), "application/pdf");
        }

        [HttpPost("delete")]
        [Authorize(Roles = "Admin,File_Del")]
        public ActionResult Delete([FromQuery]string fileName)
        {
            string ruta = Path.Combine(_hostingEnvironment.WebRootPath, "Files", fileName);
            if (!System.IO.File.Exists(ruta))
                return BadRequest("File not found.");
            System.IO.File.Delete(ruta);
            return Ok();
        }
    }
}