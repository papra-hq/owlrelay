---
layout: ../layouts/MdPage.astro
title: Terms of Service
description: Terms of Service for OwlRelay, the email-to-webhook forwarding service.
---

_Last update: 19/02/2025_

## 1. Company Information
OwlRelay (“Service”) is operated by **Corentin Thomasset**, a French micro-entrepreneur registered in France.
**Legal Contact:** legal@owlrelay.email

## 2. Acceptance of Terms
By using OwlRelay, you agree to these Terms. If you disagree, you must cease use immediately.

## 3. Service Description
OwlRelay provides email-to-webhook forwarding. Users create email addresses (using OwlRelay domains) linked to webhooks. Emails trigger webhooks with metadata (subject, sender, etc.). Attachments are **not stored**; only email execution logs (sender, subject) are retained temporarily (30 days for Free, 90 days for Pro).

## 4. User Obligations
### Prohibited Use:
- Sending illegal content, malware, phishing, or spam.
- Emails exceeding **25 MiB** (including headers/attachments).
- Violating GDPR, CAN-SPAM, or other applicable laws.

### Technical Requirements:
- Webhooks must respond within **10 seconds**. Retries occur once for HTTP codes: 408, 409, 429, 500, 502, 503, 504.

## 5. Account Termination
We may suspend/terminate accounts **immediately** for:
- Abuse, spam, or illegal activity.
- Security breaches (e.g., unauthorized access).
- Suspicious activity.
- Violating these Terms.

**No refunds** for Pro plans if terminated for abuse.

## 6. Payments & Refunds
- **Pro Plan:** Billed monthly, non-refundable. No prorated refunds for cancellations.
- **Enterprise:** Custom billing (negotiated individually).
- Failed payments may result in service suspension.

## 7. Liability & Warranties
- **No warranties**: Service is provided “as-is.”
- Liability is capped at **12 months of Pro Plan fees** paid by you.
- We are not liable for third-party outages (Cloudflare, Stripe, Turso, GitHub).

## 8. Privacy & Data
- Data processing complies with GDPR.
- Privacy Policy: [https://owlrelay.email/privacy](https://owlrelay.email/privacy).

## 9. Open Source
The OwlRelay software is licensed under the GNU Affero General Public License v3.0 (AGPLv3). You may access the source code at [github.com/papra-hq/owlrelay](https://github.com/papra-hq/owlrelay). Your use of the self-hostable software is governed by AGPLv3, while your use of the hosted service at app.owlrelay.email is governed by these Terms.

## 10. Modifications
We may update these Terms. Important changes are communicated via **email** and effective immediately upon notice.

## 11. Dispute Resolution
- Governed by French law.
- Disputes resolved exclusively in courts of **France**.

## 11. Enterprise Plans
Custom terms (SLAs, domains, support, instance isolation, etc.) are negotiated separately.
