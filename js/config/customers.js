/* ============================================================================
 * CẤU HÌNH KHÁCH HÀNG ĐA ĐỘ TUỔI (MULTI-AGE CUSTOMER PROFILES)
 * Đầy đủ các lứa tuổi: Trẻ em, Học sinh, Công sở, Trung niên, Người cao tuổi.
 * Được dựng hình 3D hoàn chỉnh với chân bước đi, tay vung nhịp nhàng và mặt anime vẽ tinh xảo.
 * ============================================================================ */

const CUSTOMER_PROFILES = [
    // 1. NỮ CÔNG SỞ THANH LỊCH (Chuẩn 100% theo hình mẫu tham khảo!)
    {
        id: 'thuc_quyen',
        name: 'Cô Thục Quyên',
        avatar: '👩‍💼',
        ageGroup: 'adult',
        ageText: 'Nhân viên văn phòng 25 tuổi',
        scale: 1.05,
        hairStyle: 'office_wavy',     // Mái tóc uốn lượn bồng bềnh ngang vai
        hairColor: 0x4a2a1b,          // Nâu socola bóng mượt
        shirtColor: 0xffffff,         // Sơ mi trắng tinh khôi
        pantsColor: 0x242e42,         // Chân váy bút chì xanh đen
        shoeColor: 0x18181b,          // Giày cao gót đen thanh lịch
        hasNecktie: true,             // Cà vạt đỏ thắm nổi bật
        tieColor: 0xdc2626,
        hasEarrings: true,            // Khuyên tai ngọc trai
        hasGlasses: false,
        hasMustache: false
    },

    // 2. TRẺ EM (Bé Dâu Tây ngọt ngào 7 tuổi)
    {
        id: 'dau_tay',
        name: 'Bé Dâu Tây',
        avatar: '👧',
        ageGroup: 'child',
        ageText: 'Bé gái 7 tuổi',
        scale: 0.90,
        hairStyle: 'twintails',       // Hai bím tóc củ tỏi đính nơ
        hairColor: 0x5c3317,          // Tóc nâu hạt dẻ
        shirtColor: 0xfda4af,         // Váy yếm hồng pastel
        pantsColor: 0xfef08a,         // Chân váy vàng tươi
        shoeColor: 0xffffff,          // Giày búp bê trắng
        hasNecktie: false,
        hasEarrings: false,
        hasGlasses: false,
        hasMustache: false
    },

    // 3. HỌC SINH / THIẾU NIÊN (Minh Khôi năng động 16 tuổi)
    {
        id: 'minh_khoi',
        name: 'Minh Khôi',
        avatar: '👦',
        ageGroup: 'teen',
        ageText: 'Học sinh 16 tuổi',
        scale: 1.0,
        hairStyle: 'boy_anime',       // Tóc anime tỉa lớp cá tính
        hairColor: 0x1f2937,          // Tóc đen ánh xám
        shirtColor: 0x38bdf8,         // Áo hoodie xanh biển
        pantsColor: 0x334155,         // Quần jeans xám đen
        shoeColor: 0xffffff,          // Sneaker thể thao trắng
        hasNecktie: false,
        hasEarrings: false,
        hasGlasses: false,
        hasMustache: false
    },

    // 4. NGƯỜI CAO TUỔI (Bà Cụ Tư phúc hậu 72 tuổi)
    {
        id: 'ba_tu',
        name: 'Bà Cụ Tư',
        avatar: '👵',
        ageGroup: 'senior',
        ageText: 'Cụ bà phúc hậu 72 tuổi',
        scale: 0.95,
        hairStyle: 'grandma_bun',      // Búi tóc bạc trắng như mây có trâm ngọc
        hairColor: 0xd4d4d8,          // Tóc hoa râm màu bạc
        shirtColor: 0xc084fc,         // Áo len tím ấm áp
        pantsColor: 0x1e293b,         // Quần vải đen lịch sự
        shoeColor: 0x27272a,          // Giày vải êm chân
        hasNecktie: false,
        hasEarrings: true,            // Khuyên tai ngọc bích
        hasGlasses: true,             // Cặp kính lão tròn xoe
        hasMustache: false
    },

    // 5. TRUNG NIÊN (Bác Ba Phúc 52 tuổi)
    {
        id: 'bac_ba',
        name: 'Bác Ba Phúc',
        avatar: '👨',
        ageGroup: 'middle',
        ageText: 'Bác Ba 52 tuổi',
        scale: 1.03,
        hairStyle: 'gentleman_part',  // Tóc ngắn rẽ ngôi chững chạc
        hairColor: 0x4b5563,          // Tóc muối tiêu
        shirtColor: 0xfef08a,         // Áo polo vàng nhạt
        pantsColor: 0x78716c,         // Quần kaki màu be sẫm
        shoeColor: 0x44403c,          // Giày mọi nâu sẫm
        hasNecktie: false,
        hasEarrings: false,
        hasGlasses: false,
        hasMustache: true             // Ria mép hiền từ
    }
];
