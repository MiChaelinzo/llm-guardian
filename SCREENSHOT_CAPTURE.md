# Screenshot Capture System

## Overview

The VoiceWatch AI platform includes a comprehensive screenshot capture system for incident documentation. This feature enables teams to capture, preview, and attach visual evidence to incidents automatically or manually.

## Features

### 1. Manual Screenshot Capture
- **Location**: Incident Detail Dialog → Attachments Tab
- **Modes**:
  - **Visible Area**: Captures what's currently visible in the viewport
  - **Full Page**: Captures the entire scrollable page
  - **Specific Element**: Captures a targeted element using CSS selectors

### 2. Quick Capture Button
- One-click screenshot capture
- Instantly attaches to current incident
- Visual feedback during capture process

### 3. Automatic Screenshot Capture
- **Configuration**: Settings Tab → Automatic Screenshot Capture
- **Options**:
  - Enable/disable globally
  - Capture on alert creation
  - Capture on incident creation
  - Configurable delay (0-3000ms)
  - Max captures per incident (1-10)

## Usage

### Manual Capture

```typescript
import { ScreenshotCapture } from '@/components/ScreenshotCapture'

<ScreenshotCapture
  onCapture={(attachment) => handleAttachment(attachment)}
  userId={currentUser.id}
  userName={currentUser.name}
/>
```

### Quick Capture

```typescript
import { QuickCaptureButton } from '@/components/QuickCaptureButton'

<QuickCaptureButton
  onCapture={(attachment) => handleAttachment(attachment)}
  userId={currentUser.id}
  userName={currentUser.name}
  incidentId={incident.id}
  variant="outline"
  size="sm"
/>
```

### Auto-Capture Hook

```typescript
import { useAutoCapture } from '@/hooks/use-auto-capture'

useAutoCapture({
  alerts: alerts || [],
  incidents: incidents || [],
  userId: currentUser?.id || '',
  userName: currentUser?.name || '',
  onCapture: (incidentId, attachment) => {
    // Handle attachment
  },
})
```

## API Reference

### `captureScreenshot(options)`

Captures a screenshot with specified options.

**Options:**
- `element?: HTMLElement` - Target element to capture
- `fullPage?: boolean` - Capture entire scrollable page
- `filename?: string` - Custom filename
- `quality?: number` - Image quality (0-1, default: 0.92)
- `backgroundColor?: string` - Background color for transparent areas

**Returns:** `Promise<ScreenshotResult>`

### `captureElement(selector, options)`

Captures a specific element by CSS selector.

**Parameters:**
- `selector: string` - CSS selector for target element
- `options?: CaptureOptions` - Additional capture options

**Returns:** `Promise<ScreenshotResult>`

### `createAttachmentFromScreenshot(screenshot, userId, userName, filename?)`

Creates a FileAttachment object from a screenshot.

**Returns:** `FileAttachment`

## Configuration

### Auto-Capture Settings

Navigate to **Settings Tab** → **Automatic Screenshot Capture**

1. **Enable Auto-Capture**: Toggle to activate automatic screenshots
2. **Capture Mode**: Choose between visible area or full page
3. **Capture Delay**: Set delay (0-3000ms) to allow UI elements to settle
4. **Trigger Options**:
   - Capture on Alert Creation
   - Capture on Incident Creation
5. **Max Captures**: Limit screenshots per incident (1-10)

## Technical Details

### Dependencies
- `html2canvas` - For rendering DOM to canvas
- High-DPI support with 2x scale factor
- Base64 encoding for storage

### Storage
- Screenshots stored as base64 data URLs
- Integrated with existing FileAttachment system
- Persistent storage via useKV hook

### Performance
- Background capture doesn't interrupt workflow
- Optimized image quality (92% default)
- File size displayed in preview
- Configurable capture delays

## Best Practices

1. **Use Full Page Capture Sparingly**: It can take longer on complex pages
2. **Set Appropriate Delays**: Allow 1-2 seconds for dynamic content to load
3. **Limit Auto-Captures**: Set max captures per incident to manage storage
4. **Element Capture**: Use specific CSS selectors like `.container`, `#main-chart`
5. **Review Before Attaching**: Use preview to verify screenshot quality

## Troubleshooting

### Screenshots are Blank
- Ensure target element is visible in DOM
- Check for CSS transforms or fixed positioning
- Verify CORS settings for external images

### Capture Takes Too Long
- Reduce quality setting
- Use visible area instead of full page
- Target specific elements instead of entire page

### Auto-Capture Not Working
- Verify auto-capture is enabled in settings
- Check that appropriate triggers are enabled
- Ensure user context is available (userId, userName)

## Future Enhancements

- [ ] Video recording for incident playback
- [ ] Annotation tools for screenshots
- [ ] Comparison view for before/after screenshots
- [ ] Automatic redaction of sensitive information
- [ ] Cloud storage integration
- [ ] Screenshot galleries for incidents
