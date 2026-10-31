# 🧋 Boba Sweet 3D - Quản Lý Tiệm Trà Sữa

Dự án game mô phỏng 3D quản lý và pha chế tiệm trà sữa với đồ họa Pastel Kawaii, phát triển trên nền tảng **HTML5, Three.js và Tailwind CSS**.

---

## 📁 Cấu Trúc Mã Nguồn (Modular Architecture)

Dự án đã được phân tách thành các module chuyên biệt theo từng miền (domain) giúp bảo trì và mở rộng dễ dàng:

```
drink/
├── index.html                      # File giao diện HTML chính (chuẩn web)
├── FE.html                         # Bản đồng bộ của file HTML ban đầu
├── README.md                       # Tài liệu hướng dẫn kiến trúc & mở rộng
├── css/
│   └── style.css                   # Định kiểu giao diện, hiệu ứng nút, bảng điều khiển, keyframe
└── js/
    ├── config/                     # Cấu hình dữ liệu trò chơi
    │   ├── menu.js                 # Danh mục cốt trà và topping (giá, màu sắc, độ mờ)
    │   └── customers.js            # Hồ sơ khách hàng (tên, avatar, màu áo, màu tóc)
    ├── state/
    │   └── gameState.js            # Trạng thái toàn cục (tiền, doanh thu, phase, ly đang pha)
    ├── audio/
    │   └── audioManager.js         # Hệ thống âm thanh Web Audio API (tự tổng hợp bằng Oscillator)
    ├── scene/                      # Quản lý không gian & mô hình 3D (Three.js)
    │   ├── sceneManager.js         # Khởi tạo Scene, Camera, Renderer, Ánh sáng, OrbitControls
    │   ├── environment.js          # Sàn gạch caro, tường, cửa ra vào, bàn ghế khách, chậu cây, menu
    │   ├── equipment.js            # Quầy bar, máy tính tiền, hũ topping, máy dập nắp ly
    │   ├── cup3D.js                # Mô hình ly trà sữa 3D, nước trà dâng lên, topping 3D, nắp vòm
    │   └── characters.js           # Nhân vật Barista và Khách hàng 3D, hoạt ảnh di chuyển
    ├── ui/
    │   └── uiManager.js            # Cập nhật số liệu thanh trên, đơn hàng, quầy pha chế, bong bóng thoại, modal
    └── game/                       # Logic và dịch vụ trò chơi
        ├── cameraController.js     # Điều khiển góc nhìn camera (Toàn cảnh / Cận cảnh quầy) & Raycaster
        ├── orderService.js         # Sinh đơn hàng ngẫu nhiên, đón khách, kiểm tra ly nước đúng/sai
        ├── craftingService.js      # Thao tác chọn trà, thêm topping, dập nắp, thanh toán, ngày mới
        └── main.js                 # Điểm khởi chạy tập trung (window.onload & render loop)
```

---

## 🛠️ Hướng Dẫn Mở Rộng & Thêm Tính Năng Mới

### 1. Thêm món trà mới hoặc topping mới
Mở file `js/config/menu.js`:
- **Thêm cốt trà:** Thêm một đối tượng vào `TEA_MENU` với `price`, `color` (mã màu hex của Three.js) và `opacity`.
- **Thêm topping:** Thêm một đối tượng vào `TOPPING_MENU` với `price` và `icon`.
- Trong file `index.html` (hoặc `FE.html`), bổ sung nút bấm tương ứng trong quầy pha chế.
- Trong `js/scene/cup3D.js`, thêm mô hình 3D tương ứng cho topping đó nếu muốn hiển thị trong ly.

### 2. Thêm khách hàng mới
Mở file `js/config/customers.js`, thêm một profile mới vào mảng `CUSTOMER_PROFILES`:
```javascript
{
    id: 'khach_vip',
    name: 'Bé Mèo Cam',
    avatar: '🐱',
    shirtColor: 0xfb923c,
    hairColor: 0x7c2d12
}
```

### 3. Tùy biến hoặc thay thế mô hình 3D
- Các mô hình không gian nằm trong `js/scene/environment.js` và `js/scene/equipment.js`.
- Mô hình ly nước nằm trong `js/scene/cup3D.js`.
- Nếu sau này muốn tải mô hình 3D từ file ngoài (`.gltf` / `.glb` từ Blender), bạn chỉ cần dùng `GLTFLoader` của Three.js trong các file tương ứng trong thư mục `js/scene/`.

### 4. Thêm hiệu ứng âm thanh mới
Mở `js/audio/audioManager.js`, thêm nhánh mới vào hàm `playSoundEffect(type)` bằng cách điều chỉnh tần số của `OscillatorNode`.

---

## 🚀 Cách Chạy Trò Chơi

- **Cách 1 (Mở trực tiếp):** Nhấp đúp vào `index.html` hoặc `FE.html` để mở ngay trên trình duyệt (Chrome, Edge, Firefox, Safari).
- **Cách 2 (Chạy local dev server):** Mở terminal tại thư mục này và gõ:
  ```bash
  npx serve .
  ```
  hoặc
  ```bash
  python -m http.server 8000
  ```
  sau đó truy cập `http://localhost:8000`.
