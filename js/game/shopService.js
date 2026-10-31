/* ============================================================================
 * DỊCH VỤ CỬA HÀNG & MUA SẮM NỘI THẤT (SHOP & UPGRADE SERVICE)
 * Xử lý giao dịch mua sắm, kiểm tra tiền và kích hoạt hiệu ứng 3D.
 * ============================================================================ */

function buyUpgrade(upgradeId) {
    const item = SHOP_UPGRADES.find(u => u.id === upgradeId);
    if (!item) return;

    // Kiểm tra xem đã sở hữu chưa
    if (gameState.upgrades[upgradeId]) {
        showToast(`ℹ️ Bạn đã sở hữu "${item.name}" rồi!`);
        return;
    }

    // Kiểm tra số dư tiền
    if (gameState.money < item.price) {
        playSoundEffect('error');
        showToast(`⚠️ Không đủ tiền! Bạn cần thêm ${formatVND(item.price - gameState.money)} để mua.`);
        return;
    }

    // Trừ tiền & Đánh dấu sở hữu
    gameState.money -= item.price;
    gameState.upgrades[upgradeId] = true;

    playSoundEffect('cash');
    updateTopStatsUI();

    // Kích hoạt mô hình 3D trong quán
    if (typeof applyUpgrade3D === 'function' && typeof scene !== 'undefined') {
        applyUpgrade3D(upgradeId, scene);
    }

    // Thông báo chúc mừng
    showToast(`🎉 Chúc mừng! Bạn đã trang bị "${item.name}" cho tiệm!`);

    // Render lại danh sách cửa hàng
    if (typeof renderShopItems === 'function') {
        renderShopItems();
    }
}
