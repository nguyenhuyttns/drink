/* ============================================================================
 * DỊCH VỤ QUẢN LÝ MENU & GIÁ BÁN (MENU SERVICE)
 * Xử lý chọn món bán trong ngày (Trà, Topping, Bánh Ngọt) và tùy chỉnh giá niêm yết.
 * ============================================================================ */

/**
 * Tính toán giá vốn nguyên liệu cho 1 ly nước
 * @param {string} teaId 
 * @returns {number}
 */
function calculateDrinkCost(teaId) {
    let cost = (INVENTORY_ITEMS.cup_pack ? INVENTORY_ITEMS.cup_pack.costSingle : 1000);
    const required = TEA_RECIPES[teaId] || [];
    required.forEach(ingId => {
        if (INVENTORY_ITEMS[ingId]) {
            cost += INVENTORY_ITEMS[ingId].costSingle;
        }
    });
    return cost;
}

/**
 * Tính toán giá vốn của 1 chiếc bánh ngọt
 * @param {string} pastryId 
 * @returns {number}
 */
function calculatePastryCost(pastryId) {
    return INVENTORY_ITEMS[pastryId] ? INVENTORY_ITEMS[pastryId].costSingle : 5000;
}

/**
 * Lấy danh sách ID các loại trà đang được mở bán trong ngày
 * @returns {string[]}
 */
function getActiveTeaIds() {
    const active = [];
    const cfg = gameState.menuConfig && gameState.menuConfig.teas ? gameState.menuConfig.teas : {};
    Object.keys(TEA_MENU).forEach(teaId => {
        if (!cfg[teaId] || cfg[teaId].enabled) {
            active.push(teaId);
        }
    });
    return active.length > 0 ? active : ['classic'];
}

/**
 * Lấy danh sách ID các loại Topping đang được mở bán trong ngày
 * @returns {string[]}
 */
function getActiveToppingIds() {
    const active = [];
    const cfg = gameState.menuConfig && gameState.menuConfig.toppings ? gameState.menuConfig.toppings : {};
    Object.keys(TOPPING_MENU).forEach(topId => {
        if (!cfg[topId] || cfg[topId].enabled) {
            active.push(topId);
        }
    });
    return active;
}

/**
 * Lấy danh sách ID các loại Bánh Ngọt đang được mở bán trong ngày
 * @returns {string[]}
 */
function getActivePastryIds() {
    const active = [];
    if (typeof PASTRY_MENU === 'undefined') return [];
    const cfg = gameState.menuConfig && gameState.menuConfig.pastries ? gameState.menuConfig.pastries : {};
    Object.keys(PASTRY_MENU).forEach(pastryId => {
        if (!cfg[pastryId] || cfg[pastryId].enabled) {
            active.push(pastryId);
        }
    });
    return active;
}

/**
 * Lấy giá bán hiện tại của món trà
 * @param {string} teaId 
 * @returns {number}
 */
function getDrinkCurrentPrice(teaId) {
    const cfg = gameState.menuConfig && gameState.menuConfig.teas ? gameState.menuConfig.teas[teaId] : null;
    if (cfg && typeof cfg.price === 'number') {
        return cfg.price;
    }
    return TEA_MENU[teaId] ? TEA_MENU[teaId].price : 25000;
}

/**
 * Lấy giá bán hiện tại của bánh ngọt
 * @param {string} pastryId 
 * @returns {number}
 */
function getPastryCurrentPrice(pastryId) {
    const cfg = gameState.menuConfig && gameState.menuConfig.pastries ? gameState.menuConfig.pastries[pastryId] : null;
    if (cfg && typeof cfg.price === 'number') {
        return cfg.price;
    }
    return (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[pastryId]) ? PASTRY_MENU[pastryId].price : 15000;
}

/**
 * Bật/tắt trạng thái mở bán món (Trà, Topping, Bánh)
 * @param {'teas' | 'toppings' | 'pastries'} category 
 * @param {string} itemId 
 */
function toggleMenuItemState(category, itemId) {
    if (!gameState.menuConfig[category]) {
        gameState.menuConfig[category] = {};
    }
    if (!gameState.menuConfig[category][itemId]) {
        gameState.menuConfig[category][itemId] = { enabled: true };
    }

    // Đảm bảo còn ít nhất 1 loại trà mở bán
    if (category === 'teas') {
        const activeCount = getActiveTeaIds().length;
        if (gameState.menuConfig.teas[itemId].enabled && activeCount <= 1) {
            playSoundEffect('error');
            showToast('⚠️ Quán phải duy trì ít nhất 1 loại trà mở bán!');
            return;
        }
    }

    const current = gameState.menuConfig[category][itemId].enabled;
    gameState.menuConfig[category][itemId].enabled = !current;
    playSoundEffect('click');

    const name = (category === 'teas') 
        ? TEA_MENU[itemId].name 
        : (category === 'toppings' ? TOPPING_MENU[itemId].name : PASTRY_MENU[itemId].name);
    const status = gameState.menuConfig[category][itemId].enabled ? 'MỞ BÁN' : 'TẠM DỪNG BÁN';
    showToast(`📋 ${name}: ${status}`);

    if (typeof renderMenuSettingsModal === 'function') {
        renderMenuSettingsModal();
    }
}

/**
 * Tăng / giảm giá bán của món
 * @param {'teas' | 'pastries'} category 
 * @param {string} itemId 
 * @param {number} delta 
 */
function adjustMenuItemPrice(category, itemId, delta) {
    if (!gameState.menuConfig[category]) gameState.menuConfig[category] = {};
    if (!gameState.menuConfig[category][itemId]) {
        const defaultPrice = (category === 'teas') ? TEA_MENU[itemId].price : PASTRY_MENU[itemId].price;
        gameState.menuConfig[category][itemId] = { enabled: true, price: defaultPrice };
    }

    const newPrice = gameState.menuConfig[category][itemId].price + delta;
    if (newPrice < 10000 || newPrice > 60000) {
        showToast('⚠️ Giá bán phải nằm trong khoảng từ 10.000đ đến 60.000đ!');
        return;
    }

    gameState.menuConfig[category][itemId].price = newPrice;
    playSoundEffect('click');

    if (typeof renderMenuSettingsModal === 'function') {
        renderMenuSettingsModal();
    }
}
