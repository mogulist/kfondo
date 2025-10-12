# 그란폰도 대회 추가 가이드

FondoScope에 새로운 그란폰도 대회 데이터를 추가하는 방법입니다.

## 필요한 정보

- 대회명 (예: 상주, 디노런)
- 연도
- SPTC EVENT_NO (예: 2025101101)
- 대회 웹사이트 URL (코스 정보 확인용, 선택사항)

## 작업 단계

### 1. 코스 정보 확인

대회 웹사이트에서 다음 정보를 확인합니다:

- 그란폰도: 거리(km), 고도(m)
- 메디오폰도: 거리(km), 고도(m)
- 대회 날짜

### 2. 데이터 크롤링

```bash
bun run crawler sptc {대회명}_2025 {EVENT_NO} 1 9999
```

예시:

```bash
bun run crawler sptc sangju_2025 2025101101 1 9999
```

결과: `/data/preliminary/{대회명}_2025.json` 생성

### 3. Event 이름 정제

크롤링된 데이터의 Event 필드를 정제합니다:

- "그란폰도101.5km" → "그란폰도"
- "메디오폰도61.1km" → "메디오폰도"

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/preliminary/{대회명}_2025.json', 'utf-8'));
const cleaned = data.map(record => ({
  ...record,
  Event: record.Event.replace(/그란폰도\d+.*km/, '그란폰도').replace(/메디오폰도\d+.*km/, '메디오폰도')
}));
fs.writeFileSync('./data/{대회명}_2025.json', JSON.stringify(cleaned, null, 2));
"
```

### 4. events.config.ts 업데이트

`events.config.ts` 파일에 새 이벤트를 추가합니다:

```typescript
{
  id: "{대회id}",
  location: "{대회명}",
  years: [2025],
  color: {
    from: "#색상1",
    to: "#색상2",
  },
  status: "ready",
  meta: {
    title: "{대회명} 그란폰도 통계 | FondoScope",
    description: "{대회명} 그란폰도의 연도별 참가자 통계와 기록 분포를 확인해보세요.",
    image: "/images/{대회id}-og.jpg",
  },
  yearDetails: {
    2025: {
      year: 2025,
      date: "2025.XX.XX",
      courses: [
        {
          id: "granfondo",
          name: "그란폰도",
          distance: XXX,
          elevation: XXXX,
          registered: 0,  // 실제 참가자 수
        },
        {
          id: "mediofondo",
          name: "메디오폰도",
          distance: XX,
          elevation: XXX,
          registered: 0,  // 실제 참가자 수
        },
      ],
      totalRegistered: 0,  // 총 참가자 수
    },
  },
}
```

### 5. 로컬 서버 확인

개발 서버가 실행 중인지 확인하고, 브라우저로 확인합니다:

- 메인 페이지: http://localhost:3000
- 대회 페이지: http://localhost:3000/{대회id}

### 6. sorted-msec 데이터 생성

기록 검색 기능을 위한 데이터를 생성합니다:

```bash
bun run scripts/generate_sorted_msec.ts
```

결과: `/data/sorted-msec/{대회명}_2025.json` 생성

## 체크리스트

- [ ] 코스 정보 확인 (거리, 고도)
- [ ] 데이터 크롤링 완료
- [ ] Event 이름 정제 완료
- [ ] events.config.ts 업데이트
- [ ] 메인 페이지에서 대회 카드 표시 확인
- [ ] 대회 상세 페이지 확인 (차트, 기록 분포)
- [ ] sorted-msec 데이터 생성 완료

## 주의사항

- Event 필드는 반드시 "그란폰도"와 "메디오폰도"로 정제해야 합니다
- events.config.ts의 대회 id는 영문 소문자로 작성합니다
- registered 값은 실제 참가자 수(완주+DNF+DNS 포함)로 설정합니다
- 대회 날짜 형식: "YYYY.M.D" 또는 "YYYY.MM.DD"

## 예시: 상주 그란폰도 2025

```bash
# 1. 크롤링
bun run crawler sptc sangju_2025 2025101101 1 9999

# 2. Event 이름 정제 및 이동
node -e "..."

# 3. events.config.ts 업데이트 (수동)

# 4. sorted-msec 생성
bun run scripts/generate_sorted_msec.ts
```

## AI 어시스턴트에게 요청하기

새 채팅창에서 이렇게 요청하면 됩니다:

```
"디노런 2025 추가해줘.
- EVENT_NO: 2025102501
- 코스 웹사이트: http://speedagency.kr/more2.html?game_code=88"
```

또는 더 짧게:

```
"디노런 2025 추가. EVENT_NO: 2025102501"
```
