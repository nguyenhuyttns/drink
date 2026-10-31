/* ============================================================================
 * DỊCH VỤ KẾ TOÁN & MỤC TIÊU NGÀY (DAILY ACCOUNTING & TARGET SERVICE)
 * Quản lý chỉ tiêu doanh thu/số ly, theo dõi chi phí mua, giá vốn, lãi ròng và báo cáo cuối ngày.
 * ============================================================================ */

/**
 * Thiết lập mục tiêu kinh doanh cho ngày hôm nay
 * @param {'revenue' | 'cups'} type 
 * @param {number} amount 
 */
function setDailyTarget(type, amount) {
    if (!gameState.dailyTarget) {
        gameState.dailyTarget = { type: 'revenue', targetAmount: 100000, currentAmount: 0, isReached: false, isDayOpen: false };
    }
    gameState.dailyTarget.type = type || 'revenue';
    gameState.dailyTarget.targetAmount = Math.max(1, amount || 100000);
    gameState.dailyTarget.currentAmount = 0;
    gameState.dailyTarget.isReached = false;

    updateTargetProgressUI();
}

/**
 * Kiểm tra và cộng dồn tiến độ mục tiêu khi hoàn tất 1 đơn hàng
 * @param {Object} order 
 */
function recordOrderSaleAndCheckTarget(order) {
    if (!order) return;

    if (!gameState.accountingToday) {
        gameState.accountingToday = {
            revenue: 0,
            cogs: 0,
            purchaseExpenses: 0,
            staffWages: 0,
            cupsSold: 0,
            pastriesSold: 0,
            toppingsSold: 0
        };
    }

    // Ghi nhận doanh thu đơn hàng
    gameState.accountingToday.revenue = (gameState.accountingToday.revenue || 0) + (order.totalPrice || 0);

    // Cập nhật tiến độ mục tiêu
    if (!gameState.dailyTarget) {
        gameState.dailyTarget = { type: 'revenue', targetAmount: 100000, currentAmount: 0, isReached: false, isDayOpen: true };
    }

    if (gameState.dailyTarget.type === 'cups') {
        gameState.dailyTarget.currentAmount += (order.teaId ? 1 : 0);
    } else {
        gameState.dailyTarget.currentAmount += (order.totalPrice || 0);
    }

    updateTargetProgressUI();

    // Kiểm tra xem đã hoàn thành mục tiêu ngày hay chưa
    if (gameState.dailyTarget.currentAmount >= gameState.dailyTarget.targetAmount && !gameState.dailyTarget.isReached) {
        gameState.dailyTarget.isReached = true;
        onDailyTargetReached();
    }

    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
}

/**
 * Xử lý sự kiện đạt mục tiêu ngày
 */
function onDailyTargetReached() {
    playSoundEffect('bell');
    showToast(`🎉 HOÀN THÀNH MỤC TIÊU! Quán đã đạt đủ chỉ tiêu kinh doanh Ngày ${gameState.day}!`);

    // Sau 1.4s (để khách thanh toán xong và nhận ly), kết thúc ngày và mở Báo Cáo Kế Toán
    setTimeout(() => {
        finishDayAndShowReport();
    }, 1400);
}

/**
 * Kết thúc ngày kinh doanh và mở bảng báo cáo tài chính kế toán
 */
function finishDayAndShowReport() {
    playSoundEffect('cash');

    // Tính lương nhân viên hôm nay và trừ vào tiền quán
    let dailyWages = 0;
    if (gameState.staff) {
        if (gameState.staff.waiter) dailyWages += 15000;
        if (gameState.staff.barista_assistant) dailyWages += 20000;
        if (gameState.staff.pastry_chef) dailyWages += 20000;
        if (gameState.staff.greeter_dog) dailyWages += 10000;
    }

    if (dailyWages > 0) {
        gameState.accountingToday.staffWages = dailyWages;
        gameState.money = Math.max(0, gameState.money - dailyWages);
        updateTopStatsUI();
    }

    gameState.dailyTarget.isDayOpen = false;

    // Mở Modal Kế Toán Báo Cáo Cuối Ngày
    if (typeof openDailyReportModal === 'function') {
        openDailyReportModal();
    }
}

/**
 * Lấy tóm tắt chỉ số kế toán trong ngày
 */
function getDailyAccountingSummary() {
    const today = gameState.accountingToday || {
        revenue: 0,
        cogs: 0,
        purchaseExpenses: 0,
        staffWages: 0,
        cupsSold: 0,
        pastriesSold: 0,
        toppingsSold: 0
    };

    const revenue = today.revenue || 0;
    const cogs = today.cogs || 0;
    const purchase = today.purchaseExpenses || 0;
    const wages = today.staffWages || 0;

    // Lãi gộp theo giá vốn tiêu hao thực tế
    const grossProfit = revenue - cogs;
    // Lợi nhuận ròng thực tế sau khi trừ tiền mua nhập kho và tiền lương
    const netProfit = revenue - (purchase + wages);

    return {
        revenue: revenue,
        cogs: cogs,
        purchaseExpenses: purchase,
        staffWages: wages,
        grossProfit: grossProfit,
        netProfit: netProfit,
        cupsSold: today.cupsSold || 0,
        pastriesSold: today.pastriesSold || 0,
        toppingsSold: today.toppingsSold || 0
    };
}

/**
 * Chuyển sang ngày mới tiếp theo
 */
function proceedToNextDay() {
    playSoundEffect('bell');
    gameState.day += 1;

    // Reset sổ kế toán ngày mới
    gameState.accountingToday = {
        revenue: 0,
        cogs: 0,
        purchaseExpenses: 0,
        staffWages: 0,
        cupsSold: 0,
        pastriesSold: 0,
        toppingsSold: 0
    };

    if (gameState.dailyTarget) {
        gameState.dailyTarget.currentAmount = 0;
        gameState.dailyTarget.isReached = false;
        gameState.dailyTarget.isDayOpen = false;
    }

    updateTopStatsUI();
    updateTargetProgressUI();

    // Mở bảng thiết lập ngày mới để người chơi chọn nguyên liệu & mục tiêu
    if (typeof openStartDayModal === 'function') {
        openStartDayModal();
    }
}

/**
 * Cập nhật thanh tiến độ mục tiêu trên thanh Top Bar
 */
function updateTargetProgressUI() {
    const badge = document.getElementById('target-progress-badge');
    const bar = document.getElementById('target-progress-bar');
    const label = document.getElementById('target-progress-label');
    if (!badge || !bar || !label) return;

    const target = gameState.dailyTarget || { type: 'revenue', targetAmount: 100000, currentAmount: 0 };
    const cur = target.currentAmount || 0;
    const max = target.targetAmount || 100000;
    const pct = Math.min(100, Math.round((cur / max) * 100));

    bar.style.width = `${pct}%`;

    if (target.type === 'cups') {
        label.innerText = `🎯 Mục tiêu: ${cur} / ${max} ly (${pct}%)`;
    } else {
        label.innerText = `🎯 Mục tiêu: ${formatVND(cur)} / ${formatVND(max)} (${pct}%)`;
    }

    if (pct >= 100) {
        bar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-sm';
    } else {
        bar.className = 'h-full bg-pink-500 rounded-full transition-all duration-300 shadow-sm';
    }
}
