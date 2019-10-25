import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AsyncValidatorFn, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, pipe, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserService, ILoginInfo, IUser } from '../../services/user.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  formGroup: FormGroup;
  constructor(private _fb: FormBuilder,
    private _router: Router,
    private _userService: UserService) {
    this.formGroup = _fb.group({
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required], this.emalDuplication()),
      category: new FormControl('', Validators.required)
    });
  }
  //validation
  emalDuplication(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(control.value)) {
        return this._userService.AnyUserByEmail(control.value).pipe(
          map(user => {
            return (user) ? { 'anyEmail': true } : null;
          })
        );
      }
      else
      {
        return of({ 'isValidEmail': true });
      }
    }
  }
  
  ngOnInit() {
  }
  load: boolean = false;
  save() {
    let loginInfo = this.formGroup.value as ILoginInfo;
    loginInfo.password = ""
    this.load = true;
    this.formGroup.disable();
    this._userService.create(loginInfo).subscribe(null, null, () => {
      this.goBack();
      this.load = false;
    });
  }
  goBack() {
    this._router.navigate(['/users']);
  }
}
