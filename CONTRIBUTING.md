# Contributing Guidelines

Thank you for your interest in contributing to the Stock Market Analysis Platform!

## 1. Branch Strategy
- `main`: Production releases.
- `develop`: Primary integration branch.
- `feature/*`: New features or enhancements.
- `hotfix/*`: Production bug fixes.

## 2. Development Workflow
1. Fork the repository and create your feature branch from `develop`.
2. Follow standard code formatting:
   - **Frontend**: `npm run lint` and `npx prettier --write .`
   - **Backend**: `mvn checkstyle:check pmd:check`
3. Ensure all tests pass cleanly:
   - `mvn test` (92 unit/integration tests)
   - `npx tsc --noEmit`
4. Open a Pull Request against `develop` describing your changes.

## 3. Pull Request Checklist
- [ ] Added unit/integration test coverage for new features.
- [ ] Verified `mvn test` passes with zero errors or failures.
- [ ] Confirmed no secrets or API keys are committed.
- [ ] Documentation updated in `docs/`.
