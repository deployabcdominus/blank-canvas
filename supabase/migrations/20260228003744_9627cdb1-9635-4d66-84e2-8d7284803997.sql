
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS sent_date date,
ADD COLUMN IF NOT EXISTS sent_method text;

ALTER TABLE public.proposals ALTER COLUMN status SET DEFAULT 'Borrador';

UPDATE public.proposals SET status = 'Borrador' WHERE status = 'Pendente' OR status = 'En Análisis';
UPDATE public.proposals SET status = 'Enviada externamente' WHERE status = 'Enviada';
