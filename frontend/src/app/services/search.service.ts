import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchRequest, SearchResponse, FiltersResponse } from '../models/search.model';
import { CredentialsService } from './credentials.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private credentials: CredentialsService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'X-IGDB-Client-Id': this.credentials.igdbClientId(),
      'X-IGDB-Client-Secret': this.credentials.igdbClientSecret(),
      'X-OpenAI-Key': this.credentials.openaiKey(),
    });
  }

  search(request: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.apiUrl}/search`, request, { headers: this.headers() });
  }

  getFilters(): Observable<FiltersResponse> {
    return this.http.get<FiltersResponse>(`${this.apiUrl}/filters`, { headers: this.headers() });
  }
}
