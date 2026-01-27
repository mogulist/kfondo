-- Phase 1: events 테이블
-- Supabase SQL Editor에서 실행하세요

-- events 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL,
  name TEXT,
  years INTEGER[] NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'upcoming', 'completed')),
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_image TEXT NOT NULL,
  comment TEXT,
  data_source TEXT,
  year_details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 업데이트 시 updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정
-- 읽기는 모두 허용, 쓰기는 인증된 사용자만 (나중에 어드민 기능 추가 시)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 읽기 정책: 모든 사용자 허용
CREATE POLICY "Allow public read access on events"
  ON events
  FOR SELECT
  USING (true);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_years ON events USING GIN(years);
