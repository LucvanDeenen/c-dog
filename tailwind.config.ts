export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#202225',
          darker: '#2f3136',
          darkest: '#36393f',
          blurple: '#5865f2',
          blue: '#00b0f4',
          green: '#57f287',
          red: '#ed4245',
          gray: '#40444b',
        },
      },
    },
  },
  plugins: [],
}
