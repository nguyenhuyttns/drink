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

    // Kiểm tra tồn kho nguyên liệu trước khi rót
    if (typeof checkCanPourTea === 'function' && !checkCanPourTea(teaId)) {
        return;
    }

    gameState.cup.teaId = teaId;
    setCup3DTea(tea);

    // Tiêu hao nguyên liệu
    if (typeof consumeTeaIngredients === 'function') {
        consumeTeaIngredients(teaId);
    }

    playSoundEffect('pour');
    updateCraftingUI();
    checkAutoSealerTrigger();
}

const selectTea = selectBaseTea;

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
        // Kiểm tra tồn kho topping trước khi thêm
        if (typeof checkCanAddTopping === 'function' && !checkCanAddTopping(topId)) {
            return;
        }

        gameState.cup.toppings.add(topId);
        if (typeof consumeToppingIngredient === 'function') {
            consumeToppingIngredient(topId);
        }
        playSoundEffect('topping');
    }

    syncCup3DToppings(gameState.cup.toppings);
    updateCraftingUI();
    checkAutoSealerTrigger();
}

function clearCurrentCup(withSound = true) {
    gameState.cup.teaId = null;
    gameState.cup.toppings.clear();
    gameState.cup.pastryId = null;
    gameState.cup.isSealed = false;

    resetCup3DVisuals();

    if (withSound) {
        playSoundEffect('click');
        showToast('🗑️ Đã đổ bỏ ly cũ. Bạn có thể pha lại ly mới!');
    }
    updateCraftingUI();
}

function selectPastry(pastryId) {
    if (gameState.phase !== 'ORDERING') {
        showToast('⏳ Hãy đợi khách hàng bước vào quầy gọi món nhé!');
        return;
    }
    if (gameState.cup.isSealed) return;

    if (gameState.cup.pastryId === pastryId) {
        gameState.cup.pastryId = null;
        playSoundEffect('click');
        showToast('Đã bỏ bánh khỏi khay phục vụ!');
    } else {
        if (typeof checkCanServePastry === 'function' && !checkCanServePastry(pastryId)) {
            const pName = (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[pastryId]) ? PASTRY_MENU[pastryId].name : 'Bánh ngọt';
            showToast(`⚠️ Kho đã hết ${pName}! Hãy vào Cửa hàng nhập thêm.`);
            playSoundEffect('error');
            return;
        }

        gameState.cup.pastryId = pastryId;
        playSoundEffect('topping');
        const pName = (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[pastryId]) ? PASTRY_MENU[pastryId].name : 'Bánh';
        showToast(`🥐 Đã lấy ${pName} lên đĩa chuẩn bị cho khách!`);
    }

    updateCraftingUI();
}

function finishAndServeDrink() {
    if (gameState.phase !== 'ORDERING' || !gameState.currentOrder) {
        showToast('⏳ Hiện chưa có khách gọi món tại quầy!');
        return;
    }

    const order = gameState.currentOrder;

    // Đơn chỉ mua bánh ngọt tại Quầy Bánh
    if (!order.teaId && order.pastryId) {
        if (!gameState.cup.pastryId) {
            playSoundEffect('error');
            showToast('⚠️ Bạn chưa chuẩn bị bánh ngọt lên đĩa cho khách!');
            return;
        }
        playSoundEffect('bell');
        validateDrinkAgainstOrder();
        return;
    }

    if (!gameState.cup.teaId) {
        playSoundEffect('error');
        showToast('⚠️ Bạn chưa chọn cốt trà sữa cho ly nước!');
        return;
    }

    // Kiểm tra ly và màng ép trong kho
    if (typeof checkCanSealCup === 'function' && !checkCanSealCup()) {
        return;
    }
    if (typeof consumeCupPackaging === 'function') {
        consumeCupPackaging();
    }

    // Tốc độ dập nắp cốc dựa vào cấp máy dập
    const sealerLvl = (gameState.upgradeLevels && gameState.upgradeLevels.auto_sealer) || (gameState.upgrades.auto_sealer ? 1 : 0);
    const sealDelay = sealerLvl >= 2 ? 150 : (sealerLvl >= 1 ? 250 : 450);

    // Hoạt ảnh dập nắp ly
    gameState.phase = 'SEALING';
    gameState.cup.isSealed = true;

    if (cup3D.lidGroup) {
        cup3D.lidGroup.visible = true;
        cup3D.lidGroup.position.y = 1.45;
    }
    playSoundEffect('seal');
    updateCraftingUI();

    // Kiểm tra đơn sau khi nắp hạ xuống
    setTimeout(() => {
        validateDrinkAgainstOrder();
    }, sealDelay);
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

function triggerStartDayProcess() {
    if (typeof openStartDayModal === 'function') {
        openStartDayModal();
    } else if (typeof openDailyMenuModal === 'function') {
        openDailyMenuModal();
    } else {
        commitStartNewDay();
    }
}

function commitStartNewDay() {
    playSoundEffect('bell');
    gameState.day += 1;

    // Trừ lương nhân viên ngày hôm nay nếu có
    if (typeof processDailyStaffWages === 'function') {
        processDailyStaffWages();
    }

    // Reset thống kê ngày
    if (gameState.dayStats) {
        gameState.dayStats.cupsSold = 0;
        gameState.dayStats.revenueToday = 0;
    }

    updateTopStatsUI();
    showToast(`☀️ Bắt đầu Ngày làm việc thứ ${gameState.day}! Quán phục vụ theo Menu bạn đã chọn!`);

    if (gameState.phase === 'WAITING_SPAWN') {
        spawnNextCustomer();
    }
}

const startNewDay = triggerStartDayProcess;

function confirmResetGame() {
    playSoundEffect('bell');
    closeResetModal();
    closeInvoiceModal();

    if (typeof clearAllSeatedCustomers === 'function') {
        clearAllSeatedCustomers(scene);
    }
    if (typeof resetAllUpgrades3D === 'function') {
        resetAllUpgrades3D(scene);
    }
    if (typeof removeStaff3D === 'function') {
        removeStaff3D('waiter', scene);
        removeStaff3D('barista_assistant', scene);
        removeStaff3D('pastry_chef', scene);
        removeStaff3D('greeter_dog', scene);
    }

    gameState.upgrades = {
        neon_sign: false,
        music_box: false,
        cozy_carpet: false,
        auto_sealer: false,
        bakery_counter: false,
        extra_tables: false,
        expand_shop: false
    };

    gameState.staff = {
        waiter: false,
        barista_assistant: false,
        pastry_chef: false,
        greeter_dog: false
    };

    gameState.inventory = {
        tea_leaf: 15,
        matcha_powder: 12,
        choco_powder: 12,
        peach_syrup: 12,
        fresh_milk: 25,
        boba: 20,
        jelly: 20,
        pudding: 15,
        cheese: 12,
        cup_pack: 35
    };

    gameState.menuConfig = {
        classic: { enabled: true, price: 25000 },
        matcha: { enabled: true, price: 30000 },
        choco: { enabled: true, price: 30000 },
        peach: { enabled: true, price: 25000 }
    };

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
    if (typeof renderShopItems === 'function') {
        renderShopItems();
    }

    showToast('🔄 Đã đặt lại game về trạng thái ban đầu với 100.000đ vốn!');
    setTimeout(() => {
        spawnNextCustomer();
    }, 600);
}

function checkAutoSealerTrigger() {
    if (!gameState.upgrades || !gameState.upgrades.auto_sealer) return;
    if (gameState.phase !== 'ORDERING' || !gameState.currentOrder || gameState.cup.isSealed) return;

    const order = gameState.currentOrder;
    if (gameState.cup.teaId === order.teaId && 
        order.toppings.length === gameState.cup.toppings.size &&
        order.toppings.every(t => gameState.cup.toppings.has(t))) {
        setTimeout(() => {
            if (gameState.phase === 'ORDERING' && !gameState.cup.isSealed) {
                showToast('⚡ Máy dập nắp mạ vàng tự động dập nắp ly trà sữa!');
                finishAndServeDrink();
            }
        }, 220);
    }
}
