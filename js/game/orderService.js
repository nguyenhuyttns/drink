/* ============================================================================
 * QUẢN LÝ ĐƠN HÀNG & KHÁCH HÀNG (ORDER & CUSTOMER SERVICE)
 * Tạo đơn ngẫu nhiên theo Menu đã chọn, xếp hàng, bánh kẹo và kiểm tra món.
 * ============================================================================ */

function generateRandomOrder(forcedCustomerProfile = null) {
    const hasBakery = Boolean(gameState.upgrades && gameState.upgrades.bakery_counter);
    const activePastries = (hasBakery && typeof getActivePastryIds === 'function') ? getActivePastryIds() : [];
    let activeTeaKeys = (typeof getActiveTeaIds === 'function') ? getActiveTeaIds() : Object.keys(TEA_MENU);

    const hasPastries = hasBakery && activePastries.length > 0;
    const hasTeas = activeTeaKeys.length > 0;

    // Dự phòng an toàn nếu không có món nào
    if (!hasPastries && !hasTeas) {
        activeTeaKeys = ['classic'];
    }

    // Xác định loại đơn
    let isPastryOnly = false;
    if (hasPastries && !hasTeas) {
        // Chỉ bán bánh ngọt -> 100% khách vào mua bánh
        isPastryOnly = true;
    } else if (hasPastries && hasTeas) {
        // Có cả hai -> 25% khách chỉ mua bánh
        isPastryOnly = Math.random() < 0.25;
    } else {
        // Không có quầy bánh hoặc tắt hết bánh -> 0% bánh
        isPastryOnly = false;
    }

    let randomTeaKey = null;
    let chosenToppings = [];
    let chosenPastryId = null;
    let totalPrice = 0;

    if (isPastryOnly) {
        // 1. ĐƠN CHỈ MUA BÁNH NGỌT TẠI QUẦY BÁNH
        chosenPastryId = activePastries[Math.floor(Math.random() * activePastries.length)];
        totalPrice = (typeof getPastryCurrentPrice === 'function') ? getPastryCurrentPrice(chosenPastryId) : 18000;
    } else {
        // 2. ĐƠN CÓ NƯỚC (NƯỚC ĐƠN LẺ HOẶC COMBO KÈM BÁNH)
        const validTeaKeys = activeTeaKeys.length > 0 ? activeTeaKeys : ['classic'];
        randomTeaKey = validTeaKeys[Math.floor(Math.random() * validTeaKeys.length)];
        const teaObj = TEA_MENU[randomTeaKey] || TEA_MENU['classic'];

        const activeTopKeys = (typeof getActiveToppingIds === 'function') ? getActiveToppingIds() : Object.keys(TOPPING_MENU);
        if (activeTopKeys.length > 0) {
            const shuffledTops = [...activeTopKeys].sort(() => 0.5 - Math.random());
            const maxTops = Math.min(3, shuffledTops.length);
            const numToppings = Math.floor(Math.random() * (maxTops + 1));
            chosenToppings = shuffledTops.slice(0, numToppings);
        } else {
            chosenToppings = [];
        }

        const currentTeaPrice = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(randomTeaKey) : teaObj.price;
        totalPrice = currentTeaPrice;
        chosenToppings.forEach(tKey => {
            totalPrice += (TOPPING_MENU[tKey] ? TOPPING_MENU[tKey].price : 5000);
        });

        // 35% cơ hội gọi thêm bánh ngọt ăn kèm combo (CHỈ KHI ĐÃ CÓ QUẦY BÁNH & BẬT BÁNH)
        if (hasPastries && Math.random() < 0.35) {
            chosenPastryId = activePastries[Math.floor(Math.random() * activePastries.length)];
            if (typeof getPastryCurrentPrice === 'function') {
                totalPrice += getPastryCurrentPrice(chosenPastryId);
            }
        }
    }

    // Khách hàng: lấy từ hàng đợi nếu có, hoặc ngẫu nhiên
    const profile = forcedCustomerProfile || CUSTOMER_PROFILES[Math.floor(Math.random() * CUSTOMER_PROFILES.length)];
    
    // Kiểm tra bàn trống sạch
    const hasCleanSeat = typeof SHOP_SEATS !== 'undefined' && SHOP_SEATS.some(s => !s.occupied && !s.isDirty);
    const dineIn = hasCleanSeat && Math.random() < 0.70;

    return {
        id: Date.now() + '_' + Math.random(),
        customer: profile,
        teaId: randomTeaKey,
        toppings: chosenToppings,
        pastryId: chosenPastryId,
        totalPrice: totalPrice,
        dineIn: dineIn
    };
}

function spawnNextCustomer() {
    if (gameState.phase !== 'WAITING_SPAWN') return;

    // Lấy khách hàng tiếp theo từ đầu hàng chờ xếp hàng duy nhất
    let nextProfile = null;
    if (typeof advanceCustomerQueue === 'function' && typeof scene !== 'undefined') {
        nextProfile = advanceCustomerQueue(scene);
    }

    const order = generateRandomOrder(nextProfile);
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

        // Bước từ đầu hàng chờ (z = 2.75) hoặc từ cửa vào quầy
        const startZ = (typeof customerQueue !== 'undefined' && customerQueue.length > 0) ? 2.75 : 2.2;
        const startX = (typeof customerQueue !== 'undefined' && customerQueue.length > 0) ? -0.25 : -5.8;
        customerGroup.position.set(startX, 0, startZ);
        customerGroup.rotation.y = (startX === -0.25) ? Math.PI : Math.PI / 2;
        customerGroup.visible = true;
    }

    // ĐIỀU HƯỚNG QUẦY PHỤC VỤ (DUAL-COUNTER ROUTING):
    // - Chỉ mua bánh -> Sang Quầy Bánh (-4.3, 0, 1.35)
    // - Mua nước (hoặc Combo nước + bánh) -> Sang Quầy Nước (-0.25, 0, 1.35)
    if (!order.teaId && order.pastryId) {
        customerAnim.targetPos.set(-4.3, 0, 1.35);
    } else {
        customerAnim.targetPos.set(-0.25, 0, 1.35);
    }
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
        customerGroup.rotation.y = Math.PI; // Quay mặt về phía quầy
    }
    playSoundEffect('bell');

    updateOrderTicketUI();
    updateCraftingUI(); // Gợi ý viền vàng món khách gọi

    const order = gameState.currentOrder;
    if (!order) return;

    // Tính toán thời gian kiên nhẫn theo chiến lược định giá
    let patienceTime = 16;
    if (order.teaId && TEA_MENU[order.teaId]) {
        const currentPrice = (typeof getDrinkCurrentPrice === 'function') ? getDrinkCurrentPrice(order.teaId) : TEA_MENU[order.teaId].price;
        const baseStandardPrice = TEA_MENU[order.teaId].price;
        const priceDiff = currentPrice - baseStandardPrice;
        if (priceDiff > 0) {
            patienceTime = Math.max(10, 16 - (priceDiff / 1000) * 0.4);
        } else if (priceDiff < 0) {
            patienceTime = Math.min(24, 16 + Math.abs(priceDiff / 1000) * 0.5);
        }
    }

    // Thưởng thêm thời gian từ Cún Tiếp Tân & Thảm Hoa Ấm Áp
    if (typeof gameState !== 'undefined' && gameState.staff && gameState.staff.greeter_dog) {
        patienceTime += 5.5; // Bé Cún đứng chào giúp khách cực kỳ kiên nhẫn!
    }
    if (typeof gameState !== 'undefined' && gameState.upgrades && gameState.upgrades.cozy_carpet) {
        patienceTime += 2.0;
    }

    if (typeof startPatienceTimer === 'function') {
        startPatienceTimer(patienceTime);
    }

    // Hiển thị thông báo gọi món
    const teaName = (order.teaId && TEA_MENU[order.teaId]) ? TEA_MENU[order.teaId].name : '';
    const pastryNote = (order.pastryId && typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[order.pastryId]) 
        ? (order.teaId ? ` + ${PASTRY_MENU[order.pastryId].name}` : PASTRY_MENU[order.pastryId].name) 
        : '';
    showToast(`🛎️ ${order.customer.name} gọi: ${order.teaId ? teaName + pastryNote : pastryNote}!`);
}

function validateDrinkAgainstOrder() {
    const order = gameState.currentOrder;
    if (!order) return;

    let errors = [];

    // Nếu đơn có trà sữa
    if (order.teaId) {
        const madeTea = gameState.cup.teaId;
        const madeTops = Array.from(gameState.cup.toppings);

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
    }

    // Nếu đơn có bánh ngọt kèm theo hoặc chỉ mua bánh
    if (order.pastryId) {
        const pName = (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[order.pastryId]) ? PASTRY_MENU[order.pastryId].name : 'bánh ngọt';
        if (gameState.cup.pastryId !== order.pastryId) {
            errors.push(`Thiếu bánh (${pName})`);
        } else if (typeof checkCanServePastry === 'function' && !checkCanServePastry(order.pastryId)) {
            errors.push(`Hết bánh (${pName}) trong kho`);
        }
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
        showToast(`❌ Khách báo sai món: ${reasonText}. Đã dọn lại để bạn làm lại!`);

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

        // Trừ bánh kẹo trong kho nếu có
        if (order.pastryId && typeof consumePastry === 'function') {
            consumePastry(order.pastryId);
        }

        // TIỀN TỰ ĐỘNG TĂNG TRỰC TIẾP
        gameState.money += order.totalPrice;
        gameState.revenue += order.totalPrice;
        gameState.ordersSold += 1;
        gameState.customersServed += 1;
        playSoundEffect('cash');
        updateTopStatsUI();

        // Ghi nhận vào hệ thống kế toán & kiểm tra tiến độ Target ngày
        if (typeof recordOrderSaleAndCheckTarget === 'function') {
            recordOrderSaleAndCheckTarget(order);
        }

        // Ẩn thanh đánh sao sau khi phục vụ xong
        hideSpeechBubble();

        const starsStr = '⭐'.repeat(order.stars);
        const bonusStr = order.speedBonus > 0 ? ` (Kèm thưởng tốc độ +${formatVND(order.speedBonus)})` : '';
        showToast(`💸 ${order.customer.name} hài lòng trả +${formatVND(order.totalPrice)}! Đánh giá: ${starsStr}${bonusStr}`);

        // Dọn ly trên quầy cho lượt sau
        clearCurrentCup(false);

        const canDineIn = order.dineIn && typeof getAvailableSeat === 'function' && getAvailableSeat();

        // NẾU LÀ ĐƠN COMBO (VỪA NƯỚC VỪA BÁNH): KHÁCH BƯỚC SANG QUẦY BÁNH LẤY BÁNH TRƯỚC
        if (order.teaId && order.pastryId && customerAnim) {
            customerAnim.targetPos.set(-4.3, 0, 1.35); // Bước sang Quầy Bánh
            customerAnim.active = true;

            setTimeout(() => {
                if (canDineIn && typeof startCustomerDineIn === 'function') {
                    if (customerGroup) customerGroup.visible = false;
                    startCustomerDineIn(order, scene);

                    gameState.phase = 'WAITING_SPAWN';
                    gameState.currentOrder = null;
                    updateOrderTicketUI();
                    setTimeout(() => {
                        if (gameState.dailyTarget && !gameState.dailyTarget.isReached) {
                            spawnNextCustomer();
                        }
                    }, 800);
                } else {
                    gameState.phase = 'WALKING_OUT';
                    customerAnim.targetPos.set(-6.2, 0, 2.2);
                    customerAnim.active = true;
                    updateOrderTicketUI();
                }
            }, 1100);
            return;
        }

        if (canDineIn && typeof startCustomerDineIn === 'function') {
            // Uống tại quán -> Chuyển đến bàn ngồi
            if (customerGroup) customerGroup.visible = false;
            startCustomerDineIn(order, scene);

            // Quầy ngay lập tức sẵn sàng đón khách tiếp theo sau 0.8s nếu chưa đạt target kết thúc ngày
            gameState.phase = 'WAITING_SPAWN';
            gameState.currentOrder = null;
            updateOrderTicketUI();

            setTimeout(() => {
                if (gameState.dailyTarget && !gameState.dailyTarget.isReached) {
                    spawnNextCustomer();
                }
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
