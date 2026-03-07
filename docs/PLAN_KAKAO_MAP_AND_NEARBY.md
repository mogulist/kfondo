# 카카오맵 추가 및 경로 주변 탐색 기능 플랜

- **전제**: 네이버맵은 그대로 유지. 카카오맵 **버튼**과 **전용 페이지**를 추가한 뒤, 네이버맵에 구현된 기능을 카카오맵에 포팅하고, 이어서 경로 주변 보급소·숙소 탐색 기능을 구현한다.
- **단위**: 5~10개 Phase로 나누고, 각 Phase는 테스트 가능한 작은 feature 단위로 진행한다.

---

## 현재 네이버맵에 구현된 기능 (포팅 대상)

| 기능 | 구현 위치 | 설명 |
|------|-----------|------|
| 지도 표시 | `NaverMap.tsx` | NCP 스크립트 로드, 기본 center/zoom, 로딩 UI |
| 경로 폴리라인 | `NaverMap.tsx` | `polylines` prop `[lat,lng][]` → Polyline 그리기 (색상/두께) |
| fitBounds | `NaverMap.tsx` | 경로가 있으면 전체가 보이도록 bounds + padding 적용 |
| 하이라이트 마커 | `NaverMap.tsx` | `highlightPosition` → 원형 마커 표시 |
| 컨트롤 버튼 | `NaverMap.tsx` | 줌 인/아웃, 마커로 이동, 전체 코스 보기 |
| 리사이즈 대응 | `NaverMap.tsx` | ResizeObserver로 지도 영역 변경 시 autoResize |
| GPX 로드 | `CourseMapClient.tsx` | `gpxBlobUrl` → fetch → 파싱 → `routePoints` |
| 고도 프로필 + 슬라이더 | `CourseMapClient.tsx` | ElevationProfile, 슬라이더로 구간 선택 → `highlightedIndex` → `highlightPosition` |
| 페이지 레이아웃 | `CourseMapPageClient.tsx` | 헤더, 제목, 풀스크린 토글, 지도+고도 영역 |

---

## Phase 개요

| Phase | 목표 | 테스트 포인트 |
|-------|------|----------------|
| 1 | 카카오맵 버튼 + 카카오맵 전용 페이지 (플레이스홀더) | 버튼 노출, 클릭 시 새 탭에서 카카오맵 페이지 열림 |
| 2 | KakaoMap 컴포넌트 – 스크립트 로드 + 빈 지도 | 카카오맵 페이지에서 빈 지도만 표시 |
| 3 | KakaoMap – 폴리라인 그리기 | 경로 선이 지도에 표시됨 |
| 4 | KakaoMap – fitBounds | 열면 전체 경로가 화면에 맞게 보임 |
| 5 | KakaoMap – 하이라이트 마커 + ElevationProfile/슬라이더 연동 | 고도 그래프·슬라이더 조작 시 지도 마커 이동 |
| 6 | KakaoMap – 컨트롤 버튼 (줌, 마커로 이동, 전체 코스) | 각 버튼 동작 확인 |
| 7 | KakaoMap – 리사이즈 대응 | 창 크기 변경 시 지도 비율 유지 |
| 8 | 경로 주변 보급소·숙소 검색 (카카오 Local API) | 경로 구간별 편의점/숙박 검색 결과 조회 |
| 9 | 보급소·숙소 지도 표시 | 검색 결과를 지도 마커 또는 목록으로 표시 |

---

## Phase 1: 카카오맵 버튼 + 카카오맵 전용 페이지 (플레이스홀더)

**목표**: 네이버맵과 병행해 “카카오맵” 진입점을 추가. 네이버맵 코드는 수정하지 않음.

**작업**

- **UpcomingSection** (`app/[event]/components/UpcomingSection.tsx`)
  - 코스 카드에 “카카오맵” 버튼 추가. 네이버맵 버튼과 동일 조건: `gpxBlobUrl` 있을 때만 활성화, 없으면 비활성화.
  - 활성화 시 링크: `/${eventSlug}/map-kakao/${course.id}?year=${year}` (새 탭).
  - 스타일: 카카오 브랜드 색(예: 노란색 계열)으로 네이버맵 버튼과 구분되게.
- **라우트** `app/[event]/map-kakao/[courseId]/page.tsx`
  - `app/[event]/map/[courseId]/page.tsx`와 동일한 데이터 조회: event, course, `gpxBlobUrl` 없으면 notFound.
- **클라이언트** `app/[event]/map-kakao/[courseId]/CourseMapKakaoPageClient.tsx`
  - `CourseMapPageClient`와 같은 레이아웃(헤더, 뒤로가기, 제목, 풀스크린 토글).
  - 지도 영역에는 “카카오맵 (준비 중)” 또는 간단한 플레이스홀더 div만 표시. (실제 지도 컴포넌트는 Phase 2에서 연결.)

**테스트**

- 이벤트 상세 → 코스에 GPX 있는 코스에서 “카카오맵” 버튼이 보이고, 클릭 시 새 탭에서 `/{event}/map-kakao/{courseId}?year=...` 페이지가 열림.
- GPX 없는 코스에서는 카카오맵 버튼이 비활성화(회색, 클릭 불가).

---

## Phase 2: KakaoMap 컴포넌트 – 스크립트 로드 + 빈 지도

**목표**: 카카오 지도 JS API를 로드하고, 빈 지도만 표시하는 `KakaoMap` 컴포넌트를 만든 뒤, 카카오맵 페이지에 연결.

**작업**

- **타입** `types/kakao-maps.d.ts`
  - `window.kakao?.maps`, Map 인스턴스, LatLng 등 필요한 타입 선언 (카카오 JS API 문서 참고).
- **컴포넌트** `components/KakaoMap.tsx`
  - props: `width`, `height` (기본 100%).
  - 스크립트: `https://dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false` 로드 후 `kakao.maps.load()` 호출. appkey는 `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` 사용.
  - 지도 생성: 기본 center(예: 35.9, 128.0), zoom level.
  - 로딩 중: “지도를 로딩 중...” 등 플레이스홀더 표시.
- **CourseMapKakaoPageClient**
  - 지도 영역에 `<KakaoMap width="100%" height="100%" />` 렌더. GPX는 아직 사용하지 않아도 됨(또는 fetch만 하고 지도에는 미전달).

**테스트**

- 카카오맵 페이지에서 빈 지도가 로드되고, 줌/드래그 등 기본 동작이 되는지 확인.

---

## Phase 3: KakaoMap – 폴리라인 그리기

**목표**: 네이버맵과 동일한 데이터 형식(`polylines: [number, number][][]`)으로 경로 선을 카카오 지도에 그리기.

**작업**

- **KakaoMap**
  - prop `polylines?: [number, number][][]` 추가.
  - `polylines`가 바뀔 때 기존 Polyline 제거 후, 각 path에 대해 `kakao.maps.Polyline` 생성해 지도에 표시. 색상/두께는 네이버맵과 비슷하게(예: rose 계열, strokeWeight 4).
- **CourseMapKakaoPageClient**
  - GPX fetch → `routePoints` → `polylines` 생성 후 `KakaoMap`에 전달. (이때 `CourseMapClient`와 동일한 `fetchGpxAsPointsWithDistance` 사용 가능.)

**테스트**

- 카카오맵 페이지에서 해당 코스 경로가 선으로 표시됨.

---

## Phase 4: KakaoMap – fitBounds

**목표**: 경로가 로드되면 전체 경로가 보이도록 지도 bounds와 padding 적용.

**작업**

- **KakaoMap**
  - `polylines` 변경 시 min/max lat/lng 계산 → `LatLngBounds` 생성 → `map.setBounds(bounds, padding)` (또는 카카오 API에 맞는 메서드) 호출.
  - padding 값은 네이버맵과 유사하게(예: 24px).

**테스트**

- 페이지 진입 시 전체 코스가 한 화면에 맞게 보임.

---

## Phase 5: KakaoMap – 하이라이트 마커 + ElevationProfile/슬라이더 연동

**목표**: 고도 그래프에서 선택한 구간 위치를 지도 위 원형 마커로 표시. 네이버맵의 `highlightPosition` 동작과 동일.

**작업**

- **KakaoMap**
  - prop `highlightPosition?: [number, number] | null` 추가.
  - 해당 좌표에 커스텀 원형 마커(이미지 또는 DOM 오버레이) 표시. 없으면 마커 제거.
- **CourseMapKakaoPageClient**
  - `CourseMapClient`와 동일하게: `routePoints`, `highlightedIndex` state, `ElevationProfile`, 슬라이더 유지.
  - `highlightedIndex` → `highlightPosition` 계산해 `KakaoMap`에 전달.
  - ElevationProfile 클릭/슬라이더 드래그 시 `setHighlightedIndex` 호출.

**테스트**

- 고도 그래프 또는 슬라이더를 움직이면 지도 위 마커가 해당 위치로 이동함.

---

## Phase 6: KakaoMap – 컨트롤 버튼 (줌, 마커로 이동, 전체 코스)

**목표**: 네이버맵과 동일한 UX – 줌 인/아웃, “마커로 이동”, “전체 코스 보기” 버튼.

**작업**

- **KakaoMap**
  - 우측 상단에 버튼 그룹 추가:
    - 줌 인: `map.setLevel(level - 1)` (또는 해당 API).
    - 줌 아웃: `map.setLevel(level + 1)`.
    - 마커로 이동: `highlightPosition`이 있을 때 해당 좌표로 `setCenter`.
    - 전체 코스 보기: `polylines`가 있을 때 fitBounds 다시 적용.
  - `highlightPosition` 없을 때 “마커로 이동” 비활성화, `polylines` 없을 때 “전체 코스 보기” 비활성화.

**테스트**

- 각 버튼 클릭 시 기대한 대로 줌/센터/전체 보기가 동작함.

---

## Phase 7: KakaoMap – 리사이즈 대응

**목표**: 지도 컨테이너 크기가 바뀔 때(풀스크린 토글, 창 리사이즈 등) 지도가 깨지지 않고 맞게 그려지도록 처리.

**작업**

- **KakaoMap**
  - ResizeObserver로 지도 div 관찰. 크기 변경 시 카카오 API의 `map.relayout()` 또는 동일 역할 메서드 호출.
  - 필요 시 현재 zoom/center 유지 후 relayout.

**테스트**

- 풀스크린 토글, 브라우저 창 크기 변경 시 지도가 정상적으로 리플로우됨.

---

## Phase 8: 경로 주변 보급소·숙소 검색 (카카오 Local API)

**목표**: 경로를 일정 간격으로 샘플링한 점들에 대해 카카오 Local API “카테고리 검색”을 호출해, 편의점(CS2)·숙박(AD5) 목록을 수집한다. (참고: 지도 API 선택 근거는 `docs/WHY_KAKAO_MAP.md`, 비용/쿼터는 map-provider-evaluation 플랜 참고)

**작업**

- **경로 샘플링**
  - `routePoints`를 거리 또는 개수 기준으로 샘플링(예: 5km 간격 또는 최대 20점). 각 점의 `lat, lng` 사용.
- **API 호출**
  - 카카오 Local API `GET /v2/local/search/category.json`: `category_group_code=CS2`(편의점), `AD5`(숙박), `x`, `y`, `radius`(예: 1000m), `sort=distance`.
  - 호출은 서버 액션 또는 API 라우트에서 수행(API 키 노출 방지). 또는 클라이언트에서 REST API 키(카카오는 JavaScript 키로 제한 가능) 사용 시 환경 변수로만 관리.
- **결과 처리**
  - 여러 샘플 점에서 나온 결과를 place id 기준으로 중복 제거.
  - 응답 타입 정의: place_name, address, x, y, category_group_code 등.

**테스트**

- 특정 코스 선택 후 “보급소/숙소 찾기” 같은 트리거(Phase 9에서 버튼/탭으로 노출 가능)로 검색 실행 시, 편의점·숙박 목록이 반환되는지 확인. (Phase 8에서는 UI는 최소화하고 콘솔/임시 목록만 보여도 됨.)

---

## Phase 9: 보급소·숙소 지도 표시

**목표**: Phase 8에서 수집한 보급소·숙소를 지도 위에 마커로 표시하고, 필요 시 목록(사이드 패널 또는 하단)으로도 제공.

**작업**

- **KakaoMap**
  - prop `pois?: Array<{ id: string; name: string; x: number; y: number; category: string }>` (또는 유사 타입) 추가.
  - 각 POI에 마커 표시. 카테고리별 아이콘/색 구분(편의점/숙박).
  - 마커 클릭 시 간단한 인포윈도우(이름, 주소) 또는 툴팁.
- **CourseMapKakaoPageClient**
  - “경로 주변 보급소·숙소” 버튼 또는 탭 추가. 클릭 시 Phase 8 검색 실행 → 결과를 state에 저장 → `KakaoMap`에 `pois` 전달.
  - (선택) 결과 목록을 접이식 패널로 표시, 클릭 시 해당 마커로 지도 이동.

**테스트**

- 버튼 클릭 후 경로 주변 편의점·숙박이 지도에 마커로 나타나고, 목록/인포윈도우가 기대대로 동작함.

---

## 파일 변경 요약

| Phase | 대상 | 변경 내용 |
|-------|------|-----------|
| 1 | UpcomingSection.tsx | 카카오맵 버튼 추가, mapKakaoHref |
| 1 | app/[event]/map-kakao/[courseId]/page.tsx | 신규 (데이터 조회, notFound) |
| 1 | CourseMapKakaoPageClient.tsx | 신규 (플레이스홀더만) |
| 2 | types/kakao-maps.d.ts | 신규 |
| 2 | components/KakaoMap.tsx | 신규 (스크립트 + 빈 지도) |
| 2 | CourseMapKakaoPageClient | KakaoMap 사용, env NEXT_PUBLIC_KAKAO_MAP_APP_KEY |
| 3 | KakaoMap.tsx | polylines prop, Polyline 그리기 |
| 3 | CourseMapKakaoPageClient | GPX fetch → polylines 전달 |
| 4 | KakaoMap.tsx | fitBounds 로직 |
| 5 | KakaoMap.tsx | highlightPosition, 마커 |
| 5 | CourseMapKakaoPageClient | routePoints, ElevationProfile, 슬라이더, highlightPosition |
| 6 | KakaoMap.tsx | 줌/마커로 이동/전체 코스 버튼 |
| 7 | KakaoMap.tsx | ResizeObserver, relayout |
| 8 | lib/kakao-local.ts 또는 API route | 경로 샘플링, 카테고리 검색 호출, 중복 제거 |
| 9 | KakaoMap.tsx | pois prop, 마커/인포윈도우 |
| 9 | CourseMapKakaoPageClient | 검색 트리거, pois state, 목록/패널 (선택) |

---

## 환경 변수

- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`: 카카오 지도 JS API 앱 키 (지도 표시용).
- 카카오 Local API(장소 검색)는 REST API 키 사용. 서버에서 호출 시 별도 키를 env에 두고 API route/서버 액션에서만 사용 권장.

---

## 참고

- [WHY_KAKAO_MAP.md](./WHY_KAKAO_MAP.md) – 네이버맵 대신 카카오맵을 쓰는 이유.
- map-provider-evaluation 플랜 – 카카오 Local API 쿼터/비용, 경로 주변 탐색 설계.
