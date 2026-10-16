# Health Provida Lab Connect

HEALTH PROVIDA — DIAGNOSTIC LAB PARTNER PORTAL

Lovable Build Prompt — Frontend-Only Interactive Prototype

Build a polished, modern, responsive Diagnostic Laboratory Partner Portal for Health Provida, a Nigerian healthcare technology platform connecting patients, hospitals, HMOs and diagnostic laboratories.

This is a frontend-only clickable prototype for UI/UX validation and stakeholder demonstration.

The goal is to make the product feel like a real, production-quality Health Provida laboratory workspace while keeping implementation extremely lightweight.

CRITICAL BUILD CONSTRAINTS

Do not build a backend.

Do not create a database.

Do not implement real authentication.

Do not integrate APIs.

Do not integrate Paystack, Flutterwave or Interswitch.

Do not integrate EMR, HL7 or FHIR.

Do not implement real laboratory equipment/instrument integrations.

Do not create real file storage.

Use:

React

TypeScript

Tailwind CSS

Local frontend state

Small static mock datasets

Reusable UI components

All functionality should be simulated locally.

The prototype must be fully interactive, meaning important navigation items, buttons, filters, tabs, modals, drawers and status changes should work visually.

Prioritize:

UI/UX quality > backend functionality > technical complexity.

Because this is being built using a limited Lovable free account, avoid unnecessary architecture, dependencies and infrastructure.

1. HEALTH PROVIDA BRAND IDENTITY

Use the supplied approved Health Provida logo as the primary brand reference.

The logo establishes the visual identity through:

Health Provida Blue

Health Provida Green

Blue-to-green/teal visual transition

PRIMARY BLUE

#009DDA

This is the primary interactive brand colour.

Use for:

Primary buttons

Active navigation

Links

Selected states

Important interactive controls

Information states

Primary chart elements

PRIMARY GREEN

#4CAF50

This represents health, success and completion.

Use for:

Success

Verified

Completed

Result Ready

Published

Confirmed states

Do not use green for every CTA.

BRAND GRADIENT

Use sparingly:

linear-gradient(135deg, #009DDA 0%, #27A693 50%, #4CAF50 100%)

Use only for subtle brand moments such as:

Small dashboard accents

Progress indicators

Empty states

Selected highlights

Occasional hero accents

Do NOT use the gradient across the entire interface.

2. HEALTH PROVIDA NEUTRAL PALETTE

Use these neutrals throughout the application.

Primary text:

#172B3A

Secondary text:

#5F6F7B

Muted text:

#8A98A3

Borders:

#DDE5E9

Application background:

#F6F9FA

Cards/surfaces:

#FFFFFF

Blue tint:

#EAF7FC

Green tint:

#EDF8EE

Teal tint:

#EAF8F6

The interface should be predominantly white, very light gray and slate, with Health Provida blue and green used strategically.

Do not make the entire dashboard blue.

Do not make the sidebar completely blue.

Do not overuse saturated colors.

3. VISUAL STYLE

The interface should feel:

Premium

Professional

Trustworthy

Clean

Modern

Calm

Efficient

Healthcare-focused

Appropriate for Nigeria and Sub-Saharan Africa

It should look like a serious healthcare operations product rather than a generic admin dashboard.

Use:

Generous whitespace

Clean typography

Subtle borders

Light shadows only when necessary

Clear information hierarchy

Consistent status badges

Compact but readable tables

Avoid:

Excessive gradients

Huge decorative illustrations

Heavy shadows

Excessive cards

Excessive animation

Neon colours

Generic SaaS purple

Random colours unrelated to the Health Provida palette

Visually dense hospital-management-system aesthetics

4. TYPOGRAPHY

Use Inter if available.

Fallback:

system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Hierarchy:

Page titles: 24–30px, semibold/bold

Section headings: 18–20px, semibold

Card headings: 15–17px, semibold

Body: 14–15px

Table text: 13–14px

Metadata: 12–13px

Maintain excellent readability.

5. APPLICATION SHELL

Create one reusable application shell.

Desktop

Left sidebar.

Top header.

Main content area.

Sidebar

Use a white/light background.

Navigation should use neutral slate text.

Active navigation:

Pale Health Provida blue background #EAF7FC

Health Provida blue text #009DDA

Blue icon

Small blue active indicator

Navigation:

Dashboard

Orders

Samples

Results

Tests & Pricing

Patients

Laboratory Profile

Notifications

Settings

Bottom:

Help & Support

Laboratory account

Use Lucide icons.

Do not use different icon styles.

6. TOP HEADER

Include:

Health Provida logo

Laboratory name

Verified badge

Search

Notification icon

User/profile menu

Example laboratory:

Meridian Diagnostic Centre

Verification:

Verified Laboratory

Use Health Provida green for the verification indicator.

7. DASHBOARD

Route:

/dashboard

Page heading:

Good morning, Meridian Diagnostic Centre

Subtitle:

Here's what's happening with your laboratory today.

Show today's date.

KPI CARDS

Create four clean KPI cards:

New Orders
18

Awaiting Collection
7

Tests In Progress
23

Results Ready
14

Use restrained brand accents.

Do not make all four cards different colours.

The primary KPI visual language should be white cards with subtle blue/green indicators.

Each KPI is clickable.

Examples:

New Orders → /orders?status=new

Awaiting Collection → /samples

Results Ready → /results

8. TODAY'S LABORATORY WORKLOAD

Create a professional operational table.

Columns:

Order ID

Patient

Test

Collection

Status

Time

Action

Example:

HP-LAB-1048
Adaeze Okafor
Full Blood Count
Home Collection
Awaiting Sample
09:30
View

Use Health Provida status colors.

Rows should have subtle hover states.

Clicking View opens the order details page.

9. RECENT ORDERS

Create a compact recent-orders section.

Show 5–6 orders.

Include:

Order ID

Patient

Test

Collection type

Status

Amount

Date

Include:

View all orders

10. RECENT ACTIVITY

Show a simple activity timeline.

Examples:

New laboratory order received

HP-LAB-1048 · 5 minutes ago

Sample collected

HP-LAB-1045 · 18 minutes ago

Result uploaded

HP-LAB-1042 · 31 minutes ago

Result delivered to patient

HP-LAB-1039 · 45 minutes ago

Use blue for informational events and green for completed events.

11. ORDERS

Route:

/orders

Page:

Laboratory Orders

Include:

Search

Date filter

Status filter

Test filter

Collection method filter

Tabs:

All

New

Awaiting Sample

Processing

Results Ready

Completed

Cancelled

Filters must actually work against local mock data.

Table:

Order ID

Patient

Test(s)

Collection

Ordered

Status

Amount

Action

Clicking a row or View Order opens:

/orders/:id

12. ORDER DETAILS

Create a polished operational detail page.

Header:

Order #HP-LAB-1048

Show status prominently.

Patient

Name

Patient ID

Age

Gender

Phone

Payer type

ORDERED TESTS

Example:

Full Blood Count — ₦8,000

Malaria Parasite Test — ₦3,000

Show total.

COLLECTION

Clearly distinguish:

Home Collection

or

Walk-in Collection

For home collection show:

Address

Date

Preferred time

Collection instructions

For walk-in show:

Branch

Arrival information

ORDER TIMELINE

Show:

Order Received
↓
Collection Scheduled
↓
Sample Collected
↓
Processing
↓
Result Ready
↓
Delivered

Highlight the current stage.

13. ORDER ACTIONS

Actions should change the local frontend state.

Possible actions:

Accept Order

Confirm Collection

Mark Sample Collected

Start Processing

Upload Result

Mark Result Ready

Notify Patient

Cancel Order

After an action:

Show a toast.

Examples:

Order accepted successfully

Sample marked as collected

Result published successfully

Do not send any real request.

Use local React state only.

14. SAMPLE MANAGEMENT

Route:

/samples

Page:

Sample Management

Tabs:

Awaiting Collection

Collected

Processing

Completed

Table:

Sample ID

Order ID

Patient

Test

Collection Type

Collection Time

Status

Action

Clicking a sample opens a detail drawer.

Allow sample status changes through local state.

15. RESULTS

Route:

/results

Page:

Laboratory Results

Tabs:

Pending

Processing

Ready for Review

Published

Table:

Order ID

Patient

Test

Sample ID

Status

Date

Action

Primary action:

Upload / Enter Result

Open a modal.

Fields:

Test

Patient

Sample ID

Result summary

Reference range

Laboratory comments

Status

Buttons:

Save Draft

Publish Result

Publishing should update the mock state.

16. RESULT REPORT

Route:

/results/:id

Create a polished diagnostic report preview.

Use a white report surface.

Header:

Laboratory Diagnostic Report

Include:

Health Provida logo

Laboratory name

Patient

Patient ID

Order ID

Sample ID

Collection date

Result date

Example:

FULL BLOOD COUNT

TestResultReference RangeFlagHaemoglobin13.8 g/dL12–16NormalWBC6.2 ×10⁹/L4–11NormalPlatelets245 ×10⁹/L150–450Normal

Normal values should use Health Provida green subtly.

Include:

Laboratory comment

Verification area

Medical disclaimer

Actions:

Download PDF

Print

Publish Result

For this prototype, PDF download may simply display:

"Report prepared for download"

No real document infrastructure is required.

17. TESTS & PRICING

Route:

/tests

Page:

Tests & Pricing

Use sample tests based on the PRD:

Malaria RDT

Malaria PCR

Full Blood Count

Lipid Profile

Blood Glucose

Urinalysis

Widal Test

The PRD provides example baseline prices of approximately ₦3,000 for Malaria RDT and ₦8,000 for Full Blood Count. Treat these as prototype sample prices, not current market/tariff claims.

Table:

Test Name

Category

Laboratory Price

Health Provida Price

Home Collection

Status

Action

Buttons:

Add Test

Edit

Activate / Deactivate

Use a reusable modal.

18. PATIENTS

Route:

/patients

Create a simple patient directory.

Table:

Patient

Patient ID

Last Test

Last Order

Collection

Status

Action

Clicking a patient opens a drawer.

Show:

Basic patient information

Recent orders

Recent results

Do not build a full EMR.

19. LABORATORY PROFILE

Route:

/profile

Create:

Laboratory Information

Laboratory name

Registration information

Phone

Email

Address

Operating hours

Verification

Show:

Verified Laboratory

Use the Health Provida green verification style.

Services

Toggles:

Walk-in Testing

Home Sample Collection

Digital Results

Same-Day Results

Branches

Show one or two fictional branch locations.

All interactions are local state.

20. NOTIFICATIONS

Route:

/notifications

Show:

New laboratory order

Home collection scheduled

Sample collected

Result awaiting review

Result successfully delivered

Test price updated

Unread notifications should have a subtle pale blue background.

Allow:

Mark as Read

Mark all as read

Use local state.

21. SETTINGS

Route:

/settings

Keep this intentionally lightweight.

Sections:

Account

Notification Preferences

Laboratory Preferences

Staff Access

Security

Do not build real authentication or permissions.

22. MOCK DATA

Keep datasets deliberately small to save implementation complexity.

Use approximately:

10 orders

8 patients

8 tests

6 samples

6 notifications

Use fictional Nigerian data.

Example patients:

Adaeze Okafor

Chinedu Eze

Fatima Bello

Daniel Adeyemi

Amaka Nwosu

Ibrahim Musa

Use NGN.

All data should be stored in simple frontend mock data structures.

23. RESPONSIVE DESIGN

Desktop is the primary experience.

Also support:

Tablet

Mobile

Mobile:

Sidebar becomes drawer

Tables become cards where necessary

Filters collapse

KPI cards stack

Modals become bottom sheets/full-screen dialogs where appropriate

Do not simply shrink desktop layouts.

24. COMPONENT REUSE

Create only the reusable components actually needed.

Examples:

AppShell

Sidebar

Header

KPI Card

Status Badge

Data Table

Filter Bar

Modal

Drawer

Toast

Confirmation Dialog

Empty State

Timeline

Reuse these components across pages.

Do not create unnecessary component complexity.

25. INTERACTION REQUIREMENTS

The prototype must feel genuinely clickable.

Implement:

Navigation

Every sidebar item works.

Search

Filters mock records.

Filters

Status/test/collection filters work.

Tabs

Tabs change displayed records.

Order workflow

Status changes visibly propagate through the interface.

Result workflow

Draft → Review → Published.

Notifications

Read/unread state changes.

Test catalogue

Add/edit/activate actions work locally.

Modals

Open and close properly.

Toasts

Every meaningful action provides feedback.

26. ACCESSIBILITY

Use:

Strong contrast

Clear labels

Keyboard-friendly controls

Visible focus states

Accessible buttons

Form labels

Status text in addition to status colours

Never communicate status using colour alone.

27. EMPTY & ERROR STATES

Create polished states for:

No orders found

No samples awaiting collection

No results awaiting review

No notifications

No matching patients

Include simple helpful actions where appropriate.

28. IMPORTANT VISUAL PRIORITIES

Spend the most design effort on these six screens:

1. Dashboard

The first impression.

2. Orders

The core operational workflow.

3. Order Details

The central laboratory order experience.

4. Results

The result management workflow.

5. Result Detail

The polished diagnostic report experience.

6. Tests & Pricing

The laboratory catalogue/business workflow.

Secondary pages can be simpler.

29. HEALTH PROVIDA DESIGN RULE

Throughout the application, maintain this visual hierarchy:

BLUE = interaction / technology

GREEN = health / success / completion

TEAL / BLUE-GREEN GRADIENT = brand expression

SLATE + WHITE = professional healthcare workspace

The interface should feel unmistakably Health Provida without becoming visually saturated.

30. FINAL PROTOTYPE FLOW

The completed application should demonstrate this complete journey:

Incoming Laboratory Order

↓

Order Accepted

↓

Collection Scheduled

↓

Sample Collected

↓

Processing

↓

Result Entered

↓

Result Published

↓

Patient Notified

↓

Result Delivered

All of this should work using local frontend state only.

No backend is required.

31. LOVABLE CREDIT OPTIMIZATION

This requirement is critical.

Build the application as one focused frontend prototype.

Do not spend credits on:

Backend

Database

Authentication

APIs

Payments

EMR integrations

File storage

Complex role management

Advanced analytics

Real PDF generation

Real notifications

External services

Use small mock datasets.

Reuse components.

Avoid unnecessary dependencies.

Avoid complex animations.

Avoid unnecessary pages.

Do not build features simply because they might exist in a production version.

If a feature cannot be demonstrated meaningfully in the prototype, use a lightweight UI placeholder instead.

The objective is a high-fidelity, fully clickable Health Provida Diagnostic Lab Portal — not a production backend.

32. STARTING EXPERIENCE

When the application loads, open:

/dashboard

Show the Meridian Diagnostic Centre laboratory dashboard populated with realistic mock activity.

The first screen should immediately communicate:

Health Provida + Diagnostic Laboratory + Today's Operational Activity

The final result should look polished enough to present directly to product stakeholders.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://laboratory-healthprovida.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8d3b89b-9122-4716-8466-5e6d44a85364).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
