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

function setupPointerInteraction(targetRenderer, targetCamera, counterHitboxMesh) {
    targetRenderer.domElement.addEventListener('pointerdown', (event) => {
        const rect = targetRenderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, targetCamera);
        if (counterHitboxMesh) {
            const intersects = raycaster.intersectObject(counterHitboxMesh, true);
            if (intersects.length > 0) {
                focusCounterCamera();
                showToast('✨ Bạn vừa nhấn vào Quầy Pha Chế! Hãy chọn cốt trà và topping nhé.');
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
