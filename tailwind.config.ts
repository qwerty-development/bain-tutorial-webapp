import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand palette
        "brand-red": "#CC0000",
        "brand-gray": "#333333",
        "brand-blue": "#2D475A",
        "brand-pink": "#640A40",
        "brand-yellow": "#AB8933",
        "brand-green": "#104C3E",
        blue: {
          900: "#2D475A",
        },
        red: {
          500: "#CC0000",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
