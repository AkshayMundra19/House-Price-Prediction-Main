# 🏠 HomeValuate AI — Smart House Price Predictor

An AI-powered house price prediction web application with stunning 3D animations, interactive charts, and advanced features.

![HomeValuate AI](https://img.shields.io/badge/AI-Powered-6c5ce7?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)
![Chart.js](https://img.shields.io/badge/Chart.js-Visualizations-ff6384?style=for-the-badge)

## Features

- 🏠 **3D Animated House** — Rotating Three.js model with floating data cubes and dynamic lighting
- 🤖 **AI Price Predictor** — Multi-feature prediction (area, bedrooms, bathrooms, location, age, floor, amenities)
- 📊 **Market Analytics** — 4 interactive charts: price trends, city comparison, property types, regression
- ⚖️ **Property Comparison** — Compare 3 properties side-by-side with visual charts
- 🏦 **EMI Calculator** — Loan calculator with principal/interest doughnut chart breakdown
- 🌗 **Dark/Light Theme** — Premium glassmorphism UI with toggle
- 🎨 **Glassmorphism UI** — Frosted glass cards, gradients, micro-animations
- 📱 **Fully Responsive** — Mobile-friendly design
- ✨ **Smooth Animations** — Loader, scroll reveals, counter animations, hover effects
- 🎯 **Particle System** — Floating ambient particles in background

## Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | Structure & Semantics |
| CSS3 | Glassmorphism, Gradients, Animations |
| JavaScript | Logic & Interactivity |
| Three.js | 3D House Model & Scene |
| Chart.js | Interactive Data Visualizations |

## Screenshots

### Hero Section
- Beautiful 3D animated house rotating in the background
- Animated stats counter showing accuracy, properties analyzed, and cities covered

### Price Predictor
- Input property details: area, bedrooms, bathrooms, location, age, floor
- Select amenities: parking, gym, pool, garden, security, lift
- Get instant AI-powered price prediction with confidence score

### Market Analytics
- Price trends from 2020-2026 for major Indian cities
- City-wise price comparison (₹/sqft)
- Property type distribution (apartments, villas, etc.)
- Area vs Price regression visualization

### Property Comparison
- Compare up to 3 properties simultaneously
- Visual bar chart comparison

### EMI Calculator
- Interactive sliders for loan amount, interest rate, tenure
- Real-time EMI calculation with principal/interest breakdown

## Project Structure

```
House Price Prediction/
├── index.html                    # Main HTML
├── style.css                     # Premium CSS styles
├── app.js                        # Three.js, Charts, Prediction Logic
├── house_price_prediction.py     # Original Python ML model
├── README.md                     # This file
└── .gitignore
```

## How the Prediction Works

The prediction engine uses a multi-feature linear regression model:

```
Price = Base(area) + Location Premium + Bedroom Bonus + Bathroom Bonus 
        + Amenity Value + Floor Premium - Age Depreciation
```

Factors include:
- **Area**: ₹45/sqft base rate
- **Location**: City-specific multiplier (0.45x - 1.0x)
- **Bedrooms/Bathrooms**: Fixed bonus per room
- **Amenities**: Per-amenity value addition
- **Floor**: Premium for higher floors
- **Age**: Depreciation for older properties

## License

MIT License — feel free to use and modify!
