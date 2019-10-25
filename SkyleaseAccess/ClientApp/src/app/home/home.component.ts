import { Component, OnInit } from '@angular/core';
import { SectionService, ISection, IFileInfo } from '../services/section.service';
import { UserService } from '../services/user.service';
import { SectionUsersService } from '../services/section-users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    

  constructor(private _serviceSection: SectionService,
    private _serviceSectionUser: SectionUsersService) { }
  sections: ISection[] = [];
  SectionFileList: IFileInfo[] = [];
  load: boolean = false;
  loadModal: boolean = false;

  pageSize: number = 10;
  page: number = 1;
  filter: string = "";

  ngOnInit() {
    this.load = true;
    this._serviceSectionUser.getListSectionByUserToken().subscribe(x => {
      this.sections = x;
      this.load = false;
    });
  }

  sectionSelect: ISection;
  modalTitle: string;
  opendSectionActive: boolean= false;
  SectionOpenFileList(section: ISection)
  {
    this.opendSectionActive = true;
    this.loadModal = true;
    this.sectionSelect = section;
    this.modalTitle = section.title;
    this.SectionFileList = [];
    let sectionArray: ISection[] = [];
    sectionArray.push(section);
    this._serviceSection.getFileList(sectionArray).subscribe(x => {
      this.SectionFileList = x;
      this.loadModal = false;
    });
  }
  CancelSectionOpenFileList() {
    this.opendSectionActive = false;
  }

  sectionFind() {
    this.filter = "";
    this.loadModal = true;
    this.SectionFileList = [];
    this._serviceSection.getFileList(this.sections).subscribe(x => {
      this.SectionFileList = x;
      this.loadModal = false;
    });
  }

  opendDocument(file:IFileInfo)
  {

    this._serviceSection.DownLoadFile(file.sectionName, file.fileName).subscribe(blob => {
      const pdfUrl = (window.URL || window['webkitURL']).createObjectURL(blob);
      window.open(pdfUrl); //,"_parent");
      /* const anchor = document.createElement('a');
      anchor.href = pdfUrl;
      anchor.click();*/
      
    });
  }

}
