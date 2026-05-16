/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Geist', 'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Instrument Serif'", "Georgia", "serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c2d3ff",
          300: "#93aeff",
          400: "#6c8fff",
          500: "#4f6ef7",
          600: "#3a50e0",
          700: "#2f3fc5",
          800: "#2734a0",
          900: "#1e2575",
        },
        surface: {
          0: "#ffffff",
          50: "#f8f9fc",
          100: "#f1f3f9",
          200: "#e4e8f5",
          300: "#d0d6eb",
          400: "#a0a8c8",
          500: "#6e77a0",
          600: "#4a5280",
          700: "#2e3460",
          800: "#1a1f45",
          900: "#0d1030",
        },
        success: { 50: "#edfdf6", 500: "#10b981", 700: "#047857" },
        warning: { 50: "#fffbeb", 500: "#f59e0b", 700: "#b45309" },
        danger: { 50: "#fef2f2", 500: "#ef4444", 700: "#b91c1c" },
        info: { 50: "#eff6ff", 500: "#3b82f6", 700: "#1d4ed8" },
      },
      boxShadow: {
        card: "0 1px 3px rgba(14, 20, 60, 0.06), 0 4px 16px rgba(14, 20, 60, 0.04)",
        "card-hover": "0 4px 12px rgba(14, 20, 60, 0.10), 0 12px 40px rgba(14, 20, 60, 0.08)",
        modal: "0 20px 60px rgba(14, 20, 60, 0.18), 0 4px 16px rgba(14, 20, 60, 0.10)",
        glow: "0 0 0 3px rgba(79, 110, 247, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.8s infinite",
        "score-fill": "scoreFill 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: 0, transform: "translateX(24px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        scoreFill: { "0%": { strokeDashoffset: 200 }, "100%": { strokeDashoffset: "var(--dash-offset)" } },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
