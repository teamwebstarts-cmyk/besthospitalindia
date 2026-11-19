# Client MVP plan

Source: client call transcript in `clint.md`, matched against the current app (public site, `/admin`, `/hospital-portal`, `/doctor-portal`, `/free-consultation`).

This is a planning document only. The public marketing pages stay. The work is to cut dashboards down to the flows the client actually runs, and to make enquiry data real (server, email, OTP), not fixture/local demo state.

## What the client is actually building

A nonprofit-style intake site. A patient should reach a short form quickly, leave a name and email, prove the email if OTP is on, then pick one of three requests. That request is a lead. It is not a hospital booking.

The client’s team (master admin) sees every lead. A vendor in Delhi sees only Delhi leads. A vendor in Indore sees only Indore leads. The vendor calls or messages the patient and decides which hospital to talk to. Hospitals and doctors do not receive these appointments.

Hospitals and doctors may later sign up with an official email, submit their own profiles, and wait for admin approval. Until approval, they are not public. One login can submit several hospitals and several doctors. Their screen only shows “submitted / not approved / approved”. It is not an operations portal.

## Actors

| Actor | What they do | What they never do in this MVP |
| --- | --- | --- |
| Patient | Short form, email OTP, then one detailed request | No account, no dashboard, no direct hospital booking |
| Master admin | All leads, vendor accounts, hospital/doctor records, approvals | Does not hand the lead to the hospital |
| City vendor (Delhi, Indore) | Sees leads for their city only and contacts the patient | Cannot add hospitals, doctors, or other cities |
| Hospital / doctor / clinic / lab applicant | Signs up with an official email, submits one or more profiles, sees approval status | Does not see patient leads |

“Partner” in the call means medical-tourism vendor, not the hospital. The client corrected this: vendors only receive patient data.

## Patient flow (the only flow that matters)

One public form for now. Do not keep a second, heavier enquiry form beside it. The current `/free-consultation` form asks for too much up front. The client was explicit: if the first screen is long, people do not submit.

### Step 1 — short capture (on the home page, especially mobile)

Fields:

- Name
- Email
- Indian or Others (visible choice, not a buried country dropdown)
- If Indian: state only. No city on this step.
- If Others: embassy. Only two options for now — Embassy of Kenya, Embassy of Nepal.
- Mobile number, optional. Do not make it required. People refuse the form when a phone is mandatory.
- Comment, with the instruction: write your mobile number and your query, if any.

No specialty picker, no hospital picker, no treatment picker on this step.

On submit:

1. Create a lead with a short unique id (example they used: `489680`).
2. Send that id to the email address.
3. Open a preview screen. Do not hide the next step inside the email only. The client first agreed to a link in the email, then corrected it: the next screen itself must show the id, the OTP box, and the three choices.

From address they want: `info@wispr.hospital` (replace any hello@ address). Street address and phone for the footer can wait; they will send those later.

### Step 2 — preview screen

Shows:

- “Your unique id is …”
- Email OTP field
- Copy: to continue, enter the OTP and choose one option
- Three choices, clearly named:
  - Free consultation
  - Attend free medical camp
  - Apply for free surgery

OTP is email, not WhatsApp. WhatsApp OTP was rejected as too expensive and too much account setup. Email OTP is wanted so the site feels real and fake emails are blocked. If the mail provider is not ready on day one, the unique id and the three choices still ship; OTP is the first add-on, not a reason to block the form. Once mail works, OTP is on.

The email contains the unique id (and a short line that they should return to the site and enter it). It does not replace the preview screen.

### Step 3 — detail form (only after OTP, or after the id is confirmed if OTP is still off)

The patient has already picked one of the three options. This form collects the rest of that request. It must end with:

- Preferred city: Delhi or Indore only.

That city is the routing key. It is “where they want to go / be treated from”, not a full India city list. The public hospital directory can still list many cities. The form must not.

On submit, store the full lead and email the patient a short confirmation of what they asked for. The same record appears on the master dashboard and on the vendor dashboard for that city.

### What a lead contains

- Unique id
- Name, email, optional phone, comment
- Indian + state, or Others + embassy
- Email verification state
- Chosen track: consultation, camp, or surgery
- Detail answers for that track
- Preferred city: Delhi or Indore
- Which vendor received it (derived from city)
- Status for the vendor: new, contacted, closed (keep this list short)

## Vendor dashboard

Two logins at launch, created by admin:

- Delhi vendor — password, email id
- Indore vendor — password, email id

Each login is a short list of leads for that city. Same columns the admin sees for a lead: who the person is, which of the three tracks, the comment, contact details, unique id, date. The vendor uses that to reach the patient. They do not assign a hospital inside the product. They do not edit the hospital catalogue.

Adding a third city later means: admin creates another vendor login and adds that city to the detail-form city list. No new product.

Later, not now: admin hides some fields from a vendor. The client said the option should exist eventually and that it is not important yet. Do not build field-level redaction in the first server version. Do build the split so a vendor cannot open another city’s rows.

## Master admin

One admin login. The client briefly said “two master panels” (approval and admin), then agreed one admin panel does both.

That panel needs only:

1. All leads, with city and vendor, so they can see who has how many patients.
2. Vendor accounts: add, disable, set city, set password.
3. Hospitals and doctors: admin can create and edit them directly. This is occasional catalogue work, not a 24/7 queue. Keep it a separate section from the lead inbox so the inbox stays the daily screen.
4. Approval queue: profiles submitted by hospital/doctor signups. Approve or reject. Approved profiles become public. Rejected or pending profiles stay off the public site.

Admin does not need, for this MVP: rating methodology editors, review moderation queues, clinical evidence packs, consultation case workflows, tourism case managers, patient medical records, hospital “team” managers, or KPI walls.

## Hospital and doctor signup

This is a small account, not the current hospital portal or doctor portal.

Entry, labelled clearly: “For hospitals and doctors”.

- Sign up and log in.
- Official email only. Gmail and similar free inboxes are rejected. They also get an email OTP.
- After login, one screen: “You are a hospital, doctor, clinic, or diagnostic lab” is not two products. One account, one list of submissions.
- They can add more than one hospital and more than one doctor on the same login.
- Each submission shows a status: not approved, and a plain wait note (a few days). After admin approves, status becomes approved and the profile can show on the public site.
- They can come back, see status, and edit a submission (that edit goes back through approval if it changes public facts).

They do not get appointment queues. If a patient names a hospital in a comment, that name is just text on the lead. The vendor still owns the follow-up. A paid “send appointments straight to the hospital” product was mentioned (an example figure of about ₹10,000 per month). That is future. Do not build it.

`horizonhotel.com` was mentioned as another site that might later share a server and edit hospital data. Do not block this MVP on that connection. Signup and admin upload on this site are enough.

## Public website

The client accepted the current look and said the landing content can stay for search. They also said the patient does not want a long explanation. So: do not redesign the marketing pages, and do not add a medical-tourism section. They asked to leave tourism alone for now.

Do change these behaviours when implementation starts:

- Mobile home: the first useful block is the short form, not the “find the right doctor” photo block. The five or six desktop choices they already see should also be at the top on a phone. Free consultation should not be a duplicate green button fighting the form.
- Hospital discovery: disease (or specialty) and city sit at the top, with little extra text. A patient is not expected to read a long filter sidebar. Home can offer the same two filters and then open the hospital list with those filters applied.
- WhatsApp on hospital cards uses one central number they will send, on every card. Do not dial the hospital’s own number. A click opens WhatsApp with a prefilled message. They know people might also call that number; they will not answer. That is acceptable to them.
- Keep hospital, doctor, and facility cards and profile pages. They are the catalogue. They are not the booking system.
- Theme: a bit more minimal is welcome. Do not strip the catalogue to do that.

## What is unnecessary in the current build

The public pages are in good shape. The extra engineering is the three portals and the demo “case” tools around them.

### Remove or stop building (current hospital portal)

These pages assume the hospital runs the patient:

- `/hospital-portal` dashboard KPIs
- Appointments queue
- Enquiries queue
- Doctors association manager
- Specialties manager as an operations tool
- Team, documents, ratings, reviews, settings, evidence submit

A hospital applicant does not get this shell. If a profile editor is still needed, it is the short signup form, not this portal.

### Remove or stop building (current doctor portal)

- Dashboard KPIs
- Availability editor
- Appointments
- Consultations
- Credentials workflow as a separate product
- Hospital associations manager
- Reviews and settings

Same reason: the doctor does not receive the patient.

### Shrink admin

Keep and reshape:

- `/admin` as the lead inbox plus vendor counts
- Hospitals and doctors as catalogue CRUD (admin-authored)
- A new approval list (can replace the current review-manager pages)
- Vendor accounts (the current partners screen is the closest seed; it is not the right model until it is “city vendor + password + lead count”)

Leave unused, and do not extend:

- `/admin/patients` medical-record manager
- `/admin/medical-tourism` case manager
- `/admin/consultations` as a clinical case file
- `/admin/ratings`, `/admin/reviews`, `/admin/rating-methodology`
- `/admin/facilities` unless a lab/clinic submission must be approved. If facilities stay on the public site, admin still needs a simple approve/hide switch, not a second portal.

### Auth today

`/auth` and the portal shells are demo sessions. Replace them with three real login types only: admin, vendor, provider applicant. Patients never log in.

### Data today

Public pages and portals read fixtures, and several actions write to the browser only. That cannot route a Delhi lead to a Delhi vendor or send email. The server has to own:

- leads and unique ids
- email OTP challenges
- vendors and their city
- provider accounts and their submissions
- public hospitals/doctors, with an approved flag

The catalogue the website already renders can stay. It becomes rows with `approved = true` instead of a TypeScript fixture file.

## Email and OTP behaviour

1. Patient submits step 1.
2. Server stores the lead and a one-time code.
3. Mail provider sends the code from `info@wispr.hospital`.
4. Preview page asks for that code.
5. Wrong code: stay on the preview, do not open the detail form.
6. Right code: mark the email verified, then show the three tracks and the detail form.
7. After the detail form, send a second short email: we have the request, here is your id again.
8. Provider signup uses the same mail path: official-domain check, then OTP, then the submission form.

WhatsApp is only the public click-to-chat button. It is not an OTP channel and not the system of record. The dashboard is.

## Routing rule

```text
detail form city = Delhi  → Delhi vendor inbox + master inbox
detail form city = Indore → Indore vendor inbox + master inbox
```

State and embassy on step 1 are stored for the admin. They do not pick the vendor. Only the preferred city on the detail form does. If someone finishes step 1 and never finishes step 3, the lead still exists on the master inbox, with no vendor yet.

## Build order

1. Server records for leads, vendors, and provider submissions. Stop writing new product behaviour into local demo storage.
2. Replace the long consultation form with step 1, preview, and step 3. Put step 1 on the home page for mobile.
3. Email unique id. Then email OTP in front of step 3.
4. Admin inbox of all leads, and two vendor logins filtered by Delhi and Indore.
5. Admin catalogue: add/edit hospital and doctor, publish flag.
6. Provider signup: official email, OTP, multi-submit, status only.
7. Admin approval toggles the public flag.
8. Point every hospital-card WhatsApp button at the single number.
9. Move disease and city filters to the top of hospital discovery.

Do not start by restyling the existing hospital and doctor portals. They are the wrong product.

## Explicitly out of scope

- WhatsApp OTP
- Patient accounts
- Hospital or doctor appointment inbox
- Paid “direct appointment” plan
- Hiding individual lead fields from a vendor
- New medical-tourism marketing section
- Connecting `horizonhotel.com`
- Rating methodology, review moderation, and evidence workflows as operational tools
- City lists on the first form, and more than Delhi and Indore on the detail form
- More than two embassies until the client names them

## Decisions already closed on the call

- One intake form, not two.
- First screen stays short.
- Phone is optional.
- Indian path asks for state, not city.
- Others path asks for Kenya or Nepal embassy only.
- Three tracks: free consultation, free medical camp, free surgery.
- Next step is on the website after submit, not only inside the email.
- OTP is email. It should ship. The form can be demonstrated before the mail bill is final.
- Vendors are city inboxes, not hospital partners.
- Hospitals do not get the lead.
- Admin can type hospitals and doctors in, and can also approve outside submissions.
- One provider login can own many hospitals and many doctors.
- Public catalogue pages stay. Tourism section is not added now.
