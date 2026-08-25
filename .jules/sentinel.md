## 2025-05-23 - Authorization Check on Quiz Taking and Attempt Submissions
**Vulnerability:** Missing authorization check on `/quizzes/[id]/take/page.tsx` and `submitAttemptAction`, allowing any authenticated user to view draft quizzes or bypass join codes by submitting attempts to private quizzes.
**Learning:** Server actions and Next.js page routes fetching resources by ID must explicitly check `status === "PUBLISHED"`, ownership, or explicit access records (`QuizAccess`) rather than auto-granting access upon action execution.
**Prevention:** Always enforce dual-layer access checks (at both the page route and the Server Action / API layer) for resource access and creation.

## 2025-05-24 - Pre-generated Daily Quiz Premature Access Bypass
**Vulnerability:** Pre-generated daily quizzes marked `status === "PUBLISHED"` and `isDailyQuiz === true` for future dates could be accessed, started, or submitted early because daily quiz access checks did not verify `dailyDate <= todayUTC`.
**Learning:** Resource classification flags (like `isDailyQuiz`) that grant public or universal access must be validated against temporal constraints (`dailyDate <= todayUTC`) across page routes, server actions, and API endpoints.
**Prevention:** Always enforce UTC date-bound checks on scheduled or pre-generated public content endpoints.

## 2025-05-25 - Missing QuizAccess Check on Quiz Start API & Draft Quiz Result Exposure
**Vulnerability:** `POST /api/quizzes/[id]/start` allowed authenticated users to bypass join code requirements on private quizzes because it lacked `QuizAccess` validation, and public share routes (`/share/result/[attemptId]` and `/api/og/result/[attemptId]`) disclosed metadata of draft/unpublished quizzes.
**Learning:** API endpoints starting quiz sessions must validate `QuizAccess` records for private non-daily quizzes, and public sharing routes must fail-closed if the referenced quiz is not `PUBLISHED`.
**Prevention:** Mirror resource permission checks across all API start endpoints and enforce `status === "PUBLISHED"` on public share endpoints.
