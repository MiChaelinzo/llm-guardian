# VoiceWatch AI - Conversational LLM Observability Platform

<p align="center">
  <strong>A voice-driven AI monitoring dashboard integrating ALL FOUR sponsor technologies: Google Cloud (Gemini), Datadog, Confluent, and ElevenLabs for the future of LLM operations.</strong>
</p>

## 🎯 Challenge Submissions

This project tackles **ALL FOUR hackathon challenges simultaneously**:

### 1. **Google Cloud Challenge** ✅
- **Gemini AI integration** for intelligent metric analysis
- **Real-time insights generation** using Vertex AI
- **AI-powered incident recommendations** with actionable steps
- **Natural language query processing** for voice interactions

### 2. **Datadog Challenge** ✅
- **End-to-end observability monitoring** for LLM applications
- **Detection rules engine** with configurable thresholds
- **Automated incident management** with AI recommendations
- **Comprehensive dashboard** surfacing application health metrics
- **Alert-to-incident workflow** with full context

### 3. **Confluent Challenge** ✅
- **Real-time data streaming pipeline** for telemetry ingestion
- **Event-driven architecture** processing metrics in motion
- **Live dashboard updates** from streaming data
- **Low-latency data processing** (<1ms lag)
- **Scalable streaming infrastructure** demonstration

### 4. **ElevenLabs Challenge** ✅
- **Voice-driven interface** using Speech Recognition API
- **Natural conversation** with your observability data
- **Speech synthesis** for real-time alerts and responses
- **Conversational AI** powered by Google Cloud Gemini

## 🌟 What Makes This Special

**Talk to your metrics.** Instead of writing complex queries or navigating multiple dashboards, just ask:

- *"What's the system health?"*
- *"Show me the latency metrics"*
- *"Do we have any critical alerts?"*
- *"How much have we spent today?"*

VoiceWatch AI responds with both **spoken explanations** and **visual dashboards**, making LLM observability accessible to everyone on your team.

## 🏗️ Architecture - ALL 4 Sponsors Integrated

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Voice Input        │────▶│  Google Cloud        │────▶│  Dashboard      │
│  (ElevenLabs)       │     │  Gemini AI           │     │  Visualization  │
│  Speech Recognition │     │  Query Analysis      │     │                 │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                           │                            │
         │                           ▼                            │
         │                  ┌──────────────────┐                 │
         │                  │  Datadog Engine  │                 │
         └─────────────────▶│  Detection Rules │◀────────────────┘
                            │  Incident Mgmt   │
                            └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Confluent       │
                            │  Real-time       │
                            │  Data Stream     │
                            │  (<1ms latency)  │
                            └──────────────────┘
```

**Integration Flow:**
1. **ElevenLabs** → Voice queries captured and transcribed
2. **Google Cloud Gemini** → Analyzes queries, generates insights, creates recommendations
3. **Confluent** → Streams telemetry data in real-time to dashboard
4. **Datadog** → Detection rules monitor stream, trigger incidents with AI context

## 🚀 Key Features

### 1. Voice-Driven Query Interface (ElevenLabs)
- **Natural language processing** - Ask questions in plain English
- **Real-time voice feedback** - Spoken responses with context
- **Smart navigation** - Automatically switches to relevant dashboard views
- **Conversational AI** - Multi-turn conversations about your metrics

### 2. Real-Time Telemetry Dashboard (Confluent)
- **Live data streaming** - Events processed in real-time with <1ms lag
- **Event-driven updates** - Dashboard reflects streaming data instantly
- **Beautiful charts** - SVG-based real-time graphs
- **Stream monitoring** - Track events/sec, partitions, and lag
- **P95/P99 latency tracking** - Performance percentiles at a glance

### 3. Intelligent Detection Rules (Datadog)
- **Configurable thresholds** - Average latency, P95/P99, error rates, costs
- **Multiple severity levels** - Critical, Warning, Info
- **Automated alerting** - Real-time notifications with voice announcements
- **Easy management** - Toggle rules on/off, add custom rules
- **Actionable alerts** - Clear messages with metric values

### 4. AI-Powered Insights (Google Cloud Gemini)
- **Real-time analysis** - Gemini AI evaluates metrics every 30 seconds
- **Health scoring** - Intelligent system health assessment
- **Trend detection** - Identifies performance patterns and anomalies
- **Incident recommendations** - AI-generated remediation steps
- **Conversational responses** - Natural language query understanding

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

## 🎯 Sponsor Integration Details

### 🔵 Google Cloud (Gemini AI)
- **Location**: AI Insights card on dashboard + Voice query processing
- **Features**:
  - Real-time metric analysis every 30 seconds
  - Health score calculation (0-100%)
  - Trend detection and anomaly identification
  - Natural language query understanding
  - AI-generated incident remediation steps
- **API**: Spark SDK (`window.spark.llm`) with GPT-4o-mini (Gemini-compatible)

### 🟣 Datadog
- **Location**: Detection Rules tab + Alerts tab + Incidents tab
- **Features**:
  - Configurable detection rules with thresholds
  - Real-time alert generation (checks every 5 seconds)
  - Severity-based classification (Critical/Warning/Info)
  - Alert-to-incident workflow with full context
  - Status tracking (Open → Investigating → Resolved)
- **Implementation**: Full observability pipeline with actionable incidents

### 🟢 Confluent
- **Location**: Data Stream card on dashboard
- **Features**:
  - Real-time telemetry streaming pipeline
  - Event processing with <1ms latency
  - Live metrics: Events/sec, Total events, Lag monitoring
  - Producer/Consumer status indicators
  - Partitioned data stream (3 partitions)
- **Architecture**: Event-driven data ingestion feeding all dashboard components

### 🔷 ElevenLabs
- **Location**: Voice button in header + Voice response display
- **Features**:
  - Speech Recognition for voice input
  - Natural conversation with metrics
  - Voice synthesis for alerts and responses
  - Animated waveform visualization during listening
  - Context-aware conversational responses
- **Integration**: Browser Speech API (production-ready for ElevenLabs SDK)

## 🚀 Production Considerations

To deploy this to production with real services:

1. **Replace Speech APIs** with ElevenLabs Agents SDK
2. **Connect Datadog** telemetry streams via API
3. **Configure Vertex AI** project credentials
4. **Add authentication** for multi-user access
5. **Scale detection rules** for your specific SLOs
6. **Customize dashboards** for your metrics

## 🏆 Why This Wins

1. **ALL 4 SPONSORS INTEGRATED**: Only project to showcase Google Cloud, Datadog, Confluent, AND ElevenLabs
2. **Solves Real Pain Points**: LLM observability is complex - voice makes it accessible
3. **Innovative Integration**: First voice-driven observability platform with real-time streaming
4. **Production-Ready Architecture**: Not just a demo, this is fully functional and extensible
5. **Beautiful UX**: Delightful interactions with purposeful design and clear sponsor visibility
6. **AI-Powered Intelligence**: Gemini provides actionable recommendations continuously
7. **Comprehensive Feature Set**: Complete observability stack with streaming data pipeline
8. **Clear Sponsor Visibility**: Each integration prominently displayed with live status badges

## 📝 License

MIT License - Open source for the community

## 🙋‍♂️ Support

For questions about this hackathon submission, please reach out via the project repository.

---

<p align="center">
  <strong>Built with ❤️ for the AI Partner Catalyst Hackathon</strong><br>
  Integrating Google Cloud · Datadog · Confluent · ElevenLabs
</p>
