import React from "react";

type SchemaMarkupProps = {
  schemaType: "WebSite" | "Organization" | "FAQPage" | "Course" | "Dataset" | "BreadcrumbList" | "Article" | "EducationalOrganization" | "Service";
  data: Record<string, any>;
};

export const SchemaMarkup = ({ schemaType, data }: SchemaMarkupProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export const BaseSchema = () => {
  // Common schemas that should be on every page (WebSite, Organization, SearchAction)
  const websiteData = {
    name: "BTech LEET",
    url: "https://btechleet.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://btechleet.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationData = {
    name: "BTech LEET",
    url: "https://btechleet.com",
    logo: "https://btechleet.com/logo.png",
    sameAs: [
      "https://www.facebook.com/btechleet",
      "https://www.twitter.com/btechleet",
      "https://www.linkedin.com/company/btechleet",
      "https://www.youtube.com/btechleet",
    ],
  };

  return (
    <>
      <SchemaMarkup schemaType="WebSite" data={websiteData} />
      <SchemaMarkup schemaType="Organization" data={organizationData} />
    </>
  );
};
