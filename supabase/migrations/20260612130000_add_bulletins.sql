
CREATE TYPE bulletin_status AS ENUM ('CRITICAL', 'OPERATIONAL', 'SUPER_ADMIN', 'SECURITY');

CREATE TABLE IF NOT EXISTS bulletins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status bulletin_status DEFAULT 'OPERATIONAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bulletins" 
  ON bulletins FOR SELECT USING (true);

CREATE POLICY "Only super_admins can insert bulletins" 
  ON bulletins FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Only super_admins can update bulletins" 
  ON bulletins FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Only super_admins can delete bulletins" 
  ON bulletins FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );
