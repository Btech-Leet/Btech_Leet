import React from "react";

type AuthorSchemaProps = {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
};

export const AuthorSchema = ({
  name,
  url,
  image,
  jobTitle,
  description,
  sameAs = [],
}: AuthorSchemaProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `https://btechleet.com${url}`,
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(description && { description }),
    worksFor: {
      "@type": "Organization",
      name: "BTech LEET",
    },
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
