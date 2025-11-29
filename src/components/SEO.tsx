import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  event?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
    image?: string;
  };
}

export default function SEO({
  title = 'Niko Free - Discover Amazing Events in Kenya',
  description = 'Find and attend the best events happening in Kenya. From concerts to conferences, discover experiences that matter to you. Book tickets online with ease.',
  keywords = 'events kenya, tickets kenya, event booking, concerts kenya, conferences kenya, workshops kenya, festivals kenya, nairobi events, mombasa events, event management, online tickets, event discovery, kenya events, niko free',
  image = 'https://niko-free.com/src/images/Niko%20Free%20Logo.png',
  url = 'https://niko-free.com',
  type = 'website',
  event
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Niko Free');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'English');
    updateMetaTag('revisit-after', '7 days');
    updateMetaTag('distribution', 'global');
    updateMetaTag('rating', 'general');

    // Open Graph / Facebook
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Niko Free', true);
    updateMetaTag('og:locale', 'en_KE', true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', url, true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add structured data for events if provided
    if (event) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name || title,
        description: event.description || description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: {
          '@type': 'Place',
          name: event.location || 'Kenya',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'KE'
          }
        },
        image: event.image || image,
        organizer: {
          '@type': 'Organization',
          name: 'Niko Free',
          url: 'https://niko-free.com'
        },
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: 'KES'
        }
      };

      script.textContent = JSON.stringify(structuredData);
    } else {
      // Default organization structured data
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Niko Free',
        url: 'https://niko-free.com',
        logo: 'https://niko-free.com/src/images/Niko%20Free%20Logo.png',
        description: description,
        sameAs: [
          // Add social media links when available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          areaServed: 'KE',
          availableLanguage: 'English'
        }
      };

      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, image, url, type, event]);

  return null;
}

