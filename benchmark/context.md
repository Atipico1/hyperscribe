# Hyperscribe Context

## 한 줄 요약

이 레포는 "LLM이 semantic JSON envelope를 만들고, Node renderer가 self-contained HTML로 바꿔 주는" 구조다.

핵심 소스는 `plugins/hyperscribe`다.

루트 `skills/hyperscribe*`는 여러 에이전트용 배포 형태로 복제된 미러라고 보면 된다.

## 시스템 구조 한눈에 보기

```text
user prompt
  -> plugin command / SKILL.md
  -> LLM emits Hyperscribe envelope JSON
  -> plugins/hyperscribe/scripts/render.mjs
      -> lib/schema.mjs   (JSON schema validation)
      -> lib/tree.mjs     (component tree walk)
      -> components/*.mjs (SSR HTML string render)
      -> lib/theme.mjs    (theme CSS load)
      -> assets/*.css/js  (base + per-component CSS, interaction JS)
  -> single HTML file + sibling JSON file
  -> browser open / optional Vercel share
```

## 디렉터리 역할

### 1. 실제 제품 소스

- `plugins/hyperscribe`
  - 실제 플러그인 패키지.
  - renderer, catalog, assets, command docs, share script가 다 여기 있다.
  - 이 레포를 이해할 때 가장 먼저 봐야 하는 곳.

### 2. 에이전트 스킬 배포본

- `skills/hyperscribe`
- `skills/hyperscribe-slides`
- `skills/hyperscribe-diff`
- `skills/hyperscribe-share`

설명:

- `skills/hyperscribe`는 `plugins/hyperscribe`의 거의 미러다.
- 차이는 주로 래핑 구조다.
  - `plugins/hyperscribe` 안에는 `.claude-plugin`, `commands/`, `skills/`가 있다.
  - 루트 `skills/hyperscribe` 쪽은 바로 `SKILL.md`를 둔 agent-skill 배포 형태다.
- 즉, "제품 소스"와 "설치용 복제본"이 같이 있는 레포다.

### 3. 테스트

- `tests/components`
  - 컴포넌트별 렌더 테스트.
  - 현재 컴포넌트 파일 수와 같은 27개 테스트 파일이 있다.
- `tests/lib`
  - theme, preference 같은 유틸 테스트.
- `tests/*.test.mjs`
  - schema, render, golden snapshot, html helper 같은 횡단 테스트.
- `tests/fixtures`, `tests/golden`
  - 입력 JSON fixture와 기대 HTML snapshot.

### 4. 문서/내부 작업물

- `README.md`
  - 외부 사용자용 설명서.
- `docs/plans`, `docs/superpowers/*`
  - 구현 계획, 스펙 메모.
  - 제품 런타임과 직접 연결되지는 않는다.

### 5. 보조 스크립트

- `tools/build-catalog-md.mjs`
  - `spec/catalog.json`을 읽어 `references/catalog.md`를 다시 만든다.
  - catalog JSON이 사실상 single source of truth다.

## 핵심 파일 지도

- `plugins/hyperscribe/scripts/render.mjs`
  - 메인 엔트리.
  - registry 구성, schema validation, theme load, component CSS 조합, 최종 HTML 생성까지 담당.

- `plugins/hyperscribe/spec/catalog.json`
  - envelope 규약과 각 컴포넌트 prop schema의 기준점.
  - validator와 reference doc가 모두 여기 의존한다.

- `plugins/hyperscribe/scripts/lib/schema.mjs`
  - catalog 기반 validation.
  - 에러를 `path + message` 형식으로 모아 준다.

- `plugins/hyperscribe/scripts/lib/tree.mjs`
  - component tree walker.
  - registry에 등록된 컴포넌트 함수를 재귀 호출한다.

- `plugins/hyperscribe/scripts/components/*.mjs`
  - 각 컴포넌트의 SSR renderer.
  - 대부분 "props -> HTML string"인 얇은 함수다.

- `plugins/hyperscribe/assets/base.css`
  - 공통 디자인 시스템.

- `plugins/hyperscribe/assets/components/*.css`
  - 컴포넌트별 CSS.
  - render 시 실제로 사용된 컴포넌트 CSS만 합쳐 넣는다.

- `plugins/hyperscribe/scripts/lib/theme.mjs`
  - theme CSS 파일 로드와 light/dark toggle markup 생성.

- `plugins/hyperscribe/scripts/lib/preference.mjs`
  - `~/.hyperscribe/preference.md` 또는 `./.hyperscribe/preference.md` 처리.

- `plugins/hyperscribe/scripts/share.sh`
  - 완성된 HTML을 Vercel에 올려 public URL을 만든다.

## 렌더링 파이프라인

### 1. 입력 계약

입력은 HTML이 아니다.

입력은 아래 성격의 JSON envelope다.

- `a2ui_version`
- `catalog`
- `parts`
- root component

일반 모드는 root가 `hyperscribe/Page`다.

슬라이드 모드는 `hyperscribe/SlideDeck`를 쓴다.

### 2. 검증

`render.mjs`는 시작하자마자 `schema.mjs`로 envelope를 검증한다.

여기서 잡는 것:

- 필수 envelope field 누락
- 알 수 없는 component 이름
- prop 누락
- prop 타입 오류
- enum 위반
- pattern 위반
- root component 오류

즉, 브라우저에서 깨진 결과를 보기 전에 계약 위반을 먼저 차단한다.

### 3. 트리 렌더

검증이 통과하면 `tree.mjs`가 node를 순회한다.

각 node는 registry에 등록된 renderer 함수로 매핑된다.

패턴은 단순하다.

- container 컴포넌트: `renderChildren()` 호출
- leaf 컴포넌트: 자기 HTML만 반환
- 특수 케이스: `Dashboard`는 `children` 대신 `props.panels[].child`를 직접 다시 렌더링한다

### 4. HTML 조립

최종 HTML은 아래를 합쳐 만든다.

- theme CSS
- base CSS
- 실제 사용된 컴포넌트 CSS만 선별한 CSS
- body HTML
- mode toggle markup
- `assets/interactive.js`

산출물은:

- `<out>.html`
- 같은 경로의 `<out>.json`

즉, 렌더 결과와 입력 envelope를 나란히 남긴다.

## 컴포넌트 구조

현재 제품 소스 기준으로 컴포넌트 renderer는 27개다.

대략 이렇게 묶인다.

```text
Structure:    Page, Section, Heading, Prose, FileTree, FileCard
Media:        Image
Emphasis:     Callout, KPICard
Code:         CodeBlock, CodeDiff, AnnotatedCode
Diagrams:     Mermaid, Sequence, ArchitectureGrid, FlowChart, DependencyGraph, ERDDiagram
Data:         DataTable, Chart, PrettyChart, Comparison
Narrative:    Timeline, StepList
Dashboard:    Dashboard
Slides:       SlideDeck, Slide
```

구조적으로는 React 같은 상태 관리 계층이 없다.

각 컴포넌트는 거의 모두 "순수 문자열 렌더 함수"에 가깝다.

그래서 코드베이스는 프론트엔드 앱이라기보다 "SSR 전용 HTML generator"에 더 가깝다.

## 커맨드/스킬 구조

사용자 진입점은 4개 모드로 나뉜다.

- general: `hyperscribe`
- slides: `hyperscribe:slides`
- diff: `hyperscribe:diff`
- share: `hyperscribe:share`

각 모드는 결국 같은 renderer를 향한다.

차이는 LLM에게 어떤 envelope를 만들게 할지에 있다.

- 일반 문서: `Page`
- 슬라이드: `SlideDeck`
- diff 리뷰: `Page + ArchitectureGrid + CodeDiff + Callout`
- share: 이미 만든 HTML 재배포

즉, 이 레포의 "지능"은 스킬/커맨드 프롬프트 쪽에 있고, "결정론적 실행"은 renderer 쪽에 있다.

## 테스트 전략

테스트는 생각보다 균형이 좋다.

### 커버하는 축

- schema validator 계약 테스트
- theme/mode 동작 테스트
- tree walker 테스트
- HTML escaping helper 테스트
- preference parser 테스트
- 컴포넌트 단위 렌더 테스트
- fixture -> golden HTML snapshot 테스트

### 읽는 순서 추천

처음 이해할 때는 이 순서가 제일 빠르다.

1. `tests/schema.test.mjs`
2. `tests/tree.test.mjs`
3. `tests/render.test.mjs`
4. 관심 있는 `tests/components/*.test.mjs`

테스트가 코드 의도를 가장 압축해서 보여 준다.

## 이 레포를 이해할 때 중요한 포인트

### 1. source of truth가 한 군데가 아니다

실제 런타임 기준 source of truth는 `plugins/hyperscribe`다.

하지만 배포를 위해 루트 `skills/hyperscribe*`에도 거의 같은 파일이 있다.

그래서 변경 시 "어느 쪽을 기준으로 유지할지"를 항상 의식해야 한다.

### 2. catalog 중심 설계다

컴포넌트를 추가할 때는 보통 이 순서다.

```text
spec/catalog.json
  -> scripts/components/<name>.mjs
  -> assets/components/<name>.css
  -> tests/components/<name>.test.mjs
  -> references/catalog.md 재생성
```

즉, catalog가 API 계약이고 나머지는 그 구현체다.

### 3. "완전 오프라인"은 컴포넌트에 따라 다르다

README는 self-contained/offline를 강하게 말한다.

하지만 코드상:

- `Mermaid`는 jsDelivr CDN에서 Mermaid를 로드한다.
- `Chart`도 jsDelivr CDN에서 Chart.js를 로드한다.
- `Image`는 로컬 파일이면 base64 inline으로 묶어 truly self-contained에 가깝다.

즉, HTML 파일 자체는 self-contained에 가깝지만, 일부 시각화는 런타임 네트워크 의존성이 남아 있다.

### 4. renderer는 의도적으로 단순하다

build step도 없고 의존성도 거의 없다.

Node 20 + `node --test`만으로 끝나는 구조다.

장점:

- 유지보수 단순
- 배포 단순
- 디버깅 단순

대신:

- 풍부한 클라이언트 상태 관리나 레이아웃 엔진은 없다
- layout intelligence는 대부분 LLM prompt와 component schema로 해결한다

## 추천 읽기 순서

새로 들어온 사람이면 이 순서가 가장 빠르다.

1. `README.md`
2. `plugins/hyperscribe/scripts/render.mjs`
3. `plugins/hyperscribe/spec/catalog.json`
4. `plugins/hyperscribe/scripts/lib/schema.mjs`
5. `plugins/hyperscribe/scripts/lib/tree.mjs`
6. `plugins/hyperscribe/scripts/components/page.mjs`
7. 관심 컴포넌트 2~3개
8. `tests/schema.test.mjs`
9. `tests/render.test.mjs`

## 짧은 결론

Hyperscribe는 "프롬프트가 구조를 정하고, renderer가 일관된 HTML을 찍는" catalog-driven renderer다.

이 레포를 볼 때는 웹앱으로 보기보다:

- JSON schema 기반 UI DSL
- 그 DSL의 renderer
- 그 renderer를 호출하게 만드는 agent skill/prompt 세트

이 세 층으로 나눠 보면 가장 잘 이해된다.
