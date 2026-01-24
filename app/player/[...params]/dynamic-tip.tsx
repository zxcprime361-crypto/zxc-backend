import { useEffect, useState } from "react";

const tips = [
  "Tip: Stuck on loading? Try switching the server.",
  "Please wait… fetching resources, almost there!",
  "One moment please… good things take time!",
  "Still not working? Try another server 😅",
  "Visit us on zxcprime.icu 🎬",
  "Did you know? Refreshing the page can work wonders ✨",
  "Hang tight! Your stream is on the way 🚀",
  "See the cloud icon at the top? That's for server selection.",
  "Patience is a virtue… your video is loading 🍿",
  "Almost there… your movie marathon awaits 🎬",
  "Pro tip: Closing other heavy apps may improve streaming speed.",
  "Fun fact: Sometimes switching servers boosts your connection.",
  "Tip: Make sure your internet is stable for the best experience!",
];

export default function DynamicTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setFade(true); // fade in next tip
      }, 500); // match transition duration
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute lg:bottom-4 bottom-2 left-1/2 -translate-x-1/2 z-10 text-white lg:text-lg lg:font-semibold font-medium text-center text-sm transition-opacity duration-500 w-full p-4 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    >
      {tips[currentTipIndex]}
    </div>
  );
}
