<script>
// ============================================
// js-spare-parts.js - Spare Parts/Materials Tracking
// ============================================

let sparePartsData = {
    allSpareParts: [],
    currentRepairId: null,
    repairSpareParts: [],
    allRepairs: [],
    currentPartImage: null,
    inventoryList: [],
    pickerInventory: [],
    // Pagination
    inventoryPage: 1,
    inventoryPerPage: 20,
    // Low stock threshold
    lowStockThreshold: 5,
    stockAlertShown: false
};

let sparePartsChart = null;

window.techAllAvailableParts = [];
window.techFilteredParts = [];
window.techCurrentPage = 1;
window.techPartsPerPage = 10;

// ============================================
// Show Spare Parts Tab from Submenu
// ============================================
function showSparePartsTab(tabName) {
    // โหลด Spare Parts Management หากยังไม่ได้โหลด
    loadSparePartsManagement();
    
    // Switch to specific tab
    setTimeout(() => {
        const tabMap = {
            'inventory': 'list',
            'record': 'repair',
            'requests': 'approval',
            'analytics': 'analytics'
        };
        
        const actualTab = tabMap[tabName] || tabName;
        switchSparePartsTab(actualTab);
        closeSidebar();
    }, 100);
}

// ============================================
// Load Spare Parts Management
// ============================================
function loadSparePartsManagement() {
    try {
        setActiveNavItem('sparePartsBtn');
        currentView = 'spareParts';
        
        var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        var isAdmin = currentUser.role === 'admin';
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = '\
            <div class="animate-fadeIn">\
                <div class="mb-8">\
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">🔧 Spare Parts Tracking</h1>\
                    <p class="text-gray-600">จัดการอะไหล่และวัสดุสำหรับการซ่อม</p>\
                </div>\
                <div id="sparePartsTabContent"></div>\
            </div>\
        ';

        // Initialize first tab
        switchSparePartsTab('list');
        
        // Load pending count for admin
        if (isAdmin) {
            loadPendingRequestsCount();
        }

    } catch (error) {
        console.error('Error loading spare parts management:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลด Spare Parts', 'error');
    }
}

// ============================================
// Switch Tabs
// ============================================
function switchSparePartsTab(tabName) {
    const content = document.getElementById('sparePartsTabContent');

    switch (tabName) {
        case 'list':
            showSparePartsListTab();
            break;
        case 'repair':
            showSparePartsRepairTab();
            break;
        case 'approval':
            showSparePartsApprovalTab();
            break;
        case 'analytics':
            showSparePartsAnalyticsTab();
            break;
    }
}

// ============================================
// Tab 1: Spare Parts Inventory List
// ============================================
function showSparePartsListTab() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var isAdmin = currentUser.role === 'admin';
    
    var content = document.getElementById('sparePartsTabContent');
    content.innerHTML = '\
        <div class="bg-white rounded-lg shadow-md p-4 md:p-6">\
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">\
                <h2 class="text-xl font-semibold text-gray-800">\
                    <i class="fas fa-boxes text-blue-600 mr-2"></i>คลังอะไหล่\
                </h2>\
                <div class="flex gap-2 w-full md:w-auto">\
                    ' + (isAdmin ? '<button onclick="showAddSparePartToInventory()" class="flex-1 md:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><i class="fas fa-plus mr-2"></i>เพิ่มอะไหล่</button>' : '') + '\
                    <button onclick="loadSparePartsInventory()" class="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">\
                        <i class="fas fa-sync-alt"></i>\
                    </button>\
                </div>\
            </div>\
            <div class="flex flex-col gap-4 mb-6">\
                <input type="text" id="sparePartsSearch" placeholder="🔍 ค้นหาอะไหล่ หรือ สถานที่เก็บ..." \
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">\
                <select id="sparePartsSupplierFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg" onchange="searchSparePartsInventory()">\
                    <option value="">ทุกซัพพลายเออร์</option>\
                </select>\
            </div>\
            <!-- *** มือถือ: แสดง Card View *** -->\
            <div id="sparePartsCardView" class="md:hidden grid grid-cols-1 gap-4">\
            </div>\
            <!-- *** คอมพิวเตอร์: แสดง Table View *** -->\
            <div id="sparePartsTableView" class="hidden md:block overflow-x-auto">\
                <table class="w-full text-sm">\
                    <thead class="bg-gray-100 border-b-2 border-gray-200">\
                        <tr>\
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ชื่ออะไหล่</th>\
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">รับเข้า</th>\
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">ใช้ไป</th>\
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">คงเหลือ</th>\
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">ราคา/หน่วย</th>\
                            <!-- ✅ เพิ่ม Header สถานที่เก็บ --> \
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">สถานที่เก็บ</th>\
                            <th class="px-4 py-3 text-left font-semibold text-gray-700">ซัพพลายเออร์</th>\
                            <th class="px-4 py-3 text-center font-semibold text-gray-700">การกระทำ</th>\
                        </tr>\
                    </thead>\
                    <tbody id="sparePartsInventoryTable" class="divide-y divide-gray-200">\
                        <tr><td colspan="8" class="px-4 py-3 text-center text-gray-600">กำลังโหลด...</td></tr>\
                    </tbody>\
                </table>\
            </div>\
        </div>\
    ';

    sparePartsData.stockAlertShown = false;
    loadSparePartsInventory();
}

// ============================================
// Tab 2: Record Spare Parts from Repair
// ============================================
function showSparePartsRepairTab() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var isAdmin = currentUser.role === 'admin';
    
    var content = document.getElementById('sparePartsTabContent');
    content.innerHTML = '\
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">\
            <div class="lg:col-span-1 bg-white rounded-lg shadow-md p-6">\
                <h3 class="text-lg font-semibold text-gray-800 mb-4">\
                    <i class="fas fa-wrench text-blue-600 mr-2"></i>\
                    เลือกงานซ่อม\
                </h3>\
                <input type="text" id="repairSearchInput" placeholder="ค้นหาเลขที่งานซ่อม..." \
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"\
                       oninput="filterRepairsForSpareParts()">\
                <div id="repairSelectList" class="space-y-2 max-h-96 overflow-y-auto">\
                    <div class="text-center py-4 text-gray-600">กำลังโหลด...</div>\
                </div>\
            </div>\
            <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">\
                <h3 class="text-lg font-semibold text-gray-800 mb-4" id="repairDetailTitle">\
                    <i class="fas fa-info-circle text-green-600 mr-2"></i>\
                    เลือกงานซ่อมเพื่อบันทึกอะไหล่\
                </h3>\
                <div id="repairDetailInfo" class="mb-6 p-4 bg-blue-50 rounded-lg hidden">\
                    <div class="grid grid-cols-2 gap-4 text-sm">\
                        <div>\
                            <span class="text-gray-600">รหัสพัสดุ:</span>\
                            <div id="selectedRepairEquipment" class="font-semibold"></div>\
                        </div>\
                        <div>\
                            <span class="text-gray-600">ผู้แจ้ง:</span>\
                            <div id="selectedRepairReporter" class="font-semibold"></div>\
                        </div>\
                        <div>\
                            <span class="text-gray-600">วันที่แจ้ง:</span>\
                            <div id="selectedRepairDate" class="font-semibold"></div>\
                        </div>\
                        <div>\
                            <span class="text-gray-600">ช่าง:</span>\
                            <div id="selectedRepairTech" class="font-semibold"></div>\
                        </div>\
                    </div>\
                </div>\
                <div id="sparePartForm" class="space-y-4 hidden">\
                    <div class="flex gap-2 mb-4">\
                        <button onclick="showPickFromInventory()" class="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-medium">\
                            <i class="fas fa-warehouse mr-2"></i>ดึงจากคลัง\
                        </button>\
                        <button onclick="showRequestNewPartForm()" class="flex-1 bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-medium">\
                            <i class="fas fa-file-alt mr-2"></i>ขอเบิกใหม่\
                        </button>\
                    </div>\
                    <div id="pendingRequestsList" class="hidden">\
                        <h4 class="font-semibold text-gray-700 mb-2"><i class="fas fa-clock text-orange-500 mr-2"></i>รายการรออนุมัติ</h4>\
                        <div id="pendingRequestsContent" class="space-y-2 max-h-40 overflow-y-auto"></div>\
                    </div>\
                </div>\
                <div id="selectedRepairSparePartsList" class="mt-6 hidden">\
                    <div class="flex justify-between items-center mb-3">\
                        <h4 class="font-semibold text-gray-800">อะไหล่ในงานซ่อมนี้</h4>\
                    </div>\
                    <div class="space-y-2 overflow-y-auto max-h-64"></div>\
                </div>\
            </div>\
        </div>\
    ';

    loadRepairsForSpareParts();
}

function addAnotherSparePartForm() {
    clearSparePartForm();
    var nameInput = document.getElementById('sparePartName');
    if (nameInput) nameInput.focus();
}

// ============================================
// Tab 3: Analytics
// ============================================
function showSparePartsAnalyticsTab() {
    const content = document.getElementById('sparePartsTabContent');
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Date Range Filter -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">จากวันที่</label>
                        <input type="date" id="sparePartsDateFrom" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">ถึงวันที่</label>
                        <input type="date" id="sparePartsDateTo" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div class="flex items-end">
                        <button onclick="loadSparePartsAnalytics()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>ค้นหา
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <p class="text-blue-100 text-sm">ค่าใช้จ่ายอะไหล่ทั้งหมด</p>
                    <p class="text-3xl font-bold mt-2" id="kpiTotalCost">-</p>
                </div>

                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                    <p class="text-green-100 text-sm">จำนวนอะไหล่ที่ใช้</p>
                    <p class="text-3xl font-bold mt-2" id="kpiPartCount">-</p>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                    <p class="text-purple-100 text-sm">ราคาเฉลี่ยต่ออะไหล่</p>
                    <p class="text-3xl font-bold mt-2" id="kpiAvgCost">-</p>
                </div>

                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                    <p class="text-orange-100 text-sm">จำนวนหน่วยรวม</p>
                    <p class="text-3xl font-bold mt-2" id="kpiTotalQty">-</p>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Cost by Supplier -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">ค่าใช้จ่ายตามซัพพลายเออร์</h3>
                    <div style="position: relative; height: 300px; width: 100%;">
                        <canvas id="supplierCostChart"></canvas>
                    </div>
                </div>

                <!-- Top Parts -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">อะไหล่ที่ใช้บ่อยที่สุด</h3>
                    <div style="position: relative; height: 300px; width: 100%;">
                        <canvas id="topPartsChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Detailed Stats Table -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">สรุปรายชื่อซัพพลายเออร์</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left">ชื่อซัพพลายเออร์</th>
                                <th class="px-4 py-3 text-center">ค่าใช้จ่าย (บาท)</th>
                                <th class="px-4 py-3 text-center">เปอร์เซ็นต์</th>
                            </tr>
                        </thead>
                        <tbody id="suppliersTable" class="divide-y divide-gray-200">
                            <tr><td colspan="3" class="px-4 py-3 text-center text-gray-600">กำลังโหลด...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Set default dates
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    document.getElementById('sparePartsDateFrom').valueAsDate = thirtyDaysAgo;
    document.getElementById('sparePartsDateTo').valueAsDate = today;

    loadSparePartsAnalytics();
}

// ============================================
// Load Repairs for Spare Parts (พร้อม Loading + กรองงาน)
// ============================================
function loadRepairsForSpareParts() {
    const sessionId = localStorage.getItem('sessionId');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUserName = currentUser.name || currentUser.username || '';
    const userRole = currentUser.role || '';

    // ✅ 1. แสดงสถานะกำลังโหลด (Loading) ทันทีที่เรียกฟังก์ชัน
    const listContainer = document.getElementById('repairSelectList');
    if (listContainer) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-500">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                <p class="text-sm">กำลังโหลดงานซ่อม...</p>
            </div>
        `;
    }

    google.script.run
        .withSuccessHandler((result) => {
            if (result.status === 'success') {
                const allRepairs = result.repairs || [];

                // 2. กรองข้อมูล (กำลังซ่อม + เป็นงานของฉัน)
                const myRepairs = allRepairs.filter(r => {
                    const isInProgress = r.status === 'in_progress';
                    const isMyJob = (userRole === 'admin') || (r.technician_name === currentUserName);
                    return isInProgress && isMyJob;
                });

                sparePartsData.allRepairs = myRepairs;
                displayRepairsForSpareParts(sparePartsData.allRepairs);
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
                if (listContainer) {
                    listContainer.innerHTML = `
                        <div class="text-center py-8 text-red-500">
                            <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                            <p>โหลดข้อมูลไม่สำเร็จ</p>
                        </div>
                    `;
                }
            }
        })
        .withFailureHandler((error) => {
            console.error('Error loading repairs:', error);
            showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูลการซ่อม', 'error');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="text-center py-8 text-red-500">
                        <i class="fas fa-wifi text-2xl mb-2"></i>
                        <p>เกิดข้อผิดพลาดในการเชื่อมต่อ</p>
                    </div>
                `;
            }
        })
        .getRepairsForTechnician(sessionId);
}

function displayRepairsForSpareParts(repairs) {
    const list = document.getElementById('repairSelectList');
    
    if (repairs.length === 0) {
        list.innerHTML = `
            <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <i class="fas fa-user-clock text-4xl mb-2 text-gray-400"></i>
                <p class="font-medium text-gray-600">ไม่พบงานซ่อมของคุณ</p>
                <p class="text-xs mt-1 text-gray-500">
                    รายการนี้จะแสดงเฉพาะงานที่คุณรับผิดชอบ<br>
                    และมีสถานะ "กำลังซ่อม" เท่านั้น
                </p>
            </div>
        `;
        return;
    }

    list.innerHTML = repairs.map(repair => `
        <div onclick="selectRepairForSpareParts('${repair.id}')" 
             class="p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition mb-2 bg-white shadow-sm relative group">
            
            <div class="absolute top-2 right-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <i class="fas fa-tools mr-1"></i>กำลังซ่อม
                </span>
            </div>

            <div class="font-bold text-gray-800 text-lg">${repair.equipment_number}</div>
            <div class="text-sm text-gray-600 mb-1">${repair.equipment_name}</div>
            
            <div class="text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    <i class="fas fa-user-cog mr-1"></i>${repair.technician_name}
                </span>
                <span><i class="fas fa-calendar mr-1"></i>${new Date(repair.created_at).toLocaleDateString('th-TH')}</span>
            </div>
        </div>
    `).join('');
}

function filterRepairsForSpareParts() {
    const searchTerm = document.getElementById('repairSearchInput').value.toLowerCase();
    const filtered = sparePartsData.allRepairs.filter(r => 
        r.equipment_number.toLowerCase().includes(searchTerm) ||
        r.equipment_name.toLowerCase().includes(searchTerm)
    );
    displayRepairsForSpareParts(filtered);
}

function selectRepairForSpareParts(repairId) {
    const repair = sparePartsData.allRepairs.find(r => r.id === repairId);
    if (!repair) return;

    sparePartsData.currentRepairId = repairId;

    // Update detail info
    document.getElementById('repairDetailInfo').classList.remove('hidden');
    document.getElementById('repairDetailTitle').innerHTML = '<i class="fas fa-info-circle text-green-600 mr-2"></i>งานซ่อม: ' + repair.equipment_number;

    document.getElementById('selectedRepairEquipment').textContent = repair.equipment_number;
    document.getElementById('selectedRepairReporter').textContent = repair.reporter_name;
    document.getElementById('selectedRepairDate').textContent = new Date(repair.created_at).toLocaleDateString('th-TH');
    document.getElementById('selectedRepairTech').textContent = repair.technician_name || 'ยังไม่มีช่าง';

    // Show form
    document.getElementById('sparePartForm').classList.remove('hidden');

    // Load existing spare parts
    loadRepairSpareParts(repairId);
    
    // Load pending requests for this repair
    loadRepairPendingRequests(repairId);
}

// ============================================
// Spare Parts CRUD Operations
// ============================================
function loadSparePartsInventory() {
    const sessionId = localStorage.getItem('sessionId');

    google.script.run
        .withSuccessHandler((result) => {
            if (result.status === 'success') {
                sparePartsData.allSpareParts = result.inventory || [];
                displaySparePartsInventory(sparePartsData.allSpareParts);
            }
        })
        .withFailureHandler(() => {
            showNotification('เกิดข้อผิดพลาดในการโหลดคลังอะไหล่', 'error');
        })
        .getSparePartsInventory(sessionId);
}

function displaySparePartsInventory(inventory) {
    const table = document.getElementById('sparePartsInventoryTable');
    const cardView = document.getElementById('sparePartsCardView');
    
    if (!table && !cardView) {
        sparePartsData.allSpareParts = inventory;
        return;
    }
    
    if (inventory.length === 0) {
        // ปรับ colspan เป็น 8 ให้ตรงกับหัวตาราง
        if (table) table.innerHTML = '<tr><td colspan="8" class="px-4 py-3 text-center text-gray-600">ไม่มีข้อมูลอะไหล่</td></tr>';
        if (cardView) cardView.innerHTML = '<div class="text-center text-gray-600 py-8">ไม่มีข้อมูลอะไหล่</div>';
        return;
    }

    sparePartsData.inventoryList = inventory;
    
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    var isAdmin = currentUser.role === 'admin';

    // ... (ส่วนแจ้งเตือน Stock - คงเดิม) ...
    const lowStockItems = inventory.filter(p => {
        const remaining = (p.stock_quantity || 0) - (p.used_quantity || 0);
        return remaining > 0 && remaining <= sparePartsData.lowStockThreshold;
    });
    const outOfStockItems = inventory.filter(p => {
        const remaining = (p.stock_quantity || 0) - (p.used_quantity || 0);
        return remaining <= 0;
    });
    
    if (!sparePartsData.stockAlertShown && (lowStockItems.length > 0 || outOfStockItems.length > 0)) {
        sparePartsData.stockAlertShown = true;
        let alertHtml = '';
        if (outOfStockItems.length > 0) {
            alertHtml += '<div style="color: #dc2626; margin-bottom: 10px;"><strong>⚠️ หมดสต็อก (' + outOfStockItems.length + ' รายการ)</strong><br>' + outOfStockItems.slice(0, 3).map(function(p) { return p.part_name; }).join(', ') + (outOfStockItems.length > 3 ? '...' : '') + '</div>';
        }
        if (lowStockItems.length > 0) {
            alertHtml += '<div style="color: #f59e0b;"><strong>⚡ ใกล้หมด (' + lowStockItems.length + ' รายการ)</strong><br>' + lowStockItems.slice(0, 3).map(function(p) { var r = (p.stock_quantity || 0) - (p.used_quantity || 0); return p.part_name + ' (เหลือ ' + r + ')'; }).join(', ') + (lowStockItems.length > 3 ? '...' : '') + '</div>';
        }
        if (alertHtml) {
            Swal.fire({
                icon: 'warning',
                title: '📦 แจ้งเตือนสต็อกอะไหล่',
                html: alertHtml,
                confirmButtonColor: '#3B82F6',
                confirmButtonText: 'รับทราบ'
            });
        }
    }

      function getStockStatus(stockQty, usedQty) {
        var remaining = (stockQty || 0) - (usedQty || 0);
        if (remaining <= 0) {
            return { bg: 'bg-red-100', text: 'text-red-600', rowBg: 'bg-red-50', color: 'red' };
        } else if (remaining <= sparePartsData.lowStockThreshold) {
            return { bg: 'bg-orange-100', text: 'text-orange-600', rowBg: 'bg-orange-50', color: 'orange' };
        }
        return { bg: 'bg-green-100', text: 'text-green-600', rowBg: '', color: 'green' };
    }

    // ✅ แสดง TABLE บนคอมพิวเตอร์
    if (table) {
        table.innerHTML = inventory.map(function(part, index) {
            var stockQty = part.stock_quantity || 0;
            var usedQty = part.used_quantity || 0;
            var remaining = stockQty - usedQty;
            var status = getStockStatus(stockQty, usedQty);
            
            var actionButtons = '<button onclick="viewSparePartDetailsById(' + index + ')" class="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="ดูรายละเอียด"><i class="fas fa-eye"></i></button>';
            
            if (isAdmin) {
                actionButtons += '<button onclick="addStockToInventory(' + index + ')" class="p-1.5 text-green-600 hover:bg-green-100 rounded" title="เพิ่มสต็อก"><i class="fas fa-plus-circle"></i></button>';
                actionButtons += '<button onclick="editInventoryPart(' + index + ')" class="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded" title="แก้ไข"><i class="fas fa-edit"></i></button>';
                actionButtons += '<button onclick="deleteInventoryPart(' + index + ')" class="p-1.5 text-red-600 hover:bg-red-100 rounded" title="ลบ"><i class="fas fa-trash"></i></button>';
            }
            
            var imgHtml = part.image_url 
                ? `<img src="${part.image_url}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="window.open('${part.image_url}', '_blank')">`
                : '<div style="width:40px;height:40px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-cube text-gray-400 text-lg"></i></div>';
            
            return '<tr class="hover:bg-gray-50 ' + status.rowBg + '">' +
                '<td class="px-4 py-3">' +
                    '<div class="flex items-center gap-3">' +
                        imgHtml +
                        '<div>' +
                            '<span class="font-medium">' + part.part_name + '</span>' +
                            (remaining <= 0 ? '<span class="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">หมด</span>' : 
                             remaining <= sparePartsData.lowStockThreshold ? '<span class="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">ใกล้หมด</span>' : '') +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<div class="text-xs text-gray-500">รับเข้า</div>' +
                    '<div class="font-semibold text-blue-600">' + stockQty + '</div>' +
                '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<div class="text-xs text-gray-500">ใช้ไป</div>' +
                    '<div class="font-semibold text-orange-600">' + usedQty + '</div>' +
                '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<div class="text-xs text-gray-500">คงเหลือ</div>' +
                    '<div class="font-bold ' + status.text + '">' + remaining + ' ' + part.unit + '</div>' +
                '</td>' +
                '<td class="px-4 py-3 text-center">฿' + Number(part.unit_cost).toLocaleString() + '</td>' +
                // ✅ แสดงสถานที่เก็บในตาราง
                '<td class="px-4 py-3 text-gray-600">' +
                    '<i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>' + (part.location || '-') + 
                '</td>' +
                '<td class="px-4 py-3">' + (part.supplier || '-') + '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<div class="flex justify-center gap-1">' + actionButtons + '</div>' +
                '</td>' +
            '</tr>';
        }).join('');
    }

    // ✅ แสดง CARD บนมือถือ
    if (cardView) {
        cardView.innerHTML = inventory.map(function(part, index) {
            var stockQty = part.stock_quantity || 0;
            var usedQty = part.used_quantity || 0;
            var remaining = stockQty - usedQty;
            var status = getStockStatus(stockQty, usedQty);
            
            var imgHtml = part.image_url 
                ? `<img src="${part.image_url}" class="w-16 h-16 object-cover rounded-lg" onclick="window.open('${part.image_url}', '_blank')">`
                : '<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><i class="fas fa-cube text-gray-400 text-2xl"></i></div>';
            
            var actionButtons = '<button onclick="viewSparePartDetailsById(' + index + ')" class="text-blue-600"><i class="fas fa-eye"></i></button>';
            if (isAdmin) {
                actionButtons += ' <button onclick="addStockToInventory(' + index + ')" class="text-green-600"><i class="fas fa-plus-circle"></i></button>';
                actionButtons += ' <button onclick="editInventoryPart(' + index + ')" class="text-yellow-600"><i class="fas fa-edit"></i></button>';
                actionButtons += ' <button onclick="deleteInventoryPart(' + index + ')" class="text-red-600"><i class="fas fa-trash"></i></button>';
            }
            
            const statusBgColor = status.color === 'red' ? 'bg-red-100 text-red-700' : 
                                  status.color === 'orange' ? 'bg-orange-100 text-orange-700' : 
                                  'bg-green-100 text-green-700';
            
            return `
                <div class="bg-white border rounded-lg p-4 shadow-sm">
                    <div class="flex gap-3 mb-3">
                        ${imgHtml}
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800 text-sm">${part.part_name}</h3>
                            <!-- ✅ แสดงสถานที่เก็บใน Card -->
                            <p class="text-xs text-gray-600 mt-1">
                                <i class="fas fa-map-marker-alt text-red-400 mr-1"></i>${part.location || 'ไม่ระบุสถานที่'}
                            </p>
                            <p class="text-xs text-gray-500 mt-1"><i class="fas fa-truck text-gray-400 mr-1"></i>${part.supplier || '-'}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                        <div class="bg-blue-50 p-2 rounded">
                            <div class="text-gray-600">รับเข้า</div>
                            <div class="font-bold text-blue-600">${stockQty}</div>
                        </div>
                        <div class="bg-orange-50 p-2 rounded">
                            <div class="text-gray-600">ใช้ไป</div>
                            <div class="font-bold text-orange-600">${usedQty}</div>
                        </div>
                        <div class="bg-purple-50 p-2 rounded">
                            <div class="text-gray-600">คงเหลือ</div>
                            <div class="font-bold text-purple-600">${remaining}</div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center text-xs mb-3">
                        <div>
                            <span class="text-gray-600">ราคา: </span>
                            <span class="font-bold">฿${Number(part.unit_cost).toLocaleString()}</span>
                        </div>
                        <span class="px-2 py-1 rounded ${statusBgColor} text-xs font-semibold">
                            ${remaining <= 0 ? '❌ หมด' : remaining <= sparePartsData.lowStockThreshold ? '⚠️ ใกล้หมด' : '✅ พอ'}
                        </span>
                    </div>
                    <div class="border-t pt-3 flex justify-center gap-3">
                        ${actionButtons}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Add search listener
    setTimeout(function() {
        var searchInput = document.getElementById('sparePartsSearch');
        if (searchInput && !searchInput.hasAttribute('data-listener')) {
            searchInput.setAttribute('data-listener', 'true');
            searchInput.addEventListener('input', searchSparePartsInventory);
        }
    }, 100);
}

function viewSparePartDetailsById(index) {
    const part = sparePartsData.inventoryList[index];
    if (!part) {
        showNotification('ไม่พบข้อมูลอะไหล่', 'error');
        return;
    }

    let imageHtml = '';
    if (part.image_url) {
        imageHtml = `
            <div style="margin-bottom: 20px; text-align: center; background: #f9fafb; padding: 10px; border-radius: 8px;">
                <img src="${part.image_url}" alt="${part.part_name}" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 4px;">
            </div>
        `;
    } else {
        imageHtml = `
            <div style="margin-bottom: 20px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 8px; color: #9ca3af;">
                <i class="fas fa-image" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>ไม่มีรูปภาพ</p>
            </div>
        `;
    }

    const remaining = (part.stock_quantity || 0) - (part.used_quantity || 0);

    Swal.fire({
        title: '📦 รายละเอียดอะไหล่',
        html: `
            <div style="text-align: left; padding: 0 10px;">
                ${imageHtml}
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">ชื่ออะไหล่</label>
                    <div style="font-size: 18px; color: #111827; font-weight: 600;">${part.part_name}</div>
                </div>

                <!-- ✅ แสดงสถานที่เก็บ -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">สถานที่เก็บ</label>
                    <div style="font-size: 16px; color: #4b5563;">
                        <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>${part.location || 'ไม่ระบุ'}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; background: #f9fafb; padding: 10px; border-radius: 8px;">
                    <div>
                        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">รับเข้า (Stock)</label>
                        <div style="font-size: 16px; color: #2563eb; font-weight: 600;">${part.stock_quantity || 0} ${part.unit}</div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">ใช้ไปแล้ว</label>
                        <div style="font-size: 16px; color: #d97706; font-weight: 600;">${part.used_quantity || 0} ${part.unit}</div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">คงเหลือ</label>
                        <div style="font-size: 16px; color: ${remaining <= 0 ? '#dc2626' : '#059669'}; font-weight: 600;">${remaining} ${part.unit}</div>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">ราคาต่อหน่วย</label>
                        <div style="font-size: 16px; color: #111827;">฿${Number(part.unit_cost).toLocaleString()}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">ซัพพลายเออร์</label>
                    <div style="font-size: 14px; color: #374151;">${part.supplier || '-'}</div>
                </div>

                <div style="margin-bottom: 5px;">
                    <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 2px;">อัพเดตล่าสุด</label>
                    <div style="font-size: 12px; color: #9ca3af;">${part.last_updated ? new Date(part.last_updated).toLocaleString('th-TH') : '-'}</div>
                </div>
            </div>
        `,
        width: '450px',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'ปิด'
    });
}

function searchSparePartsInventory() {
    const searchTerm = document.getElementById('sparePartsSearch').value.toLowerCase();
    const supplierFilter = document.getElementById('sparePartsSupplierFilter').value.toLowerCase();
    
    const table = document.getElementById('sparePartsInventoryTable');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tr');

    let visibleCount = 0;

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        if (cells.length === 0) continue;

        const partName = cells[0].textContent.toLowerCase();
        // คอลัมน์ที่ 6 คือ location (index 5)
        const location = cells[5].textContent.toLowerCase();
        // คอลัมน์ที่ 7 คือ supplier (index 6)
        const supplier = cells[6].textContent.toLowerCase();

        // ✅ ค้นหาจากชื่ออะไหล่ หรือ สถานที่เก็บ
        const matchSearch = partName.includes(searchTerm) || location.includes(searchTerm);
        const matchSupplier = !supplierFilter || supplier.includes(supplierFilter);

        if (matchSearch && matchSupplier) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }

    // กรณีใช้ Card View บนมือถือ
    const cards = document.querySelectorAll('#sparePartsCardView > div');
    if (cards.length > 0) {
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matchSearch = text.includes(searchTerm);
            
            if (matchSearch) {
                card.style.display = 'block';
                visibleCount++; 
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (visibleCount === 0) {
        // จัดการกรณีไม่พบข้อมูล
        if (table) table.innerHTML = '<tr><td colspan="8" class="px-4 py-3 text-center text-gray-600">ไม่พบข้อมูลอะไหล่ที่ค้นหา</td></tr>';
    }
}

function addSparePartToRepair() {
    if (!sparePartsData.currentRepairId) {
        showNotification('กรุณาเลือกงานซ่อม', 'warning');
        return;
    }

    const partName = document.getElementById('sparePartName').value.trim();
    const quantity = Number(document.getElementById('sparePartQty').value) || 0;
    const unit = document.getElementById('sparePartUnit').value;
    const unitCost = Number(document.getElementById('sparePartUnitCost').value) || 0;
    const supplier = document.getElementById('sparePartSupplier').value.trim();
    const notes = document.getElementById('sparePartNotes').value.trim();

    if (!partName) {
        showNotification('กรุณาระบุชื่ออะไหล่', 'warning');
        return;
    }

    if (quantity <= 0) {
        showNotification('กรุณาระบุจำนวนที่ถูกต้อง', 'warning');
        return;
    }

    if (unitCost < 0) {
        showNotification('กรุณาระบุราคาที่ถูกต้อง', 'warning');
        return;
    }

    const totalCost = quantity * unitCost;
    const sessionId = localStorage.getItem('sessionId');

    // Show loading
    Swal.fire({
        title: 'กำลังบันทึก...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    });

    // Prepare spare part data
    const sparePartData = {
        part_name: partName,
        quantity: quantity,
        unit: unit,
        unit_cost: unitCost,
        total_cost: totalCost,
        supplier: supplier,
        notes: notes
    };

    // If there's an image, upload it first
    if (sparePartsData.currentPartImage) {
        const imageData = sparePartsData.currentPartImage;
        console.log('Uploading image, data length:', imageData.length);
        
        google.script.run
            .withSuccessHandler((imageUrl) => {
                console.log('Image upload success:', imageUrl);
                
                if (!imageUrl) {
                    Swal.close();
                    showNotification('⚠️ การอัพโหลดรูปล้มเหลว จะบันทึกโดยไม่มีรูป', 'warning');
                    saveSparePart(sparePartData, sessionId);
                    return;
                }
                
                // Add image URL to spare part data
                sparePartData.image_url = imageUrl;
                console.log('Spare part data:', sparePartData);
                
                // Then save the spare part
                saveSparePart(sparePartData, sessionId);
            })
            .withFailureHandler((error) => {
                Swal.close();
                console.error('Error uploading image:', error);
                showNotification('⚠️ การอัพโหลดรูปล้มเหลว จะบันทึกโดยไม่มีรูป', 'warning');
                // Save without image
                saveSparePart(sparePartData, sessionId);
            })
            .uploadSparePartImage(imageData, sparePartsData.currentRepairId);
    } else {
        // No image, just save
        console.log('No image, saving spare part');
        saveSparePart(sparePartData, sessionId);
    }
}



function saveSparePart(sparePartData, sessionId) {
    google.script.run
        .withSuccessHandler((result) => {
            Swal.close();
            
            if (result.status === 'success') {
                showNotification('✅ บันทึกอะไหล่เรียบร้อยแล้ว', 'success');
                clearSparePartForm();
                loadRepairSpareParts(sparePartsData.currentRepairId);
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler((error) => {
            Swal.close();
            console.error('Error adding spare part:', error);
            showNotification('❌ เกิดข้อผิดพลาดในการบันทึก: ' + error.toString(), 'error');
        })
        .addSparePart(sparePartsData.currentRepairId, sparePartData, sessionId);
}

// ============================================
// Load Repair Spare Parts (แก้ไข: เพิ่ม Loading Animation)
// ============================================
function loadRepairSpareParts(repairId) {
    const sessionId = localStorage.getItem('sessionId');
    
    // 1. อ้างอิง Element
    const container = document.getElementById('selectedRepairSparePartsList');
    const contentDiv = container.querySelector('.space-y-2'); // div ที่เก็บรายการ

    // 2. แสดงสถานะกำลังโหลด
    if (container && contentDiv) {
        container.classList.remove('hidden'); // แสดงกล่อง
        contentDiv.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p class="text-sm">กำลังโหลดรายการอะไหล่...</p>
            </div>
        `;
    }

    // 3. ดึงข้อมูลจาก Server
    google.script.run
        .withSuccessHandler((result) => {
            if (result.status === 'success') {
                sparePartsData.repairSpareParts = result.spareParts || [];
                displayRepairSpareParts(sparePartsData.repairSpareParts);
            } else {
                // กรณีโหลดไม่สำเร็จ
                if (contentDiv) {
                    contentDiv.innerHTML = `<div class="text-center text-red-500 py-4">โหลดข้อมูลไม่สำเร็จ</div>`;
                }
            }
        })
        .withFailureHandler((error) => {
            console.error('Error loading repair spare parts:', error);
            if (contentDiv) {
                contentDiv.innerHTML = `<div class="text-center text-red-500 py-4">เกิดข้อผิดพลาดในการเชื่อมต่อ</div>`;
            }
        })
        .getRepairSpareParts(repairId, sessionId);
}

function displayRepairSpareParts(spareParts) {
    const container = document.getElementById('selectedRepairSparePartsList');
    
    if (spareParts.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.querySelector('.space-y-2').innerHTML = spareParts.map(part => `
        <div class="p-3 border border-gray-300 rounded-lg flex justify-between items-start hover:shadow-md transition">
            <div class="flex-1">
                ${part.image_url ? `<img src="${part.image_url}" alt="${part.part_name}" style="max-width: 100px; max-height: 80px; border-radius: 5px; margin-bottom: 8px;">` : ''}
                <div class="font-semibold text-gray-800">${part.part_name}</div>
                <div class="text-sm text-gray-600">${part.quantity} ${part.unit} @ ฿${Number(part.unit_cost).toLocaleString()}/หน่วย</div>
                ${part.supplier ? `<div class="text-xs text-gray-500">ซัพพลายเออร์: ${part.supplier}</div>` : ''}
                ${part.notes ? `<div class="text-xs text-gray-500 mt-1">หมายเหตุ: ${part.notes}</div>` : ''}
            </div>
            <div class="text-right">
                <div class="font-semibold text-blue-600">฿${Number(part.total_cost).toLocaleString()}</div>
                <div class="flex gap-2 mt-2 justify-end">
                    <button onclick="editSparePartFromRepair('${part.id}')" class="text-blue-600 hover:text-blue-800 text-xs" title="แก้ไข">
                        <i class="fas fa-edit mr-1"></i>แก้ไข
                    </button>
                    <button onclick="confirmDeleteSparePart('${part.id}', '${part.part_name}')" class="text-red-600 hover:text-red-800 text-xs" title="ลบ">
                        <i class="fas fa-trash mr-1"></i>ลบ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function confirmDeleteSparePart(partId, partName) {
    Swal.fire({
        title: '⚠️ ยืนยันการลบ',
        html: `<p>คุณแน่ใจหรือว่าต้องการลบอะไหล่นี้?</p><p style="font-weight: 600; color: #3B82F6; margin-top: 10px;">${partName}</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-trash mr-2"></i>ลบ',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteSparePartFromRepair(partId);
        }
    });
}

function deleteSparePartFromRepair(partId) {
    const sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังลบ...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    });

    google.script.run
        .withSuccessHandler((result) => {
            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'ลบแล้ว',
                    text: 'ลบอะไหล่เรียบร้อยแล้ว',
                    timer: 1000,
                    showConfirmButton: false
                }).then(() => {
                    // ✅ เช็คว่าทำงานอยู่ในหน้า Modal ของช่างหรือไม่
                    if (window.currentTechRepairId && typeof techRecordSpareParts === 'function') {
                        // รีเฟรช Modal ของช่าง
                        techRecordSpareParts(window.currentTechRepairId);
                    } else {
                        // รีเฟรชหน้าปกติ (Spare Parts Tab)
                        if (sparePartsData.currentRepairId) {
                            loadRepairSpareParts(sparePartsData.currentRepairId);
                        }
                        loadSparePartsInventory();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: result.message || 'เกิดข้อผิดพลาด',
                    confirmButtonText: 'ตกลง'
                });
            }
        })
        .withFailureHandler((error) => {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาดในการลบ', 'error');
        })
        .deleteSparePart(partId, sessionId);
}

function calculateSparePertTotal() {
    const qty = Number(document.getElementById('sparePartQty').value) || 0;
    const cost = Number(document.getElementById('sparePartUnitCost').value) || 0;
    const total = qty * cost;
    document.getElementById('totalCostDisplay').textContent = `฿${total.toLocaleString()}`;
}

function clearSparePartForm() {
    document.getElementById('sparePartName').value = '';
    document.getElementById('sparePartQty').value = '1';
    document.getElementById('sparePartUnit').value = 'pcs';
    document.getElementById('sparePartUnitCost').value = '0';
    document.getElementById('sparePartSupplier').value = '';
    document.getElementById('sparePartNotes').value = '';
    clearSparePartImage();
    calculateSparePertTotal();
}

// ============================================
// Spare Parts Image Handling
// ============================================
function previewSparePartImage(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('ขนาดไฟล์ไม่ควรเกิน 5MB', 'warning');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('กรุณาเลือกไฟล์รูปภาพ', 'warning');
        return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('sparePartImagePreview');
        const img = document.getElementById('sparePartImagePreviewImg');
        
        img.src = e.target.result;
        preview.classList.remove('hidden');

        // Store base64 for later upload (keep the data URL format)
        sparePartsData.currentPartImage = e.target.result;
        console.log('Image preview set, size:', e.target.result.length);
    };
    reader.onerror = () => {
        showNotification('เกิดข้อผิดพลาดในการอ่านไฟล์รูป', 'error');
    };
    reader.readAsDataURL(file);
}

function clearSparePartImage() {
    document.getElementById('sparePartImageInput').value = '';
    document.getElementById('sparePartImagePreview').classList.add('hidden');
    sparePartsData.currentPartImage = null;
}

// ============================================
// View & Edit Spare Part Details
// ============================================
function viewSparePartDetails(partJson) {
    try {
        const part = JSON.parse(partJson);
        
        Swal.fire({
            title: '📦 รายละเอียดอะไหล่',
            html: `
                <div style="text-align: left; padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">ชื่ออะไหล่</label>
                        <div style="font-size: 16px; color: #000;">${part.part_name}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">จำนวนรวม</label>
                            <div style="font-size: 16px; color: #000;">${part.total_quantity} ${part.unit}</div>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">ราคาต่อหน่วย</label>
                            <div style="font-size: 16px; color: #000;">฿${Number(part.unit_cost).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">ซัพพลายเออร์</label>
                        <div style="font-size: 16px; color: #000;">${part.supplier}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">จำนวนครั้งที่ใช้</label>
                        <div style="font-size: 16px; color: #000;">${part.usage_count} ครั้ง</div>
                    </div>
                </div>
            `,
            width: '500px',
            confirmButtonColor: '#3B82F6',
            confirmButtonText: 'ปิด'
        });
    } catch (error) {
        console.error('Error parsing part data:', error);
        showNotification('เกิดข้อผิดพลาดในการแสดงข้อมูล', 'error');
    }
}

// ============================================
// Edit Spare Part (แก้ไขอะไหล่ในงานซ่อม)
// ============================================
function editSparePartFromRepair(partId) {
    // 1. ค้นหาข้อมูลอะไหล่จากตัวแปร Global
    const part = sparePartsData.repairSpareParts.find(p => p.id === partId);
    if (!part) {
        showNotification('ไม่พบข้อมูลอะไหล่', 'error');
        return;
    }

    // 2. ตรวจสอบ Role ของผู้ใช้ปัจจุบัน
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // ถ้าเป็น technician จะเป็น true, ถ้าเป็น admin จะเป็น false
    const isTechnician = currentUser.role === 'technician'; 

    // 3. แสดง Modal แก้ไข
    Swal.fire({
        title: '✏️ แก้ไขอะไหล่',
        html: `
            <div style="text-align: left; padding: 10px;">
                <!-- ส่วนชื่ออะไหล่ (ล็อกไม่ให้แก้ ถ้าเป็นช่าง) -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">ชื่ออะไหล่</label>
                    <input type="text" id="editPartName" value="${part.part_name}" 
                           ${isTechnician ? 'disabled style="background-color: #f3f4f6; color: #6b7280;' : 'style="'} width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    ${isTechnician ? '<p style="font-size: 11px; color: #ef4444; margin-top: 4px;">* เพื่อความถูกต้องของสต็อก ช่างไม่สามารถแก้ไขชื่ออะไหล่ได้</p>' : ''}
                </div>
                
                <!-- ส่วนจำนวนและราคา -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px;">จำนวน</label>
                        <input type="number" id="editPartQty" value="${part.quantity}" min="1"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px;">ราคา/หน่วย</label>
                        <input type="number" id="editPartCost" value="${part.unit_cost}" min="0" step="0.01"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                </div>
                
                <!-- ส่วนซัพพลายเออร์ -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">ซัพพลายเออร์</label>
                    <input type="text" id="editPartSupplier" value="${part.supplier || ''}" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                
                <!-- ส่วนหมายเหตุ -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">หมายเหตุ</label>
                    <textarea id="editPartNotes" rows="3"
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">${part.notes || ''}</textarea>
                </div>
                
                <!-- ส่วนแสดงผลรวม Real-time -->
                <div style="background-color: #f0f9ff; padding: 12px; border-radius: 8px; border: 1px solid #bae6fd; text-align: right;">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">ต้นทุนรวม (คำนวณใหม่)</div>
                    <div style="font-size: 20px; font-weight: bold; color: #0284c7;" id="editTotalCostDisplay">
                        ฿${Number(part.quantity * part.unit_cost).toLocaleString()}
                    </div>
                </div>
            </div>
        `,
        width: '500px',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-save mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        
        // ✅ เพิ่มฟังก์ชันคำนวณราคา Real-time
        didOpen: () => {
            const qtyInput = document.getElementById('editPartQty');
            const costInput = document.getElementById('editPartCost');
            const totalDisplay = document.getElementById('editTotalCostDisplay');

            function updateTotal() {
                const qty = Number(qtyInput.value) || 0;
                const cost = Number(costInput.value) || 0;
                totalDisplay.innerText = '฿' + (qty * cost).toLocaleString();
            }

            qtyInput.addEventListener('input', updateTotal);
            costInput.addEventListener('input', updateTotal);
        },

        // ✅ ตรวจสอบข้อมูลก่อนส่ง
        preConfirm: () => {
            const name = document.getElementById('editPartName').value.trim();
            const qty = Number(document.getElementById('editPartQty').value);
            const cost = Number(document.getElementById('editPartCost').value);
            const supplier = document.getElementById('editPartSupplier').value.trim();
            const notes = document.getElementById('editPartNotes').value.trim();

            if (!name) {
                Swal.showValidationMessage('กรุณาระบุชื่ออะไหล่');
                return false;
            }
            if (qty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง (ต้องมากกว่า 0)');
                return false;
            }
            if (cost < 0) {
                Swal.showValidationMessage('กรุณาระบุราคาที่ถูกต้อง (ห้ามติดลบ)');
                return false;
            }

            return { name, qty, cost, supplier, notes };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveEditedSparePart(partId, result.value);
        }
    });
}

function saveEditedSparePart(partId, updatedData) {
    const sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังบันทึก...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    });

    google.script.run
        .withSuccessHandler((result) => {
            Swal.close();
            
            if (result.status === 'success') {
                showNotification('✅ แก้ไขอะไหล่เรียบร้อยแล้ว', 'success');
                loadRepairSpareParts(sparePartsData.currentRepairId);
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler((error) => {
            Swal.close();
            console.error('Error updating spare part:', error);
            showNotification('❌ เกิดข้อผิดพลาดในการแก้ไข', 'error');
        })
        .updateSparePart(partId, {
            part_name: updatedData.name,
            quantity: updatedData.qty,
            unit_cost: updatedData.cost,
            supplier: updatedData.supplier,
            notes: updatedData.notes
        }, sessionId);
}

// ============================================
// Analytics Functions
// ============================================
function loadSparePartsAnalytics() {
    const dateFrom = document.getElementById('sparePartsDateFrom').value;
    const dateTo = document.getElementById('sparePartsDateTo').value;
    const sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังโหลด...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    });

    google.script.run
        .withSuccessHandler((result) => {
            Swal.close();
            if (result.status === 'success') {
                displaySparePartsAnalytics(result.analytics);
            }
        })
        .withFailureHandler(() => {
            Swal.close();
            showNotification('เกิดข้อผิดพลาดในการโหลด Analytics', 'error');
        })
        .getSparePartsAnalytics(dateFrom, dateTo, sessionId);
}

function displaySparePartsAnalytics(analytics) {
    // Update KPI cards
    document.getElementById('kpiTotalCost').textContent = `฿${Number(analytics.totalCost).toLocaleString()}`;
    document.getElementById('kpiPartCount').textContent = analytics.partCount;
    document.getElementById('kpiAvgCost').textContent = `฿${Number(analytics.avgCostPerPart).toLocaleString()}`;
    document.getElementById('kpiTotalQty').textContent = analytics.totalQuantity;

    // Update supplier table
    const suppliersTable = document.getElementById('suppliersTable');
    const supplierRows = Object.entries(analytics.suppliers || {})
        .sort((a, b) => b[1] - a[1])
        .map(([supplier, cost]) => {
            const percentage = analytics.totalCost > 0 
                ? ((cost / analytics.totalCost) * 100).toFixed(1) 
                : 0;
            return `
                <tr>
                    <td class="px-4 py-3">${supplier}</td>
                    <td class="px-4 py-3 text-center">฿${Number(cost).toLocaleString()}</td>
                    <td class="px-4 py-3 text-center">${percentage}%</td>
                </tr>
            `;
        });

    suppliersTable.innerHTML = supplierRows.length > 0 ? supplierRows.join('') : 
        '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-600">ไม่มีข้อมูล</td></tr>';

    // Charts
    displaySupplierCostChart(analytics.suppliers);
    displayTopPartsChart(analytics.topParts);
}

function displaySupplierCostChart(suppliers) {
    const ctx = document.getElementById('supplierCostChart')?.getContext('2d');
    if (!ctx) return;

    if (sparePartsChart && sparePartsChart.supplierCost) {
        sparePartsChart.supplierCost.destroy();
    }

    sparePartsChart = sparePartsChart || {};

    sparePartsChart.supplierCost = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(suppliers),
            datasets: [{
                data: Object.values(suppliers),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function displayTopPartsChart(topParts) {
    const ctx = document.getElementById('topPartsChart')?.getContext('2d');
    if (!ctx) return;

    if (sparePartsChart && sparePartsChart.topParts) {
        sparePartsChart.topParts.destroy();
    }

    sparePartsChart = sparePartsChart || {};

    sparePartsChart.topParts = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topParts.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
            datasets: [{
                label: 'จำนวนครั้งที่ใช้',
                data: topParts.map(p => p.count),
                backgroundColor: '#3B82F6',
                borderColor: '#1E40AF',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        padding: 10,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { font: { size: 11 } }
                },
                y: {
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

// ============================================
// Export to Window
// ============================================
window.loadSparePartsManagement = loadSparePartsManagement;
window.switchSparePartsTab = switchSparePartsTab;
window.filterRepairsForSpareParts = filterRepairsForSpareParts;
window.selectRepairForSpareParts = selectRepairForSpareParts;
window.loadSparePartsInventory = loadSparePartsInventory;
window.addSparePartToRepair = addSparePartToRepair;
window.deleteSparePartFromRepair = deleteSparePartFromRepair;
window.loadSparePartsAnalytics = loadSparePartsAnalytics;
window.clearSparePartForm = clearSparePartForm;
window.calculateSparePertTotal = calculateSparePertTotal;
window.addAnotherSparePartForm = addAnotherSparePartForm;
window.loadRepairsForSpareParts = loadRepairsForSpareParts;
window.loadRepairSpareParts = loadRepairSpareParts;
window.searchSparePartsInventory = searchSparePartsInventory;
window.previewSparePartImage = previewSparePartImage;
window.clearSparePartImage = clearSparePartImage;
window.viewSparePartDetails = viewSparePartDetails;
window.viewSparePartDetailsById = viewSparePartDetailsById;
window.editSparePartFromRepair = editSparePartFromRepair;
window.confirmDeleteSparePart = confirmDeleteSparePart;
window.showAddSparePartToInventory = showAddSparePartToInventory;
window.addSparePartToInventory = addSparePartToInventory;
window.addStockToInventory = addStockToInventory;
window.showPickFromInventory = showPickFromInventory;
window.showManualAddForm = showManualAddForm;
window.editInventoryPart = editInventoryPart;
window.deleteInventoryPart = deleteInventoryPart;
// Request & Approval functions
window.showRequestNewPartForm = showRequestNewPartForm;
window.submitSparePartRequest = submitSparePartRequest;
window.showSparePartsApprovalTab = showSparePartsApprovalTab;
window.loadPendingRequests = loadPendingRequests;
window.loadPendingRequestsCount = loadPendingRequestsCount;
window.approveSparePartRequest = approveSparePartRequest;
window.rejectSparePartRequest = rejectSparePartRequest;
window.loadRepairPendingRequests = loadRepairPendingRequests;
window.cancelSparePartRequest = cancelSparePartRequest;

// ============================================
// Pick from Inventory Functions
// ============================================
function showManualAddForm() {
    var form = document.getElementById('manualAddForm');
    if (form) form.style.display = 'block';
}

function showPickFromInventory() {
    if (!sparePartsData.currentRepairId) {
        showNotification('กรุณาเลือกงานซ่อมก่อน', 'warning');
        return;
    }

    var sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({
        title: '<i class="fas fa-warehouse text-purple-600"></i> กำลังโหลดคลังอะไหล่...',
        html: '<div class="text-center py-4"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div></div>',
        showConfirmButton: false,
        allowOutsideClick: false
    });

    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success' && result.inventory && result.inventory.length > 0) {
                showInventoryPickerDialog(result.inventory);
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'ไม่มีอะไหล่ในคลัง',
                    text: 'กรุณาเพิ่มอะไหล่ในคลังก่อน หรือเพิ่มอะไหล่ใหม่',
                    confirmButtonColor: '#3B82F6'
                });
            }
        })
        .withFailureHandler(function(error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.toString(),
                confirmButtonColor: '#EF4444'
            });
        })
        .getSparePartsInventory(sessionId);
}

function showInventoryPickerDialog(inventory) {
    sparePartsData.pickerInventory = inventory;
    
    var itemsHtml = inventory.map(function(part, index) {
        var stockQty = part.stock_quantity || part.total_quantity || 0;
        var usedQty = part.used_quantity || 0;
        var remaining = stockQty - usedQty;
        var statusColor = remaining <= 0 ? 'red' : remaining <= 5 ? 'orange' : 'green';
        
        return '<div class="inventory-pick-item p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition" onclick="selectInventoryPart(' + index + ')" data-index="' + index + '">' +
            '<div class="flex items-center gap-3">' +
                (part.image_url ? '<img src="' + part.image_url + '" class="w-12 h-12 rounded-lg object-cover">' : '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><i class="fas fa-cog text-gray-400"></i></div>') +
                '<div class="flex-1">' +
                    '<div class="font-semibold text-gray-800">' + part.part_name + '</div>' +
                    '<div class="text-sm text-gray-600">คงเหลือ: <span style="color:' + statusColor + ';font-weight:600;">' + remaining + '</span> ' + part.unit + ' | ฿' + Number(part.unit_cost).toLocaleString() + '/' + part.unit + '</div>' +
                    (part.supplier ? '<div class="text-xs text-gray-500"><i class="fas fa-truck mr-1"></i>' + part.supplier + '</div>' : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');

    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); margin: -20px -20px 15px -20px; padding: 15px 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-warehouse mr-2"></i>เลือกอะไหล่จากคลัง\
                    </h2>\
                </div>\
                <input type="text" id="inventorySearchInput" placeholder="🔍 ค้นหาอะไหล่..." \
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" oninput="filterInventoryPicker()">\
                <div id="inventoryPickerList" style="max-height: 350px; overflow-y: auto;">\
                    ' + itemsHtml + '\
                </div>\
            </div>\
        ',
        width: '500px',
        showConfirmButton: false,
        showCloseButton: true
    });
}

window.filterInventoryPicker = function() {
    var searchTerm = document.getElementById('inventorySearchInput').value.toLowerCase();
    var items = document.querySelectorAll('.inventory-pick-item');
    
    items.forEach(function(item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
};

window.selectInventoryPart = function(index) {
    var part = sparePartsData.pickerInventory[index];
    if (!part) return;

    var stockQty = part.stock_quantity || part.total_quantity || 0;
    var usedQty = part.used_quantity || 0;
    var remaining = stockQty - usedQty;

    if (remaining <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'อะไหล่หมด',
            text: 'อะไหล่นี้หมดแล้ว กรุณาเพิ่มสต็อกก่อน',
            confirmButtonColor: '#F59E0B'
        });
        return;
    }

    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); margin: -20px -20px 15px -20px; padding: 15px 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 16px;">\
                        <i class="fas fa-cog mr-2"></i>' + part.part_name + '\
                    </h2>\
                </div>\
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 15px;">\
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">\
                        <span style="color: #6b7280;">คงเหลือในคลัง:</span>\
                        <span style="font-weight: 600; color: #059669;">' + remaining + ' ' + part.unit + '</span>\
                    </div>\
                    <div style="display: flex; justify-content: space-between;">\
                        <span style="color: #6b7280;">ราคา/หน่วย:</span>\
                        <span style="font-weight: 600;">฿' + Number(part.unit_cost).toLocaleString() + '</span>\
                    </div>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">จำนวนที่ต้องการใช้ *</label>\
                    <input type="number" id="pickQty" value="1" min="1" max="' + remaining + '"\
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; text-align: center;"\
                           onchange="updatePickTotalCost(' + part.unit_cost + ')" oninput="updatePickTotalCost(' + part.unit_cost + ')">\
                </div>\
                <div style="background: #dbeafe; padding: 12px; border-radius: 8px; text-align: center;">\
                    <div style="font-size: 12px; color: #1d4ed8;">รวมเป็นเงิน</div>\
                    <div id="pickTotalCost" style="font-size: 24px; font-weight: bold; color: #1e40af;">฿' + Number(part.unit_cost).toLocaleString() + '</div>\
                </div>\
            </div>\
        ',
        width: '380px',
        showCancelButton: true,
        confirmButtonColor: '#8B5CF6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>เพิ่มอะไหล่',
        cancelButtonText: 'ยกเลิก',
        preConfirm: function() {
            var qty = Number(document.getElementById('pickQty').value);
            if (qty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง');
                return false;
            }
            if (qty > remaining) {
                Swal.showValidationMessage('จำนวนเกินกว่าที่มีในคลัง (เหลือ ' + remaining + ')');
                return false;
            }
            return qty;
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            addPickedPartToRepair(part, result.value);
        }
    });
};

window.updatePickTotalCost = function(unitCost) {
    var qty = Number(document.getElementById('pickQty').value) || 0;
    var total = qty * unitCost;
    document.getElementById('pickTotalCost').textContent = '฿' + total.toLocaleString();
};

function addPickedPartToRepair(part, qty) {
    var sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังบันทึก...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    var sparePartData = {
        part_name: part.part_name,
        quantity: qty,
        unit: part.unit,
        unit_cost: part.unit_cost,
        total_cost: qty * part.unit_cost,
        supplier: part.supplier || '',
        notes: 'ดึงจากคลังอะไหล่',
        image_url: part.image_url || ''
    };

    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                showNotification('✅ เพิ่มอะไหล่จากคลังเรียบร้อย', 'success');
                loadRepairSpareParts(sparePartsData.currentRepairId);
                sparePartsData.stockAlertShown = false;
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .addSparePart(sparePartsData.currentRepairId, sparePartData, sessionId);
}

// ============================================
// Add Spare Part to Inventory (Direct)
// ============================================
function showAddSparePartToInventory() {
    sparePartsData.newPartImageData = null;
    
    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-plus-circle mr-2"></i>เพิ่มอะไหล่ใหม่\
                    </h2>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ชื่ออะไหล่ *</label>\
                    <input type="text" id="newPartName" placeholder="เช่น ฮาร์ดดิสก์ 1TB" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <!-- ✅ เพิ่ม Input สถานที่เก็บ -->\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">สถานที่เก็บ</label>\
                    <input type="text" id="newPartLocation" placeholder="เช่น ชั้นวาง A1, ตู้เก็บของ 2" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">\
                    <div>\
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">จำนวน *</label>\
                        <input type="number" id="newPartQty" value="1" min="1" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                    </div>\
                    <div>\
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หน่วย *</label>\
                        <select id="newPartUnit" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                            <option value="pcs">ชิ้น (pcs)</option>\
                            <option value="set">ชุด (set)</option>\
                            <option value="meter">เมตร (m)</option>\
                            <option value="liter">ลิตร (L)</option>\
                            <option value="kg">กิโลกรัม (kg)</option>\
                            <option value="box">กล่อง (box)</option>\
                            <option value="pack">แพ็ค (pack)</option>\
                        </select>\
                    </div>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ราคาต่อหน่วย (บาท) *</label>\
                    <input type="number" id="newPartCost" value="0" min="0" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ซัพพลายเออร์</label>\
                    <input type="text" id="newPartSupplier" placeholder="เช่น บริษัท ABC" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หมายเหตุ</label>\
                    <textarea id="newPartNotes" rows="2" placeholder="หมายเหตุเพิ่มเติม..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"></textarea>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">รูปอะไหล่</label>\
                    <div id="newPartImageContainer">\
                        <label style="display: block; border: 2px dashed #d1d5db; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer;" onmouseover="this.style.borderColor=\'#10b981\'" onmouseout="this.style.borderColor=\'#d1d5db\'">\
                            <i class="fas fa-cloud-upload-alt" style="font-size: 20px; color: #9ca3af;"></i>\
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">คลิกเพื่ออัพโหลดรูป</p>\
                            <p style="margin: 3px 0 0 0; font-size: 10px; color: #9ca3af;">JPG, PNG (สูงสุด 5MB)</p>\
                            <input type="file" id="newPartImageInput" accept="image/*" style="display: none;" onchange="previewNewInventoryPartImage(event)">\
                        </label>\
                    </div>\
                    <div id="newPartImagePreview" style="display: none; margin-top: 10px; text-align: center;">\
                        <img id="newPartImagePreviewImg" src="" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 2px solid #10b981;">\
                        <br>\
                        <button type="button" onclick="clearNewInventoryPartImage()" style="margin-top: 5px; padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px;">\
                            <i class="fas fa-trash mr-1"></i>ลบรูป\
                        </button>\
                    </div>\
                </div>\
            </div>\
        ',
        width: '450px',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-save mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        preConfirm: function() {
            var name = document.getElementById('newPartName').value.trim();
            // ✅ ดึงค่าจากช่อง Location
            var location = document.getElementById('newPartLocation').value.trim(); 
            var qty = Number(document.getElementById('newPartQty').value);
            var unit = document.getElementById('newPartUnit').value;
            var cost = Number(document.getElementById('newPartCost').value);
            var supplier = document.getElementById('newPartSupplier').value.trim();
            var notes = document.getElementById('newPartNotes').value.trim();

            if (!name) {
                Swal.showValidationMessage('กรุณาระบุชื่ออะไหล่');
                return false;
            }
            if (qty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง');
                return false;
            }

            return { 
                name: name, 
                location: location, // ส่งค่า location กลับไป
                qty: qty, 
                unit: unit, 
                cost: cost, 
                supplier: supplier, 
                notes: notes, 
                image: sparePartsData.newPartImageData 
            };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            addSparePartToInventory(result.value);
        }
    });
}

// Preview image for new inventory part
window.previewNewInventoryPartImage = function(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('ขนาดไฟล์ไม่ควรเกิน 5MB', 'warning');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('กรุณาเลือกไฟล์รูปภาพ', 'warning');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('newPartImagePreviewImg').src = e.target.result;
        document.getElementById('newPartImagePreview').style.display = 'block';
        document.getElementById('newPartImageContainer').style.display = 'none';
        sparePartsData.newPartImageData = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Clear image for new inventory part
window.clearNewInventoryPartImage = function() {
    document.getElementById('newPartImageInput').value = '';
    document.getElementById('newPartImagePreview').style.display = 'none';
    document.getElementById('newPartImageContainer').style.display = 'block';
    sparePartsData.newPartImageData = null;
};

function addSparePartToInventory(data) {
    var sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังบันทึก...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    var sparePartData = {
        part_name: data.name,
        location: data.location, // ✅ ส่ง location ไปยัง Backend
        quantity: data.qty,
        unit: data.unit,
        unit_cost: data.cost,
        total_cost: data.qty * data.cost,
        supplier: data.supplier,
        notes: data.notes || 'เพิ่มเข้าคลังโดยตรง'
    };

    // ถ้ามีรูป อัพโหลดก่อน
    if (data.image) {
        google.script.run
            .withSuccessHandler(function(imageUrl) {
                if (imageUrl) {
                    sparePartData.image_url = imageUrl;
                }
                saveNewSparePartToInventory(sparePartData, sessionId);
            })
            .withFailureHandler(function(error) {
                console.error('Image upload error:', error);
                showNotification('⚠️ อัพโหลดรูปไม่สำเร็จ จะบันทึกโดยไม่มีรูป', 'warning');
                saveNewSparePartToInventory(sparePartData, sessionId);
            })
            .uploadSparePartImage(data.image, 'INVENTORY');
    } else {
        saveNewSparePartToInventory(sparePartData, sessionId);
    }
}

function saveNewSparePartToInventory(sparePartData, sessionId) {
    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                showNotification('✅ เพิ่มอะไหล่เรียบร้อยแล้ว', 'success');
                sparePartsData.stockAlertShown = false;
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .addSparePartToInventory(sparePartData, sessionId);
}

// ============================================
// Add Stock to Existing Inventory Item
// ============================================
function addStockToInventory(index) {
    var part = sparePartsData.inventoryList[index];
    if (!part) {
        showNotification('ไม่พบข้อมูลอะไหล่', 'error');
        return;
    }

    var currentStock = part.stock_quantity || part.total_quantity || 0;
    var usedQty = part.used_quantity || 0;
    var remaining = currentStock - usedQty;

    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-plus-circle mr-2"></i>เพิ่มสต็อก\
                    </h2>\
                </div>\
                <div style="text-align: center; margin-bottom: 20px;">\
                    <h3 style="font-size: 18px; font-weight: 600; color: #1f2937;">' + part.part_name + '</h3>\
                </div>\
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; text-align: center;">\
                    <div style="background: #dbeafe; padding: 12px; border-radius: 8px;">\
                        <div style="font-size: 11px; color: #1d4ed8;">รับเข้าทั้งหมด</div>\
                        <div style="font-size: 20px; font-weight: bold; color: #1e40af;">' + currentStock + '</div>\
                    </div>\
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px;">\
                        <div style="font-size: 11px; color: #d97706;">ใช้ไปแล้ว</div>\
                        <div style="font-size: 20px; font-weight: bold; color: #b45309;">' + usedQty + '</div>\
                    </div>\
                    <div style="background: ' + (remaining <= 0 ? '#fee2e2' : remaining <= sparePartsData.lowStockThreshold ? '#fef3c7' : '#dcfce7') + '; padding: 12px; border-radius: 8px;">\
                        <div style="font-size: 11px; color: ' + (remaining <= 0 ? '#dc2626' : remaining <= sparePartsData.lowStockThreshold ? '#d97706' : '#16a34a') + ';">คงเหลือ</div>\
                        <div style="font-size: 20px; font-weight: bold; color: ' + (remaining <= 0 ? '#dc2626' : remaining <= sparePartsData.lowStockThreshold ? '#b45309' : '#15803d') + ';">' + remaining + '</div>\
                    </div>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">จำนวนที่ต้องการเพิ่ม *</label>\
                    <input type="number" id="addStockQty" value="1" min="1" style="width: 100%; padding: 12px; border: 2px solid #10b981; border-radius: 8px; font-size: 18px; text-align: center;">\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หมายเหตุ</label>\
                    <input type="text" id="addStockNotes" placeholder="เช่น สั่งซื้อเพิ่ม..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
            </div>\
        ',
        width: '400px',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-plus mr-2"></i>เพิ่มสต็อก',
        cancelButtonText: 'ยกเลิก',
        preConfirm: function() {
            var qty = Number(document.getElementById('addStockQty').value);
            var notes = document.getElementById('addStockNotes').value.trim();

            if (qty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง');
                return false;
            }

            return { qty: qty, notes: notes };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            var sessionId = localStorage.getItem('sessionId');

            Swal.fire({
                title: 'กำลังเพิ่มสต็อก...',
                didOpen: function() { Swal.showLoading(); },
                allowOutsideClick: false
            });

            var sparePartData = {
                part_name: part.part_name,
                quantity: result.value.qty,
                unit: part.unit,
                unit_cost: part.unit_cost,
                total_cost: result.value.qty * part.unit_cost,
                supplier: part.supplier || '',
                notes: result.value.notes || 'เพิ่มสต็อก',
                image_url: part.image_url || '',
                is_stock_add: true
            };

            google.script.run
                .withSuccessHandler(function(res) {
                    Swal.close();
                    if (res.status === 'success') {
                        showNotification('✅ เพิ่มสต็อก ' + part.part_name + ' จำนวน ' + result.value.qty + ' ' + part.unit + ' เรียบร้อย', 'success');
                        sparePartsData.stockAlertShown = false;
                        loadSparePartsInventory();
                    } else {
                        showNotification('❌ ' + (res.message || 'เกิดข้อผิดพลาด'), 'error');
                    }
                })
                .withFailureHandler(function(error) {
                    Swal.close();
                    showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
                })
                .addSparePartToInventory(sparePartData, sessionId);
        }
    });
}

// ============================================
// Edit Inventory Part
// ============================================
function editInventoryPart(index) {
    var part = sparePartsData.inventoryList[index];
    if (!part) {
        showNotification('ไม่พบข้อมูลอะไหล่', 'error');
        return;
    }

    sparePartsData.editPartImageData = null;
    sparePartsData.editPartIndex = index;

    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-edit mr-2"></i>แก้ไขอะไหล่\
                    </h2>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ชื่ออะไหล่ *</label>\
                    <input type="text" id="editPartName" value="' + (part.part_name || '') + '" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <!-- ✅ เพิ่มช่องแก้ไขสถานที่เก็บ -->\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">สถานที่เก็บ</label>\
                    <input type="text" id="editPartLocation" value="' + (part.location || '') + '" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">\
                    <div>\
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หน่วย *</label>\
                        <select id="editPartUnit" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                            <option value="pcs" ' + (part.unit === 'pcs' ? 'selected' : '') + '>ชิ้น (pcs)</option>\
                            <option value="set" ' + (part.unit === 'set' ? 'selected' : '') + '>ชุด (set)</option>\
                            <option value="meter" ' + (part.unit === 'meter' ? 'selected' : '') + '>เมตร (m)</option>\
                            <option value="liter" ' + (part.unit === 'liter' ? 'selected' : '') + '>ลิตร (L)</option>\
                            <option value="kg" ' + (part.unit === 'kg' ? 'selected' : '') + '>กิโลกรัม (kg)</option>\
                            <option value="box" ' + (part.unit === 'box' ? 'selected' : '') + '>กล่อง (box)</option>\
                            <option value="pack" ' + (part.unit === 'pack' ? 'selected' : '') + '>แพ็ค (pack)</option>\
                        </select>\
                    </div>\
                    <div>\
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ราคาต่อหน่วย (บาท) *</label>\
                        <input type="number" id="editPartCost" value="' + (part.unit_cost || 0) + '" min="0" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                    </div>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ซัพพลายเออร์</label>\
                    <input type="text" id="editPartSupplier" value="' + (part.supplier || '') + '" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">รูปอะไหล่</label>\
                    <div id="editPartImageContainer" style="' + (part.image_url ? 'display:none;' : '') + '">\
                        <label style="display: block; border: 2px dashed #d1d5db; border-radius: 8px; padding: 15px; text-align: center; cursor: pointer;" onmouseover="this.style.borderColor=\'#f59e0b\'" onmouseout="this.style.borderColor=\'#d1d5db\'">\
                            <i class="fas fa-cloud-upload-alt" style="font-size: 20px; color: #9ca3af;"></i>\
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">คลิกเพื่ออัพโหลดรูป</p>\
                            <input type="file" id="editPartImageInput" accept="image/*" style="display: none;" onchange="previewEditInventoryPartImage(event)">\
                        </label>\
                    </div>\
                    <div id="editPartImagePreview" style="' + (part.image_url ? '' : 'display:none;') + ' margin-top: 10px; text-align: center;">\
                        <img id="editPartImagePreviewImg" src="' + (part.image_url || '') + '" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 2px solid #f59e0b;">\
                        <br>\
                        <button type="button" onclick="clearEditInventoryPartImage()" style="margin-top: 5px; padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px;">\
                            <i class="fas fa-trash mr-1"></i>ลบรูป\
                        </button>\
                        <button type="button" onclick="changeEditInventoryPartImage()" style="margin-top: 5px; margin-left: 5px; padding: 4px 12px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px;">\
                            <i class="fas fa-exchange-alt mr-1"></i>เปลี่ยนรูป\
                        </button>\
                    </div>\
                </div>\
            </div>\
        ',
        width: '450px',
        showCancelButton: true,
        confirmButtonColor: '#F59E0B',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-save mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        preConfirm: function() {
            var name = document.getElementById('editPartName').value.trim();
            // ✅ ดึงค่า Location
            var location = document.getElementById('editPartLocation').value.trim();
            var unit = document.getElementById('editPartUnit').value;
            var cost = Number(document.getElementById('editPartCost').value);
            var supplier = document.getElementById('editPartSupplier').value.trim();

            if (!name) {
                Swal.showValidationMessage('กรุณาระบุชื่ออะไหล่');
                return false;
            }

            return { name: name, location: location, unit: unit, cost: cost, supplier: supplier };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            saveEditedInventoryPart(part.part_name, result.value);
        }
    });
}

window.previewEditInventoryPartImage = function(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('ขนาดไฟล์ไม่ควรเกิน 5MB', 'warning');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('editPartImagePreviewImg').src = e.target.result;
        document.getElementById('editPartImagePreview').style.display = 'block';
        document.getElementById('editPartImageContainer').style.display = 'none';
        sparePartsData.editPartImageData = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.clearEditInventoryPartImage = function() {
    document.getElementById('editPartImagePreviewImg').src = '';
    document.getElementById('editPartImagePreview').style.display = 'none';
    document.getElementById('editPartImageContainer').style.display = 'block';
    sparePartsData.editPartImageData = 'REMOVE';
};

window.changeEditInventoryPartImage = function() {
    document.getElementById('editPartImageInput').click();
};

function saveEditedInventoryPart(originalName, data) {
    var sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังบันทึก...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    var updateData = {
        original_name: originalName,
        part_name: data.name,
        location: data.location, // ✅ ส่ง location ไปอัพเดท
        unit: data.unit,
        unit_cost: data.cost,
        supplier: data.supplier
    };

    // ... (ส่วนรูปภาพเหมือนเดิม) ...
    if (sparePartsData.editPartImageData && sparePartsData.editPartImageData !== 'REMOVE') {
        google.script.run
            .withSuccessHandler(function(imageUrl) {
                updateData.image_url = imageUrl || '';
                doUpdateInventoryPart(updateData, sessionId);
            })
            .withFailureHandler(function(error) {
                console.error('Image upload error:', error);
                doUpdateInventoryPart(updateData, sessionId);
            })
            .uploadSparePartImage(sparePartsData.editPartImageData, 'INVENTORY');
    } else if (sparePartsData.editPartImageData === 'REMOVE') {
        updateData.image_url = '';
        doUpdateInventoryPart(updateData, sessionId);
    } else {
        doUpdateInventoryPart(updateData, sessionId);
    }
}

function doUpdateInventoryPart(updateData, sessionId) {
    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                showNotification('✅ แก้ไขอะไหล่เรียบร้อยแล้ว', 'success');
                sparePartsData.stockAlertShown = false;
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .updateInventoryPart(updateData, sessionId);
}

// ============================================
// Delete Inventory Part
// ============================================
function deleteInventoryPart(index) {
    var part = sparePartsData.inventoryList[index];
    if (!part) {
        showNotification('ไม่พบข้อมูลอะไหล่', 'error');
        return;
    }

    var usedQty = part.used_quantity || 0;
    
    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-trash mr-2"></i>ลบอะไหล่\
                    </h2>\
                </div>\
                <div style="text-align: center; margin-bottom: 20px;">\
                    ' + (part.image_url ? '<img src="' + part.image_url + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;">' : '<i class="fas fa-cog text-6xl text-gray-300 mb-3"></i>') + '\
                    <h3 style="margin: 0; font-size: 18px; color: #374151;">' + part.part_name + '</h3>\
                </div>\
                ' + (usedQty > 0 ? '<div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b;"><i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i><span style="color: #92400e;">อะไหล่นี้ถูกใช้ในงานซ่อมแล้ว ' + usedQty + ' รายการ</span></div>' : '') + '\
                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">\
                    <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>\
                    <p style="margin: 0; color: #991b1b; font-weight: 600;">คุณต้องการลบอะไหล่นี้ใช่หรือไม่?</p>\
                    <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 12px;">การดำเนินการนี้ไม่สามารถเรียกคืนได้</p>\
                </div>\
            </div>\
        ',
        width: '400px',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-trash mr-2"></i>ลบ',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก'
    }).then(function(result) {
        if (result.isConfirmed) {
            doDeleteInventoryPart(part.part_name);
        }
    });
}

function doDeleteInventoryPart(partName) {
    var sessionId = localStorage.getItem('sessionId');

    Swal.fire({
        title: 'กำลังลบ...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                showNotification('✅ ลบอะไหล่เรียบร้อยแล้ว', 'success');
                sparePartsData.stockAlertShown = false;
                loadSparePartsInventory();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .deleteInventoryPart(partName, sessionId);
}

function showRequestNewPartForm(prefillData = null) {
    // ตรวจสอบว่ามีรหัสงานซ่อมหรือไม่
    const repairId = sparePartsData.currentRepairId || window.currentTechRepairId;

    if (!repairId) {
        // กู้คืน ID
        if (window.currentTechRepairId) {
            if (typeof sparePartsData === 'undefined') window.sparePartsData = {};
            sparePartsData.currentRepairId = window.currentTechRepairId;
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่พบข้อมูลงานซ่อม',
                text: 'กรุณาลองเปิดหน้านี้ใหม่อีกครั้ง',
                confirmButtonText: 'ตกลง'
            });
            return;
        }
    }

    // กำหนดค่าเริ่มต้น และป้องกันเครื่องหมาย " ทำ HTML พัง
    const safeString = (str) => str ? String(str).replace(/"/g, '&quot;') : '';
    
    const valName = prefillData ? safeString(prefillData.name) : '';
    const valUnit = prefillData ? prefillData.unit : 'pcs';
    const valCost = prefillData ? prefillData.cost : 0;
    const valReason = prefillData ? safeString(prefillData.reason) : '';
    
    // ตั้งค่า UI
    const nameAttr = prefillData ? 'readonly style="background-color: #f3f4f6; color: #6b7280;"' : '';
    const modalTitle = prefillData ? 'แจ้งขอเบิก (สินค้าหมด)' : 'ขอเบิกอะไหล่ใหม่';
    const bannerInfo = prefillData ? `<div style="background-color: #dbeafe; color: #1e40af; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px; border: 1px solid #93c5fd;"><i class="fas fa-info-circle mr-2"></i>ระบบดึงข้อมูลสินค้าให้อัตโนมัติ</div>` : '';

    // Reset รูปภาพ
    window.requestPartImageBase64 = null;

    Swal.fire({
        title: '',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0; font-size: 18px;">
                        <i class="fas fa-file-alt mr-2"></i>${modalTitle}
                    </h2>
                    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px;">งานซ่อม: ${repairId}</p>
                </div>
                
                ${bannerInfo}
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ชื่ออะไหล่ *</label>
                    <input type="text" id="reqPartName" value="${valName}" ${nameAttr} 
                           placeholder="เช่น RAM 16GB DDR4" 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">จำนวน *</label>
                        <input type="number" id="reqPartQty" value="1" min="1" 
                               style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หน่วย *</label>
                        <select id="reqPartUnit" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                            <option value="pcs" ${valUnit === 'pcs' ? 'selected' : ''}>ชิ้น (pcs)</option>
                            <option value="set" ${valUnit === 'set' ? 'selected' : ''}>ชุด (set)</option>
                            <option value="meter" ${valUnit === 'meter' ? 'selected' : ''}>เมตร (m)</option>
                            <option value="liter" ${valUnit === 'liter' ? 'selected' : ''}>ลิตร (L)</option>
                            <option value="kg" ${valUnit === 'kg' ? 'selected' : ''}>กิโลกรัม (kg)</option>
                            <option value="box" ${valUnit === 'box' ? 'selected' : ''}>กล่อง (box)</option>
                            <option value="pack" ${valUnit === 'pack' ? 'selected' : ''}>แพ็ค (pack)</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ราคาโดยประมาณ (บาท/หน่วย)</label>
                    <input type="number" id="reqPartCost" value="${valCost}" min="0" step="0.01" 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">เหตุผลในการขอเบิก *</label>
                    <textarea id="reqPartReason" rows="2" 
                              placeholder="อธิบายเหตุผลที่ต้องการอะไหล่นี้..." 
                              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">${valReason}</textarea>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">รูปภาพอะไหล่ (ถ้ามี)</label>
                    <div class="flex items-center justify-center w-full">
                        <label for="reqPartImage" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6" id="reqUploadPlaceholder">
                                <i class="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                                <p class="mb-1 text-sm text-gray-500"><span class="font-semibold">คลิกเพื่ออัพโหลด</span></p>
                                <p class="text-xs text-gray-500">PNG, JPG (ไม่เกิน 5MB)</p>
                            </div>
                            <img id="reqImagePreview" src="" class="hidden max-h-full p-2 object-contain">
                            <input id="reqPartImage" type="file" class="hidden" accept="image/*" onchange="previewRequestImage(event)" />
                        </label>
                    </div>
                    <div id="reqImageActions" class="hidden mt-2 text-center">
                        <button type="button" onclick="clearRequestImage()" class="text-xs text-red-600 hover:text-red-800">
                            <i class="fas fa-trash mr-1"></i>ลบรูปภาพ
                        </button>
                    </div>
                </div>
            </div>
        `,
        width: '450px',
        showCancelButton: true,
        confirmButtonColor: '#F97316',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-paper-plane mr-2"></i>ส่งคำขอ',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        allowEnterKey: false, // ป้องกันการกด Enter แล้วปิด
        preConfirm: function() {
            var name = document.getElementById('reqPartName').value.trim();
            var qty = Number(document.getElementById('reqPartQty').value);
            var unit = document.getElementById('reqPartUnit').value;
            var cost = Number(document.getElementById('reqPartCost').value);
            var reason = document.getElementById('reqPartReason').value.trim();

            if (!name) {
                Swal.showValidationMessage('กรุณาระบุชื่ออะไหล่');
                return false;
            }
            if (qty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง');
                return false;
            }
            if (!reason) {
                Swal.showValidationMessage('กรุณาระบุเหตุผลในการขอเบิก');
                return false;
            }

            return { 
                name: name, 
                qty: qty, 
                unit: unit, 
                cost: cost, 
                reason: reason,
                image: window.requestPartImageBase64
            };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            submitSparePartRequest(result.value);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // ถ้ากดยกเลิกในกรณีที่มีการ prefill (มาจากหน้า stock) ให้กลับไปหน้า stock
            if (prefillData) {
                if(typeof techShowPickFromInventory === 'function') {
                    // เปิดหน้าเลือกอะไหล่กลับมา (หน่วงเวลาเล็กน้อย)
                    setTimeout(() => {
                        techShowPickFromInventory();
                    }, 500);
                }
            }
        }
    });
}

// ฟังก์ชันสำหรับ Preview รูปภาพ (เพิ่มต่อท้ายไฟล์ js-spare-parts.js)
window.previewRequestImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('reqUploadPlaceholder').classList.add('hidden');
            const img = document.getElementById('reqImagePreview');
            img.src = e.target.result;
            img.classList.remove('hidden');
            document.getElementById('reqImageActions').classList.remove('hidden');
            
            window.requestPartImageBase64 = e.target.result; // เก็บค่า Base64
        };
        reader.readAsDataURL(file);
    }
};

window.clearRequestImage = function() {
    document.getElementById('reqPartImage').value = '';
    document.getElementById('reqUploadPlaceholder').classList.remove('hidden');
    document.getElementById('reqImagePreview').classList.add('hidden');
    document.getElementById('reqImageActions').classList.add('hidden');
    window.requestPartImageBase64 = null;
};



function submitSparePartRequest(data) {
    var sessionId = localStorage.getItem('sessionId');
    var currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // เตรียมข้อมูลพื้นฐาน
    var requestData = {
        repair_id: sparePartsData.currentRepairId,
        part_name: data.name,
        quantity: data.qty,
        unit: data.unit,
        estimated_cost: data.cost,
        total_cost: data.qty * data.cost,
        reason: data.reason,
        requested_by: currentUser.username || currentUser.name || '',
        image_url: '' // เตรียมไว้
    };

    Swal.fire({
        title: 'กำลังส่งคำขอ...',
        html: data.image ? 'กำลังอัพโหลดรูปภาพและบันทึกข้อมูล...' : 'กำลังบันทึกข้อมูล...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    // ถ้ามีรูปภาพ ให้ทำการอัพโหลดก่อน
    if (data.image) {
        // ใช้ฟังก์ชัน uploadSparePartImage ที่มีอยู่แล้วใน code.gs
        // โดยส่ง base64 ไป
        google.script.run
            .withSuccessHandler(function(imageUrl) {
                if (imageUrl) {
                    requestData.image_url = imageUrl; // ได้ URL แบบ https://lh5.googleusercontent.com/d/FILE_ID มาแล้ว
                }
                // ส่งข้อมูลหลังจากได้ URL รูปภาพ
                sendRequestDataToServer(requestData, sessionId);
            })
            .withFailureHandler(function(error) {
                console.error("Image upload failed:", error);
                // ถ้าอัพรูปไม่ผ่าน ก็ยังส่งข้อมูลต่อแต่ไม่มีรูป
                sendRequestDataToServer(requestData, sessionId);
            })
            .uploadSparePartImage(data.image, sparePartsData.currentRepairId);
    } else {
        // ไม่มีรูปภาพ ส่งข้อมูลเลย
        sendRequestDataToServer(requestData, sessionId);
    }
}

// ฟังก์ชันย่อยสำหรับส่งข้อมูล (เพื่อลดความซ้ำซ้อน)
function sendRequestDataToServer(requestData, sessionId) {
    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'ส่งคำขอเรียบร้อย',
                    html: '<p>คำขอเบิกอะไหล่ถูกส่งไปยัง Admin แล้ว</p><p style="color: #f97316; font-weight: 600;">กรุณารอการอนุมัติ</p>',
                    confirmButtonColor: '#F97316'
                }).then(() => {
                    // ✅ เช็คว่าทำงานอยู่ในหน้า Modal ของช่างหรือไม่
                    if (window.currentTechRepairId && typeof techRecordSpareParts === 'function') {
                        // รีเฟรช Modal ของช่าง เพื่อปิด Modal ขอเบิกและกลับไปหน้ารายการ
                        techRecordSpareParts(window.currentTechRepairId);
                    } else {
                        // รีเฟรชหน้าปกติ (Spare Parts Tab)
                        loadRepairPendingRequests(sparePartsData.currentRepairId);
                    }
                });
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .createSparePartRequest(requestData, sessionId);
}

// ============================================
// 🔧 Technician Modal Helpers (เพิ่มใหม่)
// ============================================

function showTechPickFromInventoryModal() {
    var sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({
        title: 'กำลังโหลดคลังอะไหล่...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
    });

    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            
            if (result.status === 'success' && result.inventory) {
                // 1. เก็บข้อมูลลงตัวแปร Global
                window.techAllAvailableParts = result.inventory;
                window.techFilteredParts = result.inventory;
                window.techCurrentPage = 1;
                
                // 2. แสดง Modal
                renderTechInventoryModal();
            } else {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลคลังได้', 'error');
            }
        })
        .getSparePartsInventory(sessionId);
}

function renderTechInventoryModal() {
    Swal.fire({
        title: '📦 เลือกอะไหล่จากคลัง',
        html: `
            <div style="text-align: left; overflow: hidden; display: flex; flex-direction: column; height: 100%;">
                
                <!-- ช่องค้นหา -->
                <div style="position: relative; margin-bottom: 15px;">
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 12px; color: #9CA3AF;"></i>
                    <input type="text" id="techInvSearch" placeholder="ค้นหาชื่ออะไหล่..." 
                           style="width: 100%; padding: 10px 10px 10px 36px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                           oninput="filterTechInventoryPicker()">
                </div>

                <!-- 🔴 จุดสำคัญ: Container สำหรับรายการสินค้า (กำหนดความสูงให้ชัดเจน) -->
                <div id="techPartsListContainer" style="height: 400px; overflow-y: auto; padding-right: 5px; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px;">
                    <!-- รายการอะไหล่จะถูกใส่ที่นี่โดย JavaScript -->
                    <div style="text-align: center; padding-top: 20px; color: #999;">กำลังโหลดรายการ...</div>
                </div>

                <!-- Pagination Container -->
                <div id="techPaginationContainer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #F3F4F6;">
                    <!-- ปุ่มเปลี่ยนหน้าจะถูกใส่ที่นี่ -->
                </div>
            </div>
        `,
        width: '600px',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'ปิดหน้าต่าง',
        cancelButtonColor: '#6B7280',
        didOpen: () => {
            // Render หน้าแรกทันทีที่เปิด
            setTimeout(() => {
                renderTechPartsPage();
                // Focus ช่องค้นหา
                const searchInput = document.getElementById('techInvSearch');
                if(searchInput) searchInput.focus();
            }, 100);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            if (window.currentTechRepairId && typeof techRecordSpareParts === 'function') {
                techRecordSpareParts(window.currentTechRepairId);
            }
        }
    });
}
function renderTechPartsPage() {
    const container = document.getElementById('techPartsListContainer');
    const paginationContainer = document.getElementById('techPaginationContainer');
    
    // ถ้าไม่เจอ Container ให้หยุดทำงาน (ป้องกัน Error)
    if (!container) {
        console.error("ไม่พบ Element ID: techPartsListContainer");
        return;
    }
    
    const filteredParts = window.techFilteredParts || [];
    const itemsPerPage = window.techPartsPerPage || 10;
    const currentPage = window.techCurrentPage || 1;
    
    // คำนวณขอบเขตข้อมูล
    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredParts.length);
    const pageItems = filteredParts.slice(startIndex, endIndex);
    
    // --- สร้าง HTML รายการอะไหล่ ---
    if (pageItems.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 0; color: #9CA3AF;">
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>ไม่พบรายการอะไหล่</p>
            </div>`;
    } else {
        const partsListHtml = pageItems.map(part => {
            // คำนวณคงเหลือ
            const stockQty = part.stock_quantity || part.total_quantity || 0;
            const usedQty = part.used_quantity || 0;
            const remaining = Math.max(0, stockQty - usedQty);
            const isOutOfStock = remaining <= 0;

            // หา Index จริง
            const realIndex = window.techAllAvailableParts.indexOf(part);

            // Action: มีของ->เลือก, หมด->ขอเบิก
            const clickAction = isOutOfStock 
                ? `requestRestockFromTech(${realIndex})` 
                : `selectTechInventoryPart(${realIndex})`;

            // Style: ของหมด->สีแดง
            const cardStyle = isOutOfStock 
                ? "border: 2px solid #fee2e2; background: #fff1f2;" 
                : "border: 2px solid #E5E7EB; background: white;";
            
            const imageStyle = isOutOfStock
                ? "filter: grayscale(100%); opacity: 0.7;"
                : "";

            // Badge
            let statusBadge = '';
            if (isOutOfStock) {
                statusBadge = `<span style="background: #EF4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 5px;">หมดสต็อก</span>`;
            } else if (remaining <= 5) {
                statusBadge = `<span style="background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 5px;">ใกล้หมด</span>`;
            }

            return `
            <div class="swal2-part-item" 
                 onclick="${clickAction}" 
                 style="cursor: pointer; padding: 12px; border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; ${cardStyle}">
                
                <div style="display: flex; gap: 12px; align-items: center;">
                    <!-- รูปภาพ -->
                    <div style="position: relative; flex-shrink: 0;">
                        ${part.image_url ? `
                            <img src="${part.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background: #F3F4F6; ${imageStyle}">
                        ` : `
                            <div style="width: 60px; height: 60px; background: #F3F4F6; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-box text-gray-400" style="font-size: 24px;"></i>
                            </div>
                        `}
                    </div>

                    <!-- ข้อมูล -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; flex-wrap: wrap;">
                            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1F2937; font-size: 14px;">
                                ${part.part_name}
                            </p>
                            ${statusBadge}
                        </div>
                        
                        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6B7280;">
                            <i class="fas fa-tag text-blue-500 mr-1"></i>฿${Number(part.unit_cost).toLocaleString()}/หน่วย
                        </p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="margin: 0; font-size: 12px; color: ${isOutOfStock ? '#DC2626' : '#9CA3AF'}; font-weight: ${isOutOfStock ? 'bold' : 'normal'};">
                                <i class="fas fa-cube ${isOutOfStock ? 'text-red-500' : 'text-green-500'} mr-1"></i>
                                คงเหลือ: ${remaining} ${part.unit || 'หน่วย'}
                            </p>
                            
                            ${isOutOfStock ? `
                                <button type="button" style="border: none; background: #F97316; color: white; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                    <i class="fas fa-bullhorn"></i> แจ้งขอเบิก
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = partsListHtml;
    }
    
    // --- สร้าง Pagination Buttons ---
    if (paginationContainer) {
        if (totalPages > 1) {
            let paginationHtml = '';
            
            // ปุ่มย้อนกลับ
            paginationHtml += `<button type="button" onclick="changeTechPage(${currentPage - 1})" 
                style="padding: 6px 10px; background: ${currentPage > 1 ? '#3B82F6' : '#E5E7EB'}; color: ${currentPage > 1 ? 'white' : '#9CA3AF'}; border: none; border-radius: 4px; cursor: ${currentPage > 1 ? 'pointer' : 'not-allowed'}; font-size: 12px;" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>`;

            // ข้อความแสดงหน้า
            paginationHtml += `<div style="margin: 0 10px; font-size: 12px; color: #6B7280; display: flex; align-items: center;">
                หน้า ${currentPage} / ${totalPages} (${filteredParts.length} รายการ)
            </div>`;

            // ปุ่มถัดไป
            paginationHtml += `<button type="button" onclick="changeTechPage(${currentPage + 1})" 
                style="padding: 6px 10px; background: ${currentPage < totalPages ? '#3B82F6' : '#E5E7EB'}; color: ${currentPage < totalPages ? 'white' : '#9CA3AF'}; border: none; border-radius: 4px; cursor: ${currentPage < totalPages ? 'pointer' : 'not-allowed'}; font-size: 12px;" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>`;
            
            paginationContainer.innerHTML = paginationHtml;
            paginationContainer.style.display = 'flex';
        } else {
            paginationContainer.style.display = 'none';
        }
    }
}
function requestRestockFromTech(index) {
    const part = window.techAllAvailableParts[index];
    if (!part) return;

    // เตรียมข้อมูลอะไหล่ที่จะส่งไปหน้าขอเบิก
    const prefillData = {
        name: part.part_name,
        unit: part.unit,
        cost: part.unit_cost,
        reason: "สินค้าหมดสต็อก (แจ้งเตือนจากหน้าเลือกอะไหล่)"
    };

    // 1. ปิด Modal เลือกของปัจจุบันก่อน
    Swal.close();

    // 2. รอ 500ms แล้วค่อยเปิดหน้าต่างใหม่ (ป้องกันการชนกันของ Animation)
    setTimeout(() => {
        showRequestNewPartForm(prefillData);
    }, 500);
}

// ฟังก์ชันเปลี่ยนหน้า
window.changeTechPage = function(newPage) {
    const totalPages = Math.ceil(window.techFilteredParts.length / window.techPartsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        window.techCurrentPage = newPage;
        renderTechPartsPage();
        // เลื่อน Scroll กลับไปบนสุดของรายการ
        document.getElementById('techInvList').scrollTop = 0;
    }
};


function renderTechInventoryPicker(inventory) {
    const itemsHtml = inventory.map((part, index) => {
        const remaining = (part.stock_quantity || 0) - (part.used_quantity || 0);
        if (remaining <= 0) return ''; // ไม่แสดงของหมด

        return `
            <div onclick="selectTechInventoryPart(${index})" 
                 style="cursor: pointer; padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; hover: bg-gray-50;">
                <div style="text-align: left;">
                    <div style="font-weight: 600; color: #374151;">${part.part_name}</div>
                    <div style="font-size: 12px; color: #6b7280;">
                        คงเหลือ: <span style="color: #059669; font-weight: bold;">${remaining} ${part.unit}</span>
                    </div>
                </div>
                <div style="font-weight: 600; color: #2563eb;">฿${Number(part.unit_cost).toLocaleString()}</div>
            </div>
        `;
    }).join('');

    Swal.fire({
        title: '📦 เลือกอะไหล่จากคลัง',
        html: `
            <input type="text" id="techInvSearch" placeholder="🔍 ค้นหาอะไหล่..." 
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;"
                   oninput="filterTechInventoryPicker()">
            <div id="techInvList" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px;">
                ${itemsHtml || '<div style="padding:20px; color:#999;">ไม่มีอะไหล่พร้อมใช้งาน</div>'}
            </div>
        `,
        width: '450px',
        showCancelButton: true,
        cancelButtonText: 'ย้อนกลับ',
        showConfirmButton: false,
        willClose: () => {
            // เมื่อปิดหรือกดย้อนกลับ ให้เปิดหน้าจัดการอะไหล่คืนมา
            // เช็คว่าไม่ได้ปิดเพราะกดเลือก (ซึ่งจะจัดการแยกต่างหาก)
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            // กดย้อนกลับ -> เปิดหน้าจัดการอะไหล่คืนมา
            if (window.currentTechRepairId) {
                techRecordSpareParts(window.currentTechRepairId);
            }
        }
    });
}

function selectTechInventoryPart(index) {
    // ดึงข้อมูลจาก Index ของ Array หลัก (ถูกต้องแล้ว)
    const part = window.techAllAvailableParts[index];
    if (!part) return;

    const remaining = (part.stock_quantity || 0) - (part.used_quantity || 0);

    // ตรวจสอบรูปภาพ
    const imageDisplay = part.image_url 
        ? `<img src="${part.image_url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin: 0 auto 10px auto; display: block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`
        : `<div style="width: 80px; height: 80px; background: #F3F4F6; border-radius: 10px; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; color: #9CA3AF;"><i class="fas fa-cube text-3xl"></i></div>`;

    Swal.fire({
        title: 'ยืนยันการเลือก',
        html: `
            <div style="margin-bottom: 20px;">
                ${imageDisplay}
                <h3 style="font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 5px;">${part.part_name}</h3>
                <div style="display: flex; justify-content: center; gap: 15px; font-size: 14px; color: #6B7280; margin-bottom: 15px;">
                    <span><i class="fas fa-tag text-blue-500"></i> ฿${Number(part.unit_cost).toLocaleString()}</span>
                    <span><i class="fas fa-box text-green-500"></i> คงเหลือ ${remaining} ${part.unit}</span>
                </div>
            </div>
            
            <div style="background: #F9FAFB; padding: 15px; border-radius: 10px; border: 1px solid #E5E7EB;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">ระบุจำนวนที่ใช้</label>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <!-- ✅ แก้ไขตรง onclick ให้เรียกฟังก์ชัน Global -->
                    <button type="button" onclick="adjustTechPickQty(-1, ${remaining})" style="width: 36px; height: 36px; border: 1px solid #D1D5DB; background: white; border-radius: 6px 0 0 6px; cursor: pointer; color: #374151;">-</button>
                    
                    <input type="number" id="pickQty" value="1" min="1" max="${remaining}" 
                           style="width: 80px; height: 36px; text-align: center; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB; border-left: none; border-right: none; outline: none; font-weight: 600; color: #2563EB;">
                    
                    <!-- ✅ แก้ไขตรง onclick ให้เรียกฟังก์ชัน Global -->
                    <button type="button" onclick="adjustTechPickQty(1, ${remaining})" style="width: 36px; height: 36px; border: 1px solid #D1D5DB; background: white; border-radius: 0 6px 6px 0; cursor: pointer; color: #374151;">+</button>
                </div>
                <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #6B7280;">
                    สูงสุด: ${remaining} ${part.unit}
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#9CA3AF',
        preConfirm: () => {
            const qty = document.getElementById('pickQty').value;
            if (qty > remaining) {
                Swal.showValidationMessage(`มีของไม่พอ (เหลือ ${remaining})`);
                return false;
            }
            if (qty <= 0) {
                Swal.showValidationMessage(`จำนวนต้องมากกว่า 0`);
                return false;
            }
            return qty;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveTechPickedPart(part, result.value);
        } else {
            // ยกเลิก -> กลับไปหน้าเลือก (Re-render)
            renderTechInventoryModal();
        }
    });
}

// ✅ ฟังก์ชันปรับจำนวน (ต้องอยู่นอก Swal)
window.adjustTechPickQty = function(change, maxQty) {
    const input = document.getElementById('pickQty');
    if (!input) return;
    
    let val = parseInt(input.value) || 0;
    val += change;
    
    // ตรวจสอบขอบเขต
    if (val < 1) val = 1;
    if (val > maxQty) val = maxQty;
    
    input.value = val;
};

// ฟังก์ชันค้นหา
function filterTechInventoryPicker() {
    const term = document.getElementById('techInvSearch').value.toLowerCase();
    
    if (term === '') {
        window.techFilteredParts = window.techAllAvailableParts;
    } else {
        window.techFilteredParts = window.techAllAvailableParts.filter(p => 
            p.part_name.toLowerCase().includes(term)
        );
    }
    
    window.techCurrentPage = 1; // รีเซ็ตไปหน้า 1
    renderTechPartsPage();
}


function saveTechPickedPart(part, qty) {
    var sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

    var sparePartData = {
        part_name: part.part_name,
        quantity: qty,
        unit: part.unit,
        unit_cost: part.unit_cost,
        total_cost: qty * part.unit_cost,
        supplier: part.supplier || '',
        notes: 'ดึงจากคลัง (Tech Modal)',
        image_url: part.image_url || ''
    };

    google.script.run
        .withSuccessHandler(function(res) {
            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success', 
                    title: 'เพิ่มเรียบร้อย',
                    timer: 1000,
                    showConfirmButton: false
                }).then(() => {
                    // ✅ กลับไปหน้าจัดการอะไหล่ของงานซ่อมนั้น
                    techRecordSpareParts(window.currentTechRepairId);
                });
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .addSparePart(window.currentTechRepairId, sparePartData, sessionId);
}


function loadRepairPendingRequests(repairId) {
    var sessionId = localStorage.getItem('sessionId');
    var container = document.getElementById('pendingRequestsList');
    var content = document.getElementById('pendingRequestsContent');
    
    if (!container || !content) return;

    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success' && result.requests && result.requests.length > 0) {
                container.classList.remove('hidden');
                
                var html = result.requests.map(function(req) {
                    var statusColor = req.status === 'pending' ? 'yellow' : req.status === 'approved' ? 'green' : 'red';
                    var statusText = req.status === 'pending' ? 'รออนุมัติ' : req.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ';
                    var statusIcon = req.status === 'pending' ? 'clock' : req.status === 'approved' ? 'check-circle' : 'times-circle';
                    
                    var cancelBtn = req.status === 'pending' ? '<button onclick="cancelSparePartRequest(\'' + req.id + '\')" class="text-red-500 hover:text-red-700 text-xs ml-2"><i class="fas fa-times"></i></button>' : '';
                    
                    return '<div class="flex items-center justify-between p-2 bg-' + statusColor + '-50 rounded-lg border border-' + statusColor + '-200">' +
                        '<div class="flex items-center gap-2">' +
                            '<i class="fas fa-' + statusIcon + ' text-' + statusColor + '-500"></i>' +
                            '<div>' +
                                '<span class="font-medium text-sm">' + req.part_name + '</span>' +
                                '<span class="text-gray-500 text-xs ml-2">x' + req.quantity + ' ' + req.unit + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="flex items-center">' +
                            '<span class="text-xs px-2 py-0.5 rounded bg-' + statusColor + '-100 text-' + statusColor + '-700">' + statusText + '</span>' +
                            cancelBtn +
                        '</div>' +
                    '</div>';
                }).join('');
                
                content.innerHTML = html;
            } else {
                container.classList.add('hidden');
            }
        })
        .withFailureHandler(function(error) {
            console.error('Load pending requests error:', error);
        })
        .getSparePartRequestsByRepair(repairId, sessionId);
}

function cancelSparePartRequest(requestId) {
    Swal.fire({
        title: 'ยกเลิกคำขอ?',
        text: 'คุณต้องการยกเลิกคำขอเบิกนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'ยกเลิกคำขอ',
        cancelButtonText: 'ไม่'
    }).then(function(result) {
        if (result.isConfirmed) {
            var sessionId = localStorage.getItem('sessionId');
            
            google.script.run
                .withSuccessHandler(function(res) {
                    if (res.status === 'success') {
                        showNotification('✅ ยกเลิกคำขอเรียบร้อย', 'success');
                        loadRepairPendingRequests(sparePartsData.currentRepairId);
                    } else {
                        showNotification('❌ ' + (res.message || 'เกิดข้อผิดพลาด'), 'error');
                    }
                })
                .withFailureHandler(function(error) {
                    showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
                })
                .cancelSparePartRequest(requestId, sessionId);
        }
    });
}

// ============================================
// Tab: Approval (Admin Only)
// ============================================
function showSparePartsApprovalTab() {
    var content = document.getElementById('sparePartsTabContent');
    content.innerHTML = '\
        <div class="bg-white rounded-lg shadow-md p-6">\
            <div class="flex justify-between items-center mb-6">\
                <h2 class="text-xl font-semibold text-gray-800">\
                    <i class="fas fa-clipboard-check text-orange-500 mr-2"></i>อนุมัติคำขอเบิกอะไหล่\
                </h2>\
                <button onclick="loadPendingRequests()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">\
                    <i class="fas fa-sync-alt"></i>\
                </button>\
            </div>\
            <div class="flex gap-2 mb-4">\
                <button onclick="filterApprovalList(\'all\')" class="approval-filter-btn px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium" data-filter="all">ทั้งหมด</button>\
                <button onclick="filterApprovalList(\'pending\')" class="approval-filter-btn px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm font-medium active" data-filter="pending">รออนุมัติ</button>\
                <button onclick="filterApprovalList(\'approved\')" class="approval-filter-btn px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium" data-filter="approved">อนุมัติแล้ว</button>\
                <button onclick="filterApprovalList(\'rejected\')" class="approval-filter-btn px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium" data-filter="rejected">ปฏิเสธ</button>\
            </div>\
            <div id="approvalRequestsList" class="space-y-4">\
                <div class="text-center py-8 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>กำลังโหลด...</div>\
            </div>\
        </div>\
    ';
    
    sparePartsData.approvalFilter = 'pending';
    loadPendingRequests();
}

window.filterApprovalList = function(filter) {
    sparePartsData.approvalFilter = filter;
    document.querySelectorAll('.approval-filter-btn').forEach(function(btn) {
        btn.classList.remove('active', 'ring-2', 'ring-offset-1');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'ring-2', 'ring-offset-1');
        }
    });
    loadPendingRequests();
};

function loadPendingRequestsCount() {
    var sessionId = localStorage.getItem('sessionId');
    
    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success') {
                var badge = document.getElementById('pendingBadge');
                if (badge) {
                    if (result.count > 0) {
                        badge.textContent = result.count > 99 ? '99+' : result.count;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                }
            }
        })
        .withFailureHandler(function(error) {
            console.error('Load pending count error:', error);
        })
        .getPendingRequestsCount(sessionId);
}

function loadPendingRequests() {
    var sessionId = localStorage.getItem('sessionId');
    var container = document.getElementById('approvalRequestsList');
    var filter = sparePartsData.approvalFilter || 'pending';
    
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>กำลังโหลด...</div>';

    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success') {
                var requests = result.requests || [];
                
                // Filter by status
                if (filter !== 'all') {
                    requests = requests.filter(function(r) { return r.status === filter; });
                }
                
                if (requests.length === 0) {
                    container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-inbox text-4xl mb-3"></i><p>ไม่มีคำขอ' + (filter === 'pending' ? 'รออนุมัติ' : '') + '</p></div>';
                    return;
                }
                
                var html = requests.map(function(req) {
                    var statusColor = req.status === 'pending' ? 'yellow' : req.status === 'approved' ? 'green' : 'red';
                    var statusText = req.status === 'pending' ? 'รออนุมัติ' : req.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ';
                    var createdDate = req.created_at ? new Date(req.created_at).toLocaleString('th-TH') : '-';
                    var totalCost = (req.quantity || 0) * (req.estimated_cost || 0);
                    
                    var actionBtns = '';
                    if (req.status === 'pending') {
                        actionBtns = '<div class="flex gap-2 mt-3">' +
                            '<button onclick="approveSparePartRequest(\'' + req.id + '\', ' + (req.estimated_cost || 0) + ')" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium"><i class="fas fa-check mr-1"></i>อนุมัติ</button>' +
                            '<button onclick="rejectSparePartRequest(\'' + req.id + '\')" class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-medium"><i class="fas fa-times mr-1"></i>ปฏิเสธ</button>' +
                        '</div>';
                    }
                    
                    // ✅ ส่วนที่แก้ไข: เพิ่มการแสดงรูปภาพ
                    var imageHtml = '';
                    if (req.image_url) {
                        imageHtml = '<img src="' + req.image_url + '" class="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80" onclick="window.open(\'' + req.image_url + '\', \'_blank\')">';
                    } else {
                        imageHtml = '<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"><i class="fas fa-cube text-gray-400 text-xl"></i></div>';
                    }
                    
                    return '<div class="border border-' + statusColor + '-200 rounded-lg p-4 bg-' + statusColor + '-50">' +
                        '<div class="flex justify-between items-start mb-3">' +
                            '<div>' +
                                '<span class="text-xs text-gray-500">งานซ่อม</span>' +
                                '<h3 class="font-semibold text-gray-800">' + req.repair_id + '</h3>' +
                            '</div>' +
                            '<span class="px-2 py-1 text-xs rounded-full bg-' + statusColor + '-100 text-' + statusColor + '-700 font-medium">' + statusText + '</span>' +
                        '</div>' +
                        '<div class="bg-white rounded-lg p-3 mb-3">' +
                            '<div class="flex items-start gap-3 mb-2">' +
                                // แสดงรูปภาพตรงนี้
                                imageHtml +
                                '<div class="flex-1">' +
                                    '<div class="font-semibold text-gray-800">' + req.part_name + '</div>' +
                                    '<div class="text-sm text-gray-500">' + req.quantity + ' ' + req.unit + ' × ฿' + Number(req.estimated_cost || 0).toLocaleString() + ' = <span class="font-semibold text-blue-600">฿' + totalCost.toLocaleString() + '</span></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="text-sm text-gray-600 bg-gray-50 p-2 rounded"><i class="fas fa-comment-alt text-gray-400 mr-2"></i>' + (req.reason || '-') + '</div>' +
                        '</div>' +
                        '<div class="flex justify-between text-xs text-gray-500">' +
                            '<span><i class="fas fa-user mr-1"></i>' + (req.requested_by || '-') + '</span>' +
                            '<span><i class="fas fa-clock mr-1"></i>' + createdDate + '</span>' +
                        '</div>' +
                        actionBtns +
                    '</div>';
                }).join('');
                
                container.innerHTML = html;
                loadPendingRequestsCount();
            } else {
                container.innerHTML = '<div class="text-center py-8 text-red-500"><i class="fas fa-exclamation-circle mr-2"></i>เกิดข้อผิดพลาด</div>';
            }
        })
        .withFailureHandler(function(error) {
            container.innerHTML = '<div class="text-center py-8 text-red-500"><i class="fas fa-exclamation-circle mr-2"></i>เกิดข้อผิดพลาด: ' + error + '</div>';
        })
        .getAllSparePartRequests(sessionId);
}

// ✅ แก้ไขจุดนี้: เพิ่ม parameter estimatedCost
function approveSparePartRequest(requestId, estimatedCost = 0) {
    Swal.fire({
        title: '',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0; font-size: 18px;">
                        <i class="fas fa-check-circle mr-2"></i>อนุมัติคำขอ
                    </h2>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ราคาจริง (บาท/หน่วย) *</label>
                    <!-- ✅ แก้ไขจุดนี้: ใส่ value เป็น estimatedCost -->
                    <input type="number" id="approveActualCost" value="${estimatedCost}" min="0" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">ซัพพลายเออร์</label>
                    <input type="text" id="approveSupplier" placeholder="เช่น บริษัท ABC" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">หมายเหตุ</label>
                    <textarea id="approveNotes" rows="2" placeholder="หมายเหตุเพิ่มเติม..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"></textarea>
                </div>
            </div>
        `,
        width: '400px',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        preConfirm: function() {
            return {
                actual_cost: Number(document.getElementById('approveActualCost').value) || 0,
                supplier: document.getElementById('approveSupplier').value.trim(),
                notes: document.getElementById('approveNotes').value.trim()
            };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            doApproveRequest(requestId, result.value);
        }
    });
}

function doApproveRequest(requestId, approvalData) {
    var sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({
        title: 'กำลังอนุมัติ...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'อนุมัติเรียบร้อย',
                    text: 'อะไหล่ถูกบันทึกเข้างานซ่อมแล้ว',
                    confirmButtonColor: '#10B981',
                    timer: 1500, // ปิดเองอัตโนมัติ
                    showConfirmButton: false
                });
                
                // ✅ โหลดรายการใหม่
                loadPendingRequests();
                
                // ✅ โหลดข้อมูล Spare Parts Tracking ใหม่ (refresh สถานะ)
                if (window.currentActiveTab === 'sparePartsTracking' || typeof loadSparePartsManagement === 'function') {
                    setTimeout(function() {
                        try {
                            loadSparePartsManagement(); // โหลดหน้าหลัก
                            loadSparePartsInventory(); // โหลดข้อมูลคลังอะไหล่
                        } catch (e) {
                            console.log('Auto-refresh not available');
                        }
                    }, 500);
                }
                
                // ✅ Refresh modal "บันทึกอะไหล่ที่ใช้" ถ้ายังเปิด
                setTimeout(function() {
                    if (window.currentTechRepairId && typeof refreshTechSparePartsModal === 'function') {
                        try {
                            refreshTechSparePartsModal(window.currentTechRepairId);
                        } catch (e) {
                            console.log('Modal refresh not available');
                        }
                    }
                }, 1500);
                
                // ✅ เพิ่มบรรทัดนี้: บังคับโหลดตัวเลขแจ้งเตือนใหม่ทันที
                setTimeout(function() {
                    loadPendingRequestsCount(); 
                }, 1000); // หน่วงเวลา 1 วินาทีเพื่อให้ Server อัพเดททัน
                
                sparePartsData.stockAlertShown = false;
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .approveSparePartRequest(requestId, approvalData, sessionId);
}

function rejectSparePartRequest(requestId) {
    Swal.fire({
        title: '',
        html: '\
            <div style="text-align: left;">\
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); margin: -20px -20px 20px -20px; padding: 20px; border-radius: 12px 12px 0 0;">\
                    <h2 style="color: white; margin: 0; font-size: 18px;">\
                        <i class="fas fa-times-circle mr-2"></i>ปฏิเสธคำขอ\
                    </h2>\
                </div>\
                <div style="margin-bottom: 15px;">\
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #374151;">เหตุผลในการปฏิเสธ *</label>\
                    <textarea id="rejectReason" rows="3" placeholder="กรุณาระบุเหตุผล..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"></textarea>\
                </div>\
            </div>\
        ',
        width: '400px',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-times mr-2"></i>ปฏิเสธ',
        cancelButtonText: 'ยกเลิก',
        preConfirm: function() {
            var reason = document.getElementById('rejectReason').value.trim();
            if (!reason) {
                Swal.showValidationMessage('กรุณาระบุเหตุผลในการปฏิเสธ');
                return false;
            }
            return { reason: reason };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            doRejectRequest(requestId, result.value.reason);
        }
    });
}

function doRejectRequest(requestId, reason) {
    var sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({
        title: 'กำลังปฏิเสธ...',
        didOpen: function() { Swal.showLoading(); },
        allowOutsideClick: false
    });

    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                showNotification('✅ ปฏิเสธคำขอเรียบร้อย', 'success');
                loadPendingRequests();
            } else {
                showNotification('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            showNotification('❌ เกิดข้อผิดพลาด: ' + error, 'error');
        })
        .rejectSparePartRequest(requestId, reason, sessionId);
}

// ============================================
// 🔧 ฟังก์ชันปรับจำนวนอะไหล่ / คืนเข้าคลัง
// ============================================
function adjustSparePartUsage(partId, partName, currentQty, unit) {
    Swal.fire({
        title: 'ปรับจำนวนการใช้',
        html: `
            <div class="text-left">
                <p class="mb-2 text-sm text-gray-600">รายการ: <strong>${partName}</strong></p>
                <p class="mb-4 text-sm text-gray-600">จำนวนที่เบิกมา: <strong>${currentQty} ${unit}</strong></p>
                
                <label class="block text-sm font-medium text-gray-700 mb-1">ระบุจำนวนที่ใช้จริง:</label>
                <input type="number" id="actualQty" class="swal2-input m-0 w-full" value="${currentQty}" min="1" max="${currentQty}">
                
                <div id="returnInfo" class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hidden">
                    <p class="text-sm text-blue-800"><i class="fas fa-undo mr-1"></i> จะคืนเข้าคลัง: <strong id="returnQty">0</strong> ${unit}</p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#3B82F6',
        didOpen: () => {
            const input = document.getElementById('actualQty');
            const infoBox = document.getElementById('returnInfo');
            const returnQtyDisplay = document.getElementById('returnQty');

            input.addEventListener('input', () => {
                const val = parseInt(input.value) || 0;
                const diff = currentQty - val;
                
                if (diff > 0) {
                    infoBox.classList.remove('hidden');
                    returnQtyDisplay.textContent = diff;
                } else {
                    infoBox.classList.add('hidden');
                }
            });
        },
        preConfirm: () => {
            const newQty = parseInt(document.getElementById('actualQty').value);
            if (!newQty || newQty <= 0) {
                Swal.showValidationMessage('กรุณาระบุจำนวนอย่างน้อย 1');
                return false;
            }
            if (newQty > currentQty) {
                Swal.showValidationMessage('จำนวนที่ใช้จริงต้องไม่เกินจำนวนที่เบิกมา');
                return false;
            }
            return newQty;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newQty = result.value;
            // ถ้าจำนวนเท่าเดิม ไม่ต้องทำอะไร
            if (newQty === currentQty) return;

            confirmReturnToStock(partId, partName, currentQty, newQty, unit);
        }
    });
}

function confirmReturnToStock(partId, partName, oldQty, newQty, unit) {
    const returnQty = oldQty - newQty;
    
    Swal.fire({
        title: 'ยืนยันการคืนของ',
        html: `
            คุณต้องการแก้จำนวนการใช้เป็น <b>${newQty} ${unit}</b><br>
            และคืน <b>${partName}</b> จำนวน <b style="color:green">+${returnQty} ${unit}</b> กลับเข้าคลังใช่หรือไม่?
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ดำเนินการ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10B981'
    }).then((result) => {
        if (result.isConfirmed) {
            processReturnToStock(partId, newQty, returnQty);
        }
    });
}

function processReturnToStock(partId, newQty, returnQty) {
    const sessionId = localStorage.getItem('sessionId');
    
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

    google.script.run
        .withSuccessHandler((res) => {
            if (res.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'เรียบร้อย',
                    text: 'ปรับจำนวนและคืนของเข้าคลังแล้ว',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // รีเฟรช Modal ช่าง
                    if (window.currentTechRepairId) {
                        techRecordSpareParts(window.currentTechRepairId);
                    }
                });
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .withFailureHandler((err) => {
            Swal.fire('Error', err.message, 'error');
        })
        .returnSparePartToInventory(partId, newQty, returnQty, sessionId);
}
</script>
