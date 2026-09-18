create policy "clinic members read logos"
on storage.objects for select to authenticated
using (bucket_id = 'clinic-logos' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members upload logos"
on storage.objects for insert to authenticated
with check (bucket_id = 'clinic-logos' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members update logos"
on storage.objects for update to authenticated
using (bucket_id = 'clinic-logos' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid))
with check (bucket_id = 'clinic-logos' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members delete logos"
on storage.objects for delete to authenticated
using (bucket_id = 'clinic-logos' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members read patient files"
on storage.objects for select to authenticated
using (bucket_id = 'patient-files' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members upload patient files"
on storage.objects for insert to authenticated
with check (bucket_id = 'patient-files' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members update patient files"
on storage.objects for update to authenticated
using (bucket_id = 'patient-files' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid))
with check (bucket_id = 'patient-files' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));

create policy "clinic members delete patient files"
on storage.objects for delete to authenticated
using (bucket_id = 'patient-files' and public.is_clinic_member(auth.uid(), (storage.foldername(name))[1]::uuid));