export const DATASET_ID = 'v2.1-revised-de8cf0e0ed398651';
const columns = 'person_name,match_name,match_score,match_group,kai_difference,mbti_score,saju_score';
const group = score => score >= 76 ? '베스트 프렌드' : score >= 68 ? '좋음' : '보통';
const numeric = (value, maximum = 100) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= maximum;
const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const compareRows = (a, b) => b.match_score - a.match_score || compareText(a.person_name, b.person_name) || compareText(a.match_name, b.match_name);
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
});

export function validateRows(input) {
  if (!Array.isArray(input) || input.length !== 650) throw new Error('Incomplete dataset');
  const pairs = new Map();
  const people = new Map();
  const rows = input.map(row => Object.fromEntries(columns.split(',').map(key => [key, row[key]])));
  for (const row of rows) {
    if (![row.person_name, row.match_name].every(name => typeof name === 'string' && name.trim()) ||
        row.person_name === row.match_name || !numeric(row.match_score) ||
        !numeric(row.mbti_score) || !numeric(row.saju_score) || !numeric(row.kai_difference, Infinity) ||
        row.match_group !== group(row.match_score)) throw new Error('Invalid result');
    const key = JSON.stringify([row.person_name, row.match_name]);
    if (pairs.has(key)) throw new Error('Duplicate result');
    pairs.set(key, row);
    people.set(row.person_name, (people.get(row.person_name) || 0) + 1);
  }
  if (people.size !== 26 || [...people.values()].some(count => count !== 25)) throw new Error('Incomplete participants');
  for (const row of rows) {
    const reverse = pairs.get(JSON.stringify([row.match_name, row.person_name]));
    if (!reverse || columns.split(',').slice(2).some(key => reverse[key] !== row[key])) throw new Error('Asymmetric result');
  }
  return rows.sort(compareRows);
}

export async function loadMatches(env, fetcher = fetch) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase not configured');
  const url = new URL('/rest/v1/gcs_matches', SUPABASE_URL);
  if (url.protocol !== 'https:') throw new Error('Supabase URL must use HTTPS');
  url.search = new URLSearchParams({ dataset_id: `eq.${env.GCS_DATASET_ID || DATASET_ID}`,
    select: columns, order: 'person_name.asc,match_name.asc', limit: '651' }).toString();
  const headers = { apikey: SUPABASE_SERVICE_ROLE_KEY };
  // Modern sb_secret keys use apikey only; legacy service_role JWTs also use Bearer.
  if (!SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_')) headers.Authorization = `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
  const response = await fetcher(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Supabase query failed');
  return validateRows(await response.json());
}

function ranked(row, rows) {
  return { ...row, personal_rank: 1 + rows.filter(other => other.person_name === row.person_name && other.match_score > row.match_score).length };
}

export async function handleApi(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  const kind = url.pathname.replace(/^\/api\//, '');
  if (!['status', 'people', 'team', 'match', 'highlight'].includes(kind)) return json({ error: 'API를 찾을 수 없습니다.' }, 404);
  if (request.method !== 'GET') return json({ error: 'GET 요청만 지원합니다.' }, 405, { Allow: 'GET' });
  const person = url.searchParams.get('person')?.trim();
  const match = url.searchParams.get('match')?.trim();
  const members = [...new Set(url.searchParams.getAll('member').map(name => name.trim()).filter(Boolean))];
  if (kind === 'match' && (!person || !match || person === match)) return json({ error: '서로 다른 두 사람의 이름을 입력해주세요.' }, 400);
  if (kind === 'team' && (members.length < 2 || members.length > 10)) return json({ error: '팀원은 2명에서 10명까지 선택할 수 있습니다.' }, 400);
  try {
    const rows = await loadMatches(env, fetcher);
    if (kind === 'status') return json({ configured: true });
    if (kind === 'highlight') {
      const unique = rows.filter(row => row.person_name < row.match_name);
      const best = unique[0];
      return json({ ...best, tied_pairs: unique.filter(row => row.match_score === best.match_score).length });
    }
    if (kind === 'match') {
      const result = rows.find(row => row.person_name === person && row.match_name === match);
      return result ? json(ranked(result, rows)) : json({ error: '궁합 결과가 없습니다.' }, 404);
    }
    const people = [...new Set(rows.map(row => row.person_name))].sort(compareText);
    if (kind === 'team') {
      if (members.some(name => !people.includes(name))) return json({ error: '등록되지 않은 팀원이 있습니다.' }, 404);
      return json(rows.filter(row => members.includes(row.person_name) && members.includes(row.match_name)).map(row => ranked(row, rows)));
    }
    return json(people.map(name => {
      const matches = rows.filter(row => row.person_name === name);
      const average = key => Math.round(matches.reduce((sum, row) => sum + row[key], 0) / matches.length * 10) / 10;
      return { name, mbti_score: average('mbti_score'), kai_difference: average('kai_difference'), saju_score: average('saju_score') };
    }));
  } catch {
    return kind === 'status' ? json({ configured: false }, 503) : json({ error: '궁합 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' }, 503);
  }
}
