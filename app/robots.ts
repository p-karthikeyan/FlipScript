import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Exclude internal APIs and user dashboard
    },
    sitemap: 'https://flipscript.app/sitemap.xml', // Update with actual URL if known
  }
}
