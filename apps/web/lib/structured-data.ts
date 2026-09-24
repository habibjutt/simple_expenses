import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  FOUNDER,
  OPERATOR_NAME,
  COMPANY_LINKEDIN,
} from "@/lib/seo";

/** Schema.org JSON-LD builders shared across public pages. */

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
    description: SITE_DESCRIPTION,
    email: "hello@fixpenses.com",
    sameAs: [COMPANY_LINKEDIN],
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      sameAs: [FOUNDER.linkedin],
    },
    parentOrganization: { "@type": "Organization", name: OPERATOR_NAME },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@fixpenses.com",
      availableLanguage: ["English"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-AE",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

// Keep in sync with the monthly prices shown in components/PricingSection.tsx.
const PLAN_OFFERS = [
  { name: "Starter", price: "0" },
  { name: "Pro", price: "9.99" },
  { name: "Premium", price: "29" },
];

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    image: LOGO_URL,
    publisher: { "@id": ORGANIZATION_ID },
    offers: PLAN_OFFERS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price,
      priceCurrency: "AED",
      url: `${SITE_URL}/pricing`,
    })),
  };
}

/** `items` are [name, path] pairs after Home, e.g. [["Features", "/features"]]. */
export function breadcrumbSchema(items: [name: string, path: string][]) {
  const all: [string, string][] = [["Home", ""], ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  };
}
