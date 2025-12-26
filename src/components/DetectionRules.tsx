import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightning, Plus } from '@phosphor-icons/react'
import type { DetectionRule } from '@/lib/types'
import { useState } from 'react'

interface DetectionRulesProps {
  rules: DetectionRule[]
  onToggleRule: (ruleId: string) => void
  onAddRule: (rule: Omit<DetectionRule, 'id'>) => void
}

export function DetectionRules({ rules, onToggleRule, onAddRule }: DetectionRulesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    metric: 'avgLatency',
    condition: 'gt' as const,
    threshold: 2000,
    severity: 'warning' as const,
    enabled: true,
    actions: ['alert', 'notify']
  })

  const handleSubmit = () => {
    if (newRule.name && newRule.threshold > 0) {
      onAddRule(newRule)
      setIsDialogOpen(false)
      setNewRule({
        name: '',
        description: '',
        metric: 'avgLatency',
        condition: 'gt',
        threshold: 2000,
        severity: 'warning',
        enabled: true,
        actions: ['alert', 'notify']
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'warning':
        return 'bg-warning/10 text-warning border-warning'
      default:
        return 'bg-primary/10 text-primary border-primary'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightning size={20} weight="fill" className="text-primary" />
          <h3 className="font-semibold">Detection Rules</h3>
          <Badge variant="secondary">{rules.filter(r => r.enabled).length} active</Badge>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} weight="bold" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Detection Rule</DialogTitle>
              <DialogDescription>
                Define a new rule to monitor your LLM application metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="High Latency Alert"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Alert when latency exceeds threshold"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metric">Metric</Label>
                  <Select value={newRule.metric} onValueChange={(value) => setNewRule({ ...newRule, metric: value })}>
                    <SelectTrigger id="metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avgLatency">Avg Latency</SelectItem>
                      <SelectItem value="p95Latency">P95 Latency</SelectItem>
                      <SelectItem value="p99Latency">P99 Latency</SelectItem>
                      <SelectItem value="errorRate">Error Rate</SelectItem>
                      <SelectItem value="totalCost">Total Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={newRule.condition} onValueChange={(value: any) => setNewRule({ ...newRule, condition: value })}>
                    <SelectTrigger id="condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater Than</SelectItem>
                      <SelectItem value="lt">Less Than</SelectItem>
                      <SelectItem value="eq">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={newRule.severity} onValueChange={(value: any) => setNewRule({ ...newRule, severity: value })}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSubmit} className="w-full">
              Create Rule
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-lg border ${getSeverityColor(rule.severity)} transition-colors`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{rule.name}</h4>
                  <Badge variant="outline" className="text-xs">{rule.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {rule.metric} {rule.condition === 'gt' ? '>' : rule.condition === 'lt' ? '<' : '='} {rule.threshold}
                </p>
              </div>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() => onToggleRule(rule.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
