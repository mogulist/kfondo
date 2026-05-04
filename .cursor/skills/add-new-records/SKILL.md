---
name: add-new-records
description: >-
  Guides adding new Granfondo-style race records to K-Fondo: crawl preliminary
  JSON, align Event labels to DB course names, generate sorted-msec, publish to
  Blob and edition URLs. Korean triggers: 새로운 그란폰도 이벤트 대회의 기록을
  추가, 대회 기록 수집, 기록 반영, 크롤링, SPTC, SmartChip, preliminary,
  sorted-msec, publish:edition-records, revalidate. Use when the user wants to
  collect or upload records for an edition that typically already exists in
  admin. Follows docs/ADD_EVENT.md; does not include creating events/editions
  from scratch (see docs/events/supabase-prep.md separately).
disable-model-invocation: false
---

# 새 대회 기록 추가 (`add-new-records`)

## 전제 (통상)

- **어드민에서 이벤트·에디션·코스는 이미 만들어져 있다**고 가정한다.
- 이 스킬 범위에 **에디션/코스 신규 생성 절차는 넣지 않는다.** 그때는 참고용으로만 `docs/events/supabase-prep.md`를 쓴다.

## 먼저 읽을 문서

- 개요·단계 링크: `docs/ADD_EVENT.md`
- 단계별 상세: `docs/events/` — 크롤부터면 `crawl-records.md`, 정제·sorted·Blob은 각각 해당 파일.
- **`docs/events/supabase-prep.md`는 이 스킬 플로우에 포함하지 않는다.** (메타데이터를 처음부터 만들 때만 별도 참고)

## 작업 시작 시 사용자에게 요청할 것 (순서)

1. **이벤트 slug** — `/{slug}` 및 Supabase에 등록된 slug와 동일한지 확인할 수 있도록 **반드시** 사용자에게 알려 달라고 한다.
2. **데이터 제공처**와 **이벤트 식별자** (SPTC `EVENT_NO`, SmartChip `usedata` 등).
3. **연도** (파일명·에디션 매칭에 필요할 때).
4. **검증용 BIB 3~5개**와 각 **기대 총시간** 또는 **기대 Status**(DNF 등).

## SmartChip(HTML)

- 응답은 JSON이 아니라 HTML이라 레이아웃이 바뀔 수 있다.
- **기존 크롤러**로 위 샘플 BIB만 먼저 수집해(`--bibs` 등) 기대값과 비교하고, 맞으면/틀리면 사용자에게 피드백한다.
- 샘플이 맞지 않으면 사용자와 수집 방법을 맞춘 뒤 `crawlers/` 코드를 수정한다.

## 샘플 통과 후

- **전체** (예: BIB 1~9999) 수집 vs **소량 파일럿**(예: ~100)으로 이상 패턴을 먼저 볼지 **사용자에게 확인**한다.

## 그 다음

`docs/events/`의 정제 → sorted-msec → Blob 순서를 `ADD_EVENT.md` 개요에 따라 진행한다. **DB 코스명과 `Event` 문자열 정합**은 정제·검증 단계 문서를 따른다. 명령어·표는 문서에만 두고 스킬 본문에는 중복하지 않는다.
