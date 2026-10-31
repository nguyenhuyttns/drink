/* ============================================================================
 * QUẢN LÝ ĐƠN HÀNG & KHÁCH HÀNG (ORDER & CUSTOMER SERVICE)
 * Tạo đơn ngẫu nhiên, điều hướng khách hàng và kiểm tra độ chính xác của ly nước.
 * ============================================================================ */

function generateRandomOrder() {
    const activeTeaKeys = (typeof getActiveTeaIds === 'function') ? getActiveTeaIds() : Object.keys(TEA_MENU);
    const randomTeaKey = activeTeaKeys[Math.floor(Math.random() * activeTeaKeys.length)];
    const teaObj = TEA_MENU[randomTeaKey];

    // Chọn ngẫu nhiên từ 0 đến 3 loại topping
    const topKeys = Object.keys(TOPPING_MENU);
    const shuffledTops = topKeys.sort(() => 0.5 - Math.random());
    const numToppings = Math.floor(Math.random() * 4); // 0, 1, 2, hoặc 3 topping
    const chosenToppings = shuffledTops.slice(0, numToppings);

    // Lấy giá bán tùy chỉnh của quán
    const currentTeaPrice = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(randomTeaKey) : teaObj.price;
    let totalPrice = currentTeaPrice;
    chosenToppings.forEach(tKey => {
        totalPrice += TOPPING_MENU[tKey].price;
    });

    const profile = CUSTOMER_PROFILES[Math.floor(Math.random() * CUSTOMER_PROFILES.length)];
    
    // Kiểm tra quán còn bàn sạch không bị bẩn không
    const hasCleanSeat = typeof SHOP_SEATS !== 'undefined' && SHOP_SEATS.some(s => !s.occupied && !s.isDirty);
    const dineIn = hasCleanSeat && Math.random() < 0.70;

    return {
        id: Date.now() + '_' + Math.random(),
        customer: profile,
        teaId: randomTeaKey,
        toppings: chosenToppings,
        totalPrice: totalPrice,
        dineIn: dineIn
    };
}

function spawnNextCustomer() {
    if (gameState.phase !== 'WAITING_SPAWN') return;

    const order = generateRandomOrder();
    gameState.currentOrder = order;
    gameState.phase = 'WALKING_IN';

    // Cập nhật ngoại hình nhân vật 3D
    if (customerGroup) {
        if (typeof updateCustomerProfile3D === 'function') {
            updateCustomerProfile3D(order.customer);
        }
        if (customerGroup.userData && customerGroup.userData.miniCupGroup) {
            customerGroup.userData.miniCupGroup.visible = false;
        }

        // Đặt ở vị trí trước cửa
        customerGroup.position.set(-5.8, 0, 2.2);
        customerGroup.rotation.y = Math.PI / 2;
        customerGroup.visible = true;
    }

    customerAnim.targetPos.set(-0.25, 0, 1.35);
    customerAnim.active = true;

    // Dọn ly trên quầy cho khách mới
    clearCurrentCup(false);
    updateOrderTicketUI();
    updateCraftingUI();
    hideSpeechBubble();
}

function onCustomerArrivedAtCounter() {
    gameState.phase = 'ORDERING';
    if (customerGroup) {
        customerGroup.rotation.y = Math.PI; // Quay mặt về phía quầy & barista
    }
    playSoundEffect('bell');

    updateOrderTicketUI();
    updateCraftingUI(); // Gợi ý viền vàng món khách gọi

    const order = gameState.currentOrder;
    if (!order) return;

    // Tính toán thời gian kiên nhẫn theo chiến lược định giá
    const currentPrice = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(order.teaId) : TEA_MENU[order.teaId].price;
    const baseStandardPrice = TEA_MENU[order.teaId].price;
    const priceDiff = currentPrice - baseStandardPrice;
    
    let patienceTime = 16;
    if (priceDiff > 0) {
        // Giá cao -> Khách khó tính hơn, kiên nhẫn giảm
        patienceTime = Math.max(10, 16 - (priceDiff / 1000) * 0.4);
    } else if (priceDiff < 0) {
        // Giá rẻ -> Khách dễ tính hơn, kiên nhẫn tăng
        patienceTime = Math.min(24, 16 + Math.abs(priceDiff / 1000) * 0.5);
    }

    if (typeof startPatienceTimer === 'function') {
        startPatienceTimer(patienceTime);
    }

    // Hiển thị thanh đánh sao nổi trên đầu khách (KHÔNG CẦN HIỆN DANH SÁCH MÓN VÌ ĐÃ CÓ BẢNG ORDER GÓC TRÁI)
    showToast(`🛎️ ${order.customer.name} vừa gọi món! Xem chi tiết ở bảng order góc trái nhé.`);
}

function validateDrinkAgainstOrder() {
    const order = gameState.currentOrder;
    if (!order) return;

    const madeTea = gameState.cup.teaId;
    const madeTops = Array.from(gameState.cup.toppings);

    let errors = [];

    if (madeTea !== order.teaId) {
        errors.push(`Sai loại trà (Khách gọi ${TEA_MENU[order.teaId].name})`);
    }

    const missingTops = order.toppings.filter(t => !gameState.cup.toppings.has(t));
    const extraTops = madeTops.filter(t => !order.toppings.includes(t));

    if (missingTops.length > 0) {
        errors.push('Thiếu ' + missingTops.map(t => TOPPING_MENU[t].name).join(', '));
    }
    if (extraTops.length > 0) {
        errors.push('Dư ' + extraTops.map(t => TOPPING_MENU[t].name).join(', '));
    }

    if (errors.length > 0) {
        // PHA SAI MÓN -> Trừ 3.5s kiên nhẫn, khách lắc đầu thất vọng
        if (typeof patienceState !== 'undefined' && patienceState.active) {
            patienceState.timeLeft = Math.max(1, patienceState.timeLeft - 3.5);
            if (typeof updatePatienceUI === 'function') updatePatienceUI();
        }

        playSoundEffect('error');
        customerAnim.shakeTimer = 0.85;
        gameState.phase = 'ORDERING';

        const reasonText = errors.join(' • ');
        const errBox = document.getElementById('bubble-error');
        if (errBox) {
            errBox.textContent = `❌ ${reasonText}`;
            errBox.classList.remove('hidden');
            setTimeout(() => {
                if (errBox) errBox.classList.add('hidden');
            }, 2500);
        }
        showToast(`❌ Khách báo sai món: ${reasonText}. Đã dọn ly để bạn làm lại!`);

        setTimeout(() => {
            clearCurrentCup(false);
        }, 900);
    } else {
        // PHA ĐÚNG MÓN -> Dừng đồng hồ & tính thưởng tốc độ
        const rating = typeof stopPatienceTimer === 'function' ? stopPatienceTimer() : { stars: 3, speedBonus: 0, timeSpent: 5 };
        order.stars = rating.stars;
        order.speedBonus = rating.speedBonus;
        order.totalPrice += rating.speedBonus;

        gameState.totalStars = (gameState.totalStars || 0) + rating.stars;
        gameState.ratingCount = (gameState.ratingCount || 0) + 1;

        // TIỀN TỰ ĐỘNG TĂNG TRỰC TIẾP (KHÔNG CẦN BẬT MENU THU TIỀN)
        gameState.money += order.totalPrice;
        gameState.revenue += order.totalPrice;
        gameState.ordersSold += 1;
        gameState.customersServed += 1;
        playSoundEffect('cash');
        updateTopStatsUI();

        // Ẩn thanh đánh sao sau khi phục vụ xong
        hideSpeechBubble();

        const starsStr = '⭐'.repeat(order.stars);
        const bonusStr = order.speedBonus > 0 ? ` (Kèm thưởng tốc độ +${formatVND(order.speedBonus)})` : '';
        showToast(`💸 ${order.customer.name} hài lòng trả +${formatVND(order.totalPrice)}! Đánh giá: ${starsStr}${bonusStr}`);

        // Dọn ly trên quầy cho lượt sau
        clearCurrentCup(false);

        // Khách hàng cầm ly ra bàn ngồi (nếu dine-in) hoặc mang về ra cửa
        const canDineIn = order.dineIn && typeof getAvailableSeat === 'function' && getAvailableSeat();

        if (canDineIn && typeof startCustomerDineIn === 'function') {
            // Uống tại quán -> Chuyển đến bàn ngồi
            if (customerGroup) customerGroup.visible = false;
            startCustomerDineIn(order, scene);

            // Quầy ngay lập tức sẵn sàng đón khách tiếp theo sau 0.8s
            gameState.phase = 'WAITING_SPAWN';
            gameState.currentOrder = null;
            updateOrderTicketUI();

            setTimeout(() => {
                spawnNextCustomer();
            }, 800);
        } else {
            // Khách mang về bước ra cửa
            gameState.phase = 'WALKING_OUT';
            customerAnim.targetPos.set(-6.2, 0, 2.2);
            customerAnim.active = true;
            updateOrderTicketUI();
        }
    }
}
