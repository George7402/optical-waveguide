<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { waveGuide } from '~/stores/waveguideStore'

const waveGuideStore = waveGuide()

class WaveGuide {
  public width: number
  public height: number
  public materialRefIndex: number
  public environmentRefIndex: number
  public effRefIndex: number
  public widthCss: number
  public heightCss: number
  public waveLength: number

  constructor(width: number, height: number, materialRefIndex: number, environmentRefIndex: number, wavelength: number) {
    this.width = width
    this.height = height * 1e-9
    this.materialRefIndex = materialRefIndex
    this.environmentRefIndex = environmentRefIndex
    this.effRefIndex = 0
    this.widthCss = 320
    this.heightCss = 26
    this.waveLength = wavelength * 1e-9
  }

  calcEffRefIndex(): number {
    const k0 = (2 * Math.PI) / this.waveLength
    let a = this.environmentRefIndex + 1e-6
    let b = this.materialRefIndex - 1e-6

    for (let i = 0; i < 1000; i++) {
      const x = (a + b) / 2
      const kx = k0 * Math.sqrt(this.materialRefIndex ** 2 - x ** 2)
      const kappa = k0 * Math.sqrt(x ** 2 - this.environmentRefIndex ** 2)
      const f = Math.tan((kx * this.height) / 2) - kappa / kx
      const kxA = k0 * Math.sqrt(this.materialRefIndex ** 2 - a ** 2)
      const kappaA = k0 * Math.sqrt(a ** 2 - this.environmentRefIndex ** 2)
      const fA = Math.tan((kxA * this.height) / 2) - kappaA / kxA

      if (f * fA < 0) b = x
      else a = x
    }

    this.effRefIndex = (a + b) / 2
    return this.effRefIndex
  }

  calcBeta(): number {
    return ((2 * Math.PI) / this.waveLength) * this.calcEffRefIndex()
  }
}

class Photon {
  public diameter: number
  public color: string
  public top: number
  public left: number
  public speed: number

  constructor(diameter: number, color: string) {
    this.diameter = diameter
    this.color = color
    this.top = 0
    this.left = 0
    this.speed = 2.3
  }

  flyAnimation(waveGuide: WaveGuide) {
    this.top = (waveGuide.heightCss - this.diameter) / 2
    const animate = () => {
      this.left += this.speed
      if (this.left > waveGuide.widthCss + 50) this.left = -18
      requestAnimationFrame(animate)
    }
    animate()
  }
}

const waveguideHeight = ref<number>(300)
const nMat = ref<number>(1.46)
const nEnv = ref<number>(1)
const wavelength = ref<number>(1000)

const waveguide = reactive(new WaveGuide(1000e-9, waveguideHeight.value, nMat.value, nEnv.value, wavelength.value))
const photon = reactive(new Photon(10, '#53c8b6'))

watch([waveguideHeight, wavelength, nEnv, nMat], () => {
  waveguide.height = waveguideHeight.value * 1e-9
  waveguide.materialRefIndex = nMat.value
  waveguide.environmentRefIndex = nEnv.value
  waveguide.waveLength = wavelength.value * 1e-9
})

const neff = computed(() => waveguide.calcEffRefIndex())
const beta = computed(() => waveguide.calcBeta())

const coreThicknessPx = computed(() => {
  const normalized = Math.max(18, Math.min(58, waveguideHeight.value / 7))
  return `${normalized}px`
})

watch([neff, beta, waveguideHeight, nMat, nEnv], () => {
  waveGuideStore.neff = neff.value
  waveGuideStore.betta = beta.value
  waveGuideStore.waveguide_height = waveguideHeight.value * 1e-9
  waveGuideStore.n_mat = nMat.value
  waveGuideStore.n_env = nEnv.value
}, { immediate: true })

onMounted(() => {
  photon.flyAnimation(waveguide)
})
</script>

<template>
  <section class="card waveguide-card">
    <div class="panel-heading compact">
      <div>
        <span class="eyebrow">Optical mode</span>
        <h2 class="section-title waveguide-title">Waveguide model</h2>
      </div>
      <div class="chip">TE-like approximation</div>
    </div>

    <div class="visual-card">
      <div class="visual-caption">
        <span>Core / cladding cross-section</span>
        <span>{{ wavelength }} nm</span>
      </div>

      <div class="waveguide-scene">
        <div class="cladding top" />
        <div class="guide-shell">
          <div class="guide-core" :style="{ height: coreThicknessPx }">
            <div class="guide-glow" />
            <div class="photon" :style="{ left: `${photon.left}px`, top: `${photon.top}px`, background: photon.color, boxShadow: `0 0 16px ${photon.color}` }" />
          </div>
        </div>
        <div class="cladding bottom" />
      </div>
    </div>

    <div class="metric-grid waveguide-metrics">
      <div class="metric">
        <div class="metric-label">Effective index</div>
        <div class="metric-value">{{ neff.toFixed(4) }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Propagation constant</div>
        <div class="metric-value">{{ beta.toFixed(0) }}<small>m⁻¹</small></div>
      </div>
      <div class="metric">
        <div class="metric-label">Core thickness</div>
        <div class="metric-value">{{ waveguideHeight }}<small>nm</small></div>
      </div>
    </div>

    <div class="controls-block">
      <h3 class="section-title">Parameters</h3>
      <div class="input-grid">
        <div class="input-group">
          <label class="label-box" for="waveguide-height-input">Core height, nm</label>
          <input id="waveguide-height-input" v-model.number="waveguideHeight" class="input-box" type="number" min="50" step="10">
        </div>
        <div class="input-group">
          <label class="label-box" for="wavelength-input">Wavelength, nm</label>
          <input id="wavelength-input" v-model.number="wavelength" class="input-box" type="number" min="100" step="10">
        </div>
        <div class="input-group">
          <label class="label-box" for="n-mat-input">Core refractive index</label>
          <input id="n-mat-input" v-model.number="nMat" class="input-box" type="number" min="1" step="0.01">
        </div>
        <div class="input-group">
          <label class="label-box" for="n-env-input">Cladding refractive index</label>
          <input id="n-env-input" v-model.number="nEnv" class="input-box" type="number" min="1" step="0.01">
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.waveguide-card {
  padding: 24px;
}

.compact {
  margin-bottom: 12px;
}

.waveguide-title {
  margin: 8px 0 0;
  font-size: 24px;
}

.chip {
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(61, 124, 255, 0.06);
  border: 1px solid rgba(61, 124, 255, 0.14);
  color: #3867d6;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.visual-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(104, 123, 155, 0.10);
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(245, 249, 255, 0.92));
}

.visual-caption {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 14px;
}

.waveguide-scene {
  display: grid;
  gap: 10px;
}

.cladding {
  height: 36px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(61, 124, 255, 0.06), rgba(108, 99, 255, 0.03));
  border: 1px solid rgba(61, 124, 255, 0.08);
}

.guide-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 22px;
  background: linear-gradient(180deg, #eef5ff, #f9fbff);
  border: 1px solid rgba(104, 123, 155, 0.10);
  overflow: hidden;
}

.guide-core {
  position: relative;
  width: 100%;
  border-top: 1px solid rgba(83, 200, 182, 0.8);
  border-bottom: 1px solid rgba(83, 200, 182, 0.8);
  background: linear-gradient(90deg, rgba(83, 200, 182, 0.08), rgba(61, 124, 255, 0.12), rgba(108, 99, 255, 0.08));
}

.guide-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(83, 200, 182, 0.08), transparent);
}

.photon {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.waveguide-metrics {
  margin-top: 16px;
}

.controls-block {
  margin-top: 18px;
}

@media (max-width: 1080px) {
  .waveguide-card {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .waveguide-title {
    font-size: 21px;
  }

  .visual-card {
    padding: 14px;
  }

  .visual-caption {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .guide-shell {
    min-height: 96px;
  }

  .chip {
    align-self: flex-start;
  }
}
</style>
