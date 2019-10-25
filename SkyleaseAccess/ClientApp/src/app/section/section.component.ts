import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { ISection, SectionService } from '../services/section.service';
import { Subscription} from 'rxjs';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit, OnDestroy {

  constructor(private _router: Router,
    private _serviceSection: SectionService,
    private route: ActivatedRoute) { }

  sections: ISection[] = [];
  load: boolean = false;
  subcription: Subscription;
  filter: string = "";

  pageSize: number = 10;
  page: number = 1;

  ngOnInit() {
    this.load = true;
    this._serviceSection.getSectionAll().subscribe(x => {
      this.sections = x;
      this.load = false;
    });
  }

  ngOnDestroy()
  {
   // this.subcription.unsubscribe();
    //onsole.log('destruido');
  }

  linkAddSection()
  {
    this._router.navigate(['/sectionAdd']);
  }

  edit(id: number)
  {
    this._router.navigate(['/sectionEdit',id]);
  }

  delectId: number = -1;
  delecTitle: string ="-";
  delect(id: number)
  {
    this.delectId = id;
     this.sections.forEach(x => {
       if (x.id == id)
       {
         this.delecTitle = x.title;
       }
    });
  }
  confiDelect()
  {
    if (this.delectId != -1) { 
      this._serviceSection.delectSection(this.delectId).subscribe(x => {
        this.sections = this.sections.filter(z => z.title != x.title);
        this.delectId = -1;
      });
    }
  }

}
