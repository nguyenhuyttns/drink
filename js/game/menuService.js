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
    return active;
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
 * BẮT BUỘC: Phải sở hữu Quầy Bánh Ngọt (bakery_counter) thì mới được bán bánh!
 * @returns {string[]}
 */
function getActivePastryIds() {
    // Chưa mua Quầy Bánh Ngọt -> Tuyệt đối không bán bánh!
    if (!gameState.upgrades || !gameState.upgrades.bakery_counter) {
        return [];
    }
    const active = [];
    if (typeof PASTRY_MENU === 'undefined') return [];
    const cfg = gameState.menuConfig && gameState.menuConfig.pastries ? gameState.menuConfig.pastries : {};
    Object.keys(PASTRY_MENU).forEach(pastryId => {
        if (cfg[pastryId] && cfg[pastryId].enabled) {
            active.push(pastryId);
        }
    });
    return active;
}

/**
 * Kiểm tra xem một món có đang được bật bán hay không
 * @param {'teas' | 'toppings' | 'pastries'} category 
 * @param {string} itemId 
 * @returns {boolean}
 */
function isItemActive(category, itemId) {
    if (category === 'pastries') {
        if (!gameState.upgrades || !gameState.upgrades.bakery_counter) {
            return false;
        }
        if (gameState.menuConfig && gameState.menuConfig.pastries && gameState.menuConfig.pastries[itemId] !== undefined) {
            return Boolean(gameState.menuConfig.pastries[itemId].enabled);
        }
        return false;
    }
    if (!gameState.menuConfig || !gameState.menuConfig[category]) return true;
    if (gameState.menuConfig[category][itemId] === undefined) return true;
    return Boolean(gameState.menuConfig[category][itemId].enabled);
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
        const defaultPrice = (category === 'teas') ? TEA_MENU[itemId].price : (category === 'pastries' ? PASTRY_MENU[itemId].price : TOPPING_MENU[itemId].price);
        gameState.menuConfig[category][itemId] = { enabled: false, price: defaultPrice };
    }

    // Nếu là bánh mà chưa có quầy bánh -> Khóa
    if (category === 'pastries') {
        if (!gameState.upgrades || !gameState.upgrades.bakery_counter) {
            playSoundEffect('error');
            showToast('🔒 Bạn chưa mở khóa Quầy Bánh Ngọt! Hãy mua quầy bánh tại Cửa Hàng trước.');
            return false;
        }
    }

    const current = isItemActive(category, itemId);
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
    if (typeof renderDailyMenuModal === 'function') {
        renderDailyMenuModal();
    }
    if (typeof updateCraftingUI === 'function') {
        updateCraftingUI();
    }
    return true;
}

/**
 * Chọn tất cả hoặc bỏ chọn tất cả món trong nhóm
 * @param {'teas' | 'toppings' | 'pastries'} category 
 * @param {boolean} enableAll 
 */
function setCategoryItemsState(category, enableAll) {
    if (category === 'pastries' && enableAll && (!gameState.upgrades || !gameState.upgrades.bakery_counter)) {
        playSoundEffect('error');
        showToast('🔒 Bạn chưa mở khóa Quầy Bánh Ngọt! Cần mua quầy bánh tại Cửa Hàng trước.');
        return false;
    }

    if (!gameState.menuConfig[category]) {
        gameState.menuConfig[category] = {};
    }

    const sourceObj = (category === 'teas') 
        ? TEA_MENU 
        : (category === 'toppings' ? TOPPING_MENU : (typeof PASTRY_MENU !== 'undefined' ? PASTRY_MENU : {}));

    Object.keys(sourceObj).forEach(itemId => {
        if (!gameState.menuConfig[category][itemId]) {
            const defPrice = sourceObj[itemId].price || 0;
            gameState.menuConfig[category][itemId] = { enabled: enableAll, price: defPrice };
        } else {
            gameState.menuConfig[category][itemId].enabled = enableAll;
        }
    });

    playSoundEffect('click');
    const actionTxt = enableAll ? 'Đã CHỌN TẤT CẢ' : 'Đã BỎ CHỌN TẤT CẢ';
    showToast(`📋 ${actionTxt} các món trong nhóm!`);

    if (typeof renderMenuSettingsModal === 'function') {
        renderMenuSettingsModal();
    }
    if (typeof renderDailyMenuModal === 'function') {
        renderDailyMenuModal();
    }
    if (typeof updateCraftingUI === 'function') {
        updateCraftingUI();
    }
    return true;
}

// Global window mappings
function toggleActiveItem(category, itemId) {
    return toggleMenuItemState(category, itemId);
}
window.toggleActiveItem = toggleActiveItem;
window.toggleMenuItemState = toggleMenuItemState;
window.setCategoryItemsState = setCategoryItemsState;
window.isItemActive = isItemActive;
window.getActiveTeaIds = getActiveTeaIds;
window.getActiveToppingIds = getActiveToppingIds;
window.getActivePastryIds = getActivePastryIds;


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
