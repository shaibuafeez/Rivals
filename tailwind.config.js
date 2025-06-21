import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Sophisticated black color palette
        ink: {
          50: '#FAFAFA',   // Near white for subtle contrasts
          100: '#F5F5F5',  // Light gray for surfaces
          200: '#E5E5E5',  // Soft borders
          300: '#D4D4D4',  // Muted elements
          400: '#A3A3A3',  // Disabled states
          500: '#737373',  // Secondary text
          600: '#525252',  // Primary UI elements
          700: '#404040',  // Emphasis elements
          800: '#262626',  // Dark surfaces
          900: '#171717',  // Deep backgrounds
          950: '#0A0A0A',  // True black
        },
        charcoal: {
          DEFAULT: '#1A1A1A', // Rich charcoal
          light: '#2A2A2A',   // Lighter variant
          dark: '#0F0F0F',    // Darker variant
        },
        obsidian: {
          DEFAULT: '#0D0D0D', // Deep obsidian black
          soft: '#1C1C1C',    // Softer variant
          shine: '#2F2F2F',   // With subtle shine
        },
        graphite: {
          DEFAULT: '#2B2B2B', // Graphite gray-black
          matte: '#232323',   // Matte finish
          metallic: '#3A3A3A', // Metallic sheen
        },
        onyx: {
          DEFAULT: '#0F0F0F', // Deep onyx
          polished: '#181818', // Polished surface
          raw: '#060606',     // Raw finish
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shine": "shine 2s infinite",
        "float": "float 3s ease-in-out infinite"
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark", "cyberpunk"],
  },
};

export default tailwindConfig;
