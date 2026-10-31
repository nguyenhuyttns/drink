/* ============================================================================
 * HỆ THỐNG NHÂN VẬT 3D CHIBI ANIME ĐỈNH CAO (FULL ARTICULATED 3D CHIBI ENGINE)
 * Kết hợp hoàn hảo:
 * 1. Khối người 3D đầy đặn: Đầy đủ đầu, thân, 2 tay, 2 chân bước đi thật 100%.
 * 2. Cử động chân bước nhịp nhàng (Leg Swing) & vung tay tự nhiên (Arm Swing).
 * 3. Vẽ gương mặt Anime Chibi sắc nét bằng Canvas Texture: Mắt long lanh có 2 đốm sáng
 *    phản chiếu, má hồng đào, khóe môi cười ngọt ngào như hình mẫu tham khảo.
 * 4. Tóc uốn sóng bồng bềnh nhiều tầng, trang phục công sở (sơ mi, cà vạt đỏ, váy bút chì).
 * 5. Tối ưu hiệu năng 60 FPS, chạy bằng code thuần 100%, 0 lag, không sợ lỗi tải ảnh!
 * ============================================================================ */

let baristaGroup = null;
let customerGroup = null;
let customerHandCup = null;

// Quản lý hoạt ảnh di chuyển của khách
const customerAnim = {
    active: false,
    targetPos: new THREE.Vector3(0, 0, 2.2),
    speed: 3.4,
    walkCycle: 0,
    shakeTimer: 0
};

// Lưu trữ các khớp xương để animate
let baristaLimbs = { head: null, leftArm: null, rightArm: null };
let customerLimbs = { head: null, leftLeg: null, rightLeg: null, leftArm: null, rightArm: null, rootGroup: null };

/* ============================================================================
 * 1. TRÌNH TẠO KHUÔN MẶT ANIME CHIBI (CANVAS TEXTURE GENERATOR)
 * ============================================================================ */

function createAnimeFaceCanvasTexture(options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Nền trong suốt để hòa hợp hoàn hảo với khối đầu 3D
    ctx.clearRect(0, 0, 512, 512);

    const isElderly = options.ageGroup === 'senior';
    const isChild = options.ageGroup === 'child';

    // 1. ĐÔI MẮT ANIME TO TRÒN LONG LANH (LEFT & RIGHT EYES)
    const eyeY = isChild ? 260 : 245;
    const eyeRadiusX = isChild ? 44 : 40;
    const eyeRadiusY = isChild ? 56 : 52;
    const leftEyeX = 185;
    const rightEyeX = 327;

    function drawEye(cx, isLeft) {
        // a. Lòng trắng mắt (Sclera)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // b. Tròng mắt nâu ấm áp (Iris Gradient)
        const irisGrad = ctx.createLinearGradient(cx, eyeY - eyeRadiusY, cx, eyeY + eyeRadiusY);
        irisGrad.addColorStop(0, '#2b1408'); // Nâu cà phê đậm phía trên
        irisGrad.addColorStop(0.5, '#4a2412');
        irisGrad.addColorStop(1, '#7a3e1d'); // Nâu hổ phách ấm phía dưới

        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.ellipse(cx, eyeY + 2, eyeRadiusX - 4, eyeRadiusY - 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // c. Con ngươi sâu thẳm (Pupil)
        ctx.fillStyle = '#140803';
        ctx.beginPath();
        ctx.ellipse(cx, eyeY + 4, eyeRadiusX * 0.45, eyeRadiusY * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();

        // d. Đốm sáng phản chiếu chính (Big Sparkle Highlight - Góc trên ngoài)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const sparkOffset = isLeft ? 12 : -12;
        ctx.arc(cx + sparkOffset, eyeY - 18, 14, 0, Math.PI * 2);
        ctx.fill();

        // e. Đốm sáng phụ (Small Specular Reflection - Góc dưới trong)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(cx - sparkOffset * 0.8, eyeY + 20, 8, 0, Math.PI * 2);
        ctx.fill();

        // f. Viền mi trên sắc nét (Curved Upper Eyelash Wing)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, eyeY + 8, eyeRadiusX + 5, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Đuôi mi vểnh nhẹ nữ tính
        ctx.beginPath();
        const wingDir = isLeft ? -1 : 1;
        ctx.moveTo(cx + wingDir * (eyeRadiusX + 4), eyeY - 8);
        ctx.quadraticCurveTo(cx + wingDir * (eyeRadiusX + 16), eyeY - 14, cx + wingDir * (eyeRadiusX + 18), eyeY - 6);
        ctx.stroke();
    }

    drawEye(leftEyeX, true);
    drawEye(rightEyeX, false);

    // 2. LÔNG MÀY THANH TÚ (EYEBROWS)
    ctx.strokeStyle = options.hairColorHex || '#4a2a1b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Lông mày trái
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 40, eyeY - 58);
    ctx.quadraticCurveTo(leftEyeX - 10, eyeY - 76, leftEyeX + 35, eyeY - 62);
    ctx.stroke();

    // Lông mày phải
    ctx.beginPath();
    ctx.moveTo(rightEyeX - 35, eyeY - 62);
    ctx.quadraticCurveTo(rightEyeX + 10, eyeY - 76, rightEyeX + 40, eyeY - 58);
    ctx.stroke();

    // 3. MÁ HỒNG PHẤN BABY (AIRBRUSHED ROSY CHEEKS)
    function drawBlush(cx) {
        const grad = ctx.createRadialGradient(cx, eyeY + 54, 5, cx, eyeY + 54, 42);
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.75)');
        grad.addColorStop(0.6, 'rgba(251, 146, 60, 0.35)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, eyeY + 54, 42, 0, Math.PI * 2);
        ctx.fill();
    }
    drawBlush(leftEyeX - 25);
    drawBlush(rightEyeX + 25);

    // 4. CHIẾC MŨI NHỎ XINH (BUTTON NOSE)
    ctx.fillStyle = 'rgba(217, 119, 90, 0.65)';
    ctx.beginPath();
    ctx.ellipse(256, eyeY + 48, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. ĐÔI MÔI CƯỜI MỈM NGỌT NGÀO (SWEET SMILE)
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(256, eyeY + 68, 22, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Nụ cười hé răng xinh (cho trẻ em)
    if (isChild) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(256, eyeY + 69, 18, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(248, eyeY + 80, 16, 6);
    }

    // 6. PHỤ KIỆN: KÍNH MẮT (Dành cho Cụ bà hoặc chuyên viên)
    if (options.hasGlasses) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, eyeRadiusY + 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, eyeRadiusY + 8, 0, Math.PI * 2);
        ctx.stroke();

        // Cầu kính ở giữa
        ctx.beginPath();
        ctx.moveTo(leftEyeX + eyeRadiusY + 8, eyeY - 6);
        ctx.quadraticCurveTo(256, eyeY - 16, rightEyeX - eyeRadiusY - 8, eyeY - 6);
        ctx.stroke();
    }

    // 7. PHỤ KIỆN: RIA MÉP (Bác Ba Phúc)
    if (options.hasMustache) {
        ctx.fillStyle = '#4b5563';
        // Râu trái
        ctx.beginPath();
        ctx.ellipse(235, eyeY + 62, 22, 9, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Râu phải
        ctx.beginPath();
        ctx.ellipse(277, eyeY + 62, 22, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
}

/* ============================================================================
 * 2. CÁC KIỂU MÁI TÓC 3D ĐA TẦNG (LAYERED 3D ANIME HAIR)
 * ============================================================================ */

function buildLayeredAnimeHair(style, hairColor) {
    const hairContainer = new THREE.Group();
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });

    // Khối tóc vòm ôm đầu
    const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
        hairMat
    );
    hairCap.position.set(0, 0.04, -0.04);
    hairCap.rotation.x = -0.22;
    hairCap.castShadow = true;
    hairContainer.add(hairCap);

    switch (style) {
        // Kiểu 1: MÁI TÓC UỐN LƯỢN BỒNG BỀNH CÔNG SỞ (Office Wavy - CHUẨN 100% ẢNH MẪU!)
        case 'office_wavy': {
            // Tóc mái rẽ ngôi duyên dáng
            [-0.18, -0.06, 0.08, 0.20].forEach((x, i) => {
                const bang = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 10), hairMat);
                bang.scale.set(1.2, 1.0, 0.5);
                bang.position.set(x, 0.24, 0.36 - Math.abs(x) * 0.2);
                bang.rotation.z = x * -0.65;
                bang.rotation.x = -0.42;
                hairContainer.add(bang);
            });

            // Hai lọn tóc mai uốn sóng bồng bềnh ngang vai (Wavy Curls)
            [-0.38, 0.38].forEach((x, idx) => {
                const curlGroup = new THREE.Group();
                curlGroup.position.set(x, 0.06, 0.1);

                const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.42, 12), hairMat);
                strand.position.y = -0.15;
                strand.rotation.z = idx === 0 ? 0.25 : -0.25;
                curlGroup.add(strand);

                const flare = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 12), hairMat);
                flare.position.set(idx === 0 ? -0.06 : 0.06, -0.36, 0.04);
                flare.rotation.z = idx === 0 ? 0.5 : -0.5;
                flare.rotation.x = 0.2;
                curlGroup.add(flare);

                hairContainer.add(curlGroup);
            });

            // Tóc dày phía sau gáy
            const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.46, 0.25), hairMat);
            backHair.position.set(0, -0.18, -0.26);
            hairContainer.add(backHair);
            break;
        }

        // Kiểu 2: HAI BÍM TÓC NƠ ĐỎ ĐÁNG YÊU (Bé Dâu Tây)
        case 'twintails': {
            // Mái ngố ngang trán
            [-0.2, -0.1, 0, 0.1, 0.2].forEach(x => {
                const bang = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.18, 0.05), hairMat);
                bang.position.set(x, 0.22, 0.36);
                bang.rotation.x = -0.3;
                hairContainer.add(bang);
            });

            // Búi tóc hai bên có nơ dâu tây
            const puffGeo = new THREE.SphereGeometry(0.16, 14, 12);
            const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
            const ribbonGeo = new THREE.TorusGeometry(0.075, 0.024, 8, 14);

            [-0.42, 0.42].forEach(x => {
                const puff = new THREE.Mesh(puffGeo, hairMat);
                puff.position.set(x, 0.24, -0.08);
                hairContainer.add(puff);

                const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
                ribbon.position.set(x, 0.24, -0.02);
                ribbon.rotation.y = Math.PI / 2;
                hairContainer.add(ribbon);
            });
            break;
        }

        // Kiểu 3: TÓC NAM ANIME TỈA LỚP (Minh Khôi)
        case 'boy_anime': {
            [-0.22, -0.08, 0.08, 0.22].forEach((x, i) => {
                const lock = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.26, 8), hairMat);
                lock.position.set(x, 0.26, 0.35);
                lock.rotation.z = (i % 2 === 0 ? 0.3 : -0.3) - x * 0.5;
                lock.rotation.x = -0.35;
                hairContainer.add(lock);
            });
            break;
        }

        // Kiểu 4: TÓC BẠC BÚI CÓ TRÂM NGỌC (Bà Cụ Tư)
        case 'grandma_bun': {
            const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), hairMat);
            bunMesh.position.set(0, 0.16, -0.44);
            hairContainer.add(bunMesh);

            const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
            pinMesh.position.set(0, 0.16, -0.44);
            pinMesh.rotation.z = Math.PI / 4;
            hairContainer.add(pinMesh);
            break;
        }

        // Kiểu 5: TÓC RẼ NGÔI CHỮNG CHẠC (Bác Ba Phúc)
        case 'gentleman_part': {
            const sideSlick = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.3), hairMat);
            sideSlick.position.set(0.08, 0.32, 0.2);
            sideSlick.rotation.z = -0.15;
            hairContainer.add(sideSlick);
            break;
        }

        // Mặc định: Mũ nồi Beret Barista sang trọng
        default: {
            const beretGroup = new THREE.Group();
            beretGroup.position.set(0.04, 0.45, -0.02);
            beretGroup.rotation.z = -0.2;
            beretGroup.rotation.x = -0.08;

            const beretMat = new THREE.MeshLambertMaterial({ color: 0xdb2777 });
            const beretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.12, 20), beretMat);
            beretGroup.add(beretBase);

            const beretTop = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), beretMat);
            beretTop.position.y = 0.06;
            beretGroup.add(beretTop);

            const beretStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8), beretMat);
            beretStem.position.y = 0.23;
            beretGroup.add(beretStem);

            hairContainer.add(beretGroup);
            break;
        }
    }

    return hairContainer;
}

/* ============================================================================
 * 3. HÀM TẠO NHÂN VẬT 3D HOÀN CHỈNH CÓ KHỚP BƯỚC ĐI (3D RIGGED CHIBI FIGURE)
 * ============================================================================ */

function createFullyArticulatedChibi(profile) {
    const root = new THREE.Group();

    // 0. BÓNG ĐỔ TRÊN SÀN (Soft Floor Drop Shadow)
    const shadowGeo = new THREE.PlaneGeometry(0.72, 0.44);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    root.add(shadowMesh);

    // 1. ĐÔI CHÂN BƯỚC ĐI THẬT (ARTICULATED LEGS WITH PIVOT JOINTS)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.46, 14);
    const pantsMat = new THREE.MeshLambertMaterial({ color: profile.pantsColor });
    const shoeMat = new THREE.MeshLambertMaterial({ color: profile.shoeColor });
    const soleMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });

    function createLegWithJoint(isLeft = true) {
        // Trục xoay khớp hông đặt ở y = 0.48
        const hipJoint = new THREE.Group();
        hipJoint.position.set(isLeft ? -0.13 : 0.13, 0.48, 0);

        // Cẳng chân / Quần
        const legMesh = new THREE.Mesh(legGeo, pantsMat);
        legMesh.position.y = -0.23;
        legMesh.castShadow = true;
        hipJoint.add(legMesh);

        // Giày chibi tròn xoe
        const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10), shoeMat);
        shoeToe.scale.set(1.0, 0.65, 1.35);
        shoeToe.position.set(0, -0.43, 0.06);
        shoeToe.castShadow = true;
        hipJoint.add(shoeToe);

        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.28), soleMat);
        sole.position.set(0, -0.465, 0.05);
        hipJoint.add(sole);

        return hipJoint;
    }

    const leftLeg = createLegWithJoint(true);
    const rightLeg = createLegWithJoint(false);
    root.add(leftLeg, rightLeg);

    // 2. THÂN MÌNH & TRANG PHỤC (TORSO & OUTFIT)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.54, 0);

    // Hông / Chân váy bút chì
    const isPencilSkirt = profile.hairStyle === 'office_wavy';
    const pelvisGeo = isPencilSkirt
        ? new THREE.CylinderGeometry(0.25, 0.21, 0.32, 18)
        : new THREE.CylinderGeometry(0.24, 0.22, 0.18, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.position.y = isPencilSkirt ? 0.16 : 0.09;
    torsoGroup.add(pelvisMesh);

    // Thắt lưng da & mặt khóa kim loại vàng (Chuẩn hình mẫu cô gái công sở!)
    if (isPencilSkirt) {
        const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.04, 18), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
        beltMesh.position.y = 0.30;
        torsoGroup.add(beltMesh);

        const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.055, 0.02), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        buckleMesh.position.set(0, 0.30, 0.26);
        torsoGroup.add(buckleMesh);
    }

    // Áo sơ mi / Áo len
    const shirtMat = new THREE.MeshLambertMaterial({ color: profile.shirtColor });
    const shirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.25, 0.44, 18), shirtMat);
    shirtMesh.position.y = 0.40;
    shirtMesh.castShadow = true;
    torsoGroup.add(shirtMesh);

    // Cổ áo sơ mi trắng bẻ góc
    const collarMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.032, 10, 20),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    collarMesh.position.set(0, 0.61, 0.02);
    collarMesh.rotation.x = Math.PI / 2;
    torsoGroup.add(collarMesh);

    // Cà vạt đỏ thắm (Red Necktie) - Điểm nhấn rực rỡ chuẩn ảnh mẫu!
    if (profile.hasNecktie) {
        const tieMat = new THREE.MeshLambertMaterial({ color: profile.tieColor || 0xdc2626 });

        const knot = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.065, 8), tieMat);
        knot.position.set(0, 0.56, 0.21);
        knot.rotation.x = Math.PI;
        torsoGroup.add(knot);

        const tieStrip = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.28, 0.02), tieMat);
        tieStrip.position.set(0, 0.40, 0.22);
        torsoGroup.add(tieStrip);
    }

    // Tạp dề Barista
    if (profile.isBarista) {
        const apronMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const apChest = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.05), apronMat);
        apChest.position.set(0, 0.40, 0.18);
        torsoGroup.add(apChest);

        const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.03), new THREE.MeshLambertMaterial({ color: 0xfce7f3 }));
        pocket.position.set(0, 0.28, 0.21);
        torsoGroup.add(pocket);

        const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
        badge.position.set(0, 0.46, 0.21);
        badge.rotation.x = Math.PI / 2;
        torsoGroup.add(badge);
    }

    root.add(torsoGroup);

    // 3. ĐÔI CÁNH TAY VUNG NHỊP NHÀNG (ARTICULATED ARMS WITH SHOULDER JOINTS)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.32, 12);
    const handGeo = new THREE.SphereGeometry(0.06, 12, 10);
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdfd0 });

    function createArmWithJoint(isLeft = true) {
        // Khớp vai đặt ở y = 0.98
        const shoulderJoint = new THREE.Group();
        shoulderJoint.position.set(isLeft ? -0.27 : 0.27, 0.98, 0);

        const sleeve = new THREE.Mesh(armGeo, shirtMat);
        sleeve.position.y = -0.16;
        sleeve.rotation.z = isLeft ? 0.18 : -0.18;
        sleeve.castShadow = true;
        shoulderJoint.add(sleeve);

        const hand = new THREE.Mesh(handGeo, skinMat);
        hand.position.set(isLeft ? -0.05 : 0.05, -0.34, 0.03);
        shoulderJoint.add(hand);

        return shoulderJoint;
    }

    const leftArm = createArmWithJoint(true);
    const rightArm = createArmWithJoint(false);
    root.add(leftArm, rightArm);

    // 4. ĐẦU 3D & GƯƠNG MẶT ANIME CHIBI LONG LANH
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.50, 0);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.16, 14), skinMat);
    neckMesh.position.y = -0.36;
    headGroup.add(neckMesh);

    // Khối đầu tròn trĩnh, má bầu bĩnh
    const headGeo = new THREE.SphereGeometry(0.40, 22, 18);
    headGeo.scale(1.06, 0.96, 1.02);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Đôi tai & Hoa tai ngọc trai
    const earGeo = new THREE.SphereGeometry(0.06, 10, 8);
    earGeo.scale(0.55, 1.0, 0.8);
    [-0.43, 0.43].forEach((x) => {
        const ear = new THREE.Mesh(earGeo, skinMat);
        ear.position.set(x, 0, 0.02);
        headGroup.add(ear);

        if (profile.hasEarrings) {
            const pearl = new THREE.Mesh(
                new THREE.SphereGeometry(0.024, 10, 8),
                new THREE.MeshLambertMaterial({ color: 0xffffff })
            );
            pearl.position.set(x > 0 ? x + 0.02 : x - 0.02, -0.05, 0.02);
            headGroup.add(pearl);
        }
    });

    // MẶT ANIME VẼ BẰNG CANVAS TEXTURE SẮC NÉT (Mắt long lanh, má hồng, môi cười)
    const faceTex = createAnimeFaceCanvasTexture({
        ageGroup: profile.ageGroup,
        hairColorHex: '#' + (profile.hairColor || 0x4a2a1b).toString(16).padStart(6, '0'),
        hasGlasses: profile.hasGlasses,
        hasMustache: profile.hasMustache
    });

    const faceOverlay = new THREE.Mesh(
        new THREE.PlaneGeometry(0.58, 0.58),
        new THREE.MeshBasicMaterial({
            map: faceTex,
            transparent: true,
            alphaTest: 0.04,
            side: THREE.DoubleSide
        })
    );
    faceOverlay.position.set(0, 0, 0.412);
    headGroup.add(faceOverlay);

    // Mái tóc 3D bồng bềnh
    const hairModel = buildLayeredAnimeHair(profile.hairStyle, profile.hairColor);
    headGroup.add(hairModel);

    root.add(headGroup);

    // Tỷ lệ cơ thể theo lứa tuổi
    const sc = profile.scale || 1.0;
    root.scale.set(sc, sc, sc);

    return {
        root,
        headGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm
    };
}

/* ============================================================================
 * 4. KHỞI TẠO BARISTA & KHÁCH HÀNG
 * ============================================================================ */

function buildBaristaCharacter(targetScene) {
    const barista = createFullyArticulatedChibi({
        shirtColor: 0xffffff,
        pantsColor: 0x334155,
        shoeColor: 0x1e293b,
        hairColor: 0x3e2723,
        hairStyle: 'barista_beret',
        isBarista: true,
        hasNecktie: true,
        tieColor: 0xdb2777,
        hasEarrings: true,
        scale: 1.05
    });

    baristaGroup = barista.root;
    baristaGroup.position.set(-0.4, 0.22, -1.9);

    // Bục gỗ đứng phía sau quầy cho barista
    const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.22, 1.2),
        new THREE.MeshLambertMaterial({ color: 0xfbcfe8 })
    );
    stepMesh.position.set(-0.4, 0.11, -1.9);
    targetScene.add(stepMesh);

    // Tư thế tay barista: hơi hướng về phía mặt quầy
    barista.leftArm.rotation.x = -0.75;
    barista.leftArm.rotation.z = 0.25;
    barista.rightArm.rotation.x = -0.75;
    barista.rightArm.rotation.z = -0.25;

    baristaLimbs = {
        head: barista.headGroup,
        leftArm: barista.leftArm,
        rightArm: barista.rightArm
    };

    targetScene.add(baristaGroup);
    return baristaGroup;
}

function buildCustomerCharacter(targetScene) {
    customerGroup = new THREE.Group();
    customerGroup.position.set(-6.5, 0, 2.2);
    customerGroup.visible = false;

    // Ly trà sữa mini cầm trên tay sau khi thanh toán
    const miniCup = new THREE.Group();
    const cBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.065, 0.24, 14),
        new THREE.MeshLambertMaterial({ color: 0xd2a679 })
    );
    const cLid = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.03, 14), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cLid.position.y = 0.12;
    const cStraw = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 8), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    cStraw.position.y = 0.18;
    miniCup.add(cBody, cLid, cStraw);
    miniCup.visible = false;

    customerHandCup = cBody;
    customerGroup.userData = {
        miniCupGroup: miniCup,
        currentFigure: null
    };

    targetScene.add(customerGroup);

    // Dựng sẵn khách hàng đầu tiên
    if (typeof CUSTOMER_PROFILES !== 'undefined' && CUSTOMER_PROFILES.length > 0) {
        updateCustomerProfile3D(CUSTOMER_PROFILES[0]);
    }

    return customerGroup;
}

/**
 * Cập nhật trọn vẹn ngoại hình Chibi Anime 3D theo profile lứa tuổi
 */
function updateCustomerProfile3D(profile) {
    if (!customerGroup || !profile) return;

    // Xóa figure cũ
    if (customerGroup.userData && customerGroup.userData.currentFigure) {
        customerGroup.remove(customerGroup.userData.currentFigure);
        customerGroup.userData.currentFigure = null;
    }

    // Dựng figure 3D hoàn chỉnh mới
    const fig = createFullyArticulatedChibi(profile);
    customerGroup.add(fig.root);
    customerGroup.userData.currentFigure = fig.root;

    // Gắn ly trà sữa mini vào tay phải figure
    if (customerGroup.userData.miniCupGroup) {
        customerGroup.userData.miniCupGroup.visible = false;
        fig.rightArm.add(customerGroup.userData.miniCupGroup);
        customerGroup.userData.miniCupGroup.position.set(0.05, -0.34, 0.12);
        customerGroup.userData.miniCupGroup.rotation.x = 0.7;
    }

    customerLimbs = {
        head: fig.headGroup,
        leftLeg: fig.leftLeg,
        rightLeg: fig.rightLeg,
        leftArm: fig.leftArm,
        rightArm: fig.rightArm,
        rootGroup: fig.root
    };
}

/* ============================================================================
 * 5. HOẠT ẢNH BƯỚC CHÂN VÀ VUNG TAY 3D CHÂN THẬT
 * ============================================================================ */

function animateBarista(elapsed) {
    if (!baristaGroup) return;

    // Nhịp thở nhè nhẹ của Barista
    baristaGroup.position.y = 0.22 + Math.abs(Math.sin(elapsed * 2.2)) * 0.03;

    if (baristaLimbs.head) {
        baristaLimbs.head.rotation.y = Math.sin(elapsed * 1.2) * 0.1;
        baristaLimbs.head.rotation.z = Math.sin(elapsed * 0.8) * 0.03;
    }
}

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

            // Chu kỳ bước chân
            customerAnim.walkCycle += dt * 15;
            const swing = Math.sin(customerAnim.walkCycle);

            // 1. CỬ ĐỘNG ĐÁNH CHÂN THẬT (LEG SWING: CHÂN TRÁI VÀ PHẢI LUÂN PHIÊN BƯỚC LÊN)
            if (customerLimbs.leftLeg && customerLimbs.rightLeg) {
                customerLimbs.leftLeg.rotation.x = swing * 0.55;
                customerLimbs.rightLeg.rotation.x = -swing * 0.55;
            }

            // 2. CỬ ĐỘNG ĐÁNH TAY THẬT (ARM SWING: VUNG TAY NGƯỢC CHIỀU CHÂN)
            if (customerLimbs.leftArm && customerLimbs.rightArm) {
                customerLimbs.leftArm.rotation.x = -swing * 0.45;
                if (customerGroup.userData.miniCupGroup && customerGroup.userData.miniCupGroup.visible) {
                    customerLimbs.rightArm.rotation.x = -0.7; // Giơ tay cầm ly
                } else {
                    customerLimbs.rightArm.rotation.x = swing * 0.45;
                }
            }

            // 3. Toàn thân nhún nhảy nhịp nhàng theo bước đi
            customerGroup.position.y = Math.abs(Math.sin(customerAnim.walkCycle)) * 0.08;

        } else {
            // Đến đích: đứng thẳng thớm, 2 chân chạm sàn ngay ngắn
            customerGroup.position.copy(customerAnim.targetPos);
            customerGroup.position.y = 0;
            customerAnim.active = false;

            if (customerLimbs.leftLeg && customerLimbs.rightLeg) {
                customerLimbs.leftLeg.rotation.x = 0;
                customerLimbs.rightLeg.rotation.x = 0;
            }
            if (customerLimbs.leftArm) customerLimbs.leftArm.rotation.x = 0;
            if (customerLimbs.rightArm && (!customerGroup.userData.miniCupGroup || !customerGroup.userData.miniCupGroup.visible)) {
                customerLimbs.rightArm.rotation.x = 0;
            }

            if (gameState.phase === 'WALKING_IN') {
                if (typeof onArrivedAtCounter === 'function') onArrivedAtCounter();
            } else if (gameState.phase === 'WALKING_OUT') {
                if (typeof onLeftShop === 'function') onLeftShop();
            }
        }
    } else if (customerAnim.shakeTimer > 0) {
        // Lắc đầu khi pha sai món
        customerAnim.shakeTimer -= dt;
        if (customerLimbs.head) {
            customerLimbs.head.rotation.y = Math.sin(elapsed * 30) * 0.45;
            if (customerAnim.shakeTimer <= 0) {
                customerLimbs.head.rotation.y = 0;
            }
        }
    } else {
        // Đứng chờ tại quầy: thở nhè nhẹ và nghiêng đầu mong ngóng ly trà sữa
        if (typeof gameState !== 'undefined' && ['ORDERING', 'SEALING', 'AWAITING_PAYMENT'].includes(gameState.phase)) {
            customerGroup.position.y = Math.abs(Math.sin(elapsed * 2.2)) * 0.02;
            if (customerLimbs.head) {
                customerLimbs.head.rotation.z = Math.sin(elapsed * 1.5) * 0.04;
            }
        }
    }
}

/* ============================================================================
 * 6. HỆ THỐNG KHÁCH NGỒI BÀN UỐNG TRÀ SỮA (SEATED CUSTOMERS ENGINE)
 * ============================================================================ */

// 4 vị trí ghế đẩu quanh 2 bàn tròn
const SHOP_SEATS = [
    { id: 0, pos: new THREE.Vector3(2.45, 0, 1.5), sitPos: new THREE.Vector3(2.45, 0.22, 1.5), lookAngle: Math.PI / 2, cupPos: new THREE.Vector3(3.15, 1.10, 1.5), occupied: false, seatedData: null },
    { id: 1, pos: new THREE.Vector3(4.75, 0, 1.5), sitPos: new THREE.Vector3(4.75, 0.22, 1.5), lookAngle: -Math.PI / 2, cupPos: new THREE.Vector3(4.05, 1.10, 1.5), occupied: false, seatedData: null },
    { id: 2, pos: new THREE.Vector3(2.45, 0, -1.8), sitPos: new THREE.Vector3(2.45, 0.22, -1.8), lookAngle: Math.PI / 2, cupPos: new THREE.Vector3(3.15, 1.10, -1.8), occupied: false, seatedData: null },
    { id: 3, pos: new THREE.Vector3(4.75, 0, -1.8), sitPos: new THREE.Vector3(4.75, 0.22, -1.8), lookAngle: -Math.PI / 2, cupPos: new THREE.Vector3(4.05, 1.10, -1.8), occupied: false, seatedData: null }
];

let seatedCustomers = [];

function getAvailableSeat() {
    return SHOP_SEATS.find(s => !s.occupied) || null;
}

function createTableCup(teaColor) {
    const cupGroup = new THREE.Group();

    // Thân ly
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.30, 14);
    const bodyMat = new THREE.MeshLambertMaterial({ color: teaColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.15;
    body.castShadow = true;
    cupGroup.add(body);

    // Nắp dập phẳng
    const lidGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.03, 14);
    const lidMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.31;
    cupGroup.add(lid);

    // Ống hút cắm xiên
    const strawGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
    const strawMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.02, 0.38, 0.02);
    straw.rotation.z = -0.22;
    cupGroup.add(straw);

    return cupGroup;
}

function startCustomerDineIn(order, targetScene) {
    const seat = getAvailableSeat();
    if (!seat) return false;

    seat.occupied = true;

    // Dựng mô hình 3D hoàn chỉnh cho nhân vật ngồi
    const fig = createFullyArticulatedChibi(order.customer);
    const group = fig.root;
    group.position.set(-0.25, 0, 1.35);
    group.rotation.y = 0;
    targetScene.add(group);

    // Ly trà mini trên tay
    const miniCup = new THREE.Group();
    const cBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.065, 0.24, 14),
        new THREE.MeshLambertMaterial({ color: TEA_MENU[order.teaId].color })
    );
    const cLid = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.03, 14), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cLid.position.y = 0.12;
    const cStraw = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 8), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    cStraw.position.y = 0.18;
    miniCup.add(cBody, cLid, cStraw);
    fig.rightArm.add(miniCup);
    miniCup.position.set(0.05, -0.34, 0.12);
    miniCup.rotation.x = 0.7;
    fig.rightArm.rotation.x = -0.7;

    const seatedObj = {
        id: Date.now() + Math.random(),
        order: order,
        seat: seat,
        group: group,
        limbs: fig,
        miniCup: miniCup,
        tableCup: null,
        state: 'WALKING_TO_SEAT',
        targetPos: seat.pos.clone(),
        walkCycle: 0,
        sitTimer: 16.0, // Ngồi uống chill 16 giây
        nextSpeechTime: 4.5,
        finished: false
    };

    seat.seatedData = seatedObj;
    seatedCustomers.push(seatedObj);
    return true;
}

function animateSeatedCustomers(dt, elapsed, targetScene) {
    if (!seatedCustomers || seatedCustomers.length === 0) return;

    for (let i = 0; i < seatedCustomers.length; i++) {
        const sc = seatedCustomers[i];
        if (sc.finished) continue;

        if (sc.state === 'WALKING_TO_SEAT') {
            const currentPos = sc.group.position;
            const dir = new THREE.Vector3().subVectors(sc.targetPos, currentPos);
            const dist = dir.length();

            if (dist > 0.08) {
                dir.normalize();
                currentPos.addScaledVector(dir, 3.2 * dt);
                sc.group.rotation.y = Math.atan2(dir.x, dir.z);

                sc.walkCycle += dt * 15;
                const swing = Math.sin(sc.walkCycle);

                if (sc.limbs.leftLeg && sc.limbs.rightLeg) {
                    sc.limbs.leftLeg.rotation.x = swing * 0.55;
                    sc.limbs.rightLeg.rotation.x = -swing * 0.55;
                }
                if (sc.limbs.leftArm) sc.limbs.leftArm.rotation.x = -swing * 0.45;
                sc.group.position.y = Math.abs(Math.sin(sc.walkCycle)) * 0.08;
            } else {
                // Đến ghế: Ngồi xuống đệm ghế!
                sc.state = 'SITTING';
                sc.group.position.copy(sc.seat.sitPos);
                sc.group.rotation.y = sc.seat.lookAngle;

                // Ẩn ly trên tay
                if (sc.miniCup) sc.miniCup.visible = false;

                // Gập chân 90 độ ngồi đàng hoàng
                if (sc.limbs.leftLeg && sc.limbs.rightLeg) {
                    sc.limbs.leftLeg.rotation.x = -Math.PI / 2;
                    sc.limbs.rightLeg.rotation.x = -Math.PI / 2;
                }
                // Tay đặt lên mép bàn
                if (sc.limbs.leftArm) sc.limbs.leftArm.rotation.x = -0.65;
                if (sc.limbs.rightArm) sc.limbs.rightArm.rotation.x = -0.65;

                // Đặt ly trà sữa lên bàn
                sc.tableCup = createTableCup(TEA_MENU[sc.order.teaId].color);
                sc.tableCup.position.copy(sc.seat.cupPos);
                targetScene.add(sc.tableCup);

                showToast(`🪑 ${sc.order.customer.name} đã ngồi vào bàn thưởng thức trà sữa!`);
            }
        } else if (sc.state === 'SITTING') {
            sc.sitTimer -= dt;
            sc.nextSpeechTime -= dt;

            // Nhịp thở & nghiêng đầu theo tiếng nhạc
            if (sc.limbs.headGroup) {
                sc.limbs.headGroup.rotation.z = Math.sin(elapsed * 1.6 + sc.id) * 0.05;
                sc.limbs.headGroup.rotation.y = Math.sin(elapsed * 0.9 + sc.id) * 0.08;
            }

            // Đôi khi hiện lời khen ngợi dễ thương
            if (sc.nextSpeechTime <= 0) {
                sc.nextSpeechTime = 7.5;
                const praises = [
                    `🧋 ${sc.order.customer.name}: "Trà sữa ngon xỉu luôn!"`,
                    `💖 ${sc.order.customer.name}: "Góc này ngồi chill thật sự~"`,
                    `✨ ${sc.order.customer.name}: "Đúng hương vị mình thích!"`,
                    `😋 ${sc.order.customer.name}: "Trân châu dai giòn đã quá!"`
                ];
                showToast(praises[Math.floor(Math.random() * praises.length)]);
            }

            // Hết giờ uống: đứng dậy để lại tiền tip và ra về
            if (sc.sitTimer <= 0) {
                if (sc.tableCup) {
                    targetScene.remove(sc.tableCup);
                    sc.tableCup = null;
                }

                // Tiền tip: cơ bản 10.000đ, thêm +5.000đ nếu đã nâng cấp Máy Hát Đĩa
                const bonusTip = (typeof gameState !== 'undefined' && gameState.upgrades && gameState.upgrades.music_box) ? 5000 : 0;
                const tip = 10000 + bonusTip;
                gameState.money += tip;
                gameState.revenue += tip;
                updateTopStatsUI();
                playSoundEffect('cash');
                const bonusNote = bonusTip > 0 ? ' (kèm +5.000đ thưởng Máy Hát Đĩa)' : '';
                showToast(`💵 ${sc.order.customer.name} uống xong để lại +${formatVND(tip)} tiền tip cho quán!${bonusNote}`);

                // Đứng dậy
                sc.group.position.y = 0;
                if (sc.limbs.leftLeg && sc.limbs.rightLeg) {
                    sc.limbs.leftLeg.rotation.x = 0;
                    sc.limbs.rightLeg.rotation.x = 0;
                }
                if (sc.limbs.leftArm) sc.limbs.leftArm.rotation.x = 0;
                if (sc.limbs.rightArm) sc.limbs.rightArm.rotation.x = 0;

                sc.state = 'WALKING_OUT';
                sc.targetPos = new THREE.Vector3(-6.2, 0, 2.2);
            }
        } else if (sc.state === 'WALKING_OUT') {
            const currentPos = sc.group.position;
            const dir = new THREE.Vector3().subVectors(sc.targetPos, currentPos);
            const dist = dir.length();

            if (dist > 0.08) {
                dir.normalize();
                currentPos.addScaledVector(dir, 3.2 * dt);
                sc.group.rotation.y = Math.atan2(dir.x, dir.z);

                sc.walkCycle += dt * 15;
                const swing = Math.sin(sc.walkCycle);

                if (sc.limbs.leftLeg && sc.limbs.rightLeg) {
                    sc.limbs.leftLeg.rotation.x = swing * 0.55;
                    sc.limbs.rightLeg.rotation.x = -swing * 0.55;
                }
                if (sc.limbs.leftArm) sc.limbs.leftArm.rotation.x = -swing * 0.45;
                if (sc.limbs.rightArm) sc.limbs.rightArm.rotation.x = swing * 0.45;
                sc.group.position.y = Math.abs(Math.sin(sc.walkCycle)) * 0.08;
            } else {
                // Thoát khỏi quán
                sc.seat.occupied = false;
                sc.seat.seatedData = null;
                targetScene.remove(sc.group);
                sc.finished = true;
            }
        }
    }

    seatedCustomers = seatedCustomers.filter(sc => !sc.finished);
}

function clearAllSeatedCustomers(targetScene) {
    if (!seatedCustomers) return;
    seatedCustomers.forEach(sc => {
        if (sc.tableCup && targetScene) targetScene.remove(sc.tableCup);
        if (sc.group && targetScene) targetScene.remove(sc.group);
    });
    seatedCustomers = [];
    SHOP_SEATS.forEach(s => {
        s.occupied = false;
        s.seatedData = null;
    });
}
