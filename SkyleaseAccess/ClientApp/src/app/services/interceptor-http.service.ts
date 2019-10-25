import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorHttpService implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //return next.handle(req);
    let temp = this._userService.isLogin();
    if (temp === false) {
      this._userService.logout();
      if (this.router.url.indexOf("login")==-1 && this.router.url.indexOf("forgotPassword") == -1) {
        this.router.navigate(['/login']);
        return of();
      }
      else
      {
        return next.handle(req);
      }
    }
    if (temp===true)
    {
      const newReq = req.clone({
        headers: req.headers.set("Authorization", "Bearer " + this._userService.token)
      });
      return next.handle(newReq);
    }
    return next.handle(req);
  }

  constructor(private _userService: UserService,
    private router: Router) { }
}
