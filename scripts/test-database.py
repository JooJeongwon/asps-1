"""Test the migration in an isolated local PostgreSQL cluster, never the live DB.

Requires initdb, pg_ctl, psql. Optional argument: private seed SQL to validate.
"""
import json
import pathlib
import subprocess
import sys
import tempfile

root = pathlib.Path(__file__).resolve().parent.parent

with tempfile.TemporaryDirectory(prefix='asps-pg-') as directory:
    base = pathlib.Path(directory)
    data = base / 'data'
    def run(args, **kwargs):
        result = subprocess.run(args, capture_output=True, text=True, **kwargs)
        if result.returncode:
            raise RuntimeError(result.stderr)
        return result.stdout
    run(['initdb', '-D', str(data), '-A', 'trust', '--no-locale', '-E', 'UTF8'])
    run(['pg_ctl', '-D', str(data), '-l', str(base/'server.log'), '-o', f"-k {base} -h ''", '-w', 'start'])
    def sql(text):
        return run(['psql', '-X', '-h', str(base), '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], input=text)
    try:
        sql('''create role anon; create role authenticated; create role service_role bypassrls;
        alter default privileges in schema public grant all on tables to anon, authenticated, service_role;''')
        sql((root/'supabase/migrations/202609110001_gcs.sql').read_text())
        if len(sys.argv) > 1:
            seed = pathlib.Path(sys.argv[1]).read_text()
        else:
            seed = "insert into public.gcs_datasets values ('test','test',now());\n"
            for i in range(26):
                seed += f"insert into public.gcs_participants values ('{i:02}', 'Person {i:02}');\n"
            for i in range(26):
                for j in range(i+1,26):
                    seed += f"insert into public.gcs_pairs(dataset_id,participant_a,participant_b,match_score,kai_difference,mbti_score,saju_score) values ('test','{i:02}','{j:02}',{55+(i+j)/2},{j-i},80,70);\n"
        sql(seed)
        if len(sys.argv)>1:
            sql(seed)  # Imported workbook seed must be repeatable without duplicates.
        sql((root/'supabase/tests/invariants.sql').read_text())
        rows = json.loads(sql('select json_agg(m) from public.gcs_matches m;'))
        if len(sys.argv)>1:
            expected = json.loads((root/'private/data.json').read_text())
            names = {p['id']:p['name'] for p in expected['participants']}
            actual = {(r['person_name'],r['match_name']):r for r in rows}
            for pair in expected['pairs']:
                a,b = names[pair['participant_a']],names[pair['participant_b']]
                for key in ['match_score','kai_difference','mbti_score','saju_score']:
                    assert actual[(a,b)][key] == pair[key] == actual[(b,a)][key]
        print(json.dumps({'postgres':'passed','participants':26,'unique_pairs':325,'directed_rows':len(rows),'rls_and_constraints':'passed','source_values': 'passed' if len(sys.argv)>1 else 'synthetic'}))
    finally:
        run(['pg_ctl','-D',str(data),'-m','fast','-w','stop'])
