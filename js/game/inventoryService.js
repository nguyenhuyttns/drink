/* ============================================================================
 * DỊCH VỤ QUẢN LÝ KHO & CHỢ NGUYÊN LIỆU (INVENTORY SERVICE)
 * Xử lý kiểm tra tồn kho, trừ nguyên liệu khi pha chế, cảnh báo mua nhanh và thống kê kế toán.
 * ============================================================================ */

/**
 * Hiển thị thông báo mua nhanh khi hết nguyên liệu giữa chừng
 * @param {string} itemId 
 */
function showQuickBuyAlert(itemId) {
    const item = INVENTORY_ITEMS[itemId];
    if (!item) return;

    playSoundEffect('error');

    // Kiểm tra container thông báo mua nhanh nổi trên màn hình
    const alertBox = document.getElementById('quick-buy-banner');
    if (alertBox) {
        alertBox.innerHTML = `
            <div class="pastel-panel interactive rounded-2xl p-3 sm:p-4 bg-white/95 border-2 border-rose-300 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-bounce">
                <div class="flex items-center gap-2.5">
                    <span class="text-2xl">${item.icon}</span>
                    <div>
                        <div class="text-xs sm:text-sm font-extrabold text-rose-600 leading-tight">⚠️ Hết ${item.name}!</div>
                        <div class="text-[11px] text-gray-500 font-semibold">Pha chế đang bị thiếu nguyên liệu này</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="buyInventoryItem('${itemId}', false); hideQuickBuyAlert();" class="px-2.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold transition">
                        Mua lẻ 1 ${item.unit} (${formatVND(item.costSingle)})
                    </button>
                    <button onclick="buyInventoryItem('${itemId}', true); hideQuickBuyAlert();" class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow transition flex items-center gap-1">
                        ⚡ Mua sỉ (+${item.packQty}) ${formatVND(item.packCost)}
                    </button>
                    <button onclick="hideQuickBuyAlert()" class="text-gray-400 hover:text-gray-600 text-sm font-bold px-1.5 py-1">
                        ✕
                    </button>
                </div>
            </div>
        `;
        alertBox.classList.remove('hidden');
    }

    showToast(`⚠️ Hết ${item.name}! Hãy bổ sung ngay để tiếp tục phục vụ!`);
}

function hideQuickBuyAlert() {
    const alertBox = document.getElementById('quick-buy-banner');
    if (alertBox) alertBox.classList.add('hidden');
}

/**
 * Kiểm tra xem có đủ nguyên liệu để rót loại trà này không
 * @param {string} teaId 
 * @returns {boolean}
 */
function checkCanPourTea(teaId) {
    if (!TEA_RECIPES[teaId]) return true;

    const required = TEA_RECIPES[teaId];
    for (const ingId of required) {
        const currentQty = gameState.inventory[ingId] || 0;
        if (currentQty <= 0) {
            showQuickBuyAlert(ingId);
            return false;
        }
    }
    return true;
}

/**
 * Tiêu hao nguyên liệu khi rót trà & tính giá vốn hàng bán (COGS)
 * @param {string} teaId 
 */
function consumeTeaIngredients(teaId) {
    if (!TEA_RECIPES[teaId]) return;

    const required = TEA_RECIPES[teaId];
    required.forEach(ingId => {
        if (gameState.inventory[ingId] > 0) {
            gameState.inventory[ingId] -= 1;
            const item = INVENTORY_ITEMS[ingId];
            if (item && gameState.accountingToday) {
                gameState.accountingToday.cogs = (gameState.accountingToday.cogs || 0) + item.costSingle;
            }
        }
    });

    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }
}

/**
 * Kiểm tra xem có đủ topping để thêm vào ly không
 * @param {string} toppingId 
 * @returns {boolean}
 */
function checkCanAddTopping(toppingId) {
    const ingId = TOPPING_RECIPES[toppingId];
    if (!ingId) return true;

    const currentQty = gameState.inventory[ingId] || 0;
    if (currentQty <= 0) {
        showQuickBuyAlert(ingId);
        return false;
    }
    return true;
}

/**
 * Tiêu hao nguyên liệu topping & tính giá vốn hàng bán (COGS)
 * @param {string} toppingId 
 */
function consumeToppingIngredient(toppingId) {
    const ingId = TOPPING_RECIPES[toppingId];
    if (!ingId) return;

    if (gameState.inventory[ingId] > 0) {
        gameState.inventory[ingId] -= 1;
        const item = INVENTORY_ITEMS[ingId];
        if (item && gameState.accountingToday) {
            gameState.accountingToday.cogs = (gameState.accountingToday.cogs || 0) + item.costSingle;
            gameState.accountingToday.toppingsSold = (gameState.accountingToday.toppingsSold || 0) + 1;
        }
    }

    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }
}

/**
 * Kiểm tra xem có ly & nắp dập để dập ly không
 * @returns {boolean}
 */
function checkCanSealCup() {
    const currentQty = gameState.inventory.cup_pack || 0;
    if (currentQty <= 0) {
        showQuickBuyAlert('cup_pack');
        return false;
    }
    return true;
}

/**
 * Tiêu hao 1 bộ ly & nắp khi hoàn tất dập & tính giá vốn hàng bán (COGS)
 */
function consumeCupPackaging() {
    if (gameState.inventory.cup_pack > 0) {
        gameState.inventory.cup_pack -= 1;
        const item = INVENTORY_ITEMS['cup_pack'];
        if (item && gameState.accountingToday) {
            gameState.accountingToday.cogs = (gameState.accountingToday.cogs || 0) + item.costSingle;
            gameState.accountingToday.cupsSold = (gameState.accountingToday.cupsSold || 0) + 1;
        }
    }

    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }
}

/**
 * Mua nguyên liệu từ chợ (Mua lẻ 1 phần hoặc Mua thùng sỉ)
 * @param {string} itemId 
 * @param {boolean} isPack 
 */
function buyInventoryItem(itemId, isPack) {
    const item = INVENTORY_ITEMS[itemId];
    if (!item) return;

    const qty = isPack ? item.packQty : 1;
    const cost = isPack ? item.packCost : item.costSingle;

    if (gameState.money < cost) {
        playSoundEffect('error');
        showToast(`⚠️ Không đủ tiền! Cần thêm ${formatVND(cost - gameState.money)} để mua.`);
        return;
    }

    gameState.money -= cost;
    gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + qty;
    gameState.dayStats.ingredientSpent += cost;

    // Ghi nhận vào kế toán mua sắm nhập kho trong ngày
    if (gameState.accountingToday) {
        gameState.accountingToday.purchaseExpenses = (gameState.accountingToday.purchaseExpenses || 0) + cost;
    }

    playSoundEffect('cash');
    updateTopStatsUI();

    if (typeof renderInventoryModal === 'function') {
        renderInventoryModal();
    }
    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }
    if (typeof renderStartDayModal === 'function') {
        renderStartDayModal();
    }

    hideQuickBuyAlert();

    const typeStr = isPack ? `thùng sỉ (+${qty} ${item.unit})` : `1 ${item.unit}`;
    showToast(`📦 Đã nhập thành công ${typeStr} "${item.name}"!`);

    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
}

/**
 * Kiểm tra xem có đủ bánh ngọt trong kho để phục vụ không
 * @param {string} pastryId 
 * @returns {boolean}
 */
function checkCanServePastry(pastryId) {
    const stock = gameState.inventory[pastryId] || 0;
    if (stock <= 0) {
        showQuickBuyAlert(pastryId);
        return false;
    }
    return true;
}

/**
 * Tiêu hao 1 chiếc bánh ngọt khi phục vụ & tính giá vốn hàng bán (COGS)
 * @param {string} pastryId 
 */
function consumePastry(pastryId) {
    if (gameState.inventory[pastryId] > 0) {
        gameState.inventory[pastryId] -= 1;
        gameState.dayStats.pastriesSold = (gameState.dayStats.pastriesSold || 0) + 1;
        const item = INVENTORY_ITEMS[pastryId];
        if (item && gameState.accountingToday) {
            gameState.accountingToday.cogs = (gameState.accountingToday.cogs || 0) + item.costSingle;
            gameState.accountingToday.pastriesSold = (gameState.accountingToday.pastriesSold || 0) + 1;
        }
    }
    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }
}


