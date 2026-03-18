-- Sessions: satu per hari
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'submission' CHECK (status IN ('submission', 'voting', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facts: satu per member per session
CREATE TABLE facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, member_name)
);

-- Votes: satu per voter per session
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  voter_name TEXT NOT NULL,
  fact_id UUID REFERENCES facts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, voter_name)
);

-- Presences: siapa saja yang login pada session ini
CREATE TABLE presences (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, member_name)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE facts;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE presences;

-- View: leaderboard
CREATE VIEW leaderboard AS
SELECT
  f.member_name,
  COUNT(v.id)::INTEGER AS total_points,
  COUNT(DISTINCT f.session_id)::INTEGER AS sessions_participated
FROM facts f
LEFT JOIN votes v ON v.fact_id = f.id
JOIN sessions s ON s.id = f.session_id AND s.status = 'completed'
GROUP BY f.member_name
ORDER BY total_points DESC;
