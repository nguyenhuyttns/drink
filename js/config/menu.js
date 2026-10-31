/* ============================================================================
 * CẤU HÌNH MENU ĐỒ UỐNG & TOPPING (TEA & TOPPING CONFIGURATION)
 * Dễ dàng mở rộng: chỉ cần thêm object mới vào TEA_MENU hoặc TOPPING_MENU.
 * ============================================================================ */

const TEA_MENU = {
    classic: {
        id: 'classic',
        name: 'Trà sữa truyền thống',
        price: 25000,
        color: 0xd2a679,
        hex: '#d2a679',
        opacity: 0.96
    },
    matcha: {
        id: 'matcha',
        name: 'Trà sữa matcha',
        price: 30000,
        color: 0x88c999,
        hex: '#88c999',
        opacity: 0.96
    },
    choco: {
        id: 'choco',
        name: 'Trà sữa socola',
        price: 30000,
        color: 0x6b4423,
        hex: '#6b4423',
        opacity: 0.97
    },
    peach: {
        id: 'peach',
        name: 'Trà đào',
        price: 25000,
        color: 0xff9e5e,
        hex: '#ff9e5e',
        opacity: 0.82
    }
};

const TOPPING_MENU = {
    boba: {
        id: 'boba',
        name: 'Trân châu đen',
        price: 5000,
        icon: '⚫'
    },
    jelly: {
        id: 'jelly',
        name: 'Thạch trái cây',
        price: 5000,
        icon: '🍬'
    },
    pudding: {
        id: 'pudding',
        name: 'Pudding trứng',
        price: 7000,
        icon: '🍮'
    },
    cheese: {
        id: 'cheese',
        name: 'Kem Cheese',
        price: 10000,
        icon: '🧀'
    }
};

const PASTRY_MENU = {
    croissant: {
        id: 'croissant',
        name: 'Bánh Sừng Bò (Croissant)',
        price: 15000,
        icon: '🥐',
        color: 0xf59e0b
    },
    donut: {
        id: 'donut',
        name: 'Bánh Donut Dâu Cốm',
        price: 18000,
        icon: '🍩',
        color: 0xf472b6
    },
    macaron: {
        id: 'macaron',
        name: 'Bánh Macaron Pháp',
        price: 22000,
        icon: '🧁',
        color: 0x38bdf8
    },
    cupcake: {
        id: 'cupcake',
        name: 'Bánh Cupcake Kem Bơ',
        price: 20000,
        icon: '🍰',
        color: 0xec4899
    }
};

