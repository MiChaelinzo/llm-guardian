import html2canvas from 'html2canvas'

// Reconstructed Interface: ScreenshotOptions
export interface ScreenshotOptions {
  backgroundColor?: string
  fullPage?: boolean
  quality?: number
  filename?: string
}

// Reconstructed Interface: ScreenshotResult
export interface ScreenshotResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  size: number
}

// Reconstructed Interface: FileAttachment (Inferred from usage)
export interface FileAttachment {
  id: string
  name: string
  dataUrl: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: number
  size: number
  type: string
}

/**
 * Captures a specific element or selector
 */
export async function captureElement(
  selectorOrElement: string | HTMLElement, 
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  // Destructure options with defaults
  const { 
    backgroundColor, 
    fullPage = false, 
    quality = 0.95 
  } = options

  // Resolve the element
  const element = typeof selectorOrElement === 'string'
    ? document.querySelector(selectorOrElement) as HTMLElement
    : selectorOrElement

  if (!element) {
    throw new Error(`Element not found: ${selectorOrElement}`)
  }

  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: backgroundColor || null, // null preserves transparency if not set
      scrollY: fullPage ? -window.scrollY : 0,
      scrollX: fullPage ? -window.scrollX : 0,
      windowWidth: fullPage ? document.documentElement.scrollWidth : window.innerWidth,
      windowHeight: fullPage ? document.documentElement.scrollHeight : window.innerHeight,
      scale: 2, // High resolution for Retina displays
      logging: false,
      removeContainer: true,
    })

    const dataUrl = canvas.toDataURL('image/png', quality)
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) {
          resolve(b)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, 'image/png', quality)
    })

    return {
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      size: blob.size
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error)
    throw error
  }
}

/**
 * Captures the entire visible body or full page
 */
export async function captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
  return captureElement(document.body, options)
}

/**
 * Downloads a screenshot result as a file
 */
export function downloadScreenshot(
  result: ScreenshotResult | string, 
  filename: string = 'screenshot.png'
) {
  const url = typeof result === 'string' ? result : result.dataUrl
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Creates a FileAttachment object from a screenshot result
 */
export function createAttachmentFromScreenshot(
  result: ScreenshotResult,
  userId: string,
  userName: string,
  filename: string = 'screenshot.png'
): FileAttachment {
  return {
    id: `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: filename,
    dataUrl: result.dataUrl,
    uploadedBy: userId,
    uploadedByName: userName,
    uploadedAt: Date.now(),
    size: result.size,
    type: 'image/png'
  }
}

/**
 * Captures multiple elements
 */
export async function captureMultiple(
  selectors: string[],
  userId: string,
  userName: string,
  options: ScreenshotOptions = {}
): Promise<FileAttachment[]> {
  const attachments: FileAttachment[] = []

  for (const selector of selectors) {
    try {
      const screenshot = await captureElement(selector, options)
      const attachment = createAttachmentFromScreenshot(
        screenshot, 
        userId, 
        userName, 
        `${options.filename || 'screenshot'}-${Date.now()}.png`
      )
      attachments.push(attachment)
    } catch (error) {
      console.warn(`Skipping selector ${selector} due to capture error`)
    }
  }

  return attachments
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

