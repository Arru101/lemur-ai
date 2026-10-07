import Link from "next/link";
import LemurLogo from "../components/LemurLogo";
import { MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center bg-background select-none">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />
        <div className="w-20 h-20 rounded-3xl ios-glass flex items-center justify-center shadow-xl border border-white/20">
          <LemurLogo className="w-12 h-12" />
        </div>
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-primary/15 text-primary border border-primary/25 mb-3 tracking-widest">
        404 • Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans max-w-md">
        The page you are looking for does not exist.
      </h1>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md leading-relaxed">
        The URL may have moved or expired. Return to the chat workspace to converse with advanced AI assistants.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-lg shadow-primary/25 apple-spring active:scale-95 transition-all"
        >
          <MessageSquare className="w-4 h-4 stroke-[2]" />
          <span>Start New Chat</span>
        </Link>
      </div>
    </div>
  );
}
