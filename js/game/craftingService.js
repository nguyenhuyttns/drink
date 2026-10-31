/* ============================================================================
 * XỬ LÝ PHA CHẾ & KINH DOANH (CRAFTING & SHOP SERVICE)
 * Tương tác chọn trà, thêm topping, dập nắp, thu tiền và chu kỳ ngày.
 * ============================================================================ */

function selectBaseTea(teaId) {
    if (gameState.phase !== 'ORDERING') {
        showToast('⏳ Hãy đợi khách hàng bước vào quầy gọi món nhé!');
        return;
    }
    if (gameState.cup.isSealed) return;

    const tea = TEA_MENU[teaId];
    if (!tea) return;

    gameState.cup.teaId = teaId;
    setCup3DTea(tea);

    playSoundEffect('pour');
    updateCraftingUI();
}

function toggleTopping(topId) {
    if (gameState.phase !== 'ORDERING') {
        showToast('⏳ Hãy đợi khách hàng bước vào quầy gọi món nhé!');
        return;
    }
    if (gameState.cup.isSealed) return;

    if (gameState.cup.toppings.has(topId)) {
        gameState.cup.toppings.delete(topId);
        playSoundEffect('click');
    } else {
        gameState.cup.toppings.add(topId);
        playSoundEffect('topping');
    }

    syncCup3DToppings(gameState.cup.toppings);
    updateCraftingUI();
}

function clearCurrentCup(withSound = true) {
    gameState.cup.teaId = null;
    gameState.cup.toppings.clear();
    gameState.cup.isSealed = false;

    resetCup3DVisuals();

    if (withSound) {
        playSoundEffect('click');
        showToast('🗑️ Đã đổ bỏ ly cũ. Bạn có thể pha lại ly mới!');
    }
    updateCraftingUI();
}

function finishAndServeDrink() {
    if (gameState.phase !== 'ORDERING' || !gameState.currentOrder) {
        showToast('⏳ Hiện chưa có khách gọi món tại quầy!');
        return;
    }
    if (!gameState.cup.teaId) {
        playSoundEffect('error');
        showToast('⚠️ Bạn chưa chọn cốt trà sữa cho ly nước!');
        return;
    }

    // Hoạt ảnh dập nắp ly
    gameState.phase = 'SEALING';
    gameState.cup.isSealed = true;

    if (cup3D.lidGroup) {
        cup3D.lidGroup.visible = true;
        cup3D.lidGroup.position.y = 1.45;
    }
    playSoundEffect('seal');
    updateCraftingUI();

    // Kiểm tra đơn sau khi nắp hạ xuống (450ms)
    setTimeout(() => {
        validateDrinkAgainstOrder();
    }, 450);
}

function collectPayment() {
    if (gameState.phase !== 'AWAITING_PAYMENT' || !gameState.currentOrder) return;

    const order = gameState.currentOrder;

    // Cập nhật tài chính quán
    gameState.money += order.totalPrice;
    gameState.revenue += order.totalPrice;
    gameState.ordersSold += 1;
    gameState.customersServed += 1;

    playSoundEffect('cash');
    closeInvoiceModal();
    updateTopStatsUI();

    showToast(`💸 Đã thu ${formatVND(order.totalPrice)} từ ${order.customer.name}! Cảm ơn quý khách!`);
    clearCurrentCup(false);

    // Kiểm tra xem khách có chọn ngồi bàn và tiệm còn ghế trống không
    const canDineIn = order.dineIn && typeof getAvailableSeat === 'function' && getAvailableSeat();

    if (canDineIn && typeof startCustomerDineIn === 'function') {
        // KHÁCH UỐNG TẠI QUÁN: BƯỚC ĐẾN BÀN NGỒI
        showSpeechBubble('💖 Cảm ơn tiệm!', 'Mình ra bàn ngồi thưởng thức nhé! 🪑', false);

        if (customerGroup) customerGroup.visible = false;
        startCustomerDineIn(order, scene);

        // Quầy ngay lập tức sẵn sàng đón khách tiếp theo sau 1 giây!
        gameState.phase = 'WAITING_SPAWN';
        gameState.currentOrder = null;
        updateOrderTicketUI();
        updateCraftingUI();

        setTimeout(() => {
            spawnNextCustomer();
        }, 1100);
    } else {
        // KHÁCH MANG VỀ
        showSpeechBubble('💖 Cảm ơn tiệm!', 'Trà sữa thơm lắm, mình mang về nhé! 🥡', false);

        if (customerHandCup) {
            const teaColor = TEA_MENU[order.teaId].color;
            customerHandCup.material.color.setHex(teaColor);
        }
        if (customerGroup && customerGroup.userData.miniCupGroup) {
            customerGroup.userData.miniCupGroup.visible = true;
        }

        // Khách hàng cầm ly bước ra cửa
        gameState.phase = 'WALKING_OUT';
        customerAnim.targetPos.set(-6.2, 0, 2.2);
        customerAnim.active = true;
        updateOrderTicketUI();
    }
}

function startNewDay() {
    playSoundEffect('bell');
    gameState.day += 1;
    updateTopStatsUI();
    showToast(`☀️ Bắt đầu Ngày làm việc thứ ${gameState.day}! Chúc tiệm buôn may bán đắt!`);

    if (gameState.phase === 'WAITING_SPAWN') {
        spawnNextCustomer();
    }
}

function confirmResetGame() {
    playSoundEffect('bell');
    closeResetModal();
    closeInvoiceModal();

    if (typeof clearAllSeatedCustomers === 'function') {
        clearAllSeatedCustomers(scene);
    }

    gameState.money = 100000;
    gameState.revenue = 0;
    gameState.ordersSold = 0;
    gameState.customersServed = 0;
    gameState.day = 1;
    gameState.phase = 'WAITING_SPAWN';
    gameState.currentOrder = null;

    if (customerGroup) {
        customerGroup.visible = false;
    }
    customerAnim.active = false;
    hideSpeechBubble();
    clearCurrentCup(false);
    updateTopStatsUI();
    updateOrderTicketUI();

    showToast('🔄 Đã đặt lại game về trạng thái ban đầu với 100.000đ vốn!');
    setTimeout(() => {
        spawnNextCustomer();
    }, 600);
}
