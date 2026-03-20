import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Mapeamos la variable de Next.js a una clase de Tailwind
                open: ["var(--font-open-sans)", "sans-serif"],
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
            colors: {
                roofing: {
                    blue: "#1e3a8a", // El azul de 'Advanced Roofing Team'
                    red: "#ef4444",  // El rojo del polígono y botones de acción
                }
            }
        },
    },
    plugins: [],
};
export default config;