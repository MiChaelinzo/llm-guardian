import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GitMerge, Sparkle, Lightning, CheckCircle, Info, Warning, XCircle, ArrowRight, Network } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CorrelationGroup, CorrelationRule, Incident } from '@/lib/types'

interface AlertCorrelationProps {
  correlationGroups: CorrelationGroup[]
  correlationRules: CorrelationRule[]
  onUpdateRule: (ruleId: string, updates: Partial<CorrelationRule>) => void
  onCreateIncident: (group: CorrelationGroup) => void
  onDismissGroup: (groupId: string) => void
  incidents: Incident[]
}

export function AlertCorrelation({
  correlationGroups,
  correlationRules,
  onUpdateRule,
  onCreateIncident,
  onDismissGroup,
  incidents,
}: AlertCorrelationProps) {
  const [selectedGroup, setSelectedGroup] = useState<CorrelationGroup | null>(null)

  const activeGroups = correlationGroups.filter(g => g.status === 'active')
  const resolvedGroups = correlationGroups.filter(g => g.status === 'resolved')

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle weight="fill" className="text-destructive" />
      case 'warning':
        return <Warning weight="fill" className="text-warning" />
      default:
        return <Info weight="fill" className="text-accent" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'warning':
        return 'bg-warning/10 text-warning border-warning'
      default:
        return 'bg-accent/10 text-accent border-accent'
    }
  }

  const getFactorIcon = (type: string) => {
    switch (type) {
      case 'temporal':
        return <Lightning weight="fill" />
      case 'metric':
        return <Network weight="fill" />
      case 'severity':
        return <Warning weight="fill" />
      case 'pattern':
        return <GitMerge weight="fill" />
      default:
        return <Sparkle weight="fill" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
                <p className="text-3xl font-bold">{activeGroups.length}</p>
              </div>
              <GitMerge size={32} weight="fill" className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correlated Alerts</p>
                <p className="text-3xl font-bold">
                  {activeGroups.reduce((sum, g) => sum + g.alertIds.length, 0)}
                </p>
              </div>
              <Network size={32} weight="fill" className="text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Created Incidents</p>
                <p className="text-3xl font-bold">
                  {incidents.filter(i => i.correlationGroupId).length}
                </p>
              </div>
              <CheckCircle size={32} weight="fill" className="text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle weight="fill" className="text-primary" />
                Correlation Rules
              </CardTitle>
              <CardDescription>Configure how alerts are automatically grouped</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {correlationRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{rule.name}</h4>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Time Window:</span> {Math.floor(rule.timeWindowMs / 60000)}min
                  </div>
                  <div>
                    <span className="font-medium">Min Alerts:</span> {rule.minAlerts}
                  </div>
                  <div>
                    <span className="font-medium">Score Threshold:</span> {(rule.scoreThreshold * 100).toFixed(0)}%
                  </div>
                  <div>
                    <span className="font-medium">Auto-Incident:</span> {rule.autoCreateIncident ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => onUpdateRule(rule.id, { enabled })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge weight="fill" className="text-primary" />
            Active Correlation Groups
          </CardTitle>
          <CardDescription>
            Related alerts grouped automatically for faster incident response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeGroups.length === 0 ? (
            <Alert>
              <Info size={18} />
              <AlertDescription>
                No active correlation groups. The engine will automatically detect related alerts.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {activeGroups.map((group) => {
                  const hasIncident = incidents.some(i => i.correlationGroupId === group.id)
                  
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className={`p-4 border-l-4 ${getSeverityColor(group.severity)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(group.severity)}
                              <h4 className="font-semibold text-lg">{group.name}</h4>
                              <Badge variant="outline">
                                {group.alertIds.length} alerts
                              </Badge>
                              {hasIncident && (
                                <Badge className="bg-success/10 text-success border-success">
                                  Incident Created
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                            
                            {group.rootCause && (
                              <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-md">
                                <Sparkle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-accent mb-1">Suggested Root Cause</p>
                                  <p className="text-sm">{group.rootCause}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Correlation Confidence</Label>
                            <span className="text-xs font-medium">
                              {(group.correlationScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={group.correlationScore * 100} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.correlationFactors.map((factor, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {getFactorIcon(factor.type)}
                              <span className="text-xs">
                                {factor.type} ({(factor.score * 100).toFixed(0)}%)
                              </span>
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGroup(group)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <GitMerge weight="fill" />
                                  {group.name}
                                </DialogTitle>
                                <DialogDescription>{group.description}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Correlation Factors</h4>
                                  <div className="space-y-2">
                                    {group.correlationFactors.map((factor, idx) => (
                                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                        <div className="mt-0.5">{getFactorIcon(factor.type)}</div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium capitalize">{factor.type}</span>
                                            <Badge variant="outline">{(factor.score * 100).toFixed(0)}%</Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {group.rootCause && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Root Cause Analysis</h4>
                                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                                      <p className="text-sm">{group.rootCause}</p>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-semibold mb-2">Timeline</h4>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Created: {new Date(group.createdAt).toLocaleString()}</p>
                                    <p>Last Updated: {new Date(group.updatedAt).toLocaleString()}</p>
                                    <p>Alert Count: {group.alertIds.length}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {!hasIncident && (
                            <Button
                              size="sm"
                              onClick={() => onCreateIncident(group)}
                              className="gap-2"
                            >
                              Create Incident
                              <ArrowRight weight="bold" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismissGroup(group.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {resolvedGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Resolved Correlation Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedGroups.slice(0, 5).map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded-lg text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} weight="fill" className="text-success" />
                    <span className="text-sm">{group.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {group.alertIds.length} alerts
                    </Badge>
                  </div>
                  <span className="text-xs">
                    {new Date(group.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
