import html2canvas from 'html2canvas'
import type { FileAttachment } from './types'

export interface CaptureOptions {
  element?: HTMLElement
  fullPage?: boolean
  filename?: string
  quality?: number
  backgroundColor?: string
}

export interface ScreenshotResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
  size: number
}

export async function captureScreenshot(options: CaptureOptions = {}): Promise<ScreenshotResult> {
  const {
    element = document.body,
    fullPage = false,
    quality = 0.92,
    backgroundColor = '#0a0a0f'
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
      scale: 2,
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
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error)
    throw new Error('Failed to capture screenshot')
  }
}

export async function captureElement(selector: string, options: CaptureOptions = {}): Promise<ScreenshotResult> {
  const element = document.querySelector(selector) as HTMLElement
  
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }

  return captureScreenshot({ ...options, element })
}

export function createAttachmentFromScreenshot(
  screenshot: ScreenshotResult,
  userId: string,
  userName: string,
  filename?: string
): FileAttachment {
  const timestamp = Date.now()
  const defaultFilename = `screenshot-${new Date(timestamp).toISOString().replace(/[:.]/g, '-')}.png`

  return {
    id: `screenshot_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    name: filename || defaultFilename,
    type: 'image/png',
    size: screenshot.size,
    dataUrl: screenshot.dataUrl,
    uploadedAt: timestamp,
    uploadedBy: userId,
    uploadedByName: userName,
  }
}

export async function downloadScreenshot(screenshot: ScreenshotResult, filename: string): Promise<void> {
  const link = document.createElement('a')
  link.href = screenshot.dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function captureAndAttach(
  userId: string,
  userName: string,
  options: CaptureOptions = {}
): Promise<FileAttachment> {
  const screenshot = await captureScreenshot(options)
  return createAttachmentFromScreenshot(screenshot, userId, userName, options.filename)
}

export async function captureMultipleElements(
  selectors: string[],
  userId: string,
  userName: string
): Promise<FileAttachment[]> {
  const attachments: FileAttachment[] = []

  for (const selector of selectors) {
    try {
      const screenshot = await captureElement(selector)
      const attachment = createAttachmentFromScreenshot(
        screenshot,
        userId,
        userName,
        `${selector.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`
      )
      attachments.push(attachment)
    } catch (error) {
      console.error(`Failed to capture element ${selector}:`, error)
    }
  }

  return attachments
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
