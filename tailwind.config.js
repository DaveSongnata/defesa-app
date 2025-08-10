/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/navigation/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#1B1A1D',
        surface: '#2A292C',
        inputBg: '#2D2B2E',
        text: '#FDFDFD',
        muted: '#A7A7A8',
        border: '#555557',
        primary: '#17CB86',
        primaryDark: '#11A36C',
        danger: '#FB4C4C',
        success: '#11C884',
        warning: '#502224',
      },
      fontFamily: {
        'poppins': ['Poppins_400Regular', 'Poppins', 'sans-serif'],
        'poppins-medium': ['Poppins_500Medium', 'Poppins', 'sans-serif'],
        'poppins-semibold': ['Poppins_600SemiBold', 'Poppins', 'sans-serif'],
        'poppins-bold': ['Poppins_700Bold', 'Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
      },
    },
  },
  plugins: [],
}