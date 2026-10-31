/* ============================================================================
 * QUẢN LÝ ĐƠN HÀNG & KHÁCH HÀNG (ORDER & CUSTOMER SERVICE)
 * Tạo đơn ngẫu nhiên, điều hướng khách hàng và kiểm tra độ chính xác của ly nước.
 * ============================================================================ */

function generateRandomOrder() {
    const teaKeys = Object.keys(TEA_MENU);
    const randomTeaKey = teaKeys[Math.floor(Math.random() * teaKeys.length)];
    const teaObj = TEA_MENU[randomTeaKey];

    // Chọn ngẫu nhiên từ 0 đến 3 loại topping
    const topKeys = Object.keys(TOPPING_MENU);
    const shuffledTops = topKeys.sort(() => 0.5 - Math.random());
    const numToppings = Math.floor(Math.random() * 4); // 0, 1, 2, hoặc 3 topping
    const chosenToppings = shuffledTops.slice(0, numToppings);

    let totalPrice = teaObj.price;
    chosenToppings.forEach(tKey => {
        totalPrice += TOPPING_MENU[tKey].price;
    });

    const profile = CUSTOMER_PROFILES[Math.floor(Math.random() * CUSTOMER_PROFILES.length)];
    const dineIn = Math.random() < 0.70; // 70% chọn uống tại quán

    return {
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

    // Bắt đầu đếm ngược thanh kiên nhẫn 16 giây
    if (typeof startPatienceTimer === 'function') {
        startPatienceTimer(16);
    }

    const order = gameState.currentOrder;
    if (!order) return;

    const teaName = TEA_MENU[order.teaId].name;
    let topText = 'không thêm topping';
    if (order.toppings.length > 0) {
        topText = 'thêm ' + order.toppings.map(id => TOPPING_MENU[id].name).join(', ');
    }
    const dineNotice = order.dineIn ? '(Mình ngồi bàn uống nha 🪑)' : '(Mang về giúp mình nha 🥡)';

    showSpeechBubble(
        `🎙️ ${order.customer.name}`,
        `Cho mình 1 ${teaName}, ${topText} nhé! ${dineNotice}`,
        false
    );
    showToast(`🛎️ ${order.customer.name} vừa gọi món! Xem ô khoanh viền nổi bật ở bảng bên phải để pha nhanh nhé.`);
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
        showSpeechBubble('😣 Làm sai món rồi!', `${reasonText}. Bạn pha lại giúp mình nha!`, true);
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
        updateTopStatsUI();

        gameState.phase = 'AWAITING_PAYMENT';
        if (rating.stars === 3) {
            playSoundEffect('bell');
            showSpeechBubble('😍 Xuất sắc!', `Pha siêu tốc chỉ ${rating.timeSpent.toFixed(1)}s! Mình thưởng nóng thêm ${formatVND(rating.speedBonus)} nhé!`, false);
            showToast(`⭐⭐⭐ Đỉnh cao! Pha siêu tốc đạt 3 Sao! Thưởng tốc độ +${formatVND(rating.speedBonus)}!`);
        } else if (rating.stars === 2) {
            showSpeechBubble('😍 Hài lòng!', `Trà sữa ngon đúng điệu! Mình gửi thêm ${formatVND(rating.speedBonus)} tiền thưởng nhé!`, false);
            showToast(`⭐⭐ Hài lòng! Đạt 2 Sao! Thưởng tốc độ +${formatVND(rating.speedBonus)}!`);
        } else {
            showSpeechBubble('🙂 Đã có nước!', 'Đợi hơi lâu một chút nhưng vị vẫn rất thơm ngon!', false);
            showToast(`⭐ Hoàn thành! Khách chấm 1 Sao vì phải đợi hơi lâu.`);
        }
        openInvoiceModal();
    }
}
