import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  
})
export class NavbarComponent implements OnInit {

  constructor(public _userService: UserService,
    private router: Router) { }

  ngOnInit() {
  }



  logout() {

    this._userService.logout();
    this.router.navigate(['/login']);
  }

}
