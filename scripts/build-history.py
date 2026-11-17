#!/usr/bin/env python3
"""Builds data/history/ (postal codes, municipalities and counties over time) and
refreshes data/postal-codes-2026.json (today's postal codes).

Sources (fetched on every run, nothing is cached):
- Statistics Norway (SSB) Klass 131 (municipalities) and 104 (counties): ids, names, changes.
- Posten/Bring: today's postal code register and the log of every change since 2003-10-01.
  Today's register played backwards through the log gives the register on any date.

Run after a municipal reform, or when Posten changes postal codes:
    python3 scripts/build-history.py

Python, standard library only: the log is an .xlsx file, and zipfile + xml read it
without a dependency.
"""
import collections
import datetime
import io
import json
import pathlib
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

TODAY = datetime.date.today().isoformat()
KLASS = 'https://data.ssb.no/api/klass/v1/classifications'
BRING = 'https://www.bring.no'
# The lineage (which earlier ids make up a municipality of today) is built from this date.
LINEAGE_SINCE = '2003-01-01'
ROOT = pathlib.Path(__file__).resolve().parent.parent
SINCE = '2003-01-01'


def fetch(url):
    request = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'geo-historikk'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def klass(path):
    return json.loads(fetch(f'{KLASS}/{path}'))


# ---------------------------------------------------------------- Posten

def register():
    """Today's register: postnummer -> (poststed, kommunenr, kategori)."""
    rows = {}
    for line in fetch(f'{BRING}/postnummerregister-ansi.txt').decode('latin1').splitlines():
        p = line.split('\t')
        if len(p) >= 5:
            rows[p[0]] = (p[1], p[2], p[4])
    return rows


def change_log():
    """Posten's log of new, changed and closed postnummer, newest first."""
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    book = zipfile.ZipFile(io.BytesIO(fetch(f'{BRING}/postnummerlogg-alle-excel.xlsx')))
    strings = [''.join(t.text or '' for t in si.iter(ns + 't')) for si in ET.fromstring(book.read('xl/sharedStrings.xml'))]

    def column(ref):
        n = 0
        for ch in ref:
            if ch.isalpha():
                n = n * 26 + ord(ch) - 64
        return n - 1

    rows = []
    for r in ET.fromstring(book.read('xl/worksheets/sheet1.xml')).find(ns + 'sheetData'):
        row = [''] * 12
        for c in r:
            v = c.find(ns + 'v')
            if v is not None:
                row[column(c.get('r'))] = strings[int(v.text)] if c.get('t') == 's' else v.text
        rows.append(row)
    assert rows[0][:5] == ['Dato_kronlogisk', 'Type_endring', 'Postnummer', 'Poststedsnavn', 'Kommunenr'], rows[0]

    events = []
    for r in rows[1:]:
        date = (datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(r[0])))).isoformat()
        # Excel has eaten the leading zeros.
        fix = lambda s: s.zfill(4) if s else s
        events.append({
            'date': date, 'type': r[1], 'pn': fix(r[2]),
            'before': (r[3], fix(r[4]), r[6]),
            'pn_after': fix(r[7]), 'after': (r[8], fix(r[9]), r[11]),
        })
    return events


def replay(now, events):
    """Plays the log backwards from today's register.

    Returns {postnummer: [(from, to, (poststed, kommunenr, kategori)), ...]} oldest first
    (from None: before the log starts in 2003; to None: still valid), the events that did
    not fit the state they met, and {closed postnummer: its replacement}.
    """
    state = {pn: {'v': v, 'to': None} for pn, v in now.items()}
    periods = collections.defaultdict(list)
    odd, replaced = [], {}

    def step_back(pn, date, before):
        cur = state.get(pn)
        if cur:
            periods[pn].append((date, cur['to'], cur['v']))
        if before is None:
            state.pop(pn, None)
        else:
            state[pn] = {'v': before, 'to': date}

    by_date = collections.defaultdict(list)
    for e in events:
        by_date[e['date']].append(e)

    for date in sorted(by_date, reverse=True):
        todo = by_date[date][:]
        created = {e['pn'] for e in todo if e['type'] == 'Nyopprettet'}
        while todo:
            # Several events can hit one postnummer on one date: take the one whose
            # «after» is the state we stand in.
            def fits(e):
                cur = state.get(e['pn'])
                if e['type'] == 'Nyopprettet':
                    return cur is not None and cur['v'][1] == e['before'][1]
                if e['type'].startswith('Opphørt'):
                    return cur is None
                if e['type'] == 'Endret postnummer':
                    return cur is None and e['pn_after'] in state
                return cur is not None and cur['v'] == e['after']

            e = next((e for e in todo if fits(e)), None)
            if e is None:
                e = todo[0]
                odd.append(e)
            todo.remove(e)

            if e['type'] == 'Nyopprettet':
                step_back(e['pn'], date, None)
                continue
            if e['type'] in ('Endret postnummer', 'Opphørt og erstattet') and e['pn_after'] != e['pn']:
                replaced[e['pn']] = e['pn_after']
                if e['type'] == 'Endret postnummer' and e['pn_after'] not in created:
                    step_back(e['pn_after'], date, None)
            step_back(e['pn'], date, e['before'])

    for pn, cur in state.items():
        periods[pn].append((None, cur['to'], cur['v']))
    for pn, ps in periods.items():
        # Two events on one date leave a period of no length between them.
        ps[:] = [p for p in ps if p[0] is None or p[0] != p[1]]
        ps.sort(key=lambda p: p[0] or '')
        # Posten's log has no kommune for some postnummer closed long ago: take the neighbour's.
        known = next((p[2][1] for p in ps if p[2][1]), '')
        for i, (f, t, v) in enumerate(ps):
            if not v[1]:
                near = next((q[2][1] for q in ps[i + 1:] if q[2][1]), known)
                ps[i] = (f, t, (v[0], near, v[2]))
    return dict(periods), odd, replaced


# ---------------------------------------------------------------- SSB

def lineage(changes):
    """Edges old -> new where the old number ends. A kommune that keeps its number while
    giving away some area (Indre Østfold 2026) lives on and is no edge."""
    lives_on = {(c['oldCode'], c['changeOccurred']) for c in changes if c['oldCode'] == c['newCode']}
    return [c for c in changes if c['oldCode'] != c['newCode'] and (c['oldCode'], c['changeOccurred']) not in lives_on]


def build(today_codes, changes, periods, replaced, names):
    edges = lineage(changes)
    parents = collections.defaultdict(list)
    children = collections.defaultdict(list)
    for e in edges:
        parents[e['newCode']].append(e)
        children[e['oldCode']].append(e)
    first_name = {}
    for c in changes:
        first_name.setdefault(c['oldCode'], c['oldName'])

    # Every earlier number that leads to today's kommune.
    ancestors = {}
    for code in today_codes:
        seen, queue = {code}, [code]
        while queue:
            for e in parents[queue.pop(0)]:
                if e['oldCode'] not in seen:
                    seen.add(e['oldCode'])
                    queue.append(e['oldCode'])
        ancestors[code] = seen

    def descendants(code, after=''):
        steps = sorted((e['changeOccurred'], e['newCode']) for e in children[code] if e['changeOccurred'] > after)
        if not steps:
            return {code} if code in today_codes else set()
        date = steps[0][0]
        out = set()
        for d, new in steps:
            if d == date:
                out |= descendants(new, date)
        return out

    # Where each postnummer is today.
    def destination(pn):
        last = periods[pn][-1]
        if last[1] is None:
            return last[2][1] if last[2][1] in today_codes else None
        # Closed: where its kommune went. If that kommune was divided, the postnummer that
        # replaced it decides, as long as it stayed within the same kommune.
        heirs = descendants(last[2][1])
        if len(heirs) == 1:
            return next(iter(heirs))
        after = destination(replaced[pn]) if pn in replaced and replaced[pn] in periods else None
        return after if after in heirs else None

    postnummer_of = collections.defaultdict(set)
    for pn, ps in periods.items():
        for f, t, v in ps:
            if t is None or t > LINEAGE_SINCE:
                postnummer_of[v[1]].add(pn)

    whole = collections.defaultdict(set)      # today's kommune -> numbers that are all its own
    parts = collections.defaultdict(list)     # today's kommune -> [{kid, postnummer, med}]
    notes = collections.defaultdict(list)
    report = []

    old_codes = set().union(*ancestors.values())
    for code in sorted(old_codes):
        heirs = descendants(code)
        if not heirs:
            continue
        tally = collections.defaultdict(list)
        for pn in sorted(postnummer_of[code]):
            dest = destination(pn)
            if dest:
                tally[dest].append(pn)
        if len(heirs) == 1:
            main = next(iter(heirs))
        else:
            # Most postnummer wins; a tie goes to the one that got the place named after the kommune.
            place = bare(first_name.get(code, '')).upper()
            main = max(sorted(heirs), key=lambda h: (
                len(tally.get(h, [])),
                any(periods[pn][-1][2][0] == place for pn in tally.get(h, [])),
                names[h] == first_name.get(code)))
        others = {k: v for k, v in tally.items() if k != main}
        name = first_name.get(code, names.get(code, code))
        if not others:
            whole[main].add(code)
        else:
            away = sorted(pn for v in others.values() for pn in v)
            parts[main].append({'kid': int(code), 'postnummer': away, 'med': False})
            notes[main].append(f'NB: {code} {name}: postnummer {span(away)} er regnet til {", ".join(sorted(names[k] for k in others))}.')
            for k, pns in others.items():
                parts[k].append({'kid': int(code), 'postnummer': pns, 'med': True})
                notes[k].append(f'NB: {code} {name}: bare postnummer {span(pns)} er regnet med.')
            report.append((code, name, names[main], {names[k]: v for k, v in others.items()}))
        # A successor on paper that got no postnummer of its own (Heim from Snillfjord).
        ends = max((e['changeOccurred'] for e in children[code]), default='')
        divided = len({e['newCode'] for e in children[code] if e['changeOccurred'] == ends}) > 1
        for h in (heirs - {main} - set(others)) if divided else ():
            notes[h].append(f'NB: {code} {name} ble delt, men delen som gikk til {names[h]} har ikke eget postnummer og er ikke med.')

    result = {}
    for code in sorted(today_codes):
        own = whole[code]
        earlier = sorted(
            {bare(first_name[c]) for c in own if c != code and c in first_name
             and names[code] not in bare(first_name[c]).split(' - ')},
            key=str.casefold)
        entry = {'navn': names[code], 'kids': sorted((int(c) for c in own), reverse=True), 'tidligere': earlier}
        if parts[code]:
            entry['deler'] = sorted(parts[code], key=lambda p: p['kid'])
            entry['merknader'] = notes[code] + ['Fordelingen følger Postens postnummerregister. Postnummer følger ikke kommunegrensene nøyaktig.']
        elif notes[code]:
            entry['merknader'] = notes[code]
        result[int(code)] = entry
    return result, report


def bare(name):
    """«Nes» for «Nes (Akershus)»."""
    return name.split(' (')[0]


def span(pns):
    return ', '.join(pns) if len(pns) <= 6 else f'{pns[0]}–{pns[-1]} ({len(pns)} stk.)'


# ---------------------------------------------------------------- main

def title(place):
    """«Storjord i Tysfjord» for Posten's «STORJORD I TYSFJORD»."""
    s = place.title()
    for word in (' I ', ' Og ', ' På ', ' Til ', ' Ved '):
        s = s.replace(word, word.lower())
    return s


def with_periods(codes):
    """SSB lists an id once per name it has had: one entry per id, a period per name."""
    by_id = collections.defaultdict(list)
    for c in sorted(codes, key=lambda c: c['validFromInRequestedRange']):
        start, end = c['validFromInRequestedRange'], c['validToInRequestedRange']
        by_id[c['code']].append({
            'from': None if start == SINCE else start,
            'to': None if end == TODAY else end,
            'name': c['name'].strip(),
        })
    return [{'id': code, 'periods': periods} for code, periods in sorted(by_id.items())]


def as_changes(changes):
    lives_on = {(c['oldCode'], c['changeOccurred']) for c in changes if c['oldCode'] == c['newCode']}
    out = []
    for c in sorted(changes, key=lambda c: (c['changeOccurred'], c['oldCode'], c['newCode'])):
        if c['oldCode'] == c['newCode']:
            if c['oldName'] == c['newName']:
                continue
            kind = 'renamed'
        else:
            # transfer: the old id lives on and gives away some area. succession: it ends.
            kind = 'transfer' if (c['oldCode'], c['changeOccurred']) in lives_on else 'succession'
        out.append({'date': c['changeOccurred'], 'kind': kind,
                    'fromId': c['oldCode'], 'fromName': c['oldName'], 'toId': c['newCode'], 'toName': c['newName']})
    return out


def write(name, data):
    path = ROOT / 'data/history' / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'{path.relative_to(ROOT)}: {len(data)} entries, {path.stat().st_size // 1024} KB')


def main():
    today = {c['code']: c['name'] for c in klass(f'131/codesAt?date={TODAY}')['codes'] if c['code'] != '9999'}
    plain = {m['id']: m['name_no'] for m in json.loads((ROOT / 'data/municipalities-2025.json').read_text())}
    names = {code: plain.get(code, name) for code, name in today.items()}

    now = register()
    events = change_log()
    periods, odd, replaced = replay(now, events)
    lineage, report = build(set(today), klass(f'131/changes?from={LINEAGE_SINCE}&to={TODAY}')['codeChanges'], periods, replaced, names)

    # Today's register, in the file the main entry point reads. A place keeps the spelling
    # it already has («Mo i Rana»); Posten writes everything in capitals.
    current = ROOT / 'data/postal-codes-2026.json'
    spelling = {e['place'].upper(): e['place'] for e in json.loads(current.read_text())}
    current.write_text(json.dumps(
        [{'code': pn, 'place': spelling.get(v[0], title(v[0])), 'id': v[1]} for pn, v in sorted(now.items())],
        ensure_ascii=False, indent=2) + '\n')
    print(f'{current.relative_to(ROOT)}: {len(now)} entries')

    write('postal-codes.json', [
        {'code': pn, 'periods': [
            {'from': f, 'to': t, 'place': title(v[0]), 'municipalityId': v[1], 'category': v[2]} for f, t, v in ps]}
        for pn, ps in sorted(periods.items())])
    write('municipalities.json', with_periods(klass(f'131/codes?from={SINCE}&to={TODAY}')['codes']))
    write('counties.json', with_periods(klass(f'104/codes?from={SINCE}&to={TODAY}')['codes']))
    write('municipality-changes.json', as_changes(klass(f'131/changes?from={SINCE}&to={TODAY}')['codeChanges']))
    write('county-changes.json', as_changes(klass(f'104/changes?from={SINCE}&to={TODAY}')['codeChanges']))
    write('municipality-lineage.json', [
        {'id': f'{kid:04d}', 'name': e['navn'],
         'ids': [f'{k:04d}' for k in e['kids']],
         'parts': [{'id': f'{p["kid"]:04d}', 'postalCodes': p['postnummer'], 'included': p['med']} for p in e.get('deler', [])]}
        for kid, e in sorted(lineage.items())])

    print(f'{len(events)} events in Posten\'s log from {min(e["date"] for e in events)}, {len(odd)} did not fit the state they met')
    print(f'{len(report)} earlier municipality ids are shared between today\'s municipalities by postal code')


if __name__ == '__main__':
    main()
