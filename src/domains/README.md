# SchoolPulse 1.0 domains

Production code is organised around eight bounded domains. UI components call a query/hook, which calls a domain service, which calls Supabase. RLS remains authoritative.

New 1.0 functionality must not use `app_records` when a specialised table exists. Demo data stays under the demo routes and `demo-data.ts`; files below this directory must never import it.

Each domain has a `CONTRACT.md`. Add `components`, `queries`, `services`, `types`, `validation`, `hooks` and `tests` only when the phase implementing that domain needs them.
