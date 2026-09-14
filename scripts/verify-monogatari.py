"""Verify the real Monogatari common story, save state and four freely chosen endings."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect, Error

parser=argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3012')
parser.add_argument('--screenshots', default=None)
args=parser.parse_args();base=args.url.rstrip('/')
ids=['chihoon','jinhwan','jeongwon','seongsu']
names=['정치훈','박진환','주정원','남성수']

def shot(page,name):
    if args.screenshots:
        folder=Path(args.screenshots);folder.mkdir(parents=True,exist_ok=True)
        page.screenshot(path=str(folder/name),full_page=True)

def start(page):
    page.goto(base,wait_until='networkidle')
    expect(page.locator('body')).to_have_attribute('data-engine-ready','true')
    expect(page.locator('#route-step')).to_have_text('CUT 01 / 20')
    expect(page.locator('.final-choice')).to_have_count(0)

def check_hud(page):
    scores=page.evaluate('monogatari.storage().affinity')
    for id in ids:expect(page.locator(f'[data-affinity="{id}"]')).to_have_text(str(scores[id]))

def walk(page, ending='chihoon', answer=0, stop=None):
    visited=set();unlocks=set()
    for _ in range(400):
        if '/team.html' in page.url:return visited,unlocks
        try:
            label=page.evaluate('monogatari.state("label")')
        except Error as error:
            if 'Execution context was destroyed' not in str(error):raise
            page.wait_for_url(base+'/team.html?match='+ending)
            return visited,unlocks
        if label.startswith('Cut'):visited.add(label[3:5])
        if page.locator('message-modal').count():
            modal=page.locator('message-modal')
            if modal.locator('.saju-pairs').count():
                expect(modal.locator('.saju-pairs li')).to_have_count(6)
                data=page.evaluate('monogatari.storage().saju')
                assert data['status']=='ready'
                assert data['pairs'][0]['score']==max(p['score'] for p in data['pairs'])
            elif 'profile-unlock' in (modal.get_attribute('class') or ''):
                unlocks.add(modal.locator('[data-content="title"]').inner_text())
            shot(page, f'unlock-{label}-{page.viewport_size["width"]}.png')
            modal.locator('[data-action="close"]').click()
        elif page.locator('choice-container button').count():
            check_hud(page)
            if stop==label:return visited,unlocks
            if label=='Cut19':
                expect(page.locator('.final-choice button')).to_have_count(4)
                assert all(page.locator(f'[data-choice="{id}"]').is_enabled() for id in ids)
                assert len(page.evaluate('Object.keys(monogatari.storage().unlocked)'))==4
                shot(page, f'final-choice-{page.viewport_size["width"]}.png')
                page.locator(f'[data-choice="{ending}"]').click()
            else:
                count=page.locator('choice-container button').count()
                page.locator(f'[data-choice="Answer{min(answer,count-1)}"]').click()
        else:page.locator('text-box').click()
        page.wait_for_timeout(55)
    raise AssertionError('Story did not reach target or ending')

with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce')
    errors=[];failed=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:failed.append(r.url) if r.status>=400 and r.url.startswith(base) else None)
    # A native rewind must remove points, including after saving and loading pending choices.
    start(page);walk(page,stop='Cut02')
    page.locator('[data-choice="Answer0"]').click();page.wait_for_timeout(70);check_hud(page)
    assert page.evaluate('monogatari.storage().affinity.chihoon')==1
    page.locator('quick-menu [data-action="back"]').click();expect(page.locator('[data-choice="Answer1"]')).to_be_visible()
    assert page.evaluate('Object.values(monogatari.storage().affinity)')==[0,0,0,0]
    page.locator('[data-choice="Answer1"]').click();walk(page,stop='Cut07')
    saved=page.evaluate('monogatari.storage()')
    page.locator('quick-menu [data-open="save"]').click();page.locator('save-screen input').fill('TEAM04 공통 이야기')
    page.locator('save-screen [data-action="save"]').click();expect(page.locator('save-screen save-slot')).to_have_count(1)
    start(page);assert page.evaluate('Object.values(monogatari.storage().affinity)')==[0,0,0,0]
    page.locator('quick-menu [data-open="load"]').click();page.locator('load-screen save-slot').focus();page.keyboard.press('Enter')
    expect(page.locator('#route-step')).to_have_text('CUT 07 / 20');expect(page.locator('choice-container')).to_have_count(1)
    assert page.evaluate('monogatari.storage()')==saved;check_hud(page)
    page.locator('[data-choice="Answer0"]').click();page.wait_for_timeout(70)
    assert page.evaluate('monogatari.storage().affinity.jinhwan')==saved['affinity']['jinhwan']+1
    page.locator('quick-menu [data-action="back"]').click();expect(page.locator('[data-choice="Answer1"]')).to_be_visible()
    assert page.evaluate('monogatari.storage()')==saved;check_hud(page)
    # Native quit resets the entire ledger and starts the common story, never a character picker.
    page.locator('quick-menu [data-action="end"]').click();page.locator('alert-modal [data-action="quit"]').click()
    expect(page.locator('#route-step')).to_have_text('CUT 01 / 20')
    assert page.evaluate('monogatari.storage().choices')=={}
    # Play through all twenty cuts and each final ending; both ordinary answers are exercised.
    for index,id in enumerate(ids):
        width,height=[(1440,900),(390,844),(320,740),(768,1024)][index]
        page.set_viewport_size({'width':width,'height':height});start(page)
        shot(page,f'opening-{width}.png');visited,unlocks=walk(page,ending=id,answer=index%2)
        assert visited=={f'{i:02}' for i in range(1,21)},visited
        assert len(unlocks)==4,unlocks
        expect(page).to_have_url(base+'/team.html?match='+id)
        page.wait_for_load_state('networkidle')
        expect(page.locator('#your-match')).to_contain_text(names[index]);expect(page.locator('.member')).to_have_count(4)
        for photo in page.locator('.member img').all():assert photo.evaluate('(e)=>e.complete && e.naturalWidth>0')
        page.locator('#show-profiles').click();expect(page.locator('details[open]')).to_have_count(4)
        page.locator('#show-project').click();expect(page.locator('#project')).to_be_visible()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        shot(page,f'team-ending-{width}.png')
        print(names[index]+': CUT 01–20, four profiles and ending passed',flush=True)
    assert page.request.get(base+'/api/status').json()=={'configured':True}
    assert not errors,errors;assert not failed,failed
    print(json.dumps({'engine': 'Monogatari 2.8.0', 'cuts':20, 'endings':4, 'save_load_rollback':'passed', 'viewports':[1440,390,320,768], 'errors':errors},ensure_ascii=False))
    browser.close()
