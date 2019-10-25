import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, IForgotPassword } from '../services/user.service';
import { Subscribable, Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  constructor(private _userService: UserService,
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute) {
    this.formGroupPass = _fb.group({
      password: new FormControl('', [Validators.required, Validators.minLength(5)]),
      passwordConf: new FormControl('', [Validators.required])
    }, { validators: this.checkPasswords });
  }

  formGroupPass: FormGroup;
  sub: Subscription;
  email: string;
  token: string;
  error;

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.get('password').value;
    let confirmPass = group.get('passwordConf').value;
    return pass === confirmPass ? null : { notSame: true }
  }

  ngOnInit() {
    this.sub = this._route
      .queryParams
      .subscribe(params => {
        this.email = params['email'];
        this.token = params['code'];
      });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  savePass() {
     let data: IForgotPassword = {
       passwrod: this.formGroupPass.get("password").value as string,
       email: this.email,
       token: this.token
    }
    this._userService.forgotPasswordValid(data).subscribe(x => {
      if (x == this.email)
        this._router.navigate(['/login'], { queryParams: { email: this.email } });
      else
        this.error = x;
    });
  }
}
