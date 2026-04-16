<template>
  <div class="app-shell">
    <div class="ambient ambient-a" />
    <div class="ambient ambient-b" />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #f4f7fb;
  --bg-soft: rgba(255, 255, 255, 0.76);
  --panel: rgba(255, 255, 255, 0.88);
  --panel-strong: rgba(255, 255, 255, 0.96);
  --line: rgba(104, 123, 155, 0.14);
  --line-strong: rgba(81, 102, 142, 0.24);
  --text: #172033;
  --muted: #64708a;
  --accent: #6c63ff;
  --accent-2: #3d7cff;
  --accent-3: #53c8b6;
  --warning: #ffb24d;
  --shadow: 0 18px 44px rgba(25, 43, 78, 0.08);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 14px;
  --font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  min-height: 100%;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(108, 99, 255, 0.12), transparent 28%),
    radial-gradient(circle at 88% 10%, rgba(61, 124, 255, 0.10), transparent 24%),
    linear-gradient(180deg, #f8fbff 0%, #f2f6fb 52%, #eef3f9 100%);
  color: var(--text);
  font-family: var(--font);
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input {
  font: inherit;
}

.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.app-main {
  position: relative;
  z-index: 2;
  width: min(1360px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 28px 0 42px;
}

.ambient {
  position: fixed;
  border-radius: 999px;
  filter: blur(95px);
  opacity: 0.9;
  pointer-events: none;
  z-index: 1;
}

.ambient-a {
  width: 300px;
  height: 300px;
  left: -80px;
  top: 120px;
  background: rgba(108, 99, 255, 0.10);
}

.ambient-b {
  width: 340px;
  height: 340px;
  right: -90px;
  top: 200px;
  background: rgba(61, 124, 255, 0.09);
}

.card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.90));
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(108, 99, 255, 0.14);
  background: rgba(108, 99, 255, 0.06);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-size: clamp(24px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: -0.04em;
}

.subtitle {
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.7;
  max-width: 760px;
  font-size: 15px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric {
  min-width: 0;
  padding: 15px 16px;
  border-radius: var(--radius-lg);
  background: rgba(247, 250, 255, 0.92);
  border: 1px solid rgba(104, 123, 155, 0.10);
}

.metric-label {
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-value {
  margin-top: 8px;
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.metric-value small {
  font-size: 12px;
  color: var(--muted);
  margin-left: 4px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.label-box {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.input-box {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(104, 123, 155, 0.18);
  background: rgba(255, 255, 255, 0.94);
  color: var(--text);
  outline: none;
  transition: 0.18s ease;
}

.input-box:focus {
  border-color: rgba(108, 99, 255, 0.42);
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.10);
}

.section-title {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 1080px) {
  .metric-grid,
  .input-grid {
    grid-template-columns: 1fr;
  }

  .app-main {
    width: min(1360px, calc(100vw - 22px));
    padding-top: 16px;
  }
}

@media (max-width: 640px) {
  .panel-heading {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 14px;
  }

  .card {
    border-radius: 22px;
  }

  .metric {
    padding: 13px 14px;
  }

  .metric-value {
    font-size: 18px;
  }

  .metric-value small {
    display: inline-block;
    margin-left: 2px;
  }
}
</style>
