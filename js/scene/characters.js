/* ============================================================================
 * NHÂN VẬT 3D: BARISTA & KHÁCH HÀNG (3D CHARACTERS)
 * Tạo hình nhân vật dạng Chibi/Pastel và xử lý hoạt ảnh di chuyển, lắc đầu.
 * ============================================================================ */

let baristaGroup = null;
let customerGroup = null;
let customerHandCup = null;

// Quản lý animation của khách hàng
const customerAnim = {
    active: false,
    targetPos: new THREE.Vector3(0, 0, 2.2),
    speed: 3.4,
    walkCycle: 0,
    shakeTimer: 0
};

/**
 * Tạo mô hình người Chibi dễ thương (Torso, Head, Hair, Eyes, Cheeks)
 */
function createCuteHumanoid(shirtColor, hairColor, hasApron = false) {
    const charGroup = new THREE.Group();

    // Thân trên (Torso)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.34, 0.85, 16),
        new THREE.MeshLambertMaterial({ color: shirtColor })
    );
    body.position.y = 0.75;
    body.castShadow = true;
    charGroup.add(body);

    // Tạp dề cho nhân viên pha chế
    if (hasApron) {
        const apron = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.65, 0.22),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        apron.position.set(0, 0.72, 0.22);
        charGroup.add(apron);
    }

    // Đầu (Head)
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 18, 16),
        new THREE.MeshLambertMaterial({ color: 0xffedd5 })
    );
    head.position.y = 1.48;
    head.castShadow = true;
    charGroup.add(head);

    // Tóc (Hair Cap)
    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
        new THREE.MeshLambertMaterial({ color: hairColor })
    );
    hair.position.y = 1.50;
    hair.rotation.x = -0.15;
    charGroup.add(hair);

    // Đôi mắt tròn xoe
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    [-0.12, 0.12].forEach(x => {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(x, 1.48, 0.31);
        charGroup.add(eye);
    });

    // Má hồng baby (Rosy Cheeks)
    const cheekGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
    [-0.19, 0.19].forEach(x => {
        const cheek = new THREE.Mesh(cheekGeo, cheekMat);
        cheek.position.set(x, 1.41, 0.29);
        charGroup.add(cheek);
    });

    return { group: charGroup, bodyMesh: body, hairMesh: hair };
}

function buildBaristaCharacter(targetScene) {
    const barista = createCuteHumanoid(0xf472b6, 0x451a03, true);
    baristaGroup = barista.group;
    baristaGroup.position.set(-0.4, 0, -1.9);
    targetScene.add(baristaGroup);
    return baristaGroup;
}

function buildCustomerCharacter(targetScene) {
    const cust = createCuteHumanoid(0x7dd3fc, 0x27272a, false);
    customerGroup = cust.group;
    customerGroup.userData.bodyMesh = cust.bodyMesh;
    customerGroup.userData.hairMesh = cust.hairMesh;

    // Ly trà sữa mini cầm trên tay khách sau khi thanh toán xong
    const miniCup = new THREE.Group();
    const cBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.1, 0.35, 12),
        new THREE.MeshLambertMaterial({ color: 0xd2a679 })
    );
    const cLid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    cLid.position.y = 0.18;
    const cStraw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    cStraw.position.y = 0.25;
    miniCup.add(cBody, cLid, cStraw);
    miniCup.position.set(0.32, 0.95, 0.32);
    miniCup.visible = false;
    customerGroup.add(miniCup);
    customerHandCup = cBody;
    customerGroup.userData.miniCupGroup = miniCup;

    // Vị trí xuất phát bên ngoài cửa
    customerGroup.position.set(-6.5, 0, 2.2);
    customerGroup.visible = false;
    targetScene.add(customerGroup);

    return customerGroup;
}

/**
 * Hoạt ảnh nhún nhảy, lắc lư nhẹ nhàng của nhân viên pha chế
 */
function animateBarista(elapsed) {
    if (!baristaGroup) return;
    baristaGroup.position.y = Math.abs(Math.sin(elapsed * 2.5)) * 0.05;
    baristaGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.15;
}

/**
 * Hoạt ảnh bước đi, nhảy chân sáo và lắc đầu của khách hàng
 */
function animateCustomer(dt, elapsed, onArrivedAtCounter, onLeftShop) {
    if (!customerGroup || !customerGroup.visible) return;

    if (customerAnim.active) {
        const currentPos = customerGroup.position;
        const dir = new THREE.Vector3().subVectors(customerAnim.targetPos, currentPos);
        const dist = dir.length();

        if (dist > 0.08) {
            dir.normalize();
            currentPos.addScaledVector(dir, customerAnim.speed * dt);
            customerGroup.rotation.y = Math.atan2(dir.x, dir.z);

            // Bước đi nhún nhảy cute
            customerAnim.walkCycle += dt * 14;
            customerGroup.position.y = Math.abs(Math.sin(customerAnim.walkCycle)) * 0.14;
        } else {
            customerGroup.position.copy(customerAnim.targetPos);
            customerGroup.position.y = 0;
            customerAnim.active = false;

            if (gameState.phase === 'WALKING_IN') {
                if (typeof onArrivedAtCounter === 'function') onArrivedAtCounter();
            } else if (gameState.phase === 'WALKING_OUT') {
                if (typeof onLeftShop === 'function') onLeftShop();
            }
        }
    } else if (customerAnim.shakeTimer > 0) {
        // Lắc đầu khi người chơi pha sai món
        customerAnim.shakeTimer -= dt;
        customerGroup.rotation.y = Math.PI + Math.sin(elapsed * 32) * 0.45;
        if (customerAnim.shakeTimer <= 0) {
            customerGroup.rotation.y = Math.PI;
        }
    }
}
