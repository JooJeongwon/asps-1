"""Verify the actual bundled engine in Chromium. Requires Python Playwright + Chromium.
Run against a running dev server: python scripts/verify-monogatari.py --url http://127.0.0.1:3009
"""
import argparse
import json
from urllib.parse import urlencode
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:3009')
parser.add_argument('--screenshots', default=None)
args = parser.parse_args()
base = args.url.rstrip('/')
names = ['정치훈', '주정원', '박진환', '남성수']
photos = ['jeong-chihoon.jpeg', 'joo-jeongwon.jpeg', 'park-jinhwan.jpg', 'nam-seongsu.png']
titles = [
    ['내일도, 같은 출발선', '한 걸음의 여백'],
    ['우리만 아는 별의 이름', '접어둔 질문 하나'],
    ['두 사람의 재생목록', '다음 곡을 기다리며'],
    ['비워둔 맞은편 자리', '오래 남는 한 문장'],
]

def start(page, name=None):
    page.goto(base + '/' + ('?' + urlencode({'route': name}) if name else ''), wait_until='networkidle')
    expect(page.locator('body')).to_have_attribute('data-engine-ready', 'true')

def advance(page):
    page.locator('text-box').click()

def answer(page, index):
    page.locator(f'choice-container [data-choice="Answer{index}"]').click()
    expect(page.locator('choice-container')).to_have_count(0)

def screenshot(page, name):
    if args.screenshots:
        path=Path(args.screenshots)
        path.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(path / name), full_page=True)

with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors=[]
    failed_assets=[]
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('response', lambda r: failed_assets.append(r.url) if r.status >= 400 and r.url.startswith(base) else None)
    endings=set()
    start(page)
    expect(page.locator('main-screen')).not_to_be_visible()
    expect(page.locator('header, footer, #blind, #match-form')).to_have_count(0)
    expect(page.locator('.cast-choices button')).to_have_count(4)
    screenshot(page, 'root-desktop.png')
    for index, name in enumerate(names):
        choice = page.locator(f'[data-choice="Route{index}"]')
        expect(choice).to_contain_text(name)
        expect(choice.locator('img')).to_have_attribute('src', '/assets/characters/' + photos[index])
        assert choice.locator('img').evaluate('(e)=>e.complete && e.naturalWidth > 0')
    # All 32 paths are clicked through the real engine, not a mock controller.
    for route,name in enumerate(names):
        for mask in range(8):
            start(page, name)
            portrait = page.locator(f'img[data-character="c{route}"]')
            expect(portrait).to_be_visible()
            assert portrait.get_attribute('src').endswith('/assets/characters/' + photos[route])
            assert portrait.evaluate('(e)=>e.complete && e.naturalWidth > 0')
            for step in range(3):
                expect(page.locator('#route-step')).to_have_text(f'0{step+1} / 03')
                advance(page)
                expect(page.locator('choice-container button')).to_have_count(2)
                answer(page, (mask >> step) & 1)
                advance(page)
            expect(page.locator('#route-step')).to_have_text('EPILOGUE')
            title=titles[route][0 if mask.bit_count() <= 1 else 1]
            expect(page.locator('text-box')).to_contain_text(title)
            endings.add(title)
        print(f'{name}: all eight choice paths passed', flush=True)
    assert len(endings) == 8
    # Restart must clear decisions; another-person selection must jump to the chosen route.
    page.locator('[data-choice="Again"]').click()
    expect(page.locator('#route-step')).to_have_text('01 / 03')
    assert page.evaluate('monogatari.storage().decisions') == [None,None,None]
    start(page)
    page.locator('[data-choice="Route1"]').click()
    expect(page.locator('#route-name')).to_contain_text('주정원')
    advance(page)
    answer(page,0)
    page.locator('quick-menu [data-action="back"]').click()
    expect(page.locator('[data-choice="Answer1"]')).to_be_visible()
    assert page.evaluate('monogatari.storage().decisions') == [None,None,None]
    answer(page,1)
    # Native dialog log.
    page.locator('quick-menu [data-action="dialog-log"]').click()
    expect(page.locator('dialog-log')).to_be_visible()
    expect(page.locator('dialog-log')).to_contain_text('좋은 순서네요')
    page.locator('dialog-log button').click()
    # Save from a response, reopen on a different route, and load from the native UI.
    page.locator('quick-menu [data-open="save"]').click()
    page.locator('save-screen input').fill('정원 첫 선택 검증')
    page.locator('save-screen [data-action="save"]').click()
    expect(page.locator('save-screen save-slot')).to_have_count(1)
    screenshot(page,'monogatari-save.png')
    start(page, '남성수')
    page.locator('quick-menu [data-open="load"]').click()
    page.locator('load-screen save-slot').focus()
    page.keyboard.press('Enter')
    expect(page.locator('game-screen')).to_be_visible()
    expect(page.locator('#route-name')).to_contain_text('주정원')
    expect(page.locator('text-box')).to_contain_text('좋은 순서네요')
    assert page.evaluate('monogatari.storage().decisions') == [1,None,None]
    # Rewind after loading must also restore the decision, then reach a changed ending.
    page.locator('quick-menu [data-action="back"]').click()
    expect(page.locator('[data-choice="Answer0"]')).to_be_visible()
    assert page.evaluate('monogatari.storage().decisions') == [None,None,None]
    answer(page,0)
    advance(page)
    for step in [1,2]:
        advance(page); answer(page,0); advance(page)
    expect(page.locator('text-box')).to_contain_text(titles[1][0])
    screenshot(page,'monogatari-ending.png')
    # A save taken while choices are open must restore its pending choices exactly once.
    start(page,'박진환'); advance(page)
    page.locator('quick-menu [data-open="save"]').click()
    page.locator('save-screen input').fill('진환 선택지 검증')
    page.locator('save-screen [data-action="save"]').click()
    expect(page.locator('save-screen save-slot')).to_have_count(2)
    page.reload(wait_until='networkidle')
    page.locator('quick-menu [data-open="load"]').click()
    page.locator('load-screen save-slot').filter(has_text='진환 선택지 검증').click()
    expect(page.locator('choice-container')).to_have_count(1)
    expect(page.locator('choice-container button')).to_have_count(2)
    answer(page,1)
    assert page.evaluate('monogatari.storage().decisions') == [1,None,None]
    # Keyboard advance and native instant typing.
    page.emulate_media(reduced_motion='no-preference')
    start(page,'정치훈')
    page.keyboard.press('Space')
    expect(page.locator('text-box')).to_contain_text('물웅덩이')
    page.keyboard.press('Space')
    expect(page.locator('choice-container')).to_have_count(1)
    page.emulate_media(reduced_motion='reduce')
    # Native quit confirmation returns to cast selection even after a direct route link.
    start(page, '박진환')
    page.locator('quick-menu [data-action="end"]').click()
    page.locator('alert-modal [data-action="dismiss-alert"]').click()
    expect(page.locator('#route-name')).to_contain_text('박진환')
    page.locator('quick-menu [data-action="end"]').click()
    page.locator('alert-modal [data-action="quit"]').click()
    expect(page.locator('.cast-choices button')).to_have_count(4)
    page.locator('[data-choice="Route0"]').click()
    expect(page.locator('#route-name')).to_contain_text('정치훈')
    assert page.evaluate('monogatari.storage().decisions') == [None,None,None]
    # Responsive full-screen game and all four original portraits.
    for width,height in [(1440,1000),(390,844),(375,812),(320,740),(768,1024)]:
        page.set_viewport_size({'width':width,'height':height})
        start(page)
        screenshot(page, f'root-{width}.png')
        assert not page.evaluate('document.documentElement.scrollHeight > innerHeight'), width
        for i in range(4):
            item = page.locator(f'.cast-choices [data-choice="Route{i}"]')
            expect(item).to_be_visible()
            assert item.evaluate('(e)=>e.scrollHeight <= e.clientHeight'), f'portrait selection clipped at {width}'
        for name in names:
            start(page, name)
            assert page.locator('img[data-character]').evaluate('(e)=>e.getBoundingClientRect().top >= 0 && e.getBoundingClientRect().bottom <= innerHeight'), width
            screenshot(page, f'portrait-{names.index(name)}-{width}.png')
        start(page,'남성수')
        for step in range(3):
            advance(page)
            if step == 0: screenshot(page,f'monogatari-{width}.png')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), width
            assert page.locator('choice-container').evaluate('(e)=>e.scrollHeight <= e.clientHeight'), width
            answer(page,0);advance(page)
        expect(page.locator('text-box')).to_contain_text(titles[3][0])
        assert page.locator('text-box [data-content="text"]').evaluate('(e)=>e.scrollHeight <= e.clientHeight'), f'ending clipped at {width}'
    # Old /play.html links are an alias to the same native entry point.
    page.goto(base + '/play.html?' + urlencode({'route':'박진환'}), wait_until='networkidle')
    expect(page.locator('#route-name')).to_contain_text('박진환')
    # Supabase-backed APIs remain available for the later scenario integration.
    assert page.request.get(base+'/api/status').json() == {'configured':True}
    assert len(page.request.get(base+'/api/people').json()) == 26
    assert round(page.request.get(base+'/api/highlight').json()['match_score'],1) == 80.3
    match = page.request.get(base+'/api/match?' + urlencode({'person':'주정원','match':'정치훈'}))
    assert round(match.json()['match_score'],1) == 75.5
    assert not errors,errors
    assert not failed_assets,failed_assets
    print(json.dumps({'engine':page.evaluate('monogatari.version'),'paths':32,'endings':len(endings),'save_load':'response + pending choice + cross-route + rollback passed','widths':[1440,390,375,320,768],'api':'26 people, 80.3 highest, 75.5 search','errors':errors},ensure_ascii=False))
    browser.close()
