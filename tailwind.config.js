module.exports = {
  content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      "book-antiqua": ["Book Antiqua", "serif"],
    },
      extend: {
          animation: {
              slideIn: 'slideIn 0.3s ease-out',
              customPing: 'customPing 2s ease-in-out infinite',
              spin: 'spin 1s linear infinite',
              grow: 'grow 0.5s ease-in-out',
              slideOutRight: 'slideOutRight 0.5s ease-out', // Define slideOutRight animation
          },
          keyframes: {
              slideIn: {
                  '0%': {
                      transform: 'translateY(100%)',
                  },
                  '100%': {
                      transform: 'translateY(0)',
                  },
              },
              customPing: {
                  '0%': {
                      transform: 'scale(1)',
                  },
                  '50%': {
                      transform: 'scale(1.5)',
                  },
                  '100%': {
                      transform: 'scale(1)',
                  },
              },
              spinning: {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
              },
              grow: {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.5)' },
                  '100%': { transform: 'scale(1)' },
              },
              slideOutRight: {
                  '0%': { transform: 'translateX(0)', opacity: 1 },
                  '100%': { transform: 'translateX(100%)', opacity: 0 },
              },
          },
          backgroundImage: {
              "custom-gradient": "linear-gradient(180deg, #252525 0%, #3D3B42 100%)",
          },
          colors: {
              "custom-brown": "#4F3825",
              "new-arrival": "#A18168",
              cream: "#FCF7F3",
              brown: "#966641",
          },
      },
  },
  plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/aspect-ratio'),
  ],
};
