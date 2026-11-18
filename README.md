# BestHospitalIndia

BestHospitalIndia is a Next.js healthcare discovery and partner-portal MVP.

## Current preview scope

- Public discovery pages for hospitals, doctors, facilities, treatments and related content.
- Direct appointment-request flow from a hospital or doctor profile.
- Demo Admin, Hospital and Doctor dashboards.
- Appointment requests are stored in the current browser's local storage so the public form and demo portal screens can share the same preview data.

**Important:** this is a review/demo build, not a production booking platform. It does not currently provide a production database, real authentication or role-based access control, live appointment scheduling, email/SMS delivery, or cross-device data synchronization. Demo actions must not be treated as real patient bookings or provider confirmations.

## Requirements

- Node.js 22.x
- npm (the repository includes `package-lock.json`)

## Run locally

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

The GitHub Actions workflow runs typecheck, lint and production build on pushes to `main` and `feature/mvp-dashboard-simplification`, and on pull requests targeting `main`.

## Deploy a review preview to Vercel

See [docs/DEPLOYMENT-VERCEL.md](docs/DEPLOYMENT-VERCEL.md) for the exact project settings and post-deploy review checklist.

No environment variables are required for the current demo-only preview. Do not add production secrets until the corresponding backend integrations are implemented.
