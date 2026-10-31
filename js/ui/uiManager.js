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

    const elRating = document.getElementById('stat-rating');
    if (elRating) {
        const avg = (gameState.ratingCount && gameState.ratingCount > 0)
            ? (gameState.totalStars / gameState.ratingCount).toFixed(1)
            : '5.0';
        elRating.textContent = `${avg} ⭐`;
    }
}

function updateOrderTicketUI() {
    const badge = document.getElementById('order-badge');
    const emptyBox = document.getElementById('order-empty');
    const contentBox = document.getElementById('order-content');
    if (!badge || !emptyBox || !contentBox) return;

    if (['ORDERING', 'SEALING', 'AWAITING_PAYMENT'].includes(gameState.phase)) {
        const order = gameState.currentOrder;
        if (!order) return;
        const tea = (order.teaId && TEA_MENU[order.teaId]) ? TEA_MENU[order.teaId] : null;

        badge.textContent = 'Khách đang chờ';
        badge.className = 'text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-600';

        emptyBox.classList.add('hidden');
        contentBox.classList.remove('hidden');

        document.getElementById('customer-avatar').textContent = order.customer.avatar;
        document.getElementById('customer-name').textContent = order.customer.name;
        const elDesc = document.getElementById('customer-desc');
        if (elDesc) {
            const dineText = order.dineIn ? '🪑 Uống tại bàn' : '🥡 Mang về';
            elDesc.textContent = `${order.customer.ageText || 'Khách tại quầy #1'} • ${dineText}`;
        }
        if (tea) {
            document.getElementById('order-tea-name').innerHTML = `
                <span>${tea.name}</span>
                <span class="text-xs font-bold text-pink-500">${formatVND(tea.price)}</span>
            `;
        } else {
            document.getElementById('order-tea-name').innerHTML = `
                <span class="text-gray-400 italic">Không gọi đồ uống</span>
                <span class="text-xs font-bold text-gray-400">0đ</span>
            `;
        }

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

        // Dòng bánh ngọt yêu cầu kèm theo
        const elPastryRow = document.getElementById('order-pastry-row');
        if (elPastryRow) {
            if (order.pastryId && typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[order.pastryId]) {
                const p = PASTRY_MENU[order.pastryId];
                const isOnlyPastry = !order.teaId;
                const isReadyOnPlate = gameState.cup.pastryId === order.pastryId;

                elPastryRow.innerHTML = `
                    <div class="bg-amber-50 p-2 rounded-xl border border-amber-200">
                        <div class="flex justify-between items-center ${isOnlyPastry ? 'mb-1.5' : ''}">
                            <span class="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                <span class="text-base">${p.icon}</span> Bánh: ${p.name}
                            </span>
                            <span class="text-xs font-extrabold text-amber-700">+${formatVND(p.price)}</span>
                        </div>
                        ${isOnlyPastry ? `
                            <button onclick="quickPrepareAndServePastry('${order.pastryId}')" class="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 animate-pulse">
                                🥐 ${isReadyOnPlate ? '✓ Trao đĩa bánh phục vụ khách ngay' : '👉 Lấy bánh & Phục vụ ngay'}
                            </button>
                        ` : ''}
                    </div>
                `;
                elPastryRow.classList.remove('hidden');
            } else {
                elPastryRow.classList.add('hidden');
            }
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
    const isOrdering = gameState.phase === 'ORDERING';
    const targetTea = (isOrdering && gameState.currentOrder) ? gameState.currentOrder.teaId : null;
    const targetTops = (isOrdering && gameState.currentOrder) ? gameState.currentOrder.toppings : [];
    const targetPastry = (isOrdering && gameState.currentOrder) ? gameState.currentOrder.pastryId : null;

    // 1. Highlight nút chọn cốt trà (Khoanh viền món khách gọi)
    Object.keys(TEA_MENU).forEach(tKey => {
        const btn = document.getElementById(`btn-tea-${tKey}`);
        if (!btn) return;

        const oldTag = btn.querySelector('.order-hint-tag');
        if (oldTag) oldTag.remove();

        if (gameState.cup.teaId === tKey) {
            btn.className = 'tea-btn relative flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-300 transition text-left';
            btn.insertAdjacentHTML('beforeend', '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-pink-500 text-white px-1.5 py-0.5 rounded-full shadow">Đã chọn ✓</span>');
        } else if (targetTea === tKey) {
            btn.className = 'tea-btn relative flex items-center gap-2 p-2 rounded-2xl item-ordered-hint transition text-left cursor-pointer';
            btn.insertAdjacentHTML('beforeend', '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow animate-pulse">Khách gọi 🎯</span>');
        } else {
            btn.className = 'tea-btn relative flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-300 transition text-left opacity-90';
        }
    });

    // 2. Highlight nút chọn topping (Khoanh viền topping khách gọi)
    Object.keys(TOPPING_MENU).forEach(topKey => {
        const btn = document.getElementById(`btn-top-${topKey}`);
        if (!btn) return;

        const oldTag = btn.querySelector('.order-hint-tag');
        if (oldTag) oldTag.remove();

        if (gameState.cup.toppings.has(topKey)) {
            btn.className = 'top-btn relative flex items-center gap-2 p-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-300 transition text-left';
            btn.insertAdjacentHTML('beforeend', '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shadow">Đã thêm ✓</span>');
        } else if (targetTops.includes(topKey)) {
            btn.className = 'top-btn relative flex items-center gap-2 p-2 rounded-2xl item-ordered-hint transition text-left cursor-pointer';
            btn.insertAdjacentHTML('beforeend', '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow animate-pulse">Khách gọi 🎯</span>');
        } else {
            btn.className = 'top-btn relative flex items-center gap-2 p-2 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-300 transition text-left opacity-90';
        }
    });

    // 2.5. Render & Highlight danh sách Bánh ngọt / Bánh kẹo
    const pastryContainer = document.getElementById('crafting-pastries-grid');
    if (pastryContainer && typeof PASTRY_MENU !== 'undefined') {
        let phtml = '';
        Object.keys(PASTRY_MENU).forEach(pKey => {
            const p = PASTRY_MENU[pKey];
            const isSelected = (gameState.cup.pastryId === pKey);
            const isOrdered = (targetPastry === pKey);
            const stock = (gameState.inventory && gameState.inventory[pKey] !== undefined) ? gameState.inventory[pKey] : 0;
            const isOut = stock <= 0;

            let borderClass = 'border-2 border-pink-100 bg-white hover:border-pink-300';
            let tag = '';
            if (isSelected) {
                borderClass = 'border-2 border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300';
                tag = '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow">Đã lấy ✓</span>';
            } else if (isOrdered) {
                borderClass = 'item-ordered-hint';
                tag = '<span class="order-hint-tag absolute -top-2 -right-1 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full shadow animate-pulse">Khách gọi 🥐</span>';
            }

            const opacityClass = isOut ? 'opacity-40 grayscale pointer-events-none' : '';

            phtml += `
                <button onclick="selectPastry('${pKey}')" id="btn-pastry-${pKey}" class="pastry-btn relative flex items-center gap-2 p-2 rounded-2xl ${borderClass} ${opacityClass} transition text-left cursor-pointer">
                    <span class="text-xl flex-shrink-0">${p.icon}</span>
                    <div class="overflow-hidden flex-1">
                        <div class="text-xs font-bold text-gray-800 truncate">${p.name}</div>
                        <div class="text-[11px] font-bold text-amber-600">+${formatVND(p.price)}</div>
                    </div>
                    <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${stock} cái</span>
                    ${tag}
                </button>
            `;
        });
        pastryContainer.innerHTML = phtml;
    }

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

    if (gameState.cup.pastryId && typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[gameState.cup.pastryId]) {
        const p = PASTRY_MENU[gameState.cup.pastryId];
        cupPrice += p.price;
        summaryParts.push(p.name);
    }

    const elSum = document.getElementById('cup-summary-text');
    const elPrice = document.getElementById('cup-price-text');
    if (elSum) {
        elSum.textContent = summaryParts.length > 0 ? summaryParts.join(' + ') : 'Ly rỗng (Hãy chọn cốt trà)';
    }
    if (elPrice) {
        elPrice.textContent = formatVND(cupPrice);
    }

    // 4. Trạng thái nút hoàn thành ly / phục vụ bánh
    const finishBtn = document.getElementById('btn-finish-drink');
    if (finishBtn) {
        const order = gameState.currentOrder;
        const isOrdering = gameState.phase === 'ORDERING';

        if (order && !order.teaId && order.pastryId) {
            // Đơn hàng CHỈ MUA BÁNH NGỌT: Nút phục vụ bánh
            const hasPastryOnPlate = Boolean(gameState.cup.pastryId);
            finishBtn.disabled = !(isOrdering && hasPastryOnPlate);
            finishBtn.innerHTML = `<span>🥐 Phục Vụ Bánh Cho Khách</span>`;
            finishBtn.className = (isOrdering && hasPastryOnPlate)
                ? 'btn-mint w-full bg-amber-500 hover:bg-amber-600 text-white font-title text-base sm:text-lg py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer'
                : 'btn-mint w-full bg-gray-200 text-gray-400 font-title text-base sm:text-lg py-3 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed';
        } else {
            // Đơn có nước (hoặc nước + bánh)
            const canFinish = isOrdering && gameState.cup.teaId && !gameState.cup.isSealed;
            finishBtn.disabled = !canFinish;
            finishBtn.innerHTML = `<span>✨ Dập Nắp Ly & Phục Vụ</span>`;
            finishBtn.className = canFinish
                ? 'btn-mint w-full bg-pink-500 hover:bg-pink-600 text-white font-title text-base sm:text-lg py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer'
                : 'btn-mint w-full bg-gray-200 text-gray-400 font-title text-base sm:text-lg py-3 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed';
        }
    }
}

function quickPrepareAndServePastry(pastryId) {
    if (gameState.phase !== 'ORDERING' || !gameState.currentOrder) return;
    if (typeof selectPastry === 'function') {
        selectPastry(pastryId);
    }
    setTimeout(() => {
        if (typeof finishAndServeDrink === 'function') {
            finishAndServeDrink();
        }
    }, 250);
}
window.quickPrepareAndServePastry = quickPrepareAndServePastry;

function showToast(msg) {
    const toast = document.getElementById('toast-banner');
    if (toast) {
        toast.textContent = msg;
    }
}

function showSpeechBubble(title, message, isError = false) {
    const bubble = document.getElementById('customer-bubble');
    if (!bubble) return;

    const errBox = document.getElementById('bubble-error');
    if (isError && errBox) {
        errBox.textContent = message;
        errBox.classList.remove('hidden');
    } else if (errBox) {
        errBox.classList.add('hidden');
    }
    bubble.classList.remove('hidden');
}

function hideSpeechBubble() {
    const bubble = document.getElementById('customer-bubble');
    if (bubble) {
        bubble.classList.add('hidden');
    }
    const errBox = document.getElementById('bubble-error');
    if (errBox) {
        errBox.classList.add('hidden');
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
    const tea = (order.teaId && TEA_MENU[order.teaId]) ? TEA_MENU[order.teaId] : null;

    document.getElementById('bill-customer').textContent = `${order.customer.avatar} ${order.customer.name}`;
    document.getElementById('bill-tea-name').textContent = tea ? tea.name : (order.pastryId && PASTRY_MENU[order.pastryId] ? `🥐 ${PASTRY_MENU[order.pastryId].name}` : 'Món gọi');
    document.getElementById('bill-tea-price').textContent = tea ? formatVND(tea.price) : '0đ';

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

    // Hiển thị dòng thưởng tốc độ & số sao đạt được
    const bonusRow = document.getElementById('bill-speed-bonus-row');
    const starsText = document.getElementById('bill-stars-text');
    const bonusPrice = document.getElementById('bill-bonus-price');
    if (order.speedBonus && order.speedBonus > 0) {
        if (bonusRow) bonusRow.classList.remove('hidden');
        if (starsText) starsText.textContent = `${'⭐'.repeat(order.stars || 3)} Thưởng Tốc Độ:`;
        if (bonusPrice) bonusPrice.textContent = `+${formatVND(order.speedBonus)}`;
    } else {
        if (bonusRow) bonusRow.classList.add('hidden');
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

/* ============================================================================
 * QUẢN LÝ CỬA HÀNG NÂNG CẤP & NỘI THẤT (SHOP MODAL UI)
 * ============================================================================ */

function renderShopItems() {
    const list = document.getElementById('shop-items-list');
    const elCurrent = document.getElementById('shop-current-money');
    if (elCurrent) elCurrent.textContent = formatVND(gameState.money);
    if (!list || typeof SHOP_UPGRADES === 'undefined') return;

    list.innerHTML = '';
    SHOP_UPGRADES.forEach(item => {
        const currentLvl = (gameState.upgradeLevels && gameState.upgradeLevels[item.id]) || (gameState.upgrades[item.id] ? 1 : 0);
        const maxLvl = item.maxLevel || 1;
        const isMax = currentLvl >= maxLvl;

        let nextCost = item.price;
        let nextName = item.name;
        let nextDesc = item.desc;
        if (item.levels && item.levels[currentLvl]) {
            nextCost = item.levels[currentLvl].price;
            nextName = item.levels[currentLvl].name;
            nextDesc = item.levels[currentLvl].desc;
        }

        const canAfford = gameState.money >= nextCost;

        const card = document.createElement('div');
        card.className = `p-3.5 rounded-2xl border-2 flex flex-col justify-between transition ${
            isMax 
                ? 'border-emerald-300 bg-emerald-50/60' 
                : currentLvl > 0 
                    ? 'border-amber-300 bg-amber-50/40' 
                    : 'border-pink-100 bg-white hover:border-pink-300'
        }`;

        let actionBtnHtml = '';
        if (isMax) {
            actionBtnHtml = `
                <button disabled class="w-full bg-emerald-100 text-emerald-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-default">
                    ✓ Đã đạt cấp tối đa (${currentLvl}/${maxLvl})
                </button>
            `;
        } else if (currentLvl > 0) {
            actionBtnHtml = `
                <button onclick="buyUpgrade('${item.id}')" class="w-full ${
                    canAfford 
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1">
                    ⚡ Lên Cấp ${currentLvl + 1} (${formatVND(nextCost)})
                </button>
            `;
        } else {
            actionBtnHtml = `
                <button onclick="buyUpgrade('${item.id}')" class="w-full ${
                    canAfford 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1">
                    🛒 Mua (${formatVND(nextCost)})
                </button>
            `;
        }

        const lvlBadge = maxLvl > 1 
            ? `<span class="text-[10px] font-black px-2 py-0.5 rounded-full ${isMax ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-800'}">Cấp ${currentLvl}/${maxLvl}</span>` 
            : (currentLvl > 0 ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Đã mua</span>` : '');

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-2xl">${item.icon}</span>
                    <div class="flex items-center gap-1.5">
                        ${lvlBadge}
                        <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-600">
                            ${item.category}
                        </span>
                    </div>
                </div>
                <h4 class="font-bold text-gray-800 text-sm mb-1">${item.name}</h4>
                <p class="text-xs text-gray-500 leading-snug mb-1">${currentLvl > 0 && !isMax ? nextDesc : item.desc}</p>
                <div class="text-[11px] font-bold text-pink-600 mb-3">${item.benefit}</div>
            </div>
            ${actionBtnHtml}
        `;
        list.appendChild(card);
    });
}

function openShopModal() {
    playSoundEffect('click');
    const modal = document.getElementById('shop-modal');
    if (modal) {
        renderShopItems();
        modal.classList.remove('hidden');
    }
}

function closeShopModal() {
    playSoundEffect('click');
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.add('hidden');
}

/* ============================================================================
 * 1. QUẢN LÝ KHO & CHỢ NGUYÊN LIỆU (INVENTORY MODAL UI)
 * ============================================================================ */

function renderInventoryModal() {
    const list = document.getElementById('inventory-items-list');
    const elCurrent = document.getElementById('inventory-current-money');
    if (elCurrent) elCurrent.textContent = formatVND(gameState.money);
    if (!list || typeof INVENTORY_ITEMS === 'undefined') return;

    list.innerHTML = '';
    Object.keys(INVENTORY_ITEMS).forEach(itemId => {
        const item = INVENTORY_ITEMS[itemId];
        const stock = gameState.inventory[itemId] || 0;
        const canAffordSingle = gameState.money >= item.costSingle;
        const canAffordPack = gameState.money >= item.packCost;

        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        let statusText = `Còn ${stock} ${item.unit}`;
        if (stock === 0) {
            badgeColor = 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse';
            statusText = 'HẾT HÀNG ⚠️';
        } else if (stock <= 3) {
            badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
            statusText = `Sắp hết (${stock})`;
        }

        const card = document.createElement('div');
        card.className = 'p-3.5 rounded-2xl border-2 border-pink-100 bg-white hover:border-pink-300 flex flex-col justify-between transition';
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-3xl">${item.icon}</span>
                    <span class="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}">
                        ${statusText}
                    </span>
                </div>
                <h4 class="font-bold text-gray-800 text-sm mb-0.5">${item.name}</h4>
                <p class="text-xs text-gray-500 mb-3">${item.desc}</p>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-pink-50">
                <button onclick="buyInventoryItem('${itemId}', false)" class="${
                    canAffordSingle 
                        ? 'bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } font-bold py-1.5 px-2 rounded-xl text-[11px] transition text-center">
                    +1 ${item.unit}<br>
                    <span class="text-[10px] font-semibold text-gray-500">${formatVND(item.costSingle)}</span>
                </button>
                <button onclick="buyInventoryItem('${itemId}', true)" class="${
                    canAffordPack 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } font-bold py-1.5 px-2 rounded-xl text-[11px] transition text-center">
                    Thùng sỉ (+${item.packQty})<br>
                    <span class="text-[10px] font-medium opacity-90">${formatVND(item.packCost)}</span>
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function openInventoryModal() {
    playSoundEffect('click');
    const modal = document.getElementById('inventory-modal');
    if (modal) {
        renderInventoryModal();
        modal.classList.remove('hidden');
    }
}

function closeInventoryModal() {
    playSoundEffect('click');
    const modal = document.getElementById('inventory-modal');
    if (modal) modal.classList.add('hidden');
}

function updateInventoryBadgesUI() {
    // Cập nhật số lượng trên các nút cốt trà
    Object.keys(TEA_MENU).forEach(tKey => {
        const btn = document.getElementById(`btn-tea-${tKey}`);
        if (!btn) return;
        const oldStock = btn.querySelector('.stock-indicator');
        if (oldStock) oldStock.remove();

        // Lấy nguyên liệu chính của loại trà
        const required = (typeof TEA_RECIPES !== 'undefined' && TEA_RECIPES[tKey]) ? TEA_RECIPES[tKey] : [];
        const minStock = required.reduce((min, ingId) => Math.min(min, gameState.inventory[ingId] || 0), 999);

        let stockText = minStock > 0 ? `Kho: ${minStock}` : 'Hết ⚠️';
        let stockCls = minStock > 0 ? 'text-gray-400' : 'text-rose-600 font-bold bg-rose-50 px-1 rounded';

        const label = btn.querySelector('.font-bold');
        if (label) {
            label.insertAdjacentHTML('beforeend', `<span class="stock-indicator text-[10px] ml-1.5 ${stockCls}">(${stockText})</span>`);
        }
    });

    // Cập nhật số lượng trên các nút topping
    Object.keys(TOPPING_MENU).forEach(topKey => {
        const btn = document.getElementById(`btn-top-${topKey}`);
        if (!btn) return;
        const oldStock = btn.querySelector('.stock-indicator');
        if (oldStock) oldStock.remove();

        const ingId = (typeof TOPPING_RECIPES !== 'undefined') ? TOPPING_RECIPES[topKey] : topKey;
        const stock = gameState.inventory[ingId] || 0;

        let stockText = stock > 0 ? `Kho: ${stock}` : 'Hết ⚠️';
        let stockCls = stock > 0 ? 'text-gray-400' : 'text-rose-600 font-bold bg-rose-50 px-1 rounded';

        const label = btn.querySelector('.font-bold');
        if (label) {
            label.insertAdjacentHTML('beforeend', `<span class="stock-indicator text-[10px] ml-1.5 ${stockCls}">(${stockText})</span>`);
        }
    });
}

/* ============================================================================
 * 2. QUẢN LÝ MENU & GIÁ BÁN TÙY CHỈNH (MENU SETTINGS MODAL UI)
 * ============================================================================ */

function renderMenuSettingsModal() {
    const list = document.getElementById('menu-items-setting-list');
    if (!list || typeof TEA_MENU === 'undefined') return;

    list.innerHTML = '';
    Object.keys(TEA_MENU).forEach(teaId => {
        const tea = TEA_MENU[teaId];
        const isEnabled = (typeof isItemActive === 'function') ? isItemActive('teas', teaId) : true;
        const currentPrice = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(teaId) : tea.price;
        const cost = (typeof calculateDrinkCost === 'function') ? calculateDrinkCost(teaId) : 5000;
        const profit = currentPrice - cost;
        const marginPct = Math.round((profit / currentPrice) * 100);

        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl border-2 flex flex-col justify-between transition ${
            isEnabled 
                ? 'border-pink-200 bg-white shadow-sm' 
                : 'border-gray-200 bg-gray-50 opacity-75'
        }`;

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-4 h-4 rounded-full inline-block shadow-sm" style="background-color: ${tea.hex};"></span>
                        <h4 class="font-bold text-gray-800 text-sm">${tea.name}</h4>
                    </div>
                    <button onclick="toggleMenuItemState('teas', '${teaId}')" class="px-2.5 py-1 rounded-xl text-xs font-extrabold transition ${
                        isEnabled 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }">
                        ${isEnabled ? '✓ Đang Bán' : '✕ Tạm Ngưng'}
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-pink-50 text-center">
                    <div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase">Giá vốn</div>
                        <div class="text-xs font-extrabold text-gray-600">${formatVND(cost)}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase">Giá bán</div>
                        <div class="text-sm font-black text-pink-600">${formatVND(currentPrice)}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase">Lãi ròng</div>
                        <div class="text-xs font-extrabold text-emerald-600">+${formatVND(profit)} (${marginPct}%)</div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-1">
                <span class="text-xs text-gray-500 font-semibold">Tùy chỉnh giá bán:</span>
                <div class="flex items-center gap-1.5">
                    <button onclick="adjustMenuItemPrice('teas', '${teaId}', -1000)" class="w-8 h-8 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-base flex items-center justify-center transition active:scale-95">
                        -
                    </button>
                    <span class="text-xs font-bold text-gray-700 px-1 min-w-[55px] text-center">${formatVND(currentPrice)}</span>
                    <button onclick="adjustMenuItemPrice('teas', '${teaId}', 1000)" class="w-8 h-8 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-base flex items-center justify-center transition active:scale-95">
                        +
                    </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function openMenuSettingsModal() {
    playSoundEffect('click');
    const modal = document.getElementById('menu-settings-modal');
    if (modal) {
        renderMenuSettingsModal();
        modal.classList.remove('hidden');
    }
}

function closeMenuSettingsModal() {
    playSoundEffect('click');
    const modal = document.getElementById('menu-settings-modal');
    if (modal) modal.classList.add('hidden');
}

/* ============================================================================
 * 3. QUẢN LÝ NHÂN SỰ & TUYỂN DỤNG (STAFF MODAL UI)
 * ============================================================================ */

function renderStaffModal() {
    const list = document.getElementById('staff-roles-list');
    const elCurrent = document.getElementById('staff-current-money');
    if (elCurrent) elCurrent.textContent = formatVND(gameState.money);
    if (!list || typeof STAFF_ROLES === 'undefined') return;

    list.innerHTML = '';
    Object.keys(STAFF_ROLES).forEach(roleId => {
        const staff = STAFF_ROLES[roleId];
        const isHired = gameState.staff[roleId];
        const canAfford = gameState.money >= staff.hireCost;

        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl border-2 flex flex-col justify-between transition ${
            isHired 
                ? 'border-emerald-300 bg-emerald-50/60 shadow-sm' 
                : 'border-pink-100 bg-white hover:border-pink-300'
        }`;

        let btnAction = '';
        if (isHired) {
            btnAction = `
                <div class="flex items-center gap-2">
                    <span class="flex-1 bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-xl text-center">
                        ✓ Đang làm việc (Lương: ${formatVND(staff.dailySalary)}/ngày)
                    </span>
                    <button onclick="fireStaff('${roleId}', scene)" class="bg-rose-100 hover:bg-rose-200 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold transition">
                        Nghỉ việc
                    </button>
                </div>
            `;
        } else {
            btnAction = `
                <button onclick="hireStaff('${roleId}', scene)" class="w-full ${
                    canAfford 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                    🤝 Tuyển Dụng (${formatVND(staff.hireCost)}) • Lương: ${formatVND(staff.dailySalary)}/ngày
                </button>
            `;
        }

        card.innerHTML = `
            <div>
                <div class="flex items-center gap-3 mb-2.5">
                    <div class="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl shadow-sm">
                        ${staff.icon}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm leading-tight">${staff.name}</h4>
                        <span class="text-xs font-semibold text-pink-500">${staff.title}</span>
                    </div>
                </div>
                <p class="text-xs text-gray-600 mb-2 leading-relaxed">${staff.desc}</p>
                <div class="bg-pink-50/70 border border-pink-100 p-2 rounded-xl text-[11px] font-bold text-pink-700 mb-3">
                    💡 Hiệu quả: ${staff.benefit}
                </div>
            </div>
            ${btnAction}
        `;
        list.appendChild(card);
    });
}

function openStaffModal() {
    playSoundEffect('click');
    const modal = document.getElementById('staff-modal');
    if (modal) {
        renderStaffModal();
        modal.classList.remove('hidden');
    }
}

function closeStaffModal() {
    playSoundEffect('click');
    const modal = document.getElementById('staff-modal');
    if (modal) modal.classList.add('hidden');
}

/* ============================================================================
 * 4. BẢNG PHA CHẾ COLLAPSIBLE (SLIDE-IN DRAWER)
 * ============================================================================ */

function toggleCraftingPanel() {
    const panel = document.getElementById('crafting-panel');
    if (!panel) return;
    if (panel.classList.contains('is-collapsed')) {
        openCraftingPanel();
    } else {
        closeCraftingPanel();
    }
}

function openCraftingPanel() {
    const panel = document.getElementById('crafting-panel');
    if (panel) {
        panel.classList.remove('is-collapsed');
        playSoundEffect('click');
    }
}

function closeCraftingPanel() {
    const panel = document.getElementById('crafting-panel');
    if (panel) {
        panel.classList.add('is-collapsed');
        playSoundEffect('click');
    }
}

/* ============================================================================
 * 5. MENU CHỌN MÓN BÁN HẰNG NGÀY (DAILY MENU PLANNING MODAL)
 * ============================================================================ */

let dailyMenuCategory = 'teas';

function setDailyMenuCategory(cat) {
    dailyMenuCategory = cat;
    renderDailyMenuModal();
    playSoundEffect('click');
}

function renderDailyMenuModal() {
    const list = document.getElementById('daily-menu-items-list');
    if (!list) return;

    const hasBakery = Boolean(gameState.upgrades && gameState.upgrades.bakery_counter);
    const activeTeas = (typeof getActiveTeaIds === 'function') ? getActiveTeaIds() : [];
    const activeToppings = (typeof getActiveToppingIds === 'function') ? getActiveToppingIds() : [];
    const activePastries = hasBakery && (typeof getActivePastryIds === 'function') ? getActivePastryIds() : [];

    const totalTeas = Object.keys(TEA_MENU || {}).length;
    const totalToppings = Object.keys(TOPPING_MENU || {}).length;
    const totalPastries = Object.keys(typeof PASTRY_MENU !== 'undefined' ? PASTRY_MENU : {}).length;

    // Update tab labels with live counts
    const tabTeas = document.getElementById('tab-daily-teas');
    if (tabTeas) {
        tabTeas.innerHTML = `🍵 Trà (${activeTeas.length}/${totalTeas})`;
        tabTeas.className = (dailyMenuCategory === 'teas')
            ? 'px-2.5 py-1.5 rounded-xl text-xs font-black bg-pink-500 text-white shadow-sm transition'
            : 'px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-600 hover:bg-pink-50 transition border border-pink-100';
    }

    const tabToppings = document.getElementById('tab-daily-toppings');
    if (tabToppings) {
        tabToppings.innerHTML = `🍡 Topping (${activeToppings.length}/${totalToppings})`;
        tabToppings.className = (dailyMenuCategory === 'toppings')
            ? 'px-2.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-sm transition'
            : 'px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-600 hover:bg-emerald-50 transition border border-pink-100';
    }

    const tabPastries = document.getElementById('tab-daily-pastries');
    if (tabPastries) {
        tabPastries.innerHTML = hasBakery ? `🥐 Bánh (${activePastries.length}/${totalPastries})` : '🔒 Bánh (Chưa mở)';
        tabPastries.className = (dailyMenuCategory === 'pastries')
            ? 'px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-sm transition'
            : 'px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-600 hover:bg-amber-50 transition border border-pink-100';
    }

    list.innerHTML = '';

    // Action bar: Bulk select/deselect
    const actionBar = document.createElement('div');
    actionBar.className = 'flex items-center justify-between pb-2 mb-2 border-b border-pink-100 text-xs';
    
    let activeInCurCat = (dailyMenuCategory === 'teas') ? activeTeas.length : (dailyMenuCategory === 'toppings' ? activeToppings.length : activePastries.length);
    let totalInCurCat = (dailyMenuCategory === 'teas') ? totalTeas : (dailyMenuCategory === 'toppings' ? totalToppings : totalPastries);

    if (dailyMenuCategory === 'pastries' && !hasBakery) {
        actionBar.innerHTML = `
            <span class="text-amber-700 font-bold flex items-center gap-1">🔒 Quầy bánh chưa mở khóa</span>
            <span class="text-[11px] text-gray-400">0/${totalInCurCat} món</span>
        `;
    } else {
        actionBar.innerHTML = `
            <span class="text-gray-600 font-bold">Đang chọn: <strong class="text-pink-600">${activeInCurCat}/${totalInCurCat} món</strong></span>
            <div class="flex items-center gap-1.5">
                <button onclick="if(typeof setCategoryItemsState === 'function') setCategoryItemsState('${dailyMenuCategory}', true)" class="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 font-extrabold transition text-[11px] shadow-xs cursor-pointer">
                    ✓ Chọn tất cả
                </button>
                <button onclick="if(typeof setCategoryItemsState === 'function') setCategoryItemsState('${dailyMenuCategory}', false)" class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition text-[11px] cursor-pointer">
                    ✕ Bỏ chọn hết
                </button>
            </div>
        `;
    }
    list.appendChild(actionBar);

    if (dailyMenuCategory === 'teas') {
        Object.keys(TEA_MENU).forEach(teaId => {
            const tea = TEA_MENU[teaId];
            const isEnabled = (typeof isItemActive === 'function') ? isItemActive('teas', teaId) : true;
            const price = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(teaId) : tea.price;

            const card = document.createElement('div');
            card.onclick = () => toggleDailyItem('teas', teaId);
            card.className = `p-3 rounded-2xl border-2 flex items-center justify-between transition cursor-pointer select-none ${
                isEnabled ? 'border-pink-400 bg-pink-50/70 shadow-sm hover:border-pink-500' : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-85'
            }`;

            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full shadow-inner border border-white" style="background-color: ${tea.hex};"></span>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${tea.name}</h4>
                        <div class="text-xs font-semibold text-pink-600">Giá bán: ${formatVND(price)}</div>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); toggleDailyItem('teas', '${teaId}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition pointer-events-auto ${
                    isEnabled ? 'bg-pink-500 text-white hover:bg-pink-600 shadow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }">
                    ${isEnabled ? '✓ Bán món này' : '✕ Tạm ngưng'}
                </button>
            `;
            list.appendChild(card);
        });
    } else if (dailyMenuCategory === 'toppings') {
        Object.keys(TOPPING_MENU).forEach(topId => {
            const top = TOPPING_MENU[topId];
            const isEnabled = (typeof isItemActive === 'function') ? isItemActive('toppings', topId) : true;
            const stock = (gameState.inventory && gameState.inventory[topId] !== undefined) ? gameState.inventory[topId] : 0;

            const card = document.createElement('div');
            card.onclick = () => toggleDailyItem('toppings', topId);
            card.className = `p-3 rounded-2xl border-2 flex items-center justify-between transition cursor-pointer select-none ${
                isEnabled ? 'border-emerald-400 bg-emerald-50/70 shadow-sm hover:border-emerald-500' : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-85'
            }`;

            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg border border-pink-100">${top.icon || '🍬'}</span>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${top.name}</h4>
                        <div class="text-xs font-semibold text-emerald-600">+${formatVND(top.price)} • Kho: ${stock} phần</div>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); toggleDailyItem('toppings', '${topId}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition pointer-events-auto ${
                    isEnabled ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }">
                    ${isEnabled ? '✓ Bán topping' : '✕ Tạm ngưng'}
                </button>
            `;
            list.appendChild(card);
        });
    } else if (dailyMenuCategory === 'pastries') {
        if (!hasBakery) {
            const lockNotice = document.createElement('div');
            lockNotice.className = 'p-5 text-center bg-amber-50/90 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center justify-center my-1';
            lockNotice.innerHTML = `
                <div class="text-3xl mb-1.5 animate-bounce">🔒🥐</div>
                <h4 class="font-black text-gray-800 text-sm mb-1">Chưa Mở Khóa Quầy Bánh Ngọt!</h4>
                <p class="text-xs text-gray-600 mb-3 max-w-sm">Tiệm hiện chưa có Quầy Bánh Ngọt. Hãy mua <strong>"Quầy Bánh Ngọt 3D"</strong> trong Cửa Hàng Nâng Cấp để có thể mở bán bánh cho khách.</p>
                <button onclick="closeStartDayModal(); if(typeof openShopModal === 'function') openShopModal();" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer">
                    🛍️ Mua Quầy Bánh Trong Cửa Hàng (50k)
                </button>
            `;
            list.appendChild(lockNotice);
        } else if (typeof PASTRY_MENU !== 'undefined') {
            Object.keys(PASTRY_MENU).forEach(pastryId => {
                const pastry = PASTRY_MENU[pastryId];
                const isEnabled = (typeof isItemActive === 'function') ? isItemActive('pastries', pastryId) : false;
                const stock = (gameState.inventory && gameState.inventory[pastryId] !== undefined) ? gameState.inventory[pastryId] : 0;

                const card = document.createElement('div');
                card.onclick = () => toggleDailyItem('pastries', pastryId);
                card.className = `p-3 rounded-2xl border-2 flex items-center justify-between transition cursor-pointer select-none ${
                    isEnabled ? 'border-amber-400 bg-amber-50/70 shadow-sm hover:border-amber-500' : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-85'
                }`;

                card.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl border border-amber-200">${pastry.icon}</span>
                        <div>
                            <h4 class="font-bold text-gray-800 text-sm">${pastry.name}</h4>
                            <div class="text-xs font-semibold text-amber-700">+${formatVND(pastry.price)} • Kho: ${stock} cái</div>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); toggleDailyItem('pastries', '${pastryId}')" class="px-3 py-1.5 rounded-xl text-xs font-black transition pointer-events-auto ${
                        isEnabled ? 'bg-amber-500 text-white hover:bg-amber-600 shadow' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }">
                        ${isEnabled ? '✓ Bán bánh' : '✕ Tạm ngưng'}
                    </button>
                `;
                list.appendChild(card);
            });
        }
    }
}

function toggleDailyItem(cat, id) {
    if (typeof toggleMenuItemState === 'function') {
        toggleMenuItemState(cat, id);
    } else if (typeof toggleActiveItem === 'function') {
        toggleActiveItem(cat, id);
    }
    renderDailyMenuModal();
}

function openDailyMenuModal() {
    if (typeof openStartDayModal === 'function') {
        openStartDayModal();
        return;
    }
    playSoundEffect('bell');
    const modal = document.getElementById('start-day-modal') || document.getElementById('daily-menu-modal');
    if (modal) {
        renderDailyMenuModal();
        modal.classList.remove('hidden');
    }
}

function closeDailyMenuModal() {
    playSoundEffect('click');
    const modal = document.getElementById('start-day-modal') || document.getElementById('daily-menu-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmDailyMenuAndStartDay() {
    closeDailyMenuModal();
    if (typeof commitStartNewDay === 'function') {
        commitStartNewDay();
    }
}

/* ============================================================================
 * 2. QUẢN LÝ NỀN GẠCH & ẨN HIỆN NỘI THẤT (DECOR & FLOORING CUSTOMIZER)
 * ============================================================================ */

let currentDecorTab = 'flooring'; // 'flooring' | 'visibility'

function setDecorCustomizerTab(tab) {
    currentDecorTab = tab;
    const btnFloor = document.getElementById('tab-customizer-floor');
    const btnVis = document.getElementById('tab-customizer-vis');

    if (btnFloor && btnVis) {
        if (tab === 'flooring') {
            btnFloor.className = 'px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-pink-500 text-white shadow-sm transition';
            btnVis.className = 'px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-gray-600 hover:bg-pink-50 transition border border-pink-100';
        } else {
            btnFloor.className = 'px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-gray-600 hover:bg-pink-50 transition border border-pink-100';
            btnVis.className = 'px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-pink-500 text-white shadow-sm transition';
        }
    }
    renderDecorCustomizerModal();
    playSoundEffect('click');
}

function renderDecorCustomizerModal() {
    const list = document.getElementById('decor-customizer-list');
    const elMoney = document.getElementById('decor-customizer-money');
    if (elMoney) elMoney.textContent = formatVND(gameState.money);
    if (!list) return;

    list.innerHTML = '';

    if (currentDecorTab === 'flooring') {
        // TAB 1: DANH MỤC NỀN GẠCH (FLOORING)
        if (typeof FLOORING_CATALOG !== 'undefined') {
            FLOORING_CATALOG.forEach(floor => {
                const isUnlocked = gameState.flooring && gameState.flooring.unlocked && gameState.flooring.unlocked.includes(floor.id);
                const isCurrent = gameState.flooring && gameState.flooring.current === floor.id;
                const canAfford = gameState.money >= floor.price;

                const card = document.createElement('div');
                card.className = `p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                    isCurrent 
                        ? 'border-pink-500 bg-pink-50/70 shadow-sm' 
                        : isUnlocked 
                            ? 'border-emerald-200 bg-emerald-50/40' 
                            : 'border-gray-200 bg-white hover:border-pink-200'
                }`;

                let btnHtml = '';
                if (isCurrent) {
                    btnHtml = `
                        <button disabled class="px-3.5 py-2 rounded-xl text-xs font-black bg-pink-500 text-white shadow flex items-center gap-1 cursor-default">
                            ✓ Đang sử dụng
                        </button>
                    `;
                } else if (isUnlocked) {
                    btnHtml = `
                        <button onclick="selectFlooring('${floor.id}')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow flex items-center gap-1">
                            🎨 Chọn nền này
                        </button>
                    `;
                } else {
                    btnHtml = `
                        <button onclick="buyFlooring('${floor.id}')" class="px-3.5 py-2 rounded-xl text-xs font-extrabold ${
                            canAfford ? 'bg-pink-500 hover:bg-pink-600 text-white shadow' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        } transition flex items-center gap-1">
                            🛒 Mua (${formatVND(floor.price)})
                        </button>
                    `;
                }

                card.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-pink-100" style="background: linear-gradient(135deg, #${floor.colorA.toString(16).padStart(6, '0')}, #${floor.colorB.toString(16).padStart(6, '0')})">
                            ${floor.icon}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800 text-sm">${floor.name}</h4>
                                ${isCurrent ? '<span class="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">Hiện tại</span>' : ''}
                            </div>
                            <p class="text-xs text-gray-500">${floor.desc}</p>
                        </div>
                    </div>
                    ${btnHtml}
                `;
                list.appendChild(card);
            });
        }
    } else {
        // TAB 2: QUẢN LÝ ẨN / HIỆN ĐỒ NỘI THẤT (DECOR VISIBILITY)
        if (typeof SHOP_UPGRADES !== 'undefined') {
            const ownedItems = SHOP_UPGRADES.filter(u => gameState.upgrades && gameState.upgrades[u.id]);

            if (ownedItems.length === 0) {
                list.innerHTML = `
                    <div class="col-span-full p-6 text-center text-gray-400">
                        <span class="text-4xl block mb-2">🛋️</span>
                        <div class="font-bold text-sm">Bạn chưa sở hữu đồ trang trí hay nội thất nào!</div>
                        <div class="text-xs mt-1">Hãy ghé "🛍️ Nâng Cấp Quán" để mua đèn Neon, thảm hoa, máy hát đĩa,...</div>
                    </div>
                `;
            } else {
                ownedItems.forEach(item => {
                    const isVisible = (gameState.decorVisibility && gameState.decorVisibility[item.id] !== undefined) 
                        ? gameState.decorVisibility[item.id] 
                        : true;

                    const card = document.createElement('div');
                    card.className = `p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                        isVisible ? 'border-pink-300 bg-pink-50/50' : 'border-gray-200 bg-gray-50 opacity-70'
                    }`;

                    card.innerHTML = `
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${item.icon}</span>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                                <div class="text-xs text-gray-500">${item.category}</div>
                            </div>
                        </div>
                        <button onclick="toggleDecorVisibility('${item.id}')" class="px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                            isVisible 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        }">
                            ${isVisible ? '👁️ Đang Hiện' : '🚫 Đang Ẩn'}
                        </button>
                    `;
                    list.appendChild(card);
                });
            }
        }
    }
}

function openDecorCustomizerModal() {
    playSoundEffect('bell');
    const modal = document.getElementById('decor-customizer-modal');
    if (modal) {
        renderDecorCustomizerModal();
        modal.classList.remove('hidden');
    }
}

function closeDecorCustomizerModal() {
    playSoundEffect('click');
    const modal = document.getElementById('decor-customizer-modal');
    if (modal) modal.classList.add('hidden');
}

/* ============================================================================
 * 3. BẮT ĐẦU NGÀY MỚI & THIẾT LẬP TARGET (START OF DAY MODAL)
 * ============================================================================ */

function selectDailyTargetPreset(type, val) {
    if (typeof setDailyTarget === 'function') {
        setDailyTarget(type, val);
    }
    const inputAmount = document.getElementById('start-day-target-input');
    if (inputAmount && type === 'revenue') {
        inputAmount.value = val;
    }
    playSoundEffect('click');
    renderStartDayModal();
}

function renderStartDayModal() {
    const target = gameState.dailyTarget || { type: 'revenue', targetAmount: 100000 };
    const curTargetVal = target.targetAmount || 100000;

    // Highlight preset buttons
    const presets = [50000, 100000, 200000, 300000];
    presets.forEach(p => {
        const btn = document.getElementById(`target-preset-${p}`);
        if (btn) {
            if (target.type === 'revenue' && curTargetVal === p) {
                btn.className = 'px-3 py-2 rounded-xl text-xs font-black bg-pink-500 text-white shadow transition border border-pink-500';
            } else {
                btn.className = 'px-3 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 hover:bg-pink-50 transition border border-pink-200';
            }
        }
    });

    // Cập nhật tồn kho nhanh
    const stockGrid = document.getElementById('start-day-stock-grid');
    if (stockGrid && typeof INVENTORY_ITEMS !== 'undefined') {
        stockGrid.innerHTML = '';
        const keyItems = ['tea_leaf', 'fresh_milk', 'boba', 'cup_pack', 'croissant'];
        keyItems.forEach(k => {
            const item = INVENTORY_ITEMS[k];
            if (!item) return;
            const stock = gameState.inventory[k] || 0;
            const itemBadge = document.createElement('div');
            itemBadge.className = `p-2 rounded-xl border flex items-center justify-between text-xs font-bold ${
                stock <= 3 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-pink-50/60 border-pink-100 text-gray-700'
            }`;
            itemBadge.innerHTML = `
                <span class="flex items-center gap-1.5">
                    <span>${item.icon}</span> ${item.name}
                </span>
                <span class="${stock <= 3 ? 'text-rose-600 font-black' : 'text-emerald-600'}">
                    ${stock} ${item.unit}
                </span>
            `;
            stockGrid.appendChild(itemBadge);
        });
    }

    // Render danh sách món bán
    renderDailyMenuModal();
}

function openStartDayModal() {
    playSoundEffect('bell');
    const modal = document.getElementById('start-day-modal');
    if (modal) {
        renderStartDayModal();
        modal.classList.remove('hidden');
    }
}

function closeStartDayModal() {
    playSoundEffect('click');
    const modal = document.getElementById('start-day-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmStartDayAndOpen() {
    const activeTeas = (typeof getActiveTeaIds === 'function') ? getActiveTeaIds() : [];
    const hasBakery = Boolean(gameState.upgrades && gameState.upgrades.bakery_counter);
    const activePastries = hasBakery && (typeof getActivePastryIds === 'function') ? getActivePastryIds() : [];

    if (activeTeas.length === 0 && activePastries.length === 0) {
        playSoundEffect('error');
        showToast('⚠️ Quán chưa chọn món nào để bán! Vui lòng chọn ít nhất 1 loại Trà hoặc Bánh Ngọt để mở cửa.');
        return;
    }

    closeStartDayModal();

    // Đọc số tiền mục tiêu tùy chỉnh nếu người chơi nhập
    const inputAmount = document.getElementById('start-day-target-input');
    if (inputAmount && inputAmount.value) {
        const val = parseInt(inputAmount.value, 10);
        if (!isNaN(val) && val > 0) {
            setDailyTarget('revenue', val);
        }
    }

    if (!gameState.dailyTarget) {
        gameState.dailyTarget = { type: 'revenue', targetAmount: 100000, currentAmount: 0, isReached: false, isDayOpen: true };
    }
    gameState.dailyTarget.isDayOpen = true;

    playSoundEffect('bell');
    showToast(`🚪 Quán Boba Sweet đã chính thức MỞ CỬA Ngày ${gameState.day}! Khách hàng bắt đầu tới gọi món!`);

    if (typeof updateTargetProgressUI === 'function') {
        updateTargetProgressUI();
    }

    // Khách đầu tiên bước vào
    if (gameState.phase === 'WAITING_SPAWN') {
        setTimeout(() => {
            if (typeof spawnNextCustomer === 'function') {
                spawnNextCustomer();
            }
        }, 800);
    }
}

/* ============================================================================
 * 4. BÁO CÁO KẾ TOÁN TÀI CHÍNH CUỐI NGÀY (DAILY ACCOUNTING REPORT MODAL)
 * ============================================================================ */

function renderDailyReportModal() {
    if (typeof getDailyAccountingSummary !== 'function') return;

    const summary = getDailyAccountingSummary();

    const elDay = document.getElementById('report-day-num');
    const elRev = document.getElementById('report-revenue');
    const elCogs = document.getElementById('report-cogs');
    const elPurchase = document.getElementById('report-purchase');
    const elWages = document.getElementById('report-wages');
    const elNet = document.getElementById('report-net-profit');
    const elCups = document.getElementById('report-cups-sold');
    const elPastries = document.getElementById('report-pastries-sold');
    const elTops = document.getElementById('report-toppings-sold');
    const elRating = document.getElementById('report-rating');

    if (elDay) elDay.textContent = `Ngày ${gameState.day}`;
    if (elRev) elRev.textContent = `+${formatVND(summary.revenue)}`;
    if (elCogs) elCogs.textContent = `-${formatVND(summary.cogs)}`;
    if (elPurchase) elPurchase.textContent = `-${formatVND(summary.purchaseExpenses)}`;
    if (elWages) elWages.textContent = `-${formatVND(summary.staffWages)}`;

    if (elNet) {
        elNet.textContent = `${summary.netProfit >= 0 ? '+' : ''}${formatVND(summary.netProfit)}`;
        elNet.className = `text-lg sm:text-xl font-black ${summary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }

    if (elCups) elCups.textContent = `${summary.cupsSold} ly`;
    if (elPastries) elPastries.textContent = `${summary.pastriesSold} cái`;
    if (elTops) elTops.textContent = `${summary.toppingsSold} phần`;

    if (elRating) {
        const avg = (gameState.ratingCount && gameState.ratingCount > 0)
            ? (gameState.totalStars / gameState.ratingCount).toFixed(1)
            : '5.0';
        elRating.textContent = `${avg} ⭐`;
    }
}

function openDailyReportModal() {
    playSoundEffect('bell');
    const modal = document.getElementById('daily-report-modal');
    if (modal) {
        renderDailyReportModal();
        modal.classList.remove('hidden');
    }
}

function closeDailyReportModal() {
    playSoundEffect('click');
    const modal = document.getElementById('daily-report-modal');
    if (modal) modal.classList.add('hidden');
}




