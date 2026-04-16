import { defineStore } from 'pinia'

export const waveGuide = defineStore('formulas', {
  state: () => ({
    neff: 0 as number,
    betta: 1 as number,
    waveguide_height: 300e-9 as number,
    n_mat: 1.46 as number,
    n_env: 1 as number
  })
})
