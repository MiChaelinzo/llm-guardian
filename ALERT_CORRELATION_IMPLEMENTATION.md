# Alert Correlation Engine Implementation

Created the following files and features:

## Core Engine
- `/workspaces/spark-template/src/lib/alert-correlation.ts` - Alert correlation engine with intelligent grouping
- `/workspaces/spark-template/src/lib/types.ts` - Updated with new correlation types

## UI Component
- `/workspaces/spark-template/src/components/AlertCorrelation.tsx` - React component for viewing and managing correlation groups

## Features Implemented
1. **Smart Alert Grouping**: Automatically groups related alerts based on:
   - Temporal proximity (time-based correlation)
   - Same metric monitoring
   - Same severity level
   - Same detection rule triggering multiple times

2. **Correlation Scoring**: Each correlation has a confidence score (0-100%)

3. **Root Cause Analysis**: AI-suggested root causes for correlated alert groups

4. **Auto-Incident Creation**: Automatically creates incidents from high-confidence correlation groups

5. **Configurable Correlation Rules**: Multiple rule presets with different correlation strategies

## Integration Points
The component needs to be integrated into App.tsx with:
- State for correlation rules and groups
- Effect hook to run correlation analysis when alerts change
- Tab in the main navigation
- Handlers for incident creation from correlation groups

## Usage
When integrated, the correlation engine will:
1. Monitor incoming alerts continuously
2. Group related alerts automatically
3. Calculate correlation confidence
4. Suggest root causes
5. Optionally auto-create incidents for high-priority groups
6. Show active and resolved correlation groups in the UI
