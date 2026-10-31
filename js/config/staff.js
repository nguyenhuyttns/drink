/* ============================================================================
 * CẤU HÌNH NHÂN SỰ & TUYỂN DỤNG (STAFF & WAGES CONFIG)
 * Quản lý danh sách nhân viên có thể thuê, mức lương theo ngày và kỹ năng 3D.
 * ============================================================================ */

const STAFF_ROLES = {
    waiter: {
        id: 'waiter',
        name: 'Bé Thỏ Phục Vụ (Waiter)',
        title: 'Nhân viên chạy bàn',
        icon: '🐰',
        hireCost: 40000,
        dailySalary: 15000,
        desc: 'Tự động cầm khay đi dọn dẹp sạch sẽ các bàn bẩn ngay khi khách uống xong rời quán.',
        benefit: 'Bàn luôn sạch sẽ, đón thêm nhiều lượt khách ngồi tại quán.'
    },
    barista_assistant: {
        id: 'barista_assistant',
        name: 'Bé Gấu Phụ Quầy (Barista Assistant)',
        title: 'Trợ lý pha chế',
        icon: '🐻',
        hireCost: 60000,
        dailySalary: 25000,
        desc: 'Tự động làm trọn gói đơn hàng (rót trà, thêm topping, dập nắp) nhanh thoăn thoắt.',
        benefit: 'Tối ưu tốc độ phục vụ, luôn đạt đánh giá 3 Sao tốc độ (+15.000đ).'
    },
    pastry_chef: {
        id: 'pastry_chef',
        name: 'Bé Mèo Bếp Bánh (Pastry Chef)',
        title: 'Thợ làm bánh ngọt',
        icon: '🐱',
        hireCost: 55000,
        dailySalary: 20000,
        desc: 'Đứng quầy bánh ngọt 3D, tự động lấy bánh và xếp đĩa giao cho khách ngay khi khách gọi kèm.',
        benefit: 'Tự động phục vụ bánh ngọt, tăng thêm lợi nhuận món ăn kèm.'
    },
    greeter_dog: {
        id: 'greeter_dog',
        name: 'Bé Cún Tiếp Tân & Bảo Vệ (Greeter)',
        title: 'Tiếp tân đón khách',
        icon: '🐶',
        hireCost: 45000,
        dailySalary: 18000,
        desc: 'Đứng trước cửa chào đón từng khách hàng, hướng dẫn khách xếp hàng ngay ngắn và kiên nhẫn.',
        benefit: 'Tăng thêm +4 giây kiên nhẫn ban đầu cho mọi lượt khách xếp hàng.'
    }
};

