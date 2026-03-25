# Design System Strategy: The Verdant Simulator

## 1. Overview & Creative North Star

**Creative North Star: "The Architectural Ledger"**

This design system moves away from the chaotic, high-density layouts typical of financial software. Instead, it adopts an editorial, high-end real estate aesthetic that feels both authoritative and serene. The goal is to transform "data entry" into "wealth curation."

We achieve this through **Intentional Asymmetry**. By utilizing a split-screen layout—where the left acts as a static "Results Anchor" and the right as an "Action Scroll"—we create a sense of grounded permanence. We break the template look by layering components like fine paper on a desk, using large-scale typography and generous whitespace (Spacing 16 and 20) to signal premium quality.

---

## 2. Colors

Our palette is rooted in botanical depth and paper-like neutrals. We avoid high-contrast clinical blacks in favor of charcoal and deep emerald.

- **Primary Tier:** `primary` (#012D1D) is reserved for moments of ultimate focus. `primary_container` (#1B4332) serves as the "hero" green for active states and primary CTAs.
- **Secondary/Sage Tier:** `secondary_fixed` (#D6E6DD) provides the "soft sage" wash used for large background areas or sidebars to reduce eye strain.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to define sections. Sectioning must be achieved through:

1.  **Background Shifts:** Placing a `surface_container_lowest` (#FFFFFF) card on a `surface` (#F9F9F8) background.
2.  **Tonal Transitions:** Using the `secondary_container` to subtly highlight a focused input area.

### Glass & Gradient Rule

To elevate the simulator beyond "standard UI," floating summaries or mobile overlays should utilize **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 20px.

- **Signature Texture:** Primary buttons should feature a subtle linear gradient from `primary` to `primary_container` (150° angle) to give a tactile, "weighted" feel.

---

## 3. Typography

The system uses a sophisticated pairing of **Manrope** (Display/Headline) for architectural strength and **Inter** (Title/Body) for functional clarity.

- **Display (Manrope):** Used for "Hero Numbers" like the Calculated Yield. These should feel like an editorial headline, typeset with tight letter-spacing (-0.02em).
- **Headline/Title:** Large, dark charcoal (`on_surface`) text provides the structural narrative.
- **Body (Inter):** Maximizes readability. Use `body-lg` (1rem) for form labels to ensure the simulator feels accessible and high-end, never cramped.

---

## 4. Elevation & Depth

We eschew traditional material shadows in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is "stacked." The sidebar uses `secondary_fixed` (#D6E6DD). The main work area uses `surface` (#F9F9F8). Interaction cards use `surface_container_lowest` (#FFFFFF). This creates a three-dimensional hierarchy without a single line being drawn.
- **Ambient Shadows:** Where elements must float (e.g., a "Result" tooltip), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(27, 67, 50, 0.06)`. Note the green tint in the shadow—this mimics natural light passing through an emerald lens.
- **The Ghost Border Fallback:** If a boundary is legally or functionally required, use `outline_variant` (#C1C8C2) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Form Sections (Accordion-Style)

Forms are grouped into expansive, rounded containers (`xl`: 1.5rem). Use "Surface Nesting" to show active sections: an active accordion should shift from `surface_container_low` to `surface_container_lowest` and gain a subtle ambient shadow.

### Large Numerical Inputs

Inputs are the heart of the simulator. Forgo the "thin line" input. Use large, soft blocks of `surface_container_high` (#E7E8E7) with 16px corner rounding. Typography inside inputs should use `title-lg` to make the data feel "heavy" and significant.

### Dynamic Results Sidebar

This is the "Results Anchor." It should remain fixed, utilizing the `secondary_fixed` (#D6E6DD) background.

- **Charts:** Use `primary` for data lines. Use a gradient fill (Primary to Transparent) for area charts to create "Visual Soul."
- **No Dividers:** Separate result metrics using `Spacing 8` (2.75rem) vertical gaps rather than horizontal rules.

### Buttons

- **Primary:** Rounded `full` (pill-shaped) or `xl`. Background: `primary_container`. Text: `on_primary`.
- **States:** On hover, shift background to `primary` and increase ambient shadow spread.

---

## 6. Do's and Don'ts

### Do:

- **Do** use the "Split-Screen" to maintain constant feedback. The user should see the "Yield" change as they type.
- **Do** embrace massive whitespace. If a section feels "empty," it’s likely working.
- **Do** use `headline-lg` for large currency values to make them feel like "achievements."

### Don't:

- **Don't** use 100% black. Use `on_surface` (#191C1C) for all text to keep the "Editorial" softness.
- **Don't** use standard "Error Red" boxes. Use a subtle wash of `error_container` (#FFDAD6) behind the input with an `on_error_container` (#93000A) label.
- **Don't** use sharp 90-degree corners. Everything in this system must feel organic and approachable (Minimum `lg` rounding).
