/* ============================================================================
 * DỊCH VỤ QUẢN LÝ MENU & GIÁ BÁN (MENU SERVICE)
 * Xử lý bật/tắt món mở bán, tùy biến giá niêm yết và tính toán tỷ suất lợi nhuận.
 * ============================================================================ */

/**
 * Tính toán giá vốn nguyên liệu cho 1 ly nước
 * @param {string} teaId 
 * @returns {number}
 */
function calculateDrinkCost(teaId) {
    let cost = (INVENTORY_ITEMS.cup_pack ? INVENTORY_ITEMS.cup_pack.costSingle : 1000); // Giá ly nắp

    const required = TEA_RECIPES[teaId] || [];
    required.forEach(ingId => {
        if (INVENTORY_ITEMS[ingId]) {
            cost += INVENTORY_ITEMS[ingId].costSingle;
        }
    });

    return cost;
}

/**
 * Lấy danh sách ID các món đang được bật mở bán
 * @returns {string[]}
 */
function getActiveTeaIds() {
    const active = [];
    if (!gameState.menuConfig) return Object.keys(TEA_MENU);

    Object.keys(TEA_MENU).forEach(teaId => {
        if (gameState.menuConfig[teaId] && gameState.menuConfig[teaId].enabled) {
            active.push(teaId);
        }
    });

    // Nếu người chơi tắt hết món, mặc định mở classic để không làm đơ game
    return active.length > 0 ? active : ['classic'];
}

/**
 * Lấy giá bán hiện tại của món (ưu tiên giá người chơi đã chỉnh)
 * @param {string} teaId 
 * @returns {number}
 */
function getDrinkCurrentPrice(teaId) {
    if (gameState.menuConfig && gameState.menuConfig[teaId] && typeof gameState.menuConfig[teaId].price === 'number') {
        return gameState.menuConfig[teaId].price;
    }
    return TEA_MENU[teaId] ? TEA_MENU[teaId].price : 25000;
}

/**
 * Bật hoặc tắt trạng thái mở bán của món
 * @param {string} teaId 
 */
function toggleMenuItemState(teaId) {
    if (!gameState.menuConfig[teaId]) {
        gameState.menuConfig[teaId] = { enabled: true, price: TEA_MENU[teaId].price };
    }

    // Đảm bảo ít nhất 1 món đang bật
    const activeCount = getActiveTeaIds().length;
    if (gameState.menuConfig[teaId].enabled && activeCount <= 1) {
        playSoundEffect('error');
        showToast('⚠️ Quán phải duy trì ít nhất 1 món mở bán trên thực đơn!');
        return;
    }

    gameState.menuConfig[teaId].enabled = !gameState.menuConfig[teaId].enabled;
    playSoundEffect('click');

    const status = gameState.menuConfig[teaId].enabled ? 'MỞ BÁN' : 'TẠM DỪNG BÁN';
    showToast(`📋 Đã chuyển "${TEA_MENU[teaId].name}" sang trạng thái: ${status}`);

    if (typeof renderMenuSettingsModal === 'function') {
        renderMenuSettingsModal();
    }
}

/**
 * Tăng / giảm giá bán của món
 * @param {string} teaId 
 * @param {number} delta e.g. +1000 or -1000
 */
function adjustMenuItemPrice(teaId, delta) {
    if (!gameState.menuConfig[teaId]) {
        gameState.menuConfig[teaId] = { enabled: true, price: TEA_MENU[teaId].price };
    }

    const newPrice = gameState.menuConfig[teaId].price + delta;
    // Giới hạn giá hợp lý: từ 15.000đ đến 60.000đ
    if (newPrice < 15000) {
        showToast('⚠️ Giá bán tối thiểu là 15.000đ để tránh lỗ vốn!');
        return;
    }
    if (newPrice > 60000) {
        showToast('⚠️ Giá bán tối đa là 60.000đ kẻo khách hàng bỏ chạy!');
        return;
    }

    gameState.menuConfig[teaId].price = newPrice;
    playSoundEffect('click');

    if (typeof renderMenuSettingsModal === 'function') {
        renderMenuSettingsModal();
    }
}
