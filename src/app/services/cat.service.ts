import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cat } from '../models/cat.model';
import { environment } from '../config/environment';

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private apiUrl = environment.apiUrl + '/cats'; // Ajuste a URL conforme seu backend

  constructor(private http: HttpClient) { }

  getCat(): Observable<Cat> {
    return this.http.get<Cat>(this.apiUrl + '/catOfTheDay');
  }
}
