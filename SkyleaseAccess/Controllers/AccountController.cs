using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SkyleaseAccess.Models;
using SkyleaseAccess.Services;

namespace SkyleaseAccess.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContex _context;
        private string _root = "root@skylease.aero";
        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ApplicationDbContex contex)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._roleManager = roleManager;
            this._configuration = configuration;
            this._context = contex;
        }
        [Route("GetAllUser")]
        [HttpGet]
        [Authorize( Roles = "Admin")]
        public  ActionResult<IEnumerable<object>> GetAllUsers()
        {
            List<UserInfo> users = _context.Users.Select(x => new UserInfo {
                Id = x.Id,
                Email = x.Email,
                Name = x.UserFistName,
                Lastname = x.UserLastName,
                Category = x.Category
                
            }).ToList();

            users.ForEach(x => x.Roles = new List<string>());

            var roles = _roleManager.Roles;
            foreach (var item in roles)
            {
                IList<ApplicationUser> userTemps = _userManager.GetUsersInRoleAsync(item.Name).Result;
                users.ForEach(userinfo =>
                {
                    if(userTemps.Any(userTemp=>userTemp.Id==userinfo.Id))
                        userinfo.Roles.Add(item.Name);
                });

                //foreach (UserInfo userInfo in users)
                //{
                //    //userInfo.Roles.Clear();
                //    foreach (ApplicationUser userTemp in userTemps)
                //    {
                //        if (userTemp.Id == userInfo.Id)
                //            userInfo.Roles.Add(item.Name);
                //    }
                //}
            }
            

            if (users == null)
            {
                return Ok();
            }
            return users;
        }

        //Use to valid asyn
        [Route("AnyUserByEmail")]
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public ActionResult<bool> GetAnyUserByEmail([FromQuery] string Email)
        {
            var result = _context.Users.Any(x => x.Email == Email);
            return result;
        }

        [Route("Create")]
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] UserInfo userInfo)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = userInfo.Email, UserFistName=userInfo.Name, Email = userInfo.Email, UserLastName = userInfo.Lastname, Category= userInfo.Category };
                var result = await _userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, "User");
                    var code = await _userManager.GeneratePasswordResetTokenAsync(user); 
                    string callbackUrl = Url.Action(null, null, new { code = code, email = user.Email }, Request.Scheme);
                    EmailService emailService = new EmailService(_configuration);
                    string body = "Please clicking here to activate your account: <a href=\"" + callbackUrl.Replace("api/Account/Create", "forgotPassword") + "\">link</a>";
                    emailService.SendEmail(user.Email, "Activate Account Skyleaeaccess", body);
                    return Ok();//BuildToken(user);
                }
                else
                {
                    return BadRequest(ModelState);
                }
            }
            else
            {
                return BadRequest(ModelState);
            }
        }

        [HttpPost]
        [Route("Remove")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApplicationUser>> RemoveUser([FromBody] UserInfo userInfo)
        {
            
            if (ModelState.IsValid)
            {
                //if (User.Claims.ToList().FirstOrDefault(x => x.Type == "UserName").Value != root)
                //{
                //    ModelState.AddModelError(string.Empty, "No Root user");
                //    return BadRequest(ModelState);
                //}

                var user = await _userManager.FindByEmailAsync(userInfo.Email);
                //var user = new ApplicationUser { UserName = userInfo.Email, Email = userInfo.Email };
                var result = await _userManager.DeleteAsync(user);

                if (result.Succeeded)
                {
                    return user;
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "Invalid User.");
                    return BadRequest(ModelState);
                }
            }
            else
            {
                return BadRequest(ModelState);
            }
        }

        [HttpGet]
        [Route("IsAdmin")]
        public async Task<ActionResult<List<string>>> IsAdmin()
        {
            var email = User.Claims.ToList().FirstOrDefault(x => x.Type == "UserName").Value.ToLower();
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return BadRequest("User not found.");
            var resul = await _userManager.GetRolesAsync(user);
            return Ok(resul);
        }

        // POST api/Account/SetPasswor
        [HttpPost]
        [Route("SetPassword")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetPassword([FromBody] PassChange Password)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            ApplicationUser user = null;
            if (Password.Id != null)
            {
                user = _context.Users.FirstOrDefault(x => x.Id == Password.Id);
            }
            else
            {
                var claims = User.Claims.ToList();
                user = await _userManager.FindByEmailAsync(claims.FirstOrDefault(x => x.Type == "Email").Value);
            }
            if (user == null)
            {
                return Ok("User no valid");
            }
            IdentityResult result1 = await _userManager.RemovePasswordAsync(user);
            IdentityResult result = await _userManager.AddPasswordAsync(user, Password.NewPass);

            if (!result.Succeeded)
            {
                return BadRequest(result);
            }

            return Ok();
        }

        //Roles Manayer
        [HttpGet]
        [Route("GetAllRoles")]
        [Authorize(Roles = "Admin")]
        public ActionResult GetAllRol()
        {
            return Ok(_roleManager.Roles.ToList());
        }

        [HttpPut]
        [Route("AddRolByUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> AddRolByUser(string id,[FromBody] IdentityRole role)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return Ok("User not Found.");
            var resul = _userManager.AddToRoleAsync(user, role.Name);
            if(!resul.Result.Succeeded)
                return Ok("Rol problem.");
            return Ok();
        }

        [HttpPut]
        [Route("RemoveRolByUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RemoveRolByUser(string id, [FromBody] IdentityRole role)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return Ok("User not Found.");
            var resul = _userManager.RemoveFromRoleAsync(user, role.Name);
            if (!resul.Result.Succeeded)
                return Ok("Rol problem.");
            return Ok();
        }

        //-------AllowAnonymous 
        [HttpPost]
        [Route("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginUser([FromBody] UserInfo userInfo)
        {
            if (ModelState.IsValid)
            {
                if (!_context.Users.Any(x => x.UserName == _root))
                {
                    var root = new ApplicationUser
                    {
                        UserName = _root,
                        UserFistName = "Root",
                        Email = _root,
                        UserLastName = "Root",
                        Category = "Root"
                    };
                    await _userManager.CreateAsync(root, _configuration["root"]);
                    await _userManager.AddToRoleAsync(root, "Admin");
                    await _userManager.AddToRoleAsync(root, "User");
                }

                var user = await _userManager.FindByEmailAsync(userInfo.Email);
                if (user == null)
                {
                    return Ok("User no valid");
                }
                var result = await _signInManager.PasswordSignInAsync(user, userInfo.Password, isPersistent: false, lockoutOnFailure: false);
                if (result.Succeeded)
                {
                    var rol =await _userManager.GetRolesAsync(user);
                    return BuildToken(user,rol );
                }
                else
                {
                    return Ok("Invalid Password");
                }
            }
            else
            {
                return Ok("Data error");
            }
        }

        [HttpPost]
        [Route("ForgotPassword")]
        [AllowAnonymous]
        public async Task<ActionResult> ForgotPassword([FromBody]ForgotPass model)
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByNameAsync(model.Email);
                if (user == null )
                {
                    return Ok("That Email not exist in the database.");
                }

                var code = await _userManager.GeneratePasswordResetTokenAsync(user); //BuildTokenPass(user);//  
                //string ppp = Request.Scheme+"://"+ Request.Host.Value+ "/api/Account/ForgotPasswordVAlid?userId=" + user.Id+"&code="+code;
                //var url= Url.Action("fewa","sss", new { userId = user.Id, code = code },ppp, pp);
                string callbackUrl = Url.Action(null, null,new {  code = code , email=user.Email },  Request.Scheme);
                EmailService emailService = new EmailService(_configuration);
                string body = "Please change your password by clicking here: <a href=\"" + callbackUrl.Replace("api/Account/ForgotPassword", "forgotPassword") + "\">link</a>";
                emailService.SendEmail(user.Email, "Forgot Password Skyleaeaccess",body);
                return Ok(callbackUrl.Replace("api/Account/ForgotPassword", "forgotPassword"));
            }

            // If we got this far, something failed, redisplay form
            return Ok("Data invalid.");
        }

        [HttpPost]
        [Route("ForgotPasswordValid")]
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmailValid([FromBody]ForgotPasswordValid model)
        {
            if (model.Email == null || model.Token == null || model.Passwrod == null)
            {
                return Ok("Some data is Empty");
            }
            
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok("That Email not exist in the database.");
            }

            var result = await _userManager.ResetPasswordAsync(user,model.Token,model.Passwrod);
            if (result.Succeeded)
            {
                return Ok(user.Email);
            }

            return Ok("Invalid Token");
        }

        private IActionResult BuildToken(ApplicationUser userInfo,IList<string> rol )
        {
            var claims = new List<Claim>()
            {
                new Claim("UserName", userInfo.Email),
                new Claim("Email", userInfo.Email),
                new Claim("UserLastName", userInfo.UserLastName),
            };
            foreach (var item in rol)
            {
                claims.Add(new Claim(ClaimTypes.Role, item));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Llave_super_secreta"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiration = DateTime.UtcNow.AddMinutes(120);
            
            JwtSecurityToken token = new JwtSecurityToken(
               issuer: "skylease.com",
               audience: "skylease.com",
               claims: claims,
               expires: expiration,
               signingCredentials: creds);


            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = expiration,
                roles = rol
            });

        }
       
    }
}