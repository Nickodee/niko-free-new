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
    category?: string;
    interests?: string[];
    price?: number;
    organizer?: string;
  };
  partner?: {
    name?: string;
    description?: string;
    image?: string;
    category?: string;
    location?: string;
  };
  category?: {
    name?: string;
    description?: string;
    eventCount?: number;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export default function SEO({
  title = 'Niko Free - Discover Amazing Events in Kenya',
  description = 'Find and attend the best events happening in Kenya. From concerts to conferences, discover experiences that matter to you. Book tickets online with ease.',
  keywords = 'events kenya, tickets kenya, event booking, concerts kenya, conferences kenya, workshops kenya, festivals kenya, nairobi events, mombasa events, event management, online tickets, event discovery, kenya events, niko free',
  image = 'https://niko-free.com/src/images/Niko%20Free%20Logo.png',
  url = 'https://niko-free.com',
  type = 'website',
  event,
  partner,
  category,
  article
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
    updateMetaTag('geo.region', 'KE');
    updateMetaTag('geo.placename', 'Kenya');

    // Open Graph / Facebook
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Niko Free', true);
    updateMetaTag('og:locale', 'en_KE', true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);

    // Article specific Open Graph tags
    if (article) {
      if (article.publishedTime) updateMetaTag('article:published_time', article.publishedTime, true);
      if (article.modifiedTime) updateMetaTag('article:modified_time', article.modifiedTime, true);
      if (article.author) updateMetaTag('article:author', article.author, true);
      if (article.tags) {
        article.tags.forEach(tag => {
          updateMetaTag('article:tag', tag, true);
        });
      }
    }

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', url);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@NikoFree');
    updateMetaTag('twitter:creator', '@NikoFree');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add structured data based on content type
    if (event) {
      // Event Schema
      const eventSchema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name || title,
        description: event.description || description,
        startDate: event.startDate,
        endDate: event.endDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: event.location || 'Kenya',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'KE',
            addressLocality: event.location || 'Kenya'
          }
        },
        image: [event.image || image],
        organizer: {
          '@type': 'Organization',
          name: event.organizer || 'Niko Free',
          url: 'https://niko-free.com'
        },
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: 'KES',
          price: event.price || '0',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString()
        }
      };

      // Add category if available
      if (event.category) {
        (eventSchema as any).category = event.category;
      }

      // Add keywords/interests if available
      if (event.interests && event.interests.length > 0) {
        (eventSchema as any).keywords = event.interests.join(', ');
      }

      const eventScript = document.createElement('script');
      eventScript.setAttribute('type', 'application/ld+json');
      eventScript.textContent = JSON.stringify(eventSchema);
      document.head.appendChild(eventScript);

    } else if (partner) {
      // Local Business Schema for Partners
      const partnerSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: partner.name || title,
        description: partner.description || description,
        image: partner.image || image,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'KE',
          addressLocality: partner.location || 'Kenya'
        },
        url: url,
        priceRange: '$$',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '0'
        }
      };

      if (partner.category) {
        (partnerSchema as any).category = partner.category;
      }

      const partnerScript = document.createElement('script');
      partnerScript.setAttribute('type', 'application/ld+json');
      partnerScript.textContent = JSON.stringify(partnerSchema);
      document.head.appendChild(partnerScript);

    } else if (category) {
      // ItemList Schema for Category Pages
      const categorySchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: category.name || title,
        description: category.description || description,
        numberOfItems: category.eventCount || 0,
        url: url,
        itemListElement: []
      };

      const categoryScript = document.createElement('script');
      categoryScript.setAttribute('type', 'application/ld+json');
      categoryScript.textContent = JSON.stringify(categorySchema);
      document.head.appendChild(categoryScript);

    } else {
      // Default WebSite/Organization Schema
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Niko Free',
        url: 'https://niko-free.com',
        description: description,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://niko-free.com/all-events?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      };

      const organizationSchema = {
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
          availableLanguage: ['English', 'Swahili']
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'KE'
        }
      };

      const websiteScript = document.createElement('script');
      websiteScript.setAttribute('type', 'application/ld+json');
      websiteScript.textContent = JSON.stringify(websiteSchema);
      document.head.appendChild(websiteScript);

      const orgScript = document.createElement('script');
      orgScript.setAttribute('type', 'application/ld+json');
      orgScript.textContent = JSON.stringify(organizationSchema);
      document.head.appendChild(orgScript);
    }

    // Breadcrumb Schema (if URL has multiple segments)
    const pathSegments = new URL(url).pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const breadcrumbList: any = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://niko-free.com'
          }
        ]
      };

      pathSegments.forEach((segment, index) => {
        const segmentUrl = `https://niko-free.com/${pathSegments.slice(0, index + 1).join('/')}`;
        breadcrumbList.itemListElement.push({
          '@type': 'ListItem',
          position: index + 2,
          name: segment.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          item: segmentUrl
        });
      });

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('type', 'application/ld+json');
      breadcrumbScript.textContent = JSON.stringify(breadcrumbList);
      document.head.appendChild(breadcrumbScript);
    }
  }, [title, description, keywords, image, url, type, event, partner, category, article]);

  return null;
}

