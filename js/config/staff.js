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
        desc: 'Tự động rót sẵn cốt trà chuẩn xác theo đơn hàng mới của khách sau 1.5 giây nếu bạn bận.',
        benefit: 'Tối ưu tốc độ phục vụ, luôn đạt đánh giá 3 Sao tốc độ (+15.000đ).'
    }
};
