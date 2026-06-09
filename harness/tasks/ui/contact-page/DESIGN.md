# Design System Strategy: The Modern Heirloom

## 1. Overview & Creative North Star
**Creative North Star: "The Modern Heirloom"**

This design system is built to transform a standard e-commerce interface into a curated editorial experience. It rejects the frantic energy of traditional retail in favor of "The Modern Heirloom"—a philosophy that balances India's rich heritage with a sharp, geometric modernism. 

We break the "template" look through **Intentional Asymmetry** and **Tonal Depth**. By utilizing wide margins, varying section heights, and overlapping elements, we create a sense of architectural space. The goal is to make the user feel like they are flipping through a limited-edition art book rather than browsing a database. We prioritize breathability, precise typography, and a refusal to use generic UI decorators.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated dialogue between the warmth of Cream (#FAF6EE) and the authority of Charcoal (#1F1B16), accented by the regal luster of Gold (#D5C68F).

### The Surface Hierarchy
Depth is not achieved through shadows, but through the "Stacking Principle."
- **Base Layer:** Page background uses `surface` (#FAF6EE).
- **Secondary Layer:** Section bands use `surface-container` (Ivory #F2ECDD) to break the scroll rhythm.
- **Surface Elevation:** Product cards and headers sit on `surface-container-lowest` (White #FFFFFF).

### Core Directives
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for structural sectioning. Boundaries must be defined solely by shifts in background color (e.g., an Ivory section meeting a Cream section). 
*   **The "Glass & Gradient" Rule:** To provide "visual soul," primary CTAs should utilize a subtle linear gradient from `primary` (#D5C68F) to a slightly deeper tonal variant. For floating navigation or quick-view modals, use `surface-container-lowest` with a 90% opacity and a 16px backdrop-blur to create a "frosted glass" effect that integrates with the background.
*   **Functional Accents:** `tertiary` (Olive #6E7A4E) is reserved for "In Stock" signals, providing a naturalistic contrast to the warm neutrals. `secondary` (Mauve #AB877B) is reserved for high-area fills like footers to ground the experience.

---

## 3. Typography: The Poppins Monolith
We achieve luxury through the extreme precision of a single typeface: **Poppins**. By stripping away serifs and scripts, we lean into a "Geometric Brutalist" aesthetic that feels timeless and high-end.

*   **Display & Headlines:** Use `headline-lg` (56px) for Hero moments with -0.02em kerning to tighten the impact. Section headers (40px) and Sub-headers (32px) must use Weight 600 or 700.
*   **The UI Signature:** All buttons, labels, and navigation items must be **UPPERCASE** with `0.10em` tracking (letter-spacing). This creates an authoritative, "architectural" feel.
*   **Body & Utility:** Default body text uses `body-lg` (16px, Weight 400). Helper text and strikethroughs use `mute` (#8A847B). 
*   **The Absolute Constraint:** **No italics.** Ever. Emphasis is achieved through weight shifts (400 to 600) or color shifts (Charcoal to Gold), never through slanted type.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-like" for a luxury brand. We move toward **Tonal Layering**.

*   **The Layering Principle:** Place a White (#FFFFFF) card on an Ivory (#F2ECDD) background. The 2% shift in brightness is enough to define the object without visual clutter.
*   **Ambient Shadows:** If a floating element (like a cart drawer) requires lift, use an "Ambient Shadow": `box-shadow: 0 20px 40px rgba(31, 27, 22, 0.05)`. The shadow color is a 5% opacity version of our Charcoal text color, mimicking natural light.
*   **The "Ghost Border" Fallback:** For inputs and buttons, use the `outline-variant` (Hairline #E6DFCC). If extra definition is needed on white backgrounds, reduce this border opacity to 40%. Never use high-contrast black borders.
*   **Corner Radii:** We use a "Micro-Radius" system. 2px for functional elements (Inputs/Buttons) and 4px for containers (Cards/Modals). This keeps the look sharp and "tailored," avoiding the "bubbly" feel of consumer apps.

---

## 5. Components

### Buttons
*   **Primary:** Gold (#D5C68F) fill, Charcoal (#1F1B16) text. Uppercase. 2px radius. No shadow.
*   **Secondary:** Ghost style. Hairline (#E6DFCC) border, Charcoal text.
*   **Interaction:** On hover, the Primary button should shift to a slightly deeper gold; the Secondary button should take a Cream (#FAF6EE) fill.

### Input Fields
*   **Style:** Minimalist. 2px corner radius. Hairline border. 
*   **States:** On focus, the border shifts to Gold (#D5C68F). Errors use `error` (#9B2C2C) text and a 1px Clay (#B45A3C) border for a softer, high-end warning.

### Cards & Product Lists
*   **Forbid Dividers:** Do not use lines between list items. Use 32px or 48px of vertical whitespace to separate products.
*   **The "Hanging" Layout:** Images should have a subtle 4px radius. Product titles should be Poppins 600, 16px. Prices in Graphite (#4A443D).

### Signature Component: The Editorial Band
*   A full-width Ivory (#F2ECDD) section used for storytelling. Text is center-aligned with high vertical padding (120px) to force a "slow down" in the user's scroll speed.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Place an image on the left 7 columns and text on the right 4 columns, leaving one column of "dead air" for luxury.
*   **Do** use extreme vertical padding (80px–120px) between sections. Space is the ultimate luxury.
*   **Do** ensure all "Sale" or "Rare" indicators use the Clay (#B45A3C) ribbon sparingly.

### Don’t:
*   **Don’t** use italics for any reason. If you need emphasis, use weight.
*   **Don’t** use 1px dividers to separate sections. Use the Ivory/Cream background shift.
*   **Don’t** use standard "Blue" for links. All links are Charcoal with a Gold underline on hover.
*   **Don’t** use center-aligned body text for more than three lines. Keep long-form text left-aligned for readability and a "newsletter" feel.