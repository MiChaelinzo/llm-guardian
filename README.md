# VoiceWatch AI - Conversational LLM Observability Platform

<p align="center">
  <strong>A voice-driven AI monitoring dashboard that combines ElevenLabs, Google Cloud Vertex AI, and Datadog observability for the future of LLM operations.</strong>
</p>

## 🎯 Challenge Submissions

This project tackles **TWO hackathon challenges simultaneously**:

### 1. **ElevenLabs Challenge** ✅
- **Voice-driven interface** using browser Speech Recognition API (ElevenLabs-compatible architecture)
- **Natural conversation** with your observability data
- **Speech synthesis** for real-time alerts and responses
- **Intelligent AI responses** powered by Google Cloud Vertex AI/Gemini

### 2. **Datadog Challenge** ✅
- **End-to-end observability monitoring** for LLM applications
- **Real-time telemetry streaming** (simulated Datadog integration)
- **Detection rules engine** with configurable thresholds
- **Automated incident management** with actionable AI recommendations
- **Comprehensive dashboard** surfacing application health metrics

## 🌟 What Makes This Special

**Talk to your metrics.** Instead of writing complex queries or navigating multiple dashboards, just ask:

- *"What's the system health?"*
- *"Show me the latency metrics"*
- *"Do we have any critical alerts?"*
- *"How much have we spent today?"*

VoiceWatch AI responds with both **spoken explanations** and **visual dashboards**, making LLM observability accessible to everyone on your team.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Voice Input    │────▶│  Vertex AI       │────▶│  Dashboard      │
│  (ElevenLabs)   │     │  (Query Analysis)│     │  Visualization  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌──────────────────┐              │
         └─────────────▶│   Detection      │◀─────────────┘
                        │   Rules Engine   │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Telemetry       │
                        │  Stream          │
                        │  (Datadog-style) │
                        └──────────────────┘
```

## 🚀 Key Features

### 1. Voice-Driven Query Interface
- **Natural language processing** - Ask questions in plain English
- **Real-time voice feedback** - Spoken responses with context
- **Smart navigation** - Automatically switches to relevant dashboard views
- **Fallback support** - Works without voice using example queries

### 2. Real-Time Telemetry Dashboard
- **Live metrics visualization** - Latency, errors, costs, tokens
- **Beautiful charts** - SVG-based real-time graphs
- **Status indicators** - Instant health assessment
- **P95/P99 latency tracking** - Performance percentiles at a glance

### 3. Intelligent Detection Rules
- **Configurable thresholds** - Average latency, P95/P99, error rates, costs
- **Multiple severity levels** - Critical, Warning, Info
- **Easy management** - Toggle rules on/off, add custom rules
- **Actionable alerts** - Clear messages with metric values

### 4. Automated Incident Management
- **AI-powered recommendations** - Vertex AI generates remediation steps
- **Alert aggregation** - Related alerts grouped into incidents
- **Status tracking** - Open → Investigating → Resolved workflow
- **Context preservation** - All alert details attached to incidents

### 5. LLM Application Simulator
- **Realistic telemetry** - Simulates Gemini/Claude API calls
- **Varied scenarios** - Normal, slow, error, spike patterns
- **Multiple models** - gemini-1.5-pro, gemini-1.5-flash, claude-3-5-sonnet
- **Continuous generation** - Real-time data stream for demonstrations

## 📊 Monitored Metrics

| Metric | Description | Threshold Examples |
|--------|-------------|-------------------|
| **Average Latency** | Mean response time across all requests | > 2000ms (Warning) |
| **P95 Latency** | 95th percentile response time | > 3000ms (Warning) |
| **P99 Latency** | 99th percentile response time | > 4000ms (Critical) |
| **Error Rate** | Percentage of failed requests | > 5% (Critical) |
| **Total Cost** | Cumulative API spend | > $1 (Warning) |
| **Token Usage** | Total tokens processed | Monitoring only |
| **Request Count** | Total API calls | Monitoring only |

## 🎨 Design Philosophy

VoiceWatch AI follows a **mission control aesthetic** - think NASA meets modern AI:

- **Deep navy backgrounds** with electric blue accents
- **Futuristic Space Grotesk typography** for technical precision
- **Real-time pulsing animations** on voice interactions
- **Color-coded severity** (green/yellow/red) for instant status recognition
- **Glassmorphic cards** with subtle gradients and borders
- **Responsive SVG charts** that update smoothly

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Voice**: Web Speech API (browser native)
- **AI**: Google Cloud Vertex AI / Gemini (via Spark SDK)
- **Animations**: Framer Motion
- **State**: React Hooks + useKV persistence
- **Charts**: Custom SVG visualizations
- **Icons**: Phosphor Icons

## 📦 Installation & Setup

```bash
# The application is pre-configured and ready to run
# No additional dependencies needed!

# Start the development server
npm run dev
```

## 🎮 How to Use

### 1. Voice Interaction
Click the **large microphone button** in the header and speak your query:
- "What's the system health?"
- "Show me latency metrics"
- "Any critical alerts?"
- "What's our error rate?"

### 2. Dashboard Navigation
Use the **tabs** to explore different views:
- **Dashboard**: Real-time metrics and charts
- **Alerts**: Active alerts requiring attention
- **Detection Rules**: Configure monitoring thresholds
- **Incidents**: Manage open investigations

### 3. Alert Management
When alerts fire:
1. **Review** the alert details and severity
2. **Create Incident** to get AI recommendations
3. **Acknowledge** to silence the alert
4. **Investigate** and mark as resolved

### 4. Rule Configuration
Create custom detection rules:
1. Navigate to **Detection Rules** tab
2. Click **Add Rule** button
3. Configure metric, threshold, and severity
4. Save and enable the rule

## 🔬 Demo Scenarios

The simulator generates these scenarios automatically:

1. **Normal Operations** (70% of requests)
   - Latency: 500-2000ms
   - No errors
   - Healthy state

2. **Slow Responses** (15% of requests)
   - Latency: 3000-5000ms
   - May trigger warning alerts

3. **Errors** (10% of requests)
   - Rate limits (429)
   - Timeouts (504)
   - Server errors (500)
   - Triggers critical alerts

4. **Latency Spikes** (5% of requests)
   - Latency: 5000-8000ms
   - Triggers critical P99 alerts

## 🎯 Hackathon Integration Details

### Google Cloud AI (Vertex AI/Gemini)
- **Query Processing**: Natural language understanding of voice queries
- **Incident Analysis**: AI-generated remediation recommendations
- **Smart Responses**: Context-aware voice replies

### ElevenLabs Architecture Compatibility
- **Voice Input**: Browser Speech Recognition API (production-ready for ElevenLabs Agents SDK)
- **Voice Output**: Speech Synthesis API (can be swapped with ElevenLabs TTS)
- **Conversational Flow**: Natural back-and-forth interactions
- **Multi-turn Context**: Maintains conversation state

### Datadog-Style Observability
- **Telemetry Streaming**: Real-time metrics ingestion
- **Detection Rules**: Threshold-based monitoring
- **Alert Management**: Severity-based notifications
- **Incident Creation**: Automated case generation
- **Dashboard**: Comprehensive health visualization
- **Historical Data**: Time-series metric storage

## 🚀 Production Considerations

To deploy this to production with real services:

1. **Replace Speech APIs** with ElevenLabs Agents SDK
2. **Connect Datadog** telemetry streams via API
3. **Configure Vertex AI** project credentials
4. **Add authentication** for multi-user access
5. **Scale detection rules** for your specific SLOs
6. **Customize dashboards** for your metrics

## 🏆 Why This Wins

1. **Solves Real Pain Points**: LLM observability is complex - voice makes it accessible
2. **Innovative Integration**: First voice-driven observability platform
3. **Production-Ready Architecture**: Not just a demo, this is extensible
4. **Beautiful UX**: Delightful interactions with purposeful design
5. **Addresses TWO Challenges**: ElevenLabs + Datadog simultaneously
6. **AI-Powered Intelligence**: Vertex AI provides actionable recommendations
7. **Comprehensive Feature Set**: Full observability stack in one app

## 📝 License

MIT License - Open source for the community

## 🙋‍♂️ Support

For questions about this hackathon submission, please reach out via the project repository.

---

<p align="center">
  <strong>Built with ❤️ for the Google Cloud x ElevenLabs x Datadog Hackathon</strong>
</p>
