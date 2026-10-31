/* ============================================================================
 * TRẠNG THÁI TOÀN CỤC CỦA GAME (GLOBAL GAME STATE & UTILS)
 * Quản lý tài chính, tiến trình ngày, đơn hàng hiện tại và ly trà đang pha.
 * ============================================================================ */

const gameState = {
    // Tài chính & Chỉ số tiệm
    money: 100000,
    revenue: 0,
    ordersSold: 0,
    customersServed: 0,
    totalStars: 0,
    ratingCount: 0,
    day: 1,
    soundEnabled: true,

    // Vòng đời lượt khách:
    // 'WAITING_SPAWN' | 'WALKING_IN' | 'ORDERING' | 'SEALING' | 'AWAITING_PAYMENT' | 'WALKING_OUT'
    phase: 'WAITING_SPAWN',
    currentOrder: null,

    // Trạng thái ly trà sữa đang pha trên quầy
    cup: {
        teaId: null,
        toppings: new Set(),
        isSealed: false
    },

    // Các vật phẩm nâng cấp đã sở hữu
    upgrades: {
        neon_sign: false,   // Biển Neon phát sáng lung linh
        music_box: false,   // Máy phát nhạc cổ điển (Tăng thêm 20% tiền tip)
        cozy_carpet: false, // Thảm hoa nhung trước quầy
        auto_sealer: false  // Máy dập nắp mạ vàng tự động
    },

    // 1. Kho nguyên liệu (Số lượng từng nguyên liệu có sẵn)
    inventory: {
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
    },

    // 2. Cấu hình Menu & Giá bán tùy chỉnh
    menuConfig: {
        classic: { enabled: true, price: 25000 },
        matcha: { enabled: true, price: 30000 },
        choco: { enabled: true, price: 30000 },
        peach: { enabled: true, price: 25000 }
    },

    // 3. Nhân sự của quán
    staff: {
        waiter: false,            // Bé Thỏ chạy bàn (tự dọn bàn)
        barista_assistant: false  // Bé Gấu phụ quầy (tự rót trà)
    },

    // 4. Nhật ký tài chính trong ngày
    dayStats: {
        ingredientSpent: 0,
        wagesPaid: 0,
        cupsSold: 0,
        revenueToday: 0
    }
};

/**
 * Định dạng số tiền sang tiền tệ VND (VD: 35.000đ)
 * @param {number} amount
 * @returns {string}
 */
function formatVND(amount) {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
}
