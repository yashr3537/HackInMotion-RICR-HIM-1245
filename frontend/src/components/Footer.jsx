import { Leaf, ArrowUpRight, ShieldCheck, Wind } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-950 text-forest-200/80">
      {/* =====================================================
          Ambient background
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-forest-500/10 blur-3xl float-slow" />

        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-mist-300/6 blur-3xl float-gentle" />

        <div className="environment-grid absolute inset-0 opacity-[0.12]" />
      </div>

      {/* =====================================================
          Main footer
      ====================================================== */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:px-8 md:grid-cols-4 lg:py-16">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="fade-up">
            <div className="group flex w-fit items-center gap-3">
              <div className="card-hover flex h-10 w-10 items-center justify-center rounded-xl border border-forest-400/15 bg-forest-500/10">
                <Leaf
                  size={17}
                  className="text-forest-300 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                />
              </div>

              <div>
                <div className="font-display text-lg font-semibold tracking-tight text-white">
                  AirGuard
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-forest-300/55">
                  Environmental Safety
                </div>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-forest-200/65">
              See the air. Understand the risk. Take action.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-forest-300/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-forest-200/55">
              <ShieldCheck size={12} className="text-forest-300" />
              Built for environmental awareness
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="fade-up" style={{ animationDelay: '100ms' }}>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-forest-400">
            Product
          </p>

          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="/#features"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                Features
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>

            <li>
              <a
                href="/#how-it-works"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                How It Works
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>

            <li>
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                Dashboard
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="fade-up" style={{ animationDelay: '180ms' }}>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-forest-400">
            Company
          </p>

          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="/#about"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                About
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>

            <li>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                Privacy
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>

            <li>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 text-forest-200/70 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                Terms
                <ArrowUpRight
                  size={12}
                  className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* =====================================================
          Bottom bar
      ====================================================== */}
      <div className="relative z-10 border-t border-forest-900/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-forest-400">
            <Wind size={12} className="text-forest-300/70" />© {currentYear} AirGuard
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-forest-400/70">
            <span>Demo build</span>
            <span className="h-1 w-1 rounded-full bg-forest-500/60" />
            <span>Illustrative data</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
