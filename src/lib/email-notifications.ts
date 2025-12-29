import type { 
  EmailNotificationLog, 
  Alert, 
  Incident,
  RuleSeverity,
  EmailNotificationConfig 
} from './types'

export interface EmailPayload {
  to: string
  subject: string
  body: string
  html?: string
}

export class EmailNotificationService {
  
  /**
   * Internal method to send emails. 
   * Uses Spark LLM to generate HTML if available, otherwise logs to console.
   */
  private async sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
    try {
      let html = payload.html;

      // Try to generate HTML content using Spark LLM if available and not provided
      if (!html && (window as any).spark) {
        try {
          const prompt = (window as any).spark.llmPrompt`
            You are an email formatting assistant. Convert the following text email into a professional, responsive HTML email template.

            SUBJECT: ${payload.subject}

            BODY:
            ${payload.body}

            Instructions:
            1. Use a clean, modern design.
            2. Highlight key metrics and severity levels.
            3. Any relevant metadata should be in a distinct section.
            4. Use appropriate colors: Red for critical/high, Yellow for warning, Blue for info.
            5. Return ONLY the HTML code.
          `;
          html = await prompt;
        } catch (err) {
          console.warn('Failed to generate HTML with LLM, falling back to text', err);
        }
      }

      // Simulate sending logic
      console.log(`[Email Service] Sending to: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      if (html) console.log(`HTML Preview:`, html.substring(0, 100) + '...');
      
      return { success: true };
    } catch (error) {
      console.error('[Email Service] Failed to send email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  async notifyIncidentCreated(
    incident: Incident, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = [];
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnIncidentCreated &&
      config.severityFilter.includes(incident.severity)
    );

    for (const config of eligibleConfigs) {
      const subject = `🚨 New Incident: ${incident.title}`;
      const body = `
A new ${incident.severity} incident has been reported in VoiceWatch AI.

Incident Details:
- Title: ${incident.title}
- Description: ${incident.description}
- Severity: ${incident.severity}
- Status: ${incident.status}
- Created: ${new Date(incident.createdAt).toLocaleString()}

${incident.alerts && incident.alerts.length > 0 ? `
First Alert:
- Rule: ${incident.alerts[0].ruleName}
- Message: ${incident.alerts[0].message}
- Value: ${incident.alerts[0].value}
` : ''}

Please review this incident in your VoiceWatch AI dashboard.
`;

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      });

      logs.push({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedIncidentId: incident.id,
        errorMessage: result.error
      });
    }

    return logs;
  }

  async notifyIncidentResolved(
    incident: Incident, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = [];
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnIncidentResolved &&
      config.severityFilter.includes(incident.severity)
    );

    for (const config of eligibleConfigs) {
      const duration = incident.resolvedAt 
        ? Math.floor((incident.resolvedAt - incident.createdAt) / 1000 / 60)
        : 0;

      const subject = `✅ Incident Resolved: ${incident.title}`;
      const body = `
The ${incident.severity} incident has been resolved in VoiceWatch AI.

Incident Details:
- Title: ${incident.title}
- Severity: ${incident.severity}
- Status: ${incident.status}
- Created: ${new Date(incident.createdAt).toLocaleString()}
- Resolved: ${incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'N/A'}
- Duration: ${duration} minutes

${incident.aiSuggestion ? `
AI Suggestion Applied:
${incident.aiSuggestion}
` : ''}

Great work resolving this incident!
`;

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      });

      logs.push({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedIncidentId: incident.id,
        errorMessage: result.error
      });
    }

    return logs;
  }

  async notifyAlert(
    alert: Alert, 
    configs: EmailNotificationConfig[]
  ): Promise<EmailNotificationLog[]> {
    const logs: EmailNotificationLog[] = [];
    
    const eligibleConfigs = configs.filter(config => 
      config.enabled && 
      config.notifyOnAlerts &&
      config.severityFilter.includes(alert.severity)
    );

    for (const config of eligibleConfigs) {
      const severityEmoji = {
        critical: '🔴',
        warning: '⚠️',
        info: 'ℹ️',
        low: '📢'
      }[alert.severity] || '📢';

      const subject = `${severityEmoji} ${alert.severity.toUpperCase()} Alert: ${alert.ruleName}`;
      const body = `
A ${alert.severity} alert has been triggered in VoiceWatch AI.

Alert Details:
- Rule: ${alert.ruleName}
- Message: ${alert.message}
- Severity: ${alert.severity}
- Current Value: ${alert.value}
- Timestamp: ${new Date(alert.timestamp).toLocaleString()}

${alert.metadata ? `
Threshold Information:
${JSON.stringify(alert.metadata, null, 2)}
` : ''}
`;

      const result = await this.sendEmail({
        to: config.email,
        subject,
        body
      });

      logs.push({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: config.email,
        subject,
        body,
        sentAt: Date.now(),
        status: result.success ? 'sent' : 'failed',
        relatedAlertId: alert.id,
        errorMessage: result.error
      });
    }

    return logs;
  }
}

export const emailNotificationService = new EmailNotificationService();

