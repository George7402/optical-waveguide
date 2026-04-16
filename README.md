# Optical Waveguide & Ring Resonator Simulator

Interactive web-based simulator for modeling **optical waveguides** and **ring resonators**, with real-time visualization of effective index, propagation constants, and spectral response.

---

## Overview

This project is a lightweight simulation tool designed to explore key concepts in **integrated photonics**:

* Effective refractive index (`n_eff`) calculation
* Propagation constant (`β`)
* Optical path length (OPL)
* Ring resonator transmission spectrum

The application provides an interactive interface to adjust physical parameters and observe their effect on system behavior.

---

## Features

* Interactive parameter control for waveguide geometry
* Numerical estimation of effective refractive index
* Real-time calculation of propagation constant and OPL
* Ring resonator spectral response simulation
* Data visualization of transmission vs wavelength

---

## Technologies

* **Frontend:** Vue 3, Nuxt
* **Visualization:** Chart.js
* **State management:** Pinia
* **Language:** TypeScript

---

## Installation

```bash
git clone https://github.com/your-username/photonics-simulator.git
cd photonics-simulator
npm install
npm run dev
```

---

## Usage

1. Adjust waveguide parameters:

   * Core refractive index
   * Cladding refractive index
   * Geometry

2. Observe computed values:

   * `n_eff`
   * `β`
   * OPL

3. Switch to resonator view:

   * Set wavelength range
   * Analyze transmission spectrum

---

## Example

```ts
// simplified propagation constant calculation
const beta = (2 * Math.PI / wavelength) * neff
```

---

## Scientific Note

The simulator uses simplified analytical approximations (e.g., slab waveguide model and basic ring resonator transfer function).

It is intended for **educational and exploratory purposes**, not for high-precision physical modeling.

---

## Roadmap

* [ ] Improve physical accuracy of models
* [ ] Add support for different waveguide types
* [ ] Extend resonator models (losses, coupling regimes)
* [ ] Export simulation data

---

## Author

Georgii Filippov
NESPI MEPhI — Radiophotonics & Software Engineering

---

## ⭐ Support

If you find this project useful or interesting:

* ⭐ Star the repository
* 🚀 Use it in your own experiments
* 🤝 Reach out for collaboration
