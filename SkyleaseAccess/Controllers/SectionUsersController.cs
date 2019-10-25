using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SkyleaseAccess.Models;

namespace SkyleaseAccess.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class SectionUsersController : ControllerBase
    {
        private readonly ApplicationDbContex _context;

        public UserManager<ApplicationUser> _userManager;
        private readonly IHostingEnvironment _hostingEnvironment;

        public SectionUsersController(ApplicationDbContex context,
             UserManager<ApplicationUser> userManager,
             IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _userManager = userManager;
            this._hostingEnvironment = hostingEnvironment;
        }

        // GET: api/SectionUsers //no admin
        [HttpGet]
        [Authorize(Roles = "Admin, User")]
        public async Task<ActionResult<List<Section>>> GetSectionUser()
        {
            var email = User.Claims.ToList().FirstOrDefault(x => x.Type == "Email").Value;
            var userTempo = await _userManager.FindByEmailAsync(email);
            if (userTempo == null)
                return new List<Section>();

            var sectionUser = _context.SectionUsers.Where(d => d.UserId == userTempo.Id).Include(x => x.Section).Select(p => new Section
            {
                Id = p.Section.Id,
                Title = p.Section.Title,
                Description = p.Section.Description,
                Items = TotalItems(p.Section.Title)
            }).ToList();

            if (sectionUser == null)
            {
                return NotFound();
            }

            return sectionUser;
        }
        private int TotalItems(string sectionName)
        {
            var folderName = Path.Combine(_hostingEnvironment.WebRootPath, sectionName);
            if (Directory.Exists(folderName))
                return Directory.GetFiles(folderName).Count();
            return 0;
        }

        // GET: api/SectionUsers/5
        [HttpGet("{id}")]
        [Authorize(Roles ="Admin")]
        public  ActionResult<List<Section>> GetSectionUser(string id)
        {
           var sectionUser =  _context.SectionUsers.Where(d => d.UserId == id).Include(x=>x.Section).Select(p=>new Section {
               Id=p.Section.Id,
               Title=p.Section.Title
           }).ToList();
            string pirue =JsonConvert.SerializeObject(sectionUser, Formatting.Indented,
                new JsonSerializerSettings()
                {
                    ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                });
            if (sectionUser == null)
            {
                return NotFound();
            }

            return sectionUser;
        }

        [HttpPost("Add")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SectionUser>> PostSectionUser(SectionUser sectionUser)
        {
            _context.SectionUsers.Add(sectionUser);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (SectionUserExists(sectionUser.SectionId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetSectionUser", new { id = sectionUser.SectionId }, sectionUser);
        }

        // DELETE: api/SectionUsers/5
        [HttpPost("Delect")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SectionUser>> DeleteSectionUser(SectionUser sectionUser)
        {
            //var sectionUser = await _context.SectionUsers.FindAsync(id);
            if (sectionUser.UserId == null || sectionUser.SectionId == 0)
            {
                return NotFound();
            }

            _context.SectionUsers.Remove(sectionUser);
            await _context.SaveChangesAsync();

            return sectionUser;
        }

        private bool SectionUserExists(int id)
        {
            return _context.SectionUsers.Any(e => e.SectionId == id);
        }
    }
}
