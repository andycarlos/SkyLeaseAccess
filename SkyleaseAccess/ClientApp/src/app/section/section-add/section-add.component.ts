import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { SectionService, ISection } from '../../services/section.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-section-add',
  templateUrl: './section-add.component.html',
  styleUrls: ['./section-add.component.css']
})
export class SectionAddComponent implements OnInit {

  constructor(
    private _router:Router,
    private _fb: FormBuilder,
    private _sectionService: SectionService,
    private _activateRoute: ActivatedRoute)
  {
    this.formGroup = this._fb.group(
      {
        title: new FormControl('', Validators.required, this.searchUser() ), // this.searchUser()  ['', Validators.required] , _userValidator.validate  this.valitar.validate.bind(this.valitar)
        description:[''],
        files:['']
      });
  }
  //Validacion asyncronica por funcion
  searchUser(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      if (this.formGroup.disabled)
        return null;
      return this._sectionService.getSectionByTitle(control.value).pipe(
        map(isTaken => {
          if (this.editMode)
            return (isTaken.title != null && isTaken.id != this.sectionID) ? { 'uniqueAlterEgo': true } : null;
          return (isTaken.title != null) ? { 'uniqueAlterEgo': true } : null;
        })
      );
    };
  }

  


  formGroup: FormGroup;
  filesNames: string[] = [];//user for view
  filesNamesOld: string[] = [];
  formData = new FormData(); //user for send API
  progress: number = 0;
  sectionID: number;
  editMode: boolean;
  ngOnInit()
  {
    
    this._activateRoute.params.subscribe(params => {
     // console.log("1");
      if (!params['id'])
      {
        this.editMode = false;
        return;
      }
      this.load = true;
      this.sectionID = params['id'];
      this._sectionService.getSection(this.sectionID).subscribe(x =>
      {
       // console.log("2");
        this.editMode = true;
        this.formGroup.patchValue(x);
        let sectionArrar: ISection[] = [];
        sectionArrar.push(x);
        this._sectionService.getFileList(sectionArrar).subscribe(x =>
        {
          x.forEach(p => this.filesNamesOld.push(p.fileName));
          this.load = false;
        });
      },
        error => this._router.navigate(['/home']));
    });

  }
  load: boolean = false;
  removelFile(nombreFile: string) {
    this.formData.delete(nombreFile);
    this.filesNames = this.filesNames.filter(x => x !== nombreFile);
  }
  removelFileOld(nombreFile: string) {
    this.filesNamesOld = this.filesNamesOld.filter(x => x !== nombreFile);
  }

  upload(files) {
     for (let file of files) {
       const leng = (file.name as string).length;
       if ((file.name as string).substr(leng - 3, 3) == "pdf")
       {
         this.formData.append(file.name, file);
         this.filesNames.push(file.name);
       }
    }
  } 

  save()
  {
    this.formGroup.disable();

    let section = this.formGroup.value as ISection;
    if (this.editMode)
    {
      section.id = this.sectionID;
      this._sectionService.editSection(this.sectionID, section).subscribe(null, null, () =>
      {
        this.saveFile();
      });
    }
    else
    {
      this._sectionService.addSection(section).subscribe(null, null, () =>
      {
        this.saveFile();
      });
    }
  }

  saveFile()
  {
    this._sectionService.upLoadFile(this.formData,
                                    this.formGroup.get('title').value,
                                    this.filesNamesOld)
      .subscribe(event =>
      {
        if (event.type === HttpEventType.UploadProgress)
        {
          this.progress = Math.round(100 * event.loaded / event.total);
          if (this.progress == 100) {
            this.load = true;
          }

        }
      },
        error => console.error(error),
        () => {
          this._router.navigate(['/section']);
          this.formGroup.enable();
        });
  }
  
  goBack()
  {
    this._router.navigate(['/section']);
  }
}
