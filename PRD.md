# VoiceWatch AI - Conversational LLM Observability Platform

A production-ready, voice-driven AI monitoring dashboard that lets developers interact with their LLM telemetry through natural conversation. This hackathon project integrates **all four sponsor technologies**: Google Cloud (Gemini AI for intelligent analysis), Datadog (detection rules & incident management), Confluent (real-time data streaming), and ElevenLabs (conversational voice interface). Developers can ask questions about their AI application health, get real-time alerts, and diagnose issues—all through natural speech.

**Dual Mode Operation**: Works in **Demo Mode** with simulated data for immediate exploration, or **Production Mode** with user-configured API credentials for real integrations. Perfect for hackathon judges to test with their own accounts or demo scenarios.

**NEW FEATURES - Enhanced for Maximum Impact**:
- **GitHub OAuth Authentication** - Secure user authentication with personalized dashboards and data isolation
- **Smart Remediation Engine** - AI-powered automatic fixes with one-click deployment
- **Model Performance Benchmarks** - Real-time comparison across GPT-4o, Claude, Gemini, and Llama models
- **Enhanced Confluent Stream Visualizer** - Live event stream with partition monitoring and throughput tracking
- **Advanced AI Analytics Suite** - Powered by Google Cloud Gemini with anomaly detection, predictive forecasting, and root cause analysis

**Experience Qualities**:
1. **Conversational** - Natural voice interactions make complex monitoring accessible and intuitive
2. **Intelligent** - AI-powered analysis surfaces insights from telemetry data automatically, predicts future trends, and recommends optimizations
3. **Collaborative** - Real-time WebSocket-powered multi-user monitoring with live presence indicators, activity feeds, and collaborative cursor tracking for distributed DevOps and SRE teams
4. **Cost-Conscious** - Advanced cost optimization engine identifies savings opportunities and provides actionable recommendations
5. **Proactive** - Smart remediation engine automatically suggests and applies fixes for common issues
6. **Secure** - GitHub OAuth authentication ensures user data isolation and personalized experiences

**Complexity Level**: Complex Application (advanced functionality with multiple views)
This integrates FOUR major platforms: **Google Cloud (Gemini AI)** for intelligent metric analysis, anomaly detection, predictions, and optimization recommendations; **Datadog** for detection rules and incident management; **Confluent** for real-time telemetry data streaming; and **ElevenLabs** for conversational voice interactions. It requires sophisticated state management, API orchestration, real-time data pipelines, multi-modal visualizations, machine learning inference, secure credential management with onboarding flows, and user authentication.

## Essential Features

### GitHub OAuth Authentication (NEW - Security & Personalization)
- **Functionality**: Secure user authentication using GitHub OAuth with personalized dashboards, user profile display, and sign-out capability
- **Purpose**: Provide secure access control, user identity management, and data isolation ensuring each user's metrics and configurations are private
- **Trigger**: App loads → Authentication check → Login screen if not authenticated → GitHub OAuth flow → Access granted
- **Progression**: User opens app → Auth state checked → Login page displays → User clicks "Continue with GitHub" → OAuth flow completes → User profile loaded → Dashboard accessible → User badge displayed in header → Sign out available
- **Success criteria**:
  - Beautiful branded login page with VoiceWatch AI branding and feature highlights
  - GitHub OAuth integration via spark.user() API
  - User profile displayed in header with avatar and username
  - Sign out button clears authentication state
  - Persistent auth state using useKV hook
  - Loading states during authentication
  - Protected routes - dashboard only accessible when authenticated
  - Smooth transitions between login and authenticated states
  - User data isolated per GitHub account

### Smart Remediation Engine (NEW - High Impact Feature)
- **Functionality**: One-click automated fixes for common LLM issues including caching, model selection, rate limiting, prompt optimization, retry logic, and request batching
- **Purpose**: Reduce MTTR (Mean Time To Resolution) from hours to minutes by providing pre-validated solutions that can be applied instantly
- **Trigger**: Automatic analysis of alerts and performance patterns, user navigates to Remediation tab
- **Progression**: System analyzes issues → Identifies root causes → Generates remediation plans → Displays impact/complexity → User applies fixes → System validates → Reports success
- **Success criteria**:
  - 6+ remediation actions covering major optimization categories
  - Each action shows impact level (high/medium/low), complexity (easy/moderate/complex), and estimated time
  - One-click execution with step-by-step progress visualization
  - Real-time validation and success confirmation
  - Recommendations prioritized by impact and ease of implementation
  - AI-powered suggestions based on current alert patterns
  - Tracks completion status and cumulative impact

### Model Performance Benchmarks (NEW - Competitive Intelligence)
- **Functionality**: Real-time performance comparison across GPT-4o, GPT-4o-mini, Claude 3.5, Gemini 1.5, and Llama 3.1 with latency, cost, quality, and reliability metrics
- **Purpose**: Enable data-driven model selection decisions, identify cost-saving opportunities, and optimize for specific use cases
- **Trigger**: Always visible in Benchmarks tab
- **Progression**: Benchmark data loaded → Metrics visualized → Use cases highlighted → Savings opportunities identified → Recommendations provided
- **Success criteria**:
  - 5+ models compared across 5 key dimensions (latency, cost, quality, throughput, reliability)
  - Visual progress bars for quick comparison
  - Recommended models highlighted for different use cases
  - Real cost comparisons showing 100x+ savings potential
  - Throughput and reliability metrics included
  - Best practices and insights for model selection

### Enhanced Real-Time Stream Visualizer (NEW - Confluent Integration Showcase)
- **Functionality**: Live event stream visualization with partition monitoring, throughput tracking, lag measurement, and event categorization
- **Purpose**: Demonstrate Confluent Kafka integration excellence with real-time visibility into data pipeline health
- **Trigger**: Automatic on dashboard load, updates in real-time
- **Progression**: Events ingested → Partitioned → Visualized in stream → Metrics calculated → Health monitored
- **Success criteria**:
  - Live scrolling event log with timestamp, partition, and message details
  - Real-time throughput calculation (events/second)
  - Per-partition event distribution and health monitoring
  - Zero-lag visualization with sub-second updates
  - Producer/consumer status indicators
  - Schema registry and replication status badges
  - Color-coded event types (success, latency, error, request)
  - Total event counter with proper formatting

### Advanced AI Analytics (NEW - Google Cloud Gemini Integration)
- **Functionality**: ML-powered anomaly detection, predictive forecasting, root cause analysis, and intelligent optimization recommendations
- **Purpose**: Transform raw metrics into actionable insights automatically using Google Cloud's AI capabilities, enabling proactive issue resolution and cost optimization
- **Trigger**: Automatic analysis as data accumulates, user-initiated deep-dive analysis
- **Progression**: Data collected → AI analyzes patterns → Anomalies detected → Predictions generated → Root causes identified → Optimizations recommended → Actions taken
- **Success criteria**:
  - Anomaly detection identifies outliers with confidence scores and explanations
  - Predictive insights forecast metric trends 5+ minutes ahead with confidence levels
  - Root cause analysis provides primary cause + contributing factors for any alert
  - Optimization recommendations identify specific cost-saving opportunities with projected savings
  - All AI-generated insights include confidence scores and actionable next steps
  - Dedicated "AI Analytics" tab showcasing Google Cloud integration

### Cost Optimization Engine (NEW - High Impact Feature)
- **Functionality**: Comprehensive cost analysis identifying savings opportunities across prompt optimization, caching, model selection, batching, and error reduction
- **Purpose**: Help teams reduce LLM costs by 20-60% through data-driven recommendations, addressing one of the biggest pain points in AI deployment
- **Trigger**: Automatic analysis of cost metrics, user navigates to Analytics tab
- **Progression**: Metrics analyzed → Cost patterns identified → Savings opportunities calculated → Recommendations prioritized → Implementation plans generated → Projected ROI displayed
- **Success criteria**:
  - Real-time cost tracking with session and projected monthly spend
  - 5+ optimization categories identified (prompt optimization, caching, model switching, batching, error reduction)
  - Each recommendation includes current spend, projected savings, percentage reduction, and specific actions
  - Combined impact analysis showing total potential monthly savings
  - Visual progress indicators and before/after comparisons
  - Export functionality for stakeholder reports

### Real-Time Collaboration with WebSocket Support (NEW - Enterprise Feature)
- **Functionality**: Multi-user monitoring with live presence tracking, collaborative cursors, real-time activity feeds, team chat for incidents, and WebSocket-based event broadcasting for distributed teams
- **Purpose**: Enable seamless team collaboration during incident response, allowing multiple engineers to monitor, triage, resolve issues, and communicate in real-time
- **Trigger**: Automatic on session start, updates continuously via WebSocket connection
- **Progression**: User joins → WebSocket connects → Presence broadcast → Actions tracked → Events shared → Team sees updates → Chat communication → Collaborative resolution
- **Success criteria**:
  - WebSocket connection with automatic reconnection (exponential backoff up to 5 attempts)
  - Live presence indicators showing online users with avatars and status (active/idle/away)
  - Real-time activity feed displaying user actions (alerts acknowledged, rules created, incidents resolved)
  - Collaborative cursor tracking showing other users' mouse positions with name labels
  - Event broadcasting for all major actions (alert acknowledgment, rule creation/update, incident resolution)
  - Simulated multi-user demo mode with 3 synthetic team members for showcase
  - Dedicated Collaboration tab with comprehensive team activity dashboard
  - Presence badge in header showing active user count
  - Sub-100ms event propagation for real-time feel
  - Graceful degradation when WebSocket unavailable
  - Activity timestamps with human-readable "time ago" formatting
  - Production-ready foundation for role-based access control and permissions

### Team Chat for Incident Response (NEW - Critical Communication Feature)
- **Functionality**: Real-time messaging system integrated with incident management, enabling team communication during critical events with persistent chat history, participant tracking, and message threading
- **Purpose**: Centralize incident communication, preserve conversation history for post-mortems, and eliminate context-switching between monitoring and chat tools
- **Trigger**: Accessed via incident detail dialog or dedicated chat panel, automatically created when incidents occur
- **Progression**: Incident created → Chat channel opened → Team members join → Messages exchanged → Actions discussed → Resolution coordinated → History preserved
- **Success criteria**:
  - Incident-specific chat channels created automatically for each open incident
  - Real-time message delivery with WebSocket broadcasting
  - Persistent message history stored per incident with user attribution
  - Avatar display and user identification for all messages
  - System messages for automated events (incident status changes, alert updates)
  - Action messages for team activities (investigations started, fixes applied)
  - Message timestamps with "time ago" formatting
  - Participant count and active user tracking per channel
  - Unread message indicators and notifications
  - Integrated into incident detail view with tabs for overview/chat/metrics
  - Standalone chat panel for quick access to all incident conversations
  - Message input with Enter-to-send keyboard shortcut
  - Smooth animations for message arrival and UI transitions
  - Auto-scroll to latest messages
  - Read receipts and typing indicators foundation
  - Export chat history with incident reports
  - Search and filter capabilities for historical conversations

### Automatic Screenshot Capture (NEW - Visual Documentation Feature)
- **Functionality**: Intelligent screenshot capture system with manual and automatic modes for comprehensive incident documentation, supporting full-page capture, visible area capture, and element-specific capture with configurable auto-capture triggers
- **Purpose**: Enable teams to document visual evidence of incidents, anomalies, and system states instantly, reducing documentation time from minutes to seconds and preserving critical visual context for post-mortems and debugging
- **Trigger**: Manual capture via screenshot component in incident dialog, quick capture button, or automatic capture on alert/incident creation (configurable)
- **Progression**: User triggers capture OR incident created → Screenshot captured (with delay if configured) → Preview shown → User reviews → Attach to incident → Saved with metadata → Team notified
- **Success criteria**:
  - Manual screenshot capture with 3 modes: visible area, full scrollable page, specific CSS element
  - Live preview with dimensions and file size display before attaching
  - Quick capture button for instant one-click screenshots
  - Automatic capture system with configurable settings:
    - Enable/disable auto-capture globally
    - Capture on alert creation (optional)
    - Capture on incident creation (optional)
    - Configurable capture delay (0-3000ms) for UI settling
    - Max captures per incident limit (1-10) to manage storage
  - Screenshots automatically attached to incidents with proper metadata
  - User attribution (captured by username) with timestamp
  - File size optimization with configurable quality (default 92%)
  - Download option for local backup of screenshots
  - Integration with existing file attachment system
  - Background capture doesn't interrupt workflow
  - Visual feedback during capture process with loading states
  - Screenshots stored as base64 data URLs in incident attachments
  - Supports high-DPI displays with 2x scale factor
  - Settings panel in Settings tab for auto-capture configuration
  - Toast notifications for capture success/failure
  - Element selector validation for targeted captures

### Email Notification System (NEW - Critical Alert Distribution)
- **Functionality**: Intelligent email notification system for critical incidents and alerts with configurable severity filters, recipient management, notification type preferences, and comprehensive delivery tracking
- **Purpose**: Ensure critical incidents reach the right team members immediately, enabling faster response times and reducing MTTR by notifying on-call engineers, managers, and stakeholders via email regardless of whether they're actively monitoring the dashboard
- **Trigger**: Automatic on incident creation, incident resolution, or critical alert triggering; manual test emails
- **Progression**: Event occurs (incident/alert) → Email configs queried → Severity filter applied → HTML email generated via AI → Email sent → Delivery tracked → Success/failure logged → Team notified
- **Success criteria**:
  - Add unlimited email recipients with unique configurations per email
  - Toggle notifications enabled/disabled per recipient without deletion
  - Configure notification types independently:
    - Incident Created (with alert details and metrics)
    - Incident Resolved (with resolution time and duration)
    - Alert Triggered (for critical/warning/info alerts)
  - Severity filter selection (critical, warning, info) with multi-select support
  - Professional HTML email templates generated via AI with:
    - VoiceWatch AI branding and styled headers
    - Severity-specific emoji indicators (🔴 critical, ⚠️ warning, ℹ️ info)
    - Incident/alert details clearly formatted with metrics
    - Timestamp and duration information
    - Link context back to the dashboard
  - Send test email functionality to verify configuration
  - Email delivery log tracking last 50+ notifications with:
    - Subject line and recipient
    - Sent timestamp with human-readable formatting
    - Success/failure status with visual indicators
    - Error messages for failed deliveries
    - Related incident/alert linking for context
  - Real-time integration with incident workflow (sends on creation and resolution)
  - Console logging for email content preview during development
  - Integration in Settings tab for easy configuration access
  - Toast notifications confirming email delivery success
  - Automatic batching to prevent notification spam
  - AI-powered HTML email generation with consistent styling

### Team Collaboration Panel (ENHANCED)
- **Functionality**: Real-time team activity feed showing who's online, recent actions, and collaborative monitoring
- **Purpose**: Enable distributed teams to coordinate incident response and share observability insights in real-time
- **Trigger**: Automatic on dashboard load, updates as team members interact
- **Progression**: User actions tracked → Activity feed updated → Online status shown → Team notifications sent → Collaborative resolution enabled
- **Success criteria**:
  - Live avatar display of active team members with online status indicators
  - Real-time activity stream showing recent actions (alerts acknowledged, rules created, incidents resolved)
  - Activity timestamps with "time ago" formatting
  - User identification with GitHub avatars and names
  - Simulated team collaboration for demo purposes
  - Enterprise-ready foundation for role-based access control and permissions

### Onboarding & Configuration System
- **Functionality**: Welcome flow guiding users to choose Demo or Production mode, with comprehensive API credential management
- **Purpose**: Makes the platform accessible for both quick demos and production deployments
- **Trigger**: First app launch or manual settings access
- **Progression**: Welcome screen → Mode selection → API configuration (optional) → Dashboard launch
- **Success criteria**: Users can configure all four sponsor APIs with credential validation and masked input fields

### Settings & API Management
- **Functionality**: Comprehensive settings interface for managing Google Cloud, Datadog, Confluent, and ElevenLabs API credentials with AES-256-GCM encryption
- **Purpose**: Enable users to connect their own accounts for production use with enterprise-grade security
- **Trigger**: Settings tab or onboarding flow
- **Progression**: Select platform → Enter credentials → Auto-encrypt → Test connection → Enable integration → Save securely
- **Success criteria**: All credentials stored with AES-256-GCM encryption, visual connection status indicators, backup/restore capability with password protection

## Essential Features

### Voice-Driven Query Interface
- **Functionality**: Natural language voice queries about LLM application health and metrics
- **Purpose**: Makes observability accessible without learning complex query languages
- **Trigger**: User clicks microphone button or uses always-listening mode
- **Progression**: User speaks → ElevenLabs Agent processes → Vertex AI analyzes telemetry → Response spoken + visualized
- **Success criteria**: Voice queries return accurate metrics within 3 seconds with visual dashboard updates

### Real-Time Telemetry Dashboard
- **Functionality**: Live visualization of LLM metrics (latency, tokens, costs, errors, rate limits)
- **Purpose**: Immediate visibility into application health and performance trends
- **Trigger**: Automatic on page load, updates every 5 seconds
- **Progression**: Data streams from mock Datadog → Charts update → Anomalies highlighted → Voice alerts triggered
- **Success criteria**: Dashboard reflects current state with <1 second lag, handles 100+ data points smoothly

### Intelligent Detection Rules
- **Functionality**: AI-defined and user-configurable custom threshold alerts for monitoring metrics (latency spikes, error rates, cost overruns, token usage, request volume) with webhook integrations to Slack, PagerDuty, and Microsoft Teams
- **Purpose**: Proactive alerting before issues impact users with complete control over thresholds and conditions, plus instant notifications to team collaboration tools
- **Trigger**: Metric threshold crossed, anomaly detected, or user creates new rule
- **Progression**: Rule triggered → Alert generated → Webhooks sent → Voice notification → Dashboard highlights issue → Action item created
- **Success criteria**: 
  - Users can create, edit, duplicate, and delete custom detection rules
  - Support for 7 metric types (avg/p95/p99 latency, error rate, cost, tokens, requests)
  - Support for 5 condition types (>, ≥, <, ≤, =)
  - Configurable severity levels (critical, warning, info)
  - Configurable actions (create alert, create incident, send notification)
  - Alerts fire within 5 seconds of threshold breach
  - Visual rule status indicators showing enabled/disabled state
  - Comprehensive rule cards showing metric, condition, threshold, and description
  - Webhook integrations for Slack, PagerDuty, and Microsoft Teams with configurable severity filters
  - Test webhook functionality to verify integration setup
  - Multiple webhooks can be configured simultaneously

### Webhook Integrations
- **Functionality**: Send real-time alerts to Slack channels, PagerDuty incidents, or Microsoft Teams channels when detection rules are triggered, with comprehensive integration testing and validation
- **Purpose**: Enable team-wide awareness of critical issues, integrate with existing incident management workflows, and ensure reliable alert delivery
- **Trigger**: Alert fires that matches webhook severity filter, or user initiates test from integration testing panel
- **Progression**: Alert created → Webhook payload formatted → HTTP POST sent → Delivery confirmed/tracked → Team notified
- **Success criteria**:
  - Support for Slack incoming webhooks with rich message formatting
  - Support for PagerDuty Events API v2 with proper severity mapping
  - Support for Microsoft Teams incoming webhooks with MessageCard format
  - Configurable per-webhook severity filters (critical, warning, info)
  - Enable/disable webhooks without deletion
  - Test webhook functionality with sample alerts
  - Multiple webhooks can be active simultaneously
  - Formatted payloads include alert details, metrics, and thresholds
  - Graceful error handling for failed webhook deliveries

### Webhook Integration Testing (NEW)
- **Functionality**: Real-time endpoint validation with single tests, burst tests (5x), comprehensive health monitoring, and delivery tracking for all configured webhooks
- **Purpose**: Ensure webhook reliability before production use, diagnose connectivity issues, monitor delivery success rates, and validate endpoint configurations
- **Trigger**: User navigates to Testing tab, clicks test buttons, or views webhook health dashboard
- **Progression**: User selects webhook → Configures test severity → Runs single/burst test → Views detailed results (success/fail, response time, status codes, errors) → Reviews historical test data and delivery statistics
- **Success criteria**:
  - Single test functionality validates endpoint connectivity and response
  - Burst testing (5 rapid requests) validates rate handling and consistency
  - Real-time progress indicators during test execution
  - Detailed test results showing: success status, HTTP status codes, response times, error messages
  - Test history preserved (last 10 tests per webhook)
  - Aggregated statistics: total tests, success count, success rate percentage, average response time
  - URL validation with provider-specific checks (Slack domains, Teams domains, PagerDuty endpoints)
  - 10-second timeout handling with clear error messages
  - CORS and network error detection with actionable feedback
  - Per-webhook health badges (Healthy 90%+, Degraded 50-90%, Unhealthy <50%)
  - Webhook delivery tracking showing last 100 deliveries with timestamps
  - Real-time delivery status monitoring in Settings tab
  - Dedicated Testing tab in main navigation for comprehensive webhook validation

### Conversational Alert Triage
- **Functionality**: Voice-guided investigation of triggered alerts with AI-suggested remediation
- **Purpose**: Faster incident response through natural conversation
- **Trigger**: Alert fires or user asks about recent issues
- **Progression**: Alert notification → User asks "What's wrong?" → AI explains issue → Suggests fixes → User confirms action
- **Success criteria**: Complete triage conversation in under 60 seconds with actionable recommendations

### LLM Application Simulator
- **Functionality**: Mock LLM application generating realistic telemetry (successful requests, errors, latency spikes, rate limits)
- **Purpose**: Demonstrate observability capabilities without requiring real production system
- **Trigger**: Automatic background simulation with controllable scenarios
- **Progression**: Simulator runs → Generates varied metrics → Streams to dashboard → Triggers rules → Creates incidents
- **Success criteria**: Generates 5+ distinct scenarios showing different monitoring use cases

### Incident Export & Reporting
- **Functionality**: Professional PDF export of individual incidents, comprehensive observability reports, and alert summaries
- **Purpose**: Generate documentation for post-mortems, stakeholder updates, compliance requirements, and incident analysis
- **Trigger**: User clicks "Generate Report" button in Incidents tab or "Export PDF" on individual incidents/alerts
- **Progression**: User selects report type → Configures options (metrics, AI suggestions, alerts) → Generates PDF → Downloads automatically
- **Success criteria**: PDF reports include all relevant data with professional formatting, sponsor branding, timestamps, severity classifications, and AI recommendations

### Historical Metrics Analysis with Trend Visualization
- **Functionality**: Advanced trend detection, anomaly identification, forecasting, and comparative analysis of metrics over time
- **Purpose**: Enable data-driven decisions through historical pattern recognition, predict future system behavior, and identify performance regressions
- **Trigger**: Automatic analysis as metrics accumulate, visible in dashboard tab
- **Progression**: System collects metrics → Calculates moving averages → Detects anomalies → Generates trend forecasts → Compares periods → Produces AI insights
- **Success criteria**: 
  - Automatic trend detection with confidence levels (high/medium/low)
  - Moving average overlays on charts for smoothed visualization
  - Statistical anomaly detection highlighting outliers
  - 5-8 period forecasting using linear regression
  - Period-over-period comparison showing improvements and regressions
  - Volatility calculations for stability assessment
  - AI-generated actionable insights based on trend analysis
  - Visual indicators for trend direction (up/down/stable) with percentage changes

## Edge Case Handling

- **First-Time Users**: Welcoming onboarding dialog with clear Demo vs Production mode choice
- **Missing API Credentials**: Clear configuration status indicators with direct links to credential sources
- **Demo Mode**: Fully functional simulated environment requiring no external API keys
- **Voice Recognition Failures**: Visual fallback with text input, "I didn't catch that" response with retry
- **API Timeouts**: Graceful degradation with cached data, visual indicator of stale metrics
- **No Active Alerts**: Voice agent proactively offers insights, suggests optimization opportunities
- **Multiple Simultaneous Alerts**: Prioritized queue with severity-based voice notifications
- **Missing Telemetry Data**: Clear "No data" states with troubleshooting suggestions
- **Network Disconnection**: Offline mode shows last known state, auto-reconnect with data backfill
- **Credential Masking**: All API keys displayed as masked password fields with show/hide toggle, encrypted with AES-256-GCM
- **Backup & Restore**: Password-protected credential export/import with PBKDF2 key derivation (100,000 iterations)
- **Security Indicators**: Visual badges showing encryption status for each configured platform

## Design Direction

The design should evoke **confidence, clarity, and futuristic intelligence**. Think mission control center meets conversational AI—where complex data becomes accessible through natural interaction. The interface should feel like talking to a knowledgeable colleague who can instantly visualize what they're explaining. High-tech but approachable, data-dense but scannable, serious but not intimidating.

## Color Selection

A modern monitoring platform aesthetic with high-contrast data visualization and voice interaction cues.

- **Primary Color**: Deep Navy (`oklch(0.25 0.05 250)`) - Communicates technical sophistication and reliability, grounds the interface
- **Secondary Colors**: 
  - Electric Blue (`oklch(0.65 0.19 245)`) - For active voice states and interactive elements
  - Slate Gray (`oklch(0.45 0.02 250)`) - For secondary UI elements and muted backgrounds
- **Accent Color**: Vibrant Cyan (`oklch(0.75 0.15 195)`) - Attention for voice activity, recording states, and real-time updates
- **Semantic Colors**:
  - Success Green (`oklch(0.70 0.17 145)`) - Healthy metrics, passed checks
  - Warning Amber (`oklch(0.75 0.15 75)`) - Threshold warnings, degraded states
  - Error Red (`oklch(0.65 0.22 25)`) - Critical alerts, failures
  - Cost Purple (`oklch(0.68 0.18 305)`) - Cost-related metrics and budget indicators
- **Foreground/Background Pairings**:
  - Primary Navy (#1a2332): White text (#FFFFFF) - Ratio 11.2:1 ✓
  - Electric Blue (#4d8cff): White text (#FFFFFF) - Ratio 4.6:1 ✓
  - Accent Cyan (#3dd5f3): Navy text (#1a2332) - Ratio 7.8:1 ✓
  - Error Red (#e74856): White text (#FFFFFF) - Ratio 5.1:1 ✓

## Font Selection

Typefaces should convey technical precision and modern AI aesthetics while maintaining exceptional readability for data-dense displays.

- **Primary Font**: Space Grotesk - Technical geometric sans with distinctive character, perfect for the futuristic monitoring aesthetic
- **Monospace Font**: JetBrains Mono - For metrics, timestamps, and code snippets

**Typographic Hierarchy**:
- H1 (Page Title): Space Grotesk Bold / 32px / -0.02em letter-spacing / 1.1 line-height
- H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em / 1.2
- H3 (Card Titles): Space Grotesk Medium / 18px / normal / 1.3
- Body (Primary): Space Grotesk Regular / 15px / normal / 1.5
- Metrics (Data Display): JetBrains Mono Medium / 14px / normal / 1.4
- Small (Labels): Space Grotesk Regular / 13px / 0.01em / 1.4

## Animations

Animations should emphasize the **real-time, voice-driven nature** of the platform while maintaining clarity during rapid data updates.

Voice interactions deserve the most expressive animation—pulsing recording indicators, smooth waveform visualizations, and satisfying state transitions. Chart updates should be fluid but not distracting (300ms ease transitions). Alert notifications slide in with urgency-matched speed (critical: fast, warning: moderate). The voice agent avatar should have subtle breathing animation when idle and animated speaking states. Loading states use skeleton screens rather than spinners to maintain spatial consistency. Hover states on interactive elements are immediate (100ms) with slight scale/color shifts.

## Component Selection

**Components**:
- **Card** - Primary container for dashboard widgets (metrics, charts, alerts) with subtle shadows and borders
- **Button** - Voice recording trigger (large, prominent), action buttons (standard), with distinct primary/secondary/destructive variants
- **Badge** - Status indicators (healthy/warning/critical), metric tags, severity labels with color-coded backgrounds
- **Alert** - System notifications, integration status messages at top of viewport
- **Tabs** - Navigate between Dashboard / Detection Rules / Incidents / Settings views
- **Dialog** - Configure detection rules, view alert details, manage integrations
- **Tooltip** - Contextual metric explanations, timestamp details on hover
- **Select** - Time range picker, metric filters, rule configuration dropdowns
- **Switch** - Toggle voice mode, enable/disable specific rules
- **Separator** - Visual breaks between dashboard sections
- **Scroll Area** - Alerts list, incidents log with many items

**Customizations**:
- **Voice Waveform Visualizer** - Custom canvas-based component showing real-time audio levels during voice interaction
- **Metric Sparkline** - Inline SVG mini-charts showing trend within cards
- **Pulse Indicator** - Custom animated dot for recording state and real-time data activity
- **Alert Priority Bar** - Custom vertical gradient bar showing alert severity distribution
- **Telemetry Stream** - Custom real-time scrolling log of LLM events

**States**:
- Buttons: Default (solid color) → Hover (slight brighten + subtle shadow) → Active (scale 0.98) → Disabled (50% opacity)
- Voice Button: Idle (gradient border) → Listening (pulsing cyan glow) → Processing (spinner overlay) → Speaking (waveform animation)
- Cards: Default (subtle border) → Hover (elevated shadow) → Alert state (colored left border accent)
- Inputs: Default (gray border) → Focus (cyan ring + border color shift) → Error (red border + shake animation)

**Icon Selection**:
- Microphone (voice recording)
- ChartLine (metrics dashboard)
- Bell (alerts and notifications)
- Lightning (detection rules)
- Bug (incidents and errors)
- Clock (latency metrics)
- CurrencyDollar (cost tracking)
- Warning (threshold warnings)
- CheckCircle (healthy status)
- XCircle (error status)

**Spacing**:
- Card padding: p-6 (24px) for primary content areas
- Section gaps: gap-6 (24px) between major dashboard sections
- Inline gaps: gap-3 (12px) for related elements within cards
- Layout margins: m-8 (32px) for page-level spacing
- Tight spacing: gap-2 (8px) for labels and values

**Mobile**:
- Stack dashboard cards vertically on <768px
- Enlarge voice button to fixed bottom-right FAB on mobile
- Collapse tabs to hamburger menu navigation
- Full-screen dialog overlays for rule configuration
- Touch-optimized button sizes (minimum 44px hit targets)
- Simplified charts with fewer data points on mobile
- Swipeable alert cards for dismiss actions
