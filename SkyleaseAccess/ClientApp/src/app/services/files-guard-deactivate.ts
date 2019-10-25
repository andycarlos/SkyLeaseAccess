import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FilesComponent } from '../files/files.component';

@Injectable({
    providedIn: 'root'
})
export class FilesGuardDeactivateGuard implements CanDeactivate<FilesComponent> {
  component: Object;
  route: ActivatedRouteSnapshot;

  canDeactivate(component: FilesComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    nextState: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return component.canDeActivate();
  }
}
