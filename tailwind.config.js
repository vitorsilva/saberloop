  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "var(--color-primary)",  // Changed from "#4A90E2"
          "primary-hover": "var(--color-primary-hover)",  // Add this new color
          "background-light": "#F8F9FA",
          "background-dark": "#121212",
          "card-light": "#FFFFFF",
          "card-dark": "#1E1E1E",
          "text-light": "#212529",
          "text-dark": "#EAEAEA",
          "subtext-light": "#6c757d",
          "subtext-dark": "#96a8c5",
          "border-light": "#E9ECEF",
          "border-dark": "#3A3A3C",
          "success": "#7ED321",
          "error": "#D0021B"
        },
        fontFamily: {
          "display": ["Inter", "sans-serif"]
        },
        borderRadius: {
          "DEFAULT": "0.5rem",
          "lg": "0.75rem",
          "xl": "1rem",
          "full": "9999px"
        },
      },
    },
    plugins: [],
  }