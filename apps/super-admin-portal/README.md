# Remix of Remix of Health Provida Control Center

Health Provida — Super Admin Portal

Frontend-First Functional Prototype

You are an expert senior product designer, UX architect and frontend engineer building a production-quality healthcare SaaS platform.

Build the Health Provida Super Admin Portal as a highly polished, functional frontend prototype based strictly on the Health Provida Product Requirements Document (PRD v2.0).

Health Provida is a multi-sided healthcare ecosystem connecting patients, hospitals/clinics, HMOs and diagnostic laboratories. The Super Admin Portal is the internal Health Provida control centre for platform governance, provider quality, tariff governance, monetization and ecosystem monitoring.

The PRD explicitly defines the Super Admin Portal around:

Ecosystem master overview

Platform operational metrics

Tariff and benchmarking management

Promoted provider bidding

Sponsored placement management

HMO SaaS tier management

Hospital quality auditing

Provider verification

Platform integrity and governance

The product is targeting Nigeria and Sub-Saharan Africa, with NGN as the primary currency.

1. VERY IMPORTANT: FRONTEND ONLY

This is a frontend-first functional prototype.

DO NOT build:

Real backend

Database

Real authentication server

Real API integrations

Real EMR integration

Real HL7/FHIR integration

Real payment gateway

Real AI API

Real HMO API

Real notification infrastructure

Instead, create a realistic frontend application using:

Mock data

Local state

Local/mock service functions

Simulated loading states

Simulated success/error states

Modal interactions

Drawers

Forms

Tables

Filters

Search

Pagination

Toast notifications

Status changes

Charts

Confirmation dialogs

However, structure the frontend cleanly so that the mock service layer can later be replaced with real REST/API services without rewriting the UI.

Use a clear separation between:

UI components

Page components

Mock data

Frontend service/repository functions

Types/interfaces

Do not hard-code business logic directly into visual components where it can reasonably be abstracted.

2. DESIGN DIRECTION

The interface should feel like a premium enterprise healthcare operations platform, not a generic admin template.

Design characteristics:

Clean

Sophisticated

Trustworthy

Modern

Data-dense but not cluttered

Professional healthcare aesthetic

Strong visual hierarchy

Excellent whitespace

Subtle borders

Soft card elevation

Rounded but not excessively playful components

Highly readable tables

Clear status indicators

Excellent responsive behaviour

Use the Health Provida visual identity from the supplied branding assets.

Primary visual language should use:

Health Provida green

Health Provida blue

Neutral whites

Soft grey backgrounds

Dark charcoal text

Avoid excessive gradients.

Avoid excessive use of glassmorphism.

Avoid oversized dashboard cards.

The result should look credible enough to present to healthcare executives.

3. APPLICATION SHELL

Create a persistent application shell.

Left Sidebar

Health Provida logo at the top.

Navigation:

Overview

Dashboard

Provider Governance

Hospitals & Clinics

Verification Queue

Quality Audit

Pricing & Tariffs

Tariff Management

Regional Benchmarks

Monetization

Promoted Providers

Sponsored Listings

Bidding Management

HMO SaaS

HMO Accounts

SaaS Plans

Feature Controls

Platform

Transactions

Encounters

Platform Analytics

System Activity

Administration

Admin Users

Settings

The active navigation item must be clearly highlighted.

Sidebar should collapse elegantly on smaller screens.

4. TOP HEADER

Create a professional top navigation bar containing:

Page title

Breadcrumb

Global search

Notifications

Admin profile/avatar

Role indicator: "Super Admin"

Profile dropdown

Notification examples:

New hospital verification submitted

Tariff update pending approval

Sponsored listing requires review

HMO subscription status changed

Provider quality audit submitted

These can be mock notifications.

5. SUPER ADMIN DASHBOARD

Create a highly useful ecosystem-level dashboard.

The dashboard should NOT look like a hospital dashboard.

It should answer:

"What is happening across the entire Health Provida platform?"

KPI cards

Display:

Active Bookings

Live Hospital Encounters

Verified Providers

Pending Verifications

HMO Authorizations

Authorization Latency

Gross Transaction Value

Platform Revenue

Each card should have:

Current value

Trend/change

Relevant icon

Small contextual description

Use realistic Nigerian healthcare data and NGN amounts.

Do not use meaningless placeholder numbers such as "1234".

6. ECOSYSTEM ACTIVITY

Create a platform activity section.

Show recent events such as:

Hospital submitted for verification

Provider profile approved

Tariff benchmark updated

Sponsored placement approved

HMO upgraded to Premium

Authorization completed

Hospital photograph rejected

Each activity should have:

Timestamp

Entity

Action

Status

7. LIVE ENCOUNTERS

Create a live encounter monitoring table.

Columns:

Hospital

Patient reference

Encounter type

Payer

Check-in time

Wait time

Status

Action

Payer types:

DIRECT PAY

HMO COVERED

Statuses:

Waiting

In Consultation

Completed

High Wait Time

Highlight high wait-time encounters.

The PRD specifically describes platform-level monitoring of live hospital encounters and HMO authorization latency.

Use simulated data only.

8. PROVIDER GOVERNANCE

Create a Hospitals & Clinics management page.

Table columns:

Provider

Location

Provider Type

Verification

HMO Network

Visibility

Popularity Score

Status

Date Added

Actions

Filters:

Region

State

Verification Status

Provider Type

HMO Network

Visibility

Date

Search must work against mock data.

Actions:

View

Review

Approve

Reject

Suspend

Edit

9. PROVIDER DETAIL PAGE

Create a detailed provider profile.

Sections:

Overview

Hospital name

Logo/photo

Location

Contact

Specialties

Provider status

Verification status

HMO network status

Facility Photos

Show:

Exterior

Reception

Consultation room

Each photo should show:

Approved

Pending

Rejected

Provider Quality

Show:

Average rating

Patient reviews

Active bookings

Completed encounters

Popularity score

The PRD defines provider popularity using:

Popularity Score =
(Active EMR Bookings × 0.4)
+
(Patient Encounters Timestamped × 0.3)
+
(Average Review Score × 0.3)

Represent this clearly in the UI.

HMO Network Mapping

Show:

Matched HMO networks

Pending matches

Silent Network status where applicable

Admin Actions

Approve Provider

Reject Provider

Request Changes

Suspend Provider

All actions should update local prototype state.

10. VERIFICATION QUEUE

Create a dedicated verification workflow.

Statuses:

Submitted

Under Review

Approved

Rejected

Changes Required

Create a review drawer/modal.

Admin should be able to:

Inspect provider information

Review photographs

Review facility information

Review HMO matching

Approve

Reject

Request changes

When an admin approves a provider:

Status changes to VERIFIED

Provider becomes eligible for public visibility

Toast notification appears

When rejected:

Require a rejection reason

Status changes to REJECTED

When requesting changes:

Require comments

Status changes to CHANGES REQUIRED

11. TARIFF MANAGEMENT

This is one of the most important modules.

Create a sophisticated tariff management interface.

The PRD describes the tariff repository as the central source for regional consultation and laboratory pricing standards.

Create tabs:

Consultation

Laboratory

Procedures

Regional Benchmarks

Filters:

Region

State

Category

Service

Status

Example regions:

South-West

South-South

South-East

North-Central

North-West

North-East

Example table:

Service | Category | Region | Benchmark | Min | Max | Status | Updated

Use NGN.

Include:

Add Tariff

Fields:

Service Name

Service Code

Category

Region

State

Benchmark Price

Minimum Price

Maximum Price

Status

Effective Date

Include validation.

Include edit functionality.

Include confirmation before saving.

12. TARIFF DETAIL

Create a tariff detail drawer/page showing:

Service name

Service code

Category

Regional benchmark

Historical values

Last updated

Updated by

Current status

Add a simple price history chart.

Also show:

"Used by"

No-show calculations

Provider tariff comparisons

Laboratory pricing

Platform benchmarking

Do not implement actual calculations yet; simulate them.

13. PROMOTED PROVIDERS

Create a monetization dashboard for sponsored provider visibility.

The PRD specifies that providers can purchase Featured Top Placement and that sponsored listings should be explicitly labelled "Promoted".

Create:

Sponsored Listings

Columns:

Provider

Specialty

Location

Campaign

Placement

Budget

Bid

Start Date

End Date

Status

Statuses:

Pending

Active

Paused

Expired

Rejected

14. BIDDING MANAGEMENT

Create a bidding interface.

Allow Super Admin to configure:

Geographic location

Specialty/category

Placement position

Reserve price

CPC/monthly sponsorship model

Campaign duration

Create a simulated bidding table.

Actions:

Approve

Reject

Pause

Resume

Show "Promoted" labels in provider placement previews.

15. HMO SAAS MANAGEMENT

Create HMO management.

The PRD defines:

FREE:

Basic network upload

Provider setup

PREMIUM:

Live encounter dashboards

Automated AI authorizations

Member review intervention suite

Create:

HMO Accounts

Columns:

HMO

Members

Network Providers

Plan

Status

Monthly Revenue

Renewal

Actions

SaaS Plans

Show:

FREE

Features:

Network upload

Provider setup

PREMIUM

Features:

Live encounter dashboard

AI authorization

Intervention alerts

Member review tools

Create feature toggles.

The interface should visually communicate what features are enabled for each plan.

16. PLATFORM ANALYTICS

Create an analytics page.

Charts:

Bookings over time

Provider growth

HMO encounters

Authorization latency

Transaction volume

Revenue by channel

Provider verification volume

Sponsored listing revenue

Revenue channels should reflect the PRD:

Consultation commission

Laboratory margin

Promoted provider placement

HMO SaaS

No-show-related revenue

Use realistic mock data.

17. SYSTEM ACTIVITY / AUDIT LOG

Create an enterprise audit log.

Columns:

Timestamp

Admin

Action

Entity

Entity ID

Previous Status

New Status

IP/device placeholder

Details

Include filters and search.

This is a frontend simulation only.

18. UX REQUIREMENTS

Every important action must have a meaningful UI response.

Examples:

Approve → confirmation → loading → success toast → status changes

Reject → rejection modal → reason required → status changes

Save → loading → success

Delete → confirmation

Search → filtered results

Filter → table updates

Pagination → works locally

Modal → close/cancel/save

Drawer → open/close

Tabs → state changes

Do not create dead buttons.

Every visible button should either work in the prototype or be intentionally disabled with an explanation.

19. EMPTY, LOADING AND ERROR STATES

Create realistic states for:

Empty verification queue

No sponsored listings

No tariff results

Loading provider data

Failed simulated request

No HMO accounts

No encounters

Do not leave blank white spaces.

20. RESPONSIVENESS

Desktop is the primary target.

Also support:

Laptop

Tablet

Mobile

Tables should become horizontally scrollable or transform into useful mobile cards.

The sidebar should collapse.

Do not simply shrink desktop UI.

21. MOCK DATA ARCHITECTURE

Create realistic typed mock data for:

Providers

Provider photos

Tariffs

HMO accounts

Sponsored campaigns

Encounters

Transactions

Admin activity

Notifications

Analytics

Create frontend service functions such as:

getProviders()
getProviderById()
approveProvider()
rejectProvider()
getTariffs()
updateTariff()
getHmoAccounts()
getSponsoredListings()
getEncounters()
getTransactions()

These are mock functions for now.

Design them so that they can later be replaced by API calls.

22. IMPORTANT FUTURE-BACKEND RULE

Do not couple the UI to mock data implementation.

Use interfaces/types that make future API integration straightforward.

For example:

Provider
Tariff
HMO
Encounter
Transaction
Campaign
AdminAction

The future backend should be able to replace the mock repository without requiring a redesign of the page components.

23. QUALITY BAR

The prototype should feel like a real product demo.

Do NOT produce:

Generic SaaS dashboard

Random cards

Placeholder lorem ipsum

Broken interactions

Excessive gradients

Excessive animations

Unnecessary pages

Fake backend integrations

Developer-facing UI

Prioritize:

Information architecture

Healthcare workflows

Operational clarity

Enterprise UX

Consistency

Accessibility

Realistic Nigerian healthcare context

Maintainable frontend architecture

Build the complete frontend experience with polished interactions and realistic mock data. 

Take brand color from the logo

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/060a2d45-b09d-4fab-b2f3-acb5c2aa4c09).

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
