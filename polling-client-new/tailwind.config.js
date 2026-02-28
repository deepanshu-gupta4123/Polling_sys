/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#7765DA",
                secondary: "#5767D0",
                accent: "#4F0DCE",
                light: "#F2F2F2",
                dark: "#373737",
                muted: "#6E6E6E",
            },
            backgroundImage: {
                brand: "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
            },
        },
    },
    plugins: [],
};
