begin;
do $$
declare t text; r text; op text; p public.gcs_pairs%rowtype;
begin
  if (select count(*) from public.gcs_participants) <> 26 then raise exception 'participant count'; end if;
  if (select count(*) from public.gcs_pairs) <> 325 then raise exception 'pair count'; end if;
  if (select count(*) from public.gcs_matches) <> 650 then raise exception 'directed count'; end if;
  if exists(select 1 from public.gcs_matches group by person_name having count(*)<>25) then raise exception 'degree'; end if;
  foreach t in array array['gcs_datasets','gcs_participants','gcs_pairs','gcs_matches'] loop
    foreach r in array array['anon','authenticated'] loop
      foreach op in array array['SELECT','INSERT','UPDATE','DELETE'] loop
        if has_table_privilege(r,'public.'||t,op) then raise exception 'client privilege remains'; end if;
      end loop;
    end loop;
  end loop;
  if exists(select 1 from pg_class where oid in ('public.gcs_datasets'::regclass,'public.gcs_participants'::regclass,'public.gcs_pairs'::regclass) and not relrowsecurity) then raise exception 'RLS disabled'; end if;
  select * into p from public.gcs_pairs limit 1;
  update public.gcs_pairs set match_score=76 where dataset_id=p.dataset_id and participant_a=p.participant_a and participant_b=p.participant_b;
  if (select match_group from public.gcs_pairs where dataset_id=p.dataset_id and participant_a=p.participant_a and participant_b=p.participant_b)<>'베스트 프렌드' then raise exception '76 boundary'; end if;
  update public.gcs_pairs set match_score=75.999 where dataset_id=p.dataset_id and participant_a=p.participant_a and participant_b=p.participant_b;
  if (select match_group from public.gcs_pairs where dataset_id=p.dataset_id and participant_a=p.participant_a and participant_b=p.participant_b)<>'좋음' then raise exception 'raw score boundary'; end if;
  begin
    update public.gcs_pairs set match_score=101;
    raise exception 'range constraint missing';
  exception when check_violation then null;
  end;
  begin
    update public.gcs_pairs set participant_b=participant_a;
    raise exception 'self-pair constraint missing';
  exception when check_violation then null;
  end;
end $$;
set local role anon;
do $$ begin
  begin perform * from public.gcs_matches; raise exception 'anon read succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  begin perform * from public.gcs_pairs; raise exception 'authenticated read succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ begin
  if (select count(*) from public.gcs_matches)<>650 then raise exception 'server cannot read'; end if;
end $$;
rollback;
