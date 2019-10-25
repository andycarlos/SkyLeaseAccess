import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'

})
export class SectionService {

  baseUrl;
  constructor(private http:HttpClient,
                      location:Location) 
  { 
    this.baseUrl = (location as any)._platformLocation._doc.baseURI +"api/Sections";
  }
  //upload File
  upLoadFile(data: FormData, section, fileNameOld: string[])
  {
    let params = new HttpParams().set("section", section);

    let valor: string = '';
    fileNameOld.forEach((actorName: string) => {
      valor = valor + "," + actorName;
    });
    //params = params.set("fileNames", valor);
    // let heard = new HttpHeaders().set("fileName", valor);
    data.append("fileName", new Blob([]), valor);

    const uploadReq = new HttpRequest('POST',this.baseUrl+"/uploadfile" , data, {
      reportProgress: true,
      params: params,
     // headers: heard
    });
    return this.http.request(uploadReq);
  }
 

  //add
  addSection(section: ISection): Observable<ISection> {
    return this.http.post<ISection>(this.baseUrl, section);
  }
  //Edit
  editSection(id: number, section: ISection) {
    return this.http.put(this.baseUrl + "/" + id, section);
  }
  //Delect Section By ID
  delectSection(id: number): Observable<ISection> {
    return this.http.delete<ISection>(this.baseUrl + "/" + id);
  }
  //get File list By ID
  getFileList(section: ISection[]): Observable<IFileInfo[]> {
    return this.http.post<IFileInfo[]>(this.baseUrl + "/getfiles", section);
  }
  //get All Section
  getSectionAll(): Observable<ISection[]> {
    return this.http.get<ISection[]>(this.baseUrl);
  }
  //get Section By ID
  getSection(id: number): Observable<ISection> {
    return this.http.get<ISection>(this.baseUrl+"/"+id);
  }
  //get Section By title
  getSectionByTitle(title: string): Observable<ISection>
  {
    let head = new HttpHeaders().set("title", title);
    return this.http.get<ISection>(this.baseUrl + "/exist", {
      headers:head
    });
  }

  DownLoadFile(section: string, fileName: string) {
    let params = new HttpParams().set("sectionTitle", section);
    params = params.set("fileName", fileName);
    return this.http.get(this.baseUrl + "/document", { params: params, responseType: "blob" });
  }
}


export interface ISection {
  id: number;
  title: string;
  description: string;
  items: number;
  activ: boolean;
}
export interface IFileInfo {
  fileName: string;
  sectionName: string;
}
