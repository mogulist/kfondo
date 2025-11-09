# Granfondo Crawler

이 프로젝트는 그란폰도 대회의 참가자 기록을 크롤링하는 도구입니다.

## 설치

```bash
bun install
```

## 사용 방법

### CSV 크롤러 (sptc-crawler.ts)

```bash
# 기본 사용법
bun run sptc-crawler.ts <location> <year> <start_bib> <end_bib>
```

#### 예시

```bash
# 2025년 홍천 그란폰도 1~9999번 크롤링
bun run sptc-crawler.ts 홍천 2025 1 9999

# 2023년 홍천 그란폰도 8000~8100번 크롤링
bun run sptc-crawler.ts 홍천 2023 8000 8100
```

결과는 `results_홍천_2025.csv`와 같은 형식의 파일명으로 저장됩니다.

### SPTC JSON 크롤러 (sptc-json-crawler.ts)

```bash
# 기본 사용법
bun run sptc-json-crawler.ts <location>

# 특정 연도만 크롤링
bun run sptc-json-crawler.ts <location> <year>

# 특정 BIB 번호 범위로 크롤링
bun run sptc-json-crawler.ts <location> <year> <start_bib> <end_bib>
```

#### 예시

```bash
# 설악 그란폰도 모든 연도 크롤링
bun run sptc-json-crawler.ts 설악

# 설악 그란폰도 2024년도만 크롤링
bun run sptc-json-crawler.ts 설악 2024

# 설악 그란폰도 2024년도 BIB 1번부터 2000번까지 크롤링
bun run sptc-json-crawler.ts 설악 2024 1 2000
```

#### 지원하는 대회 장소

- 설악
- 영산강
- 양양
- 홍천

#### 출력 형식

##### CSV 형식 (sptc-crawler.ts)

결과는 CSV 파일로 저장되며, 각 레코드는 다음과 같은 컬럼을 가집니다:

- BIB_NO: 참가자 번호
- Gender: 성별 (M: 남성, F: 여성)
- Event: 참가 종목 (그란폰도, 메디오폰도)
- Time: 완주 시간 (미완주 시 빈 문자열)
- Status: 상태 (DNS: 미출발, DNF: 미완주, 완주 시 빈 문자열)

##### JSON 형식 (sptc-json-crawler.ts)

크롤링 결과는 JSON 파일로 저장되며, 각 레코드는 다음과 같은 형식을 가집니다:

```json
{
  "BIB_NO": 123,
  "Gender": "M",
  "Event": "그란폰도",
  "Time": "03:45:12",
  "Status": ""
}
```

- `BIB_NO`: 참가자 번호
- `Gender`: 성별 (M: 남성, F: 여성)
- `Event`: 참가 종목 (그란폰도, 메디오폰도)
- `Time`: 완주 시간 (미완주 시 빈 문자열)
- `Status`: 상태 (DNS: 미출발, DNF: 미완주, 완주 시 빈 문자열)

### SmartChip 크롤러

```
bun run crawlers/smartchip-crawler.ts <event_name> <event_id> <start_bib_number> <ending_bib_number>

```

데이터는 data/<event_name>.json 으로 생성됨
event_id 는 해당대회의 URL에서 useData 쿼리 파람의 값

예)

```
bun run crawlers/smartchip-crawler.ts yangpyeong_2025 202550000156 1 999

```

### Marazone 크롤러

```
bun run crawlers/marazone_crawler.ts <location> <year> <start_bib> <end_bib> [options]
```

- `location`: 대회명에서 `그란폰도`를 제외한 문구 (예: `2025 스캇통영`)
- `year`: 연도 (예: `2025`)
- `start_bib`, `end_bib`: 시작/종료 Bib (예: `A000`, `C9999`). 알파벳별로 자릿수가 달라도 한 번에 처리됩니다.
- 옵션
  - `-p, --period`: 호출 주기(ms), 기본값 200
  - `-o, --output`: 결과 저장 경로 (기본값: `crawlers/<location>_<year>.json`)

#### 예시 (통영 그란폰도 2025)

```
# 전체 Bib (A000~C9999) 수집, 결과는 data/tongyeong_2025.json 으로 저장
bun run crawlers/marazone_crawler.ts "2025 스캇통영" 2025 A000 C9999 --output data/tongyeong_2025.json
```

- 기존에 동일 파일이 있으면 이어서 수집합니다.
- `A` 그룹은 3자리, `B/C` 그룹은 4자리 Bib을 사용합니다.

## 요구사항

- bun (Node.js 런타임 포함)
- TypeScript
