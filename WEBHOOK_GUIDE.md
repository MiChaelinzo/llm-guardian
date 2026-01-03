# Webhook Integrations Guide

VoiceWatch AI supports webhook integrations with Slack, Discord, PagerDuty, and Microsoft Teams to send real-time alerts when detection rules are triggered.

## Supported Providers

### Slack
Slack incoming webhooks allow you to post messages to channels automatically.

**Setup Instructions:**
1. Go to your Slack workspace
2. Navigate to **Apps** → **Incoming Webhooks**
3. Click **Add to Slack**
4. Select the channel where you want to receive alerts
5. Click **Add Incoming Webhooks Integration**
6. Copy the **Webhook URL** (looks like `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)
7. Paste it into VoiceWatch AI → Settings → Webhooks → Add Webhook

**Message Format:**
- Rich attachments with color-coded severity
- Alert details including metric, threshold, and current value
- Timestamp and VoiceWatch AI branding

### Discord
Discord webhooks allow you to send automated messages and embeds to Discord channels.

**Setup Instructions:**
1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook** or select an existing one
4. Name your webhook (e.g., "VoiceWatch AI Alerts")
5. Select the channel where you want to receive alerts
6. Click **Copy Webhook URL** (looks like `https://discord.com/api/webhooks/123456789/XXXXXXXXXXX`)
7. Paste it into VoiceWatch AI → Settings → Webhooks → Add Webhook

**Message Format:**
- Rich embeds with color-coded severity borders
- Alert title, description, and details in organized fields
- Inline metrics showing threshold vs current value
- Timestamp footer with VoiceWatch AI branding
- Critical alerts include @here mention for immediate attention

**Discord Embed Colors:**
- 🚨 **Critical**: Red (#E74856 / 15158358)
- ⚠️ **Warning**: Orange (#F5B942 / 16103746)
- ℹ️ **Info**: Blue (#4D8CFF / 5087487)

### PagerDuty
PagerDuty Events API v2 allows you to create incidents and trigger on-call notifications.

**Setup Instructions:**
1. Go to your PagerDuty account
2. Navigate to **Services** → select your service
3. Go to **Integrations** tab
4. Click **Add Integration**
5. Select **Events API V2**
6. Copy the **Integration Key** (also called routing key)
7. Use the URL format: `https://events.pagerduty.com/v2/enqueue?routing_key=YOUR_INTEGRATION_KEY`
8. Paste it into VoiceWatch AI → Settings → Webhooks → Add Webhook

**Event Format:**
- Severity mapped to PagerDuty levels (critical, warning, info)
- Custom details include all metric information
- Source identified as "VoiceWatch AI"
- Timestamp in ISO 8601 format

### Microsoft Teams
Teams incoming webhooks allow you to send adaptive cards to Teams channels.

**Setup Instructions:**
1. Open Microsoft Teams
2. Navigate to the channel where you want to receive alerts
3. Click the **⋯** (More options) next to the channel name
4. Select **Connectors**
5. Search for **Incoming Webhook** and click **Configure**
6. Name your webhook (e.g., "VoiceWatch AI")
7. Optionally upload an image/logo
8. Click **Create**
9. Copy the **Webhook URL** (looks like `https://outlook.office.com/webhook/...`)
10. Paste it into VoiceWatch AI → Settings → Webhooks → Add Webhook

**Message Format:**
- MessageCard format with color-coded theme
- Structured facts for easy reading
- Activity title and subtitle for context
- All alert metadata included

## Configuration Options

### Severity Filters
Each webhook can be configured to only receive alerts of specific severities:
- **Critical**: High-priority issues requiring immediate attention
- **Warning**: Issues that need attention but aren't critical
- **Info**: Informational alerts and notifications

You can select one, two, or all three severity levels for each webhook.

### Enable/Disable
Webhooks can be temporarily disabled without deleting the configuration. This is useful for:
- Maintenance periods
- Testing other webhooks
- Rotating between different channels

### Testing
Use the **Test** button to send a sample alert to verify your webhook configuration:
- Sends a test alert with severity "info"
- Validates the webhook URL and credentials
- Confirms the format appears correctly in your destination
- Shows success/failure status immediately

## Webhook Delivery Tracking

VoiceWatch AI tracks all webhook deliveries in the Webhook Status panel:
- Total webhooks sent
- Success rate percentage
- Recent delivery history
- HTTP status codes
- Error messages for failed deliveries
- Timestamp of each delivery

This helps you monitor webhook health and diagnose any delivery issues.

## Alert Payloads

### When Webhooks Are Sent
Webhooks are automatically triggered when:
1. A detection rule threshold is breached
2. The alert severity matches the webhook's severity filter
3. The webhook is enabled

### Webhook Content
All webhook payloads include:
- **Alert name**: The triggered rule name
- **Message**: Human-readable description
- **Severity**: Critical, Warning, or Info
- **Current value**: The actual metric value that triggered the alert
- **Threshold**: The configured threshold
- **Metric**: Which metric was monitored
- **Condition**: The comparison operator (>, <, etc.)
- **Timestamp**: When the alert was triggered

### Rate Limiting
VoiceWatch AI implements intelligent rate limiting to prevent webhook spam:
- Same alert won't fire multiple webhooks within 60 seconds
- Burst protection for multiple alerts
- Graceful handling of provider rate limits

## Best Practices

1. **Start with Test Webhooks**: Always test your webhook configuration before enabling it for production alerts

2. **Use Severity Filters Wisely**: 
   - Configure critical alerts to go to PagerDuty or on-call channels
   - Send warnings to team Slack/Discord channels
   - Info alerts to monitoring-only channels

3. **Multiple Webhooks**: Set up multiple webhooks for redundancy:
   - Slack for team awareness
   - Discord for community/broader team
   - PagerDuty for on-call escalation
   - Teams for executive visibility

4. **Monitor Delivery**: Check the Webhook Status panel regularly to ensure webhooks are being delivered successfully

5. **Descriptive Names**: Use clear webhook names like "Production Critical Alerts" or "Dev Team Slack" to quickly identify purposes

## Troubleshooting

### Webhook Not Receiving Messages
- Verify the webhook URL is correct and hasn't expired
- Check that the webhook is enabled in VoiceWatch AI
- Confirm the severity filter includes the alert severity
- Use the Test button to validate configuration
- Check the Webhook Status panel for error messages

### Messages Not Formatted Correctly
- Ensure you're using the correct provider type (Slack vs Discord vs Teams)
- Discord requires webhook URLs from Discord (not Slack)
- PagerDuty requires the Events API v2 endpoint with routing key

### High Failure Rate
- Check if the webhook URL has been revoked or expired
- Verify network connectivity from VoiceWatch AI
- Review rate limits on the destination platform
- Check the Webhook Status panel for specific error codes

## Example Webhook URLs

### Slack
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
```

### Discord
```
https://discord.com/api/webhooks/1234567890/XXXXXXXXXXXXXXXXXXXXX
```

### PagerDuty
```
https://events.pagerduty.com/v2/enqueue?routing_key=your_integration_key_here
```

### Microsoft Teams
```
https://outlook.office.com/webhook/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX@XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/IncomingWebhook/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Security Considerations

- **Never share webhook URLs publicly**: They provide direct access to post messages
- **Rotate webhooks regularly**: Create new webhooks periodically for security
- **Monitor for abuse**: Check the delivery logs for unexpected webhook activity
- **Use dedicated channels**: Create specific channels for monitoring rather than posting to general channels
- **Limit severity filters**: Don't send all alerts to high-priority channels

## Support

For issues with webhook integrations:
1. Check the Webhook Status panel for error details
2. Use the Test button to validate configuration
3. Review the delivery logs for patterns
4. Consult your platform's webhook documentation (Slack/Discord/PagerDuty/Teams)
5. Verify API keys and routing keys haven't expired
