/* ============================================================================
 * DỊCH VỤ SAO LƯU & NẠP DỮ LIỆU GAME (SAVE / LOAD & BACKUP SERVICE)
 * Hỗ trợ 2 cơ chế:
 * 1. Tự động lưu ngầm trình duyệt (LocalStorage).
 * 2. Xuất & Nạp file sao lưu mã hóa Base64 (.txt) theo định dạng: backup_DDMMYYYY_HHmm.txt
 * ============================================================================ */

const LOCAL_STORAGE_SAVE_KEY = 'BOBA_SWEET_SAVE_DATA_V1';

/**
 * Tạo tên file sao lưu theo định dạng: backup_DDMMYYYY_HHmm.txt
 * Ví dụ: backup_31102026_2231.txt
 * @returns {string}
 */
function getBackupFileName() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `backup_${day}${month}${year}_${hour}${min}.txt`;
}

/**
 * Trích xuất toàn bộ dữ liệu quan trọng của quán để đóng gói
 * @returns {object}
 */
function serializeGameState() {
    return {
        version: 1,
        savedAt: new Date().toISOString(),
        gameDateStr: new Date().toLocaleString('vi-VN'),
        money: gameState.money || 0,
        revenue: gameState.revenue || 0,
        day: gameState.day || 1,
        totalStars: gameState.totalStars || 0,
        ratingCount: gameState.ratingCount || 0,
        ordersSold: gameState.ordersSold || 0,
        customersServed: gameState.customersServed || 0,
        upgrades: { ...gameState.upgrades },
        upgradeLevels: { ...gameState.upgradeLevels },
        decorVisibility: { ...gameState.decorVisibility },
        flooring: {
            current: gameState.flooring ? gameState.flooring.current : 'checker_pink',
            unlocked: gameState.flooring ? [...gameState.flooring.unlocked] : ['checker_pink']
        },
        staff: { ...gameState.staff },
        inventory: { ...gameState.inventory },
        menuConfig: JSON.parse(JSON.stringify(gameState.menuConfig || {})),
        dailyTarget: {
            ...(gameState.dailyTarget || { type: 'revenue', targetAmount: 100000, currentAmount: 0, isReached: false, isDayOpen: false })
        },
        accountingToday: { ...(gameState.accountingToday || {}) }
    };
}

/**
 * Mã hóa dữ liệu đối tượng sang chuỗi Base64 an toàn hỗ trợ tiếng Việt UTF-8
 * @param {object} dataObj 
 * @returns {string}
 */
function encodeSaveString(dataObj) {
    try {
        const jsonStr = JSON.stringify(dataObj);
        return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    } catch (e) {
        console.error('Lỗi khi mã hóa dữ liệu lưu:', e);
        return JSON.stringify(dataObj);
    }
}

/**
 * Giải mã chuỗi lưu Base64 hoặc chuỗi JSON thô thành đối tượng
 * @param {string} str 
 * @returns {object|null}
 */
function decodeSaveString(str) {
    if (!str || typeof str !== 'string') return null;
    str = str.trim();

    // 1. Thử giải mã Base64
    try {
        const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonStr);
    } catch (e) {
        // 2. Dự phòng: Thử phân tích cú pháp JSON thô
        try {
            return JSON.parse(str);
        } catch (err2) {
            console.error('Không thể giải mã dữ liệu file:', err2);
            return null;
        }
    }
}

/**
 * Áp dụng dữ liệu đã đọc vào trạng thái trò chơi (gameState) và khôi phục thế giới 3D & giao diện
 * @param {object} data 
 * @param {string} sourceName 
 * @returns {boolean}
 */
function applySaveDataToGame(data, sourceName = '') {
    if (!data || typeof data !== 'object') {
        playSoundEffect('error');
        showToast('❌ File sao lưu không hợp lệ hoặc bị hỏng dữ liệu!');
        return false;
    }

    try {
        // Cập nhật các chỉ số tiền và tiến độ
        gameState.money = (typeof data.money === 'number') ? data.money : 100000;
        gameState.revenue = (typeof data.revenue === 'number') ? data.revenue : 0;
        gameState.day = (typeof data.day === 'number') ? data.day : 1;
        gameState.totalStars = (typeof data.totalStars === 'number') ? data.totalStars : 0;
        gameState.ratingCount = (typeof data.ratingCount === 'number') ? data.ratingCount : 0;
        gameState.ordersSold = (typeof data.ordersSold === 'number') ? data.ordersSold : 0;
        gameState.customersServed = (typeof data.customersServed === 'number') ? data.customersServed : 0;

        // Cập nhật nâng cấp & cấp độ
        if (data.upgrades) gameState.upgrades = { ...data.upgrades };
        if (data.upgradeLevels) gameState.upgradeLevels = { ...data.upgradeLevels };
        if (data.decorVisibility) gameState.decorVisibility = { ...data.decorVisibility };

        // Cập nhật nền gạch
        if (data.flooring) {
            gameState.flooring = {
                current: data.flooring.current || 'checker_pink',
                unlocked: Array.isArray(data.flooring.unlocked) ? [...data.flooring.unlocked] : ['checker_pink']
            };
        }

        // Cập nhật nhân viên
        if (data.staff) gameState.staff = { ...data.staff };

        // Cập nhật kho hàng
        if (data.inventory) gameState.inventory = { ...data.inventory };

        // Cập nhật thực đơn mở bán & giá
        if (data.menuConfig) gameState.menuConfig = JSON.parse(JSON.stringify(data.menuConfig));

        // Cập nhật mục tiêu ngày & kế toán
        if (data.dailyTarget) gameState.dailyTarget = { ...data.dailyTarget };
        if (data.accountingToday) gameState.accountingToday = { ...data.accountingToday };

        // Đưa trạng thái quầy về an toàn
        gameState.phase = 'WAITING_SPAWN';
        gameState.currentOrder = null;
        if (typeof clearCurrentCup === 'function') clearCurrentCup(false);

        // Khôi phục thế giới 3D nếu scene đã sẵn sàng
        if (typeof scene !== 'undefined' && scene) {
            // Nền gạch
            if (typeof selectFlooring === 'function' && gameState.flooring) {
                selectFlooring(gameState.flooring.current);
            }
            // Đồ trang trí & Nâng cấp 3D
            if (typeof applyPurchasedDecorUpgrades === 'function') {
                applyPurchasedDecorUpgrades(scene);
            }
            // Nhân viên 3D
            if (gameState.staff) {
                if (gameState.staff.waiter && typeof buildWaiter3D === 'function') buildWaiter3D(scene);
                if (gameState.staff.barista_assistant && typeof buildAssistantBarista3D === 'function') buildAssistantBarista3D(scene);
                if (gameState.staff.pastry_chef && typeof buildPastryChef3D === 'function') buildPastryChef3D(scene);
                if (gameState.staff.greeter_dog && typeof buildGreeterDog3D === 'function') buildGreeterDog3D(scene);
            }
        }

        // Cập nhật toàn bộ giao diện
        if (typeof updateTopStatsUI === 'function') updateTopStatsUI();
        if (typeof updateCraftingUI === 'function') updateCraftingUI();
        if (typeof updateOrderTicketUI === 'function') updateOrderTicketUI();
        if (typeof updateTargetProgressUI === 'function') updateTargetProgressUI();
        if (typeof updateInventoryBadgesUI === 'function') updateInventoryBadgesUI();

        // Tự động lưu ngay bản mới vào LocalStorage
        saveToLocalStorage();

        playSoundEffect('bell');
        const srcText = sourceName ? ` từ "${sourceName}"` : '';
        showToast(`🎉 Khôi phục thành công dữ liệu Ngày ${gameState.day}${srcText}! Số dư: ${formatVND(gameState.money)}.`);

        return true;
    } catch (err) {
        console.error('Lỗi khi nạp dữ liệu game:', err);
        playSoundEffect('error');
        showToast('❌ Đã xảy ra lỗi khi nạp dữ liệu!');
        return false;
    }
}

/**
 * 1. TỰ ĐỘNG LƯU NGẦM VÀO LOCALSTORAGE
 */
function saveToLocalStorage() {
    try {
        const data = serializeGameState();
        const str = encodeSaveString(data);
        localStorage.setItem(LOCAL_STORAGE_SAVE_KEY, str);
        localStorage.setItem(LOCAL_STORAGE_SAVE_KEY + '_TIMESTAMP', Date.now().toString());
    } catch (e) {
        console.warn('Không thể tự động lưu vào LocalStorage:', e);
    }
}

/**
 * TỰ ĐỘNG NẠP TỪ LOCALSTORAGE KHI VÀO GAME
 */
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_SAVE_KEY);
        if (!raw) return false;

        const data = decodeSaveString(raw);
        if (!data) return false;

        // Gán trực tiếp dữ liệu thô vào gameState trước khi dựng 3D
        if (typeof data.money === 'number') gameState.money = data.money;
        if (typeof data.revenue === 'number') gameState.revenue = data.revenue;
        if (typeof data.day === 'number') gameState.day = data.day;
        if (typeof data.totalStars === 'number') gameState.totalStars = data.totalStars;
        if (typeof data.ratingCount === 'number') gameState.ratingCount = data.ratingCount;
        if (typeof data.ordersSold === 'number') gameState.ordersSold = data.ordersSold;
        if (typeof data.customersServed === 'number') gameState.customersServed = data.customersServed;

        if (data.upgrades) gameState.upgrades = { ...gameState.upgrades, ...data.upgrades };
        if (data.upgradeLevels) gameState.upgradeLevels = { ...gameState.upgradeLevels, ...data.upgradeLevels };
        if (data.decorVisibility) gameState.decorVisibility = { ...gameState.decorVisibility, ...data.decorVisibility };
        if (data.flooring) gameState.flooring = { ...gameState.flooring, ...data.flooring };
        if (data.staff) gameState.staff = { ...gameState.staff, ...data.staff };
        if (data.inventory) gameState.inventory = { ...gameState.inventory, ...data.inventory };
        if (data.menuConfig) gameState.menuConfig = JSON.parse(JSON.stringify(data.menuConfig));
        if (data.dailyTarget) gameState.dailyTarget = { ...gameState.dailyTarget, ...data.dailyTarget };
        if (data.accountingToday) gameState.accountingToday = { ...gameState.accountingToday, ...data.accountingToday };

        console.log(`[AutoSave] Đã tự động khôi phục dữ liệu Ngày ${gameState.day} từ LocalStorage.`);
        return true;
    } catch (e) {
        console.warn('Lỗi khi nạp từ LocalStorage:', e);
        return false;
    }
}

/**
 * 2. XUẤT FILE SAO LƯU (.txt) THEO ĐỊNH DẠNG: backup_DDMMYYYY_HHmm.txt
 */
function exportSaveToFile() {
    const data = serializeGameState();
    const encodedContent = encodeSaveString(data);
    const fileName = getBackupFileName();

    const blob = new Blob([encodedContent], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);

    playSoundEffect('cash');
    showToast(`💾 Đã xuất file sao lưu: "${fileName}" thành công!`);

    // Lưu ngay cả vào LocalStorage
    saveToLocalStorage();
    updateSaveModalInfo();
}

/**
 * 3. NẠP DỮ LIỆU TỪ FILE ĐƯỢC CHỌN (.txt)
 * @param {File} file 
 */
function importSaveFromFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;
        const decodedData = decodeSaveString(fileContent);

        if (!decodedData) {
            playSoundEffect('error');
            showToast('❌ Không thể đọc file! Định dạng file không đúng hoặc bị lỗi.');
            return;
        }

        const success = applySaveDataToGame(decodedData, file.name);
        if (success) {
            closeSaveLoadModal();
        }
    };

    reader.onerror = function () {
        playSoundEffect('error');
        showToast('❌ Đã xảy ra lỗi trong quá trình đọc file!');
    };

    reader.readAsText(file);
}

/**
 * Xóa sạch toàn bộ dữ liệu lưu và làm mới lại trò chơi từ đầu
 */
function resetAllGameData() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_SAVE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_SAVE_KEY + '_TIMESTAMP');
    } catch (e) {}

    showToast('🔄 Đã xóa sạch dữ liệu quán. Đang tải lại trang...');
    setTimeout(() => {
        window.location.reload();
    }, 600);
}

// Global window assignments
window.getBackupFileName = getBackupFileName;
window.exportSaveToFile = exportSaveToFile;
window.importSaveFromFile = importSaveFromFile;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.resetAllGameData = resetAllGameData;
window.applySaveDataToGame = applySaveDataToGame;
