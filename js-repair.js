<script>
// ============================================
// Repair Management System - COMPLETE VERSION
// ============================================

(function() {
    'use strict';
    
    if (typeof window === 'undefined') return;
    
    if (!window.RepairSystemIsolated) {
        window.RepairSystemIsolated = {};
    }
    
    const RSI = window.RepairSystemIsolated;
    
    // Store original functions
    const originalFunctions = {
        hasPermission: window.hasPermission,
        showNotification: window.showNotification,
        setActiveNavItem: window.setActiveNavItem,
        showAccessDenied: window.showAccessDenied,
        formatDate: window.formatDate,
        formatCurrency: window.formatCurrency,
        imageToBase64: window.imageToBase64
    };
    
    // Private variables
    let repairSystemActive = false;
    let repairList = [];
    let currentRepair = null;
    let isEditMode = false;
    let html5QrCode = null;
    let repairEventListenersAdded = false;
    let uploadedImageUrl = '';
    
    // *** เพิ่มตัวแปรสำหรับตรวจสอบพัสดุ ***
    let equipmentFound = false;
    let searchTimeout = null;
    let equipmentSearchTimeout = null;
    let allowOtherEquipment = false;  // ✅ ติดตามว่าอนุญาตให้แจ้ง "อื่น" หรือไม่
    let commonOtherItems = [  // ✅ รายการอื่นที่ใช้บ่อย
        'ไฟสำนัก',
        'หลอดไฟ',
        'พัดลม',
        'สวิตช์ไฟ',
        'ปลั๊กไฟ',
        'สายไฟ',
        'หม้อแปลง',
        'เข็มขัดไฟ',
        'อื่น ๆ'
    ];

    let currentRepairPage = 1;
const repairsPerPage = 20;
let totalRepairPages = 1;
    
    // ============================================
    // Translation Maps
    // ============================================
    
    const TRANSLATIONS = {
        priority: {
            'normal': 'ปกติ',
            'medium': 'ปานกลาง',
            'urgent': 'เร่งด่วน'
        },
        status: {
            'pending': 'รอดำเนินการ',
            'in_progress': 'กำลังซ่อม',
            'completed': 'เสร็จสิ้น',
            'cancelled': 'ยกเลิก'
        },
        damageType: {
            'hardware': 'Hardware (ปัญหาฮาร์ดแวร์)',
            'software': 'Software (ปัญหาซอฟต์แวร์)',
            'network': 'Network (ปัญหาเครือข่าย)',
            'user_error': 'User Error (ปัญหาการใช้งาน)',
            'maintenance': 'Maintenance (บำรุงรักษา)',
            'unknown': 'Unknown (ไม่ทราบสาเหตุ)'
        }
    };
    
    // ============================================
    // Session Management
    // ============================================

    function getSafeSessionId() {
        const storedSessionId = localStorage.getItem('sessionId');
        if (storedSessionId) {
            window.sessionId = storedSessionId;
            return storedSessionId;
        }
        
        if (window.sessionId) {
            return window.sessionId;
        }
        
        console.warn('No session ID found!');
        return null;
    }

    function validateCurrentSession() {
        const sessionId = getSafeSessionId();
        if (!sessionId) {
            console.error('Session validation failed: No session ID');
            safeShowNotification('กรุณาเข้าสู่ระบบก่อนใช้งาน', 'warning');
            setTimeout(() => {
                if (typeof window.showLoginModal === 'function') {
                    window.showLoginModal();
                } else if (typeof window.logout === 'function') {
                    window.logout();
                }
            }, 1000);
            return false;
        }
        return true;
    }
    
    // ============================================
    // Safe Function Wrappers
    // ============================================
    
    function safeHasPermission(permission) {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรงแต่ละครั้ง
        if (window.hasPermission && typeof window.hasPermission === 'function') {
            return window.hasPermission(permission);
        }
        if (originalFunctions.hasPermission && typeof originalFunctions.hasPermission === 'function') {
            return originalFunctions.hasPermission(permission);
        }
        return false;
    }
    
    function safeShowNotification(message, type) {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรง
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (originalFunctions.showNotification && typeof originalFunctions.showNotification === 'function') {
            originalFunctions.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    function safeSetActiveNavItem(itemId) {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรง
        if (window.setActiveNavItem && typeof window.setActiveNavItem === 'function') {
            return window.setActiveNavItem(itemId);
        }
        if (originalFunctions.setActiveNavItem && typeof originalFunctions.setActiveNavItem === 'function') {
            return originalFunctions.setActiveNavItem(itemId);
        }
    }
    
    function safeShowAccessDenied() {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรง
        if (window.showAccessDenied && typeof window.showAccessDenied === 'function') {
            window.showAccessDenied();
        } else if (originalFunctions.showAccessDenied && typeof originalFunctions.showAccessDenied === 'function') {
            originalFunctions.showAccessDenied();
        } else {
            safeShowNotification('ไม่มีสิทธิ์เข้าถึง', 'warning');
        }
    }
    
    function safeFormatDate(dateString) {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรง
        if (window.formatDate && typeof window.formatDate === 'function') {
            return window.formatDate(dateString);
        }
        if (originalFunctions.formatDate && typeof originalFunctions.formatDate === 'function') {
            return originalFunctions.formatDate(dateString);
        }
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString || '-';
        }
    }
    
    function safeFormatCurrency(amount) {
        // 🔧 แก้ไข: ดึงค่าจาก window โดยตรง
        if (window.formatCurrency && typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount);
        }
        if (originalFunctions.formatCurrency && typeof originalFunctions.formatCurrency === 'function') {
            return originalFunctions.formatCurrency(amount);
        }
        try {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(amount || 0);
        } catch {
            return `${amount || 0} บาท`;
        }
    }
    
    async function safeImageToBase64(file) {
        if (originalFunctions.imageToBase64 && typeof originalFunctions.imageToBase64 === 'function') {
            return originalFunctions.imageToBase64(file);
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // ============================================
    // Translation Helpers
    // ============================================
    
    function translatePriority(priority) {
        return TRANSLATIONS.priority[priority] || priority;
    }
    
    function translateStatus(status) {
        return TRANSLATIONS.status[status] || status;
    }

    function translateDamageType(damageType) {
        return TRANSLATIONS.damageType[damageType] || damageType;
    }
    
    function getStatusBadge(status) {
        const statusMap = {
            'pending': { class: 'bg-yellow-100 text-yellow-800', icon: 'clock' },
            'in_progress': { class: 'bg-blue-100 text-blue-800', icon: 'wrench' },
            'completed': { class: 'bg-green-100 text-green-800', icon: 'check' },
            'cancelled': { class: 'bg-red-100 text-red-800', icon: 'times' }
        };
        const statusInfo = statusMap[status] || statusMap['pending'];
        return `<span class="px-2 py-1 text-xs font-medium ${statusInfo.class} rounded-full">
                    <i class="fas fa-${statusInfo.icon} mr-1"></i>
                    ${translateStatus(status)}
                </span>`;
    }
    
    function getPriorityBadge(priority) {
        const priorityMap = {
            'normal': { class: 'bg-gray-100 text-gray-800', icon: 'minus' },
            'medium': { class: 'bg-yellow-100 text-yellow-800', icon: 'exclamation' },
            'urgent': { class: 'bg-red-100 text-red-800', icon: 'exclamation-triangle' }
        };
        const priorityInfo = priorityMap[priority] || priorityMap['normal'];
        return `<span class="px-2 py-1 text-xs font-medium ${priorityInfo.class} rounded-full">
                    <i class="fas fa-${priorityInfo.icon} mr-1"></i>
                    ${translatePriority(priority)}
                </span>`;
    }

    function getDamageTypeBadge(damageType) {
        const damageTypeMap = {
            'hardware': { class: 'bg-purple-100 text-purple-800', icon: 'microchip' },
            'software': { class: 'bg-blue-100 text-blue-800', icon: 'code' },
            'network': { class: 'bg-indigo-100 text-indigo-800', icon: 'wifi' },
            'user_error': { class: 'bg-yellow-100 text-yellow-800', icon: 'user' },
            'maintenance': { class: 'bg-green-100 text-green-800', icon: 'tools' },
            'unknown': { class: 'bg-gray-100 text-gray-800', icon: 'question-circle' }
        };
        const damageInfo = damageTypeMap[damageType] || damageTypeMap['unknown'];
        return `<span class="px-2 py-1 text-xs font-medium ${damageInfo.class} rounded-full">
                    <i class="fas fa-${damageInfo.icon} mr-1"></i>
                    ${translateDamageType(damageType)}
                </span>`;
    }

    // ✅ Export functions เพื่อให้เข้าถึงจากนอก namespace
    window.getStatusBadge = getStatusBadge;
    window.getPriorityBadge = getPriorityBadge;
    window.getDamageTypeBadge = getDamageTypeBadge;
    window.translateDamageType = translateDamageType;
    
    // ============================================
    // Main Initialization
    // ============================================
    
    // ✅ สร้าง RSI methods สำหรับ functions ต่างๆ (เพื่อเข้าถึงจากนอก namespace)
    RSI.getStatusBadge = getStatusBadge;
    RSI.getPriorityBadge = getPriorityBadge;
    RSI.getDamageTypeBadge = getDamageTypeBadge;
    RSI.translateDamageType = translateDamageType;
    RSI.translatePriority = translatePriority;
    RSI.translateStatus = translateStatus;

    RSI.initialize = function() {
        if (!validateCurrentSession()) return;
        if (!safeHasPermission('repair') && !safeHasPermission('repair_view') && !safeHasPermission('all')) {
            safeShowAccessDenied();
            return;
        }
        
        if (repairSystemActive) {
            console.log('Repair system already active');
            return;
        }
        
        repairSystemActive = true;
        safeSetActiveNavItem('repairBtn');
        
        if (window.currentView !== undefined) {
            window.currentView = 'repair';
        }
        
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) {
            console.error('Content area not found');
            repairSystemActive = false;
            return;
        }
        
        cleanupEventListeners();
        contentArea.innerHTML = getRepairManagementHTML();
        
        setTimeout(() => {
            initializeRepairEventListeners();
            loadRepairData();
        }, 100);
    };
    
    // ============================================
    // Cleanup
    // ============================================
    
    RSI.cleanup = function() {
        repairSystemActive = false;
        cleanupEventListeners();
        
        const modals = ['repairModal', 'quickScanModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('hidden');
        });
        
        if (html5QrCode) {
            try {
                html5QrCode.stop();
            } catch (e) {
                console.log('QR scanner already stopped');
            }
            html5QrCode = null;
        }
        
        // Reset variables
        equipmentFound = false;
        searchTimeout = null;
    };
    
    function cleanupEventListeners() {
        if (!repairEventListenersAdded) return;
        
        const elements = [
            'addRepairBtn', 'quickRepairBtn', 'quickOtherRepairBtn', 'closeRepairModal', 'cancelRepairBtn',
            'repairForm', 'repairSearch', 'statusFilter', 'priorityFilter', 
            'technicianFilter', 'damageTypeFilter', 'refreshRepairBtn', 'selectAllRepairs',
            'repairEquipmentNumber', 'searchEquipmentBtn', 'scanEquipmentRepairBtn', 'quickOtherEquipmentBtn'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
        
        repairEventListenersAdded = false;
    }
    
    // ============================================
    // HTML Template
    // ============================================
    
    function getRepairManagementHTML() {
    return `
    <div class="repair-system-container animate-fadeIn" data-system="repair">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">จัดการการแจ้งซ่อม</h1>
                <p class="text-gray-600">ระบบจัดการการแจ้งซ่อมพัสดุครุภัณฑ์</p>
            </div>
            <div class="flex flex-wrap gap-2 sm:gap-1 w-full sm:w-auto">
                <button id="addRepairBtn" class="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="hidden sm:inline">แจ้งซ่อมใหม่</span>
                    <span class="sm:hidden">ใหม่</span>
                </button>
                <button id="quickRepairBtn" class="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-qrcode mr-2"></i>
                    <span class="hidden sm:inline">สแกนแจ้งซ่อม</span>
                    <span class="sm:hidden">สแกน</span>
                </button>
                <button id="quickOtherRepairBtn" class="flex-1 sm:flex-none bg-orange-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-toolbox mr-2"></i>
                    <span class="hidden sm:inline">แจ้งซ่อมอื่น</span>
                    <span class="sm:hidden">อื่น</span>
                </button>
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="search-bar">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="repairSearch" placeholder="ค้นหารายการซ่อม..." 
                           class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <select id="statusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">สถานะทั้งหมด</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="in_progress">กำลังซ่อม</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                </select>
                <select id="priorityFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ความเร่งด่วนทั้งหมด</option>
                    <option value="normal">ปกติ</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="urgent">เร่งด่วน</option>
                </select>
                <select id="technicianFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ช่างทั้งหมด</option>
                    <option value="assigned">มีช่างรับผิดชอบ</option>
                    <option value="unassigned">ยังไม่มีช่าง</option>
                </select>
                <select id="damageTypeFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ประเภทความเสียหายทั้งหมด</option>
                    <option value="hardware">Hardware (ฮาร์ดแวร์)</option>
                    <option value="software">Software (ซอฟต์แวร์)</option>
                    <option value="network">Network (เครือข่าย)</option>
                    <option value="user_error">User Error (การใช้งาน)</option>
                    <option value="maintenance">Maintenance (บำรุงรักษา)</option>
                    <option value="unknown">Unknown (ไม่ทราบสาเหตุ)</option>
                </select>
                <button id="refreshRepairBtn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <i class="fas fa-sync-alt mr-2"></i>
                    รีเฟรช
                </button>
            </div>
        </div>
        
        <!-- Table View -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- 🔧 เพิ่ม class repair-table-wrapper สำหรับ Mobile Card -->
            <div class="repair-table-wrapper overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสพัสดุ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปัญหา</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้แจ้ง</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่แจ้ง</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความเร่งด่วน</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทความเสียหาย</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody id="repairTableBody" class="bg-white divide-y divide-gray-200">
                        <!-- Table rows will be loaded here -->
                    </tbody>
                </table>
                
                <!-- Mobile Card View จะถูกสร้างที่นี่โดย JavaScript -->
            </div>
            
            <!-- 🆕 Pagination Controls -->
            <div id="repairPagination" class="bg-white rounded-lg shadow-md p-4 mt-4 hidden">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <!-- ข้อมูลรายการทั้งหมด -->
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-list mr-2"></i>
                        รายการทั้งหมด: <span id="totalRepairsCount" class="font-semibold text-gray-800">0</span> รายการ
                    </div>
                    
                    <!-- ปุ่ม Pagination -->
                    <div id="repairPaginationButtons" class="flex items-center gap-2">
                        <!-- จะถูกสร้างโดย JavaScript -->
                    </div>
                </div>
            </div>
            
            <!-- Loading state -->
            <div id="repairLoading" class="text-center py-12">
                <div class="inline-flex items-center">
                    <i class="fas fa-spinner animate-spin text-blue-600 mr-3 text-2xl"></i>
                    <span class="text-gray-600 text-lg">กำลังโหลดข้อมูลการซ่อม...</span>
                </div>
            </div>
            
            <!-- Empty state -->
            <div id="repairEmpty" class="text-center py-12 hidden">
                <div class="text-gray-400 mb-4">
                    <i class="fas fa-tools text-6xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีรายการซ่อมในระบบ</h3>
                <p class="text-gray-500 mb-6">เริ่มต้นด้วยการแจ้งซ่อมพัสดุครุภัณฑ์ใหม่</p>
                <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onclick="window.RepairSystemIsolated.showRepairModal()">
                    <i class="fas fa-plus mr-2"></i>
                    แจ้งซ่อมใหม่
                </button>
            </div>
        </div>
    </div>
    
    ${getRepairModalHTML()}
    ${getQuickScanModalHTML()}
    `;
}

    
 // ============================================
// getRepairManagementHTML() - ฟังก์ชันเต็มสมบูรณ์
// รวม Desktop Table + Mobile Card + Pagination
// ============================================

function getRepairManagementHTML() {
    return `
    <div class="repair-system-container animate-fadeIn" data-system="repair">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">จัดการการแจ้งซ่อม</h1>
                <p class="text-gray-600">ระบบจัดการการแจ้งซ่อมพัสดุครุภัณฑ์</p>
            </div>
            <div class="flex flex-wrap gap-2 sm:gap-1 w-full sm:w-auto">
                <button id="addRepairBtn" class="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="hidden sm:inline">แจ้งซ่อมใหม่</span>
                    <span class="sm:hidden">ใหม่</span>
                </button>
                <button id="quickRepairBtn" class="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-qrcode mr-2"></i>
                    <span class="hidden sm:inline">สแกนแจ้งซ่อม</span>
                    <span class="sm:hidden">สแกน</span>
                </button>
                <button id="quickOtherRepairBtn" class="flex-1 sm:flex-none bg-orange-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
                    <i class="fas fa-toolbox mr-2"></i>
                    <span class="hidden sm:inline">แจ้งซ่อมอื่น</span>
                    <span class="sm:hidden">อื่น</span>
                </button>
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="search-bar">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="repairSearch" placeholder="ค้นหารายการซ่อม..." 
                           class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <select id="statusFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">สถานะทั้งหมด</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="in_progress">กำลังซ่อม</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                </select>
                <select id="priorityFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ความเร่งด่วนทั้งหมด</option>
                    <option value="normal">ปกติ</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="urgent">เร่งด่วน</option>
                </select>
                <select id="technicianFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ช่างทั้งหมด</option>
                    <option value="assigned">มีช่างรับผิดชอบ</option>
                    <option value="unassigned">ยังไม่มีช่าง</option>
                </select>
                <select id="damageTypeFilter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <option value="">ประเภทความเสียหายทั้งหมด</option>
                    <option value="hardware">Hardware (ฮาร์ดแวร์)</option>
                    <option value="software">Software (ซอฟต์แวร์)</option>
                    <option value="network">Network (เครือข่าย)</option>
                    <option value="user_error">User Error (การใช้งาน)</option>
                    <option value="maintenance">Maintenance (บำรุงรักษา)</option>
                    <option value="unknown">Unknown (ไม่ทราบสาเหตุ)</option>
                </select>
                <button id="refreshRepairBtn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <i class="fas fa-sync-alt mr-2"></i>
                    รีเฟรช
                </button>
            </div>
        </div>
        
        <!-- Table View -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- 🔧 เพิ่ม class repair-table-wrapper สำหรับ Mobile Card -->
            <div class="repair-table-wrapper overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสพัสดุ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปัญหา</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้แจ้ง</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่แจ้ง</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความเร่งด่วน</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทความเสียหาย</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody id="repairTableBody" class="bg-white divide-y divide-gray-200">
                        <!-- Table rows will be loaded here -->
                    </tbody>
                </table>
                
                <!-- Mobile Card View จะถูกสร้างที่นี่โดย JavaScript -->
            </div>
            
            <!-- 🆕 Pagination Controls -->
            <div id="repairPagination" class="bg-white rounded-lg shadow-md p-4 mt-4 hidden">
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <!-- ข้อมูลรายการทั้งหมด -->
                    <div class="text-sm text-gray-600">
                        <i class="fas fa-list mr-2"></i>
                        รายการทั้งหมด: <span id="totalRepairsCount" class="font-semibold text-gray-800">0</span> รายการ
                    </div>
                    
                    <!-- ปุ่ม Pagination -->
                    <div id="repairPaginationButtons" class="flex items-center gap-2">
                        <!-- จะถูกสร้างโดย JavaScript -->
                    </div>
                </div>
            </div>
            
            <!-- Loading state -->
            <div id="repairLoading" class="text-center py-12">
                <div class="inline-flex items-center">
                    <i class="fas fa-spinner animate-spin text-blue-600 mr-3 text-2xl"></i>
                    <span class="text-gray-600 text-lg">กำลังโหลดข้อมูลการซ่อม...</span>
                </div>
            </div>
            
            <!-- Empty state -->
            <div id="repairEmpty" class="text-center py-12 hidden">
                <div class="text-gray-400 mb-4">
                    <i class="fas fa-tools text-6xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีรายการซ่อมในระบบ</h3>
                <p class="text-gray-500 mb-6">เริ่มต้นด้วยการแจ้งซ่อมพัสดุครุภัณฑ์ใหม่</p>
                <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onclick="window.RepairSystemIsolated.showRepairModal()">
                    <i class="fas fa-plus mr-2"></i>
                    แจ้งซ่อมใหม่
                </button>
            </div>
        </div>
    </div>
    
    ${getRepairModalHTML()}
    ${getQuickScanModalHTML()}
    `;
}

// ============================================
// แก้ไข: getRepairModalHTML (เอาส่วนอะไหล่ออก)
// ============================================

function getRepairModalHTML() {
        return `
        <div id="repairModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center hidden">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl lg:max-w-4xl mx-4 max-h-screen overflow-y-auto relative">
                <!-- Loading indicator -->
                <div id="repairModalLoading" class="hidden absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg z-50">
                    <div class="text-center">
                        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                        <p class="text-gray-600 mt-2">กำลังโหลด...</p>
                    </div>
                </div>
                
                <div class="p-6 lg:p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">แจ้งซ่อมใหม่</h2>
                        <button id="closeRepairModal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Repair Details (when editing) -->
                    <div id="repairDetailsSection" class="hidden mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-wrench mr-2 text-blue-600"></i>
                            รายละเอียดการซ่อม
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span class="font-medium text-gray-700">เลขที่ใบแจ้ง:</span>
                                <span id="repairDetailTicketNo" class="text-gray-600 ml-2"></span>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">สถานะปัจจุบัน:</span>
                                <span id="repairDetailStatus" class="px-2 py-1 rounded text-xs font-medium ml-2"></span>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">วันที่แจ้ง:</span>
                                <span id="repairDetailDate" class="text-gray-600 ml-2"></span>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">ช่างซ่อม:</span>
                                <span id="repairDetailTechnician" class="text-gray-600 ml-2"></span>
                            </div>
                            <div class="md:col-span-2">
                                <span class="font-medium text-gray-700">หมายเหตุการซ่อม:</span>
                                <p id="repairDetailNotes" class="text-gray-600 mt-1 bg-white p-2 rounded border border-gray-200"></p>
                            </div>
                        </div>
                    </div>
                    
                    <form id="repairForm" class="space-y-4">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสพัสดุ / รายการอื่น *
                                    <span class="text-gray-500 text-xs font-normal">(กรอกรหัส หรือเลือก +)</span>
                                </label>
                                <div class="flex flex-wrap gap-2 items-start">
                                    <input type="text" id="repairEquipmentNumber" name="equipment_number" 
                                           class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" 
                                           required 
                                           placeholder="กรอกรหัสพัสดุ...">
                                    <div class="flex gap-1.5 flex-wrap">
                                        <button type="button" id="searchEquipmentBtn" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm whitespace-nowrap" title="ค้นหาพัสดุ">
                                            <i class="fas fa-search mr-1"></i>
                                            <span class="hidden sm:inline">ค้นหา</span>
                                        </button>
                                        <button type="button" id="scanEquipmentRepairBtn" class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm whitespace-nowrap" title="สแกนบาร์โค้ด">
                                            <i class="fas fa-qrcode mr-1"></i>
                                            <span class="hidden sm:inline">สแกน</span>
                                        </button>
                                        <button type="button" id="quickOtherEquipmentBtn" class="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-xs sm:text-sm whitespace-nowrap" title="เลือกรายการอื่น">
                                            <i class="fas fa-plus mr-1"></i>
                                            <span class="hidden sm:inline">อื่น</span>
                                        </button>
                                    </div>
                                </div>
                                <div id="equipmentInfo" class="mt-2"></div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้แจ้ง *</label>
                                <input type="text" id="repairReporterName" name="reporter_name" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์ติดต่อ *</label>
                                <input type="tel" id="repairReporterContact" name="reporter_contact" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">สถานที่ *</label>
                                <input type="text" id="repairLocation" name="location" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                       placeholder="เช่น สำนัก, โรงเก็บ" required>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">ความเร่งด่วน *</label>
                                <select id="repairPriority" name="priority" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                                    <option value="normal">ปกติ</option>
                                    <option value="medium">ปานกลาง</option>
                                    <option value="urgent">เร่งด่วน</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    ประเภทความเสียหาย *
                                    <span class="text-gray-500 text-xs font-normal">(วางแผนงบประมาณ)</span>
                                </label>
                                <select id="repairDamageType" name="damage_type" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                                    <option value="">-- เลือกประเภท --</option>
                                    <option value="hardware">🔧 ฮาร์ดแวร์ (Hardware)</option>
                                    <option value="software">💻 ซอฟต์แวร์ (Software)</option>
                                    <option value="network">🌐 เครือข่าย (Network)</option>
                                    <option value="user_error">👤 ข้อผิดพลาดของผู้ใช้ (User Error)</option>
                                    <option value="maintenance">🛠️ บำรุงรักษา (Maintenance)</option>
                                    <option value="unknown">❓ ไม่ทราบสาเหตุ (Unknown)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียดปัญหา *</label>
                            <textarea id="repairProblemDescription" name="problem_description" rows="4" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                      required placeholder="อธิบายปัญหาที่พบ..."></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">รูปภาพปัญหา</label>
                            <div class="file-upload-area" id="repairImageUploadArea">
                                <input type="file" id="repairProblemImage" name="image" accept="image/*" class="hidden">
                                <div id="repairUploadPlaceholder">
                                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-600 text-sm">คลิกเพื่อเลือกรูปภาพ</p>
                                    <p class="text-xs text-gray-500">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
                                </div>
                                <div id="repairImagePreview" class="hidden">
                                    <img id="repairPreviewImg" src="" alt="Preview" class="image-preview mb-2">
                                    <button type="button" id="removeRepairImage" class="text-red-600 hover:text-red-800 text-sm">
                                        <i class="fas fa-trash mr-1"></i>
                                        ลบรูปภาพ
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- ⚠️ เอาส่วน Spare Parts ออกแล้ว -->
                        
                        <div class="flex space-x-4 pt-6 border-t border-gray-200">
                            <button type="submit" id="saveRepairBtn" class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-save mr-2"></i>
                                บันทึก
                            </button>
                            <button type="button" id="cancelRepairBtn" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200">
                                ยกเลิก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function getQuickScanModalHTML() {
    return `
    <div id="quickScanModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center hidden">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">สแกน QR Code</h2>
                    <button id="closeQuickScanModal" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div id="qrReader" class="rounded-lg overflow-hidden mb-4"></div>
                
                <div class="text-sm text-gray-600 text-center">
                    <i class="fas fa-info-circle mr-1"></i>
                    จ่อ QR Code ของพัสดุเพื่อเริ่มแจ้งซ่อม
                </div>
            </div>
        </div>
    </div>
    `;
}
    
    // ============================================
    // Spare Parts Management
    // ============================================
    let spareParts = [];
    
    function showRepairModalLoading() {
        const loading = document.getElementById('repairModalLoading');
        if (loading) loading.classList.remove('hidden');
    }
    
    function hideRepairModalLoading() {
        const loading = document.getElementById('repairModalLoading');
        if (loading) loading.classList.add('hidden');
    }
    
    function populateRepairDetails(repair) {
        const section = document.getElementById('repairDetailsSection');
        if (!section) return;
        
        section.classList.remove('hidden');
        document.getElementById('repairDetailTicketNo').textContent = repair.ticket_number || '-';
        document.getElementById('repairDetailDate').textContent = formatDate(repair.created_at) || '-';
        document.getElementById('repairDetailTechnician').textContent = repair.technician_name || '-';
        document.getElementById('repairDetailNotes').textContent = repair.repair_notes || 'ยังไม่มีหมายเหตุ';
        
        const statusEl = document.getElementById('repairDetailStatus');
        const statusClass = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        statusEl.className = statusClass[repair.status] || 'bg-gray-100 text-gray-800';
        const statusLabels = {
            'pending': 'รอการซ่อม',
            'in_progress': 'กำลังซ่อม',
            'completed': 'ซ่อมเสร็จ',
            'cancelled': 'ยกเลิก'
        };
        statusEl.textContent = statusLabels[repair.status] || repair.status;
    }
    
    function hideRepairDetails() {
        const section = document.getElementById('repairDetailsSection');
        if (section) section.classList.add('hidden');
    }
    
    function showAddSparePartModal() {
        const modal = document.getElementById('addSparePartModal');
        if (modal) modal.classList.remove('hidden');
    }
    
    function hideAddSparePartModal() {
        const modal = document.getElementById('addSparePartModal');
        if (modal) modal.classList.add('hidden');
        document.getElementById('spareName').value = '';
        document.getElementById('spareQty').value = '1';
        document.getElementById('sparePrice').value = '';
    }
    
    function addSparePart() {
        const name = document.getElementById('spareName').value.trim();
        const qty = parseInt(document.getElementById('spareQty').value) || 1;
        const price = parseFloat(document.getElementById('sparePrice').value) || 0;
        
        if (!name) {
            alert('กรุณากรอกชื่ออะไหล่');
            return;
        }
        
        spareParts.push({ name, qty, price, total: qty * price });
        updateSparePartsList();
        hideAddSparePartModal();
    }
    
    function removeSparePart(idx) {
        spareParts.splice(idx, 1);
        updateSparePartsList();
    }
    
    function updateSparePartsList() {
        const list = document.getElementById('sparePartsList');
        if (!list) return;
        
        list.innerHTML = spareParts.map((part, idx) => {
            return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${part.name}</p>
                    <p class="text-sm text-gray-600">จำนวน: ${part.qty} × ${part.price} บาท = ${part.total} บาท</p>
                </div>
                <button type="button" class="text-red-600 hover:text-red-800 delete-spare-part-btn" data-index="${idx}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            `;
        }).join('');
        
        // Attach event listeners
        document.querySelectorAll('.delete-spare-part-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(btn.getAttribute('data-index'));
                removeSparePart(idx);
            });
        });
        
        document.getElementById('sparePartsData').value = JSON.stringify(spareParts);
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    function initializeRepairEventListeners() {
        if (!repairSystemActive || repairEventListenersAdded) return;
        
        try {
            const addBtn = document.getElementById('addRepairBtn');
            const quickBtn = document.getElementById('quickRepairBtn');
            const quickOtherBtn = document.getElementById('quickOtherRepairBtn');
            const refreshBtn = document.getElementById('refreshRepairBtn');
            
            if (addBtn) addBtn.addEventListener('click', () => showRepairModal());
            if (quickBtn) quickBtn.addEventListener('click', showQuickScanModal);
            if (quickOtherBtn) quickOtherBtn.addEventListener('click', () => {
                showRepairModal();
                setTimeout(() => showQuickOtherItemModal(), 500);
            });
            if (refreshBtn) refreshBtn.addEventListener('click', loadRepairData);
            
            const closeModal = document.getElementById('closeRepairModal');
            const cancelBtn = document.getElementById('cancelRepairBtn');
            const closeScan = document.getElementById('closeQuickScanModal');
            
            if (closeModal) closeModal.addEventListener('click', hideRepairModal);
            if (cancelBtn) cancelBtn.addEventListener('click', hideRepairModal);
            if (closeScan) closeScan.addEventListener('click', hideQuickScanModal);
            
            const form = document.getElementById('repairForm');
            if (form) form.addEventListener('submit', handleRepairSubmit);
            
            const searchBtn = document.getElementById('searchEquipmentBtn');
            const scanBtn = document.getElementById('scanEquipmentRepairBtn');
            const quickOtherEquipmentBtn = document.getElementById('quickOtherEquipmentBtn');
            
            if (searchBtn) searchBtn.addEventListener('click', searchEquipment);
            if (scanBtn) scanBtn.addEventListener('click', () => startBarcodeScanner());
            if (quickOtherEquipmentBtn) quickOtherEquipmentBtn.addEventListener('click', showQuickOtherItemModal);
            
            // *** เพิ่ม: ตรวจสอบอัตโนมัติเมื่อพิมพ์รหัสพัสดุ ***
            const equipmentNumberInput = document.getElementById('repairEquipmentNumber');
            if (equipmentNumberInput) {
                equipmentNumberInput.addEventListener('input', function(e) {
                    const value = e.target.value.trim();
                    
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                    }
                    
                    equipmentFound = false;
                    updateEquipmentStatus('checking');
                    
                    if (!value) {
                        updateEquipmentStatus('empty');
                        return;
                    }
                    
                    searchTimeout = setTimeout(() => {
                        autoSearchEquipment(value);
                    }, 800);
                });
            }
            
            const uploadArea = document.getElementById('repairImageUploadArea');
            const imageInput = document.getElementById('repairProblemImage');
            const removeBtn = document.getElementById('removeRepairImage');
            
            if (uploadArea) uploadArea.addEventListener('click', () => imageInput?.click());
            if (imageInput) imageInput.addEventListener('change', handleRepairImageUpload);
            if (removeBtn) removeBtn.addEventListener('click', removeRepairImage);
            
            const searchInput = document.getElementById('repairSearch');
            const statusFilter = document.getElementById('statusFilter');
            const priorityFilter = document.getElementById('priorityFilter');
            const technicianFilter = document.getElementById('technicianFilter');
            const selectAll = document.getElementById('selectAllRepairs');
            
            if (searchInput) searchInput.addEventListener('input', filterRepairs);
            if (statusFilter) statusFilter.addEventListener('change', filterRepairs);
            if (priorityFilter) priorityFilter.addEventListener('change', filterRepairs);
            if (technicianFilter) technicianFilter.addEventListener('change', filterRepairs);
            
            const damageTypeFilter = document.getElementById('damageTypeFilter');
            if (damageTypeFilter) damageTypeFilter.addEventListener('change', filterRepairs);
            if (selectAll) selectAll.addEventListener('change', handleSelectAll);
            
            // Spare parts event listeners
            const addSparePartBtn = document.getElementById('addSparePartBtn');
            const saveSparePartBtn = document.getElementById('saveSparePartBtn');
            const cancelSparePartBtn = document.getElementById('cancelSparePartBtn');
            
            if (addSparePartBtn) addSparePartBtn.addEventListener('click', showAddSparePartModal);
            if (saveSparePartBtn) saveSparePartBtn.addEventListener('click', addSparePart);
            if (cancelSparePartBtn) cancelSparePartBtn.addEventListener('click', hideAddSparePartModal);
            
            repairEventListenersAdded = true;
            console.log('Repair event listeners initialized');
            
        } catch (error) {
            console.error('Error initializing repair event listeners:', error);
        }
    }
    
    // ============================================
    // Modal Functions
    // ============================================
    
function showRepairModal() {
    if (!repairSystemActive) return;
    if (!validateCurrentSession()) return;
    
    const modal = document.getElementById('repairModal');
    const form = document.getElementById('repairForm');
    
    if (form) {
        form.reset();
        form.removeAttribute('data-edit-id');
    }
    
    equipmentFound = false;
    allowOtherEquipment = false;  // ✅ reset สถานะ allowOtherEquipment
    
    // Reset spare parts สำหรับแจ้งซ่อมใหม่
    spareParts = [];
    updateSparePartsList();
    hideRepairDetails();
    
    const modalTitle = modal?.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'แจ้งซ่อมใหม่';
    }
    
    const submitBtn = document.getElementById('saveRepairBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึก';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // ล้าง preview รูปภาพ
    clearRepairImagePreview();
    updateEquipmentStatus('checking');
    
    const currentUserName = window.currentUser?.name || '';
    const reporterName = document.getElementById('repairReporterName');
    if (reporterName && currentUserName) {
        reporterName.value = currentUserName;
    }
    
    modal?.classList.remove('hidden');
}

    
function hideRepairModal() {
    const modal = document.getElementById('repairModal');
    modal?.classList.add('hidden');
    
    const form = document.getElementById('repairForm');
    form?.reset();
    
    equipmentFound = false;
    allowOtherEquipment = false;  // ✅ reset สถานะ allowOtherEquipment
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // ล้าง preview รูปภาพ
    clearRepairImagePreview();
}
    
    // ============================================
    // Equipment Search Functions
    // ============================================
    
function autoSearchEquipment(equipmentNumber, currentRepairId) {
    if (!equipmentNumber) {
        updateEquipmentStatus('empty');
        equipmentFound = false;
        const submitBtn = document.getElementById('saveRepairBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    // ยกเลิก timeout เดิม (ถ้ามี)
    if (equipmentSearchTimeout) {
        clearTimeout(equipmentSearchTimeout);
        equipmentSearchTimeout = null;
    }
    
    updateEquipmentStatus('searching');
    
    // ตั้ง timeout ไว้ 10 วินาที
    equipmentSearchTimeout = setTimeout(() => {
        console.warn('Equipment search timeout');
        updateEquipmentStatus('timeout');
        safeShowNotification('การค้นหาใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง', 'warning');
    }, 10000);
    
    // ⭐ เรียกใช้ validateEquipmentForRepair แทน getEquipmentByNumber
    // เพื่อให้รองรับการยกเว้นรายการที่กำลังแก้ไข
    google.script.run
        .withSuccessHandler(function(result) {
            // ยกเลิก timeout เมื่อได้ผลลัพธ์
            if (equipmentSearchTimeout) {
                clearTimeout(equipmentSearchTimeout);
                equipmentSearchTimeout = null;
            }
            onAutoEquipmentSearchSuccess(result);
        })
        .withFailureHandler(function(error) {
            // ยกเลิก timeout เมื่อเกิด error
            if (equipmentSearchTimeout) {
                clearTimeout(equipmentSearchTimeout);
                equipmentSearchTimeout = null;
            }
            onAutoEquipmentSearchError(error);
        })
        .validateEquipmentForRepair(equipmentNumber, currentRepairId || null);
}

// ============================================
// แก้ไขฟังก์ชัน autoSearchEquipment ใน js-repair.js
// ใช้ชื่อฟังก์ชันที่ถูกต้องตามที่มีในระบบ
// ============================================

/**
 * ค้นหาพัสดุอัตโนมัติ (รองรับทั้งโหมดสร้างใหม่และแก้ไข)
 * @param {string} equipmentNumber - รหัสพัสดุที่ต้องการค้นหา
 * @param {string} currentRepairId - (Optional) ID ของรายการซ่อมที่กำลังแก้ไข
 */
function autoSearchEquipment(equipmentNumber, currentRepairId) {
    if (!equipmentNumber) {
        updateEquipmentStatus('empty');
        equipmentFound = false;
        const submitBtn = document.getElementById('saveRepairBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    // ยกเลิก timeout เดิม (ถ้ามี)
    if (equipmentSearchTimeout) {
        clearTimeout(equipmentSearchTimeout);
        equipmentSearchTimeout = null;
    }
    
    updateEquipmentStatus('searching');
    
    // ตั้ง timeout ไว้ 10 วินาที
    equipmentSearchTimeout = setTimeout(() => {
        console.warn('Equipment search timeout');
        updateEquipmentStatus('timeout');
        safeShowNotification('การค้นหาใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง', 'warning');
    }, 10000);
    
    // ⭐ เรียกใช้ validateEquipmentForRepair แทน getEquipmentByNumber
    // เพื่อให้รองรับการยกเว้นรายการที่กำลังแก้ไข
    google.script.run
        .withSuccessHandler(function(result) {
            // ยกเลิก timeout เมื่อได้ผลลัพธ์
            if (equipmentSearchTimeout) {
                clearTimeout(equipmentSearchTimeout);
                equipmentSearchTimeout = null;
            }
            onAutoEquipmentSearchSuccess(result);
        })
        .withFailureHandler(function(error) {
            // ยกเลิก timeout เมื่อเกิด error
            if (equipmentSearchTimeout) {
                clearTimeout(equipmentSearchTimeout);
                equipmentSearchTimeout = null;
            }
            onAutoEquipmentSearchError(error);
        })
        .validateEquipmentForRepair(equipmentNumber, currentRepairId || null);
}

// ============================================
// แก้ไข: onAutoEquipmentSearchSuccess (ดึงสถานที่มาใส่)
// ============================================

function onAutoEquipmentSearchSuccess(result) {
    const infoElement = document.getElementById('equipmentInfo');
    
    // ⭐ กรณี error (ไม่พบพัสดุ หรือ สถานะจำหน่าย)
    if (result.status === 'error') {
        equipmentFound = false;
        
        // ✅ ตรวจสอบว่าเป็น error ประเภท retired หรือไม่
        if (result.error_type === 'retired') {
            updateEquipmentStatus('retired');
        } else {
            updateEquipmentStatus('not_found');
        }
        
        const submitBtn = document.getElementById('saveRepairBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    // ⭐ กรณีพบพัสดุ
    if (result.status === 'success' && result.equipment) {
        const eq = result.equipment;
        
        // ✅✅✅ เพิ่มตรงนี้: ดึงสถานที่มาใส่ใน Input อัตโนมัติ ✅✅✅
        const locationInput = document.getElementById('repairLocation');
        if (locationInput && eq.location) {
            locationInput.value = eq.location;
            // ทำ effect ให้รู้ว่ามีการเปลี่ยนแปลง (Optional)
            locationInput.style.backgroundColor = "#f0fdf4"; // สีเขียวอ่อนๆ
            setTimeout(() => {
                locationInput.style.backgroundColor = "";
            }, 1000);
        }
        // ✅✅✅ จบส่วนเพิ่ม ✅✅✅

        // ⭐ ตรวจสอบว่ามีงานซ่อมค้างอยู่หรือไม่
        if (result.has_pending) {
            // มีงานซ่อมค้างอยู่
            equipmentFound = false;
            updateEquipmentStatus('has_pending');
            
            const repairs = result.pending_repairs || [];
            let repairsListHTML = '<div class="space-y-2 max-h-48 overflow-y-auto">';
            
            repairs.forEach(repair => {
                const statusText = repair.status === 'pending' ? 'รอดำเนินการ' : 'กำลังซ่อม';
                const statusColor = repair.status === 'pending' ? 'yellow' : 'blue';
                const createdDate = repair.created_at ? 
                    new Date(repair.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '-';
                
                const technicianInfo = repair.technician_name 
                    ? `<div class="text-xs text-gray-600 mt-1"><i class="fas fa-user-cog mr-1"></i>ช่าง: ${repair.technician_name}</div>`
                    : '';
                
                repairsListHTML += `
                    <div class="bg-white p-3 rounded-lg border border-${statusColor}-200">
                        <div class="flex items-start justify-between mb-2">
                            <span class="text-sm font-semibold text-gray-900">งานซ่อม #${repairs.indexOf(repair) + 1}</span>
                            <span class="px-2 py-0.5 bg-${statusColor}-100 text-${statusColor}-800 rounded text-xs font-medium">${statusText}</span>
                        </div>
                        <div class="text-xs text-gray-600 mb-1">
                            <i class="far fa-clock mr-1"></i>${createdDate}
                        </div>
                        <div class="text-xs text-gray-700 mt-2 line-clamp-2">${repair.problem_description || '-'}</div>
                        ${technicianInfo}
                    </div>
                `;
            });
            
            repairsListHTML += '</div>';
            
            if (infoElement) {
                infoElement.innerHTML = `
                    <div class="bg-orange-50 border border-orange-300 rounded-lg p-4">
                        <div class="flex items-start mb-3">
                            <i class="fas fa-exclamation-triangle text-orange-600 mr-2 mt-1"></i>
                            <div class="flex-1">
                                <div class="font-semibold text-orange-800 mb-1">⚠️ พัสดุนี้มีงานซ่อมค้างอยู่</div>
                                <div class="text-sm text-orange-700 mb-3">
                                    พบ ${result.pending_count} รายการที่ยังไม่เสร็จสิ้น กรุณาตรวจสอบก่อนแจ้งซ่อมใหม่
                                </div>
                                ${repairsListHTML}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const submitBtn = document.getElementById('saveRepairBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            // ไม่มีงานซ่อมค้าง แสดงข้อมูลพัสดุ
            equipmentFound = true;
            updateEquipmentStatus('found');
            
            if (infoElement) {
                infoElement.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div class="flex items-start">
                            <i class="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                            <div class="flex-1">
                                <div class="font-medium text-green-800 mb-1">✓ พบพัสดุในระบบ</div>
                                <div class="text-sm text-gray-700">
                                    <strong>${eq.name}</strong>
                                    ${eq.type ? `<span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">${eq.type}</span>` : ''}
                                </div>
                                ${eq.location ? `<div class="text-xs text-gray-600 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${eq.location}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const submitBtn = document.getElementById('saveRepairBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }
}

function onAutoEquipmentSearchError(error) {
    console.error('Auto equipment search error:', error);
    equipmentFound = false;
    updateEquipmentStatus('error');
    
    const submitBtn = document.getElementById('saveRepairBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}
    
    // ============================================
    // ✅ ฟังก์ชันอนุญาตแจ้งซ่อมรายการอื่น
    // ============================================
    
    // ============================================
    // ✅ ฟังก์ชัน Quick Other Item Selection
    // ============================================
    
    function showQuickOtherItemModal() {
        // สร้าง button สำหรับแต่ละรายการ
        let buttonsHTML = commonOtherItems.map(item => `
            <button type="button" class="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition text-sm whitespace-nowrap border border-orange-300 hover:border-orange-500" data-item="${item}">
                ${item}
            </button>
        `).join('');
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '🔧 เลือกรายการที่ต้องการแจ้งซ่อม',
                html: `
                    <div class="text-left">
                        <p class="text-sm text-gray-600 mb-3">เลือกจากรายการที่ใช้บ่อย หรือกรอกชื่อเอง</p>
                        <div class="flex flex-wrap gap-2 mb-4 justify-center">
                            ${buttonsHTML}
                        </div>
                        <div class="border-t pt-3">
                            <label class="block text-sm font-medium text-gray-700 mb-2">หรือกรอกชื่อเอง:</label>
                            <input type="text" id="quickOtherInput" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="เช่น เข็มขัดไฟ, หม้อแปลง ฯลฯ" />
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#f97316',
                width: '450px',
                didOpen: () => {
                    // เพิ่ม event listener สำหรับปุ่มรายการ
                    document.querySelectorAll('[data-item]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const input = document.getElementById('quickOtherInput');
                            if (input) {
                                input.value = btn.getAttribute('data-item');
                                input.focus();
                                btn.classList.add('ring-2', 'ring-orange-500', 'bg-orange-300');
                            }
                        });
                    });
                    
                    // Focus ไปที่ input
                    const quickInput = document.getElementById('quickOtherInput');
                    if (quickInput) {
                        quickInput.focus();
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const input = document.getElementById('quickOtherInput');
                    const selectedItem = input?.value.trim();
                    
                    if (!selectedItem) {
                        safeShowNotification('กรุณาเลือกหรือกรอกรายการ', 'warning');
                        return;
                    }
                    
                    // เติมข้อมูลเข้า form
                    setOtherEquipmentItem(selectedItem);
                }
            });
        }
    }
    
    function setOtherEquipmentItem(itemName) {
        const equipmentInput = document.getElementById('repairEquipmentNumber');
        if (equipmentInput) {
            equipmentInput.value = itemName;
        }
        
        allowOtherEquipment = true;
        equipmentFound = true;
        
        const infoElement = document.getElementById('equipmentInfo');
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-3 mt-1"></i>
                        <div class="flex-1">
                            <div class="font-medium text-blue-800 mb-1">✓ เลือกรายการแล้ว</div>
                            <div class="text-sm text-gray-700">
                                <strong>รายการอื่น:</strong> ${itemName}
                            </div>
                            <div class="text-xs text-gray-600 mt-2">
                                <button type="button" class="text-blue-600 hover:text-blue-800 underline" id="changeOtherItemBtn">เปลี่ยนรายการ</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // เพิ่ม event listener สำหรับ "เปลี่ยนรายการ"
            setTimeout(() => {
                const changeBtn = document.getElementById('changeOtherItemBtn');
                if (changeBtn) {
                    changeBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        showQuickOtherItemModal();
                    });
                }
            }, 100);
        }
        
        const submitBtn = document.getElementById('saveRepairBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function allowOtherEquipmentItem() {
        allowOtherEquipment = true;
        equipmentFound = true;  // ✅ ทำให้ปุ่ม Save เปิดได้
        
        const equipmentInput = document.getElementById('repairEquipmentNumber');
        const infoElement = document.getElementById('equipmentInfo');
        const submitBtn = document.getElementById('saveRepairBtn');
        
        // แสดง UI สำหรับเพิ่มชื่อรายการอื่น
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="bg-orange-50 border border-orange-300 rounded-lg p-4">
                    <div class="flex items-start mb-3">
                        <i class="fas fa-edit text-orange-600 mr-2 mt-1"></i>
                        <div class="flex-1">
                            <div class="font-semibold text-orange-800 mb-2">📝 แจ้งซ่อมรายการอื่น</div>
                            <div class="text-sm text-orange-700 mb-3">
                                กรุณากรอกชื่อสิ่งของที่ต้องการแจ้งซ่อม (ไม่มีในระบบ)
                            </div>
                            <input type="text" id="otherEquipmentName" placeholder="เช่น ไฟสำนัก หลอดไฟ พัดลม ฯลฯ" class="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm" />
                            <div class="mt-3 flex gap-2">
                                <button type="button" id="confirmOtherBtn" class="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition">
                                    <i class="fas fa-check mr-1"></i>ยืนยัน
                                </button>
                                <button type="button" id="cancelOtherBtn" class="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded font-medium transition">
                                    <i class="fas fa-times mr-1"></i>ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // เพิ่ม event listeners
            setTimeout(() => {
                const otherNameInput = document.getElementById('otherEquipmentName');
                const confirmBtn = document.getElementById('confirmOtherBtn');
                const cancelBtn = document.getElementById('cancelOtherBtn');
                
                if (otherNameInput) {
                    otherNameInput.focus();
                    otherNameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            confirmBtn?.click();
                        }
                    });
                }
                
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => {
                        const otherName = otherNameInput?.value.trim();
                        if (!otherName) {
                            safeShowNotification('กรุณากรอกชื่อรายการ', 'warning');
                            return;
                        }
                        
                        if (equipmentInput) {
                            equipmentInput.value = otherName;  // ✅ เก็บชื่อลงในฟิลด์
                        }
                        
                        // แสดง UI ยืนยัน
                        showOtherEquipmentConfirmed(otherName);
                    });
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        allowOtherEquipment = false;
                        equipmentFound = false;
                        if (equipmentInput) {
                            equipmentInput.value = '';
                        }
                        updateEquipmentStatus('empty');
                    });
                }
            }, 100);
        }
        
        // ✅ เปิดปุ่ม Save
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
    
    function showOtherEquipmentConfirmed(otherName) {
        const infoElement = document.getElementById('equipmentInfo');
        const submitBtn = document.getElementById('saveRepairBtn');
        
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-3 mt-1"></i>
                        <div class="flex-1">
                            <div class="font-medium text-blue-800 mb-1">✓ เพิ่มรายการแล้ว</div>
                            <div class="text-sm text-gray-700">
                                <strong>รายการอื่น:</strong> ${otherName}
                            </div>
                            <div class="text-xs text-gray-600 mt-2">คลิก "บันทึก" เพื่อส่งแบบฟอร์ม</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // ✅ ให้ปุ่ม Save เปิดใช้งาน
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function updateEquipmentStatus(status) {
        const infoElement = document.getElementById('equipmentInfo');
        if (!infoElement) return;
    
    switch (status) {
        case 'empty':
            infoElement.innerHTML = '';
            
            const submitBtnEmpty = document.getElementById('saveRepairBtn');
            if (submitBtnEmpty) {
                submitBtnEmpty.disabled = true;
                submitBtnEmpty.classList.add('opacity-50', 'cursor-not-allowed');
            }
            break;
            
        case 'checking':
            infoElement.innerHTML = `
                <div class="flex items-center text-gray-500">
                    <i class="fas fa-keyboard mr-2"></i>
                    <span class="text-xs">กรุณากรอกรหัสพัสดุเพื่อตรวจสอบ...</span>
                </div>
            `;
            break;
            
        case 'searching':
            infoElement.innerHTML = `
                <div class="flex items-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    <span class="text-sm">กำลังตรวจสอบรหัสพัสดุ...</span>
                </div>
            `;
            break;
            
        case 'not_found':
            infoElement.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <i class="fas fa-times-circle mr-2 mt-1"></i>
                    <div class="flex-1">
                        <div class="font-medium">✗ ไม่พบพัสดุในระบบ</div>
                        <div class="text-xs text-gray-700 mt-1">
                            กรุณาตรวจสอบรหัสพัสดุให้ถูกต้อง หรือแจ้งเป็น "รายการอื่น"
                        </div>
                        <button type="button" id="allowOtherEquipmentBtn" class="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded font-medium transition">
                            <i class="fas fa-plus mr-1"></i>แจ้งซ่อมรายการอื่น
                        </button>
                    </div>
                </div>
            `;
            
            // เพิ่ม event listener สำหรับปุ่มอนุญาต
            setTimeout(() => {
                const btn = document.getElementById('allowOtherEquipmentBtn');
                if (btn) {
                    btn.addEventListener('click', allowOtherEquipmentItem);
                }
            }, 100);
            
            const submitBtnNotFound = document.getElementById('saveRepairBtn');
            if (submitBtnNotFound) {
                submitBtnNotFound.disabled = true;
                submitBtnNotFound.classList.add('opacity-50', 'cursor-not-allowed');
            }
            break;
            
        // ✅ เพิ่ม case สำหรับสถานะ retired
        case 'retired':
            infoElement.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-300 rounded-lg p-3">
                    <i class="fas fa-ban mr-2 mt-1 text-lg"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-red-800 mb-1">✗ ไม่สามารถแจ้งซ่อมได้</div>
                        <div class="text-sm text-red-700">
                            พัสดุนี้มีสถานะ <strong>"จำหน่าย"</strong> แล้ว ไม่สามารถแจ้งซ่อมได้
                        </div>
                    </div>
                </div>
            `;
            
            const submitBtnRetired = document.getElementById('saveRepairBtn');
            if (submitBtnRetired) {
                submitBtnRetired.disabled = true;
                submitBtnRetired.classList.add('opacity-50', 'cursor-not-allowed');
            }
            break;
            
        case 'error':
            infoElement.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                    <i class="fas fa-exclamation-circle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm mb-1">เกิดข้อผิดพลาดในการตรวจสอบ</div>
                        <div class="text-xs text-gray-600">
                            ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง
                        </div>
                    </div>
                </div>
            `;
            
            const submitBtnError = document.getElementById('saveRepairBtn');
            if (submitBtnError) {
                submitBtnError.disabled = true;
                submitBtnError.classList.add('opacity-50', 'cursor-not-allowed');
            }
            break;
    }
}

    function searchEquipment() {
        const equipmentNumber = document.getElementById('repairEquipmentNumber')?.value;
        if (!equipmentNumber) {
            safeShowNotification('กรุณาระบุรหัสพัสดุ', 'warning');
            return;
        }
        
        autoSearchEquipment(equipmentNumber);
    }
    
    // ============================================
    // Form Submit
    // ============================================
    
    async function handleRepairSubmit(e) {
        e.preventDefault();
        
        if (!validateCurrentSession()) return;
        
        const equipmentInput = document.getElementById('repairEquipmentNumber');
        const equipmentValue = equipmentInput?.value.trim() || '';
        
        // ตรวจสอบว่ากรอกรหัดพัสดุหรือเลือกรายการอื่นแล้ว
        if (!equipmentValue) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: '⚠️ กรุณากรอกรหัสพัสดุหรือเลือกรายการอื่น',
                    html: `
                        <div class="text-left">
                            <p class="mb-3 text-gray-700">ฟิลด์รหัสพัสดุ/รายการอื่น ว่างเปล่า</p>
                            <div class="bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm text-gray-700">
                                <p class="mb-2"><i class="fas fa-lightbulb mr-2 text-blue-600"></i><strong>วิธีแก้:</strong></p>
                                <ul class="list-disc list-inside space-y-1">
                                    <li>กรอกรหัสพัสดุ → คลิก "ค้นหา"</li>
                                    <li>หรือ คลิกปุ่ม "อื่น" → เลือกรายการ → คลิก "ยืนยัน"</li>
                                </ul>
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3b82f6'
                });
            }
            return;
        }
        
        if (!equipmentFound && !allowOtherEquipment) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'ไม่สามารถบันทึกได้',
                    html: `
                        <div class="text-left">
                            <p class="mb-3">กรุณาตรวจสอบรหัสพัสดุให้ถูกต้อง</p>
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p class="text-red-800 text-sm">
                                    <i class="fas fa-exclamation-circle mr-2"></i>
                                    ระบบไม่พบรหัสพัสดุนี้ในฐานข้อมูล
                                </p>
                                <p class="text-red-600 text-xs mt-2">
                                    หากมั่นใจว่ารหัสถูกต้อง กรุณาติดต่อเจ้าหน้าที่เพื่อเพิ่มพัสดุในระบบก่อน
                                </p>
                                <p class="text-blue-600 text-xs mt-3">
                                    <i class="fas fa-lightbulb mr-1"></i>หรือ คลิกปุ่ม "อื่น" เพื่อแจ้งซ่อมรายการอื่น
                                </p>
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                safeShowNotification('ไม่พบรหัสพัสดุในระบบ กรุณาตรวจสอบให้ถูกต้อง', 'error');
            }
            return;
        }
        
        const form = e.target;
        const submitBtn = document.getElementById('saveRepairBtn');
        const originalText = submitBtn.innerHTML;
        
        const editId = form.getAttribute('data-edit-id');
        const isEdit = !!editId;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>กำลังบันทึก...';
            
            const formData = new FormData(form);
            const repairData = {};
            
            for (let [key, value] of formData.entries()) {
                if (key !== 'image') {
                    repairData[key] = value;
                }
            }
            
            const imageFile = document.getElementById('repairProblemImage').files[0];
            if (imageFile) {
                const base64 = await safeImageToBase64(imageFile);
                
                const uploadResult = await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .uploadImage(base64, `repair_${Date.now()}.jpg`);
                });
                
                if (uploadResult.status === 'success') {
                    repairData.image_url = uploadResult.url;
                }
            }
            
            const sessionId = getSafeSessionId();
            
            if (isEdit) {
                google.script.run
                    .withSuccessHandler(function(result) {
                        onRepairSaveSuccess(result);
                        form.removeAttribute('data-edit-id');
                    })
                    .withFailureHandler(onRepairSaveError)
                    .updateRepairData(editId, repairData, sessionId);
            } else {
                google.script.run
                    .withSuccessHandler(onRepairSaveSuccess)
                    .withFailureHandler(onRepairSaveError)
                    .submitRepairRequestWithSession(repairData, sessionId);
            }
            
        } catch (error) {
            console.error('Repair submit error:', error);
            safeShowNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    function onRepairSaveSuccess(result) {
        const submitBtn = document.getElementById('saveRepairBtn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึก';
        
        if (result.status === 'success') {
            safeShowNotification('ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว', 'success');
            hideRepairModal();
            loadRepairData();
            
            if (result.repair) {
                setTimeout(() => {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'ส่งคำร้องเรียบร้อย!',
                            html: `
                                <p>รหัสการแจ้งซ่อม: <strong>${result.repair.id.substring(0, 8)}</strong></p>
                                <p>รหัสพัสดุ: <strong>${result.repair.equipment_number}</strong></p>
                                <p class="text-sm text-gray-600 mt-2">เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง</p>
                            `,
                            icon: 'success',
                            confirmButtonText: 'ตกลง'
                        });
                    }
                }, 500);
            }
        } else {
            safeShowNotification(result.message || 'เกิดข้อผิดพลาด', 'error');
        }
    }
    
    function onRepairSaveError(error) {
        const submitBtn = document.getElementById('saveRepairBtn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึก';
        
        console.error('Repair save error:', error);
        safeShowNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
    
    // ============================================
    // Image Handling
    // ============================================
    
async function handleRepairImageUpload(e) {
    const file = e.target.files[0];
    if (!file) {
        clearRepairImagePreview();
        return;
    }
    
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
        safeShowNotification('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'warning');
        e.target.value = '';
        return;
    }
    
    // ตรวจสอบขนาดไฟล์
    if (file.size > 5 * 1024 * 1024) {
        safeShowNotification('ขนาดไฟล์ต้องไม่เกิน 5MB', 'warning');
        e.target.value = '';
        return;
    }
    
    try {
        // แปลงไฟล์เป็น base64 เพื่อแสดง preview
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Data = event.target.result;
            showRepairImagePreview(base64Data);
        };
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            safeShowNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Image handling error:', error);
        safeShowNotification('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    }
}
    
function showRepairImagePreview(src) {
    const placeholder = document.getElementById('repairUploadPlaceholder');
    const preview = document.getElementById('repairImagePreview');
    const previewImg = document.getElementById('repairPreviewImg');
    
    if (!placeholder || !preview || !previewImg) {
        console.error('Preview elements not found:', {
            placeholder: !!placeholder,
            preview: !!preview,
            previewImg: !!previewImg
        });
        return;
    }
    
    // ซ่อน placeholder และแสดง preview
    placeholder.style.display = 'none';
    preview.classList.remove('hidden');
    preview.style.display = 'block';
    
    // ตั้งค่ารูปภาพ
    previewImg.src = src;
    previewImg.style.display = 'block';
    previewImg.style.maxWidth = '100%';
    previewImg.style.maxHeight = '200px';
    previewImg.style.objectFit = 'contain';
    
    console.log('Image preview set successfully');
}

    
function clearRepairImagePreview() {
    const placeholder = document.getElementById('repairUploadPlaceholder');
    const preview = document.getElementById('repairImagePreview');
    const previewImg = document.getElementById('repairPreviewImg');
    const imageInput = document.getElementById('repairProblemImage');
    
    if (placeholder) {
        placeholder.style.display = 'block';
    }
    
    if (preview) {
        preview.classList.add('hidden');
        preview.style.display = 'none';
    }
    
    if (previewImg) {
        previewImg.src = '';
    }
    
    if (imageInput) {
        imageInput.value = '';
    }
    
    uploadedImageUrl = '';
}

function removeRepairImage(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    clearRepairImagePreview();
    safeShowNotification('ลบรูปภาพแล้ว', 'info');
}
    
    // ============================================
    // Scanner Functions
    // ============================================
    
    function startBarcodeScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            safeShowNotification('ระบบสแกนบาร์โค้ดไม่พร้อมใช้งาน', 'error');
            return;
        }
        
        if (typeof Swal === 'undefined') {
            safeShowNotification('ระบบ Dialog ไม่พร้อมใช้งาน', 'error');
            return;
        }
        
        Swal.fire({
            title: 'สแกนบาร์โค้ด',
            html: '<div id="swalQrReader" style="width: 100%;"></div>',
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
            showConfirmButton: false,
            didOpen: () => {
                const qrReader = new Html5Qrcode("swalQrReader");
                
                qrReader.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        const input = document.getElementById('repairEquipmentNumber');
                        if (input) {
                            input.value = decodedText;
                            autoSearchEquipment(decodedText);
                        }
                        qrReader.stop();
                        Swal.close();
                        safeShowNotification('สแกนบาร์โค้ดเรียบร้อย', 'success');
                    },
                    (error) => {
                        // Ignore scan errors
                    }
                ).catch(err => {
                    console.error('QR scanner error:', err);
                    Swal.close();
                    safeShowNotification('ไม่สามารถเปิดกล้องได้', 'error');
                });
            }
        });
    }
    
    function showQuickScanModal() {
        if (!validateCurrentSession()) return;
        
        if (typeof Html5Qrcode === 'undefined') {
            safeShowNotification('ระบบสแกนบาร์โค้ดไม่พร้อมใช้งาน กรุณาใช้ปุ่ม "แจ้งซ่อมใหม่" แทน', 'warning');
            return;
        }
        
        const modal = document.getElementById('quickScanModal');
        modal?.classList.remove('hidden');
        
        setTimeout(() => {
            html5QrCode = new Html5Qrcode("qrReader");
            
            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    html5QrCode.stop();
                    hideQuickScanModal();
                    
                    showRepairModal();
                    setTimeout(() => {
                        const input = document.getElementById('repairEquipmentNumber');
                        if (input) {
                            input.value = decodedText;
                            autoSearchEquipment(decodedText);
                        }
                    }, 300);
                },
                (error) => {
                    // Ignore scan errors
                }
            ).catch(err => {
                console.error('QR scanner error:', err);
                hideQuickScanModal();
                safeShowNotification('ไม่สามารถเปิดกล้องได้', 'error');
            });
        }, 300);
    }
    
    function hideQuickScanModal() {
        const modal = document.getElementById('quickScanModal');
        modal?.classList.add('hidden');
        
        if (html5QrCode) {
            try {
                html5QrCode.stop();
            } catch (e) {
                console.log('QR scanner already stopped');
            }
            html5QrCode = null;
        }
    }
    
    // ============================================
    // Data Loading & Rendering
    // ============================================

function loadRepairData() {
    if (!repairSystemActive) return;
    if (!validateCurrentSession()) return;
    
    try {
        showRepairLoading();
        
        const sessionId = getSafeSessionId();
        
        if (window.google && window.google.script && window.google.script.run) {
            window.google.script.run
                .withSuccessHandler(onRepairDataLoaded)
                .withFailureHandler(onRepairDataError)
                .getRepairList(sessionId);  // ✅ เปลี่ยนจาก getRepairs() เป็น getRepairList()
        } else {
            throw new Error('Google Apps Script ไม่พร้อมใช้งาน');
        }
            
    } catch (error) {
        console.error('Error loading repair data:', error);
        hideRepairLoading();
        safeShowNotification('เกิดข้อผิดพลาดในการโหลดข้อมูลการซ่อม', 'error');
    }
}
    
function onRepairDataLoaded(result) {
    if (!repairSystemActive) return;
    
    hideRepairLoading();
    
    if (result.status === 'success') {
        repairList = result.repairs || [];
        
        console.log('✅ Loaded', repairList.length, 'repairs'); // เพิ่ม log
        
        renderRepairTable();
        
        if (repairList.length > 0) {
            safeShowNotification(`โหลดข้อมูล ${repairList.length} รายการเรียบร้อย`, 'success');
        }
    } else if (result.status === 'error' && result.message.includes('Session')) {
        safeShowNotification('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', 'error');
        
        setTimeout(() => {
            if (typeof window.logout === 'function') {
                window.logout();
            }
        }, 1500);
    } else {
        safeShowNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        showRepairEmpty();
    }
}

    
function onRepairDataError(error) {
    hideRepairLoading();
    console.error('Repair data error:', error);
    safeShowNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    showRepairEmpty();
}
    
  // ============================================
// REPAIR MOBILE CARD - JavaScript
// แทนที่ฟังก์ชัน renderRepairTable() ในไฟล์ js-repair.js
// ============================================

// ============================================
// แก้ไขไฟล์: js-repair.js
// ฟังก์ชัน renderRepairTable ฉบับปรับปรุง Logic
// ============================================

function renderRepairTable() {
    if (!repairSystemActive) return;
    
    const tbody = document.getElementById('repairTableBody');
    const emptyState = document.getElementById('repairEmpty');
    const paginationContainer = document.getElementById('repairPagination');
    
    let mobileCardView = document.querySelector('.repair-table-wrapper .mobile-card-view');
    if (!mobileCardView) {
        mobileCardView = document.createElement('div');
        mobileCardView.className = 'mobile-card-view';
        const tableWrapper = tbody?.closest('.repair-table-wrapper');
        if (tableWrapper) {
            tableWrapper.appendChild(mobileCardView);
        }
    }
    
    if (!tbody) return;
    
    if (repairList.length === 0) {
        tbody.innerHTML = '';
        if (mobileCardView) mobileCardView.innerHTML = '';
        emptyState?.classList.remove('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');
        return;
    }
    
    emptyState?.classList.add('hidden');
    if (paginationContainer) paginationContainer.classList.remove('hidden');
    
    // Pagination Logic
    totalRepairPages = Math.ceil(repairList.length / repairsPerPage);
    const startIndex = (currentRepairPage - 1) * repairsPerPage;
    const endIndex = Math.min(startIndex + repairsPerPage, repairList.length);
    const pageData = repairList.slice(startIndex, endIndex);
    
    // ข้อมูล User ปัจจุบัน
    const currentUser = window.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserId = currentUser.id || '';
    
    // ✅ เช็ค Admin: ต้องเป็น role admin หรือมี permission 'all'
    const isAdmin = currentUser.role === 'admin' || (currentUser.permissions && currentUser.permissions.includes('all'));
    
    // ============================================
    // 🔒 Logic การตรวจสอบสิทธิ์ (Strict Mode)
    // ============================================
    const checkPermissions = (repair) => {
        // 1. ถ้าเป็น Admin ให้ทำได้ทุกอย่าง จบการทำงานทันที
        if (isAdmin) {
            return { canEdit: true, canDelete: true };
        }

        // 2. ถ้าไม่ใช่ Admin ให้เช็คสถานะก่อน (สำคัญที่สุด)
        // สถานะที่ "ล็อค" คือ กำลังซ่อม, เสร็จสิ้น, ยกเลิก
        const isLockedStatus = ['in_progress', 'completed', 'cancelled'].includes(repair.status);
        
        if (isLockedStatus) {
            // ❌ ถ้าสถานะถูกล็อค -> ห้ามแก้ไข/ลบ ทุกกรณี (สำหรับ Non-Admin)
            return { canEdit: false, canDelete: false };
        }

        // 3. ถ้าสถานะเป็น "pending" (รอดำเนินการ)
        // อนุญาตให้แก้ไขได้ถ้าเป็น "เจ้าของเรื่อง"
        const isOwner = (repair.user_id === currentUserId);
        
        let canEdit = false;
        let canDelete = false;

        if (isOwner) {
            canEdit = true;
            canDelete = true;
        }
        
        // *หมายเหตุ: ถ้าเป็นช่าง (Technician) ไม่ควรแก้รายละเอียด Pending ของคนอื่น (ควรแค่กดรับงาน)
        // แต่ถ้าต้องการให้ช่างแก้ Pending ได้ ให้เพิ่มเงื่อนไข currentUser.role === 'technician' ที่นี่

        return { canEdit, canDelete };
    };

    // 1. Render Table View (Desktop)
    tbody.innerHTML = pageData.map((repair, index) => {
        const { canEdit, canDelete } = checkPermissions(repair);
        
        // Tooltip text
        const editTooltip = canEdit ? 'แก้ไข' : (isAdmin ? 'แก้ไข' : 'สถานะนี้ไม่สามารถแก้ไขได้');
        const deleteTooltip = canDelete ? 'ลบ' : (isAdmin ? 'ลบ' : 'สถานะนี้ไม่สามารถลบได้');
        
        // CSS Classes สำหรับปุ่ม Disabled
        const disabledClass = 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400 pointer-events-none';
        
        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${startIndex + index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-blue-600">${repair.equipment_number || '-'}</div>
                <div class="text-xs text-gray-500">${repair.equipment_name || '-'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" title="${repair.problem_description || '-'}">${repair.problem_description || '-'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${repair.reporter_name || '-'}</div>
                <div class="text-xs text-gray-500">${repair.reporter_contact || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(repair.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${window.RSI.getStatusBadge(repair.status)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${window.RSI.getPriorityBadge(repair.priority)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${window.RSI.getDamageTypeBadge(repair.damage_type || 'unknown')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                    <button class="action-btn action-btn-view" onclick="RSI.showRepairDetail('${repair.id}')" title="ดูรายละเอียด"><i class="fas fa-eye"></i></button>
                    
                    <button class="action-btn action-btn-edit ${canEdit ? '' : disabledClass}" 
                            onclick="${canEdit ? `RSI.editRepair('${repair.id}')` : 'return false;'}" 
                            title="${editTooltip}" ${canEdit ? '' : 'disabled'}>
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <button class="action-btn action-btn-delete ${canDelete ? '' : disabledClass}" 
                            onclick="${canDelete ? `RSI.deleteRepair('${repair.id}')` : 'return false;'}" 
                            title="${deleteTooltip}" ${canDelete ? '' : 'disabled'}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    
    // 2. Render Mobile Card View
    if (mobileCardView) {
        mobileCardView.innerHTML = pageData.map(repair => {
            const { canEdit, canDelete } = checkPermissions(repair);
            
            // ... (Status Config Code เหมือนเดิม) ...
            const statusConfig = {
                'pending': { bg: '#fef3c7', color: '#92400e', icon: 'fa-clock', text: 'รอดำเนินการ' },
                'in_progress': { bg: '#dbeafe', color: '#1e40af', icon: 'fa-tools', text: 'กำลังซ่อม' },
                'completed': { bg: '#dcfce7', color: '#166534', icon: 'fa-check-circle', text: 'เสร็จสิ้น' },
                'cancelled': { bg: '#fee2e2', color: '#991b1b', icon: 'fa-times-circle', text: 'ยกเลิก' }
            };
            const status = statusConfig[repair.status] || statusConfig['pending'];
            
            return `
            <div class="repair-card">
                <div class="repair-card-header">
                    <div class="repair-card-code"><i class="fas fa-qrcode"></i><span>${repair.equipment_number || 'ไม่ระบุ'}</span></div>
                    <div class="repair-card-status" style="background: ${status.bg}; color: ${status.color};"><i class="fas ${status.icon}"></i><span>${status.text}</span></div>
                </div>
                <div class="repair-card-body">
                    <div class="repair-card-title">${repair.equipment_name || '-'}</div>
                    <div class="repair-card-problem">${repair.problem_description || '-'}</div>
                    <div class="repair-card-info"><span class="repair-card-info-label"><i class="fas fa-user"></i>ผู้แจ้ง</span><span class="repair-card-info-value">${repair.reporter_name || '-'}</span></div>
                    <div class="repair-card-info"><span class="repair-card-info-label"><i class="fas fa-calendar"></i>วันที่แจ้ง</span><span class="repair-card-info-value">${formatDate(repair.created_at)}</span></div>
                </div>
                <div class="repair-card-actions">
                    <button class="repair-card-btn repair-card-btn-view" onclick="RSI.showRepairDetail('${repair.id}')"><i class="fas fa-eye"></i><span>ดู</span></button>
                    
                    <button class="repair-card-btn repair-card-btn-edit" 
                            onclick="${canEdit ? `RSI.editRepair('${repair.id}')` : 'return false;'}"
                            ${canEdit ? '' : 'disabled style="opacity: 0.3; pointer-events: none;"'}>
                        <i class="fas fa-edit"></i><span>แก้ไข</span>
                    </button>
                    
                    <button class="repair-card-btn repair-card-btn-delete" 
                            onclick="${canDelete ? `RSI.deleteRepair('${repair.id}')` : 'return false;'}"
                            ${canDelete ? '' : 'disabled style="opacity: 0.3; pointer-events: none;"'}>
                        <i class="fas fa-trash"></i><span>ลบ</span>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }
    
    renderRepairPagination();
}

// ============================================
// 🆕 Pagination Functions
// ============================================

function renderRepairPagination() {
    const container = document.getElementById('repairPaginationButtons');
    const totalCount = document.getElementById('totalRepairsCount');
    
    if (!container) return;
    
    // 🔧 อัพเดทจำนวนรายการทั้งหมด
    if (totalCount) {
        totalCount.textContent = repairList.length;
    }
    
    const buttons = [];
    
    // ปุ่มก่อนหน้า
    buttons.push(`
        <button onclick="goToRepairPage(${currentRepairPage - 1})" 
                ${currentRepairPage === 1 ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-left mr-2"></i>
            ก่อนหน้า
        </button>
    `);
    
    // แสดงข้อมูลหน้าปัจจุบัน
    const startItem = repairList.length === 0 ? 0 : (currentRepairPage - 1) * repairsPerPage + 1;
    const endItem = Math.min(currentRepairPage * repairsPerPage, repairList.length);
    buttons.push(`
        <div class="px-4 py-2 text-gray-700 font-medium">
            ${startItem}-${endItem} จาก ${repairList.length}
        </div>
    `);
    
    // ปุ่มถัดไป
    buttons.push(`
        <button onclick="goToRepairPage(${currentRepairPage + 1})" 
                ${currentRepairPage === totalRepairPages ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            ถัดไป
            <i class="fas fa-chevron-right ml-2"></i>
        </button>
    `);
    
    container.innerHTML = buttons.join('');
}

function goToRepairPage(page) {
    if (page < 1 || page > totalRepairPages) return;
    currentRepairPage = page;
    renderRepairTable();
    
    // เลื่อนขึ้นด้านบน
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make functions globally accessible
window.goToRepairPage = goToRepairPage;
window.renderRepairPagination = renderRepairPagination;

// ============================================
// Helper Functions (เพิ่มถ้ายังไม่มี)
// ============================================

function formatThaiDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'รอดำเนินการ',
        'in_progress': 'กำลังซ่อม',
        'completed': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก'
    };
    return statusMap[status] || status;
}

function getRepairStatusBadge(status) {
    const statusMap = {
        'pending': { 
            class: 'bg-yellow-100 text-yellow-800', 
            text: 'รอดำเนินการ', 
            icon: 'clock' 
        },
        'in_progress': { 
            class: 'bg-blue-100 text-blue-800', 
            text: 'กำลังซ่อม', 
            icon: 'tools' 
        },
        'completed': { 
            class: 'bg-green-100 text-green-800', 
            text: 'เสร็จสิ้น', 
            icon: 'check-circle' 
        },
        'cancelled': { 
            class: 'bg-red-100 text-red-800', 
            text: 'ยกเลิก', 
            icon: 'times-circle' 
        }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    
    return `<span class="px-2 py-1 text-xs font-medium ${statusInfo.class} rounded-full">
                <i class="fas fa-${statusInfo.icon} mr-1"></i>
                ${statusInfo.text}
            </span>`;
}


    
    // ============================================
    // Filter Functions
    // ============================================
    
    function filterRepairs() {
    const searchTerm = document.getElementById('repairSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    const damageTypeFilter = document.getElementById('damageTypeFilter')?.value || '';
    
    let filtered = [...repairList];
    
    if (searchTerm) {
        filtered = filtered.filter(r => 
            (r.equipment_number || '').toLowerCase().includes(searchTerm) ||
            (r.equipment_name || '').toLowerCase().includes(searchTerm) ||
            (r.reporter_name || '').toLowerCase().includes(searchTerm) ||
            (r.problem_description || '').toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    if (damageTypeFilter) {
        filtered = filtered.filter(r => r.damage_type === damageTypeFilter);
    }
    
    repairList = filtered;
    
    // 🆕 รีเซ็ตกลับไปหน้า 1
    currentRepairPage = 1;
    
    renderRepairTable();
}
    
    function handleSelectAll() {
        const selectAll = document.getElementById('selectAllRepairs');
        const checkboxes = document.querySelectorAll('.repair-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll?.checked || false;
        });
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
function showRepairLoading() {
    if (!repairSystemActive) return;
    
    const loading = document.getElementById('repairLoading');
    const tbody = document.getElementById('repairTableBody');
    const pagination = document.getElementById('repairPagination');
    
    if (loading) loading.classList.remove('hidden');
    if (tbody) tbody.innerHTML = '';
    if (pagination) pagination.classList.add('hidden');
}

function hideRepairLoading() {
    const loading = document.getElementById('repairLoading');
    if (loading) loading.classList.add('hidden');
}

function showRepairEmpty() {
    if (!repairSystemActive) return;
    
    const empty = document.getElementById('repairEmpty');
    const pagination = document.getElementById('repairPagination');
    
    if (empty) empty.classList.remove('hidden');
    if (pagination) pagination.classList.add('hidden');
}

RSI.showRepairDetail = function(repairId) {
    if (!repairSystemActive) return;
    if (!validateCurrentSession()) return;
    
    const repair = repairList.find(r => r.id === repairId);
    if (!repair) return;
    
    // ดึงข้อมูลพัสดุเพื่อแสดงรูปภาพ
    google.script.run
        .withSuccessHandler(function(equipmentResult) {
            let equipmentImageUrl = '';
            if (equipmentResult.status === 'success' && equipmentResult.equipment) {
                equipmentImageUrl = equipmentResult.equipment.image_url || '';
            }
            
            if (typeof Swal !== 'undefined') {
                // สร้าง HTML สำหรับรายละเอียด
                const detailHTML = `
                    <div class="text-left" style="max-height: 70vh; overflow-y: auto;">
                        <!-- Header Section -->
                        <div class="mb-6 pb-4 border-b-2 border-gray-200">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xl font-bold text-gray-900">
                                    <i class="fas fa-wrench text-blue-600 mr-2"></i>
                                    ${repair.equipment_number}
                                </h3>
                                ${window.RSI.getStatusBadge(repair.status)}
                            </div>
                            <p class="text-sm text-gray-600">
                                <i class="far fa-clock mr-1"></i>
                                แจ้งเมื่อ: ${safeFormatDate(repair.created_at)}
                            </p>
                        </div>

                        <!-- Images Section -->
                        <div class="grid grid-cols-1 ${equipmentImageUrl || repair.image_url ? 'md:grid-cols-2' : ''} gap-4 mb-6">
                            ${equipmentImageUrl ? `
                                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                                        <i class="fas fa-box text-blue-600 mr-2"></i>
                                        รูปครุภัณฑ์
                                    </h4>
                                    <img src="${equipmentImageUrl}" 
                                         alt="รูปครุภัณฑ์" 
                                         class="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                                         onclick="window.open('${equipmentImageUrl}', '_blank')"
                                         style="max-height: 250px; object-fit: cover;">
                                </div>
                            ` : ''}
                            
                            ${repair.image_url ? `
                                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                                        <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                                        รูปปัญหา
                                    </h4>
                                    <img src="${repair.image_url}" 
                                         alt="รูปปัญหา" 
                                         class="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                                         onclick="window.open('${repair.image_url}', '_blank')"
                                         style="max-height: 250px; object-fit: cover;">
                                </div>
                            ` : ''}
                        </div>

                        <!-- Equipment Details -->
                        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                                ข้อมูลพัสดุ
                            </h4>
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span class="text-gray-600">ชื่อพัสดุ:</span>
                                    <div class="font-medium text-gray-900">${repair.equipment_name || '-'}</div>
                                </div>
                                <div>
                                    <span class="text-gray-600">ประเภท:</span>
                                    <div class="font-medium text-gray-900">${repair.equipment_type || '-'}</div>
                                </div>
                                <div>
                                    <span class="text-gray-600">ยี่ห้อ:</span>
                                    <div class="font-medium text-gray-900">${repair.equipment_brand || '-'}</div>
                                </div>
                                <div>
                                    <span class="text-gray-600">รุ่น:</span>
                                    <div class="font-medium text-gray-900">${repair.equipment_model || '-'}</div>
                                </div>
                                <div class="col-span-2">
                                    <span class="text-gray-600">สถานที่ติดตั้ง:</span>
                                    <div class="font-medium text-gray-900">
                                        <i class="fas fa-map-marker-alt text-red-500 mr-1"></i>
                                        ${repair.equipment_location || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Repair Request Details -->
                        <div class="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <i class="fas fa-user text-yellow-600 mr-2"></i>
                                ข้อมูลผู้แจ้ง
                            </h4>
                            <div class="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span class="text-gray-600">ชื่อ:</span>
                                    <div class="font-medium text-gray-900">${repair.reporter_name || '-'}</div>
                                </div>
                                <div>
                                    <span class="text-gray-600">เบอร์ติดต่อ:</span>
                                    <div class="font-medium text-gray-900">
                                        <i class="fas fa-phone text-green-500 mr-1"></i>
                                        ${repair.reporter_contact || '-'}
                                    </div>
                                </div>
                                <div class="col-span-2">
                                    <span class="text-gray-600">ลักษณะปัญหา:</span>
                                    <div class="font-medium text-gray-900 mt-1 p-3 bg-white rounded border border-yellow-300 whitespace-pre-wrap">
                                        ${repair.problem_description || '-'}
                                    </div>
                                </div>
                                <div>
                                    <span class="text-gray-600">ระดับความเร่งด่วน:</span>
                                    <div class="mt-1">${window.RSI.getPriorityBadge(repair.priority)}</div>
                                </div>
                                <div>
                                    <span class="text-gray-600">ประเภทความเสียหาย:</span>
                                    <div class="mt-1">${window.RSI.getDamageTypeBadge(repair.damage_type || 'unknown')}</div>
                                </div>
                            </div>
                        </div>

                        <!-- ✅ เพิ่มส่วนแสดงหมายเหตุการซ่อม - แสดงทุกสถานะยกเว้น pending -->
                        ${repair.status !== 'pending' && repair.repair_notes ? `
                            <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                    <i class="fas fa-clipboard-check text-blue-600 mr-2"></i>
                                    หมายเหตุการซ่อม
                                </h4>
                                <div class="text-sm">
                                    <div class="p-3 bg-white rounded border border-blue-300 whitespace-pre-wrap text-gray-900 mb-3">
                                        ${repair.repair_notes}
                                    </div>
                                    ${repair.repair_cost > 0 ? `
                                        <div class="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                            <span class="text-gray-700 font-semibold">
                                                <i class="fas fa-dollar-sign text-green-600 mr-2"></i>
                                                ค่าใช้จ่ายในการซ่อม
                                            </span>
                                            <span class="text-xl font-bold text-green-700">
                                                ${repair.repair_cost.toLocaleString()} บาท
                                            </span>
                                        </div>
                                    ` : ''}
                                    ${repair.technician_name ? `
                                        <div class="mt-2 text-xs text-gray-600">
                                            <i class="fas fa-user-cog mr-1"></i>
                                            ช่างผู้รับผิดชอบ: <span class="font-semibold">${repair.technician_name}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- ✅ รูปภาพหลังซ่อม (ถ้ามี) -->
                        ${repair.repair_image_url ? `
                            <div class="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                    <i class="fas fa-camera text-green-600 mr-2"></i>
                                    รูปภาพหลังซ่อม
                                </h4>
                                <div class="relative group">
                                    <img src="${repair.repair_image_url}" 
                                         alt="รูปหลังซ่อม" 
                                         class="w-full rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                                         style="max-height: 300px; object-fit: contain; background: white;"
                                         onclick="window.open('${repair.repair_image_url}', '_blank')">
                                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                                        <i class="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- ✅ รายการอะไหล่ที่ใช้ (ถ้ามี) -->
                        ${(() => {
                            let spareParts = repair.spare_parts || [];
                            if (typeof spareParts === 'string') {
                                try {
                                    spareParts = JSON.parse(spareParts);
                                } catch (e) {
                                    spareParts = [];
                                }
                            }
                            
                            if (!spareParts || spareParts.length === 0) return '';
                            
                            let totalCost = 0;
                            const rows = spareParts.map((part, idx) => {
                                const partTotal = (part.qty || 0) * (part.price || 0);
                                totalCost += partTotal;
                                return `
                                    <tr class="border-b border-purple-200 last:border-0 bg-white hover:bg-purple-50">
                                        <td class="py-2 px-3 text-sm text-gray-700">${idx + 1}</td>
                                        <td class="py-2 px-3 text-sm text-gray-900 font-medium">${part.name || '-'}</td>
                                        <td class="py-2 px-3 text-sm text-gray-700 text-center">${part.qty || 0}</td>
                                        <td class="py-2 px-3 text-sm text-gray-700 text-right">฿${(part.price || 0).toLocaleString()}</td>
                                        <td class="py-2 px-3 text-sm text-purple-700 text-right font-bold">฿${partTotal.toLocaleString()}</td>
                                    </tr>
                                `;
                            }).join('');
                            
                            return `
                                <div class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                    <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                        <i class="fas fa-cog text-purple-600 mr-2"></i>
                                        รายการอะไหล่ที่ใช้
                                    </h4>
                                    <div class="overflow-x-auto rounded-lg border border-purple-200">
                                        <table class="w-full text-left text-sm">
                                            <thead class="bg-purple-100 text-purple-800">
                                                <tr>
                                                    <th class="py-2 px-3 text-xs font-semibold">#</th>
                                                    <th class="py-2 px-3 text-xs font-semibold">รายการ</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-center">จำนวน</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-right">ราคา/หน่วย</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-right">รวม</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${rows}
                                            </tbody>
                                            <tfoot class="bg-purple-50">
                                                <tr>
                                                    <td colspan="4" class="py-2 px-3 text-sm font-bold text-gray-700 text-right">รวมค่าอะไหล่สุทธิ:</td>
                                                    <td class="py-2 px-3 text-sm font-bold text-purple-700 text-right border-t-2 border-purple-200">฿${totalCost.toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            `;
                        })()}

                        <!-- Update Time -->
                        ${repair.updated_at && repair.updated_at !== repair.created_at ? `
                            <div class="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-300">
                                <i class="far fa-clock mr-2"></i>
                                <span>อัพเดตล่าสุด: ${safeFormatDate(repair.updated_at)}</span>
                            </div>
                        ` : ''}
                    </div>
                `;

                Swal.fire({
                    title: '<span style="font-size: 1.5rem;">รายละเอียดการซ่อม</span>',
                    html: detailHTML,
                    width: '900px',
                    showCloseButton: true,
                    confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
                    confirmButtonColor: '#6b7280',
                    customClass: {
                        popup: 'repair-detail-modal',
                        htmlContainer: 'repair-detail-content'
                    }
                });
            } else {
                // Fallback ถ้าไม่มี SweetAlert2
                safeShowNotification(`ดูรายละเอียดการซ่อม: ${repair.equipment_number}`, 'info');
            }
        })
        .withFailureHandler(function(error) {
            console.error('Get equipment error:', error);
            
            // แสดงรายละเอียดโดยไม่มีรูปพัสดุ
            if (typeof Swal !== 'undefined') {
                const detailHTML = `
                    <div class="text-left" style="max-height: 70vh; overflow-y: auto;">
                        <div class="mb-6 pb-4 border-b-2 border-gray-200">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xl font-bold text-gray-900">
                                    <i class="fas fa-wrench text-blue-600 mr-2"></i>
                                    ${repair.equipment_number}
                                </h3>
                                ${window.RSI.getStatusBadge(repair.status)}
                            </div>
                            <p class="text-sm text-gray-600">
                                <i class="far fa-clock mr-1"></i>
                                แจ้งเมื่อ: ${safeFormatDate(repair.created_at)}
                            </p>
                        </div>

                        ${repair.image_url ? `
                            <div class="mb-6">
                                <img src="${repair.image_url}" 
                                     alt="รูปปัญหา" 
                                     class="w-full rounded-lg shadow-md cursor-pointer"
                                     onclick="window.open('${repair.image_url}', '_blank')"
                                     style="max-height: 300px; object-fit: contain;">
                            </div>
                        ` : ''}

                        <!-- Equipment Details -->
                        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                            <h4 class="font-bold text-gray-800 mb-3">ข้อมูลพัสดุ</h4>
                            <div class="text-sm space-y-2">
                                <div><strong>ชื่อ:</strong> ${repair.equipment_name || '-'}</div>
                                <div><strong>ประเภท:</strong> ${repair.equipment_type || '-'}</div>
                                <div><strong>ยี่ห้อ/รุ่น:</strong> ${repair.equipment_brand || '-'} ${repair.equipment_model || ''}</div>
                                <div><strong>สถานที่:</strong> ${repair.equipment_location || '-'}</div>
                            </div>
                        </div>

                        <!-- Reporter Details -->
                        <div class="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                            <h4 class="font-bold text-gray-800 mb-3">ข้อมูลผู้แจ้ง</h4>
                            <div class="text-sm space-y-2">
                                <div><strong>ชื่อ:</strong> ${repair.reporter_name || '-'}</div>
                                <div><strong>เบอร์:</strong> ${repair.reporter_contact || '-'}</div>
                                <div><strong>ปัญหา:</strong><br>${repair.problem_description || '-'}</div>
                                <div><strong>ความเร่งด่วน:</strong> ${window.RSI.getPriorityBadge(repair.priority)}</div>
                            </div>
                        </div>

                        <!-- ✅ เพิ่มส่วนแสดงหมายเหตุการซ่อม - แสดงทุกสถานะยกเว้น pending -->
                        ${repair.status !== 'pending' && repair.repair_notes ? `
                            <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                    <i class="fas fa-clipboard-check text-blue-600 mr-2"></i>
                                    หมายเหตุการซ่อม
                                </h4>
                                <div class="text-sm">
                                    <div class="p-3 bg-white rounded border border-blue-300 whitespace-pre-wrap text-gray-900 mb-3">
                                        ${repair.repair_notes}
                                    </div>
                                    ${repair.repair_cost > 0 ? `
                                        <div class="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                            <span class="text-gray-700 font-semibold">
                                                <i class="fas fa-dollar-sign text-green-600 mr-2"></i>
                                                ค่าใช้จ่ายในการซ่อม
                                            </span>
                                            <span class="text-xl font-bold text-green-700">
                                                ${repair.repair_cost.toLocaleString()} บาท
                                            </span>
                                        </div>
                                    ` : ''}
                                    ${repair.technician_name ? `
                                        <div class="mt-2 text-xs text-gray-600">
                                            <i class="fas fa-user-cog mr-1"></i>
                                            ช่างผู้รับผิดชอบ: <span class="font-semibold">${repair.technician_name}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- ✅ รูปภาพหลังซ่อม -->
                        ${repair.repair_image_url ? `
                            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 class="font-bold text-gray-800 mb-3">
                                    <i class="fas fa-camera text-green-600 mr-2"></i>
                                    รูปภาพหลังซ่อม
                                </h4>
                                <img src="${repair.repair_image_url}" 
                                     alt="รูปหลังซ่อม" 
                                     class="w-full rounded-lg shadow-md cursor-pointer"
                                     onclick="window.open('${repair.repair_image_url}', '_blank')"
                                     style="max-height: 300px; object-fit: contain;">
                            </div>
                        ` : ''}

                        <!-- ✅ รายการอะไหล่ที่ใช้ (ถ้ามี) - Fallback version -->
                        ${(() => {
                            let spareParts = repair.spare_parts || [];
                            if (typeof spareParts === 'string') {
                                try {
                                    spareParts = JSON.parse(spareParts);
                                } catch (e) {
                                    spareParts = [];
                                }
                            }
                            
                            if (!spareParts || spareParts.length === 0) return '';
                            
                            let totalCost = 0;
                            const rows = spareParts.map((part, idx) => {
                                const partTotal = (part.qty || 0) * (part.price || 0);
                                totalCost += partTotal;
                                return `
                                    <tr class="border-b border-purple-200 last:border-0 bg-white">
                                        <td class="py-2 px-3 text-sm text-gray-700">${idx + 1}</td>
                                        <td class="py-2 px-3 text-sm text-gray-900 font-medium">${part.name || '-'}</td>
                                        <td class="py-2 px-3 text-sm text-gray-700 text-center">${part.qty || 0}</td>
                                        <td class="py-2 px-3 text-sm text-gray-700 text-right">฿${(part.price || 0).toLocaleString()}</td>
                                        <td class="py-2 px-3 text-sm text-purple-700 text-right font-bold">฿${partTotal.toLocaleString()}</td>
                                    </tr>
                                `;
                            }).join('');
                            
                            return `
                                <div class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                    <h4 class="font-bold text-gray-800 mb-3">
                                        <i class="fas fa-cog text-purple-600 mr-2"></i>
                                        รายการอะไหล่ที่ใช้
                                    </h4>
                                    <div class="overflow-x-auto rounded-lg border border-purple-200">
                                        <table class="w-full text-left text-sm">
                                            <thead class="bg-purple-100 text-purple-800">
                                                <tr>
                                                    <th class="py-2 px-3 text-xs font-semibold">#</th>
                                                    <th class="py-2 px-3 text-xs font-semibold">รายการ</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-center">จำนวน</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-right">ราคา/หน่วย</th>
                                                    <th class="py-2 px-3 text-xs font-semibold text-right">รวม</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${rows}
                                            </tbody>
                                            <tfoot class="bg-purple-50">
                                                <tr>
                                                    <td colspan="4" class="py-2 px-3 text-sm font-bold text-gray-700 text-right">รวมค่าอะไหล่สุทธิ:</td>
                                                    <td class="py-2 px-3 text-sm font-bold text-purple-700 text-right border-t-2 border-purple-200">฿${totalCost.toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            `;
                        })()}

                        ${repair.updated_at && repair.updated_at !== repair.created_at ? `
                            <div class="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-300 mt-4">
                                <i class="far fa-clock mr-2"></i>
                                <span>อัพเดตล่าสุด: ${safeFormatDate(repair.updated_at)}</span>
                            </div>
                        ` : ''}
                    </div>
                `;

                Swal.fire({
                    title: '<span style="font-size: 1.5rem;">รายละเอียดการซ่อม</span>',
                    html: detailHTML,
                    width: '900px',
                    showCloseButton: true,
                    confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
                    confirmButtonColor: '#6b7280'
                });
            }
        })
        .getEquipmentByNumber(repair.equipment_number);
};
    
RSI.editRepair = function(repairId) {
    if (!repairSystemActive) return;
    if (!validateCurrentSession()) return;
    
    const repair = repairList.find(r => r.id === repairId);
    if (!repair) {
        safeShowNotification('ไม่พบข้อมูลการแจ้งซ่อม', 'error');
        return;
    }
    
    const currentUser = window.currentUser || {};
    const isAdmin = currentUser.role === 'admin' || (currentUser.permissions && currentUser.permissions.includes('all'));
    
    // 🔒 เพิ่ม: ตรวจสอบสถานะ ห้ามแก้ไขถ้า กำลังซ่อม/เสร็จสิ้น (ยกเว้น Admin)
    const isLockedStatus = ['in_progress', 'completed', 'cancelled'].includes(repair.status);
    if (!isAdmin && isLockedStatus) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถแก้ไขได้',
            text: 'รายการนี้กำลังดำเนินการหรือเสร็จสิ้นแล้ว อนุญาตให้ Admin แก้ไขเท่านั้น',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#f59e0b'
        });
        return;
    }
    
    const isTechnician = currentUser.role === 'technician';
    const isOwner = (repair.user_id === currentUser.id);
    
    if (!isAdmin && !isTechnician && !isOwner) {
        safeShowNotification('คุณไม่มีสิทธิ์แก้ไขรายการนี้', 'error');
        return;
    }
    
    showEditRepairModal(repair);
};
    
function showEditRepairModal(repair) {
    const modal = document.getElementById('repairModal');
    if (!modal) return;
    
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = 'แก้ไขการแจ้งซ่อม';
    }
    
    document.getElementById('repairEquipmentNumber').value = repair.equipment_number || '';
    document.getElementById('repairReporterName').value = repair.reporter_name || '';
    document.getElementById('repairReporterContact').value = repair.reporter_contact || '';
    document.getElementById('repairPriority').value = repair.priority || 'normal';
    document.getElementById('repairDamageType').value = repair.damage_type || 'unknown';
    document.getElementById('repairProblemDescription').value = repair.problem_description || '';
    
    if (repair.image_url) {
        showRepairImagePreview(repair.image_url);
    }
    
    document.getElementById('repairForm').setAttribute('data-edit-id', repair.id);
    
    const submitBtn = document.getElementById('saveRepairBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกการแก้ไข';
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    equipmentFound = true;
    allowOtherEquipment = false;  // ✅ reset สถานะ allowOtherEquipment
    
    // ⭐ ส่ง repair.id ไปด้วยเพื่อยกเว้นรายการนี้
    autoSearchEquipment(repair.equipment_number, repair.id);
    
    modal.classList.remove('hidden');
}

function handleEquipmentInput(e) {
    const value = e.target.value.trim();
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    equipmentFound = false;
    updateEquipmentStatus('checking');
    
    if (!value) {
        updateEquipmentStatus('empty');
        return;
    }
    
    searchTimeout = setTimeout(() => {
        // เช็คว่าอยู่ในโหมดแก้ไขหรือไม่
        const form = document.getElementById('repairForm');
        const editId = form ? form.getAttribute('data-edit-id') : null;
        
        // ⭐ ส่ง editId ไปด้วย (ถ้ามี)
        autoSearchEquipment(value, editId);
    }, 800);
}
    
RSI.deleteRepair = function(repairId) {
    if (!repairSystemActive) return;
    if (!validateCurrentSession()) return;
    
    const repair = repairList.find(r => r.id === repairId);
    if (!repair) {
        safeShowNotification('ไม่พบข้อมูลการแจ้งซ่อม', 'error');
        return;
    }
    
    const currentUser = window.currentUser || {};
    const isAdmin = currentUser.role === 'admin' || (currentUser.permissions && currentUser.permissions.includes('all'));
    
    // 🔒 เพิ่ม: ตรวจสอบสถานะ ห้ามลบถ้า กำลังซ่อม/เสร็จสิ้น (ยกเว้น Admin)
    const isLockedStatus = ['in_progress', 'completed', 'cancelled'].includes(repair.status);
    if (!isAdmin && isLockedStatus) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถลบได้',
            text: 'รายการนี้กำลังดำเนินการหรือเสร็จสิ้นแล้ว อนุญาตให้ Admin ลบเท่านั้น',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#f59e0b'
        });
        return;
    }
    
    const isOwner = (repair.user_id === currentUser.id);
    
    if (!isAdmin && !isOwner) {
        safeShowNotification('คุณไม่มีสิทธิ์ลบรายการนี้', 'error');
        return;
    }
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'ยืนยันการลบ',
            html: `
                <div class="text-left">
                    <p class="mb-2">คุณต้องการลบการแจ้งซ่อมนี้หรือไม่?</p>
                    <div class="bg-gray-50 p-3 rounded">
                        <p><strong>รหัสพัสดุ:</strong> ${repair.equipment_number}</p>
                        <p><strong>ผู้แจ้ง:</strong> ${repair.reporter_name}</p>
                        <p><strong>ปัญหา:</strong> ${repair.problem_description.substring(0, 50)}...</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                performDeleteRepair(repairId);
            }
        });
    } else {
        if (confirm('คุณต้องการลบการแจ้งซ่อมนี้หรือไม่?')) {
            performDeleteRepair(repairId);
        }
    }
};

// ============================================
// Expose Modal Functions to RSI
// ============================================

RSI.showRepairModal = showRepairModal;
RSI.hideRepairModal = hideRepairModal;
})();

// ============================================
// Global Functions
// ============================================

window.loadRepairManagement = function() {
    if (window.RepairSystemIsolated && typeof window.RepairSystemIsolated.cleanup === 'function') {
        window.RepairSystemIsolated.cleanup();
    }
    
    setTimeout(() => {
        if (window.RepairSystemIsolated && typeof window.RepairSystemIsolated.initialize === 'function') {
            window.RepairSystemIsolated.initialize();
        }
    }, 50);
};

window.loadRepairManagementImpl = window.loadRepairManagement;

window.addEventListener('beforeunload', function() {
    if (window.RepairSystemIsolated && typeof window.RepairSystemIsolated.cleanup === 'function') {
        window.RepairSystemIsolated.cleanup();
    }
});

(function setupViewChangeDetection() {
    let currentView = window.currentView;
    
    setInterval(function() {
        if (window.currentView !== currentView) {
            if (currentView === 'repair' && window.currentView !== 'repair') {
                if (window.RepairSystemIsolated && typeof window.RepairSystemIsolated.cleanup === 'function') {
                    window.RepairSystemIsolated.cleanup();
                }
            }
            currentView = window.currentView;
        }
    }, 500);
})();

// 🔧 เพิ่มบรรทัดนี้ที่นี่:
window.RSI = window.RepairSystemIsolated;
</script>
