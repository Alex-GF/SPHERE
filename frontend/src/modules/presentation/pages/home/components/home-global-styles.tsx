export default function HomeGlobalStyles() {
  return (
    <style>
      {`@keyframes sphere-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes hero-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }`}
    </style>
  );
}
