-- ============ ENUMS ============
CREATE TYPE public.clinic_role AS ENUM ('owner', 'doctor', 'assistant');
CREATE TYPE public.appointment_status AS ENUM ('pendiente', 'confirmado', 'completado', 'cancelado');
CREATE TYPE public.payment_currency AS ENUM ('USD', 'VEF');
CREATE TYPE public.payment_method AS ENUM ('Zelle', 'Efectivo', 'Pago Móvil', 'Transferencia', 'Binance');

-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ CLINICS ============
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rif TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER clinics_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CLINIC MEMBERS ============
CREATE TABLE public.clinic_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.clinic_role NOT NULL DEFAULT 'doctor',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, user_id)
);
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clinic_members_user ON public.clinic_members(user_id);
CREATE INDEX idx_clinic_members_clinic ON public.clinic_members(clinic_id);

-- ============ SECURITY DEFINER: membership check (no recursion) ============
CREATE OR REPLACE FUNCTION public.is_clinic_member(_user_id UUID, _clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_members
    WHERE user_id = _user_id AND clinic_id = _clinic_id
  );
$$;

-- ============ PATIENTS ============
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cedula TEXT,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  history TEXT DEFAULT '',
  last_visit DATE,
  teeth JSONB NOT NULL DEFAULT '{}'::jsonb,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_patients_clinic ON public.patients(clinic_id);
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  treatment TEXT NOT NULL,
  appt_date DATE NOT NULL,
  appt_time TIME NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pendiente',
  notes TEXT,
  payment_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_appointments_clinic_date ON public.appointments(clinic_id, appt_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency public.payment_currency NOT NULL,
  method public.payment_method NOT NULL,
  rate NUMERIC(12,4) NOT NULL,
  amount_usd NUMERIC(12,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payments_clinic_date ON public.payments(clinic_id, payment_date DESC);
CREATE INDEX idx_payments_patient ON public.payments(patient_id);

-- ============ RLS POLICIES ============
-- clinics: visible solo a sus miembros
CREATE POLICY "Members can view their clinics"
  ON public.clinics FOR SELECT TO authenticated
  USING (public.is_clinic_member(auth.uid(), id));
CREATE POLICY "Members can update their clinics"
  ON public.clinics FOR UPDATE TO authenticated
  USING (public.is_clinic_member(auth.uid(), id));
-- INSERT de clínicas se hace vía trigger (security definer); no se exponen políticas de insert.

-- clinic_members: cada usuario ve los miembros de las clínicas a las que pertenece
CREATE POLICY "Members can view clinic memberships"
  ON public.clinic_members FOR SELECT TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Owners can add members"
  ON public.clinic_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinic_members cm
      WHERE cm.clinic_id = clinic_members.clinic_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
  );
CREATE POLICY "Owners can remove members"
  ON public.clinic_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clinic_members cm
      WHERE cm.clinic_id = clinic_members.clinic_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
  );

-- patients
CREATE POLICY "Clinic members can view patients"
  ON public.patients FOR SELECT TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can insert patients"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can update patients"
  ON public.patients FOR UPDATE TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can delete patients"
  ON public.patients FOR DELETE TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));

-- appointments
CREATE POLICY "Clinic members can view appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can insert appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));

-- payments
CREATE POLICY "Clinic members can view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.is_clinic_member(auth.uid(), clinic_id));
CREATE POLICY "Clinic members can delete payments"
  ON public.payments FOR DELETE TO authenticated
  USING (public.is_clinic_member(auth.uid(), clinic_id));

-- ============ AUTO-CREATE CLINIC + SEED ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_clinic_id UUID;
  full_name TEXT;
  clinic_name TEXT;
  whatsapp TEXT;
  today_date DATE := CURRENT_DATE;
  p1 UUID; p2 UUID; p3 UUID; p4 UUID;
  empty_teeth JSONB := '{}'::jsonb;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', full_name || ' · Consultorio');
  whatsapp := NEW.raw_user_meta_data->>'whatsapp';

  -- 1. Crear clínica
  INSERT INTO public.clinics (name, phone, email)
  VALUES (clinic_name, whatsapp, NEW.email)
  RETURNING id INTO new_clinic_id;

  -- 2. Añadir al usuario como owner
  INSERT INTO public.clinic_members (clinic_id, user_id, role, display_name)
  VALUES (new_clinic_id, NEW.id, 'owner', full_name);

  -- 3. Sembrar pacientes demo
  INSERT INTO public.patients (clinic_id, name, cedula, phone, email, birth_date, gender, address, history, last_visit, teeth)
  VALUES
    (new_clinic_id, 'María González', 'V-15.234.567', '+58 414-1234567', 'maria.g@email.com', '1985-04-12', 'F', 'Av. Francisco de Miranda, Caracas', 'Paciente con historial de gingivitis leve. Última limpieza profesional realizada en marzo. Refiere sensibilidad ocasional al frío en molares superiores derechos.', today_date - 5, '{"16":"caries","26":"tratado"}'::jsonb)
    RETURNING id INTO p1;
  INSERT INTO public.patients (clinic_id, name, cedula, phone, email, birth_date, gender, address, history, last_visit, teeth)
  VALUES
    (new_clinic_id, 'Carlos Pérez', 'V-12.456.789', '+58 412-7654321', 'cperez@email.com', '1978-09-03', 'M', 'Urb. La Trinidad, Caracas', 'Endodoncia en pieza 36 en curso. Segunda sesión programada. Sin alergias conocidas.', today_date - 2, '{"36":"tratado","37":"caries"}'::jsonb)
    RETURNING id INTO p2;
  INSERT INTO public.patients (clinic_id, name, cedula, phone, email, birth_date, gender, address, history, last_visit, teeth)
  VALUES
    (new_clinic_id, 'Ana Rodríguez', 'V-20.111.333', '+58 424-9988776', 'ana.r@email.com', '1995-11-20', 'F', 'Los Palos Grandes, Caracas', 'Primera consulta. Solicita evaluación para ortodoncia.', today_date - 1, empty_teeth)
    RETURNING id INTO p3;
  INSERT INTO public.patients (clinic_id, name, cedula, phone, email, birth_date, gender, address, history, last_visit, teeth)
  VALUES
    (new_clinic_id, 'Luis Hernández', 'V-18.555.222', '+58 416-3344556', 'luish@email.com', '1990-02-15', 'M', 'El Hatillo, Caracas', 'Blanqueamiento dental en proceso. Sin patologías relevantes.', today_date - 7, empty_teeth)
    RETURNING id INTO p4;

  -- 4. Sembrar citas demo
  INSERT INTO public.appointments (clinic_id, patient_id, patient_name, patient_phone, treatment, appt_date, appt_time, status) VALUES
    (new_clinic_id, p1, 'María González', '584141234567', 'Limpieza dental', today_date, '09:00', 'confirmado'),
    (new_clinic_id, p2, 'Carlos Pérez', '584127654321', 'Endodoncia · Sesión 2', today_date, '10:30', 'confirmado'),
    (new_clinic_id, p3, 'Ana Rodríguez', '584249988776', 'Consulta inicial', today_date, '12:00', 'pendiente'),
    (new_clinic_id, p4, 'Luis Hernández', '584163344556', 'Blanqueamiento', today_date, '14:30', 'pendiente'),
    (new_clinic_id, NULL, 'Sofía Martínez', '584145556677', 'Ortodoncia · Control', today_date, '16:00', 'confirmado'),
    (new_clinic_id, p1, 'María González', '584141234567', 'Control post-limpieza', today_date + 1, '11:00', 'pendiente'),
    (new_clinic_id, p2, 'Carlos Pérez', '584127654321', 'Endodoncia · Sesión 3', today_date + 2, '09:30', 'confirmado'),
    (new_clinic_id, NULL, 'Pedro Linares', '584142223344', 'Extracción', today_date + 3, '15:00', 'pendiente');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();