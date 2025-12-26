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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Lightning, Plus, PencilSimple, Trash, Copy } from '@phosphor-icons/react'
import type { DetectionRule, MetricType, RuleCondition, RuleSeverity, RuleAction } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'

interface DetectionRulesProps {
  rules: DetectionRule[]
  onToggleRule: (ruleId: string) => void
  onAddRule: (rule: Omit<DetectionRule, 'id'>) => void
  onEditRule?: (ruleId: string, rule: Omit<DetectionRule, 'id'>) => void
  onDeleteRule?: (ruleId: string) => void
}

export function DetectionRules({ rules, onToggleRule, onAddRule, onEditRule, onDeleteRule }: DetectionRulesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  
  const [newRule, setNewRule] = useState<Omit<DetectionRule, 'id'>>({
    name: '',
    description: '',
    metric: 'avgLatency' as const,
    condition: 'gt' as const,
    threshold: 2000,
    severity: 'warning' as const,
    enabled: true,
    actions: ['alert', 'notify']
  })
  
  const [editRule, setEditRule] = useState<Omit<DetectionRule, 'id'>>({
    name: '',
    description: '',
    metric: 'avgLatency' as const,
    condition: 'gt' as const,
    threshold: 2000,
    severity: 'warning' as const,
    enabled: true,
    actions: ['alert', 'notify']
  })

  const handleCreateSubmit = () => {
    if (!newRule.name.trim()) {
      toast.error('Rule name is required')
      return
    }
    if (newRule.threshold <= 0) {
      toast.error('Threshold must be greater than 0')
      return
    }
    if (newRule.actions.length === 0) {
      toast.error('At least one action is required')
      return
    }
    
    onAddRule(newRule)
    setIsCreateDialogOpen(false)
    setNewRule({
      name: '',
      description: '',
      metric: 'avgLatency' as const,
      condition: 'gt' as const,
      threshold: 2000,
      severity: 'warning' as const,
      enabled: true,
      actions: ['alert', 'notify']
    })
    toast.success('Detection rule created successfully')
  }
  
  const handleEditSubmit = () => {
    if (!editingRuleId || !onEditRule) return
    
    if (!editRule.name.trim()) {
      toast.error('Rule name is required')
      return
    }
    if (editRule.threshold <= 0) {
      toast.error('Threshold must be greater than 0')
      return
    }
    if (editRule.actions.length === 0) {
      toast.error('At least one action is required')
      return
    }
    
    onEditRule(editingRuleId, editRule)
    setIsEditDialogOpen(false)
    setEditingRuleId(null)
    toast.success('Detection rule updated successfully')
  }
  
  const handleEdit = (rule: DetectionRule) => {
    setEditingRuleId(rule.id)
    setEditRule({
      name: rule.name,
      description: rule.description,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: rule.enabled,
      actions: rule.actions
    })
    setIsEditDialogOpen(true)
  }
  
  const handleDuplicate = (rule: DetectionRule) => {
    const duplicatedRule: Omit<DetectionRule, 'id'> = {
      name: `${rule.name} (Copy)`,
      description: rule.description,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: false,
      actions: rule.actions
    }
    onAddRule(duplicatedRule)
    toast.success('Rule duplicated successfully')
  }
  
  const handleDelete = () => {
    if (deleteRuleId && onDeleteRule) {
      onDeleteRule(deleteRuleId)
      setDeleteRuleId(null)
      toast.success('Detection rule deleted')
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
  
  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'avgLatency': return 'Avg Latency (ms)'
      case 'p95Latency': return 'P95 Latency (ms)'
      case 'p99Latency': return 'P99 Latency (ms)'
      case 'errorRate': return 'Error Rate (%)'
      case 'totalCost': return 'Total Cost ($)'
      case 'totalTokens': return 'Total Tokens'
      case 'totalRequests': return 'Total Requests'
      default: return metric
    }
  }
  
  const getConditionSymbol = (condition: RuleCondition) => {
    switch (condition) {
      case 'gt': return '>'
      case 'gte': return '≥'
      case 'lt': return '<'
      case 'lte': return '≤'
      case 'eq': return '='
      default: return condition
    }
  }
  
  const toggleAction = (actions: RuleAction[], action: RuleAction, setter: (rule: Omit<DetectionRule, 'id'>) => void, currentRule: Omit<DetectionRule, 'id'>) => {
    const newActions = actions.includes(action)
      ? actions.filter(a => a !== action)
      : [...actions, action]
    setter({ ...currentRule, actions: newActions })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightning size={20} weight="fill" className="text-cost" />
          <h3 className="font-semibold">Detection Rules</h3>
          <Badge variant="secondary">{rules.filter(r => r.enabled).length} active</Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cost" />
            Datadog
          </Badge>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} weight="bold" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Detection Rule</DialogTitle>
              <DialogDescription>
                Define a custom threshold alert to monitor your LLM application metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Rule Name *</Label>
                <Input
                  id="create-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., High Latency Alert"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe when this rule should trigger"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-metric">Metric to Monitor *</Label>
                  <Select value={newRule.metric} onValueChange={(value: MetricType) => setNewRule({ ...newRule, metric: value })}>
                    <SelectTrigger id="create-metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avgLatency">Avg Latency (ms)</SelectItem>
                      <SelectItem value="p95Latency">P95 Latency (ms)</SelectItem>
                      <SelectItem value="p99Latency">P99 Latency (ms)</SelectItem>
                      <SelectItem value="errorRate">Error Rate (%)</SelectItem>
                      <SelectItem value="totalCost">Total Cost ($)</SelectItem>
                      <SelectItem value="totalTokens">Total Tokens</SelectItem>
                      <SelectItem value="totalRequests">Total Requests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-condition">Condition *</Label>
                  <Select value={newRule.condition} onValueChange={(value: RuleCondition) => setNewRule({ ...newRule, condition: value })}>
                    <SelectTrigger id="create-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                      <SelectItem value="gte">Greater or Equal (≥)</SelectItem>
                      <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                      <SelectItem value="lte">Less or Equal (≤)</SelectItem>
                      <SelectItem value="eq">Equals (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-threshold">Threshold Value *</Label>
                  <Input
                    id="create-threshold"
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-severity">Severity *</Label>
                  <Select value={newRule.severity} onValueChange={(value: RuleSeverity) => setNewRule({ ...newRule, severity: value })}>
                    <SelectTrigger id="create-severity">
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
              
              <div className="space-y-2">
                <Label>Actions When Triggered *</Label>
                <div className="flex flex-wrap gap-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-action-alert"
                      checked={newRule.actions.includes('alert')}
                      onCheckedChange={() => toggleAction(newRule.actions, 'alert', setNewRule, newRule)}
                    />
                    <label htmlFor="create-action-alert" className="text-sm cursor-pointer">
                      Create Alert
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-action-incident"
                      checked={newRule.actions.includes('incident')}
                      onCheckedChange={() => toggleAction(newRule.actions, 'incident', setNewRule, newRule)}
                    />
                    <label htmlFor="create-action-incident" className="text-sm cursor-pointer">
                      Create Incident
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="create-action-notify"
                      checked={newRule.actions.includes('notify')}
                      onCheckedChange={() => toggleAction(newRule.actions, 'notify', setNewRule, newRule)}
                    />
                    <label htmlFor="create-action-notify" className="text-sm cursor-pointer">
                      Send Notification
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleCreateSubmit} className="w-full">
              Create Rule
            </Button>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Detection Rule</DialogTitle>
              <DialogDescription>
                Modify the threshold alert configuration
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Rule Name *</Label>
                <Input
                  id="edit-name"
                  value={editRule.name}
                  onChange={(e) => setEditRule({ ...editRule, name: e.target.value })}
                  placeholder="e.g., High Latency Alert"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editRule.description}
                  onChange={(e) => setEditRule({ ...editRule, description: e.target.value })}
                  placeholder="Describe when this rule should trigger"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-metric">Metric to Monitor *</Label>
                  <Select value={editRule.metric} onValueChange={(value: MetricType) => setEditRule({ ...editRule, metric: value })}>
                    <SelectTrigger id="edit-metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avgLatency">Avg Latency (ms)</SelectItem>
                      <SelectItem value="p95Latency">P95 Latency (ms)</SelectItem>
                      <SelectItem value="p99Latency">P99 Latency (ms)</SelectItem>
                      <SelectItem value="errorRate">Error Rate (%)</SelectItem>
                      <SelectItem value="totalCost">Total Cost ($)</SelectItem>
                      <SelectItem value="totalTokens">Total Tokens</SelectItem>
                      <SelectItem value="totalRequests">Total Requests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-condition">Condition *</Label>
                  <Select value={editRule.condition} onValueChange={(value: RuleCondition) => setEditRule({ ...editRule, condition: value })}>
                    <SelectTrigger id="edit-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                      <SelectItem value="gte">Greater or Equal (≥)</SelectItem>
                      <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                      <SelectItem value="lte">Less or Equal (≤)</SelectItem>
                      <SelectItem value="eq">Equals (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-threshold">Threshold Value *</Label>
                  <Input
                    id="edit-threshold"
                    type="number"
                    value={editRule.threshold}
                    onChange={(e) => setEditRule({ ...editRule, threshold: Number(e.target.value) })}
                    min="0"
                    step="any"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-severity">Severity *</Label>
                  <Select value={editRule.severity} onValueChange={(value: RuleSeverity) => setEditRule({ ...editRule, severity: value })}>
                    <SelectTrigger id="edit-severity">
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
              
              <div className="space-y-2">
                <Label>Actions When Triggered *</Label>
                <div className="flex flex-wrap gap-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-action-alert"
                      checked={editRule.actions.includes('alert')}
                      onCheckedChange={() => toggleAction(editRule.actions, 'alert', setEditRule, editRule)}
                    />
                    <label htmlFor="edit-action-alert" className="text-sm cursor-pointer">
                      Create Alert
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-action-incident"
                      checked={editRule.actions.includes('incident')}
                      onCheckedChange={() => toggleAction(editRule.actions, 'incident', setEditRule, editRule)}
                    />
                    <label htmlFor="edit-action-incident" className="text-sm cursor-pointer">
                      Create Incident
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-action-notify"
                      checked={editRule.actions.includes('notify')}
                      onCheckedChange={() => toggleAction(editRule.actions, 'notify', setEditRule, editRule)}
                    />
                    <label htmlFor="edit-action-notify" className="text-sm cursor-pointer">
                      Send Notification
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleEditSubmit} className="w-full">
              Save Changes
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      {rules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Lightning size={48} weight="thin" className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No detection rules configured yet</p>
          <p className="text-xs mt-1">Click "Add Rule" to create your first custom threshold alert</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border ${getSeverityColor(rule.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-sm">{rule.name}</h4>
                    <Badge variant="outline" className="text-xs capitalize">{rule.severity}</Badge>
                    {!rule.enabled && (
                      <Badge variant="secondary" className="text-xs">Disabled</Badge>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded">
                      {getMetricLabel(rule.metric)} {getConditionSymbol(rule.condition)} {rule.threshold}
                    </span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="text-muted-foreground">
                      {rule.actions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(rule)}
                    title="Duplicate rule"
                  >
                    <Copy size={16} />
                  </Button>
                  {onEditRule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                      title="Edit rule"
                    >
                      <PencilSimple size={16} />
                    </Button>
                  )}
                  {onDeleteRule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteRuleId(rule.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete rule"
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => onToggleRule(rule.id)}
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteRuleId !== null} onOpenChange={(open) => !open && setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Detection Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the detection rule
              and stop monitoring this threshold.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
