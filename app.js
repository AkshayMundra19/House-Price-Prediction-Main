/* ========== HOMEVALUATE AI - APP.JS ========== */

// ==================== LOADER ====================
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2200);
});

// ==================== PARTICLES ====================
(function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 15 + 's';
        p.style.animationDuration = (12 + Math.random() * 10) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
        container.appendChild(p);
    }
})();

// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    document.getElementById('theme-icon').innerHTML = isLight
        ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
});

// ==================== MOBILE MENU ====================
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
});

// ==================== ACTIVE NAV ====================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.dataset.section === current) l.classList.add('active');
    });
    // Navbar bg
    document.getElementById('navbar').style.background =
        window.scrollY > 50 ? 'rgba(10,10,26,0.9)' : 'rgba(10,10,26,0.7)';
});

// ==================== STAT COUNTER ====================
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            const target = parseFloat(el.dataset.count);
            const isFloat = target % 1 !== 0;
            let current = 0;
            const step = target / 60;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
            }, 25);
            statObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-value[data-count]').forEach(el => statObserver.observe(el));

// ==================== SCROLL REVEAL ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.glass-card, .section-header, .chart-card').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ==================== THREE.JS 3D HOUSE ====================
(function init3D() {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0.5, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x6c5ce7, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xa29bfe, 1, 20);
    pointLight.position.set(-3, 4, 3);
    scene.add(pointLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a3e, transparent: true, opacity: 0.5
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // House Body
    const bodyGeo = new THREE.BoxGeometry(2, 1.5, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x6c5ce7, metalness: 0.2, roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    scene.add(body);

    // Roof
    const roofGeo = new THREE.ConeGeometry(1.7, 1, 4);
    const roofMat = new THREE.MeshStandardMaterial({
        color: 0xa29bfe, metalness: 0.3, roughness: 0.5
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2;
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(0.4, 0.7, 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xfd79a8 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.35, 0.93);
    scene.add(door);

    // Windows
    const winGeo = new THREE.BoxGeometry(0.35, 0.35, 0.05);
    const winMat = new THREE.MeshStandardMaterial({
        color: 0x74b9ff, emissive: 0x74b9ff, emissiveIntensity: 0.3
    });
    [[-0.55, 1.0, 0.93], [0.55, 1.0, 0.93]].forEach(pos => {
        const w = new THREE.Mesh(winGeo, winMat);
        w.position.set(...pos);
        scene.add(w);
    });

    // Chimney
    const chimGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
    const chimMat = new THREE.MeshStandardMaterial({ color: 0xe17055 });
    const chim = new THREE.Mesh(chimGeo, chimMat);
    chim.position.set(0.6, 2.3, -0.3);
    scene.add(chim);

    // Floating cubes (data points)
    const cubes = [];
    for (let i = 0; i < 15; i++) {
        const size = 0.05 + Math.random() * 0.1;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.8, 0.6),
            emissive: new THREE.Color().setHSL(0.7 + Math.random() * 0.2, 0.8, 0.3),
            emissiveIntensity: 0.5, transparent: true, opacity: 0.7
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.set(
            (Math.random() - 0.5) * 8,
            1 + Math.random() * 4,
            (Math.random() - 0.5) * 8
        );
        cube.userData = {
            speed: 0.5 + Math.random(),
            offset: Math.random() * Math.PI * 2
        };
        scene.add(cube);
        cubes.push(cube);
    }

    // Grid lines
    const gridHelper = new THREE.GridHelper(20, 30, 0x2d2d5e, 0x1a1a3e);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Rotate camera slowly
        camera.position.x = 6 * Math.cos(time * 0.2);
        camera.position.z = 6 * Math.sin(time * 0.2);
        camera.lookAt(0, 0.8, 0);

        // Float cubes
        cubes.forEach(c => {
            c.position.y += Math.sin(time * c.userData.speed + c.userData.offset) * 0.003;
            c.rotation.x += 0.01;
            c.rotation.y += 0.015;
        });

        // Pulse point light
        pointLight.intensity = 1 + Math.sin(time * 2) * 0.3;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// ==================== SLIDER SYNC ====================
function syncSlider(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    slider.addEventListener('input', () => input.value = slider.value);
    input.addEventListener('input', () => slider.value = input.value);
}
syncSlider('area-slider', 'area-input');
syncSlider('age-slider', 'age-input');
syncSlider('floor-slider', 'floor-input');
syncSlider('loan-slider', 'loan-amount');
syncSlider('interest-slider', 'interest-rate');
syncSlider('tenure-slider', 'loan-tenure');

// ==================== CHIP BUTTONS ====================
document.querySelectorAll('.btn-group').forEach(group => {
    group.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
});

// ==================== PREDICTION ENGINE ====================
function predictPrice() {
    const area = parseFloat(document.getElementById('area-input').value) || 1200;
    const bedrooms = parseInt(document.querySelector('#bedroom-btns .chip.active')?.dataset.val || 2);
    const bathrooms = parseInt(document.querySelector('#bathroom-btns .chip.active')?.dataset.val || 1);
    const locFactor = parseFloat(document.getElementById('location-select').value) || 0.85;
    const age = parseFloat(document.getElementById('age-input').value) || 2;
    const floor = parseFloat(document.getElementById('floor-input').value) || 5;

    const amenities = ['parking', 'gym', 'pool', 'garden', 'security', 'lift']
        .filter(a => document.getElementById(a)?.checked).length;

    // ML-like model: Linear regression + feature engineering
    // Logic derived from Kaggle Ames Housing Dataset
    const baseValPerSqft = 85;
    let basePrice = (area * baseValPerSqft) / 1000; // In Thousands
    
    // Quality adjustment based on amenities and floor
    let qualityScore = 5 + (amenities * 0.5); 
    if (floor > 10) qualityScore += 1;
    
    let qualityMultiplier = 0.5 + (qualityScore / 10); // 1.0 is standard
    
    let bedroomBonus = (bedrooms - 2) * 5; // $5k per extra bedroom
    let bathroomBonus = (bathrooms - 1) * 10; // $10k per extra bathroom
    
    // Location Factor (normalized to 1.0 for College Creek)
    let locationPremium = basePrice * (locFactor - 1.0);
    
    // Age Depreciation ($1k per year)
    let ageDepreciation = age * 1.2;

    let totalPrice = (basePrice * qualityMultiplier) + bedroomBonus + bathroomBonus + locationPremium - ageDepreciation;
    totalPrice = Math.max(totalPrice, 40); // Min $40k


    // Display results
    document.getElementById('result-placeholder').style.display = 'none';
    document.getElementById('result-content').style.display = 'block';

    // Animate price
    animateValue('predicted-price', 0, totalPrice.toFixed(1), 800);

    document.getElementById('base-price').textContent = `$${basePrice.toFixed(1)}k`;
    document.getElementById('loc-premium').textContent = `${locationPremium >= 0 ? '+' : ''}$${locationPremium.toFixed(1)}k`;
    document.getElementById('amenity-val').textContent = `+ $${(basePrice * (qualityMultiplier - 1)).toFixed(1)}k`;
    document.getElementById('age-dep').textContent = `-$${ageDepreciation.toFixed(1)}k`;

    const confidence = Math.max(88, 98 - age * 0.5 - Math.abs(area - 1200) * 0.003).toFixed(0);
    document.getElementById('confidence-badge').textContent = `${confidence}% Confidence`;

    // Price range
    const low = (totalPrice * 0.92).toFixed(1);
    const high = (totalPrice * 1.08).toFixed(1);
    document.getElementById('range-low').textContent = `$${low}k`;
    document.getElementById('range-high').textContent = `$${high}k`;
    document.getElementById('range-fill').style.width = '60%';
    document.getElementById('range-marker').style.left = '55%';

    // Mini cards
    document.getElementById('price-per-sqft').textContent = `$${(totalPrice * 1000 / area).toFixed(1)}`;
    document.getElementById('property-cat').textContent =
        totalPrice < 30 ? 'Budget' : totalPrice < 60 ? 'Mid-Range' : totalPrice < 100 ? 'Premium' : 'Luxury';
    document.getElementById('market-trend').textContent = '📈 +8.2%';

    // Factors chart
    renderFactorsChart(basePrice, locationPremium, amenityValue, bedroomBonus + bathroomBonus + floorPremium, ageDepreciation);

    // Scroll to result
    document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function animateValue(id, start, end, duration) {
    const el = document.getElementById(id);
    const endVal = parseFloat(end);
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (start + (endVal - start) * eased).toFixed(1);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

document.getElementById('predict-btn').addEventListener('click', predictPrice);

// ==================== PRICE FACTORS CHART ====================
let factorsChart = null;
function renderFactorsChart(base, loc, amenity, extras, depreciation) {
    const ctx = document.getElementById('priceFactorsChart').getContext('2d');
    if (factorsChart) factorsChart.destroy();
    factorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Base', 'Location', 'Amenities', 'Extras', 'Depreciation'],
            datasets: [{
                data: [base, loc, amenity, extras, -depreciation],
                backgroundColor: [
                    'rgba(108,92,231,0.7)', 'rgba(0,206,201,0.7)',
                    'rgba(253,121,168,0.7)', 'rgba(162,155,254,0.7)',
                    'rgba(225,112,85,0.7)'
                ],
                borderRadius: 8, borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9898b0', font: { size: 11 } }, grid: { display: false } },
                y: { ticks: { color: '#9898b0', callback: v => '$' + v + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

// ==================== ANALYTICS CHARTS ====================
function initAnalytics() {
    // Trend chart
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
            datasets: [
                {
                    label: 'NoRidge', data: [250, 270, 290, 310, 335],
                    borderColor: '#6c5ce7', backgroundColor: 'rgba(108,92,231,0.1)',
                    fill: true, tension: 0.4, pointRadius: 4
                },
                {
                    label: 'CollgCr', data: [160, 175, 185, 198, 210],
                    borderColor: '#00cec9', backgroundColor: 'rgba(0,206,201,0.1)',
                    fill: true, tension: 0.4, pointRadius: 4
                },
                {
                    label: 'OldTown', data: [110, 118, 125, 128, 135],
                    borderColor: '#fd79a8', backgroundColor: 'rgba(253,121,168,0.1)',
                    fill: true, tension: 0.4, pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#9898b0' } } },
            scales: {
                x: { ticks: { color: '#9898b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#9898b0', callback: v => '$' + v + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    // City chart
    new Chart(document.getElementById('cityChart'), {
        type: 'bar',
        data: {
            labels: ['NoRidge', 'NridgHt', 'StoneBr', 'Somerst', 'CollgCr', 'Gilbert', 'NAmes', 'OldTown', 'Edwards', 'MeadowV'],
            datasets: [{
                label: '$/sqft',
                data: [145, 140, 138, 125, 115, 110, 95, 88, 82, 75],
                backgroundColor: [
                    'rgba(108,92,231,0.8)', 'rgba(253,121,168,0.8)', 'rgba(0,206,201,0.8)',
                    'rgba(162,155,254,0.8)', 'rgba(253,203,110,0.8)', 'rgba(0,184,148,0.8)',
                    'rgba(116,185,255,0.8)', 'rgba(225,112,85,0.8)'
                ],
                borderRadius: 8, borderSkipped: false
            }]
        },
        options: {
            responsive: true, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9898b0', callback: v => '$' + v }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#9898b0' }, grid: { display: false } }
            }
        }
    });

    // Type chart
    new Chart(document.getElementById('typeChart'), {
        type: 'doughnut',
        data: {
            labels: ['Apartments', 'Villas', 'Independent', 'Plots', 'Penthouse'],
            datasets: [{
                data: [45, 20, 18, 12, 5],
                backgroundColor: ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#a29bfe'],
                borderWidth: 0, hoverOffset: 10
            }]
        },
        options: {
            responsive: true, cutout: '65%',
            plugins: { legend: { position: 'bottom', labels: { color: '#9898b0', padding: 15 } } }
        }
    });

    // Regression chart (scatter + line)
    const regData = [
        { x: 800, y: 120 }, { x: 1200, y: 155 }, { x: 1500, y: 190 },
        { x: 1800, y: 220 }, { x: 2200, y: 260 }, { x: 2500, y: 310 },
        { x: 3000, y: 380 }, { x: 3500, y: 450 }, { x: 4000, y: 520 }
    ];
    const lineData = regData.map(p => ({ x: p.x, y: p.x * 0.115 + 25 }));

    new Chart(document.getElementById('regressionChart'), {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Actual Prices',
                    data: regData,
                    backgroundColor: 'rgba(108,92,231,0.8)',
                    pointRadius: 7, pointHoverRadius: 10
                },
                {
                    label: 'Regression Line',
                    data: lineData, type: 'line',
                    borderColor: '#fd79a8', borderWidth: 2,
                    borderDash: [6, 4], pointRadius: 0, fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#9898b0' } } },
            scales: {
                x: { title: { display: true, text: 'Area (sqft)', color: '#9898b0' }, ticks: { color: '#9898b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { title: { display: true, text: 'Price ($k)', color: '#9898b0' }, ticks: { color: '#9898b0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

// Init analytics when section visible
const analyticsObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { initAnalytics(); analyticsObserver.unobserve(e.target); }
    });
}, { threshold: 0.1 });
analyticsObserver.observe(document.getElementById('analytics'));

// ==================== COMPARE ====================
let compareChart = null;
document.getElementById('compare-btn').addEventListener('click', () => {
    const cards = document.querySelectorAll('.compare-card');
    const prices = [];
    const labels = [];
    cards.forEach((card, i) => {
        const area = parseFloat(card.querySelector('.cmp-area').value) || 1000;
        const bed = parseInt(card.querySelector('.cmp-bed').value) || 2;
        const loc = parseFloat(card.querySelector('.cmp-loc').value) || 0.85;
        const price = (area * 0.085) * (0.5 + (bed * 0.15)) * loc;
        prices.push(price.toFixed(1));
        labels.push(['Property A', 'Property B', 'Property C'][i]);
        card.querySelector('.cmp-price').textContent = `$${price.toFixed(1)}k`;
    });

    const ctx = document.getElementById('compareChart').getContext('2d');
    if (compareChart) compareChart.destroy();
    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Price (₹ Lakhs)',
                data: prices,
                backgroundColor: ['rgba(108,92,231,0.8)', 'rgba(0,206,201,0.8)', 'rgba(253,121,168,0.8)'],
                borderRadius: 12, borderSkipped: false, barThickness: 60
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9898b0', font: { size: 14 } }, grid: { display: false } },
                y: { ticks: { color: '#9898b0', callback: v => '$' + v + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
});

// ==================== EMI CALCULATOR ====================
let emiChart = null;
function calculateEMI() {
    const P = parseFloat(document.getElementById('loan-amount').value) * 1000;
    const r = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
    const n = parseInt(document.getElementById('loan-tenure').value) * 12;

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    document.getElementById('emi-value').textContent = '$' + Math.round(emi).toLocaleString();
    document.getElementById('total-interest').textContent = '$' + (totalInterest / 1000).toFixed(1) + 'k';
    document.getElementById('total-payment').textContent = '$' + (totalPayment / 1000).toFixed(1) + 'k';

    const ctx = document.getElementById('emiChart').getContext('2d');
    if (emiChart) emiChart.destroy();
    emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [P, totalInterest],
                backgroundColor: ['rgba(108,92,231,0.8)', 'rgba(253,121,168,0.8)'],
                borderWidth: 0, hoverOffset: 15
            }]
        },
        options: {
            responsive: true, cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9898b0', padding: 20, font: { size: 13 } } }
            }
        }
    });
}

// EMI auto-calculate on input
['loan-slider', 'loan-amount', 'interest-slider', 'interest-rate', 'tenure-slider', 'loan-tenure']
    .forEach(id => document.getElementById(id).addEventListener('input', calculateEMI));

// Init EMI on first visible
const emiObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { calculateEMI(); emiObserver.unobserve(e.target); }
    });
}, { threshold: 0.1 });
emiObserver.observe(document.getElementById('emi'));
