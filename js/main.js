/* ============================================================================
 * ĐIỂM KHỞI CHẠY CHÍNH CỦA TRÒ CHƠI (MAIN ENTRY POINT)
 * Kết nối các module 3D, hệ thống giao diện, âm thanh và vòng lặp hoạt họa.
 * ============================================================================ */

let sealingPressHeadMesh = null;
let counterHitboxMeshRef = null;

function initGame() {
    // 0. Tự động khôi phục dữ liệu đã lưu từ LocalStorage nếu có
    if (typeof loadFromLocalStorage === 'function') {
        loadFromLocalStorage();
    }

    // 1. Khởi tạo Three.js Scene, Camera, Renderer, Controls
    const { scene, camera, renderer, controls, clock } = init3DScene();

    // 2. Dựng các thành phần không gian & mô hình 3D
    buildPastelShopEnvironment(scene);
    const equipment = buildCounterAndEquipment(scene);
    sealingPressHeadMesh = equipment.sealingPressHead;
    counterHitboxMeshRef = equipment.counterHitboxMesh;

    buildCraftingCup3D(scene);
    buildBaristaCharacter(scene);
    buildCustomerCharacter(scene);

    // Dựng mô hình Bé Mèo Mimi 3D trên quầy bar
    let petCatHitboxRef = null;
    if (typeof buildPetCat3D === 'function') {
        const catRes = buildPetCat3D(scene);
        petCatHitboxRef = catRes ? catRes.petCatHitbox : null;
    }

    // Áp dụng các vật phẩm trang trí đã mua trong tiệm
    if (typeof applyPurchasedDecorUpgrades === 'function') {
        applyPurchasedDecorUpgrades(scene);
    }

    // Dựng nhân viên nếu đã được thuê
    if (gameState.staff && gameState.staff.waiter && typeof buildWaiter3D === 'function') {
        buildWaiter3D(scene);
    }
    if (gameState.staff && gameState.staff.barista_assistant && typeof buildAssistantBarista3D === 'function') {
        buildAssistantBarista3D(scene);
    }
    if (gameState.staff && gameState.staff.pastry_chef && typeof buildPastryChef3D === 'function') {
        buildPastryChef3D(scene);
    }
    if (gameState.staff && gameState.staff.greeter_dog && typeof buildGreeterDog3D === 'function') {
        buildGreeterDog3D(scene);
    }

    // Khởi tạo hàng khách xếp hàng chờ gọi món
    if (typeof initCustomerQueue === 'function') {
        initCustomerQueue(scene);
    }

    // 3. Đăng ký tương tác click chuột vào quầy và bé mèo trong không gian 3D
    setupPointerInteraction(renderer, camera, counterHitboxMeshRef, petCatHitboxRef);

    // 4. Cập nhật giao diện ban đầu
    updateTopStatsUI();
    updateCraftingUI();
    if (typeof updateInventoryBadgesUI === 'function') {
        updateInventoryBadgesUI();
    }

    // 5. Callback khi khách rời quán sau khi thanh toán
    function onCustomerLeftShop() {
        customerGroup.visible = false;
        hideSpeechBubble();
        gameState.phase = 'WAITING_SPAWN';
        gameState.currentOrder = null;
        updateOrderTicketUI();

        // Khách tiếp theo xuất hiện sau 0.9s nếu quán đang mở và chưa đạt target kết thúc ngày
        setTimeout(() => {
            if (gameState.dailyTarget && gameState.dailyTarget.isDayOpen && !gameState.dailyTarget.isReached) {
                spawnNextCustomer();
            }
        }, 900);
    }

    // 6. Vòng lặp hoạt họa chính (Main Render Loop)
    function animate() {
        requestAnimationFrame(animate);

        const dt = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        // Hoạt ảnh nhân vật
        animateBarista(elapsed);
        animateCustomer(dt, elapsed, onCustomerArrivedAtCounter, onCustomerLeftShop);
        if (typeof animateCustomerQueue === 'function') {
            animateCustomerQueue(dt, elapsed);
        }
        if (typeof animateSeatedCustomers === 'function') {
            animateSeatedCustomers(dt, elapsed, scene);
        }

        // Hoạt ảnh hành vi nhân viên 3D (Waiter dọn bàn, Assistant Barista)
        if (typeof updateStaffAI === 'function') {
            updateStaffAI(dt, elapsed, scene);
        }

        // Hoạt ảnh bé mèo cưng Mimi
        if (typeof animatePetCat === 'function') {
            animatePetCat(dt, elapsed);
        }

        // Cập nhật thanh kiên nhẫn thời gian thực
        if (typeof updatePatienceTimer === 'function') {
            updatePatienceTimer(dt);
        }

        // Hoạt ảnh ly trà sữa dâng nước & đóng nắp
        updateCup3DAnimations(dt);

        // Hoạt ảnh đầu ép máy dập nắp
        if (sealingPressHeadMesh) {
            const targetPressY = gameState.phase === 'SEALING' ? 0.55 : 0.75;
            sealingPressHeadMesh.position.y += (targetPressY - sealingPressHeadMesh.position.y) * 10 * dt;
        }

        // Chuyển động lướt camera
        updateCameraTween(dt, camera, controls);

        // Cập nhật OrbitControls & bóng thoại 3D
        controls.update();
        updateFloatingBubblePosition(camera, customerGroup);

        // Render khung hình 3D
        renderer.render(scene, camera);
    }

    animate();

    // Cập nhật thanh tiến độ mục tiêu
    if (typeof updateTargetProgressUI === 'function') {
        updateTargetProgressUI();
    }

    // Tự động lưu ngầm vào LocalStorage mỗi 45 giây
    setInterval(() => {
        if (typeof saveToLocalStorage === 'function') {
            saveToLocalStorage();
        }
    }, 45000);

    // Bắt đầu ngày mới: Mở bảng chọn Mục tiêu & Chuẩn bị nguyên liệu/Menu mở bán
    setTimeout(() => {
        if (typeof openStartDayModal === 'function') {
            openStartDayModal();
        }
    }, 700);
}

// Khởi chạy khi tài liệu HTML đã tải xong
window.onload = initGame;
