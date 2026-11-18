# Vercel review deployment

This branch is prepared for a **review/staging preview**. It is not cleared for production use because authentication, persistence and real booking integrations are not implemented.

## Import settings

1. Import the repository `teamwebstarts-cmyk/besthospitalindia` into Vercel.
2. Select branch `feature/mvp-dashboard-simplification` for the review deployment.
3. Set the Root Directory to the repository root (`./`).
4. Confirm Framework Preset is **Next.js**.
5. Use Node.js **22.x**.
6. Use the npm lockfile. Vercel should install dependencies with `npm install`/its detected lockfile install command.
7. Build Command: `npm run build`.
8. Leave Output Directory at the Next.js default. Do not set a custom static output directory.
9. No environment variables are required for this demo preview.

The repository includes `package.json` Node engine pinning and `.nvmrc` so the local/CI runtime is aligned with the Vercel build.

## After the first deployment

Review these paths in the deployed preview:

- `/` — public landing page and navigation.
- `/hospitals` and `/doctors` — directory pages and provider profiles.
- A hospital profile → **Request an appointment** → selected hospital portal → appointment list.
- A doctor profile → **Request an appointment** → selected doctor portal → appointment list.
- `/admin` and `/admin/appointments` — platform overview and all demo appointment requests.
- Mobile navigation and forms at a narrow viewport.

Use the same browser profile for the booking and portal review: appointment preview data is stored in that browser's local storage. It is not shared across separate browsers or devices. Clear the browser key `bhi.demo-appointments.v1` when you need a clean demo run.

## Preview limitations

- Patient, hospital and doctor workflows are demo UI only; there is no production sign-in or authorization.
- Appointment requests and status updates are browser-local demo data, not a database record.
- No provider availability/slot validation, payment, email/SMS or push notification integration is connected.
- Partner profile, specialty, association and availability forms do not yet persist as production records.
- The Patient dashboard is intentionally outside this MVP preview.

Do not use real patient data or treat requests created in this preview as real appointments.

## Deployment troubleshooting

- If dependency installation fails, confirm the project uses the repository's `package-lock.json` and Node.js 22.x.
- If the build fails, open the Vercel build log and capture the first TypeScript/ESLint/Next.js error; do not suppress it by disabling checks.
- The workflow in `.github/workflows/ci.yml` performs typecheck, lint and build on GitHub. A green deployment still needs browser-level review of the flows above.
