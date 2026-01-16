import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Funnel, X, FloppyDisk, MagnifyingGlass } from '@phosphor-icons/react'
import type { RuleSeverity, IncidentStatus } from '@/lib/types'

interface FilterOptions {
  severity?: RuleSeverity[]
  status?: IncidentStatus[]
  timeRange?: number
  searchQuery?: string
}

interface AdvancedFiltersProps {
  type: 'alert' | 'incident' | 'metric'
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onSavePreset?: (name: string) => void
}

const severityOptions: RuleSeverity[] = ['critical', 'warning', 'info']
const statusOptions: IncidentStatus[] = ['open', 'investigating', 'resolved']
const timeRangeOptions = [
  { value: 5 * 60 * 1000, label: 'Last 5 minutes' },
  { value: 15 * 60 * 1000, label: 'Last 15 minutes' },
  { value: 60 * 60 * 1000, label: 'Last hour' },
  { value: 24 * 60 * 60 * 1000, label: 'Last 24 hours' },
  { value: 7 * 24 * 60 * 60 * 1000, label: 'Last 7 days' },
]

export function AdvancedFilters({ type, filters, onFiltersChange, onSavePreset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presetName, setPresetName] = useState('')

  const activeFilterCount = [
    filters.severity?.length,
    filters.status?.length,
    filters.timeRange ? 1 : 0,
    filters.searchQuery ? 1 : 0,
  ].filter(Boolean).length

  const toggleSeverity = (severity: RuleSeverity) => {
    const current = filters.severity || []
    const updated = current.includes(severity)
      ? current.filter(s => s !== severity)
      : [...current, severity]
    onFiltersChange({ ...filters, severity: updated.length > 0 ? updated : undefined })
  }

  const toggleStatus = (status: IncidentStatus) => {
    const current = filters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    onFiltersChange({ ...filters, status: updated.length > 0 ? updated : undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName)
      setPresetName('')
      setIsOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <MagnifyingGlass 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        />
        <Input
          placeholder="Search..."
          value={filters.searchQuery || ''}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value || undefined })}
          className="pl-10"
        />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Funnel size={18} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            {(type === 'alert' || type === 'incident') && (
              <div className="space-y-2">
                <Label>Severity</Label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((severity) => (
                    <Badge
                      key={severity}
                      variant={filters.severity?.includes(severity) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSeverity(severity)}
                    >
                      {severity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {type === 'incident' && (
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge
                      key={status}
                      variant={filters.status?.includes(status) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Time Range</Label>
              <Select 
                value={filters.timeRange?.toString() || 'all'} 
                onValueChange={(v) => onFiltersChange({ ...filters, timeRange: v === 'all' ? undefined : parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {onSavePreset && activeFilterCount > 0 && (
              <div className="pt-2 border-t space-y-2">
                <Label>Save as Preset</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSavePreset} disabled={!presetName}>
                    <FloppyDisk size={18} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X size={18} />
        </Button>
      )}
    </div>
  )
}
