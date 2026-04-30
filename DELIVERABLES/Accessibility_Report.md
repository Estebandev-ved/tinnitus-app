# Accessibility Report (WCAG 2.1 AA)

## Touch Targets
- **Requirement**: Minimum 44x44 CSS pixels (Apple/Google recommend 48x48).
- **Implementation**: All actionable elements (`.btn`, `.fab`, `.card-action`) enforce `min-width: 48px; min-height: 48px;` and standard padding.

## Contrast Ratios
- **Requirement**: 4.5:1 for normal text, 3:1 for large text and UI components.
- **Implementation**: `Color_System.json` ensures dark mode surfaces (`#1E1E20`) and text (`#F9FAFB`) exceed 7:1 ratio. Specific metric colors (e.g., warning red `#EF4444`) are checked against both light (`#FFFFFF`) and dark backgrounds.

## Keyboard & Screen Reader Navigation
- **Semantic HTML**: `main`, `section`, `header`, `button` tags utilized natively.
- **Aria Labels**: The FAB includes `aria-label="Add new entry"` and `aria-haspopup="dialog"`. Hidden headers (`sr-only`) describe draggable regions.
- **Focus Outlines**: Default browser outlines are preserved or styled via `:focus-visible` to ensure keyboard navigation visibility.

## Animations
- Users preferring reduced motion should be accommodated (can be added via `@media (prefers-reduced-motion: reduce)` in CSS to disable the staggered fade-ins).
