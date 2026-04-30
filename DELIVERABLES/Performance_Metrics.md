# Performance Metrics & Constraints

## Layout Constraints
- **Nesting Level**: Maximum 2 levels deep (`body -> main.dashboard-grid -> section.draggable-item`). This significantly reduces recalculation style and layout thrashing (Reflows).
- **CSS Grid**: Chosen over complex Flexbox trees to maintain a flat DOM structure while enabling 2D responsive adaptability.

## Scroll Performance (Mobile)
- **CSS-Only Carousel**: `overflow-x: auto` combined with `scroll-snap-type` removes the need for JavaScript touch event listeners.
- **Hardware Acceleration**: `-webkit-overflow-scrolling: touch` enables momentum scrolling natively on iOS devices.
- **Paint Optimization**: Staggered entry animations use `transform: translateY(...)` and `opacity` exclusively to bypass layout triggers and run on the GPU.

## Asset Loading
- **No External Libraries**: Drag-and-drop and horizontal scrolling use native browser APIs instead of heavier libraries (like `framer-motion` or `react-beautiful-dnd`) to keep Time to Interactive (TTI) low on constrained mobile networks.
