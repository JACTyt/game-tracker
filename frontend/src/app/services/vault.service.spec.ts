import { VaultService } from './vault.service';
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

describe('VaultService collections', () => {
  beforeEach(() => localStorage.clear());

  it('saves a game with an empty collections list', () => {
    const svc = new VaultService();
    svc.save(game(1));
    expect(svc.games()[0].collections).toEqual([]);
  });

  it('adds and removes tags, ignoring empty/duplicate tags', () => {
    const svc = new VaultService();
    svc.save(game(1));
    svc.addTag(1, 'Favorites');
    svc.addTag(1, '  Favorites  ');   // duplicate after trim -> ignored
    svc.addTag(1, '   ');             // empty -> ignored
    svc.addTag(1, 'Backlog');
    expect(svc.games()[0].collections).toEqual(['Favorites', 'Backlog']);

    svc.removeTag(1, 'Favorites');
    expect(svc.games()[0].collections).toEqual(['Backlog']);
  });

  it('exposes sorted unique collections across games', () => {
    const svc = new VaultService();
    svc.save(game(1));
    svc.save(game(2));
    svc.addTag(1, 'RPG');
    svc.addTag(2, 'RPG');
    svc.addTag(2, 'Action');
    expect(svc.allCollections()).toEqual(['Action', 'RPG']);
  });

  it('back-fills collections for legacy saves missing the field', () => {
    localStorage.setItem('gt_vault', JSON.stringify([
      { igdb_id: 9, title: 'Legacy', savedAt: '2020-01-01', genres: [], platforms: [] },
    ]));
    const svc = new VaultService();
    expect(svc.games()[0].collections).toEqual([]);
    // and tagging still works after migration
    svc.addTag(9, 'Old');
    expect(svc.games()[0].collections).toEqual(['Old']);
  });
});
