import type { Metadata } from 'next'
import { PolicyPage, type PolicySection } from '@/components/legal/PolicyPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Privacy Policy — Treasure Trove',
  description:
    'How Treasure Trove collects, uses, and protects your personal information when you shop with us.',
}

const LAST_UPDATED = '30 May 2026'

const INTRO =
  'Treasure Trove Atelier respects your privacy. This policy explains what information we collect when you visit treasuretrove.in or buy from us, how we use it, and the choices you have.'

const SECTIONS: PolicySection[] = [
  {
    heading: 'Information We Collect',
    paragraphs: [
      'We collect information you provide directly — such as your name, email address, phone number, billing and shipping address, and order details — when you create an account, place an order, or contact us.',
      'We also collect limited technical information automatically, including your IP address, device and browser type, and pages visited, to operate and improve the store.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    bullets: [
      'Process and deliver your orders, and send you order updates',
      'Respond to your enquiries and provide customer support',
      'Send marketing communications where you have opted in',
      'Detect, prevent, and address fraud or security issues',
      'Comply with our legal, accounting, and tax obligations',
    ],
  },
  {
    heading: 'Sharing & Disclosure',
    paragraphs: [
      'We do not sell your personal information. We share it only with trusted service providers who help us run the store — such as payment gateways, logistics partners, and email providers — and only to the extent needed to perform their service. We may also disclose information where required by law.',
    ],
  },
  {
    heading: 'Cookies & Tracking',
    paragraphs: [
      'We use cookies and similar technologies to keep you signed in, remember your cart, and understand how the store is used. You can control cookies through your browser settings; disabling some cookies may affect site functionality.',
    ],
  },
  {
    heading: 'Data Security',
    paragraphs: [
      'We use industry-standard safeguards, including encrypted connections (SSL) and access controls, to protect your information. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: 'Your Rights',
    paragraphs: [
      'Subject to applicable law, you may request access to, correction of, or deletion of your personal information, and you may withdraw consent to marketing at any time. To exercise these rights, contact us using the details below.',
    ],
  },
  {
    heading: 'Data Retention',
    paragraphs: [
      'We retain your information for as long as your account is active or as needed to provide our services, and thereafter as required to meet legal, accounting, or reporting obligations.',
    ],
  },
  {
    heading: "Children's Privacy",
    paragraphs: [
      'Our store is intended for adults. We do not knowingly collect personal information from anyone under 18. If you believe a minor has provided us information, please contact us and we will delete it.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    paragraphs: [
      'We may update this policy from time to time. Material changes will be reflected by the "Last updated" date above, and where appropriate we will notify you.',
    ],
  },
  {
    heading: 'Contact Us',
    paragraphs: [
      'If you have questions about this policy or your personal information, email us at concierge@treasuretrove.in or write to No. 42, Heritage Mews, Whitefield Main Road, Bengaluru, Karnataka 560066.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      testId="privacy-policy-page"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  )
}
