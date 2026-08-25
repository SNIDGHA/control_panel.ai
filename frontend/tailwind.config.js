/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F172A",
          slate: "#475569",
          blue: "#3B82F6",
          indigo: "#6366F1",
          safe: "#10B981",     // Emerald for green/allow
          warning: "#F59E0B",  // Amber for warning/edit
          blocked: "#EF4444",  // Rose for blocked
          escalate: "#8B5CF6", // Purple for escalation
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
