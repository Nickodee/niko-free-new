# Music & Dance Category Icon Update

## Summary
Updated the Music & Dance category icon to use a custom dancing.png image instead of the default Music icon from lucide-react.

## Changes Made

### File: `/src/pages/LandingPage.tsx`

#### 1. Added Image Import (Line 44)
```tsx
import dancingIcon from "../images/dancing.png";
```

#### 2. Updated Icon Mapping in API Response Handler (Lines 661-681)
Changed the Music & Dance category to use a special marker:
```tsx
const iconMap: { [key: string]: any } = {
  // ... other icons
  "Music & Dance": "dancing-image", // Special marker for image icon
  // ... other icons
};
```

#### 3. Updated Fallback Categories (Line 791)
```tsx
{ name: "Music & Dance", icon: "dancing-image", count: 0, iconColor: "#EF4444" },
```

#### 4. Updated Mobile Category Rendering (Lines 1785-1825)
Added conditional rendering to handle image icons:
```tsx
const Icon = category.icon;
const isImageIcon = Icon === "dancing-image";

// In the render section:
{isImageIcon ? (
  <img 
    src={dancingIcon} 
    alt="Dancing" 
    className="w-4 h-4 object-contain"
    style={{
      filter: isSelected ? "brightness(0) invert(1)" : "none"
    }}
  />
) : (
  <Icon
    className="w-4 h-4"
    style={{
      color: isSelected ? "#ffffff" : category.iconColor,
    }}
  />
)}
```

#### 5. Updated Desktop Category Rendering (Lines 1895-1930)
Added similar conditional rendering for desktop view:
```tsx
const isImageIcon = Icon === "dancing-image";

{isImageIcon ? (
  <img 
    src={dancingIcon} 
    alt="Dancing" 
    className="w-7 h-7 object-contain"
  />
) : (
  <Icon
    className="w-7 h-7"
    style={{ color: category.iconColor }}
  />
)}
```

## Implementation Details

### Image Handling
- **Mobile View**: Uses `w-4 h-4` sizing (16x16px)
- **Desktop View**: Uses `w-7 h-7` sizing (28x28px)
- **Selected State (Mobile)**: Applies white color filter when selected
  - `filter: brightness(0) invert(1)` converts the image to white
- **Desktop View**: No color filter applied (shows original image colors)

### Special Marker System
Instead of passing the image directly, we use a string marker `"dancing-image"` to identify which categories should render as images. This approach:
- Maintains consistency with the existing icon structure
- Allows easy addition of more image icons in the future
- Keeps the category data structure simple

### Visual Consistency
- Image icons maintain the same sizing as SVG icons
- Proper `object-contain` ensures aspect ratio is preserved
- White filter on selected state ensures visibility on blue background

## Usage Pattern

To add more image icons in the future:
1. Import the image: `import myIcon from "../images/my-icon.png"`
2. Add a unique marker in iconMap: `"Category Name": "my-icon-marker"`
3. Update fallback categories with the same marker
4. Add conditional rendering in both mobile and desktop views:
   ```tsx
   const isMyIcon = Icon === "my-icon-marker";
   {isMyIcon ? <img src={myIcon} ... /> : <Icon ... />}
   ```

## Files Modified
- `/src/pages/LandingPage.tsx` - Main component with category rendering

## Assets Used
- `/src/images/dancing.png` - Dancing icon image

## Date Implemented
January 2, 2026

## Testing Checklist
- [ ] Verify icon displays correctly on desktop view
- [ ] Verify icon displays correctly on mobile view
- [ ] Test selected state (white overlay on mobile)
- [ ] Test dark mode appearance
- [ ] Verify icon size matches other category icons
- [ ] Test category rotation animation
- [ ] Verify clicking category still works correctly
- [ ] Test on different screen sizes
