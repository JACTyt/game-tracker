import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from './search.service';
import { SearchResponse, FiltersResponse } from '../models/search.model';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService],
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call POST /search and return results', () => {
    const mockResponse: SearchResponse = {
      results: [{
        igdb_id: 1, title: 'Silent Hill 2',
        genres: [], themes: [], platforms: [], matched_signals: [],
        developers: [], publishers: [], supporting_developers: [],
        game_modes: [], player_perspectives: [], series: [], franchises: [],
        game_engines: [], alternative_titles: [], keywords: [],
        websites: [], supported_languages: [], age_ratings: [],
      }],
      mode: 'filter',
    };

    service.search({ mode: 'filter', filters: { platforms: ['PS2'] } }).subscribe(resp => {
      expect(resp.results.length).toBe(1);
      expect(resp.results[0].title).toBe('Silent Hill 2');
    });

    const req = httpMock.expectOne('http://localhost:8000/search');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should call GET /filters and return options', () => {
    const mockFilters: FiltersResponse = {
      genres: [{ id: 19, name: 'Horror' }],
      platforms: [{ id: 8, name: 'PlayStation 2' }],
      themes: [{ id: 17, name: 'Fantasy' }],
    };

    service.getFilters().subscribe(resp => {
      expect(resp.genres[0].name).toBe('Horror');
    });

    const req = httpMock.expectOne('http://localhost:8000/filters');
    expect(req.request.method).toBe('GET');
    req.flush(mockFilters);
  });
});
