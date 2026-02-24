import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Sambung Ayat
        </h1>
        <p className="text-lg leading-8 text-gray-600 max-w-xl">
          A minimalist tool to practice your Qur'an memorization. Continue the verse and test your recall.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/practice"
            className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Start Practice
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/yourusername/sambung-ayat"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Sambung Ayat. All rights reserved.</p>
      </footer>
    </div>
  );
}
