import type { Metadata } from 'next'

interface BlogPostMetadataParams {
  title: string
  description: string
  image?: string | null
  publishedAt?: Date | null
  author?: string | null
  tags?: string[]
  slug?: string
  categorySlug?: string
}

/**
 * Genera metadata optimizados para posts del blog
 */
export function generateBlogPostMetadata({
  title,
  description,
  image,
  publishedAt,
  author,
  tags,
  slug,
  categorySlug,
}: BlogPostMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  const defaultImage = `${baseUrl}/og-image.jpg` // Imagen por defecto
  
  // Construir URL canónica si tenemos slug y categoría
  const canonicalUrl = slug && categorySlug 
    ? `${baseUrl}/blog/${categorySlug}/${slug}`
    : undefined
  
  return {
    title: `${title} | Gabi Zimmer`,
    description,
    keywords: tags?.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'Gabi Zimmer' }],
    openGraph: {
      title,
      description,
      type: 'article',
      images: image ? [{ 
        url: image.startsWith('http') ? image : `${baseUrl}${image}`, 
        width: 1200, 
        height: 630,
        alt: title 
      }] : [{
        url: defaultImage,
        width: 1200,
        height: 630,
        alt: 'Gabi Zimmer - Experta en Vinos'
      }],
      publishedTime: publishedAt?.toISOString(),
      authors: author ? [author] : ['Gabi Zimmer'],
      siteName: 'Gabi Zimmer',
      locale: 'es_UY',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [defaultImage],
      creator: '@gabizimmer',
      site: '@gabizimmer',
    },
    alternates: canonicalUrl ? {
      canonical: canonicalUrl,
    } : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Genera metadata para páginas de categoría
 */
export function generateCategoryMetadata({
  name,
  description,
  slug,
}: {
  name: string
  description?: string | null
  slug: string
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  const pageDescription = description || `Artículos sobre ${name} por Gabi Zimmer, experta en vinos uruguayos`
  
  return {
    title: `${name} | Blog de Gabi Zimmer`,
    description: pageDescription,
    openGraph: {
      title: `${name} - Blog de Gabi Zimmer`,
      description: pageDescription,
      type: 'website',
      url: `${baseUrl}/blog/categoria/${slug}`,
      siteName: 'Gabi Zimmer',
      locale: 'es_UY',
    },
    twitter: {
      card: 'summary',
      title: `${name} - Gabi Zimmer`,
      description: pageDescription,
      creator: '@gabizimmer',
      site: '@gabizimmer',
    },
    alternates: {
      canonical: `${baseUrl}/blog/categoria/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Genera JSON-LD estructurado para posts
 */
export function generateArticleJsonLd({
  title,
  description,
  image,
  publishedAt,
  modifiedAt,
  author,
  slug,
  categorySlug,
}: {
  title: string
  description: string
  image?: string | null
  publishedAt?: Date | null
  modifiedAt?: Date
  author?: string | null
  slug: string
  categorySlug: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  const url = `${baseUrl}/blog/${categorySlug}/${slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: publishedAt?.toISOString(),
    dateModified: modifiedAt?.toISOString() || publishedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: author || 'Gabi Zimmer',
      url: `${baseUrl}/sobre-mi`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Gabi Zimmer',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
  }
}

/**
 * Genera breadcrumbs JSON-LD
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url?: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    })),
  }
}

/**
 * Genera metadata para la página principal del blog
 */
export function generateBlogIndexMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gabizimmer.com'
  
  return {
    title: 'Blog | Gabi Zimmer - Experta en Vinos Uruguayos',
    description: 'Artículos sobre vinos, gastronomía, maridajes y cultura vitivinícola uruguaya por Gabi Zimmer',
    keywords: 'vinos uruguayos, tannat, maridaje, gastronomía, cultura del vino, sommelier uruguay',
    openGraph: {
      title: 'Blog de Gabi Zimmer - Vinos y Gastronomía',
      description: 'Descubre el mundo del vino uruguayo a través de artículos, catas y experiencias',
      type: 'website',
      url: `${baseUrl}/blog`,
      images: [{
        url: `${baseUrl}/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: 'Blog de Gabi Zimmer'
      }],
      siteName: 'Gabi Zimmer',
      locale: 'es_UY',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog de Gabi Zimmer',
      description: 'Artículos sobre vinos y gastronomía uruguaya',
      images: [`${baseUrl}/og-blog.jpg`],
      creator: '@gabizimmer',
      site: '@gabizimmer',
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
      types: {
        'application/rss+xml': `${baseUrl}/blog/feed.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}