-- Fictitious, deterministic pilot data. Safe to run repeatedly.
-- Never replace these records with real pupils without a signed school agreement.
do $$
declare
  school_a constant uuid := '273121e5-d837-4c0c-a208-350cc9cb2810';
  school_b constant uuid := 'e1e32725-9871-43e3-9baa-fd029bd53334';
  year_a constant uuid := 'a0d8de5c-82b7-4220-b423-c761d6452817';
  class_a constant uuid := 'd2b27d93-d6f8-4f1e-86cd-7ab1c7a8b7d5';
  group_a constant uuid := 'aa01e5ba-4e2e-4b85-a290-dcb914bf3c17';
  math_a constant uuid := '073b7b61-50d1-4dcc-b269-88f663319777';
  teacher_a constant uuid := '692fd67b-9a89-4a42-9387-ec0ae5a410b8';
  student_a constant uuid := '6ce41c29-4f3f-46d4-bfc8-89a8647d73eb';
  parent_a constant uuid := '4b981a7b-98f2-4c3e-ba17-91284c3245b4';
  admin_a constant uuid := 'b0461a55-e877-4a7f-8239-d0ab0e07a690';
begin
  insert into public.school_periods (id,school_id,school_year_id,name,sequence,starts_on,ends_on) values
    ('10000000-0000-4000-8000-000000000001',school_a,year_a,'Periode 1',1,'2026-08-01','2026-10-18'),
    ('10000000-0000-4000-8000-000000000002',school_a,year_a,'Periode 2',2,'2026-10-19','2027-01-24'),
    ('10000000-0000-4000-8000-000000000003',school_a,year_a,'Periode 3',3,'2027-01-25','2027-04-18'),
    ('10000000-0000-4000-8000-000000000004',school_a,year_a,'Periode 4',4,'2027-04-19','2027-07-31')
  on conflict (id) do update set name=excluded.name,starts_on=excluded.starts_on,ends_on=excluded.ends_on;

  insert into public.school_locations (id,school_id,name,code,address,postal_code,city,is_main) values
    ('20000000-0000-4000-8000-000000000001',school_a,'Hoofdlocatie','HOOFD','Onderwijslaan 10','1234 AB','Voorbeeldstad',true)
  on conflict (id) do update set name=excluded.name,address=excluded.address;
  insert into public.rooms (id,school_id,location_id,code,name,capacity,room_type,is_accessible) values
    ('21000000-0000-4000-8000-000000000001',school_a,'20000000-0000-4000-8000-000000000001','B1.12','Lokaal B1.12',28,'classroom',true),
    ('21000000-0000-4000-8000-000000000002',school_a,'20000000-0000-4000-8000-000000000001','LAB1','Practica-lokaal',24,'laboratory',true)
  on conflict (id) do update set name=excluded.name,capacity=excluded.capacity;

  insert into public.subjects (id,school_id,name,code,color) values
    ('30000000-0000-4000-8000-000000000001',school_a,'Nederlands','NED','#dc2626'),
    ('30000000-0000-4000-8000-000000000002',school_a,'Engels','ENG','#7c3aed'),
    ('30000000-0000-4000-8000-000000000003',school_a,'Biologie','BIO','#16a34a'),
    ('30000000-0000-4000-8000-000000000004',school_a,'Geschiedenis','GES','#ca8a04')
  on conflict (id) do update set name=excluded.name,color=excluded.color;

  insert into public.student_group_memberships (id,school_id,student_profile_id,teaching_group_id,starts_on,status) values
    ('40000000-0000-4000-8000-000000000001',school_a,student_a,group_a,'2026-08-01','active')
  on conflict (student_profile_id,teaching_group_id) do update set status='active',ends_on=null;
  insert into public.teacher_group_assignments (id,school_id,teacher_profile_id,teaching_group_id,assignment_role,starts_on) values
    ('41000000-0000-4000-8000-000000000001',school_a,teacher_a,group_a,'teacher','2026-08-01')
  on conflict (teacher_profile_id,teaching_group_id,assignment_role) do update set ends_on=null;
  insert into public.teacher_subject_assignments (id,school_id,teacher_profile_id,school_year_id,subject_id,is_primary) values
    ('42000000-0000-4000-8000-000000000001',school_a,teacher_a,year_a,math_a,true)
  on conflict (teacher_profile_id,school_year_id,subject_id) do update set is_primary=true;

  insert into public.timetable_entries (id,school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,room_id,starts_at,ends_at,status,note,created_by) values
    ('50000000-0000-4000-8000-000000000001',school_a,year_a,group_a,math_a,teacher_a,'21000000-0000-4000-8000-000000000001','2026-08-31 08:30+02','2026-08-31 09:20+02','scheduled','Startles: functies',admin_a),
    ('50000000-0000-4000-8000-000000000002',school_a,year_a,group_a,math_a,teacher_a,'21000000-0000-4000-8000-000000000001','2026-09-02 10:20+02','2026-09-02 11:10+02','scheduled','Grafieken',admin_a)
  on conflict (id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,note=excluded.note;

  insert into public.assignments (id,school_id,teaching_group_id,subject_id,title,instructions,assigned_at,due_at,status,created_by) values
    ('60000000-0000-4000-8000-000000000001',school_a,group_a,math_a,'Oefenset functies','Maak opgaven 1 t/m 12 en noteer je tussenstappen.','2026-08-31 09:20+02','2026-09-07 08:30+02','published',teacher_a)
  on conflict (id) do update set instructions=excluded.instructions,due_at=excluded.due_at,status=excluded.status;
  insert into public.assessments (id,school_id,teaching_group_id,subject_id,title,assessment_type,occurs_at,maximum_score,weight,status,created_by) values
    ('61000000-0000-4000-8000-000000000001',school_a,group_a,math_a,'Instaptoets functies','test','2026-09-10 08:30+02',40,1,'published',teacher_a)
  on conflict (id) do update set occurs_at=excluded.occurs_at,status=excluded.status;
  insert into public.grades (id,school_id,assessment_id,student_profile_id,score,grade,note,status,graded_by,graded_at) values
    ('62000000-0000-4000-8000-000000000001',school_a,'61000000-0000-4000-8000-000000000001',student_a,31,7.8,'Goede basis; let op het aflezen van snijpunten.','published',teacher_a,'2026-09-11 14:00+02')
  on conflict (id) do update set score=excluded.score,grade=excluded.grade,note=excluded.note,status=excluded.status;
  insert into public.attendance_records (id,school_id,timetable_entry_id,student_profile_id,status,minutes_late,note,recorded_by,recorded_at) values
    ('63000000-0000-4000-8000-000000000001',school_a,'50000000-0000-4000-8000-000000000001',student_a,'present',0,null,teacher_a,'2026-08-31 08:35+02')
  on conflict (id) do update set status=excluded.status,minutes_late=excluded.minutes_late;
  insert into public.absence_requests (id,school_id,student_profile_id,reported_by,starts_at,ends_at,reason,status,reviewed_by,reviewed_at,review_note) values
    ('64000000-0000-4000-8000-000000000001',school_a,student_a,parent_a,'2026-09-18 08:00+02','2026-09-18 17:00+02','Fictieve tandartsafspraak','approved',admin_a,'2026-09-15 10:00+02','Goedgekeurd op basis van testproces.')
  on conflict (id) do update set status=excluded.status,review_note=excluded.review_note;
  insert into public.notifications (id,school_id,recipient_id,title,body,kind,action_path) values
    ('70000000-0000-4000-8000-000000000001',school_a,student_a,'Nieuwe opdracht','Oefenset functies staat klaar.','assignment','/app/opdrachten'),
    ('70000000-0000-4000-8000-000000000002',school_a,parent_a,'Absentieverzoek goedgekeurd','Het fictieve verzoek van 18 september is goedgekeurd.','absence','/app/absentie')
  on conflict (id) do update set title=excluded.title,body=excluded.body;

  insert into public.school_years (id,school_id,name,starts_on,ends_on,is_current) values
    ('80000000-0000-4000-8000-000000000001',school_b,'2026-2027','2026-08-01','2027-07-31',true)
  on conflict (id) do update set is_current=true;
  insert into public.school_locations (id,school_id,name,code,city,is_main) values
    ('81000000-0000-4000-8000-000000000001',school_b,'Locatie Noord','NOORD','Andere Teststad',true)
  on conflict (id) do update set name=excluded.name;
  insert into public.education_programmes (id,school_id,name,code,sector,level,duration_years) values
    ('82000000-0000-4000-8000-000000000001',school_b,'Vmbo pilot','VMBO','vo','vmbo-t',4)
  on conflict (id) do update set name=excluded.name;
  insert into public.subjects (id,school_id,name,code,color) values
    ('83000000-0000-4000-8000-000000000001',school_b,'Rekenen','REK','#0891b2')
  on conflict (id) do update set name=excluded.name;
end $$;
