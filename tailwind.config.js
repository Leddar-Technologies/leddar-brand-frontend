/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        leather: "#6B3A2A",
        gold: "#C49A3C",
        cream: "#FAF7F4",
        espresso: "#1C1412",
        ink: "#1A1A1A",
        success: "#2D6A4F",
        danger: "#B42318",
      },
      boxShadow: {
        card: "0 10px 25px rgba(28, 20, 18, 0.08)",
      },
    },
  },
  plugins: [],
};
