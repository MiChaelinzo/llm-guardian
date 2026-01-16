import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Target, TrendUp, Warning, CheckCircle, XCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { SLO, MetricType, MetricsSummary } from '@/lib/types'

interface SLOManagerProps {
  slos: SLO[]
  onAddSLO: (slo: SLO) => void
  onToggleSLO: (id: string) => void
  onDeleteSLO: (id: string) => void
  summary: MetricsSummary
}

const metricOptions: { value: MetricType; label: string; unit: string }[] = [
  { value: 'avgLatency', label: 'Average Latency', unit: 'ms' },
  { value: 'p95Latency', label: 'P95 Latency', unit: 'ms' },
  { value: 'p99Latency', label: 'P99 Latency', unit: 'ms' },
  { value: 'errorRate', label: 'Error Rate', unit: '%' },
  { value: 'totalCost', label: 'Total Cost', unit: '$' },
]

const timeWindowOptions = [
  { value: 60 * 60 * 1000, label: '1 Hour' },
  { value: 24 * 60 * 60 * 1000, label: '24 Hours' },
  { value: 7 * 24 * 60 * 60 * 1000, label: '7 Days' },
  { value: 30 * 24 * 60 * 60 * 1000, label: '30 Days' },
]

export function SLOManager({ slos, onAddSLO, onToggleSLO, onDeleteSLO, summary }: SLOManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [metric, setMetric] = useState<MetricType>('avgLatency')
  const [target, setTarget] = useState('')
  const [timeWindow, setTimeWindow] = useState(24 * 60 * 60 * 1000)

  const handleSubmit = () => {
    if (!name || !target) return

    const slo: SLO = {
      id: `slo_${Date.now()}`,
      name,
      description,
      metric,
      target: parseFloat(target),
      timeWindow,
      enabled: true,
      createdAt: Date.now(),
    }

    onAddSLO(slo)
    setIsDialogOpen(false)
    setName('')
    setDescription('')
    setTarget('')
  }

  const calculateSLOStatus = (slo: SLO) => {
    const currentValue = summary[slo.metric]
    const isCompliant = slo.metric === 'errorRate' 
      ? currentValue <= slo.target 
      : currentValue <= slo.target

    const compliancePercentage = slo.metric === 'errorRate'
      ? Math.max(0, 100 - (currentValue / slo.target) * 100)
      : Math.max(0, 100 - ((currentValue - slo.target) / slo.target) * 100)

    return {
      currentValue,
      isCompliant,
      compliancePercentage: Math.min(100, Math.max(0, compliancePercentage)),
    }
  }

  const getMetricUnit = (metric: MetricType) => {
    return metricOptions.find(m => m.value === metric)?.unit || ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SLA / SLO Tracking</h2>
          <p className="text-muted-foreground">Define and monitor service level objectives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} weight="bold" />
              Create SLO
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Service Level Objective</DialogTitle>
              <DialogDescription>
                Define a target threshold for a specific metric
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slo-name">Name</Label>
                <Input
                  id="slo-name"
                  placeholder="e.g., API Response Time SLO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slo-description">Description</Label>
                <Textarea
                  id="slo-description"
                  placeholder="What does this SLO measure?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slo-metric">Metric</Label>
                <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
                  <SelectTrigger id="slo-metric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="slo-target">Target Threshold ({getMetricUnit(metric)})</Label>
                <Input
                  id="slo-target"
                  type="number"
                  placeholder="e.g., 1000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slo-window">Time Window</Label>
                <Select value={timeWindow.toString()} onValueChange={(v) => setTimeWindow(parseInt(v))}>
                  <SelectTrigger id="slo-window">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindowOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create SLO</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {slos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target size={48} className="text-muted-foreground mb-4" weight="duotone" />
            <p className="text-muted-foreground text-center mb-4">
              No SLOs configured yet. Create your first service level objective to start tracking compliance.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={18} />
              Create First SLO
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slos.map((slo) => {
            const status = calculateSLOStatus(slo)
            return (
              <motion.div
                key={slo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle>{slo.name}</CardTitle>
                          {status.isCompliant ? (
                            <Badge variant="default" className="gap-1 bg-success text-success-foreground">
                              <CheckCircle size={14} weight="fill" />
                              Compliant
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <Warning size={14} weight="fill" />
                              Breach
                            </Badge>
                          )}
                          {!slo.enabled && (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </div>
                        <CardDescription>{slo.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slo.enabled}
                          onCheckedChange={() => onToggleSLO(slo.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSLO(slo.id)}
                        >
                          <XCircle size={18} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Target</div>
                        <div className="text-2xl font-bold font-mono">
                          {slo.target}{getMetricUnit(slo.metric)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current</div>
                        <div className="text-2xl font-bold font-mono">
                          {status.currentValue.toFixed(2)}{getMetricUnit(slo.metric)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Compliance</div>
                        <div className="text-2xl font-bold font-mono flex items-center gap-2">
                          {status.compliancePercentage.toFixed(1)}%
                          {status.isCompliant ? (
                            <TrendUp size={20} className="text-success" weight="bold" />
                          ) : (
                            <Warning size={20} className="text-destructive" weight="bold" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {metricOptions.find(m => m.value === slo.metric)?.label}
                        </span>
                        <span className="font-mono">
                          {timeWindowOptions.find(w => w.value === slo.timeWindow)?.label}
                        </span>
                      </div>
                      <Progress 
                        value={status.compliancePercentage} 
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
