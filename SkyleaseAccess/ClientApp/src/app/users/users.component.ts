import { Component, OnInit } from '@angular/core';
import { IUser, UserService, IPassWord,  IRole } from '../services/user.service';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ISection, SectionService } from '../services/section.service';
import { SectionUsersService, ISectionUser } from '../services/section-users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  constructor(private _userService: UserService,
    private _sectionService: SectionService,
    private _sectionUsersService: SectionUsersService,
    private _fb: FormBuilder,
    private _router: Router) {
    this.formGroupPass = _fb.group({
      password: new FormControl('', [Validators.required, Validators.minLength(5)]),
      passwordConf: new FormControl('', [Validators.required])
    }, { validators: this.checkPasswords });
  }
  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.get('password').value;
    let confirmPass = group.get('passwordConf').value;
    return pass === confirmPass ? null : { notSame: true }
  }

  userList: IUser[] = [];
  sectionList: ISection[] = [];
  RolesList: IRole[] = [];
  load: boolean = false;
  formGroupPass: FormGroup;
  filter: string = "";
  pageSize: number = 10;
  page: number = 1;

  ngOnInit() {
    this.load = true;
    this._userService.getAllUser().subscribe(x => {
      this.userList = x;
      this.load = false;
      this.ordenByUser('category');
    });
  }


  userSelect: IUser;
  editPassword: boolean = false;
  editPasswordUser(user: IUser)
  {
    this.editPassword = true;
    this.formGroupPass.reset();
    this.userSelect = user;
  }
  editCancel() {
    this.editPassword = false;
  }
  savePass() {
    this.editPassword = false;
    const pass: IPassWord = {
      id: this.userSelect.id,
      NewPass: this.formGroupPass.get('password').value,
      OldPass: null
    };
    this._userService.setPassWord(pass).subscribe();
  }

  editAccess: boolean = false;
  editAccessUser(user: IUser) {
    this.editAccess = true;
    this.userSelect = user;
    this.sectionList = [];

    this._sectionService.getSectionAll().subscribe(x => {

      this.sectionList = x;
      this._sectionUsersService.getListSectionByUserId(user.id).subscribe(z => {

        this.sectionList = this.sectionList.filter(sect => {
          if (z.some(valor => valor.id == sect.id)) {
            sect.activ = true;
          }
          else {
            sect.activ = false;
          }
          return true;
        });
      });

    });
  }
  editAccessCancel() {
    this.editAccess = false;
  }
  editAccessUserUpDate(section: ISection) {
    const sectionUser: ISectionUser = {
      SectionId: section.id,
      UserId: this.userSelect.id
    }
    if (section.activ)
    {
      this._sectionUsersService.delectSectionUser(sectionUser).subscribe();
    }
    else
    {
      this._sectionUsersService.AddSectionUser(sectionUser).subscribe();
    }
    section.activ = !section.activ;
    
  }

  isDelectUser: boolean = false;
  delect(user: IUser) {
    this.userSelect = user;
    this.isDelectUser = true;
  }
  delectCancel() {
    this.isDelectUser = false;
  }
  confirmDelect() {
    this._userService.delect(this.userSelect).subscribe(x => {
      this.userList = this.userList.filter(z => z.email != x.email);
      this.isDelectUser = false;
    });
  }

  editRoles: boolean = false;
  editRolUser(user: IUser) {
    this.editRoles = true;
    this.userSelect = user;
    this.RolesList = [];

    this._userService.GetListRoles().subscribe(x => {
      this.RolesList = x;
      this.RolesList.forEach(x => {
        if (user.roles.some(usRol => usRol == x.name)) {
          x.activ = true;
        }
        else
        {
          x.activ = false;
        }
       });
    });
  }
  editRolUserUpDate(rol: IRole) {
    if (rol.activ) {
      this._userService.RemoveRolByUser(this.userSelect, rol).subscribe();
      this.userSelect.roles = this.userSelect.roles.filter(x => x != rol.name);
    }
    else {
      this._userService.AddRolByUser(this.userSelect, rol).subscribe();
      this.userSelect.roles.push(rol.name);
    }
  }
  editRolesCancel() {
    this.editRoles = false;
  }

  linkAddUser() {
    this._router.navigate(['/usersAdd']);
  }

  ordernEmail: string;
  ordernName: string;
  ordernCategory: string;
  ordenAsed: string;
  ordenByUser(userProperty: string) {
   /* if (userProperty == "name") {
      this.userList.sort((a: IUser, b: IUser) => (a['name'] + a['lastname'] > b['name'] + b['lastname']) ? -1 : 1);
      return;
    }*/
    if (this.ordenAsed !== userProperty) {
      this.ordernEmail = "";
      this.ordernName = "";
      this.ordernCategory = "";
      switch (userProperty) {
        case "name":
          this.ordernName = "↑";
          break;
        case "email":
          this.ordernEmail = "↑";
          break;
        case "category":
          this.ordernCategory = "↑";
          break;
        default:
      }
      this.userList.sort((a: IUser, b: IUser) => (a[userProperty].toUpperCase() > b[userProperty].toUpperCase()) ? 1 : (a[userProperty].toUpperCase() < b[userProperty].toUpperCase()) ? -1 : 0);
      this.ordenAsed = userProperty;
    }
    else {
      this.ordernEmail = "";
      this.ordernName = "";
      this.ordernCategory = "";
      switch (userProperty) {
        case "name":
          this.ordernName = "↓";
          break;
        case "email":
          this.ordernEmail = "↓";
          break;
        case "category":
          this.ordernCategory = "↓";
          break;
        default:
      }
      this.userList.sort((a: IUser, b: IUser) => (a[userProperty].toUpperCase() < b[userProperty].toUpperCase()) ? 1 : (a[userProperty].toUpperCase() > b[userProperty].toUpperCase()) ? -1 : 0);
      this.ordenAsed = "";
    }
    
  }

}
