# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability within the Stock Market Analysis Platform, please do **NOT** open a public issue.

Instead, please send an encrypted security advisory directly to security@quant-platform.com including:
- Proof of Concept (PoC) steps or request payloads.
- Impact assessment (e.g. Authentication bypass, SQL injection, Prompt injection).

Our security engineering team will investigate and respond within 24 hours.

## Security Practices Implemented
- **Authentication**: JWT with secret rotation and refresh token blacklist.
- **Input Validation**: Zod schema validation on frontend and Bean Validation (`@Valid`) on backend.
- **AI Safety**: RegEx-based adversarial prompt injection sanitizer.
- **Containers**: Non-root security context (`nextjs:1001`, `spring:10001`).
- **Network**: HTTPS TLS 1.3, Rate limiting (`10r/s`), Security Headers (`CSP`, `HSTS`, `X-Frame-Options`).
