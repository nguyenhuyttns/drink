/* ============================================================================
 * QUẢN LÝ THỜI GIAN KIÊN NHẪN & ĐÁNH GIÁ SAO (PATIENCE & RATING SERVICE)
 * Tính toán độ hài lòng, tốc độ pha chế và tiền thưởng Combo Siêu Tốc.
 * ============================================================================ */

const patienceState = {
    active: false,
    maxTime: 16,
    timeLeft: 16,
    stars: 3,
    speedBonus: 15000,
    startTime: 0
};

function startPatienceTimer(duration = 16) {
    patienceState.active = true;
    patienceState.maxTime = duration;
    patienceState.timeLeft = duration;
    patienceState.stars = 3;
    patienceState.speedBonus = 15000;
    patienceState.startTime = Date.now();

    const bubble = document.getElementById('customer-bubble');
    if (bubble) bubble.classList.remove('hidden');

    const container = document.getElementById('patience-container');
    if (container) container.classList.remove('hidden');

    updatePatienceUI();
}

function stopPatienceTimer() {
    patienceState.active = false;
    const bubble = document.getElementById('customer-bubble');
    if (bubble) bubble.classList.add('hidden');

    return {
        stars: patienceState.stars,
        speedBonus: patienceState.speedBonus,
        timeSpent: Math.max(0.1, (Date.now() - patienceState.startTime) / 1000)
    };
}

function updatePatienceTimer(dt) {
    if (!patienceState.active || gameState.phase !== 'ORDERING') return;

    patienceState.timeLeft = Math.max(0, patienceState.timeLeft - dt);

    // Phân loại sao & tiền thưởng tốc độ
    if (patienceState.timeLeft > 9.5) {
        patienceState.stars = 3;
        patienceState.speedBonus = 15000;
    } else if (patienceState.timeLeft > 4.5) {
        patienceState.stars = 2;
        patienceState.speedBonus = 5000;
    } else {
        patienceState.stars = 1;
        patienceState.speedBonus = 0;
    }

    updatePatienceUI();
}

function updatePatienceUI() {
    const bar = document.getElementById('patience-bar');
    const label = document.getElementById('patience-label');
    const starsEl = document.getElementById('patience-stars');
    if (!bar) return;

    const percent = Math.max(0, Math.min(100, (patienceState.timeLeft / patienceState.maxTime) * 100));
    bar.style.width = `${percent}%`;

    if (patienceState.stars === 3) {
        bar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-150';
        if (label) label.textContent = '💖 Kiên nhẫn (Háo hức)';
        if (starsEl) starsEl.textContent = '⭐⭐⭐ (+15k)';
    } else if (patienceState.stars === 2) {
        bar.className = 'h-full bg-amber-400 rounded-full transition-all duration-150';
        if (label) label.textContent = '💛 Đang đợi (Bình thường)';
        if (starsEl) starsEl.textContent = '⭐⭐ (+5k)';
    } else {
        bar.className = 'h-full bg-rose-500 rounded-full transition-all duration-150 animate-pulse';
        if (label) label.textContent = '💔 Sốt ruột (Sắp hết giờ)';
        if (starsEl) starsEl.textContent = '⭐ (0k)';
    }
}
