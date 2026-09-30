import {QUERY_WEIGHT, rank, tokens} from '../src/lib/rank';
import {PROJECT_CATEGORIES, projectHost, relatedProjects} from '../src/lib/catalog';

const catalog = [
  {
    id: 'dev-tools',
    label: 'Dev tools',
    projects: [
      {name: 'Regex Tester', url: 'https://r.test', slug: 'regex'},
      {name: 'Base64', url: 'https://b.test', slug: 'base64'},
    ],
  },
  {
    id: 'main',
    label: 'Main sites',
    projects: [{name: 'Wiki', url: 'https://w.test', slug: 'wiki'}],
  },
];

describe('rank', () => {
  it('orders by intent weight and breaks ties by name', () => {
    expect(rank('make', {catalog}).map(r => r.project.slug)).toEqual([
      'base64',
      'regex',
    ]);
    expect(rank('learn', {catalog}).map(r => r.project.slug)).toEqual(['wiki']);
  });

  it('boosts query matches and explains every point', () => {
    const [top] = rank('learn', {query: 'Regex!', catalog});
    expect(top.project.slug).toBe('regex');
    expect(top.score).toBe(QUERY_WEIGHT);
    expect(top.reasons).toEqual([`matches “regex”: +${QUERY_WEIGHT}`]);
  });

  it('returns nothing rather than inventing a match', () => {
    expect(rank('learn', {query: 'zzz', catalog: [catalog[0]]})).toEqual([]);
  });

  it('skips dismissed projects', () => {
    expect(
      rank('make', {catalog, exclude: new Set(['base64'])}).map(
        r => r.project.slug,
      ),
    ).toEqual(['regex']);
  });

  it('respects the limit on the real catalog', () => {
    expect(rank('ship')).toHaveLength(5);
    expect(rank('ship', {limit: 3})).toHaveLength(3);
  });

  it('tokenises on non-alphanumerics and drops 1-char tokens', () => {
    expect(tokens('A url-shortener, v2!')).toEqual(['url', 'shortener', 'v2']);
  });
});

describe('catalog', () => {
  it('uses unique slugs and https URLs', () => {
    const projects = PROJECT_CATEGORIES.flatMap(c => c.projects);
    expect(new Set(projects.map(p => p.slug)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.url.startsWith('https://')).toBe(true);
    }
  });

  it('every category has intent weights', () => {
    const {CATEGORY_WEIGHTS} = require('../src/lib/rank');
    for (const category of PROJECT_CATEGORIES) {
      expect(CATEGORY_WEIGHTS[category.id]).toBeDefined();
    }
  });

  it('relatedProjects drops the current app and empty categories', () => {
    const slugs = relatedProjects('todo-board').flatMap(c =>
      c.projects.map(p => p.slug),
    );
    expect(slugs).not.toContain('todo-board');
    expect(
      relatedProjects('solo', [
        {id: 'x', label: 'X', projects: [{name: 'S', url: 'https://s.test', slug: 'solo'}]},
      ]),
    ).toEqual([]);
  });

  it('projectHost extracts the host without a URL global', () => {
    expect(projectHost('https://bookchaowalit.com/path?q=1')).toBe(
      'bookchaowalit.com',
    );
    expect(projectHost('not a url')).toBe('not a url');
  });
});
