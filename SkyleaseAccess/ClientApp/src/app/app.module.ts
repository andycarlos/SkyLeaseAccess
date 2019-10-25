import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorHttpService } from './services/interceptor-http.service';
import { AppRoutingModule } from './app-routing.module';

//componet
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { SectionComponent } from './section/section.component';
import { SectionAddComponent } from './section/section-add/section-add.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { UserAddComponent } from './users/user-add/user-add.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

//pipe
import { CutparagraphPipe } from './pipe/cutparagraph.pipe';
import { FilterSectionPipe } from './pipe/filter-section.pipe';
import { FilterUserPipe } from './pipe/filter-user.pipe';
import { FilterFileInfoPipe } from './pipe/filter-file-info.pipe';
import { FilesizePipe } from './pipe/file-size.pipe';
//ng boostrap
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FilesComponent } from './files/files.component';
import { AboutComponent } from './about/about.component';
import { PhoneDirectoryComponent } from './phone-directory/phone-directory.component';
import { RevisionReportComponent } from './revision-report/revision-report.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    SectionComponent,
    SectionAddComponent,
    UsersComponent,
    LoginComponent,
    UserAddComponent,
    CutparagraphPipe,
    FilterSectionPipe,
    FilterUserPipe,
    FilterFileInfoPipe,
    ForgotPasswordComponent,
    FilesComponent,
    FilesizePipe,
    AboutComponent,
    PhoneDirectoryComponent,
    RevisionReportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbPaginationModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: InterceptorHttpService, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
