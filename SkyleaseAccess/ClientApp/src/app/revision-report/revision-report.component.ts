import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Location } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { FormGroup, FormBuilder } from '@angular/forms';
import { IFile } from '../files/files.component';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-revision-report',
  templateUrl: './revision-report.component.html',
  styleUrls: ['./revision-report.component.css'],
})
export class RevisionReportComponent implements OnInit {
  baseUrl;
  formGroup: FormGroup;
  formData = new FormData();
  fileSelect: IFile;
  src: string;
  frameVisible: boolean = true;
  constructor(private http: HttpClient,
    location: Location,
    private _donSanitizer: DomSanitizer,
    private _fb: FormBuilder,
    public _userService: UserService ) {
    this.baseUrl = (location as any)._platformLocation._doc.baseURI + "api/revisionreport";
    this.formGroup = _fb.group({
      files: []
    });
  }


   ngOnInit() {
     this.updateData();
  }
  updateData() {
    let params = new HttpParams().set("fileName", "Report.pdf");
    return this.http.get(this.baseUrl + "/document", { params: params, responseType: "blob" })
      .subscribe(blob => {
        let file = new Blob([blob], { type: 'application/pdf' });
        this.src = URL.createObjectURL(file);
      });
  }

  upload(files) {
    this.formData = new FormData();
    for (let file of files) {
      if (file.name.indexOf(".pdf") != -1)
      {
        this.frameVisible = false;
        this.fileSelect = {
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified)
        }
        this.formData.append("Report.pdf", file);
      }
    }
  }

  save() {
    this.formGroup.disable();
    this.http.post(this.baseUrl + "/uploadfile", this.formData).subscribe(null,
      error => console.error(error),
      () => {
        this.formGroup.enable();
        this.fileSelect = null;
        this.updateData();
        this.frameVisible = true;
      });
  }


  url() {
    if (this.src != undefined)
      return this._donSanitizer.bypassSecurityTrustResourceUrl(this.src);
    return this._donSanitizer.bypassSecurityTrustResourceUrl("");
    
  }

}
