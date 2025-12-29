import html2canvas from 'html2canvas'

export interface ScreenshotOptions {
  filename?: string
  quality?: number
  backgroundColor?: string
  fullPage?: boolean
}

export interface ScreenshotResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  size: number
}

export interface FileAttachment {
  id: string
  timestamp: number
  filename: string
  dataUrl: string
  uploadedBy: string
  userName: string
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
  
  const element = typeof selectorOrElement === 'string' 
    ? document.querySelector(selectorOrElement) as HTMLElement
    : selectorOrElement

  if (!element) {
    throw new Error(`Element not found: ${selectorOrElement}`)
  }

  const {
    fullPage = false,
    quality = 0.95,
    backgroundColor = '#0a0a0f' // Default to dark theme background
  } = options

  try {
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor,
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
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
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
export async function downloadScreenshot(
  result: ScreenshotResult | string, 
  filename: string = 'screenshot.png'
) {
  const href = typeof result === 'string' ? result : result.dataUrl
  
  const link = document.createElement('a')
  link.href = href
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
    timestamp: Date.now(),
    filename,
    dataUrl: result.dataUrl,
    uploadedBy: userId,
    userName: userName,
    size: result.size,
    type: 'image/png'
  }
}

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

