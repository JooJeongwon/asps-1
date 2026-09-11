const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const members = ['주정원', '남성수', '박진환', '정치훈'];
const memberProfiles = {
  '주정원': { oneLine: '나는 흩어진 아이디어에서 다음 질문을 찾는 사람.', bio: '새로운 관점을 모으고, 아직 정의되지 않은 문제를 함께 풀어가는 일을 좋아합니다. 좋은 대화가 팀의 방향을 바꾼다고 믿습니다.', teamMode: '논의를 넓히고 다음 가능성을 제안하는 탐색자.', interests: '새로운 기술 · 기획 · 대화 · 기록', tmi: '떠오른 생각은 메모하지 않으면 잠들기 전에 다시 떠올립니다.' },
  '정치훈': { oneLine: '나는 생각을 움직임으로 바꾸는 사람.', bio: '빠르게 핵심을 잡고 직접 부딪히며 답을 찾습니다. 결과가 보일 때까지 팀의 속도를 지키는 편입니다.', teamMode: '결정을 실행으로 연결하는 추진자.', interests: '실험 · 운동 · 문제 해결 · 즉흥 여행', tmi: '할 일은 일단 시작하고, 하면서 가장 좋은 방법을 찾습니다.' },
  '박진환': { oneLine: '나는 사람과 아이디어 사이의 흐름을 잇는 사람.', bio: '서로 다른 이야기에서 공통점을 발견하는 순간을 좋아합니다. 모두가 편하게 말할 수 있는 분위기를 만들고 싶습니다.', teamMode: '관계와 맥락을 살피며 협업을 연결하는 조율자.', interests: '사람 · 콘텐츠 · 음악 · 산책', tmi: '좋아하는 노래를 찾으면 며칠 동안 한 곡만 듣습니다.' },
  '남성수': { oneLine: '나는 복잡한 일을 차분하게 정리하는 사람.', bio: '한 번 더 생각해보는 습관으로 팀의 균형을 잡습니다. 작지만 확실한 진전을 꾸준히 쌓는 방식을 선호합니다.', teamMode: '현실적인 기준을 세우고 완성도를 챙기는 안정판.', interests: '정리 · 독서 · 디자인 · 조용한 카페', tmi: '새 노트를 쓰기 전에 첫 페이지의 여백부터 신경 씁니다.' }
};
const pairCopy = score => score >= 75 ? '높은 시너지' : score >= 70 ? '안정적인 호흡' : score >= 60 ? '발견 중인 접점' : '다른 만큼 넓어지는 관점';
async function getJson(path) {
  const response = await fetch(path, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('궁합 데이터 연결을 확인 중입니다.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '궁합 데이터를 불러오지 못했습니다.');
  return data;
}

async function loadTeam() {
  try {
    const query = new URLSearchParams(members.map(name => ['member', name]));
    const pairs = (await getJson(`/api/team?${query}`)).filter(row => row.person_name < row.match_name);
    if (pairs.length !== 6) throw new Error('팀 결과가 준비되지 않았습니다.');
    const average = pairs.reduce((sum, row) => sum + row.match_score, 0) / pairs.length;
    const mbti = pairs.reduce((sum, row) => sum + row.mbti_score, 0) / pairs.length;
    const best = pairs.reduce((a,b) => a.match_score >= b.match_score ? a : b);
    $('.score-ring').style.setProperty('--score', `${average}%`);
    $('#hero-score').textContent = average.toFixed(1);
    $('#hero-mbti').textContent = mbti.toFixed(1);
    $('#hero-pairs').textContent = `${pairs.length} pairs`;
    $('#hero-best').textContent = `${best.person_name} × ${best.match_name}`;
    $('#hero-status').textContent = average >= 76 ? '베스트 프렌드' : average >= 68 ? '좋음' : '보통';
    $('#pair-grid').innerHTML = pairs.map(pair => `<article class="card p-5"><div class="flex justify-between"><p class="text-sm font-black">${escapeHtml(pair.person_name)} × ${escapeHtml(pair.match_name)}</p><b class="text-violet">${pair.match_score.toFixed(1)}</b></div><p class="mt-2 text-[10px] text-black/40">${escapeHtml(pair.match_group)} · ${pairCopy(pair.match_score)}</p><div class="mt-5 h-1 rounded bg-black/5"><i class="block h-full rounded bg-violet" style="width:${pair.match_score}%"></i></div><div class="pair-metrics mt-5"><span>MBTI <b>${pair.mbti_score.toFixed(1)}</b></span><span>KAI 차이 <b>${pair.kai_difference.toFixed(1)}</b></span><span>사주 <b>${pair.saju_score.toFixed(1)}</b></span></div></article>`).join('');
    $('#hero-data-label').textContent = 'LIVE RESULT';
    $('#data-state').textContent = '최신 궁합 결과';
  } catch {
    $('#hero-data-label').textContent = '연결 대기';
    $('#hero-status').textContent = '결과 준비 중';
    $('#pair-grid').textContent = '팀 궁합을 불러오지 못했습니다. 새로고침 후 다시 확인해주세요.';
    $('#data-state').textContent = '궁합 데이터 연결 대기 중';
  }
}

async function loadHighlight() {
  try {
    const data = await getJson('/api/highlight');
    for (const [id, key] of [['score','match_score'], ['mbti','mbti_score'], ['kai','kai_difference'], ['saju','saju_score']]) {
      $(`#blind-${id}`).textContent = data[key].toFixed(1);
    }
    $('#blind-names').textContent = `${data.person_name} × ${data.match_name}`;
    $('#blind-group').textContent = `${data.match_group} · ${data.tied_pairs > 1 ? `공동 1위 ${data.tied_pairs}개 중 한 조합` : '전체 1위 조합'}`;
    $('#blind-data-label').textContent = '325 UNIQUE PAIRS · LIVE RESULT';
  } catch {
    $('#blind-data-label').textContent = '1위 결과를 불러오지 못했습니다. 새로고침 후 다시 확인해주세요.';
    $('#blind-names').textContent = '결과 준비 중';
  }
}

$('#match-form').addEventListener('submit', async event => {
  event.preventDefault();
  const person = $('#person-a').value.trim(), match = $('#person-b').value.trim();
  const result = $('#match-result'), button = $('#match-form button');
  if (!person || !match || person === match) {
    result.textContent = '서로 다른 두 사람의 이름을 입력해주세요.';
    return;
  }
  if (button.disabled) return;
  button.disabled = true;
  result.textContent = '궁합을 찾는 중…';
  try {
    const data = await getJson(`/api/match?${new URLSearchParams({ person, match })}`);
    result.innerHTML = `<div class="flex items-center justify-between"><div><p class="text-[9px] font-bold text-white/35">선택한 조합</p><h3 class="mt-1 font-black">${escapeHtml(data.person_name)} × ${escapeHtml(data.match_name)}</h3></div><b class="text-3xl tracking-[-.05em] text-[#a997ff]">${data.match_score.toFixed(1)}</b></div><p class="mt-3 text-xs font-bold text-white/45">${escapeHtml(data.match_group)}</p>`;
  } catch (error) {
    result.textContent = error.message || '궁합 데이터를 불러오지 못했습니다.';
  } finally {
    button.disabled = false;
  }
});

const memberDialog = $('#member-dialog');
document.querySelectorAll('.member-card').forEach(card => card.addEventListener('click', () => {
  const profile = memberProfiles[card.dataset.member];
  $('#member-name').textContent = card.dataset.member;
  $('#member-one-line').textContent = profile.oneLine;
  $('#member-bio').textContent = profile.bio;
  $('#member-team-mode').textContent = profile.teamMode;
  $('#member-interests').textContent = profile.interests;
  $('#member-tmi').textContent = profile.tmi;
  if (typeof memberDialog.showModal === 'function') memberDialog.showModal();
  else memberDialog.setAttribute('open', '');
}));
const closeMemberDialog = () => typeof memberDialog.close === 'function' ? memberDialog.close() : memberDialog.removeAttribute('open');
memberDialog.addEventListener('click', event => { if (event.target === memberDialog) closeMemberDialog(); });

loadTeam();
loadHighlight();
