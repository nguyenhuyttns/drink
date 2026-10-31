/* ============================================================================
 * TRÌNH QUẢN LÝ GIAO DIỆN (UI MANAGER)
 * Đồng bộ hóa dữ liệu từ gameState lên các panel HTML, modal và bóng thoại 3D.
 * ============================================================================ */

function updateTopStatsUI() {
    const elMoney = document.getElementById('stat-money');
    const elRev = document.getElementById('stat-revenue');
    const elOrders = document.getElementById('stat-orders');
    const elCust = document.getElementById('stat-customers');
    const elDay = document.getElementById('stat-day');

    if (elMoney) elMoney.textContent = formatVND(gameState.money);
    if (elRev) elRev.textContent = formatVND(gameState.revenue);
    if (elOrders) elOrders.textContent = gameState.ordersSold;
    if (elCust) elCust.textContent = gameState.customersServed;
    if (elDay) elDay.textContent = `Ngày ${gameState.day}`;
}

function updateOrderTicketUI() {
    const badge = document.getElementById('order-badge');
    const emptyBox = document.getElementById('order-empty');
    const contentBox = document.getElementById('order-content');
    if (!badge || !emptyBox || !contentBox) return;

    if (['ORDERING', 'SEALING', 'AWAITING_PAYMENT'].includes(gameState.phase)) {
        const order = gameState.currentOrder;
        if (!order) return;
        const tea = TEA_MENU[order.teaId];

        badge.textContent = 'Khách đang chờ';
        badge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-600';

        emptyBox.classList.add('hidden');
        contentBox.classList.remove('hidden');

        document.getElementById('customer-avatar').textContent = order.customer.avatar;
        document.getElementById('customer-name').textContent = order.customer.name;
        const elDesc = document.getElementById('customer-desc');
        if (elDesc) {
            elDesc.textContent = order.customer.ageText || 'Khách tại quầy #1';
        }
        document.getElementById('order-tea-name').innerHTML = `
            <span>${tea.name}</span>
            <span class="text-xs font-bold text-pink-500">${formatVND(tea.price)}</span>
        `;

        const topList = document.getElementById('order-toppings-list');
        topList.innerHTML = '';

        if (order.toppings.length === 0) {
            topList.innerHTML = `<li class="text-gray-400 italic">• Không thêm topping</li>`;
        } else {
            order.toppings.forEach(tId => {
                const top = TOPPING_MENU[tId];
                if (!top) return;
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center bg-pink-50/60 px-2 py-1 rounded-lg';
                li.innerHTML = `<span>• ${top.name}</span><span class="text-emerald-600">+${formatVND(top.price)}</span>`;
                topList.appendChild(li);
            });
        }

        document.getElementById('order-total-price').textContent = formatVND(order.totalPrice);
    } else {
        badge.textContent = 'Đang đợi khách...';
        badge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700';
        emptyBox.classList.remove('hidden');
        contentBox.classList.add('hidden');
    }
}

function updateCraftingUI() {
    // 1. Highlight nút chọn cốt trà
    Object.keys(TEA_MENU).forEach(tKey => {
        const btn = document.getElementById(`btn-tea-${tKey}`);
        if (!btn) return;
        if (gameState.cup.teaId === tKey) {
            btn.className = 'tea-btn flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-500 bg-pink-50 shadow-sm transition text-left';
        } else {
            btn.className = 'tea-btn flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-300 transition text-left';
        }
    });

    // 2. Highlight nút chọn topping
    Object.keys(TOPPING_MENU).forEach(topKey => {
        const btn = document.getElementById(`btn-top-${topKey}`);
        if (!btn) return;
        if (gameState.cup.toppings.has(topKey)) {
            btn.className = 'top-btn flex items-center gap-2 p-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 shadow-sm transition text-left';
        } else {
            btn.className = 'top-btn flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-300 transition text-left';
        }
    });

    // 3. Tính tiền ly đang pha & cập nhật tóm tắt
    let cupPrice = 0;
    let summaryParts = [];

    const labelTea = document.getElementById('selected-tea-label');
    if (gameState.cup.teaId) {
        const tea = TEA_MENU[gameState.cup.teaId];
        cupPrice += tea.price;
        summaryParts.push(tea.name);
        if (labelTea) labelTea.textContent = tea.name;
    } else {
        if (labelTea) labelTea.textContent = 'Chưa chọn';
    }

    gameState.cup.toppings.forEach(tId => {
        const top = TOPPING_MENU[tId];
        if (top) {
            cupPrice += top.price;
            summaryParts.push(top.name);
        }
    });

    const elSum = document.getElementById('cup-summary-text');
    const elPrice = document.getElementById('cup-price-text');
    if (elSum) {
        elSum.textContent = summaryParts.length > 0 ? summaryParts.join(' + ') : 'Ly rỗng (Hãy chọn cốt trà)';
    }
    if (elPrice) {
        elPrice.textContent = formatVND(cupPrice);
    }

    // 4. Trạng thái nút hoàn thành ly
    const finishBtn = document.getElementById('btn-finish-drink');
    if (finishBtn) {
        finishBtn.disabled = !(gameState.phase === 'ORDERING' && gameState.cup.teaId && !gameState.cup.isSealed);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast-banner');
    if (toast) {
        toast.textContent = msg;
    }
}

function showSpeechBubble(title, message, isError = false) {
    const bubble = document.getElementById('customer-bubble');
    const statusEl = document.getElementById('bubble-status');
    const textEl = document.getElementById('bubble-text');
    if (!bubble || !statusEl || !textEl) return;

    statusEl.textContent = title;
    statusEl.className = isError
        ? 'text-xs font-extrabold text-rose-600 uppercase tracking-wider mb-0.5'
        : 'text-xs font-extrabold text-pink-500 uppercase tracking-wider mb-0.5';
    textEl.textContent = message;
    bubble.classList.remove('hidden');
}

function hideSpeechBubble() {
    const bubble = document.getElementById('customer-bubble');
    if (bubble) {
        bubble.classList.add('hidden');
    }
}

/**
 * Chiếu vị trí 3D trên đầu khách hàng ra màn hình 2D để định vị bong bóng thoại
 */
function updateFloatingBubblePosition(targetCamera, targetCustomerGroup) {
    const bubble = document.getElementById('customer-bubble');
    if (!bubble || bubble.classList.contains('hidden') || !targetCustomerGroup || !targetCustomerGroup.visible) return;

    const headWorldPos = targetCustomerGroup.position.clone().add(new THREE.Vector3(0, 2.25, 0));
    headWorldPos.project(targetCamera);

    const x = (headWorldPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(headWorldPos.y * 0.5) + 0.5) * window.innerHeight;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
}

function openInvoiceModal() {
    const order = gameState.currentOrder;
    if (!order) return;
    const tea = TEA_MENU[order.teaId];

    document.getElementById('bill-customer').textContent = `${order.customer.avatar} ${order.customer.name}`;
    document.getElementById('bill-tea-name').textContent = tea.name;
    document.getElementById('bill-tea-price').textContent = formatVND(tea.price);

    const billTopsContainer = document.getElementById('bill-toppings');
    billTopsContainer.innerHTML = '';

    if (order.toppings.length === 0) {
        billTopsContainer.innerHTML = '<div class="text-gray-400 italic">Không có topping (+0đ)</div>';
    } else {
        order.toppings.forEach(tId => {
            const top = TOPPING_MENU[tId];
            if (!top) return;
            const row = document.createElement('div');
            row.className = 'flex justify-between';
            row.innerHTML = `<span>+ ${top.name}</span><span>${formatVND(top.price)}</span>`;
            billTopsContainer.appendChild(row);
        });
    }

    document.getElementById('bill-total').textContent = formatVND(order.totalPrice);
    document.getElementById('btn-bill-amount').textContent = formatVND(order.totalPrice);
    document.getElementById('invoice-modal').classList.remove('hidden');
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) modal.classList.add('hidden');
}

function openResetModal() {
    playSoundEffect('click');
    const modal = document.getElementById('reset-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeResetModal() {
    playSoundEffect('click');
    const modal = document.getElementById('reset-modal');
    if (modal) modal.classList.add('hidden');
}
