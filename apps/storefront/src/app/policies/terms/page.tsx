import type { Metadata } from 'next'
import { PolicyPage, type PolicySection } from '@/components/legal/PolicyPage'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Terms of Service — Treasure Trove',
  description:
    'The terms that govern your use of treasuretrove.in and any purchases you make from Treasure Trove.',
}

const LAST_UPDATED = '30 May 2026'

const INTRO =
  'These Terms of Service govern your use of treasuretrove.in and any purchases you make from Treasure Trove Atelier. By accessing the store or placing an order, you agree to these terms.'

const SECTIONS: PolicySection[] = [
  {
    heading: 'Acceptance of Terms',
    paragraphs: [
      'By using this website or placing an order, you confirm that you accept these terms and agree to comply with them. If you do not agree, please do not use the store.',
    ],
  },
  {
    heading: 'Eligibility',
    paragraphs: [
      'You must be at least 18 years old and able to enter into a binding contract to purchase from us.',
    ],
  },
  {
    heading: 'Products, Pricing & Availability',
    paragraphs: [
      'We describe and price our products as accurately as possible. Because our pieces are handcrafted, colours, grain, and finishes may vary slightly from the images shown. Prices are listed in Indian Rupees and may change without notice. We may limit or discontinue any product at any time.',
    ],
  },
  {
    heading: 'Orders & Payment',
    paragraphs: [
      'An order is an offer to buy. We accept it when we dispatch your item. We may refuse or cancel an order — for example, due to stock, a pricing error, or suspected fraud — and will refund any amount already paid. Payment must be completed through our approved payment partners before dispatch.',
    ],
  },
  {
    heading: 'Shipping & Delivery',
    paragraphs: [
      'We ship across India. Delivery timelines are estimates and may vary with location and courier. Risk of loss passes to you on delivery.',
    ],
  },
  {
    heading: 'Returns & Refunds',
    paragraphs: [
      'Eligible items may be returned within 7 days of delivery in their original condition and packaging. Made-to-order and customised pieces may be non-returnable. Approved refunds are issued to the original payment method.',
    ],
  },
  {
    heading: 'Intellectual Property',
    paragraphs: [
      'All content on this site — including text, images, logos, and designs — is owned by or licensed to Treasure Trove and is protected by law. You may not reproduce or use it without our written permission.',
    ],
  },
  {
    heading: 'Acceptable Use',
    paragraphs: [
      'You agree not to misuse the store, including by attempting to gain unauthorised access, disrupt the service, or use it for any unlawful purpose.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    paragraphs: [
      'To the extent permitted by law, Treasure Trove is not liable for indirect or consequential losses arising from your use of the store. Nothing in these terms excludes liability that cannot be excluded under applicable law.',
    ],
  },
  {
    heading: 'Governing Law',
    paragraphs: [
      'These terms are governed by the laws of India, and the courts of Bengaluru, Karnataka have exclusive jurisdiction over any disputes.',
    ],
  },
  {
    heading: 'Changes to These Terms',
    paragraphs: [
      'We may update these terms from time to time. The "Last updated" date above reflects the latest version; continued use of the store means you accept the updated terms.',
    ],
  },
  {
    heading: 'Contact Us',
    paragraphs: [
      'Questions about these terms? Email concierge@treasuretrove.in or write to No. 42, Heritage Mews, Whitefield Main Road, Bengaluru, Karnataka 560066.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <PolicyPage
      testId="terms-of-service-page"
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  )
}
