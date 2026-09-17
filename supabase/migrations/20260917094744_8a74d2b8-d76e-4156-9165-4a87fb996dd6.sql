CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  report_type text NOT NULL DEFAULT 'lost',
  event_date date NOT NULL,
  location text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  image_path text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.items TO anon;
GRANT SELECT, INSERT ON public.items TO authenticated;
GRANT ALL ON public.items TO service_role;

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items" ON public.items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can report an item" ON public.items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view item images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'item-images');
CREATE POLICY "Anyone can upload item images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'item-images');

INSERT INTO public.items (item_name, category, description, report_type, event_date, location, contact_name, contact_email, contact_phone, status) VALUES
('Black leather wallet', 'Wallets & IDs', 'Slim bifold wallet with a transit card and two bank cards inside. No cash.', 'found', '2026-09-12', 'Central Station, Platform 4', 'Priya Menon', 'priya.menon@example.com', '+91 98200 11223', 'in_progress'),
('Silver MacBook Air 13 inch', 'Electronics', 'Laptop in a grey sleeve with a small dent near the hinge and a rocket sticker.', 'lost', '2026-09-10', 'Riverside Public Library, 2nd floor', 'Daniel Okoro', 'daniel.okoro@example.com', '+44 7700 900123', 'open'),
('Golden retriever with collar tag "Muffin"', 'Pets', 'Friendly adult dog, red collar with a brass tag. Answers to Muffin.', 'found', '2026-09-14', 'Hillcrest Park, near the tennis courts', 'Aisha Rahman', 'aisha.rahman@example.com', '+1 415 555 0142', 'recovered'),
('Set of house keys with blue tag', 'Keys', 'Three keys on a ring with a blue plastic tag and a small bottle opener.', 'lost', '2026-09-15', 'Bus route 27, between Elm St and Market Sq', 'Marco Silva', 'marco.silva@example.com', NULL, 'open');