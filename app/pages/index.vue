<script setup lang="ts">
import Resonator from '~/components/Resonator.vue'
import Waveguide from '~/components/Waveguide.vue'
</script>

<template>
  <section class="page-grid">
    <header class="hero card">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">Integrated photonics playground</span>
          <h1 class="title">Waveguide × Ring Resonator</h1>
          <p class="subtitle">
            Interactive visualization of an optical slab waveguide and ring resonator coupling model.
            Tune material parameters, wavelength and coupling coefficients to inspect effective index,
            propagation constant and the drop-port spectral response.
          </p>
        </div>
      </div>
      <div class="hero-strip">
        <div class="hero-pill">Light interface</div>
        <div class="hero-pill">Responsive layout</div>
        <div class="hero-pill">Realtime spectrum</div>
      </div>
    </header>

    <div class="content-grid">
      <Waveguide />
      <Resonator />
    </div>
  </section>
</template>

<style scoped>
.page-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero {
  padding: 28px;
}

.hero-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.06);
  border: 1px solid rgba(108, 99, 255, 0.12);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 20px;
  }

  .hero-strip {
    margin-top: 14px;
  }

  .hero-pill {
    font-size: 11px;
  }
}
</style>
