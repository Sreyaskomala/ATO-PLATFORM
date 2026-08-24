import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aviation: {
          950: "#070b14",
          900: "#0b0f19",
          850: "#101626",
          800: "#151d33",
          750: "#1c2642",
          700: "#223053",
          600: "#334575",
        },
        skyline: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        hud: {
          cyan: "#00f2fe",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          indigo: "#6366f1",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-outfit)", "Outfit", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(0, 242, 254, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
