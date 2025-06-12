"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Circle, Scan } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useJoinEvent } from "@/hooks/useJoinEvent";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Rocket, Zap } from "lucide-react";
import { InfiniteSlider } from "./infinite-slider";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometric({
  badge = "Design Collective",
  title1 = "Elevate Your Digital Vision",
  title2 = "Crafting Exceptional Websites",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { joinEvent, isJoining } = useJoinEvent();

  const handleScanSuccess = (decodedText: string) => {
    console.log("QR Code decoded:", decodedText);
    setShowScanner(false);

    try {
      // Handle different QR code formats
      let accessCode = "";

      // Check if it's a URL with access code parameter
      if (decodedText.includes("code=")) {
        const url = new URL(decodedText);
        accessCode = url.searchParams.get("code") || "";
      }
      // Check if it's just a 6-digit access code
      else if (/^\d{6}$/.test(decodedText.trim())) {
        accessCode = decodedText.trim();
      }
      // Handle connect:// protocol URLs
      else if (decodedText.startsWith("connect://")) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        if (pathParts.length >= 2 && pathParts[1] === "event") {
          const eventId = pathParts[2];
          if (eventId) {
            navigate(`/join/${eventId}`);
            return;
          }
        }
      }

      if (accessCode && /^\d{6}$/.test(accessCode)) {
        console.log("Extracted access code:", accessCode);
        joinEvent(accessCode);
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid Connect event code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("QR Code parsing error:", error);
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid Connect event code.",
        variant: "destructive",
      });
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scanner error:", error);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-pink-500/80" />
            <span className="text-sm text-white/60 tracking-wide">{badge}</span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 "
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-white/50 mb-8 leading-relaxed font-light tracking-wide max-w-4xl mx-auto px-4">
              Experience a better way to network at events. Smart matchmaking,
              efficient connections, and engaging interactions that enhance your
              event experience.
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-20">
              <Button
                size="lg"
                className="bg-gradient-to-r  rounded-full from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 border-0 px-8 py-8 text-lg  transform hover:scale-105 transition-all duration-600"
                onClick={() => setShowScanner(true)}
                disabled={isJoining}
              >
                <Scan className="mr-2 h-5 w-5" />
                {isJoining ? "Joining..." : "Scan Event"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[0.5px] bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-xl px-8 py-8 rounded-full text-lg transform hover:scale-105 transition-all duration-600"
                onClick={() => navigate("/register?role=host")}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </div>
          </motion.div>

          {showScanner && (
            <div className="max-w-md mx-auto">
              <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
                <h3 className="text-xl font-semibold mb-6 text-white text-center flex items-center justify-center">
                  <Zap className="mr-2 h-5 w-5 text-cyan-400" />
                  QR Scanner Active
                </h3>
                <QRCodeScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
                <Button
                  variant="ghost"
                  className="mt-6 w-full text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setShowScanner(false)}
                  disabled={isJoining}
                >
                  Close Scanner
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="relative py-6 mt-24">
          <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit invert"
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                height="20"
                width="auto"
              />
            </div>

            <div className="flex">
              <img
                className="mx-auto h-4 w-fit invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-4 w-fit invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                height="20"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-5 w-fit invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                height="20"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-4 w-fit invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                height="16"
                width="auto"
              />
            </div>
            <div className="flex">
              <img
                className="mx-auto h-7 w-fit invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                height="28"
                width="auto"
              />
            </div>

            <div className="flex">
              <img
                className="mx-auto h-6 w-fit invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                height="24"
                width="auto"
              />
            </div>
          </InfiniteSlider>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}

export { HeroGeometric };
