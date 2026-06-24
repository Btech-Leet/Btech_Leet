import React from "react";

type ArticleSchemaProps = {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
};

export const ArticleSchema = ({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
}: ArticleSchemaProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image || "https://btechleet.com/og-image.jpg",
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl && { url: `https://btechleet.com${authorUrl}` }),
    },
    publisher: {
      "@type": "Organization",
      name: "BTech LEET",
      logo: {
        "@type": "ImageObject",
        url: "https://btechleet.com/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
