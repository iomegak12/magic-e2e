---
name: Cortex Interface
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4d4354'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7e7385'
  outline-variant: '#cfc2d6'
  surface-tint: '#842bd2'
  primary: '#8127cf'
  on-primary: '#ffffff'
  primary-container: '#9c48ea'
  on-primary-container: '#fffbff'
  inverse-primary: '#ddb7ff'
  secondary: '#635b6e'
  on-secondary: '#ffffff'
  secondary-container: '#e9def5'
  on-secondary-container: '#696174'
  tertiary: '#7b5500'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b6b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#e9def5'
  secondary-fixed-dim: '#cdc2d9'
  on-secondary-fixed: '#1e1929'
  on-secondary-fixed-variant: '#4a4456'
  tertiary-fixed: '#ffdead'
  tertiary-fixed-dim: '#fabc4e'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.2'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  2xl: 4rem
  container-padding: 2rem
  sidebar-width: 280px
---

## Brand & Style

This design system is built on a foundation of **Modern Minimalism** with a focus on high-utility AI interaction. The aesthetic is defined by a "Digital Sanctuary" philosophy—creating an environment that feels calm, organized, and hyper-intelligent. 

The personality is professional yet approachable, leaning into the futuristic nature of AI through subtle glassmorphism and organic, soft-edged geometry. It prioritizes clarity over decoration, using generous whitespace to reduce cognitive load and high-quality typography to establish a clear information hierarchy. The interface should feel like a premium tool that fades into the background, allowing the user's content and the AI's intelligence to take center stage.

## Colors

The palette is centered around a vibrant but soft lavender primary color, used purposefully for high-intent actions and brand expression. 

- **Primary Lavender:** Used for primary buttons, active states, and AI-driven highlights.
- **Secondary Tint:** A very pale purple used for hover states, subtle backgrounds, and chip containers.
- **Neutrals:** A sophisticated range of cool grays and pure whites. The application uses white for main content areas to maximize legibility and light gray (#F3F4F6) for sidebars or secondary containers to create clear structural separation without harsh lines.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian, and highly legible characteristics. The type scale is designed to handle dense data and long-form AI responses with ease.

- **Headlines:** Feature tight letter-spacing and substantial weights to provide a strong anchor for sections.
- **Body:** Set with a generous line height (1.5 - 1.6) to ensure comfortable reading of AI-generated text.
- **Labels:** Used for navigation and UI controls, employing a medium weight to maintain visibility at smaller sizes.
- **Color Logic:** Use pure black or near-black for headlines, while secondary body text should transition to a medium gray to maintain a soft, approachable contrast.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy within a flexible container. The main application view is typically split into a narrow, functional sidebar and a expansive central "stage."

- **Generous Whitespace:** Margins between major UI blocks should be significant (xl or 2xl) to create a sense of focus and calm.
- **Content Centering:** Main chat or interactive threads are centered with a max-width to ensure the user's eye doesn't have to travel across the entire screen.
- **Sidebar:** A fixed-width column on the left handles navigation and history, using `sm` to `md` padding for a tighter, more utilitarian feel compared to the main stage.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layers** and **Ambient Shadows**.

- **Surfaces:** Use high-contrast between the background and the containers. The main background is a subtle gray, while primary work surfaces are pure white with `2xl` rounded corners.
- **Shadows:** Avoid harsh, dark shadows. Use extra-diffused, low-opacity (5-8%) shadows with a subtle lavender tint (#A855F7 at 5% opacity) to make elements feel like they are floating gently above the surface.
- **Glassmorphism:** For floating menus, tooltips, or top navigation bars, use a backdrop blur (12px - 20px) with a semi-transparent white fill (80% opacity) to maintain context of the underlying content.

## Shapes

The shape language is characterized by exaggerated "Soft-Tech" curves. 

- **Containers:** Large UI blocks and main windows use a **24px (1.5rem)** radius (2xl equivalent), creating a friendly, modern frame.
- **Interactions:** Buttons and input fields use a **12px - 16px** radius, ensuring they feel substantial and "clickable."
- **Icons:** Use a consistent 2px stroke weight with rounded caps and joins to match the softness of the UI geometry.

## Components

- **Buttons:** 
  - *Primary:* Solid lavender with white text. High-saturation, minimal elevation.
  - *Secondary:* Ghost style with a subtle gray border or a soft purple tint background.
- **Input Fields:** Large, pill-shaped or high-radius containers. Focus states should use a 2px lavender ring with a soft outer glow.
- **Cards/Action Tiles:** Pure white background, subtle border (#E5E7EB), and `xl` rounded corners. Use icon-top-left layouts with bold labels.
- **Chips/Badges:** Small, high-radius (pill) shapes with low-contrast background tints and medium-weight labels. Use for status or categories.
- **Chat Bubbles:** AI responses should be unbordered, relying on typography and icons for distinction. User inputs can be contained in subtle gray or lavender-tinted bubbles.
- **Prompt Bar:** A central floating component with a glassmorphism effect and integrated action icons (attachment, mic, settings).