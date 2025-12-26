import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkle, ChartLine, CurrencyDollar, TrendUp, ShieldCheck } from '@phosphor-icons/react'
import { ruleTemplates, getAllCategories, type RuleTemplate } from '@/lib/rule-templates'
import type { DetectionRule } from '@/lib/types'

interface RuleTemplatesProps {
  onSelectTemplate: (rule: Omit<DetectionRule, 'id'>) => void
}

export function RuleTemplates({ onSelectTemplate }: RuleTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const categories = getAllCategories()

  const getCategoryIcon = (category: RuleTemplate['category']) => {
    switch (category) {
      case 'sla':
        return <ChartLine size={20} weight="bold" />
      case 'cost':
        return <CurrencyDollar size={20} weight="bold" />
      case 'performance':
        return <TrendUp size={20} weight="bold" />
      case 'reliability':
        return <ShieldCheck size={20} weight="bold" />
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

  const handleSelectTemplate = (template: RuleTemplate) => {
    onSelectTemplate(template.rule)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkle size={16} weight="fill" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Rule Templates</DialogTitle>
          <DialogDescription>
            Choose from pre-configured monitoring scenarios to quickly set up detection rules
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sla" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="gap-2">
                {getCategoryIcon(category.value)}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {categories.map((category) => (
              <TabsContent
                key={category.value}
                value={category.value}
                className="space-y-4 mt-0"
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid gap-3">
                  {ruleTemplates
                    .filter((t) => t.category === category.value)
                    .map((template) => (
                      <Card
                        key={template.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold text-sm">
                                {template.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs capitalize ${getSeverityColor(
                                  template.rule.severity
                                )}`}
                              >
                                {template.rule.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="bg-muted px-2 py-1 rounded">
                                {template.rule.metric}
                              </span>
                              <span className="text-muted-foreground/50">→</span>
                              <span className="text-muted-foreground">
                                Threshold: {template.rule.threshold}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="secondary">
                            Use
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
