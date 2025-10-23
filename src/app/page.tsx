"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight } from "lucide-react";
import { toast } from "@/lib/toast";
import { useCopyRoomUrlToClipboard } from "@/hooks/use-copy-room-url-to-clipboard";
import {
  Banner,
  HowItWorks,
  FAQ,
  UseCases,
  CallToAction,
  AppPreview,
  FeaturesSection,
} from "@/components/homepage";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GithubIcon } from "@/components/icons";

export default function HomePage() {
  const router = useRouter();
  const createRoom = useMutation(api.rooms.create);
  const { copyRoomUrlToClipboard } = useCopyRoomUrlToClipboard();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name: `Game ${new Date().toLocaleTimeString()}`,
        roomType: "canvas",
      });

      await copyRoomUrlToClipboard(roomId);
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
      <Banner />

      <Header />

      <main
        id="main-content"
        className="relative isolate overflow-hidden bg-white dark:bg-gray-900"
      >
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 dark:stroke-gray-800 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="hero-pattern"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg
              x="50%"
              y={-1}
              className="overflow-visible fill-gray-50 dark:fill-gray-900/20"
            >
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#hero-pattern)"
            />
          </svg>
          <div
            className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
            aria-hidden="true"
          >
            <div
              className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary/30 to-purple-600/30 opacity-20 dark:from-primary/20 dark:to-purple-600/20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              Estimate stories with
              <span className="relative">
                <span className="relative bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Planning Poker
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8.5C2 8.5 101 2 149.5 2C198 2 298 8.5 298 8.5"
                    stroke="url(#hero-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="hero-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of Agile teams using our intuitive platform for
              collaborative story point estimation. No sign-up, no fees, just
              pure efficiency.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                data-testid="hero-start-button"
                className="group relative inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-primary/90 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start New Game
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                {/* Animated glow effect */}
                <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/50 blur-xl" />
              </button>

              <a
                href="https://github.com/INQTR/poker-planning"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-github-link"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <GithubIcon className="h-5 w-5" />
                View on GitHub
              </a>
            </div>

            {/* Trust indicators with animation */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2" data-testid="trust-free">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2" data-testid="trust-no-account">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>No Account Required</span>
              </div>
              <div className="flex items-center gap-2" data-testid="trust-realtime">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>Real-time Collaboration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />

        <AppPreview />
        <HowItWorks />
        <FeaturesSection />
        <UseCases />
        {/* TODO: we need to get real testimonials from real users */}
        {/* <Testimonials /> */}
        <FAQ />
        <CallToAction onStartGame={handleCreateRoom} loading={isCreating} />
      </main>

      <Footer />
    </div>
  );
}
