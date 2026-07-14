import { CompareService } from './compare.service';
import { GameResult } from '../models/search.model';

function game(id: number, title = `Game ${id}`): GameResult {
  return {
    igdb_id: id, title,
    genres: [], themes: [], platforms: [], matched_signals: [],
    developers: [], publishers: [], supporting_developers: [],
    game_modes: [], player_perspectives: [], series: [], franchises: [],
    game_engines: [], alternative_titles: [], keywords: [],
    websites: [], supported_languages: [], age_ratings: [],
  };
}

describe('CompareService', () => {
  let svc: CompareService;
  beforeEach(() => { svc = new CompareService(); });

  it('adds games and reports membership', () => {
    svc.add(game(1));
    expect(svc.count()).toBe(1);
    expect(svc.isInCompare(1)).toBeTrue();
    expect(svc.isInCompare(2)).toBeFalse();
  });

  it('ignores duplicates', () => {
    svc.add(game(1));
    svc.add(game(1));
    expect(svc.count()).toBe(1);
  });

  it('holds any number of games', () => {
    for (let i = 1; i <= 6; i++) svc.add(game(i));
    expect(svc.count()).toBe(6);
    expect(svc.isInCompare(6)).toBeTrue();
  });

  it('toggles games in and out', () => {
    svc.toggle(game(1));
    expect(svc.isInCompare(1)).toBeTrue();
    svc.toggle(game(1));
    expect(svc.isInCompare(1)).toBeFalse();
  });

  it('clears all', () => {
    svc.add(game(1)); svc.add(game(2));
    svc.clear();
    expect(svc.count()).toBe(0);
  });
});
