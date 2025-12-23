# Enhanced Search API Documentation

## Overview
The AllEventsPage now supports comprehensive search functionality that allows users to search events by multiple fields including categories, location, tags, interests, and partner names.

## Frontend Implementation
The frontend sends the following parameters when a search query is entered:

```javascript
{
  search: "user search query",
  search_categories: true,
  search_location: true,
  search_tags: true,
  search_interests: true,
  search_partners: true,
  page: 1,
  per_page: 20
}
```

## Backend Requirements

### API Endpoint: `GET /api/events`

The backend should enhance the `search` parameter to perform a comprehensive search across multiple fields when the additional search flags are present.

### Search Fields

When `search` parameter is provided along with the search flags, the backend should search in the following fields:

1. **Event Title** (`events.title`)
   - Case-insensitive partial match
   - Example: "concert" matches "Summer Concert Series"

2. **Event Description** (`events.description`)
   - Case-insensitive partial match
   - Example: "networking" matches events with networking in description

3. **Category Name** (`categories.name`) - when `search_categories=true`
   - Case-insensitive partial match
   - Example: "tech" matches "Technology", "FinTech"

4. **Location Fields** - when `search_location=true`
   - `events.venue_name`
   - `events.venue_address`
   - `events.city`
   - `events.county`
   - Example: "Nairobi" matches events in Nairobi venues

5. **Tags** (`events.tags`) - when `search_tags=true`
   - Case-insensitive partial match in tags array/string
   - Example: "networking" matches events tagged with networking

6. **Interests** (`events.interests`) - when `search_interests=true`
   - Case-insensitive partial match in interests array/string
   - Example: "music" matches events with music interest

7. **Partner Name** (`partners.business_name` or `partners.name`) - when `search_partners=true`
   - Case-insensitive partial match
   - Example: "Safaricom" matches events organized by Safaricom

### SQL Implementation Example (PostgreSQL)

```sql
SELECT DISTINCT e.*
FROM events e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN partners p ON e.partner_id = p.id
WHERE e.status = 'approved'
  AND (
    -- Always search in title and description
    LOWER(e.title) LIKE LOWER('%' || :search || '%')
    OR LOWER(e.description) LIKE LOWER('%' || :search || '%')
    
    -- Search in category name if flag is true
    OR (:search_categories = true AND LOWER(c.name) LIKE LOWER('%' || :search || '%'))
    
    -- Search in location fields if flag is true
    OR (:search_location = true AND (
      LOWER(e.venue_name) LIKE LOWER('%' || :search || '%')
      OR LOWER(e.venue_address) LIKE LOWER('%' || :search || '%')
      OR LOWER(e.city) LIKE LOWER('%' || :search || '%')
      OR LOWER(e.county) LIKE LOWER('%' || :search || '%')
    ))
    
    -- Search in tags if flag is true (adjust based on your tag storage)
    OR (:search_tags = true AND LOWER(e.tags::text) LIKE LOWER('%' || :search || '%'))
    
    -- Search in interests if flag is true (adjust based on your interest storage)
    OR (:search_interests = true AND LOWER(e.interests::text) LIKE LOWER('%' || :search || '%'))
    
    -- Search in partner name if flag is true
    OR (:search_partners = true AND (
      LOWER(p.business_name) LIKE LOWER('%' || :search || '%')
      OR LOWER(p.name) LIKE LOWER('%' || :search || '%')
    ))
  )
ORDER BY e.start_date ASC
LIMIT :per_page
OFFSET (:page - 1) * :per_page;
```

### Python/Flask Implementation Example

```python
@app.route('/api/events', methods=['GET'])
def get_events():
    search_query = request.args.get('search', '').strip()
    search_categories = request.args.get('search_categories', 'false').lower() == 'true'
    search_location = request.args.get('search_location', 'false').lower() == 'true'
    search_tags = request.args.get('search_tags', 'false').lower() == 'true'
    search_interests = request.args.get('search_interests', 'false').lower() == 'true'
    search_partners = request.args.get('search_partners', 'false').lower() == 'true'
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Start with base query
    query = Event.query.filter(Event.status == 'approved')
    
    # Add comprehensive search if search query provided
    if search_query:
        search_pattern = f"%{search_query}%"
        
        # Build OR conditions
        conditions = [
            Event.title.ilike(search_pattern),
            Event.description.ilike(search_pattern)
        ]
        
        if search_categories:
            conditions.append(Category.name.ilike(search_pattern))
            query = query.join(Category, Event.category_id == Category.id)
        
        if search_location:
            conditions.extend([
                Event.venue_name.ilike(search_pattern),
                Event.venue_address.ilike(search_pattern),
                Event.city.ilike(search_pattern),
                Event.county.ilike(search_pattern)
            ])
        
        if search_tags:
            # Adjust based on how tags are stored (JSON, array, or text)
            conditions.append(Event.tags.ilike(search_pattern))
        
        if search_interests:
            # Adjust based on how interests are stored
            conditions.append(Event.interests.ilike(search_pattern))
        
        if search_partners:
            conditions.extend([
                Partner.business_name.ilike(search_pattern),
                Partner.name.ilike(search_pattern)
            ])
            query = query.join(Partner, Event.partner_id == Partner.id)
        
        # Apply all conditions with OR
        query = query.filter(or_(*conditions))
    
    # Apply pagination
    events = query.order_by(Event.start_date.asc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return jsonify({
        'events': [event.to_dict() for event in events.items],
        'total': events.total,
        'pages': events.pages,
        'current_page': page
    })
```

## Search Behavior

### Search Logic
- All searches are **case-insensitive**
- All searches use **partial matching** (LIKE '%query%')
- Multiple fields are combined with **OR** logic
- Results are deduplicated (DISTINCT)
- Results are ordered by start_date ascending

### Search Examples

1. **Search: "concert"**
   - Matches events with "concert" in title or description
   - Matches events in "Concerts" category
   - Matches events with "concert" tag

2. **Search: "Nairobi"**
   - Matches events in Nairobi venues
   - Matches events with "Nairobi" in venue_name or venue_address
   - Matches events with "Nairobi" in title/description

3. **Search: "Safaricom"**
   - Matches events organized by Safaricom
   - Matches events with "Safaricom" in title/description

4. **Search: "networking"**
   - Matches events with "networking" in title/description
   - Matches events tagged with "networking"
   - Matches events with "networking" interest

## Performance Optimization

### Recommended Database Indexes

Create indexes on frequently searched fields:

```sql
-- Full-text search indexes
CREATE INDEX idx_events_title_gin ON events USING gin(to_tsvector('english', title));
CREATE INDEX idx_events_description_gin ON events USING gin(to_tsvector('english', description));

-- Standard indexes for LIKE queries
CREATE INDEX idx_events_venue_name ON events(LOWER(venue_name));
CREATE INDEX idx_events_venue_address ON events(LOWER(venue_address));
CREATE INDEX idx_categories_name ON categories(LOWER(name));
CREATE INDEX idx_partners_business_name ON partners(LOWER(business_name));

-- Composite index for common queries
CREATE INDEX idx_events_status_start_date ON events(status, start_date);
```

### Caching Strategy

Consider implementing caching for popular search queries:

```python
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': os.getenv('REDIS_URL'),
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes
})

@cache.memoize(timeout=300)
def search_events_cached(search_query, flags, page, per_page):
    # Execute search query
    pass
```

## Testing

### Test Cases

1. **Basic Search**
   ```
   GET /api/events?search=concert&search_categories=true
   Expected: Events with "concert" in title, description, or category
   ```

2. **Location Search**
   ```
   GET /api/events?search=Nairobi&search_location=true
   Expected: Events in Nairobi locations
   ```

3. **Partner Search**
   ```
   GET /api/events?search=Safaricom&search_partners=true
   Expected: Events organized by Safaricom
   ```

4. **Multi-field Search**
   ```
   GET /api/events?search=tech&search_categories=true&search_tags=true&search_interests=true
   Expected: Tech events, events with tech tags/interests, or events in tech category
   ```

5. **Empty Search**
   ```
   GET /api/events?search=&page=1&per_page=20
   Expected: All events (default listing)
   ```

## Frontend User Experience

The enhanced search provides:

1. **Single Search Input**: Users type once to search across all fields
2. **Search Hints**: Suggested search terms appear when search is empty
3. **Real-time Results**: Results update as filters are applied
4. **Clear Feedback**: Active search shows in results summary

### User Flow
1. User types "Nairobi tech" in search box
2. Frontend sends request with all search flags enabled
3. Backend searches across title, description, categories, location, tags, interests, and partners
4. Results show all tech events in Nairobi, events by tech partners, or events with tech tags
5. User can further refine with category/date/price filters

## Migration Notes

If you're adding this feature to an existing API:

1. **Backward Compatibility**: The `search` parameter still works alone (searches title/description)
2. **Optional Flags**: All `search_*` flags default to `false` if not provided
3. **Gradual Rollout**: You can enable one search field at a time for testing

## Support

For questions or issues with the search implementation, contact the development team.

**Frontend Contact**: Search implementation in `src/pages/AllEventsPage.tsx`
**Backend Contact**: API implementation in `app/routes/events.py`
