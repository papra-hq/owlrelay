---
layout: ../layouts/MdPage.astro
title: Privacy Policy
description: Privacy Policy for OwlRelay, the email-to-webhook forwarding service.
---

_Last update: 19/02/2025_

## 1. Data Controller
The data controller for the hosted service at [app.owlrelay.email](https://app.owlrelay.email) is **Corentin Thomasset** (French micro-entrepreneur), the legal contact address is **legal@owlrelay.email**.

## 2. Data We Collect
### a. User Account Data
- **Required:** Email address, hashed password, OAuth provider (GitHub, Google, etc.).
- **Optional:** Billing details (Pro/Enterprise plans) processed by Stripe.

### b. Email Processing Data
When you use OwlRelay to forward emails to webhooks:
- **Stored Temporarily:** Email metadata (sender, recipient, subject, timestamp).
- **Not Stored:** Email body content or attachments (forwarded directly to your webhook and immediately deleted from our systems).

### c. Logs & Analytics
- **No Tracking:** We use PostHog for analytics, but we do not use cookies, third-party analytics, or track users across external websites.
- **No Personal Data:** We do not collect any personal or identifiable data from users.

## 3. How We Use Your Data
We process data to:
- Provide and maintain the Service (e.g., forwarding emails).
- Authenticate accounts and process payments (Pro/Enterprise).
- Investigate abuse or violations of our Terms of Service.

**Legal Basis:**
- Contractual necessity (GDPR Art. 6(1)(b)) for service delivery.
- Legitimate interest (GDPR Art. 6(1)(f)) for security and abuse prevention.

## 4. Data Sharing
We **never sell your data**. Limited sharing occurs with:
- **Stripe:** For payment processing ([Privacy Policy](https://stripe.com/privacy)).
- **Cloudflare:** Infrastructure providers ([Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/)).
- **Turso:** Database provider ([Turso DPA](https://turso.tech/privacy-policy/)).
- **PostHog:** Analytics provider ([PostHog Privacy Policy](https://posthog.com/privacy)).
- **Legal Obligations:** If required by French/EU authorities under applicable law.

## 5. Data Retention
- **Account Data:** Retained until account deletion with a 30 days grace period.
- **Email Metadata Logs:** 30 days (Free) / 90 days (Pro).
- **Billing Records:** 7 years (to comply with French tax laws).

## 6. Your Rights (GDPR)
You may request:
- Access to your personal data.
- Correction or deletion of inaccurate data.
- Export of your data in a portable format.
- Restriction of processing or objection.

**To exercise rights:** Email legal@owlrelay.email. We respond within 30 days.

## 7. Security
We implement reasonable measures to protect your data:
- Encryption in transit (HTTPS/TLS).
- Database isolation (Turso).
- Regular security reviews.

**Note:** You are responsible for securing your webhook endpoints and signing secrets.

## 8. International Transfers
Data is processed in the EU (Turso, Cloudflare) and the US (Stripe, GitHub). Transfers to the US rely on:
- GDPR adequacy decisions (e.g., EU-U.S. Data Privacy Framework).
- Standard Contractual Clauses (SCCs).

## 9. Self-Hosted Instances
This Privacy Policy **does not apply** to self-hosted instances of the AGPLv3-licensed OwlRelay software. Self-hosters are responsible for their own data compliance.

## 10. Changes to This Policy
Updates are communicated via email. Continued use after changes implies acceptance.

## 11. Contact
For privacy concerns or GDPR requests:
legal@owlrelay.email
