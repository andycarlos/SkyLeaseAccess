import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl;
  constructor(private http: HttpClient,
    location: Location) {
    this.baseUrl = (location as any)._platformLocation._doc.baseURI + "api/Account";
  }

  token: string='';
  tokenUserExpiration: string='';
  loginNow: boolean = false;
  roles: string[] = [];
  userEmail: string; //for navbar

  //
  rolAdmin: boolean = false;
  rolUser: boolean = false;
  rolFileAdd: boolean = false;
  rolFileDel: boolean = false;
  rolFileDownload: boolean = false;
  access(rolesTemp: string[]) {
    this.roles = rolesTemp;
    if (this.roles.some(x => x == "Admin")) {
      this.rolAdmin = true;
    } else { this.rolAdmin = false; }

    if (this.roles.some(x => x == "User")) {
      this.rolUser = true;
    } else { this.rolUser = false; }

    if (this.roles.some(x => x == "File_Add")) {
      this.rolFileAdd = true;
    } else { this.rolFileAdd = false; }

    if (this.roles.some(x => x == "File_Del")) {
      this.rolFileDel = true;
    } else { this.rolFileDel = false; }

    if (this.roles.some(x => x == "File_DownLoad")) {
      this.rolFileDownload = true;
    } else { this.rolFileDownload = false; }
  }



  //Get all Users
  getAllUser(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.baseUrl + "/GetAllUser");
  }
  AnyUserByEmail(email: string): Observable<boolean> {
    let param = new HttpParams().set("Email", email);
    return this.http.get<boolean>(this.baseUrl + "/AnyUserByEmail", { params: param });
  }

  setPassWord(passInfo: IPassWord): Observable<any>
  {
    return this.http.post(this.baseUrl + "/SetPassword", passInfo);
  }

  forgotPassword(Email: IEmail): Observable<any> {
    return this.http.post(this.baseUrl + "/ForgotPassword", Email);
  }
  forgotPasswordValid(ForgotPassword: IForgotPassword): Observable<any> {
    return this.http.post(this.baseUrl + "/ForgotPasswordValid", ForgotPassword);
  }

  isAdmin(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + "/IsAdmin");
  }

  login(loginInfo: ILoginInfo): Observable<any>
  {
    return this.http.post<any>(this.baseUrl + "/Login", loginInfo);
  }
  create(loginInfo: ILoginInfo): Observable<any> {
    return this.http.post<any>(this.baseUrl + "/Create", loginInfo);
  }
  delect(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.baseUrl + "/Remove", user);
  }

  obtenerToken(): string{
    return this.token;
  }
  obtenerTokenExpriacion(): string {
    return this.tokenUserExpiration;
  }

  GetListRoles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(this.baseUrl + "/GetAllRoles");
  }
  AddRolByUser(user: IUser, rol: IRole) {
    return this.http.put(this.baseUrl + "/AddRolByUser/" + user.id, rol);
  }
  RemoveRolByUser(user: IUser, rol: IRole) {
    return this.http.put(this.baseUrl + "/RemoveRolByUser/" + user.id, rol);
  }

  logout() {
    this.token = '';
    this.tokenUserExpiration = '';
    this.loginNow = false;
   // this.root = false;

    //localStorage.removeItem("tokeUser");
    //localStorage.removeItem("tokenUserExpiration");
  }
  
  isLogin(): boolean {

    let exp = this.tokenUserExpiration;
    if (!exp) {
      this.logout();
      return false;
    }
    let now = new Date().getTime();
    let dateExp = new Date(exp);

    if (now > dateExp.getTime()) {
      //ya expiro
      this.logout();
      return false;
    }
    else {
      this.loginNow = true;
      return true;
    }
  }
}


export interface IEmail {
  email: string;
}
export interface IUser{
  id: string;
  email: string;
  name: string;
  lastname: string;
  category: string;
  roles: string[];
}
export interface IPassWord {
  id: string;
  OldPass: string;
  NewPass: string;
}
export interface ILoginInfo {
  name: string;
  lastname: string;
  email: string;
  password: string;
  category: string;
}

export interface IForgotPassword {
  email: string;
  token: string;
  passwrod: string;
}
export interface IRole {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: string;
  activ: boolean;
}
