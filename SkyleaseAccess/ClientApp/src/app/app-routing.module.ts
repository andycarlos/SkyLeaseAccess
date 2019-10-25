import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SectionComponent } from './section/section.component';
import { SectionAddComponent } from './section/section-add/section-add.component';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { UserAddComponent } from './users/user-add/user-add.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FilesComponent } from './files/files.component';
import { FilesGuardDeactivateGuard } from './services/files-guard-deactivate';
import { AboutComponent } from './about/about.component';
import { PhoneDirectoryComponent } from './phone-directory/phone-directory.component';
import { RevisionReportComponent } from './revision-report/revision-report.component';

const routes: Routes = [
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'report', component: RevisionReportComponent, canActivate: [AuthGuardService] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuardService] },
  { path: 'phone', component: PhoneDirectoryComponent, canActivate: [AuthGuardService] },
  { path: 'files', component: FilesComponent, canActivate: [AuthGuardService], canDeactivate:[FilesGuardDeactivateGuard] },
  { path: 'usersAdd', component: UserAddComponent, canActivate: [AuthGuardService] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuardService]},
  { path: 'sectionEdit/:id', component: SectionAddComponent, canActivate: [AuthGuardService]},
  { path: 'sectionAdd', component: SectionAddComponent, canActivate: [AuthGuardService]},
  { path: 'section', component: SectionComponent, canActivate: [AuthGuardService] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService]},
  { path: '**', component: HomeComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  
})
export class AppRoutingModule { }
