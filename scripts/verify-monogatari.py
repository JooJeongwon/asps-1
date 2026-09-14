"""Verify Kokone's selectable route order, twenty conversations and all endings."""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect, Error, TimeoutError as PlaywrightTimeoutError

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3017')
parser.add_argument('--screenshots', default=None)
args = parser.parse_args(); base = args.url.rstrip('/')
ids = ['jinhwan', 'jeongwon', 'chihoon', 'seongsu']
names = dict(zip(ids, ['박진환', '주정원', '정치훈', '남성수']))

def shot(page, name):
    if args.screenshots:
        folder = Path(args.screenshots); folder.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(folder / name), full_page=True)

def start(page):
    page.goto(base, wait_until='networkidle')
    expect(page.locator('body')).to_have_attribute('data-engine-ready', 'true')
    expect(page).to_have_title(re.compile('두근두근 코코네'))
    expect(page.locator('#route-step')).to_have_text('만남 0 / 4')
    assert page.evaluate('monogatari.storage().visitOrder') == []

def check_hud(page):
    data = page.evaluate('monogatari.storage()')
    for id in ids:
        score = data['affinity'][id]
        expected = '✓' if id in data['visitOrder'] else f'{score}/5' if score else '대기'
        expect(page.locator(f'[data-affinity="{id}"]')).to_have_text(expected)

def walk(page, order=None, ending='jinhwan', answer=0, stop=None):
    order = order or ids
    questions = set(); departures = set(); bridges = set(); endings = set(); common = False
    for _ in range(550):
        if '/team.html' in page.url: break
        try: label = page.evaluate('monogatari.state("label")')
        except Error as error:
            if 'Execution context was destroyed' not in str(error): raise
            page.wait_for_url(base + '/team.html?match=' + ending); break
        if label.startswith('Departure_'): departures.add(label.removeprefix('Departure_'))
        if label.startswith('FinalBridge_'): bridges.add(label.removeprefix('FinalBridge_'))
        if label.startswith('Ending_'): endings.add(label.removeprefix('Ending_'))
        if label == 'CommonEnding': common = True
        if page.locator('message-modal').count():
            modal = page.locator('message-modal')
            if modal.locator('.saju-pairs').count():
                expect(modal.locator('.saju-pairs li')).to_have_count(6)
                assert page.evaluate('monogatari.storage().saju.status') == 'ready'
            shot(page, f'saju-{page.viewport_size["width"]}.png')
            modal.locator('[data-action="close"]').click()
        elif page.locator('choice-container button').count():
            check_hud(page)
            if re.fullmatch(r'Question_[a-z]+_[1-5]', label): questions.add(label)
            if stop == label:
                return {'questions': questions, 'departures': departures, 'bridges': bridges, 'endings': endings, 'common': common}
            if label == 'MeetingHub':
                visited = page.evaluate('monogatari.storage().visitOrder')
                expect(page.locator('.meeting-choice button')).to_have_count(4)
                for id in ids:
                    assert page.locator(f'[data-choice="{id}"]').is_enabled() == (id not in visited)
                shot(page, f'meeting-{len(visited)}-{page.viewport_size["width"]}.png')
                id = next(id for id in order if id not in visited)
                page.locator(f'[data-choice="{id}"]').click()
            elif label == 'FinalChoice':
                assert page.evaluate('monogatari.storage().visitOrder') == order
                assert len(page.evaluate('Object.keys(monogatari.storage().choices)')) == 20
                expect(page.locator('.final-choice button')).to_have_count(4)
                assert all(page.locator(f'[data-choice="{id}"]').is_enabled() for id in ids)
                shot(page, f'final-{page.viewport_size["width"]}.png')
                page.locator(f'[data-choice="{ending}"]').click()
            elif label == 'Prologue': page.locator('[data-choice="Enter"]').click()
            elif label == 'CommonEnding': page.locator('[data-choice="Reveal"]').click()
            else: page.locator(f'[data-choice="Answer{answer}"]').click()
        else:
            try: page.locator('text-box').click(timeout=1000)
            except PlaywrightTimeoutError:
                if not page.locator('message-modal').count(): raise
        page.wait_for_timeout(60)
    else: raise AssertionError('Story did not reach target or ending')
    return {'questions': questions, 'departures': departures, 'bridges': bridges, 'endings': endings, 'common': common}

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width':1440, 'height':900}, reduced_motion='reduce')
    errors = []; failed = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: failed.append(r.url) if r.status >= 400 and r.url.startswith(base) else None)
    # Save in a pending question, load it, and undo a chosen answer.
    start(page); walk(page, stop='Question_jinhwan_3')
    saved = page.evaluate('monogatari.storage()')
    assert saved['affinity']['jinhwan'] == 2
    page.locator('quick-menu [data-open="save"]').click()
    page.locator('save-screen input').fill('코코네 · 왕과 세 번째 대화')
    page.locator('save-screen [data-action="save"]').click()
    expect(page.locator('save-screen save-slot')).to_have_count(1)
    start(page)
    page.locator('quick-menu [data-open="load"]').click()
    page.locator('load-screen save-slot').focus(); page.keyboard.press('Enter')
    expect(page.locator('#route-step')).to_have_text('대화 3 / 5')
    expect(page.locator('[data-choice="Answer0"]')).to_be_visible()
    assert page.evaluate('monogatari.storage()') == saved
    page.locator('[data-choice="Answer0"]').click(); page.wait_for_timeout(100)
    page.locator('quick-menu [data-action="back"]').click()
    expect(page.locator('[data-choice="Answer1"]')).to_be_visible()
    assert page.evaluate('monogatari.storage()') == saved
    # Completing the route disables its hub card. Rewinding across completion unlocks it.
    walk(page, stop='MeetingHub')
    expect(page.locator('[data-choice="jinhwan"]')).to_be_disabled()
    assert page.evaluate('monogatari.storage().visitOrder') == ['jinhwan']
    for _ in range(25):
        page.locator('quick-menu [data-action="back"]').click(); page.wait_for_timeout(80)
        if page.evaluate('monogatari.state("label")') == 'Question_jinhwan_5' and page.locator('[data-choice="Answer0"]').count(): break
    else: raise AssertionError('Could not rewind across completion')
    assert page.evaluate('monogatari.storage().visitOrder') == []
    assert page.evaluate('monogatari.storage().affinity.jinhwan') == 4
    check_hud(page)
    page.locator('quick-menu [data-action="end"]').click()
    page.locator('alert-modal [data-action="quit"]').click()
    expect(page.locator('#route-step')).to_have_text('만남 0 / 4')
    assert page.evaluate('monogatari.storage().choices') == {}
    expected_questions = {f'Question_{id}_{i}' for id in ids for i in range(1,6)}
    # Each man is both an ending choice and the fourth speaker in one full run.
    for index, ending in enumerate(ids):
        order = ids[index:] + ids[:index]
        w,h = [(1440,900), (390,844), (320,568), (844,390)][index]
        page.set_viewport_size({'width':w,'height':h}); start(page)
        shot(page, f'opening-{w}.png')
        seen = walk(page, order=order, ending=ending, answer=index % 2)
        assert seen['questions'] == expected_questions, seen
        assert seen['departures'] == set(order[:3]), seen
        assert seen['bridges'] == {order[-1]}, seen
        assert seen['endings'] == {ending} and seen['common'], seen
        expect(page).to_have_url(base + '/team.html?match=' + ending)
        page.wait_for_load_state('networkidle')
        expect(page.locator('#your-match')).to_contain_text(names[ending])
        expect(page.locator('.member')).to_have_count(4)
        expect(page.locator('.role-reveal')).to_have_count(4)
        for image in page.locator('.member img').all(): assert image.evaluate('(e)=>e.complete&&e.naturalWidth>0')
        page.locator('#show-profiles').click(); expect(page.locator('details[open]')).to_have_count(4)
        page.locator('#show-project').click(); expect(page.locator('#project')).to_be_visible()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
        shot(page, f'roles-{w}.png')
        print(f'{names[ending]} END: 20 questions, departures {order[:3]}, fourth {order[-1]}, common ending + roles passed', flush=True)
    # Readiness is an external database probe; tolerate a brief upstream miss.
    for attempt in range(3):
        readiness = page.request.get(base + '/api/status').json()
        if readiness == {'configured':True}: break
        if attempt < 2: page.wait_for_timeout(500)
    assert readiness == {'configured':True}, readiness
    assert not errors, errors
    assert not failed, failed
    print(json.dumps({'routes':4,'questions':20,'endings':4,'save_load_rollback':'passed','errors':errors},ensure_ascii=False))
    browser.close()
