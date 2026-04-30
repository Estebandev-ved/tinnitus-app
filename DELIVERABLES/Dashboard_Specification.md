# Dashboard Specification

## Overview
The redesigned dashboard focuses on micro-interactions, responsive adaptability, and efficient glanceability. It supports multi-device usage ranging from 360px mobile viewports to 1200px+ desktop environments.

## Layout System
- **Grid Architecture**: Utilizes CSS Grid with a maximum of 2 nesting levels (Main Layout -> Component Container) to ensure fast rendering.
- **Mobile First**: Single column by default (`1fr`).
- **Tablet (768px+)**: 2 columns (`repeat(2, 1fr)`).
- **Desktop (1200px+)**: 3/4 columns with a maximum width constraint of 1400px.
- **Horizontal Scrolling**: Used in mobile for `MetricCard` sets, utilizing `scroll-snap-type: x mandatory` for a native carousel feel without JavaScript overhead.

## Interaction Patterns
- **Drag and Drop**: Active on desktop views for rearranging the `DraggableSection` blocks. Uses standard HTML5 Drag and Drop API.
- **Staggered Animations**: Components enter via a staggered slide-up fade (e.g., `anim-stagger-1`, `anim-stagger-2`) triggered on mount, utilizing `cubic-bezier` timing.
- **Floating Action Button (FAB)**: Placed bottom-right, fixed positioning, equipped with a scale-down interaction on `:active`.

## Color System
Defined in `Color_System.json`, mapping specific states (e.g., Tinnitus Low = `#10B981`) to both light and dark modes with adequate contrast ratios.

## Components
1. **MetricCard**: Displays key values (Tinnitus, Sleep, Streak).
2. **ChartSection**: Switchable context for deeper data visualization (integrated in layout).
3. **AIInsightCard**: Prominent wide card showing the 24h rotating insight.
4. **CommunityHighlight**: Social proof component (styled identically to InsightCard in layout).
