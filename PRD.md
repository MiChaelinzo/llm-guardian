# VoiceWatch AI - Conversational LLM Observability Platform

A production-ready, voice-driven AI monitoring dashboard that lets developers interact with their LLM telemetry through natural conversation. This hackathon project integrates **all four sponsor technologies**: Google Cloud (Gemini AI for intelligent analysis), Datadog (detection rules & incident management), Confluent (real-time data streaming), and ElevenLabs (conversational voice interface). Developers can ask questions about their AI application health, get real-time alerts, and diagnose issues—all through natural speech.

**Dual Mode Operation**: Works in **Demo Mode** with simulated data for immediate exploration, or **Production Mode** with user-configured API credentials for real integrations. Perfect for hackathon judges to test with their own accounts or demo scenarios.

**Experience Qualities**:
1. **Conversational** - Natural voice interactions make complex monitoring accessible and intuitive
2. **Intelligent** - AI-powered analysis surfaces insights from telemetry data automatically
3. **Flexible** - Seamlessly switch between demo and production modes for any use case

**Complexity Level**: Complex Application (advanced functionality with multiple views)
This integrates FOUR major platforms: **Google Cloud (Gemini AI)** for intelligent metric analysis and predictions, **Datadog** for detection rules and incident management, **Confluent** for real-time telemetry data streaming, and **ElevenLabs** for conversational voice interactions. It requires sophisticated state management, API orchestration, real-time data pipelines, multi-modal visualizations, and secure credential management with onboarding flows.

## Essential Features

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
- **Functionality**: AI-defined and user-configurable custom threshold alerts for monitoring metrics (latency spikes, error rates, cost overruns, token usage, request volume)
- **Purpose**: Proactive alerting before issues impact users with complete control over thresholds and conditions
- **Trigger**: Metric threshold crossed, anomaly detected, or user creates new rule
- **Progression**: Rule triggered → Alert generated → Voice notification → Dashboard highlights issue → Action item created
- **Success criteria**: 
  - Users can create, edit, duplicate, and delete custom detection rules
  - Support for 7 metric types (avg/p95/p99 latency, error rate, cost, tokens, requests)
  - Support for 5 condition types (>, ≥, <, ≤, =)
  - Configurable severity levels (critical, warning, info)
  - Configurable actions (create alert, create incident, send notification)
  - Alerts fire within 5 seconds of threshold breach
  - Visual rule status indicators showing enabled/disabled state
  - Comprehensive rule cards showing metric, condition, threshold, and description

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
