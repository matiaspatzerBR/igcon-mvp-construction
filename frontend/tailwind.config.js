/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the Heatmap as per specs
        status: {
          planned: '#e5e7eb', // gray-200
          in_progress: '#facc15', // yellow-400
          blocked: '#ef4444', // red-500
          rework: '#ef4444', // red-500
          verified: '#22c55e', // green-500
          pending: '#3b82f6', // blue-500
        }
      },
    },
  },
  plugins: [],
}
