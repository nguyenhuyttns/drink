/* ============================================================================
 * DỊCH VỤ NHÂN SỰ & HÀNH VI TỰ ĐỘNG CỦA NHÂN VIÊN 3D (STAFF SERVICE & AI)
 * Quản lý tuyển dụng, trừ lương ngày và chu kỳ hành động tự động của Waiter & Barista.
 * ============================================================================ */

let waiterAI = {
    state: 'IDLE', // 'IDLE' | 'WALKING_TO_TABLE' | 'CLEANING' | 'RETURNING'
    targetSeat: null,
    restPos: new THREE.Vector3(1.5, 0, 0.2),
    cleanTimer: 0,
    walkCycle: 0
};

let assistantAI = {
    stepTimer: 0,
    currentOrderId: null,
    isAnimatingArm: false,
    armTimer: 0
};

/**
 * Thuê nhân viên mới
 * @param {string} roleId 
 * @param {THREE.Scene} targetScene 
 */
function hireStaff(roleId, targetScene) {
    const meta = STAFF_ROLES[roleId];
    if (!meta) return;

    if (gameState.staff[roleId]) {
        showToast(`ℹ️ Bạn đã tuyển "${meta.name}" rồi!`);
        return;
    }

    if (gameState.money < meta.hireCost) {
        playSoundEffect('error');
        showToast(`⚠️ Không đủ tiền tuyển dụng! Cần ${formatVND(meta.hireCost - gameState.money)}.`);
        return;
    }

    gameState.money -= meta.hireCost;
    gameState.staff[roleId] = true;
    playSoundEffect('cash');
    updateTopStatsUI();

    // Dựng mô hình 3D trong quán
    if (roleId === 'waiter' && typeof buildWaiter3D === 'function') {
        buildWaiter3D(targetScene);
    } else if (roleId === 'barista_assistant' && typeof buildAssistantBarista3D === 'function') {
        buildAssistantBarista3D(targetScene);
    } else if (roleId === 'pastry_chef' && typeof buildPastryChef3D === 'function') {
        buildPastryChef3D(targetScene);
    } else if (roleId === 'greeter_dog' && typeof buildGreeterDog3D === 'function') {
        buildGreeterDog3D(targetScene);
    }

    showToast(`🎉 Chúc mừng! Bạn đã tuyển thành công "${meta.name}" vào làm việc!`);

    if (typeof renderStaffModal === 'function') {
        renderStaffModal();
    }
}

/**
 * Sa thải / dừng hợp đồng nhân viên
 * @param {string} roleId 
 * @param {THREE.Scene} targetScene 
 */
function fireStaff(roleId, targetScene) {
    const meta = STAFF_ROLES[roleId];
    if (!meta) return;

    gameState.staff[roleId] = false;
    if (typeof removeStaff3D === 'function') {
        removeStaff3D(roleId, targetScene);
    }

    playSoundEffect('click');
    showToast(`Đã dừng hợp đồng với "${meta.name}".`);

    if (typeof renderStaffModal === 'function') {
        renderStaffModal();
    }
}

/**
 * Khấu trừ tiền lương nhân viên vào cuối ngày
 */
function processDailyStaffWages() {
    let totalWages = 0;
    Object.keys(STAFF_ROLES).forEach(roleId => {
        if (gameState.staff[roleId]) {
            totalWages += STAFF_ROLES[roleId].dailySalary;
        }
    });

    if (totalWages > 0) {
        gameState.money -= totalWages;
        gameState.dayStats.wagesPaid += totalWages;
        showToast(`💼 Đã trả ${formatVND(totalWages)} tiền lương nhân viên ngày hôm nay.`);
    }
}

/**
 * Vòng lặp AI cập nhật hành vi của nhân viên 3D
 * @param {number} dt 
 * @param {number} elapsed 
 * @param {THREE.Scene} targetScene 
 */
function updateStaffAI(dt, elapsed, targetScene) {
    // 1. AI CỦA BÉ THỎ PHỤC VỤ (WAITER AI)
    if (gameState.staff.waiter && waiterMeshGroup && waiterLimbs) {
        if (waiterAI.state === 'IDLE') {
            // Đứng thở và nghiêng đầu nhẹ nhàng
            waiterMeshGroup.position.y = Math.abs(Math.sin(elapsed * 2.2)) * 0.02;
            if (waiterLimbs.headGroup) {
                waiterLimbs.headGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.04;
            }

            // Quét tìm bàn bẩn cần dọn
            if (typeof SHOP_SEATS !== 'undefined') {
                const dirtySeat = SHOP_SEATS.find(s => s.isDirty);
                if (dirtySeat) {
                    waiterAI.state = 'WALKING_TO_TABLE';
                    waiterAI.targetSeat = dirtySeat;
                }
            }
        } else if (waiterAI.state === 'WALKING_TO_TABLE') {
            const currentPos = waiterMeshGroup.position;
            const targetPos = waiterAI.targetSeat.pos;
            const dir = new THREE.Vector3().subVectors(targetPos, currentPos);
            const dist = dir.length();

            if (dist > 0.15) {
                dir.normalize();
                currentPos.addScaledVector(dir, 2.8 * dt);
                waiterMeshGroup.rotation.y = Math.atan2(dir.x, dir.z);

                waiterAI.walkCycle += dt * 15;
                const swing = Math.sin(waiterAI.walkCycle);
                if (waiterLimbs.leftLeg && waiterLimbs.rightLeg) {
                    waiterLimbs.leftLeg.rotation.x = swing * 0.55;
                    waiterLimbs.rightLeg.rotation.x = -swing * 0.55;
                }
                if (waiterLimbs.leftArm) waiterLimbs.leftArm.rotation.x = -swing * 0.45;
                waiterMeshGroup.position.y = Math.abs(Math.sin(waiterAI.walkCycle)) * 0.06;
            } else {
                // Đến nơi: bắt đầu lau dọn
                waiterAI.state = 'CLEANING';
                waiterAI.cleanTimer = 1.2; // Dọn trong 1.2s
                if (waiterLimbs.leftLeg && waiterLimbs.rightLeg) {
                    waiterLimbs.leftLeg.rotation.x = 0;
                    waiterLimbs.rightLeg.rotation.x = 0;
                }
            }
        } else if (waiterAI.state === 'CLEANING') {
            waiterAI.cleanTimer -= dt;
            // Động tác vung tay lau dọn
            if (waiterLimbs.leftArm) {
                waiterLimbs.leftArm.rotation.x = -0.5 + Math.sin(elapsed * 12) * 0.3;
            }

            if (waiterAI.cleanTimer <= 0) {
                // Hoàn tất lau dọn bàn!
                if (typeof cleanTableSeat === 'function' && waiterAI.targetSeat) {
                    cleanTableSeat(waiterAI.targetSeat, targetScene, true);
                }
                waiterAI.targetSeat = null;
                waiterAI.state = 'RETURNING';
            }
        } else if (waiterAI.state === 'RETURNING') {
            const currentPos = waiterMeshGroup.position;
            const targetPos = waiterAI.restPos;
            const dir = new THREE.Vector3().subVectors(targetPos, currentPos);
            const dist = dir.length();

            if (dist > 0.1) {
                dir.normalize();
                currentPos.addScaledVector(dir, 2.8 * dt);
                waiterMeshGroup.rotation.y = Math.atan2(dir.x, dir.z);

                waiterAI.walkCycle += dt * 15;
                const swing = Math.sin(waiterAI.walkCycle);
                if (waiterLimbs.leftLeg && waiterLimbs.rightLeg) {
                    waiterLimbs.leftLeg.rotation.x = swing * 0.55;
                    waiterLimbs.rightLeg.rotation.x = -swing * 0.55;
                }
                if (waiterLimbs.leftArm) waiterLimbs.leftArm.rotation.x = -swing * 0.45;
                waiterMeshGroup.position.y = Math.abs(Math.sin(waiterAI.walkCycle)) * 0.06;
            } else {
                waiterAI.state = 'IDLE';
                waiterMeshGroup.rotation.y = Math.PI / 4;
                if (waiterLimbs.leftLeg && waiterLimbs.rightLeg) {
                    waiterLimbs.leftLeg.rotation.x = 0;
                    waiterLimbs.rightLeg.rotation.x = 0;
                }
            }
        }
    }

    // 2. AI CỦA BÉ GẤU PHỤ QUẦY (BARISTA ASSISTANT AI)
    if (gameState.staff.barista_assistant && assistantBaristaMeshGroup && assistantBaristaLimbs) {
        // Nhịp thở
        assistantBaristaMeshGroup.position.y = Math.abs(Math.sin(elapsed * 2.5)) * 0.02;

        // Hoạt ảnh cử động tay pha chế
        if (assistantAI.isAnimatingArm) {
            assistantAI.armTimer -= dt;
            if (assistantBaristaLimbs.rightArm) {
                assistantBaristaLimbs.rightArm.rotation.x = -1.1 + Math.sin(elapsed * 12) * 0.2;
            }
            if (assistantAI.armTimer <= 0) {
                assistantAI.isAnimatingArm = false;
                if (assistantBaristaLimbs.rightArm) {
                    assistantBaristaLimbs.rightArm.rotation.x = 0;
                }
            }
        }

        // Tự động làm trọn gói đơn hàng cho khách khi khách đang gọi món tại quầy
        if (gameState.phase === 'ORDERING' && gameState.currentOrder) {
            const order = gameState.currentOrder;

            // Nếu là đơn hàng mới, đợi 0.9s sau khi khách gọi món rồi bắt đầu làm
            if (assistantAI.currentOrderId !== order.id) {
                assistantAI.currentOrderId = order.id;
                assistantAI.stepTimer = 0.9;
            } else {
                assistantAI.stepTimer -= dt;

                if (assistantAI.stepTimer <= 0) {
                    // Bước 1: Rót cốt trà nếu chưa rót
                    if (!gameState.cup.teaId) {
                        assistantAI.isAnimatingArm = true;
                        assistantAI.armTimer = 0.5;
                        assistantAI.stepTimer = 0.7;

                        if (typeof selectBaseTea === 'function') {
                            selectBaseTea(order.teaId);
                            showToast(`🐻 Bé Gấu: Tự động rót ${TEA_MENU[order.teaId].name}!`);
                        }
                        return;
                    }

                    // Bước 2: Thêm từng topping còn thiếu
                    const missingToppings = order.toppings.filter(t => !gameState.cup.toppings.has(t));
                    if (missingToppings.length > 0) {
                        const nextTop = missingToppings[0];
                        assistantAI.isAnimatingArm = true;
                        assistantAI.armTimer = 0.4;
                        assistantAI.stepTimer = 0.6;

                        if (typeof toggleTopping === 'function') {
                            toggleTopping(nextTop);
                            showToast(`🐻 Bé Gấu: Thêm topping ${TOPPING_MENU[nextTop].name}!`);
                        }
                        return;
                    }

                    // Bước 2.5: Lấy bánh ngọt nếu khách có gọi kèm
                    if (order.pastryId && gameState.cup.pastryId !== order.pastryId) {
                        if (!gameState.staff.pastry_chef) {
                            assistantAI.isAnimatingArm = true;
                            assistantAI.armTimer = 0.4;
                            assistantAI.stepTimer = 0.6;
                            if (typeof selectPastry === 'function') {
                                selectPastry(order.pastryId);
                                const pName = (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[order.pastryId]) ? PASTRY_MENU[order.pastryId].name : 'bánh ngọt';
                                showToast(`🐻 Bé Gấu: Lấy kèm bánh ${pName} cho khách!`);
                            }
                            return;
                        }
                    }

                    // Bước 3: Dập nắp hoàn tất đơn hàng
                    const pastryReady = !order.pastryId || (gameState.cup.pastryId === order.pastryId);
                    if (gameState.cup.teaId === order.teaId && 
                        missingToppings.length === 0 && 
                        pastryReady &&
                        !gameState.cup.isSealed) {
                        assistantAI.isAnimatingArm = true;
                        assistantAI.armTimer = 0.6;
                        assistantAI.stepTimer = 8.0; // Đợi đơn khách tiếp theo

                        if (typeof finishAndServeDrink === 'function') {
                            showToast(`🐻 Bé Gấu: Đã hoàn tất 100% đơn hàng cho ${order.customer.name}! 🎉`);
                            finishAndServeDrink();
                        }
                    }
                }
            }
        } else {
            assistantAI.currentOrderId = null;
            assistantAI.stepTimer = 0;
        }
    }

    // 3. AI CỦA BÉ MÈO BẾP BÁNH (PASTRY CHEF AI)
    if (gameState.staff.pastry_chef && pastryChefMeshGroup) {
        pastryChefMeshGroup.position.y = Math.abs(Math.sin(elapsed * 2.2)) * 0.02;
        if (pastryChefLimbs && pastryChefLimbs.headGroup) {
            pastryChefLimbs.headGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.12;
        }

        // Tự động lấy bánh phục vụ khi khách gọi món
        if (gameState.phase === 'ORDERING' && gameState.currentOrder && gameState.currentOrder.pastryId) {
            const order = gameState.currentOrder;
            if (gameState.cup.pastryId !== order.pastryId) {
                if (pastryChefLimbs && pastryChefLimbs.rightArm) {
                    pastryChefLimbs.rightArm.rotation.x = -1.0 + Math.sin(elapsed * 10) * 0.2;
                }

                if (typeof selectPastry === 'function') {
                    selectPastry(order.pastryId);
                    const pName = (typeof PASTRY_MENU !== 'undefined' && PASTRY_MENU[order.pastryId]) ? PASTRY_MENU[order.pastryId].name : 'Bánh ngọt';
                    showToast(`🐱 Bé Mèo: Đã chuẩn bị bánh ${pName} thơm phức cho khách! 🥐`);
                }
            }
        } else if (pastryChefLimbs && pastryChefLimbs.rightArm) {
            pastryChefLimbs.rightArm.rotation.x = Math.sin(elapsed * 2) * 0.1;
        }
    }

    // 4. AI CỦA BÉ CÚN TIẾP TÂN & BẢO VỆ (GREETER DOG AI)
    if (gameState.staff.greeter_dog && greeterDogMeshGroup) {
        greeterDogMeshGroup.position.y = Math.abs(Math.sin(elapsed * 2.4)) * 0.02;

        // Vẫy đuôi liên tục mừng rỡ
        if (greeterDogTail) {
            greeterDogTail.rotation.z = Math.sin(elapsed * 9) * 0.45;
        }

        if (greeterDogLimbs && greeterDogLimbs.headGroup) {
            greeterDogLimbs.headGroup.rotation.z = Math.sin(elapsed * 1.8) * 0.06;
        }

        // Vẫy tay chào khi khách bước vào quán
        if (gameState.phase === 'WALKING_IN') {
            if (greeterDogLimbs && greeterDogLimbs.rightArm) {
                greeterDogLimbs.rightArm.rotation.x = -1.2 + Math.sin(elapsed * 12) * 0.35;
            }
        } else if (greeterDogLimbs && greeterDogLimbs.rightArm) {
            greeterDogLimbs.rightArm.rotation.x = 0;
        }
    }
}
