CREATE TABLE public.clinic_settings (
  clinic_id UUID PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
  clinic_name TEXT NOT NULL DEFAULT '',
  doctor_name TEXT NOT NULL DEFAULT '',
  rif TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  logo_data_url TEXT NOT NULL DEFAULT '',
  rate_source TEXT NOT NULL DEFAULT 'manual',
  rate_value NUMERIC(14,4) NOT NULL DEFAULT 36.5,
  legal_note TEXT NOT NULL DEFAULT '',
  payment_instructions TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'America/Caracas',
  plan TEXT NOT NULL DEFAULT 'Profesional',
  plan_renews_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  admin_whatsapp TEXT NOT NULL DEFAULT '584140000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_settings TO service_role;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view clinic settings" ON public.clinic_settings FOR SELECT TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members insert clinic settings" ON public.clinic_settings FOR INSERT TO authenticated WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members update clinic settings" ON public.clinic_settings FOR UPDATE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE TRIGGER trg_clinic_settings_updated BEFORE UPDATE ON public.clinic_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Otros',
  price_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_clinic ON public.services(clinic_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view services" ON public.services FOR SELECT TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members update services" ON public.services FOR UPDATE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members delete services" ON public.services FOR DELETE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  method public.payment_method NOT NULL,
  label TEXT NOT NULL,
  holder TEXT NOT NULL DEFAULT '',
  email TEXT,
  bank TEXT,
  phone TEXT,
  id_number TEXT,
  account_number TEXT,
  account_type TEXT,
  swift_code TEXT,
  binance_id TEXT,
  binance_network TEXT,
  binance_email TEXT,
  instructions TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_accounts_clinic ON public.payment_accounts(clinic_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_accounts TO authenticated;
GRANT ALL ON public.payment_accounts TO service_role;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view payment accounts" ON public.payment_accounts FOR SELECT TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members insert payment accounts" ON public.payment_accounts FOR INSERT TO authenticated WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members update payment accounts" ON public.payment_accounts FOR UPDATE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members delete payment accounts" ON public.payment_accounts FOR DELETE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE TRIGGER trg_payment_accounts_updated BEFORE UPDATE ON public.payment_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_specialists_clinic ON public.specialists(clinic_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.specialists TO authenticated;
GRANT ALL ON public.specialists TO service_role;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view specialists" ON public.specialists FOR SELECT TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members insert specialists" ON public.specialists FOR INSERT TO authenticated WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members update specialists" ON public.specialists FOR UPDATE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members delete specialists" ON public.specialists FOR DELETE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE TRIGGER trg_specialists_updated BEFORE UPDATE ON public.specialists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.treatment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  notes TEXT,
  specialist_id UUID REFERENCES public.specialists(id) ON DELETE SET NULL,
  commission_status TEXT,
  commission_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_treatment_items_clinic ON public.treatment_items(clinic_id);
CREATE INDEX idx_treatment_items_patient ON public.treatment_items(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treatment_items TO authenticated;
GRANT ALL ON public.treatment_items TO service_role;
ALTER TABLE public.treatment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view treatment items" ON public.treatment_items FOR SELECT TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members insert treatment items" ON public.treatment_items FOR INSERT TO authenticated WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members update treatment items" ON public.treatment_items FOR UPDATE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Members delete treatment items" ON public.treatment_items FOR DELETE TO authenticated USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE TRIGGER trg_treatment_items_updated BEFORE UPDATE ON public.treatment_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.seed_clinic_defaults(_clinic_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clinic_settings (clinic_id, clinic_name, legal_note, payment_instructions)
  VALUES (
    _clinic_id,
    COALESCE((SELECT name FROM public.clinics WHERE id = _clinic_id), 'Mi Consultorio'),
    'Presupuesto válido por 15 días. Los precios en bolívares se ajustan según la tasa del día.',
    'Indique aquí sus datos de pago (Pago Móvil, Zelle, transferencia).'
  )
  ON CONFLICT (clinic_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE clinic_id = _clinic_id) THEN
    INSERT INTO public.services (clinic_id, name, category, price_usd) VALUES
      (_clinic_id, 'Consulta y Diagnóstico', 'Diagnóstico', 20),
      (_clinic_id, 'Limpieza Ultrasónica', 'Preventiva', 30),
      (_clinic_id, 'Resina / Calzadura', 'Estética', 40),
      (_clinic_id, 'Extracción Simple', 'Cirugía', 30),
      (_clinic_id, 'Tratamiento de Conducto', 'Endodoncia', 120),
      (_clinic_id, 'Corona de Porcelana', 'Prótesis', 250),
      (_clinic_id, 'Blanqueamiento Dental', 'Estética', 80),
      (_clinic_id, 'Ortodoncia (Instalación)', 'Ortodoncia', 300),
      (_clinic_id, 'Control de Ortodoncia', 'Ortodoncia', 25);
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.seed_clinic_defaults(UUID) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.on_clinic_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_clinic_defaults(NEW.id);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.on_clinic_created() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_clinic_created AFTER INSERT ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.on_clinic_created();

DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN SELECT id FROM public.clinics LOOP
    PERFORM public.seed_clinic_defaults(c.id);
  END LOOP;
END $$;