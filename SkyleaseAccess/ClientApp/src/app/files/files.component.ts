import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpParams, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { SectionService } from '../services/section.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  constructor(private _fb: FormBuilder,
    private http: HttpClient,
    location: Location,
    private sectionService: SectionService,
    public _userService: UserService) {
    this.baseUrl = (location as any)._platformLocation._doc.baseURI + "api/files";
    this.formGroup = _fb.group({
      files: []
    });
  }
  formGroup: FormGroup;
  formData = new FormData();
  fileSelect: IFile;
  fileList: IFile[] = [];
  load;
  page=1;
  pageSize = 10;

  baseUrl;
  progress;
  serverWiter: boolean = false;
  loaded: number;
  total: number;
  subcrip: ISubscription[] = [];
  errorUpload: boolean = false;

  loadData() {
    this.fileList = [];
    this.load = true;
    this.http.get<IFile[]>(this.baseUrl + "/getallfiles").subscribe(x => {
      x.forEach(file => {
        let d: IFile = {
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified)
        }
        this.fileList.push(d);
      });
      this.fileList = this.fileList.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
      this.load = false;
    });
  }
  canDeActivate(): boolean {
    if (this.formGroup.disabled)
      return false;
    return true;
  }

  ngOnInit() {
    this.loadData();
  }

  //Add
  upload(files) {
    this.formData = new FormData();
    for (let file of files) {
      this.fileSelect = {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified)
      }
      this.formData.append(file.name, file);
    }
  }
  save() {
    this.formGroup.disable();
    const uploadReq = new HttpRequest('POST', this.baseUrl + "/uploadfile", this.formData, {
      reportProgress: true,
    });
    this.http.request(uploadReq).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
          this.progress = (100 * event.loaded / event.total).toFixed(2);
        this.loaded = event.loaded;
        this.total = event.total;
        if (this.progress == 100) {
          this.serverWiter = true;
        }
      }
    },
    error => {
      this.progress = 100;
      this.errorUpload = true;
      this.serverWiter = false;
      this.formGroup.enable();
    },
    () => {
      this.serverWiter = false;
      this.formGroup.enable();
      this.fileSelect = null;
      this.loadData();
    });
  }

  closeErrorUpload() {
    this.errorUpload = false;
  }

  //Donwload
  donwload(file: IFile, button: HTMLButtonElement) {
    let fin = false;
    this.subcrip = this.subcrip.filter(x => {
      if (x.id == button.id) {
        x.subcription.unsubscribe();
        fin = true;
        button.innerHTML = "DonwLoad";
      }
      else
        return x;
    });
    
    if (fin)
      return;
    button.innerHTML = `<div class="spinner-grow text-light spinner-grow-sm" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                      Loading...`;
    let params = new HttpParams().set("fileName", file.name);
    const sub = this.http.request<HttpEvent<Blob>>(new HttpRequest("GET", this.baseUrl + "/document", null,
      { params: params, reportProgress: true, responseType: "blob" }))
      .subscribe(event => {
        if (event.type === HttpEventType.DownloadProgress) {
          button.innerHTML = (100 * event.loaded / event.total).toFixed(2) + "% Cancel";
        }
        if (event.type === HttpEventType.Response) {
          const downloadedFile = new Blob([event.body as any], { type: event.body.type as any });
          saveAs(downloadedFile, file.name, {
            type: downloadedFile.type, 
          });
          button.innerHTML = "DonwLoad";
          this.subcrip = this.subcrip.filter(x => x.id != button.id);
        }
      });

    this.subcrip.push({
      subcription:sub ,
      id: button.id
    });
  }

  //Delecte
  fileSelectDelete: IFile;
  fileSelectDeleteFlat: boolean = false;
  delectSelect(file: IFile) {
    this.fileSelectDelete = file;
    this.fileSelectDeleteFlat = true;
  }
  delectFile() {
    this.fileSelectDeleteFlat = false;
    let params = new HttpParams().set("fileName", this.fileSelectDelete.name);
    this.http.post(this.baseUrl + "/delete", null, { params: params }).subscribe(null, null, () => {
      this.fileList = this.fileList.filter(x => x.name != this.fileSelectDelete.name);
    });
  }
  delectFileCancel() {
    this.fileSelectDeleteFlat = false;
  }
}


interface ISubscription {
  id:string,
  subcription: Subscription
}

export interface IFile {
  name: string;
  size: number;
  lastModified: Date;
}

