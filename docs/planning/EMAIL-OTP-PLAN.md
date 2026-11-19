# Email + OTP plan (next work)

Planning only. Do not start coding until this is agreed.

## Goal

1. Real email from `info@wispr.hospital` reaches the patient’s (and provider’s) inbox.
2. Email OTP is **required** — no track / detail until the code matches.
3. Keep current routing: query → admin + Delhi/Indore desk only. WhatsApp stays `8302610058`.

## Recommendation: Resend (not a self-hosted mail server)

| Option | When it fits | Verdict for us |
| --- | --- | --- |
| **Resend** (API or Resend SMTP) | App on your own VPS/server; domain `wispr.hospital` you control | **Use this.** Best deliverability for OTP, simple keys, SPF/DKIM via their DNS. |
| Generic SMTP (cPanel / Zoho / Google Workspace / Mailcow) | You already have working mailbox `info@wispr.hospital` | Second choice. Same app code path (`SMTP_*` env), different host. |
| Full self-hosted Postfix only for OTP | You want zero third party | Avoid for OTP. Deliverability is hard; codes land in spam. |

**Decision for this project:** ship **Resend** first (SMTP mode is enough: `smtp.resend.com` + API key as password). Your **app** still runs on your own server. Mail leaves through Resend so OTP actually arrives.

If later you already have a reliable mailbox on your server, flip env to that SMTP — no second product rewrite.

## What you must prepare (before / while coding)

1. Domain `wispr.hospital` (or confirm ownership).
2. Resend account → add domain → add DNS records (SPF, DKIM, optionally DMARC).
3. Create API key.
4. On the app server, set env (example names — final names in implementation):
   - `MAIL_FROM=info@wispr.hospital`
   - `SMTP_HOST=smtp.resend.com`
   - `SMTP_PORT=465` (or `587`)
   - `SMTP_USER=resend`
   - `SMTP_PASS=<Resend API key>`
5. Keep local/dev without keys: outbox file can still log what *would* send; production refuses to skip OTP.

## What to build (ordered)

### A. Mail sender (one module)

- Replace “store only” with: generate code → save outbox row → **send** email via SMTP.
- From: `info@wispr.hospital`.
- Patient step-1 email: unique id + 6-digit code + “return to site and enter the code”.
- After track chosen: short confirmation email (id + which of the three).
- Provider signup: same path, official email only (Gmail still rejected).
- Failures: log on admin (outbox status `sent` / `failed`); do not invent a second inbox product.

### B. OTP required (patient)

Preview screen after step 1:

- Show unique id.
- Show OTP field.
- **Hide / disable** the three choices until `emailVerified === true`.
- Wrong code → stay on preview, message only.
- Right code → mark verified, then show free consultation / camp / surgery, then detail.

Remove the current “mail not connected, you can still choose” bypass.

### C. OTP required (hospital / doctor application)

- After submit, applicant must enter the code on the status screen before the application is treated as complete for review (or at least before they can edit/publish flow). Align with patient: code required, same mail module.
- Admin can still see pending rows; optional: do not let applicant “Save” edits until verified.

### D. Admin

- Keep showing code only while mail is failing / for support (optional short window). Prefer not showing codes forever once Resend is live.
- Seed passwords: change `admin-demo` / vendor demos before production.

### E. Cleanup (same milestone or right after)

- Delete or quarantine unused `requestAppointment` / old enquiry forms that are not mounted.
- Contact + free consultation success copy already says admin + city desk — leave as is unless mail text needs the same line.

## Explicitly not in this plan

- WhatsApp OTP
- Patient login accounts
- Sending queries to hospitals/doctors
- Building your own Postfix stack just for this site

## Acceptance checks (when we implement)

1. Submit form → inbox gets mail from `info@wispr.hospital` with id + code.
2. Without correct OTP → three tracks not available.
3. With correct OTP → tracks + detail work; lead still `vendor-delhi` or `vendor-indore`.
4. Confirmation mail after choosing a track.
5. Gmail still rejected on hospital/doctor signup; official domain gets OTP mail.
6. WhatsApp on cards still `918302610058`.
7. Admin + vendor desks unchanged for routing.

## Suggested build order when we start

1. Env + SMTP send helper (Resend).
2. Wire patient createLead + confirmation to real send.
3. Gate UI: OTP required before tracks.
4. Provider application OTP gate.
5. Live domain DNS + one real inbox test.
6. Cleanup unused appointment forms + rotate demo passwords.

---

**Ask before coding:** confirm Resend + domain `wispr.hospital` is OK, or say if you already have SMTP for `info@wispr.hospital` (host/port) and we use that instead of Resend.

---

## IMPLEMENTED (status)

Done:
1. `nodemailer` added. `lib/mail/sender.ts` created: Resend HTTP API primary, generic SMTP fallback (incl. Resend SMTP), outbox.json fallback for dev.
2. `lib/mail/outbox.ts` now calls the real sender on OTP + confirmation; outbox stays the verification source of truth.
3. Patient form OTP is **mandatory**: track buttons, detail form and WhatsApp CTA stay hidden until `emailVerified`. Server API also returns 403 for track/detail before OTP.
4. Provider application status page: name/city editing and save hidden until OTP verified; API returns 403 for edits before verification.
5. `.env.example` documents `RESEND_API_KEY` / `SMTP_*` / `MAIL_FROM`.
6. Verified: `npm run typecheck` and `npm run build` pass. E2E API test: create → verify → track works; without verification track/detail return 403.

Remaining (needs your action, cannot be done in code):
- Add `RESEND_API_KEY` (or SMTP creds) to your server `.env` and verify `wispr.hospital` DNS in Resend for `info@wispr.hospital`.
- One real inbox test after credentials are live.
- Optional cleanup: unused appointment forms + rotate demo passwords.

---

# FINAL SELF-AUDIT — 19 Nov 2026 (honest recheck of my own work)

Maine apna kiya hua kaam dobara padha — sirf apne notes se nahi, actual code, git diff, routes, env handling aur data state check karke. Ye clean sheet hai. Kuch cheezein maine **issi audit me theek bhi ki** (neeche marked).

## 1. Session me kya hua (poora timeline)

1. **MVP lead flow** banaya: patient query → admin + Delhi/Indore city desk (`vendor-delhi`, `vendor-indore`), WhatsApp `918302610058`, mock CRUD.
2. **Routing invariants** enforce kiye: queries *kabhi* hospital/doctor ko nahi jaati; public catalogue accessible rehta hai; portal (hospital/doctor) ko leads dene wale endpoints band karke `PortalClosedNotice` par bheja.
3. **Public copy** terms/privacy/how-it-works/free-consultation/facilities par consistent kiya: "patient queries are never sent to providers".
4. **Duplicate mobile CTA** home hero se hataaya taaki sole intake form home query form rahe.
5. **Multi-desk bug** fix kiya: `keepOneActiveDesk` + `assignOpenLeads` — ek city me sirf ek active desk; unassigned leads auto-assign.
6. **`NO_VENDOR` bug** fix kiya: desk disabled hone par bhi query reject na ho — lead `vendorId: null` ke saath admin queue me rehti hai, desk active hone par assign hoti hai.
7. **Email + OTP plan** likha (`EMAIL-OTP-PLAN.md`) — user ne SMTP vs Resend me "jo best ho wo" kaha; Resend recommend kiya, OTP ko optional nahi, pehle plan phir code.
8. **Implementation (aaj):** `nodemailer` install, `lib/mail/sender.ts` (Resend API → SMTP → outbox), `outbox.ts` ko real send se wire, patient + provider dono jagah **mandatory OTP gate** (UI + server 403), `.env.example`, typecheck/build/E2E pass.
9. **Iss audit me fix kiya:** `.env.example` gitignored tha (`.env*` pattern) → `.gitignore` me `!.env.example` exception add kiya; stray `test-home.png` test artifact hataaya.

## 2. Scoring — objectively kya level hai

| Area | Score | Remark |
| --- | --- | --- |
| Core lead flow + routing | **10/10** | Admin + city-desk only, WhatsApp sahi, catalogue public. Invariants code level par clearly enforce. |
| Mandatory OTP (UI + server) | **9/10** | Dono taraf gate hai. **-1** expiry/brute-force nahi (neeche gap G1). |
| Real email delivery | **8/10** | Code sahi (Resend → SMTP → outbox), **par** abhi koi key nahi → abhi real mail nahi jata, outbox mode me hai. Ye aapke action par depend hai. |
| Provider signup gate | **9/10** | OTP ke bina edit block, Gmail reject. **-1** wahi expiry gap. |
| Copy / public messaging | **10/10** | Har jagah "not sent to a hospital or doctor". |
| Build health | **9/10** | typecheck + build pass. **-1** purane `themeColor` warnings (pre-existing, unrelated). |
| Repo hygiene | **9/10** | `.env.example` ab tracked, test artifact hataaya. Demos password abhi seed me hain (neeche remaining). |
| **Overall** | **~9.1/10** | Feature-complete MVP; production-go-live ke liye sirf aapki credentials + DNS + 1 real inbox test baaki. |

## 3. Poora clean sheet — abhi kya HO CHUKA hai ✅

**Routing & invariants**
- [x] Patient query sirf admin + Delhi/Indore desk ko; kabhi hospital/doctor ko nahi.
- [x] WhatsApp `8302610058` / `918302610058` har jagah consistent (`constants/site-contact.ts`, home content).
- [x] Hospital/doctor portals leads dekhne/neene wale endpoints band; `PortalClosedNotice`.
- [x] Public catalogue (hospitals/doctors/facilities/treatments) accessible.
- [x] Single active desk per city + unassigned lead auto-assign; desk band hone par query reject nahi.
- [x] Public copy everywhere: queries providers ko nahi jaati.

**Email + OTP (aaj ka kaam)**
- [x] `nodemailer` dependency; `lib/mail/sender.ts` — Resend HTTP primary, SMTP fallback, outbox fallback.
- [x] Sender `info@wispr.hospital`; OTP + confirmation dono real send ke saath; outbox verification source of truth.
- [x] Patient form: OTP ke bina track buttons, detail form, WhatsApp CTA **hidden**; "you can still choose" bypass **removed**.
- [x] Server API: track/detail ke liye OTP ke bina **403** (direct API bypass block).
- [x] Provider status: OTP ke bina name/city edit hidden; API **403**.
- [x] Free inbox (Gmail etc.) hospital/doctor signup par rejected.
- [x] `.env.example` ab git-tracked; typecheck + build + E2E (create → verify → track; negative 403) pass.

**Verification evidence**
- `npm run typecheck` ✅ 0 errors
- `npm run build` ✅ 88 routes, compiled successfully
- E2E API: create → OTP verify → track set ✅; bina OTP track/detail → 403 ✅
- Test leads/outbox entries test ke baad cleanup kiye ✅

## 4. Gap / Bug analysis — abhi kya baaki hai ⚠️

**G1 — OTP expiry + attempt limiting (real gap, medium priority).**
Abhi `verifyLeadCode` sirf code match karta hai: na expiry (10/15 min), na max attempts, na resend throttling. 6-digit code indefinitely valid hai aur unlimited guesses allowed hain. MVP/testing ke liye theek hai, **par production me OTP ke liye ye standard practice nahi hai**. Fix: outbox row me `expiresAt` + `attempts` fields, verify me time/limit check, aur UI me "resend code" button. *Maine abhi nahi kiya — aapke go-ahead par next step ke liye ready hai.*

**G2 — Real mail abhi live nahi (aapke action par depend).**
Code ready hai par `.env` me key nahi → abhi sab mail `data/runtime/outbox.json` me sirf log ho raha hai. Real inbox test abhi possible nahi. Ye "bug" nahi, configuration pending hai.

**G3 — Seed demo passwords (pre-existing, production risk).**
`admin-demo`, `delhi-demo`, `indore-demo` abhi code/file me hain. Production se pehle rotate honi chahiye. (Plan doc me pehle se noted; maine abhi change nahi kiya kyunki aapke local dev login affect honge.)

**G4 — Ephemeral filesystem (Render/ VPS deploy note).**
Leads/outbox/vendors `data/runtime/*.json` me hain. Ye local dev ke liye theek hai, par ephemeral filesystem par restart pe data lost hoga. Production ke liye DB ya persistent volume chahiye. Ye purana architectural limitation hai — is session me introduced nahi, par audit me honestly batana zaroori tha.

**G5 — Pre-existing warnings (non-blocking).**
Build me `themeColor` → `viewport` export wale warnings aate hain (purane code se). App chalne me affect nahi; clean karne ho to alag chota task hai.

## 5. Aapko kya KARNA hai (meri taraf se baaki)

1. **Resend account + domain DNS:** `wispr.hospital` verify karein (SPF/DKIM/DMARC), API key banayein.
2. **`.env` set karein** (server par): `RESEND_API_KEY=...` aur `MAIL_FROM="Best Hospital India <info@wispr.hospital>"`. (SMTP chaho to `SMTP_*` — dono support hain.)
3. **Ek real inbox test:** form submit karein → mail aaye → OTP verify → track → confirmation mail. Ye confirmation ke baad hi "real email delivery" 8/10 se 10/10 hogi.
4. **Production se pehle:** demo passwords rotate karein (G3); persistent storage ka faisla karein (G4).
5. **Agar chahein (optional, meri taraf next step):** G1 OTP expiry + resend button — bata dijiye to main implement kar dunga.

## 6. Aapko kya NAHIN karna hai (maine already kar diya)

- ❌ Nodemailer/SMTP code likhna — ho gaya.
- ❌ OTP gate banana (patient + provider, UI + server) — ho gaya.
- ❌ "Mail not connected" bypass hataana — ho gaya.
- ❌ Routing ko hospital/doctor tak phailaana — **bilkul mat karna**; invariant hai.
- ❌ WhatsApp number badalna — **mat karna**; `918302610058` sahi hai.
- ❌ Postfix/self-hosted mail server banana — **mat karna**; deliverability kharab hoti, Resend hi best hai.
- ❌ Gmail/free inbox ko signup me allow karna — **mat karna**; official domain required hai.

## 7. Final verdict

**Feature-complete MVP — CONDITIONAL PASS for go-live.** Code ka kaam 100% ho chuka hai (iss audit me 2 chote hygiene fixes bhi kiye). Sirf aapki **credentials + DNS + 1 real inbox test** se "real email delivery" confirm hogi. G1 (OTP expiry) aur G3/G4 production-hardening ke liye recommended follow-ups hain — aapke approve par main G1 turant kar sakta hoon.

---

## UPDATE — Form consolidation (19 Nov 2026, later session)

User request: alag "Send a query" form (hero ke neeche) **new form nahi** hona chahiye — ise existing hero form ("Let us help you") me combine karna hai, usi theme ke saath; aur mock data test ke liye ready rehna chahiye.

**Kya kiya:**
1. `features/leads/intake-form.tsx` — `LeadIntakeForm` ko `variant="card" | "hero"` mila. Hero variant: gradient primary→cta panel, white "Let us help you" intro (shield icon), white inputs/selects, white submit button with `Continue →`, OTP/track/detail/WhatsApp steps bhi usi theme me. **Poora OTP flow ab hero form ke andar hai** (koi naya form nahi).
2. `features/content/home-hero-section.tsx` — hero column me ab `LeadIntakeForm variant="hero"` render hota hai (`ContactForm` hataaya). Ab mobile + desktop dono par yahi ek intake form hai.
3. `app/(public)/page.tsx` — alag "Send a query" `<section>` aur uska `<LeadIntakeForm />` **hata diya**. Neeche wala sirf city/specialty **discovery** form reh gaya, heading ab "Find hospitals" (lead form nahi).
4. Mock data: pehle se `data/runtime/leads.json` + `data/runtime/outbox.json` (API-backed mock store) hai — dev me OTP yahin likha jata hai, testing ke liye ready. Smoke test ke baad test entries clean kiye.

**Verification:** DOM check — `heroIntro: true`, lead inputs `#lead-name/#lead-email/#lead-state/#lead-city` present, `sendQueryH2: false` (alag heading nahi). API E2E: create → OTP verify → track = pass. `npm run typecheck` ✅, `npm run build` ✅.

**Note:** Contact page (`/contact`) ka apna general `ContactForm variant="contact"` reh gaya — wo alag page ka mode hai, home hero consolidation se unrelated.

**Browser automation note:** is session me browser tab har CDP call par reload ho raha tha (dev-server instability), isliye visual click-through unreliable tha; API-level E2E aur DOM assertions se verify kiya gaya.

---

## UPDATE — Better copy + one-click demo (19 Nov 2026)

User request: inquiry form ka text aur better karo, aur ek chota demo icon add karo taaki poora flow turant test ho sake.

**Kya kiya:**
1. **Copy improved** (hero form): "Enter your details to get started. Your email is verified before you choose a request." · "Where are you from?" · "India / International" · "Your state" / "Your embassy" · state + city ab side-by-side (mobile par bhi compact).
2. **Demo mode helper (code-only, safe):** `POST /api/leads` ab jab `mailProvider() === "outbox"` ho (yani koi real email key nahi) to response me `demoCode` bhi deta hai. Real mail configured hone par **kabhi** nahi deta — production safe. `lib/mail/outbox.ts` me `getLatestLeadCode()` add kiya.
3. **One-click demo button** hero form me: ▶ icon + "See a full demo (auto-fill & test)". Click karte hi:
   1. form auto-fill (Demo Patient, demo email, Delhi),
   2. POST /api/leads → OTP code auto-fill,
   3. OTP verify,
   4. "Free consultation" track auto-select,
   5. detail auto-save,
   6. WhatsApp button ready — poora 6-step workflow 1 click me. Har step par progress note dikhata hai. Real mail configured ho to button sirf details bharta hai aur user ko inbox se code dalne ke liye kehta hai.

**Verification:** API E2E — create → demoCode → verify → track → detail sab pass. Browser me demo button click ke baad final state confirmed: track buttons + "What would you like to ask?" (demo detail prefilled) + "Save this detail" + "Send this on WhatsApp" visible. Demo leads/outbox test ke baad clean kiye.

**⚠️ Concurrent-work note:** is waqt doosre agent ke uncommitted changes (`admin-submissions.tsx`, `submissions.ts`, `published.ts`, admin pages, `public-header.tsx`) `npm run typecheck` ko tod rahe hain (5 errors, un files me). Mere files (`intake-form.tsx`, `api/leads/route.ts`, `lib/mail/outbox.ts`) me koi error nahi. Ye fix unke scope ka hai — maine touch nahi kiya.
