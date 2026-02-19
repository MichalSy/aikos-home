export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="glass p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🌸 Aiko's Home
          </span>
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Next.js Control Center - Coming Soon
        </p>
        <div className="text-sm text-gray-400">
          ✅ Next.js Setup<br/>
          🚧 SQLite Integration<br/>
          🚧 WebSocket Server<br/>
          🚧 Quest Board Migration
        </div>
      </div>
    </main>
  );
}
