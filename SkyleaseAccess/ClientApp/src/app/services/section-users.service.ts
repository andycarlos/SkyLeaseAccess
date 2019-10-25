import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { ISection } from './section.service';
@Injectable({
  providedIn: 'root'
})
export class SectionUsersService {

  baseUrl;
  constructor(private http: HttpClient,
    location: Location) {
    this.baseUrl = (location as any)._platformLocation._doc.baseURI + "api/SectionUsers";
  }
  getListSectionByUserId(userId: string): Observable<ISection[]>
  {
    return this.http.get<ISection[]>(this.baseUrl + "/" + userId);
  }
  getListSectionByUserToken(): Observable<ISection[]> {
    return this.http.get<ISection[]>(this.baseUrl);
  }
  delectSectionUser(sectionUser: ISectionUser): Observable<ISection> {
    return this.http.post<ISection>(this.baseUrl + "/Delect", sectionUser);
  }
  AddSectionUser(sectionUser: ISectionUser): Observable<ISection> {
    return this.http.post<ISection>(this.baseUrl + "/Add", sectionUser);
  }
}
export interface ISectionUser {
  SectionId: number;
  UserId: string
}
