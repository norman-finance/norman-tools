import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools.norman.finance'
  
  // Define all your pages
  const pages = [
    {
      url: '',
      priority: 1.0,
    },
    {
      url: '/erechnung',
      priority: 0.9,
    },
    {
      url: '/finanzamt-brief',
      priority: 0.9,
    },
  ]

  // Generate sitemap entries for each page
  const sitemapEntries: MetadataRoute.Sitemap = []

  pages.forEach(page => {
    // Add English version
    sitemapEntries.push({
      url: `${baseUrl}${page.url}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page.priority,
      alternates: {
        languages: {
          en: `${baseUrl}${page.url}`,
          de: `${baseUrl}${page.url}${page.url ? '?' : '?'}ui_lang=de`,
        },
      },
    })

    // Add German version as a separate entry
    sitemapEntries.push({
      url: `${baseUrl}${page.url}${page.url ? '?' : '?'}ui_lang=de`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page.priority * 0.9, // Slightly lower priority for translated versions
      alternates: {
        languages: {
          en: `${baseUrl}${page.url}`,
          de: `${baseUrl}${page.url}${page.url ? '?' : '?'}ui_lang=de`,
        },
      },
    })
  })

  return sitemapEntries
} 