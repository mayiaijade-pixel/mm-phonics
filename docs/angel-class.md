# Angel class

Homework → Angel class → class password → student → week. Teacher access is in the top-right **선생님** button, with a separate password prompt.

Students: 지한, 오름, 이서. Weeks: November 1–4 and December 1–2.
Teacher access requires a separate password. Passwords are server environment variables, never included in client bundles or committed files.

Teachers select a week, open **숙제 항목 설정**, add titles and choose **동영상 제출** or **완료 버튼**, then publish. **예시 숙제 3개 불러오기** fills an editable draft; it does not publish automatically. Production starts with no announcements. Existing submissions survive title edits. Changing submission type after a student has submitted is rejected; add a new item instead.

Students can mark and undo check tasks, upload an MP4/MOV/WebM video up to 80 MB, cancel an upload, remove their submission, or replace a video. The old video stays available until replacement succeeds. Successful deletion/replacement removes the obsolete object. Teacher view shows each student's status and filterable videos. Peer gallery shows this week's active submissions, names and all-tasks-complete badges.

## Shared storage

Sites hosts the shared D1 tables and a private R2 bucket (`DB`, `BUCKET`). Vercel forwards small JSON requests to that backend and relays the HTTP-only class session cookie. Video bytes upload directly to Sites using single-use, 15-minute tickets; they do not pass through a Vercel Function. Players use one-hour signed URLs and support HTTP byte ranges. Each media request verifies that the file is still the active submission; removed/replaced/archived content is not served by old URLs.

Runtime configuration:

- Sites: `ANGEL_CLASS_SECRET` (random 32+ characters), `ANGEL_CLASS_PASSWORD`, `ANGEL_TEACHER_PASSWORD`.
- Vercel: `ANGEL_CLASS_API_BASE` points to the existing Sites origin. Local Next.js defaults to that same backend; override this variable for isolated local testing.

The existing workbook homework, parent password and lesson-star features are independent.

## Verification

`npx tsc --noEmit`, both hosting builds, existing homework/parent/reward regression scripts.

`scripts/test-angel-class.mjs` refuses non-loopback targets. It exercises the real local D1/R2 worker, teacher/student access, shared Next proxy, completion/undo, 17 MB video upload, invalid-file rejection, playback ranges, ticket replay, deletion/reupload, cross-student isolation, CORS and CSRF. It creates local fixtures only.

For that integration test use an isolated persistence directory and the generated test configuration under ignored `.sites-runtime/angel-tests/`; do not point it at production. The test configuration uses test-only credentials, never production passwords. Start the local worker on 8787 and local Next.js on 3001 with `ANGEL_CLASS_API_BASE=http://localhost:8787`.

R2 stream/range behavior follows the [official Workers R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).
