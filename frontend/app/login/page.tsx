import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-main">
        <header className="brutalist-header">
          <div className="brand-lockup">
            <p className="eyebrow">MOCK_MVP_PAPER_TRADING_ONLY / access layer</p>
            <h1 className="title">young investors</h1>
            <p className="brand-motto">Enter The Kitchen</p>
            <p className="subtitle">
              Educational simulation only. No live execution, no broker connection, and no real
              user funds.
            </p>
          </div>
        </header>

        <div className="grid grid-two">
          <section className="brutalist-card">
            <p className="eyebrow">Demo access</p>
            <h2 className="view-title">Login</h2>
            <p className="copy">
              This screen is a frontend mock for investor and Rhodes/TTO walkthroughs. Authentication
              is intentionally not connected to a live identity, bank, broker, or payment system.
            </p>
            <div className="status-line" style={{ marginTop: 14 }}>
              <Link href="/onboarding" className="login-link">
                Enter App
              </Link>
              <span className="badge">Paper only</span>
            </div>
          </section>

          <aside className="brutalist-card">
            <p className="eyebrow">Kitchen rules</p>
            <h2 className="section-title">Learn before you earn</h2>
            <p className="copy">
              The demo keeps Academy clearance, Kitchen voting, Gordon commentary, and the 60% Rule
              visible before any recipe can be treated as ready to cook.
            </p>
            <div className="status-line" style={{ marginTop: 14 }}>
              <Link href="/" className="badge">
                Back to Young Investors
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
