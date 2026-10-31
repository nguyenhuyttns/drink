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
