## 2025-05-23 - Authorization Check on Quiz Taking and Attempt Submissions
**Vulnerability:** Missing authorization check on `/quizzes/[id]/take/page.tsx` and `submitAttemptAction`, allowing any authenticated user to view draft quizzes or bypass join codes by submitting attempts to private quizzes.
**Learning:** Server actions and Next.js page routes fetching resources by ID must explicitly check `status === "PUBLISHED"`, ownership, or explicit access records (`QuizAccess`) rather than auto-granting access upon action execution.
**Prevention:** Always enforce dual-layer access checks (at both the page route and the Server Action / API layer) for resource access and creation.
