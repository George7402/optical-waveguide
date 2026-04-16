<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { waveGuide } from '~/stores/waveguideStore'
import Chart from 'chart.js/auto'

const waveGuideStore = waveGuide()

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
    this.speed = 0.05
  }

  circleAnimation(resonator: Resonator) {
    let angle = 0
    const animate = () => {
      const center = resonator.radiusOuter - this.diameter / 2
      const orbit = ((resonator.radiusOuter - resonator.border) + (resonator.radiusInner + resonator.border)) / 2
      this.left = center + Math.cos(angle) * orbit
      this.top = center + Math.sin(angle) * orbit
      angle += this.speed
      requestAnimationFrame(animate)
    }
    animate()
  }
}

class Resonator {
  public radiusOuter: number
  public radiusInner: number
  public border: number

  constructor(radiusOuter: number, radiusInner: number, border: number) {
    this.radiusOuter = radiusOuter
    this.radiusInner = radiusInner
    this.border = border
  }

  calcPhase(beta: number, modeNumber: number): number {
    const path = (2 * Math.PI * modeNumber) / beta
    return path * beta
  }
}

const resonator = new Resonator(112, 84, 2)
const photon = reactive(new Photon(10, '#ffb24d'))

const transmission = ref<number>(0.999)
const damping = ref<number>(0.999)
const modeNumber = ref<number>(150)
const wavelengthFrom = ref<number>(900)
const wavelengthTo = ref<number>(1100)

const realRingRadius = computed(() => (modeNumber.value / waveGuideStore.betta) * 1e6)
const resonanceRadius = computed(() => modeNumber.value / waveGuideStore.betta)

const tDrop = computed(() => {
  const beta = waveGuideStore.betta
  const phi = resonator.calcPhase(beta, modeNumber.value)
  const t = transmission.value
  const a = damping.value

  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  const cosPhi2 = Math.cos(phi / 2)
  const sinPhi2 = Math.sin(phi / 2)

  const numRe = Math.sqrt(1 - t * t) * Math.sqrt(1 - a * a) * cosPhi2
  const numIm = Math.sqrt(1 - t * t) * Math.sqrt(1 - a * a) * (-sinPhi2)
  const denRe = 1 - t * a * cosPhi
  const denIm = -t * a * (-sinPhi)
  const denAbs2 = denRe * denRe + denIm * denIm
  const fracRe = (numRe * denRe + numIm * denIm) / denAbs2
  const fracIm = (numIm * denRe - numRe * denIm) / denAbs2

  return fracRe * fracRe + fracIm * fracIm
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chart = shallowRef<Chart | null>(null)

function calcEffRefIndex(waveLength: number): number {
  const k0 = (2 * Math.PI) / waveLength
  let a = waveGuideStore.n_env + 1e-6
  let b = waveGuideStore.n_mat - 1e-6

  for (let i = 0; i < 1000; i++) {
    const x = (a + b) / 2
    const kx = k0 * Math.sqrt(waveGuideStore.n_mat ** 2 - x ** 2)
    const kappa = k0 * Math.sqrt(x ** 2 - waveGuideStore.n_env ** 2)
    const f = Math.tan((kx * waveGuideStore.waveguide_height) / 2) - kappa / kx
    const kxA = k0 * Math.sqrt(waveGuideStore.n_mat ** 2 - a ** 2)
    const kappaA = k0 * Math.sqrt(a ** 2 - waveGuideStore.n_env ** 2)
    const fA = Math.tan((kxA * waveGuideStore.waveguide_height) / 2) - kappaA / kxA

    if (f * fA < 0) b = x
    else a = x
  }

  return (a + b) / 2
}

function calcBeta(waveLength: number): number {
  return ((2 * Math.PI) / waveLength) * calcEffRefIndex(waveLength)
}

function calcTdrop(waveLength: number): number {
  const beta = calcBeta(waveLength)
  const phi = 2 * Math.PI * resonanceRadius.value * beta
  const t = transmission.value
  const a = damping.value

  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  const cosPhi2 = Math.cos(phi / 2)
  const sinPhi2 = Math.sin(phi / 2)

  const numRe = Math.sqrt(1 - t * t) * Math.sqrt(1 - a * a) * cosPhi2
  const numIm = Math.sqrt(1 - t * t) * Math.sqrt(1 - a * a) * (-sinPhi2)
  const denRe = 1 - t * a * cosPhi
  const denIm = -t * a * (-sinPhi)
  const denAbs2 = denRe * denRe + denIm * denIm
  const fracRe = (numRe * denRe + numIm * denIm) / denAbs2
  const fracIm = (numIm * denRe - numRe * denIm) / denAbs2

  return fracRe * fracRe + fracIm * fracIm
}

const spectrum = computed(() => {
  const labels: number[] = []
  const data: number[] = []

  const from = Math.min(wavelengthFrom.value, wavelengthTo.value)
  const to = Math.max(wavelengthFrom.value, wavelengthTo.value)

  for (let i = from; i <= to; i++) {
    labels.push(i)
    data.push(calcTdrop(i * 1e-9))
  }

  return { labels, data }
})

watch([wavelengthFrom, wavelengthTo, transmission, damping, modeNumber, () => waveGuideStore.betta], () => {
  if (!chart.value) return
  chart.value.data.labels = spectrum.value.labels
  chart.value.data.datasets[0]!.data = [...spectrum.value.data]
  chart.value.update()
}, { flush: 'post' })

onMounted(() => {
  photon.circleAnimation(resonator)

  chart.value = new Chart(canvasRef.value as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels: spectrum.value.labels,
      datasets: [
        {
          label: 'Tdrop(λ)',
          data: spectrum.value.data,
          borderWidth: 2,
          borderColor: '#5b72ff',
          backgroundColor: 'rgba(91, 114, 255, 0.10)',
          pointRadius: 0,
          fill: true,
          tension: 0.24
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: {
            color: '#44516b'
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: { color: '#64708a' },
          grid: { color: 'rgba(100, 112, 138, 0.10)' }
        },
        x: {
          ticks: { color: '#64708a', maxTicksLimit: 8 },
          grid: { color: 'rgba(100, 112, 138, 0.06)' },
          title: {
            display: true,
            text: 'Wavelength (nm)',
            color: '#44516b'
          }
        }
      }
    }
  })
})
</script>

<template>
  <section class="resonator-layout">
    <div class="card resonator-card">
      <div class="panel-heading compact">
        <div>
          <span class="eyebrow">Coupled cavity</span>
          <h2 class="section-title resonator-title">Ring resonator</h2>
        </div>
        <div class="chip warm">Drop-port response</div>
      </div>

      <div class="resonator-visual-wrap">
        <div class="resonator-visual">
          <div class="bus-waveguide" />
          <div class="ring outer-ring">
            <div class="ring inner-ring">
              <div class="ring-label">m = {{ modeNumber }}</div>
            </div>
            <div class="photon" :style="{ left: `${photon.left}px`, top: `${photon.top}px`, background: photon.color, boxShadow: `0 0 16px ${photon.color}` }" />
          </div>
        </div>
      </div>

      <div class="metric-grid resonator-metrics">
        <div class="metric">
          <div class="metric-label">Drop coefficient</div>
          <div class="metric-value">{{ tDrop.toFixed(4) }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Estimated ring radius</div>
          <div class="metric-value">{{ realRingRadius.toFixed(3) }}<small>μm</small></div>
        </div>
        <div class="metric">
          <div class="metric-label">Coupling / damping</div>
          <div class="metric-value">{{ transmission.toFixed(3) }} / {{ damping.toFixed(3) }}</div>
        </div>
      </div>

      <div class="controls-block">
        <h3 class="section-title">Resonator parameters</h3>
        <div class="input-grid">
          <div class="input-group">
            <label class="label-box" for="mode-number-input">Mode number</label>
            <input id="mode-number-input" v-model.number="modeNumber" class="input-box" type="number" min="1" step="1">
          </div>
          <div class="input-group">
            <label class="label-box" for="transmission-input">Transmission coefficient</label>
            <input id="transmission-input" v-model.number="transmission" class="input-box" type="number" min="0" max="1" step="0.001">
          </div>
          <div class="input-group">
            <label class="label-box" for="damping-input">Damping coefficient</label>
            <input id="damping-input" v-model.number="damping" class="input-box" type="number" min="0" max="1" step="0.001">
          </div>
          <div class="input-group range-group">
            <label class="label-box">Spectrum window, nm</label>
            <div class="range-grid">
              <input v-model.number="wavelengthFrom" class="input-box" type="number" min="1" step="1" aria-label="Wavelength from">
              <input v-model.number="wavelengthTo" class="input-box" type="number" min="1" step="1" aria-label="Wavelength to">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card chart-card">
      <div class="panel-heading compact">
        <div>
          <span class="eyebrow">Spectral analysis</span>
          <h2 class="section-title resonator-title">Tdrop spectrum</h2>
        </div>
      </div>
      <div class="chart-shell">
        <canvas ref="canvasRef" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.resonator-layout {
  display: grid;
  grid-template-columns: 1.02fr 1.18fr;
  gap: 20px;
}

.resonator-card,
.chart-card {
  padding: 24px;
}

.compact {
  margin-bottom: 12px;
}

.resonator-title {
  margin: 8px 0 0;
  font-size: 24px;
}

.chip {
  padding: 10px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.warm {
  color: #c9771e;
  border: 1px solid rgba(255, 178, 77, 0.22);
  background: rgba(255, 178, 77, 0.10);
}

.resonator-visual-wrap {
  padding: 14px;
  border-radius: 20px;
  border: 1px solid rgba(104, 123, 155, 0.10);
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(245, 249, 255, 0.92));
}

.resonator-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 290px;
  border-radius: 22px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(108, 99, 255, 0.08), transparent 42%), #f5f8fe;
}

.bus-waveguide {
  position: absolute;
  top: 52px;
  width: 260px;
  height: 18px;
  border-top: 1px solid rgba(61, 124, 255, 0.75);
  border-bottom: 1px solid rgba(61, 124, 255, 0.75);
  background: linear-gradient(90deg, rgba(61,124,255,0.06), rgba(108,99,255,0.06));
  box-shadow: 0 0 24px rgba(61, 124, 255, 0.06);
}

.ring {
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.outer-ring {
  position: relative;
  width: 224px;
  height: 224px;
  border: 2px dashed rgba(108, 99, 255, 0.78);
  box-shadow: 0 0 22px rgba(108, 99, 255, 0.08), inset 0 0 22px rgba(108, 99, 255, 0.04);
}

.inner-ring {
  width: 168px;
  height: 168px;
  border: 2px dashed rgba(108, 99, 255, 0.42);
}

.ring-label {
  color: var(--muted);
  font-size: 12px;
}

.photon {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.resonator-metrics {
  margin-top: 16px;
}

.controls-block {
  margin-top: 18px;
}

.range-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.chart-shell {
  position: relative;
  height: 440px;
  padding: 10px 4px 4px;
}

@media (max-width: 1380px) {
  .resonator-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
  .resonator-card,
  .chart-card {
    padding: 18px;
  }

  .chart-shell {
    height: 320px;
  }
}

@media (max-width: 640px) {
  .resonator-title {
    font-size: 21px;
  }

  .resonator-visual-wrap {
    padding: 12px;
  }

  .resonator-visual {
    min-height: 230px;
  }

  .bus-waveguide {
    top: 42px;
    width: 190px;
    height: 14px;
  }

  .outer-ring {
    width: 172px;
    height: 172px;
  }

  .inner-ring {
    width: 124px;
    height: 124px;
  }

  .range-grid {
    grid-template-columns: 1fr;
  }

  .chart-shell {
    height: 260px;
  }

  .chip {
    align-self: flex-start;
  }
}
</style>
