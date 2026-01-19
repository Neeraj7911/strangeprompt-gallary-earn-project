import React from 'react'

// Lightweight SEO component: use in page components to inject meta + JSON-LD
export default function SEO({ title, description, url, image, jsonLd }) {
  const metaTitle = title || 'StrangePrompt — Copy-Paste AI Prompts for Instagram'
  const metaDescription = description || 'Ready-to-use AI prompts for Instagram. Copy, paste, and generate viral photos with Gemini, ChatGPT, Midjourney.'
  const metaUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const metaImage = image || ''

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content={metaImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}

      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </>
  )
}
