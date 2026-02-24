import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-20 text-center">
        <div className="max-w-3xl space-y-12 animate-fade-in">
          
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium tracking-wide mb-4">
              ✨ Beta Release
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground">
              Sambung <span className="text-primary font-serif italic">Ayat</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A calm, focused space to practice your Qur'an memorization. 
              <br className="hidden sm:block" />
              Continue the verse, test your recall, find peace.
            </p>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-8">
            <Link
              href="/practice"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium tracking-wide shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
            >
              Start Practice
              <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">→</span>
            </Link>
            
            <a
              href="https://github.com/dayeeen/sambung-ayat"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 rounded-full text-lg font-medium transition-all duration-300 min-w-[200px]"
            >
              View Source
            </a>
          </div>

          {/* Features Grid (Subtle) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                📖
              </div>
              <h3 className="font-semibold text-foreground">Verse by Verse</h3>
              <p>Practice continuously with instant feedback on your recitation recall.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                🧠
              </div>
              <h3 className="font-semibold text-foreground">Active Recall</h3>
              <p>Strengthen your memory by actively retrieving the next ayah.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center mx-auto text-primary mb-3">
                🌿
              </div>
              <h3 className="font-semibold text-foreground">Distraction Free</h3>
              <p>No ads, no points, no leaderboards. Just you and the Qur'an.</p>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground/60">
        <p>© {new Date().getFullYear()} Sambung Ayat. Built with intention.</p>
      </footer>
    </div>
  );
}
