export function articleJsonLd({ headline, description, url, datePublished, dateModified, authorName, imageUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: { "@type": "Organization", name: authorName || 'StrangePrompt' },
    publisher: { "@type": "Organization", name: authorName || 'StrangePrompt' },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: datePublished || new Date().toISOString().split('T')[0],
    dateModified: dateModified || new Date().toISOString().split('T')[0],
    image: imageUrl || undefined,
  }
}

export function breadcrumbJsonLd(items = []) {
  // items: [{ position: 1, name: 'Home', item: 'https://...' }, ...]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it) => ({
      "@type": "ListItem",
      position: it.position,
      name: it.name,
      item: it.item,
    })),
  }
}

export function faqJsonLd(faqItems = []) {
  // faqItems: [{question: '', answer: ''}, ...]
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  }
}
