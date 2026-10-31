/* ============================================================================
 * ĐIỀU KHIỂN CAMERA & TƯƠNG TÁC CLICK 3D (CAMERA & RAYCASTER)
 * Chuyển góc nhìn toàn cảnh / cận cảnh quầy pha chế và bắt sự kiện click vật thể 3D.
 * ============================================================================ */

let cameraTargetTween = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function focusCounterCamera() {
    playSoundEffect('click');
    cameraTargetTween = {
        camPos: new THREE.Vector3(3.2, 3.8, 4.4), // Zoom cận cảnh quầy theo trục chéo
        lookAt: new THREE.Vector3(-0.25, 1.45, -0.35),
        progress: 0
    };

    // Hiệu ứng viền phát sáng ở bảng pha chế
    const panel = document.getElementById('crafting-panel');
    if (panel) {
        panel.classList.add('ring-4', 'ring-pink-400');
        setTimeout(() => panel.classList.remove('ring-4', 'ring-pink-400'), 900);
    }
}

function resetCameraView() {
    playSoundEffect('click');
    cameraTargetTween = {
        camPos: new THREE.Vector3(6.8, 7.5, 8.8), // Toàn cảnh tiệm theo trục chéo
        lookAt: new THREE.Vector3(-0.2, 1.2, 0.2),
        progress: 0
    };
}

function setupPointerInteraction(targetRenderer, targetCamera, counterHitboxMesh, petCatHitboxMesh) {
    targetRenderer.domElement.addEventListener('pointerdown', (event) => {
        const rect = targetRenderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, targetCamera);

        // 1. Ưu tiên kiểm tra tương tác vuốt ve bé Mèo Mimi
        if (petCatHitboxMesh) {
            const catIntersects = raycaster.intersectObject(petCatHitboxMesh, true);
            if (catIntersects.length > 0) {
                if (typeof interactWithPetCat === 'function') {
                    interactWithPetCat();
                }
                return;
            }
        }

        // 2. Tương tác click dọn dẹp Bàn Bẩn (Click to clean table)
        if (typeof dirtyTableHitboxes !== 'undefined' && dirtyTableHitboxes.length > 0) {
            const tableIntersects = raycaster.intersectObjects(dirtyTableHitboxes, true);
            if (tableIntersects.length > 0) {
                const hitObj = tableIntersects[0].object;
                const seatId = hitObj.userData ? hitObj.userData.seatId : null;
                if (typeof SHOP_SEATS !== 'undefined' && seatId !== null) {
                    const seat = SHOP_SEATS.find(s => s.id === seatId);
                    if (seat && typeof cleanTableSeat === 'function' && typeof scene !== 'undefined') {
                        cleanTableSeat(seat, scene, false);
                        return;
                    }
                }
            }
        }

        // 3. Tương tác nhấn vào Quầy Bánh Ngọt 3D
        if (typeof upgradeMeshes !== 'undefined' && upgradeMeshes.bakeryCounterGroup && upgradeMeshes.bakeryCounterGroup.visible) {
            const bakeryHits = raycaster.intersectObject(upgradeMeshes.bakeryCounterGroup, true);
            if (bakeryHits.length > 0) {
                if (gameState.phase === 'ORDERING' && gameState.currentOrder && gameState.currentOrder.pastryId) {
                    if (typeof quickPrepareAndServePastry === 'function') {
                        quickPrepareAndServePastry(gameState.currentOrder.pastryId);
                        showToast('🥐 Đã chuẩn bị & phục vụ bánh ngay cho khách tại Quầy Bánh!');
                        return;
                    }
                }
                if (typeof openCraftingPanel === 'function') {
                    openCraftingPanel();
                }
                showToast('🥐 Bạn vừa nhấn vào Quầy Bánh Ngọt! Bảng chọn bánh đã mở ra.');
                return;
            }
        }

        // 4. Tương tác nhấn vào Khách Hàng đang chờ tại quầy
        if (typeof customerGroup !== 'undefined' && customerGroup && customerGroup.visible) {
            const custHits = raycaster.intersectObject(customerGroup, true);
            if (custHits.length > 0 && gameState.phase === 'ORDERING' && gameState.currentOrder) {
                if (!gameState.currentOrder.teaId && gameState.currentOrder.pastryId) {
                    if (typeof quickPrepareAndServePastry === 'function') {
                        quickPrepareAndServePastry(gameState.currentOrder.pastryId);
                        showToast('🥐 Đã phục vụ bánh cho khách hàng!');
                        return;
                    }
                }
                if (typeof openCraftingPanel === 'function') {
                    openCraftingPanel();
                }
                focusCounterCamera();
                return;
            }
        }

        // 5. Tương tác nhấn vào Quầy Pha Chế Chính
        if (counterHitboxMesh) {
            const intersects = raycaster.intersectObject(counterHitboxMesh, true);
            if (intersects.length > 0) {
                focusCounterCamera();
                if (typeof openCraftingPanel === 'function') {
                    openCraftingPanel();
                }
                showToast('✨ Bạn vừa nhấn vào Quầy Pha Chế! Bảng chọn món đã mở ra.');
            }
        }
    });
}

/**
 * Cập nhật nội suy camera mượt mà trong vòng lặp game
 */
function updateCameraTween(dt, targetCamera, targetControls) {
    if (!cameraTargetTween) return;

    cameraTargetTween.progress += dt * 2.5;
    const alpha = Math.min(cameraTargetTween.progress, 1);
    targetCamera.position.lerp(cameraTargetTween.camPos, alpha * 0.18);
    targetControls.target.lerp(cameraTargetTween.lookAt, alpha * 0.18);

    if (alpha >= 1) {
        cameraTargetTween = null;
    }
}
