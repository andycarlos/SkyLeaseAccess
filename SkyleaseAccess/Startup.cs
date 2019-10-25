using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SkyleaseAccess.Models;
using System;
using System.Text;


//"defaultConnection1": "Data Source=WMIA0564\\SQLEXPRESS;Initial Catalog=Skyleaesaccess;User ID=sa;Password=123456;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False",
namespace SkyleaseAccess
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContex>(option =>
           option.UseSqlServer(Configuration.GetConnectionString("defaultConnection")));


            //add config Usuarios
            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 5;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireDigit = false;
                
            })
                .AddEntityFrameworkStores<ApplicationDbContex>()
                .AddDefaultTokenProviders();
            services.Configure<DataProtectionTokenProviderOptions>(o =>
            {
                o.TokenLifespan = TimeSpan.FromDays(7);
            });

            //json web token
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = "skylease.com",
                        ValidateAudience = true,
                        ValidAudience = "skylease.com",
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Llave_super_secreta"])),
                        ClockSkew = TimeSpan.Zero
                    };
                });
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env,
            RoleManager<IdentityRole> _roleManager)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseAuthentication();
            if (!_roleManager.RoleExistsAsync("Admin").Result)
            {
                var role = new IdentityRole("Admin");
                _ = _roleManager.CreateAsync(role).Result;
            }
            if (!_roleManager.RoleExistsAsync("User").Result)
            {
                var role = new IdentityRole("User");
                _ = _roleManager.CreateAsync(role).Result;
            }
            if (!_roleManager.RoleExistsAsync("File_Add").Result)
            {
                var role = new IdentityRole("File_Add");
                _ = _roleManager.CreateAsync(role).Result;
            }
            if (!_roleManager.RoleExistsAsync("File_Del").Result)
            {
                var role = new IdentityRole("File_Del");
                _ = _roleManager.CreateAsync(role).Result;
            }
            if (!_roleManager.RoleExistsAsync("File_DownLoad").Result)
            {
                var role = new IdentityRole("File_DownLoad");
                _ = _roleManager.CreateAsync(role).Result;
            }

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}
