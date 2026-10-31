/* ============================================================================
 * CẤU HÌNH VẬT PHẨM NÂNG CẤP & NỘI THẤT QUÁN (SHOP UPGRADES CONFIG)
 * Danh sách đồ trang trí 3D, máy móc và hiệu ứng tăng doanh thu cho tiệm.
 * ============================================================================ */

const SHOP_UPGRADES = [
    {
        id: 'neon_sign',
        name: 'Đèn Neon "Boba Sweet" Rực Rỡ',
        price: 80000,
        icon: '💡',
        category: 'Trang Trí 3D',
        desc: 'Biển Neon hồng phát sáng lung linh trên tường sau tiệm, tỏa ánh đèn ấm áp thu hút khách.',
        benefit: '✨ Tăng độ ấm cúng và ánh sáng toàn quán',
        maxLevel: 1
    },
    {
        id: 'cozy_carpet',
        name: 'Thảm Hoa Nhung Pastel',
        price: 60000,
        icon: '🌸',
        category: 'Nội Thất',
        desc: 'Tấm thảm hoa êm ái cao cấp trải ngay trước quầy pha chế giúp không gian tiệm thêm phần ngọt ngào.',
        benefit: '🎨 Điểm nhấn xinh xắn ngay lối vào quầy',
        maxLevel: 1
    },
    {
        id: 'music_box',
        name: 'Máy Hát Đĩa Cổ Điển (Gramophone)',
        price: 120000,
        icon: '📻',
        category: 'Thiết Bị Đặc Biệt',
        desc: 'Máy hát đĩa đồng vàng phát ra các nốt nhạc bồng bềnh bay lượn, giúp khách ngồi uống cảm thấy thư thái.',
        benefit: '💵 Tăng thêm +5.000đ tiền tip cho mỗi lượt khách ngồi bàn',
        maxLevel: 1
    },
    {
        id: 'auto_sealer',
        name: 'Máy Dập Nắp Cốc Đa Tầng',
        price: 50000,
        icon: '⚙️',
        category: 'Thiết Bị Pha Chế',
        desc: 'Hệ thống ép màng dập nắp công nghệ cao cho quầy nước.',
        benefit: '⚡ Cấp 1: Trợ lực nhanh 50% | Cấp 2: Tự động mạ vàng 100%',
        maxLevel: 2,
        levels: [
            { level: 1, name: 'Cấp 1: Máy Dập Trợ Lực', price: 50000, desc: 'Giảm 50% thời gian đóng màng nắp cốc' },
            { level: 2, name: 'Cấp 2: Máy Mạ Vàng Tự Động', price: 120000, desc: 'Dập nắp tự động 100% bằng vàng gold óng ánh' }
        ]
    },
    {
        id: 'bakery_counter',
        name: 'Quầy Bánh Ngọt Sang Trọng',
        price: 60000,
        icon: '🥐',
        category: 'Khu Bánh Ngọt',
        desc: 'Tủ kính trong suốt đặt cạnh quầy pha chế, trưng bày bánh sừng bò, donut và macaron rực rỡ.',
        benefit: '🧁 Cấp 1: Quầy 2 tầng & Bếp Trưởng Mèo | Cấp 2: Lò nướng thơm bốc khói & Đèn LED',
        maxLevel: 2,
        levels: [
            { level: 1, name: 'Cấp 1: Quầy Bánh 2 Tầng', price: 60000, desc: 'Kính 2 tầng pastel + Bếp trưởng mèo đứng nướng' },
            { level: 2, name: 'Cấp 2: Quầy Bánh Hoàng Gia', price: 140000, desc: 'Lò nướng 3D thơm lừng bốc khói + Đèn LED 7 màu' }
        ]
    },
    {
        id: 'extra_tables',
        name: 'Mở Rộng Cụm Bàn Ghế Khách',
        price: 80000,
        icon: '🪑',
        category: 'Nội Thất Mở Rộng',
        desc: 'Thêm bàn ghế đẩu êm ái, nâng sức chứa khách ngồi tại quán lên tối đa!',
        benefit: '👥 Cấp 1: 4 bàn (8 chỗ ngồi) | Cấp 2: 6 bàn (12 chỗ ngồi)',
        maxLevel: 2,
        levels: [
            { level: 1, name: 'Cấp 1: Bàn Ghế #3 & #4', price: 80000, desc: 'Thêm 2 bàn tròn & 4 ghế đẩu (Tổng 8 chỗ ngồi)' },
            { level: 2, name: 'Cấp 2: Bàn Ghế #5 & #6', price: 160000, desc: 'Thêm 2 bàn lớn & 4 ghế nữa (Tổng 12 chỗ ngồi)' }
        ]
    },
    {
        id: 'expand_shop',
        name: 'Mở Rộng Đất & Không Gian Quán',
        price: 150000,
        icon: '🏡',
        category: 'Mặt Bằng & Đất',
        desc: 'Nới rộng không gian mặt bằng, sân vườn và đại sảnh phong cách đa dạng.',
        benefit: '✨ Cấp 1: Hiên gỗ ngoài trời | Cấp 2: Vườn Sakura Nhật | Cấp 3: Đại sảnh đôi',
        maxLevel: 3,
        levels: [
            { level: 1, name: 'Cấp 1: Hiên Gỗ & Đèn Thả', price: 150000, desc: 'Hiên gỗ ngoài trời ấm cúng, đèn trần pastel & chậu monstera' },
            { level: 2, name: 'Cấp 2: Vườn Zen & Hoa Sakura', price: 300000, desc: 'Vườn đá phong cách Nhật, cây hoa anh đào hồng rực rỡ & đèn lồng đá' },
            { level: 3, name: 'Cấp 3: Đại Sảnh Hoàng Gia', price: 500000, desc: 'Nới rộng sảnh 2 cánh, thảm lụa nhung & đèn chùm pha lê quý phái' }
        ]
    }
];

// Danh mục các loại nền gạch có thể mở khóa và tùy ý thay đổi
const FLOORING_CATALOG = [
    {
        id: 'checker_pink',
        name: 'Caro Hồng Kem Pastel',
        desc: 'Nền gạch caro hồng và kem trang nhã đặc trưng của Boba Sweet',
        icon: '🌸',
        price: 0,
        colorA: 0xfffdf9,
        colorB: 0xfce7f3
    },
    {
        id: 'oak_wood',
        name: 'Gỗ Sồi Nhật Bản',
        desc: 'Sàn gỗ sáng màu phong cách Nhật Bản ấm cúng và mộc mạc',
        icon: '🪵',
        price: 40000,
        colorA: 0xfde68a,
        colorB: 0xf59e0b
    },
    {
        id: 'luxury_marble',
        name: 'Đá Cẩm Thạch Hoàng Gia',
        desc: 'Đá vân cẩm thạch trắng viền vàng cực kỳ xa hoa và lộng lẫy',
        icon: '🏛️',
        price: 70000,
        colorA: 0xf8fafc,
        colorB: 0xe2e8f0
    },
    {
        id: 'retro_mint',
        name: 'Gạch Bông Xanh Retro',
        desc: 'Gạch bông cổ điển xanh bạc hà tươi mát phong cách vintage',
        icon: '🌿',
        price: 50000,
        colorA: 0xd1fae5,
        colorB: 0xa7f3d0
    }
];

