# mm-phonics

모바일 파닉스 튜터 미미. Long a / Magic e 첫 단원, 단어 카드, 녹음, 퀴즈, 교재 숙제를 제공합니다.

## 로컬 실행 — Vercel 버전

Node.js 22.13 이상을 사용하세요.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

http://localhost:3000 에서 이름만 입력하면 시작합니다. 이름과 진도는 현재 브라우저의 HttpOnly 쿠키에 저장됩니다. 다른 브라우저/기기로 동기화되지 않으며, 쿠키를 삭제하면 초기화됩니다.

`.env.local`에 ElevenLabs 키를 입력해야 학생 이름을 포함한 개인화 음성이 동작합니다. 기본 단어 음성은 미리 생성된 파일을 사용합니다. 키는 서버에서만 읽으며 저장소에 포함하지 않습니다.

```sh
npm run build
npm start
```

## Vercel 배포

1. Vercel에서 `mayiaijade-pixel/mm-phonics` GitHub 저장소를 Import합니다.
2. Framework: Next.js, Root Directory: `./`, Production Branch: `main`.
3. 서버 환경변수를 Production과 Preview에 설정합니다.
   - `ELEVENLABS_API_KEY`: 기존 ElevenLabs API 키
   - `ELEVENLABS_VOICE_ID`: `BlgEcC0TfWpBak7FmvHW`
4. Deploy합니다. Git 연동 후 main에 push하면 Vercel이 자동 재배포합니다.

`vercel.json`에 build/dev/install 명령이 설정되어 있습니다. 별도 데이터베이스나 GPT 로그인은 필요하지 않습니다. 음성 API는 같은 출처 요청과 익명 세션 쿠키를 확인하며, 인스턴스 단위 생성 제한/캐시가 있습니다. 서비스 이용량이 커지면 공유 저장소 기반의 음성 캐시/요청 제한을 추가할 수 있습니다.

## 기존 ChatGPT Sites 버전

공개 주소: https://mimi-magic-e-jenny.aiplane-jade.chatgpt.site/

같은 UI/이미지/음성 파일을 사용합니다. Sites에서는 ChatGPT 로그인과 계정별 D1 진도 저장을 유지합니다.

```sh
npm run dev:sites
npm run build:sites
```

로컬 Sites 테스트: http://127.0.0.1:5173

- `platform/sites/`: ChatGPT 인증, D1 저장, Cloudflare 음성 API
- `platform/vercel/`: 이름만 입력하는 브라우저 저장과 Node.js 음성 API
- `next.config.ts`: Vercel의 플랫폼 모듈 선택
- `vite.config.ts`: Sites의 플랫폼 모듈 선택
- `.openai/hosting.json`: 기존 Sites 프로젝트 연결 정보

Sites 배포는 Codex의 Sites 도구에서 기존 프로젝트에 소스를 저장하고 배포합니다. GitHub push만으로 Sites가 배포되지는 않습니다. Codex에 수정 요청할 때 Vercel/GitHub와 기존 Sites 두 곳의 배포를 함께 요청하면 동일한 소스를 반영할 수 있습니다. Sites 공개 범위와 기존 계정 진도를 유지하세요.

## 검증

```sh
npx tsc --noEmit
npm run build
npm run build:sites
```

환경변수 파일, API 키, 로컬 DB, 생성된 빌드 폴더는 `.gitignore`로 제외합니다.

## 녹음 피드백

Say it으로 녹음하고 Stop을 누른 뒤 Review를 누르면 녹음이 ElevenLabs Scribe v2에 전송됩니다. 목표 단어와 인식 결과를 비교하여 칭찬/연습 팁/다시 녹음을 제공합니다. 음소별 발음 정확도 채점은 아닙니다. 녹음을 이 앱의 DB에 저장하지 않으며, 외부 처리에는 ElevenLabs의 데이터 정책이 적용됩니다. 기존 ELEVENLABS_API_KEY에 Speech to Text 권한이 필요합니다. 요청당 2MB, 10분당 30건의 인스턴스 단위 제한을 적용합니다.
