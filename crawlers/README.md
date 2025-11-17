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

### Race Result 크롤러

Race Result 플랫폼(`my.raceresult.com`)에서 대회 결과를 수집하는 크롤러입니다. 브라우저 자동화 없이 API를 직접 호출하여 데이터를 수집합니다.

```
bun run crawl:raceresult <event_id> <key> [options]
```

또는

```
bun x tsx crawlers/raceresult_crawler.ts <event_id> <key> [options]
```

- `event_id`: 대회 ID (예: `370186`)
  - Race Result 결과 페이지 URL에서 확인 가능: `https://my.raceresult.com/{event_id}/`
- `key`: 대회 키 (예: `291eb0e2d0d3234a709871c9da0b0fd2`)
  - 결과 페이지 URL의 쿼리 파라미터에서 확인 가능: `https://my.raceresult.com/{event_id}/results?key={key}`
  - 또는 Config API 응답에서 자동으로 가져올 수 있습니다 (key 파라미터 생략 시)
- 옵션
  - `-o, --output`: 결과 저장 경로 (기본값: `data/iksan_2025.json`)

#### 예시 (익산 메디오폰도 2025)

```
bun run crawl:raceresult 370186 291eb0e2d0d3234a709871c9da0b0fd2 -o data/iksan_2025.json
```

#### 동작 방식

1. **Config API 호출**: 대회 설정 정보를 가져옵니다

   - 엔드포인트: `https://my.raceresult.com/{event_id}/RRPublish/data/config?lang=en&page=results&v=1`
   - 응답에서 `server`, `key`, `lists` 정보를 추출합니다

2. **List API 호출**: 각 리스트의 전체 데이터를 가져옵니다

   - 엔드포인트: `https://{server}/{event_id}/RRPublish/data/list?key={key}&listname={listname}&page=results&contest=0&r=leaders&l=9999`
   - `listname`은 Config API에서 받은 `lists[].Name`을 URL 인코딩하여 사용합니다
   - `limit`은 기본값 9999로 설정하여 모든 데이터를 한 번에 가져옵니다

3. **데이터 파싱**: API 응답의 중첩 구조를 파싱합니다

   - 응답 구조: `{ data: { "#1_ContestName": { "#1_CategoryName": [[...], ...] } } }`
   - 각 카테고리별로 데이터를 추출하고, 마지막 요소(총 개수)는 제외합니다
   - 데이터 필드 인덱스:
     - `[0]`: BIB (배번)
     - `[2]`: LASTNAME (성)
     - `[3]`: Group (그룹)
     - `[4]`: Start.TOD (출발 시간)
     - `[5]`: Kom1Start.TOD (KOM1 출발 시간)
     - `[6]`: Kom1Finish.TOD (KOM1 도착 시간)
     - `[7]`: Finish.TOD (도착 시간)
     - `[8]`: Kom1.TOD (KOM1 기록)
     - `[9]`: Finish.SPEED (속도)
     - `[10]`: Finish.CHIP (완주 기록)

4. **데이터 변환**: Race Result 형식을 표준 Record 형식으로 변환합니다

   - 카테고리명에서 성별 추출: `(여)` → `F`, `(남)` → `M`
   - Event는 모든 종목을 "메디오폰도"로 통일 (필요시 수정 가능)
   - Status 판단:
     - 완주 기록이 없고 도착 시간도 없으면 `DNF` (출발 시간이 있으면) 또는 `DNS` (출발 시간도 없으면)
     - 완주 기록이 있으면 빈 문자열

5. **파일 저장**: 기존 파일이 있으면 이어서 수집하고, 중복 배번은 제외합니다

#### 주요 특징

- **API 기반 수집**: 브라우저 자동화 없이 HTTP 요청만으로 데이터 수집
- **자동 재시도**: 네트워크 오류 시 최대 3회 재시도
- **증분 수집**: 기존 파일이 있으면 새 데이터만 추가
- **중복 제거**: 배번 기준으로 중복 레코드 제거
- **에러 처리**: 404 오류(리스트 없음)는 경고만 출력하고 계속 진행

#### event_id와 key 찾는 방법

1. Race Result 결과 페이지에 접속합니다 (예: `https://my.raceresult.com/370186/results`)
2. URL에서 `event_id`를 확인합니다 (`370186`)
3. URL의 쿼리 파라미터에서 `key`를 확인합니다 (`?key=291eb0e2d0d3234a709871c9da0b0fd2`)
4. 또는 브라우저 개발자 도구의 Network 탭에서 Config API 호출을 확인할 수 있습니다

#### 출력 형식

JSON 파일로 저장되며, 각 레코드는 다음과 같은 형식을 가집니다:

```json
{
  "BIB_NO": "3692",
  "Gender": "F",
  "Event": "메디오폰도",
  "Time": "3:59:10",
  "Status": "",
  "StartTime": "08:33:07",
  "FinishTime": "12:32:17",
  "Speed": "24.0km/h",
  "KOM_TIME": "0:11:00"
}
```

- `BIB_NO`: 참가자 배번
- `Gender`: 성별 (`M`: 남성, `F`: 여성)
- `Event`: 참가 종목 (현재는 "메디오폰도"로 통일)
- `Time`: 완주 시간 (미완주 시 빈 문자열)
- `Status`: 상태 (`DNS`: 미출발, `DNF`: 미완주, 완주 시 빈 문자열)
- `StartTime`: 출발 시간 (선택적)
- `FinishTime`: 도착 시간 (선택적)
- `Speed`: 평균 속도 (선택적)
- `KOM_TIME`: KOM1 기록 (선택적)

**참고**: 개인정보 보호를 위해 `Name` 필드는 저장하지 않습니다.

## 요구사항

- bun (Node.js 런타임 포함)
- TypeScript
