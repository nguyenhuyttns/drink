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

    // HẾT THỜI GIAN CHỜ ĐỢI: Khách tức giận bỏ về, giải phóng quầy để game tiếp tục chạy
    if (patienceState.timeLeft <= 0) {
        handlePatienceTimeout();
    }
}

function handlePatienceTimeout() {
    if (!patienceState.active || gameState.phase !== 'ORDERING') return;

    stopPatienceTimer();

    // Khách thất vọng bỏ đi -> Ghi nhận 1 sao làm giảm điểm trung bình
    gameState.totalStars = (gameState.totalStars || 0) + 1;
    gameState.ratingCount = (gameState.ratingCount || 0) + 1;
    if (typeof updateTopStatsUI === 'function') updateTopStatsUI();

    playSoundEffect('error');

    if (typeof customerAnim !== 'undefined' && customerAnim) {
        customerAnim.shakeTimer = 1.0;
    }

    if (typeof showSpeechBubble === 'function') {
        showSpeechBubble('😤 Đợi lâu quá!', 'Quán phục vụ chậm quá, mình đi về đây!', true);
    }
    if (typeof showToast === 'function') {
        showToast('💔 Khách hàng hết kiên nhẫn và bỏ về! Quầy đã được dọn sạch để đón khách mới.');
    }

    if (typeof clearCurrentCup === 'function') {
        clearCurrentCup(false);
    }

    gameState.phase = 'WALKING_OUT';
    if (typeof customerAnim !== 'undefined' && customerAnim) {
        customerAnim.targetPos.set(-6.2, 0, 2.2);
        customerAnim.active = true;
    }

    if (typeof updateOrderTicketUI === 'function') updateOrderTicketUI();
    if (typeof updateCraftingUI === 'function') updateCraftingUI();
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
