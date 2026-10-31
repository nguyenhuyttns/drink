/* ============================================================================
 * DỊCH VỤ QUẢN LÝ KHO & CHỢ NGUYÊN LIỆU (INVENTORY SERVICE)
 * Xử lý kiểm tra tồn kho, trừ nguyên liệu khi pha chế và mua sắm từ chợ sỉ.
 * ============================================================================ */

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
            const ingMeta = INVENTORY_ITEMS[ingId] || { name: ingId };
            playSoundEffect('error');
            showToast(`⚠️ Hết ${ingMeta.name}! Hãy vào Kho & Chợ Sỉ để nhập thêm hàng.`);
            return false;
        }
    }
    return true;
}

/**
 * Tiêu hao nguyên liệu khi rót trà
 * @param {string} teaId 
 */
function consumeTeaIngredients(teaId) {
    if (!TEA_RECIPES[teaId]) return;

    const required = TEA_RECIPES[teaId];
    required.forEach(ingId => {
        if (gameState.inventory[ingId] > 0) {
            gameState.inventory[ingId] -= 1;
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
        const ingMeta = INVENTORY_ITEMS[ingId] || { name: toppingId };
        playSoundEffect('error');
        showToast(`⚠️ Hết ${ingMeta.name}! Hãy vào Kho & Chợ Sỉ để nhập thêm.`);
        return false;
    }
    return true;
}

/**
 * Tiêu hao nguyên liệu topping
 * @param {string} toppingId 
 */
function consumeToppingIngredient(toppingId) {
    const ingId = TOPPING_RECIPES[toppingId];
    if (!ingId) return;

    if (gameState.inventory[ingId] > 0) {
        gameState.inventory[ingId] -= 1;
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
        playSoundEffect('error');
        showToast(`⚠️ Hết Ly & Màng ép! Hãy vào Chợ Sỉ để nhập thêm bao bì.`);
        return false;
    }
    return true;
}

/**
 * Tiêu hao 1 bộ ly & nắp khi hoàn tất dập
 */
function consumeCupPackaging() {
    if (gameState.inventory.cup_pack > 0) {
        gameState.inventory.cup_pack -= 1;
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

    playSoundEffect('cash');
    updateTopStatsUI();

    if (typeof renderInventoryModal === 'function') {
        renderInventoryModal();
    }
    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }

    const typeStr = isPack ? `thùng sỉ (+${qty} ${item.unit})` : `1 ${item.unit}`;
    showToast(`📦 Đã nhập thành công ${typeStr} "${item.name}"!`);
}
