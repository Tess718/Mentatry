## 2025-05-23 - Authorization Check on Quiz Taking and Attempt Submissions
**Vulnerability:** Missing authorization check on `/quizzes/[id]/take/page.tsx` and `submitAttemptAction`, allowing any authenticated user to view draft quizzes or bypass join codes by submitting attempts to private quizzes.
**Learning:** Server actions and Next.js page routes fetching resources by ID must explicitly check `status === "PUBLISHED"`, ownership, or explicit access records (`QuizAccess`) rather than auto-granting access upon action execution.
**Prevention:** Always enforce dual-layer access checks (at both the page route and the Server Action / API layer) for resource access and creation.

## 2025-05-24 - Pre-generated Daily Quiz Premature Access Bypass
**Vulnerability:** Pre-generated daily quizzes marked `status === "PUBLISHED"` and `isDailyQuiz === true` for future dates could be accessed, started, or submitted early because daily quiz access checks did not verify `dailyDate <= todayUTC`.
**Learning:** Resource classification flags (like `isDailyQuiz`) that grant public or universal access must be validated against temporal constraints (`dailyDate <= todayUTC`) across page routes, server actions, and API endpoints.
**Prevention:** Always enforce UTC date-bound checks on scheduled or pre-generated public content endpoints.
