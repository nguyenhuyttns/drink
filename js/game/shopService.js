/* ============================================================================
 * DỊCH VỤ CỬA HÀNG, NÂNG CẤP ĐA TẦNG & TRANG TRÍ (SHOP & UPGRADE SERVICE)
 * Xử lý giao dịch mua sắm, nâng cấp từng bậc, đổi nền gạch và bật/tắt nội thất.
 * ============================================================================ */

/**
 * Mua hoặc nâng cấp lên cấp tiếp theo của vật phẩm
 * @param {string} upgradeId 
 */
function buyUpgrade(upgradeId) {
    const item = SHOP_UPGRADES.find(u => u.id === upgradeId);
    if (!item) return;

    const currentLvl = (gameState.upgradeLevels && gameState.upgradeLevels[upgradeId]) || (gameState.upgrades[upgradeId] ? 1 : 0);
    const maxLvl = item.maxLevel || 1;

    if (currentLvl >= maxLvl) {
        showToast(`ℹ️ Bạn đã đạt cấp tối đa (${maxLvl}/${maxLvl}) của "${item.name}"!`);
        return;
    }

    // Xác định giá và thông tin cấp tiếp theo
    let cost = item.price;
    let nextLvlName = item.name;
    if (item.levels && item.levels[currentLvl]) {
        cost = item.levels[currentLvl].price;
        nextLvlName = item.levels[currentLvl].name;
    }

    // Kiểm tra số dư tiền
    if (gameState.money < cost) {
        playSoundEffect('error');
        showToast(`⚠️ Không đủ tiền! Bạn cần thêm ${formatVND(cost - gameState.money)} để mua.`);
        return;
    }

    // Trừ tiền & Cập nhật cấp bậc
    gameState.money -= cost;
    if (!gameState.upgradeLevels) gameState.upgradeLevels = {};
    const newLvl = currentLvl + 1;
    gameState.upgradeLevels[upgradeId] = newLvl;
    gameState.upgrades[upgradeId] = true;

    // Ghi nhận chi phí vào kế toán trong ngày
    if (gameState.accountingToday) {
        gameState.accountingToday.purchaseExpenses = (gameState.accountingToday.purchaseExpenses || 0) + cost;
    }

    playSoundEffect('cash');
    updateTopStatsUI();

    // Kích hoạt mô hình 3D trong quán theo cấp độ mới
    if (typeof applyUpgrade3D === 'function' && typeof scene !== 'undefined') {
        applyUpgrade3D(upgradeId, scene, newLvl);
    }

    if (upgradeId === 'bakery_counter') {
        gameState.staff.pastry_chef = true;
        if (typeof buildPastryChef3D === 'function' && typeof scene !== 'undefined') {
            buildPastryChef3D(scene);
        }
        if (gameState.menuConfig && gameState.menuConfig.pastries) {
            Object.keys(gameState.menuConfig.pastries).forEach(p => {
                gameState.menuConfig.pastries[p].enabled = true;
            });
        }
        showToast(`🎉 Nâng cấp thành công "${nextLvlName}"! Đã mở khóa quầy & bánh ngọt.`);
        if (typeof renderDailyMenuModal === 'function') {
            renderDailyMenuModal();
        }
    } else {
        showToast(`🎉 Chúc mừng! Đã nâng cấp lên "${nextLvlName}" (Cấp ${newLvl}/${maxLvl})!`);
    }

    // Render lại danh sách cửa hàng & tùy biến
    if (typeof renderShopItems === 'function') {
        renderShopItems();
    }
    if (typeof renderDecorCustomizerModal === 'function') {
        renderDecorCustomizerModal();
    }
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
}

/**
 * Mua và mở khóa nền gạch mới
 * @param {string} floorId 
 */
function buyFlooring(floorId) {
    const meta = (typeof FLOORING_CATALOG !== 'undefined') ? FLOORING_CATALOG.find(f => f.id === floorId) : null;
    if (!meta) return;

    if (!gameState.flooring) {
        gameState.flooring = { current: 'checker_pink', unlocked: ['checker_pink'] };
    }

    if (gameState.flooring.unlocked.includes(floorId)) {
        // Đã mua rồi -> chọn áp dụng
        selectFlooring(floorId);
        return;
    }

    if (gameState.money < meta.price) {
        playSoundEffect('error');
        showToast(`⚠️ Không đủ tiền! Cần thêm ${formatVND(meta.price - gameState.money)} để mua nền.`);
        return;
    }

    gameState.money -= meta.price;
    gameState.flooring.unlocked.push(floorId);
    gameState.flooring.current = floorId;

    if (gameState.accountingToday) {
        gameState.accountingToday.purchaseExpenses = (gameState.accountingToday.purchaseExpenses || 0) + meta.price;
    }

    playSoundEffect('cash');
    updateTopStatsUI();

    if (typeof changeFlooring3D === 'function') {
        changeFlooring3D(floorId);
    }

    showToast(`✨ Đã mở khóa & thay đổi sang nền gạch "${meta.name}"!`);

    if (typeof renderDecorCustomizerModal === 'function') {
        renderDecorCustomizerModal();
    }
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
}

/**
 * Chọn nền gạch đã sở hữu
 * @param {string} floorId 
 */
function selectFlooring(floorId) {
    if (!gameState.flooring || !gameState.flooring.unlocked.includes(floorId)) return;

    gameState.flooring.current = floorId;
    if (typeof changeFlooring3D === 'function') {
        changeFlooring3D(floorId);
    }

    const meta = FLOORING_CATALOG.find(f => f.id === floorId);
    playSoundEffect('click');
    showToast(`🎨 Đã đổi không gian sang nền "${meta ? meta.name : floorId}"!`);

    if (typeof renderDecorCustomizerModal === 'function') {
        renderDecorCustomizerModal();
    }
}

/**
 * Bật / tắt ẩn hiện đồ nội thất đã mua
 * @param {string} decorId 
 */
function toggleDecorVisibility(decorId) {
    if (!gameState.decorVisibility) gameState.decorVisibility = {};
    const newState = !gameState.decorVisibility[decorId];
    gameState.decorVisibility[decorId] = newState;

    if (typeof setDecorVisibility3D === 'function') {
        setDecorVisibility3D(decorId, newState);
    }

    playSoundEffect('click');
    showToast(`${newState ? '👁️ Đã hiển thị' : '🚫 Đã ẩn'} vật phẩm trong không gian quán!`);

    if (typeof renderDecorCustomizerModal === 'function') {
        renderDecorCustomizerModal();
    }
}

