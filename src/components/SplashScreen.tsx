import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import splashVideo from "@/assets/fitnova-splash.mp4.asset.json";

const SplashScreen = () => {
  const [show, setShow] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const finish = () => setShow(false);
    v.addEventListener("ended", finish);
    // Safety timeout (video is ~6.7s)
    const t = setTimeout(finish, 7500);
    // Ensure autoplay on mobile
    v.play().catch(() => {});
    return () => {
      v.removeEventListener("ended", finish);
      clearTimeout(t);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <video
            ref={videoRef}
            src={splashVideo.url}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
