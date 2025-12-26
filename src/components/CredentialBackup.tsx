import { Download, Upload, FileKey, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useState } from 'react'
// Ensure src/lib/encryption.ts has these functions (see previous step)
import { encryptWithPassword, decryptWithPassword } from '@/lib/encryption'

interface CredentialBackupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onImport: (data: any) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExport: () => Promise<any>
}

export function CredentialBackup({ onImport, onExport }: CredentialBackupProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const handleExport = async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setIsExporting(true)
      const data = await onExport()
      const jsonString = JSON.stringify(data, null, 2)
      const encrypted = await encryptWithPassword(jsonString, password)

      const blob = new Blob([encrypted], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voicewatch-credentials-${Date.now()}.enc`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Credentials exported securely')
      setPassword('')
      setConfirmPassword('')
      setExportOpen(false)
    } catch (error) {
      toast.error('Failed to export credentials')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file')
      return
    }

    if (!importPassword) {
      toast.error('Please enter the password')
      return
    }

    try {
      setIsImporting(true)
      const text = await importFile.text()
      const decrypted = await decryptWithPassword(text, importPassword)
      const data = JSON.parse(decrypted)

      await onImport(data)
      // toast.success is handled by parent or here
      setImportPassword('')
      setImportFile(null)
      setImportOpen(false)
    } catch (error) {
      toast.error('Failed to import - invalid password or file')
      console.error(error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileKey size={20} />
          Credential Backup & Restore
        </CardTitle>
        <CardDescription>
          Securely export and import your encrypted API credentials using a personal password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Export Credentials
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Encrypted Credentials</DialogTitle>
                <DialogDescription>
                  Your credentials will be encrypted with this password. You will need it to restore them later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="export-password">Encryption Password (min 8 chars)</Label>
                  <Input
                    id="export-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                  />
                </div>
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting || !password || password.length < 8 || password !== confirmPassword}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Encrypting & Exporting...
                    </>
                  ) : (
                    'Download Encrypted Backup'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Upload size={16} className="mr-2" />
                Import Credentials
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Encrypted Credentials</DialogTitle>
                <DialogDescription>
                  Select your .enc backup file and enter the password used to encrypt it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="import-file">Encrypted Backup File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".enc"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="import-password">Decryption Password</Label>
                  <Input
                    id="import-password"
                    type="password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    placeholder="Enter original password"
                  />
                </div>
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting || !importFile || !importPassword}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Decrypting & Importing...
                    </>
                  ) : (
                    'Restore Credentials'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}