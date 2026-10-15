ALTER TABLE public.patients ADD COLUMN convenio text CHECK (convenio IS NULL OR length(trim(convenio)) BETWEEN 2 AND 120);
ALTER TABLE public.patients DROP CONSTRAINT patients_owner_id_cpf_key;
ALTER TABLE public.patients DROP COLUMN cpf;