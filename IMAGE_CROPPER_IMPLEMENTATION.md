# Image Cropper Implementation Guide

## Overview
The ImageCropper component is a reusable image editing tool that allows users to crop, zoom, and rotate images before uploading. It's designed to work with different aspect ratios and crop shapes.

## Component Location
```
/src/components/partnerDashboard/ImageCropper.tsx
```

## Features
- ✅ **Zoom Control**: 1x to 3x zoom range with slider
- ✅ **Rotation Control**: 0° to 360° rotation with slider
- ✅ **Drag to Reposition**: Pan the image within the crop area
- ✅ **Multiple Aspect Ratios**: Supports 16:9 (events), 1:1 (logos/profiles)
- ✅ **Crop Shapes**: Rectangular or circular crop preview
- ✅ **Object Fit Contain**: Shows entire image initially before cropping
- ✅ **Dark Theme UI**: Matches app design with professional controls

## Component Props

```typescript
interface ImageCropperProps {
  image: string;                    // Data URL or blob URL of image to crop
  onCropComplete: (croppedImage: File) => void;  // Callback with cropped File
  onCancel: () => void;              // Callback when user cancels
  aspectRatio?: number;              // Default: 16/9, use 1 for square
  cropShape?: 'rect' | 'round';     // Default: 'rect', use 'round' for circular
}
```

## Implementation Examples

### 1. Event Posters (16:9 Rectangle)
**Location**: `/src/components/partnerDashboard/CreateEvent.tsx`

```tsx
<ImageCropper
  image={tempImageForCropping}
  onCropComplete={handleCropComplete}
  onCancel={handleCropCancel}
  aspectRatio={16 / 9}
  cropShape="rect"
/>
```

**Use Case**: Event poster images that need to fit the standard event card format
**Output**: 16:9 rectangular cropped image saved as `event-poster.jpg`

### 2. Partner Logos (1:1 Square)
**Location**: `/src/pages/BecomePartner.tsx`

```tsx
<ImageCropper
  image={tempImageForCropping}
  onCropComplete={handleCropComplete}
  onCancel={handleCropCancel}
  aspectRatio={1}
  cropShape="rect"
/>
```

**Use Case**: Partner logo uploads for business profiles
**Output**: Square cropped logo saved as `cropped-image.jpg`

### 3. Profile Pictures (1:1 Circular)
**Location**: `/src/components/userDashboard/MyProfile.tsx`

```tsx
<ImageCropper
  image={tempImageForCropping}
  onCropComplete={handleCropComplete}
  onCancel={handleCropCancel}
  aspectRatio={1}
  cropShape="round"
/>
```

**Use Case**: User profile picture uploads
**Output**: Square cropped image (displayed as circular) saved as `profile-picture.jpg`

## Integration Pattern

### Step 1: Import the Component
```tsx
import ImageCropper from '../components/partnerDashboard/ImageCropper';
```

### Step 2: Add State Management
```tsx
const [showCropper, setShowCropper] = useState(false);
const [tempImageForCropping, setTempImageForCropping] = useState<string>('');
```

### Step 3: Handle File Selection
```tsx
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  // Open cropper
  const imageUrl = URL.createObjectURL(file);
  setTempImageForCropping(imageUrl);
  setShowCropper(true);
};
```

### Step 4: Handle Crop Complete
```tsx
const handleCropComplete = async (croppedImage: File) => {
  try {
    // Upload or save the cropped image
    const response = await uploadImage(croppedImage);
    
    // Update UI with new image
    setImageUrl(response.url);
    
    // Close cropper
    setShowCropper(false);
    setTempImageForCropping('');
  } catch (err: any) {
    console.error('Error uploading image:', err);
    alert(err.message || 'Failed to upload image');
  }
};
```

### Step 5: Handle Cancel
```tsx
const handleCropCancel = () => {
  setShowCropper(false);
  setTempImageForCropping('');
};
```

### Step 6: Render the Cropper
```tsx
return (
  <>
    {/* Image Cropper Modal */}
    {showCropper && tempImageForCropping && (
      <ImageCropper
        image={tempImageForCropping}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        aspectRatio={1}           // Change based on use case
        cropShape="round"         // Change based on use case
      />
    )}

    {/* Your main content */}
    <div>
      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  </>
);
```

## Use Cases Summary

| Use Case | Location | Aspect Ratio | Crop Shape | Output Filename |
|----------|----------|--------------|------------|-----------------|
| Event Posters | CreateEvent.tsx | 16:9 | rect | event-poster.jpg |
| Partner Logos | BecomePartner.tsx | 1:1 | rect | cropped-image.jpg |
| Profile Pictures | MyProfile.tsx | 1:1 | round | profile-picture.jpg |

## Technical Details

### Image Processing
- Uses HTML5 Canvas API for image manipulation
- Supports rotation with proper canvas transformations
- Outputs high-quality JPEG images (configurable)
- Handles CORS for external images

### User Experience
- Full image visible on initial load (`objectFit="contain"`)
- Smooth zoom and rotation controls
- Real-time crop preview with overlay
- Dark theme matching app design
- Responsive on mobile and desktop

### Performance
- Efficient canvas operations
- Proper memory cleanup (URL.revokeObjectURL)
- Lazy loading with react-easy-crop library
- Optimized for 60fps interactions

## Troubleshooting

### Issue: Image appears cropped initially
**Solution**: Ensure `objectFit="contain"` is set in the Cropper component (already implemented)

### Issue: Rotation not working properly
**Solution**: The getCroppedImg function handles rotation with canvas transformations (already implemented)

### Issue: Small images look pixelated
**Solution**: The cropper preserves original image quality. Use high-resolution source images.

### Issue: Circular crop shows as square
**Solution**: The crop output is always square. Apply `border-radius: 50%` in CSS when displaying circular profiles.

## Dependencies

```json
{
  "react-easy-crop": "^5.0.0"
}
```

Install with:
```bash
npm install react-easy-crop
```

## Future Enhancements

Potential improvements for future versions:
- [ ] Add brightness/contrast controls
- [ ] Support for filters (B&W, Sepia, etc.)
- [ ] Multiple aspect ratio presets
- [ ] Flip horizontal/vertical
- [ ] Crop to custom dimensions
- [ ] Save/load crop settings
- [ ] Undo/redo functionality

## Credits

Built with [react-easy-crop](https://github.com/ValentinH/react-easy-crop) by Valentin Hervieu.

## Support

For issues or questions, contact the development team or create an issue in the repository.

---

Last Updated: January 7, 2026
Version: 1.0.0
