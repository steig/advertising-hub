export function landingHTML(domain: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ad Hub - Advertising Management Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white">
  <div class="min-h-screen flex flex-col">
    <nav class="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
      <span class="text-xl font-bold">Ad Hub</span>
      <a href="https://console.${domain}/login" class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Sign In</a>
    </nav>
    <main class="flex-1 flex items-center justify-center px-6">
      <div class="max-w-3xl text-center">
        <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Manage All Your Advertising in One Place</h1>
        <p class="text-xl text-slate-300 mb-8">AI-powered agents, multi-platform management, and team collaboration — built for modern advertising teams.</p>
        <a href="https://console.${domain}/login" class="inline-block px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold">Get Started</a>
      </div>
    </main>
    <section class="py-20 px-6">
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div class="bg-slate-800 rounded-xl p-6">
          <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">Multi-Platform Management</h3>
          <p class="text-slate-400">Manage campaigns across Google Ads, Meta, TikTok, and more from a single dashboard.</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-6">
          <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">AI Agents</h3>
          <p class="text-slate-400">Specialized AI agents that understand advertising — optimize bids, generate copy, and analyze performance.</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-6">
          <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">Team Collaboration</h3>
          <p class="text-slate-400">Invite your team, manage roles, and collaborate on advertising strategies together.</p>
        </div>
      </div>
    </section>
    <footer class="border-t border-slate-800 py-8 px-6">
      <div class="max-w-6xl mx-auto flex justify-between items-center text-sm text-slate-400">
        <span>Ad Hub</span>
        <div class="flex gap-6">
          <a href="#" class="hover:text-white transition-colors">Privacy</a>
          <a href="#" class="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
