# Contributing to MeetLoom

Use Node.js 24 and `npm ci`, then follow [local startup](README.md). Create a `codex/description` branch or your own working branch and submit a PR. Do not commit `.env` files, SQLite databases, dumps, secrets, or private agendas.

Before opening a PR, run `npm run check` and format changed files with Prettier. API contracts must continue to pass on SQLite and PostgreSQL; CI covers both. To test PostgreSQL locally, set `TEST_DATABASE_URL` to a test database whose user can create and drop isolated schemas, then run `npm test`.

The [architecture](ARCHITECTURE.md) explains where changes belong. Reuse `tests/support.ts` for HTTP tests: it starts an application on loopback, creates isolated accounts, and cleans up its resources. Never point `TEST_DATABASE_URL` at a production database. Schema changes are additive and idempotent; include a compatible migration and a test on both engines when changing storage.

Authorization, visitor projection, persistence, or agenda format changes need meaningful domain/API tests. Verify visual changes in a browser. End-to-end tests will be introduced after first-version acceptance and are not an available check yet.

Agenda writes use the central version check; related writes such as comments, responses, and sharing also check closure and trash state under a transactional lock. Transfers between sessions must never succeed partially. Test revoked access, identifiers belonging to other sessions, concurrent requests, and public data privacy.

Interfaces include English and French labels, loading states, recoverable errors, and the account's actual permissions. Editor, administration, and form modules load according to the workflow; compare bundle sizes after substantial additions without hiding build warnings.

Dependencies go through Dependabot and the same checks as application code. GitHub Actions remain pinned to their commit SHA. Automatic merging is disabled until accepted E2E checks and branch protections are in place. Follow [SECURITY.md](SECURITY.md) for vulnerabilities.

Manifests are generic: keep installation-specific namespaces, domains, and registries in an operational overlay, outside distributed values. Prepare a release by updating the version in `package.json` and the lockfile together. The [publication procedure](docs/deployment.md) covers Docker Hub, artifacts, and manual deployment by the operator.

Do not trigger a release or deployment during this phase: functional coverage and manual QA precede user acceptance, then the E2E suite and first publication. The Render button is an installation descriptor available to operators; its free demo uses ephemeral storage.
