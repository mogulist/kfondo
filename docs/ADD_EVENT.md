# 대회 기록 반영 가이드 (크롤링 → 정제 → Blob → DB)

K-Fondo에 **이미 등록된 대회**의 새 연도 기록을 넣거나, 신규 대회를 데이터까지 연결할 때의 절차입니다.

> **중요 (2025년 이후 워크플로)**  
> - **이벤트·에디션·코스 메타데이터의 소스 오브 트루스는 Supabase(어드민)** 입니다.  
> - **`events.config.ts`는 더 이상 운영 데이터의 근거가 아닙니다.** (레거시·참고용일 수 있음)  
> - **원본 기록 JSON**과 **정렬된 기록 JSON**은 **Vercel Blob**에 올리고, 에디션에 **공개 URL**을 붙입니다.

---

## 필요한 정보

- 이벤트 **slug** (`/{slug}` URL, 예: `dinosour`)
- **연도**
- 기록 제공처 종류: **SPTC** / **스마트칩** 등 (통합 크롤러 지원 여부)
- SPTC **EVENT_NO** (예: `2026040401`) — SPCT 사이트의 이벤트 식별자
- (선택) 대회 공식 사이트 URL — 코스·일정 확인용

---

## 작업 순서 개요

1. Supabase 어드민에서 **이벤트 / 에디션 / 코스**가 준비되어 있는지 확인 (또는 먼저 생성).
2. **크롤링** → `data/preliminary/{이름}.json`
3. **Event 필드 정제** → DB 코스 **표시명·종류**와 맞춤 → `data/{slug}_{연도}.json`
4. **`sorted-msec` 생성** → `data/sorted-msec/{slug}_{연도}.json`
5. Blob에 **원본** / **정렬본** 업로드 → 에디션에 URL 반영 (아래 §5)
6. **접수 인원**(`registered_count`)·에디션 **상태** 정리
7. 로컬·프로덕션에서 화면 검증

---

## 1. DB(어드민) 준비

- **이벤트**: slug, 이름, 메타 등
- **에디션(연도)**: 날짜, 상태(`upcoming` / `completed` / `preparing` …), 공식 사이트 URL
- **코스**: `course_type`(예: `granfondo`, `mediofondo`), **코스명**, 거리·고도
- **접수 인원** 필드(`registered_count`)는 **접수(신청) 인원**입니다.  
  홈 **「최근 기록 업데이트」** 카드의 **「참가」** 숫자는 원본 Blob 기록으로 **DNS 제외 인원**을 합산해 표시합니다(접수 합과 다를 수 있음).

**기록으로 찾기·정렬 JSON**: `sorted-msec` 파일의 **키**는 원본 JSON의 `Event` 문자열과 같아야 합니다.  
앱은 URL의 코스 id와 함께 **DB에 저장된 코스명**으로 정렬 데이터 키를 찾는 경로가 있으므로, **DB 코스명과 `Event` 값을 반드시 통일**하는 것이 안전합니다.

---

## 2. 데이터 크롤링 (통합 크롤러)

```bash
bun run crawler <sptc|smartchip> <출력파일베이스명> <EVENT_NO또는식별자> [시작BIB] [끝BIB] [--period ms]
```

- 출력: **`data/preliminary/{출력파이스베이스명}.json`** (예: 베이스명 `dinosour_2026` → `dinosour_2026.json`)
- SPTC 예시 (BIB 1~9999):

```bash
bun run crawler sptc dinosour_2026 2026040401 1 9999
```

- **선택**: 범위를 좁혀 파일럿 후 전체 수집 (예: `3000 3200`).
- 스마트칩 등 다른 타입은 `smartchip`과 해당 `event-id` 규칙을 따릅니다.

---

## 3. Event 필드 정제 및 `data/` 반영

크롤러가 넣는 `Event` 문자열(예: `그란폰도 (96.9km)`)을 **DB에 넣은 코스명**과 동일하게 맞춥니다.  
(참가자 추세·기록 분포·기록으로 찾기가 이 문자열/코스명 매칭에 의존합니다.)

1. `data/preliminary/...json`을 열어 코스별 라벨을 확인합니다.  
2. 치환·스크립트 등으로 정제합니다.  
3. 최종 파일을 **`data/{slug}_{연도}.json`** 으로 저장합니다.  
   - 예: `data/dinosour_2026.json`  
   - `slug`는 DB 이벤트 slug와 동일하게 두는 것이 관례입니다.

> `preliminary`만 두고 `data/`에 복사하지 않으면 다음 단계 스크립트가 읽지 않습니다.

---

## 4. sorted-msec (기록으로 찾기용) 생성

```bash
bun run scripts/generate_sorted_msec.ts
```

- 입력: **`data/` 바로 아래**의 `*.json` (하위 폴더 제외, `sorted-msec` 제외)  
- 출력: **`data/sorted-msec/{slug}_{연도}.json`**  
- **완주자만** (시간 있음, DNF/DNS 제외) 코스별 밀리초 배열을 오름차순으로 넣습니다.

**재생성**: 출력 파일이 이미 있으면 스크립트가 **스킵**합니다. 다시 만들려면 해당 `sorted-msec` 파일을 지운 뒤 다시 실행합니다.

---

## 5. Vercel Blob 업로드 & 에디션 URL

원본·정렬 JSON은 **Vercel Blob**에 올리고, `event_editions`의 `records_blob_url` / `sorted_records_blob_url`에 반영합니다. Blob 객체 경로 접두어는 보통 `records/` · `sorted-records/` 입니다(업로드 시 자동 생성).

### 방법 A — 어드민 UI (권장: 수동 검토)

1. 어드민 **이벤트 상세 → 개최정보**에서 해당 연도 에디션 **수정**을 엽니다.
2. **원본 기록 JSON** / **정렬 기록 JSON** 파일을 선택해 저장합니다.  
   - 내부적으로 `POST /api/admin/event-editions/[editionId]/records-upload`가 Blob에 올린 뒤 에디션 URL을 갱신합니다. (관리자 로그인·`admin_whitelist` 필요)

### 방법 B — CLI (원격·자동화)

`.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`을 두고:

```bash
bun run publish:edition-records -- \
  --slug <이벤트 slug> --year <연도> \
  --records ./data/<slug>_<연도>.json \
  --sorted ./data/sorted-msec/<slug>_<연도>.json \
  --status completed
```

또는 에디션 UUID를 이미 알면 `--edition-id <uuid>` 만으로 지정할 수 있습니다. 상세·주의사항은 [`docs/PLAN_CLI_RECORDS_UPLOAD.md`](PLAN_CLI_RECORDS_UPLOAD.md)를 참고합니다.

| 구분           | Blob 경로 접두(예)         | 에디션 컬럼                |
|----------------|----------------------------|----------------------------|
| 원본 기록      | `records/...json`          | `records_blob_url`         |
| 정렬된 기록    | `sorted-records/...json`   | `sorted_records_blob_url`  |

- **원본**이 있어야 참가자 수 집계·추세 차트 등이 동작합니다. 정렬본만 있으면 일부 기능이 비거나 제한됩니다.
- 서비스 롤 키는 RLS를 우회하므로 **저장소·본인 머신에서만** 사용하고 커밋하지 않습니다.

---

## 6. 에디션·코스 마무리

- 에디션 **상태**: 대회 종료·기록 공개 후 `completed` 등으로 맞추면 홈 분류·문구에도 일관됩니다. (Blob만 있고 상태가 `upcoming`이어도 일부 UI는 보완되어 있으나, 운영상 맞춰 두는 것을 권장합니다.)
- 코스별 **접수 인원**은 실제 접수 집계에 맞게 `registered_count`에 반영합니다.

---

## 7. 검증 체크리스트

- [ ] `data/{slug}_{연도}.json`에 `Event` 값이 **DB 코스명**(또는 매칭 규칙)과 일치
- [ ] `data/sorted-msec/{slug}_{연도}.json` 생성·갱신 완료
- [ ] Blob **원본**·**정렬본** 업로드 및 에디션 URL 저장
- [ ] 홈 **최근 기록 업데이트** / **다가오는 대회** 구분이 기대와 같음
- [ ] 대회 상세: **연도별 참가자 추세**, **기록 분포**, **기록으로 찾기** (코스별)

---

## 로컬 개발 팁

- 원본을 Blob에 안 올린 상태에서는 `lib/participants.ts`가 **`data/{slug}_{연도}.json` 로컬 파일**로 폴백할 수 있습니다(서버 환경).  
- 프로덕션은 Blob URL이 기준입니다.

---

## AI/에이전트에 시킬 때 예시

새 채팅에서 절차를 맞추려면 이 파일을 함께 참조합니다.

```text
@docs/ADD_EVENT.md 기준으로 {대회명} {연도} 기록 반영해줘.
- slug: ...
- SPTC EVENT_NO: ...
- DB 코스명: 그란폰도 표기는 ...
```

---

## 문서만 쓸지, 스킬·룰을 둘지

| 방식 | 용도 |
|------|------|
| **이 문서(`ADD_EVENT.md`)** | 단일 진실 공급원. 절차·용어·주의사항을 여기만 유지하면 됩니다. |
| **Cursor Rule (짧게)** | 예: 「기록 반영·신규 대회 데이터 작업 시 `docs/ADD_EVENT.md`를 따른다」한 줄 — 에이전트가 문서를 먼저 읽게 유도. |
| **Skill** | 4월처럼 **같은 패턴이 매우 잦을 때**, 스킬 본문에 체크리스트만 두고 **상세는 이 문서 링크**로 위임하면 중복 관리가 줄어듭니다. |
| **자동화 스크립트** | `bun run publish:edition-records` — Blob 업로드 및 에디션 URL·(선택) 상태 갱신(§5 방법 B). 시크릿은 `.env.local`에만 둡니다. |

**권장**: 지금은 **문서를 최신으로 유지**하고, 반복이 확실해지면 **짧은 Cursor rule로 이 문서를 가리키기**만 해도 충분한 경우가 많습니다. 스킬은 문서와 내용이 겹치면 **양쪽을 같이 고쳐야** 하므로, 스킬을 만들더라도 **상세 절차는 이 MD에만** 두는 편이 안전합니다.
