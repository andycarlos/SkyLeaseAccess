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
using Microsoft.EntityFrameworkCore;
using SkyleaseAccess.Models;

namespace SkyleaseAccess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class SectionsController : ControllerBase
    {
        private readonly ApplicationDbContex _context;
        public IHostingEnvironment _hostingEnvironment { get; }

        public SectionsController(ApplicationDbContex context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/Sections
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetSections()
        {
            return await _context.Sections.Select(x => new { Id = x.Id, Title = x.Title, Description = x.Description, items = TotalItems(x.Title) }).OrderBy(y=>y.Title).ToListAsync();
        }
        private int TotalItems(string sectionName)
        {
            var folderName = Path.Combine(_hostingEnvironment.WebRootPath, sectionName);
            if (Directory.Exists(folderName))
                return Directory.GetFiles(folderName).Count();
            return 0;
        }

        // GET: api/Sections/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Section>> GetSection(int id)
        {
            var section = await _context.Sections.FindAsync(id);

            if (section == null)
            {
                return NotFound();
            }

            return section;
        }

        // get:api/Sections/exist/title
        [HttpGet("exist")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Section>> GetSectionNameExist()
        {
            string title = Request.Headers["title"].ToString();
            if (title.ToLower() == "files")
            {
                return new Section() { Title="Files"};
            }
            var section = await _context.Sections.FirstOrDefaultAsync(x=>x.Title==title);
            if (section == null)
            {
                return new Section();
            }

            return section; //section.Title;
        }

        // get:api/Sections/getfiles   //no admin
        [HttpPost("getfiles")]
        [Authorize(Roles = "Admin, User")]
        public ActionResult<IEnumerable<FileInf>> GetFileList([FromBody]Section[] sections)
        {
            List<FileInf> resul = new List<FileInf>();
            var sectionLis = _context.Sections.Where(x => sections.Count(p => p.Id == x.Id) != 0).ToList();

            if (sectionLis == null)
            {
                return resul;
            }
            foreach (Section item in sectionLis)
            {
                var folderName = Path.Combine(_hostingEnvironment.WebRootPath, item.Title);
                if (Directory.Exists(folderName))
                    resul.AddRange(Directory.GetFiles(folderName).Select(x => new FileInf {SectionName= item.Title, FileName = x.Replace(folderName + "\\", null) }).ToList());
            }
            
            return resul.OrderBy(x => x.FileName).ToList();
        }

        // PUT: api/Sections/5
        [HttpPut("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> PutSection(int id, Section section)
        {
            if (id != section.Id)
            {
                return BadRequest();
            }
             try
            {
                Section TempSection =  _context.Sections.AsNoTracking().FirstOrDefault(x=>x.Id==id);
                _context.Entry(section).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                if (TempSection.Title != section.Title)
                {
                    var folderName = Path.Combine(_hostingEnvironment.WebRootPath, TempSection.Title);
                    var folderNameNew = Path.Combine(_hostingEnvironment.WebRootPath, section.Title);
                    if (Directory.Exists(folderName))
                    {
                        Directory.Move(  folderName, folderNameNew);
                    }
                }
            }
            catch (Exception e)
            {
                if (!SectionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Ok();
        }

        // POST: api/Sections
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Section>> PostSection([FromBody]Section section)
        {
            _context.Sections.Add(section);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSection", new { id = section.Id }, section);
        }

        [HttpPost, DisableRequestSizeLimit]
        [Route("uploadfile")]
        [Authorize(Roles = "Admin")]
        public ActionResult UploadFile([FromQuery]string section )
        {
            try
            {
                // string[] filesName = Request.Headers["fileName"].ToString().Split(',');
                //string[] filesName = fileNames.Split(',');
                //Request.Query.Where(x=>x.Key=="54").ToList();
                //_hostingEnvironment.WebRootPath
                var folderName = Path.Combine(_hostingEnvironment.WebRootPath, section);
                if (!Directory.Exists(folderName))
                    Directory.CreateDirectory(folderName);

                var files = Request.Form.Files;
                if (files.Any(x => x.Name == "fileName"))
                {
                    string[] filesName = files.FirstOrDefault(x => x.Name == "fileName").FileName.Split(',');
                    //eliminar ficheros diferentes
                    List<string> listadoEliminar = Directory.GetFiles(folderName).Where(x => filesName.Count(p => x == Path.Combine(folderName, p)) == 0).ToList();
                    foreach (var item in listadoEliminar)
                    {
                        System.IO.File.Delete(item);
                    }
                }
                else
                {
                    List<string> strFiles = Directory.GetFiles(folderName, "*", SearchOption.AllDirectories).ToList();
                    foreach (string fichero in strFiles)
                    {
                        System.IO.File.Delete(fichero);
                    }
                }
                //adicionar nuevos fichero
                if (files.Any(f => f.Length == 0 && f.Name!= "fileName"))
                {
                    return BadRequest("Files size 0");
                }

                foreach (var file in files)
                {
                    if (file.Name != "fileName")
                    {
                        var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                        var fullPath = Path.Combine(folderName, fileName);

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        // DELETE: api/Sections/5
        [HttpDelete("{id}")]
        [Authorize( Roles = "Admin")]
        public async Task<ActionResult<Section>> DeleteSection(int id)
        {
            var section = await _context.Sections.FindAsync(id);

            if (section == null)
            {
                return NotFound();
            }

            _context.Sections.Remove(section);
            await _context.SaveChangesAsync();

            var folderName = Path.Combine(_hostingEnvironment.WebRootPath, section.Title);
            if (Directory.Exists(folderName))
                 Directory.Delete(folderName,true);

            return section;
        }

        private bool SectionExists(int id)
        {
            return _context.Sections.Any(e => e.Id == id);
        }

        //get: api/sections/document   //no admin
        [HttpGet("document")]
        [Authorize(Roles = "Admin, User")]
        public FileContentResult getDocument([FromQuery]string sectionTitle, [FromQuery]string fileName)
        {
            // string physicalWebRootPath = Server.MapPath("~/");
            
            var ruta =  Path.Combine(_hostingEnvironment.WebRootPath, sectionTitle , fileName );
            MemoryStream pdf = new MemoryStream(System.IO.File.ReadAllBytes(ruta));
            return File(pdf.ToArray(), "application/pdf");

            //var ruta = _hostingEnvironment.WebRootPath + "\\doc\\aa.pdf";
            //MemoryStream pdf = new MemoryStream(System.IO.File.ReadAllBytes(ruta));
            //return File(pdf.ToArray(), "application/pdf");
        }
    }
}
