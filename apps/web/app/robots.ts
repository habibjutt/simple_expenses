import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/signup",
          "/forgot-password",
          "/features",
          "/features/",
          "/contact",
          "/privacy",
          "/terms",
          "/request-feature",
        ],
        disallow: [
          "/dashboard",
          "/transactions",
          "/spending-limits",
          "/goals",
          "/settings",
          "/reports",
          "/categories",
          "/manage-accounts",
          "/manage-cards",
          "/billing",
          "/onboarding",
          "/bank-account/",
          "/credit-card/",
          "/invoice/",
          "/admin/",
          "/api/",
          "/api-docs/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
