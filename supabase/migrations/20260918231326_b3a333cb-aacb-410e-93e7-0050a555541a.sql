DO $$
DECLARE
  c uuid := '3f9373fe-e7cd-479e-91bc-b9a1f159d349';
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
  s_limpieza uuid; s_resina uuid; s_endo uuid;
BEGIN
  INSERT INTO public.patients (clinic_id, name, cedula, phone, email, birth_date, gender, address, history, last_visit)
  VALUES
    (c,'María Fernanda Gómez','V-18234567','04142223344','maria.gomez@gmail.com','1990-04-12','Femenino','Av. Bolívar, Caracas','Alergia a la penicilina. Sensibilidad en molares inferiores.', CURRENT_DATE),
    (c,'Carlos Andrés Pérez','V-14556677','04241112233','carlos.perez@gmail.com','1985-11-02','Masculino','Urb. El Paraíso, Caracas','Bruxismo nocturno. Usa férula de descarga.', CURRENT_DATE),
    (c,'Luisa Marcano','V-22334455','04129998877','luisa.marcano@gmail.com','1998-07-23','Femenino','Los Palos Grandes, Caracas','Primera consulta. Sin antecedentes relevantes.', CURRENT_DATE - 3),
    (c,'José Rafael Blanco','V-9887766','04165554433','jose.blanco@gmail.com','1972-01-30','Masculino','Catia, Caracas','Hipertenso controlado. Requiere anestesia sin vasoconstrictor.', CURRENT_DATE - 10),
    (c,'Andreína Salazar','V-25667788','04147776655','andreina.salazar@gmail.com','2001-09-15','Femenino','Chacao, Caracas','Ortodoncia en curso desde marzo.', CURRENT_DATE - 1),
    (c,'Pedro Luis Mendoza','V-16778899','04263334455','pedro.mendoza@gmail.com','1993-03-08','Masculino','La Candelaria, Caracas','Extracción de cordal superior derecha realizada.', CURRENT_DATE - 20)
  ;

  SELECT id INTO p1 FROM public.patients WHERE clinic_id=c AND name='María Fernanda Gómez' LIMIT 1;
  SELECT id INTO p2 FROM public.patients WHERE clinic_id=c AND name='Carlos Andrés Pérez' LIMIT 1;
  SELECT id INTO p3 FROM public.patients WHERE clinic_id=c AND name='Luisa Marcano' LIMIT 1;
  SELECT id INTO p4 FROM public.patients WHERE clinic_id=c AND name='José Rafael Blanco' LIMIT 1;
  SELECT id INTO p5 FROM public.patients WHERE clinic_id=c AND name='Andreína Salazar' LIMIT 1;
  SELECT id INTO p6 FROM public.patients WHERE clinic_id=c AND name='Pedro Luis Mendoza' LIMIT 1;

  INSERT INTO public.appointments (clinic_id, patient_id, patient_name, patient_phone, treatment, appt_date, appt_time, status, notes) VALUES
    (c,p1,'María Fernanda Gómez','04142223344','Limpieza ultrasónica', CURRENT_DATE,'09:00','confirmado','Traer radiografía previa'),
    (c,p2,'Carlos Andrés Pérez','04241112233','Control de férula', CURRENT_DATE,'10:30','pendiente',NULL),
    (c,p3,'Luisa Marcano','04129998877','Consulta y diagnóstico', CURRENT_DATE,'12:00','confirmado',NULL),
    (c,p5,'Andreína Salazar','04147776655','Control de ortodoncia', CURRENT_DATE,'15:00','pendiente',NULL),
    (c,p4,'José Rafael Blanco','04165554433','Resina fotocurado', CURRENT_DATE + 1,'11:00','confirmado',NULL),
    (c,p6,'Pedro Luis Mendoza','04263334455','Endodoncia', CURRENT_DATE + 2,'16:00','pendiente',NULL);

  INSERT INTO public.payments (clinic_id, patient_id, patient_name, amount, currency, method, rate, amount_usd, payment_date, note) VALUES
    (c,p1,'María Fernanda Gómez',30,'USD','Zelle',36.5,30, now(),'Limpieza'),
    (c,p3,'Luisa Marcano',730,'VEF','Pago Móvil',36.5,20, now(),'Consulta'),
    (c,p5,'Andreína Salazar',25,'USD','Efectivo',36.5,25, now() - interval '1 day','Control ortodoncia'),
    (c,p2,'Carlos Andrés Pérez',120,'USD','Transferencia',36.5,120, now() - interval '5 days','Endodoncia'),
    (c,p4,'José Rafael Blanco',1460,'VEF','Binance',36.5,40, now() - interval '9 days','Resina');

  SELECT id INTO s_limpieza FROM public.services WHERE clinic_id=c AND name ILIKE '%Limpieza%' LIMIT 1;
  SELECT id INTO s_resina FROM public.services WHERE clinic_id=c AND name ILIKE '%Resina%' LIMIT 1;
  SELECT id INTO s_endo FROM public.services WHERE clinic_id=c AND name ILIKE '%Endodoncia%' LIMIT 1;

  INSERT INTO public.treatment_items (clinic_id, patient_id, service_id, name, price_usd, status, notes) VALUES
    (c,p1,s_limpieza,'Limpieza Ultrasónica / Profunda',30,'Finalizado',NULL),
    (c,p1,s_resina,'Resina Fotocurado',40,'Pendiente','Pieza 36'),
    (c,p2,s_endo,'Endodoncia',120,'En curso','Pieza 26'),
    (c,p4,s_resina,'Resina Fotocurado',40,'Pendiente','Pieza 15');
END $$;