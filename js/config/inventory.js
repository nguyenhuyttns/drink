/* ============================================================================
 * CẤU HÌNH KHO NGUYÊN LIỆU & CHỢ SỈ (INVENTORY & SUPPLY MARKET CONFIG)
 * Quản lý danh mục nguyên liệu tiêu hao, giá lẻ và giá sỉ theo thùng.
 * ============================================================================ */

const INVENTORY_ITEMS = {
    // 1. CỐT TRÀ CÁC LOẠI
    tea_leaf: {
        id: 'tea_leaf',
        name: 'Trà Đen Thượng Hạng',
        unit: 'phần',
        icon: '🍃',
        costSingle: 2000,
        packQty: 10,
        packCost: 16000, // Tiết kiệm 4.000đ khi mua sỉ
        category: 'tea',
        desc: 'Cốt hồng trà ủ thủ công, dùng cho Trà Sữa Truyền Thống'
    },
    matcha_powder: {
        id: 'matcha_powder',
        name: 'Bột Matcha Uji',
        unit: 'phần',
        icon: '🍵',
        costSingle: 3000,
        packQty: 10,
        packCost: 24000,
        category: 'tea',
        desc: 'Bột trà xanh Nhật Bản nguyên chất cho Trà Sữa Matcha'
    },
    choco_powder: {
        id: 'choco_powder',
        name: 'Cacao Socola Thơm Đậm',
        unit: 'phần',
        icon: '🍫',
        costSingle: 3000,
        packQty: 10,
        packCost: 24000,
        category: 'tea',
        desc: 'Bột cacao Bỉ cao cấp cho Trà Sữa Socola béo ngậy'
    },
    peach_syrup: {
        id: 'peach_syrup',
        name: 'Cốt Trà Đào Tươi',
        unit: 'phần',
        icon: '🍑',
        costSingle: 2500,
        packQty: 10,
        packCost: 20000,
        category: 'tea',
        desc: 'Hương vị đào thanh mát ngọt dịu cho món Trà Đào tươi mát'
    },

    // 2. SỮA TƯƠI
    fresh_milk: {
        id: 'fresh_milk',
        name: 'Sữa Tươi Thanh Trùng',
        unit: 'hộp',
        icon: '🥛',
        costSingle: 2000,
        packQty: 10,
        packCost: 16000,
        category: 'milk',
        desc: 'Sữa tươi béo ngọt tự nhiên, thành phần bắt buộc cho các món trà sữa'
    },

    // 3. TOPPING
    boba: {
        id: 'boba',
        name: 'Trân Châu Đen Đường Đen',
        unit: 'phần',
        icon: '⚫',
        costSingle: 1500,
        packQty: 10,
        packCost: 12000,
        category: 'topping',
        desc: 'Topping quốc dân dai giòn dẻo dai nấu với mật đường đen'
    },
    jelly: {
        id: 'jelly',
        name: 'Thạch Trái Cây 7 Màu',
        unit: 'phần',
        icon: '🍬',
        costSingle: 1500,
        packQty: 10,
        packCost: 12000,
        category: 'topping',
        desc: 'Thạch dai giòn mát lạnh đủ vị trái cây nhiệt đới'
    },
    pudding: {
        id: 'pudding',
        name: 'Pudding Trứng Mềm Mịn',
        unit: 'phần',
        icon: '🍮',
        costSingle: 2000,
        packQty: 10,
        packCost: 16000,
        category: 'topping',
        desc: 'Bánh pudding caramen núng nính, mềm tan trong miệng'
    },
    cheese: {
        id: 'cheese',
        name: 'Kem Phô Mai Macchiato',
        unit: 'phần',
        icon: '🧀',
        costSingle: 3000,
        packQty: 10,
        packCost: 24000,
        category: 'topping',
        desc: 'Lớp foam phô mai mằn mặn béo ngậy phủ trên mặt ly'
    },

    // 4. BAO BÌ VẬT TƯ
    cup_pack: {
        id: 'cup_pack',
        name: 'Bộ Ly & Màng Ép 500ml',
        unit: 'bộ',
        icon: '🥤',
        costSingle: 1000,
        packQty: 15,
        packCost: 12000,
        category: 'packaging',
        desc: 'Ly nhựa chịu nhiệt in logo quán và màng dập nắp tiệt trùng'
    },

    // 5. QUẦY BÁNH NGỌT & ĂN VẶT (BAKERY & SNACKS)
    croissant: {
        id: 'croissant',
        name: 'Bánh Sừng Bò Bơ Pháp (Croissant)',
        unit: 'cái',
        icon: '🥐',
        costSingle: 5000,
        packQty: 10,
        packCost: 40000,
        category: 'pastry',
        desc: 'Bánh nướng ngàn lớp thơm lừng mùi bơ béo ngậy'
    },
    donut: {
        id: 'donut',
        name: 'Bánh Donut Dâu Cốm',
        unit: 'cái',
        icon: '🍩',
        costSingle: 6000,
        packQty: 10,
        packCost: 48000,
        category: 'pastry',
        desc: 'Bánh vòng phủ sốt dâu hồng và rắc cốm cầu vồng giòn tan'
    },
    macaron: {
        id: 'macaron',
        name: 'Bánh Macaron Pháp Cao Cấp',
        unit: 'hộp',
        icon: '🧁',
        costSingle: 8000,
        packQty: 10,
        packCost: 65000,
        category: 'pastry',
        desc: 'Hộp bánh macaron sắc màu hạnh nhân chuẩn vị Paris'
    },
    cupcake: {
        id: 'cupcake',
        name: 'Bánh Cupcake Kem Bơ',
        unit: 'cái',
        icon: '🍰',
        costSingle: 7000,
        packQty: 10,
        packCost: 55000,
        category: 'pastry',
        desc: 'Bánh bông lan mini mềm mịn phủ kem tươi hoa hồng'
    }
};

// Định nghĩa nguyên liệu tiêu hao cho từng loại đồ uống
const TEA_RECIPES = {
    classic: ['tea_leaf', 'fresh_milk'],
    matcha: ['matcha_powder', 'fresh_milk'],
    choco: ['choco_powder', 'fresh_milk'],
    peach: ['peach_syrup']
};

const TOPPING_RECIPES = {
    boba: 'boba',
    jelly: 'jelly',
    pudding: 'pudding',
    cheese: 'cheese'
};
