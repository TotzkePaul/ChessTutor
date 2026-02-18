# Goals for ChessTutor

## Summary
This document captures the short- and medium-term goals for the ChessTutor project, success criteria, an initial bug-triage strategy, and immediate next steps. The repository is a React-based chess tutoring app (UI + simple AI + evaluation logic). The user reported "many bugs"; this doc assumes a general stabilization + quality-focused plan.

## Primary goals (prioritized)
1. Stabilize the application (no runtime crashes in common flows).
   - Success criteria: App runs and the board renders without console errors; core flows (start game, play moves, undo, move history) complete without uncaught exceptions.
2. Fix core logic and accuracy issues (move generation, evaluation).
   - Success criteria: Unit tests for chess engine/core functions (move generation, legal-move checks, check/checkmate detection) pass.
3. Improve developer experience and test coverage.
   - Success criteria: Add unit tests for the `logic/` and `hooks/` modules; get basic coverage for engine logic.
4. Improve UI/UX flaws that cause user confusion (move highlighting, AI controls, tooltips).
   - Success criteria: Known UX bugs fixed; manual verification checklist passes.
5. Add CI that runs lint/test on PRs.
   - Success criteria: A simple GitHub Actions workflow that runs `npm test` and `npm run build` on pushes/PRs.

## Bug triage & workflow (how we'll approach "many bugs")
1. Reproduce: Try to reproduce the issue locally and create a minimal repro. Record steps.
2. Classify severity: Blocker (crash / data loss), High (incorrect behavior), Medium (UX), Low (cosmetic).
3. Assign & label: Create an issue with labels (severity, area: board/engine/ui/tests) and assign owner/PR.
4. Add tests: When possible, write a unit/regression test that reproduces the bug before fixing.
5. Fix & verify: Implement fix, run tests, and perform the reproduction steps to confirm.

## Short-term deliverables (this sprint)
- Create this `Goals.md` and a `Structure.md` (done).
- Reproduce and file top 5 high-severity bugs as issues.
- Write unit tests for `logic/chessEngine.js` (move generation) and `hooks/useChessGame.js`.
- Fix rendering crashes in `src/components/Board.js` and `src/components/Square.js` if present.
- Add a basic GitHub Actions workflow (follow-up task).
- Deploy to gh-pages

## Assumptions
- No detailed bug list has been provided yet; the above is inferred from the repo layout and the user's brief note.
- The project uses standard Node scripts (e.g., `npm start`, `npm test`, `npm run build`).

## Immediate next steps for me (you can take these too)
1. Run the app locally and note console/terminal errors.
2. Run unit tests (if any) and inspect failing tests.
3. Create issues for the top failures and prioritize.
4. Start by writing unit tests for `logic/chessEngine.js` and `hooks/useChessGame.js`.

---

If you'd like, I can now run the app/tests to collect the first set of errors and then open issues for the highest-priority bugs.