/* ============================================================================
 * HỆ THỐNG ÂM THANH (WEB AUDIO API SYNTHESIZER)
 * Tự tổng hợp âm thanh bằng Oscillator, không phụ thuộc file âm thanh bên ngoài.
 * ============================================================================ */

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/**
 * Phát hiệu ứng âm thanh theo tên
 * @param {'click' | 'pour' | 'topping' | 'seal' | 'cash' | 'error' | 'bell'} type
 */
function playSoundEffect(type) {
    if (!gameState.soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
        case 'click': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
        }

        case 'pour': {
            // Tiếng nước/trà dâng lên
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(580, now + 0.35);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        }

        case 'topping': {
            // Tiếng hạt trân châu / thạch rơi vào ly
            [0, 0.07].forEach((offset, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400 + idx * 180, now + offset);
                osc.frequency.exponentialRampToValueAtTime(750 + idx * 180, now + offset + 0.09);
                gain.gain.setValueAtTime(0.18, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.09);
            });
            break;
        }

        case 'seal': {
            // Tiếng máy dập nắp ly
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
            break;
        }

        case 'cash': {
            // Tiếng leng keng máy thu tiền
            const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.09);
                gain.gain.setValueAtTime(0.22, now + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.09);
                osc.stop(now + idx * 0.09 + 0.35);
            });
            break;
        }

        case 'error': {
            // Tiếng còi buzzer báo sai món
            [0, 0.14].forEach((offset) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(210, now + offset);
                osc.frequency.linearRampToValueAtTime(150, now + offset + 0.12);
                gain.gain.setValueAtTime(0.18, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.12);
            });
            break;
        }

        case 'bell': {
            // Tiếng chuông cửa đón khách
            [659.25, 523.25].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.14);
                gain.gain.setValueAtTime(0.14, now + idx * 0.14);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.14);
                osc.stop(now + idx * 0.14 + 0.3);
            });
            break;
        }

        case 'meow': {
            // Tiếng mèo con kêu Meow~ ngọt ngào đáng yêu
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';

            // Đường cong tần số meow: 520Hz -> 840Hz -> 580Hz
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(840, now + 0.14);
            osc.frequency.exponentialRampToValueAtTime(580, now + 0.36);

            // Envelope âm lượng
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.38);
            break;
        }
    }
}

/**
 * Bật / tắt âm thanh trong game
 */
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('btn-sound');
    if (btn) {
        btn.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    }
    if (gameState.soundEnabled) playSoundEffect('click');
}
