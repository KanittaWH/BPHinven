<script>
// ============================================
// 🔧 ระบบจัดการงานซ่อมสำหรับช่าง (แบบตาราง)
// js-technician.js - Version 2.0
// ============================================

// ตัวแปร Global
let techRepairsList = [];
let techFilteredList = [];
let techCurrentFilter = 'all';
let techSearchTerm = '';
let techCurrentPage = 1;
let techItemsPerPage = 20;
let techTotalPages = 1;

// ตัวแปรสำหรับรูปภาพ
let techCompleteImageBase64 = null;
let techEditImageBase64 = null;


// ============================================
// 📱 หน้าจอหลัก
// ============================================

window.loadTechnicianManagementImpl = function() {
    console.log('🔧 Loading Technician Management (Table View)...');
    
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="max-w-full mx-auto px-4">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-tools text-blue-600 mr-3"></i>
                        จัดการงานซ่อม (ช่าง)
                    </h2>
                    <p class="text-gray-600 mt-1">ดูและจัดการรายการซ่อมที่ได้รับมอบหมาย</p>
                </div>
                <button onclick="techRefresh()" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center">
                    <i class="fas fa-sync-alt mr-2"></i>รีเฟรช
                </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm mb-1">ทั้งหมด</p>
                            <p class="text-3xl font-bold" id="countAll">0</p>
                        </div>
                        <i class="fas fa-list text-4xl opacity-30"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100 text-sm mb-1">รอดำเนินการ</p>
                            <p class="text-3xl font-bold" id="countPending">0</p>
                        </div>
                        <i class="fas fa-clock text-4xl opacity-30"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm mb-1">กำลังซ่อม</p>
                            <p class="text-3xl font-bold" id="countInProgress">0</p>
                        </div>
                        <i class="fas fa-cog text-4xl opacity-30"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm mb-1">เสร็จสิ้น</p>
                            <p class="text-3xl font-bold" id="countCompleted">0</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl opacity-30"></i>
                    </div>
                </div>
            </div>

            <!-- Search & Filter -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <!-- Search -->
                    <div class="flex-1">
                        <div class="relative">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="techSearch" 
                                   placeholder="ค้นหารหัสพัสดุ, ชื่อพัสดุ..." 
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                    
                    <!-- Status Filter -->
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="techFilter('all')" 
                                class="tech-filter tech-filter-all bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-list mr-1"></i>ทั้งหมด
                        </button>
                        <button onclick="techFilter('pending')" 
                                class="tech-filter tech-filter-pending bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-clock mr-1"></i>รอดำเนินการ
                        </button>
                        <button onclick="techFilter('in_progress')" 
                                class="tech-filter tech-filter-in_progress bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-cog mr-1"></i>กำลังซ่อม
                        </button>
                        <button onclick="techFilter('completed')" 
                                class="tech-filter tech-filter-completed bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-check-circle mr-1"></i>เสร็จสิ้น
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 🔧 เพิ่ม class tech-table-wrapper -->
    <div class="tech-table-wrapper overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ลำดับ
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        รหัสพัสดุ
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ชื่อพัสดุ
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ปัญหา
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ผู้แจ้ง
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        วันที่แจ้ง
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        สถานะ
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ความเร่งด่วน
                    </th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        การดำเนินการ
                    </th>
                </tr>
            </thead>
            <tbody id="techTableBody" class="bg-white divide-y divide-gray-200">
                <!-- Data will be inserted here -->
            </tbody>
        </table>
        
        <!-- Mobile Card View จะถูกสร้างที่นี่โดย JavaScript -->
    </div>

    <!-- Loading State -->
    <div id="techLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Empty State -->
    <div id="techEmpty" class="hidden text-center py-12">
        <i class="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
        <p class="text-gray-600 text-lg">ไม่มีรายการซ่อม</p>
    </div>

    <!-- Pagination -->
    <div id="techPagination" class="hidden bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-700">
                แสดง <span class="font-semibold" id="showingFrom">1</span> - 
                <span class="font-semibold" id="showingTo">20</span> จาก 
                <span class="font-semibold" id="showingTotal">0</span> รายการ
            </div>
            <div id="techPaginationButtons" class="flex gap-2">
                <!-- Pagination buttons will be inserted here -->
            </div>
        </div>
    </div>
</div>
        </div>
    `;
    
    // Setup event listeners
    setupTechEventListeners();
    
    // Load data
    techLoadData();
};

// ============================================
// 🔐 Helper Functions for Role Check
// ============================================

function techGetUserRole() {
    const user = window.currentUser || currentUser || {};
    return user.role || 'technician';
}

// ============================================
// 🎯 Event Listeners
// ============================================

function setupTechEventListeners() {
    const searchInput = document.getElementById('techSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            techSearchTerm = e.target.value.toLowerCase();
            techApplyFilters();
        });
    }
}

// ============================================
// 📊 Load Data
// ============================================

function techLoadData() {
    const sid = window.sessionId || sessionId;
    
    google.script.run
        .withSuccessHandler(techOnDataLoaded)
        .withFailureHandler(techOnError)
        .getRepairList(sid);
}

function techOnDataLoaded(result) {
    console.log('Data loaded:', result);
    
    if (result.status === 'success') {
        techRepairsList = result.repairs || [];
        techApplyFilters();
        techUpdateCounts();
    } else {
        techOnError(result.message);
    }
}

function techOnError(error) {
    console.error('Error:', error);
    document.getElementById('techLoading').classList.add('hidden');
    document.getElementById('techEmpty').classList.remove('hidden');
    
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'ไม่สามารถโหลดข้อมูลได้',
        confirmButtonText: 'ตกลง'
    });
}

// ============================================
// 🔍 Filter & Search
// ============================================

function techFilter(status) {
    techCurrentFilter = status;
    techCurrentPage = 1;
    
    // Update button states
    document.querySelectorAll('.tech-filter').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`.tech-filter-${status}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }
    
    techApplyFilters();
}

function techApplyFilters() {
    // Filter by status
    let filtered = techRepairsList;
    
    if (techCurrentFilter !== 'all') {
        filtered = filtered.filter(r => r.status === techCurrentFilter);
    }
    
    // Filter by search term
    if (techSearchTerm) {
        filtered = filtered.filter(r => {
            return (
                (r.equipment_number || '').toLowerCase().includes(techSearchTerm) ||
                (r.equipment_name || '').toLowerCase().includes(techSearchTerm) ||
                (r.reporter_name || '').toLowerCase().includes(techSearchTerm) ||
                (r.equipment_location || '').toLowerCase().includes(techSearchTerm)
            );
        });
    }
    
    techFilteredList = filtered;
    techTotalPages = Math.ceil(techFilteredList.length / techItemsPerPage);
    
    techRenderTable();
    techRenderPagination();
}

// ============================================
// 🎨 Render Table
// ============================================


function techRenderTable() {
    const tbody = document.getElementById('techTableBody');
    const loading = document.getElementById('techLoading');
    const empty = document.getElementById('techEmpty');
    const pagination = document.getElementById('techPagination');
    
    // 🔧 เพิ่มการเช็คว่า element มีอยู่จริง
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    // สร้าง/หา Mobile Card View container
    let mobileCardView = document.querySelector('.tech-table-wrapper .mobile-card-view');
    if (!mobileCardView) {
        mobileCardView = document.createElement('div');
        mobileCardView.className = 'mobile-card-view';
        const tableWrapper = tbody?.closest('.tech-table-wrapper');
        if (tableWrapper) {
            tableWrapper.appendChild(mobileCardView);
        }
    }
    
    if (loading) loading.classList.add('hidden');
    
    if (techFilteredList.length === 0) {
        tbody.innerHTML = '';
        if (mobileCardView) mobileCardView.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (empty) empty.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
    
    // Calculate pagination
    const startIndex = (techCurrentPage - 1) * techItemsPerPage;
    const endIndex = Math.min(startIndex + techItemsPerPage, techFilteredList.length);
    const pageData = techFilteredList.slice(startIndex, endIndex);
    
    // Sort by date (newest first)
    pageData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // ============================================
    // 1. TABLE VIEW (Desktop)
    // ============================================
    tbody.innerHTML = pageData.map((repair, index) => {
        return techCreateRow(repair, startIndex + index + 1);
    }).join('');
    
   // ============================================
    // 2. MOBILE CARD VIEW
    // ============================================
    if (mobileCardView) {
        mobileCardView.innerHTML = pageData.map(repair => {
            // กำหนดสีและไอคอนสำหรับสถานะ
            const statusConfig = {
                'pending': { 
                    bg: '#fef3c7', 
                    color: '#92400e', 
                    icon: 'fa-clock',
                    text: 'รอดำเนินการ' 
                },
                'in_progress': { 
                    bg: '#dbeafe', 
                    color: '#1e40af', 
                    icon: 'fa-tools',
                    text: 'กำลังซ่อม' 
                },
                'completed': { 
                    bg: '#dcfce7', 
                    color: '#166534', 
                    icon: 'fa-check-circle',
                    text: 'เสร็จสิ้น' 
                }
            };
            
            const status = statusConfig[repair.status] || statusConfig['pending'];
            
            // กำหนดสีและไอคอนสำหรับความเร่งด่วน
            const priorityConfig = {
                'normal': { 
                    bg: '#f3f4f6', 
                    color: '#374151', 
                    icon: 'fa-circle',
                    text: 'ปกติ' 
                },
                'medium': { 
                    bg: '#fef3c7', 
                    color: '#d97706', 
                    icon: 'fa-exclamation-circle',
                    text: 'ปานกลาง' 
                },
                'urgent': { 
                    bg: '#fee2e2', 
                    color: '#dc2626', 
                    icon: 'fa-exclamation-triangle',
                    text: 'เร่งด่วน' 
                }
            };
            
            const priority = priorityConfig[repair.priority] || priorityConfig['normal'];
            
            // ข้อความปุ่มตามสถานะ
            let actionBtnText = 'รับงาน';
            let actionBtnIcon = 'fa-hand-paper';
            let actionBtnClass = 'tech-card-btn-action';
            let actionFunction = `techStartRepair('${repair.id}')`;
            
            if (repair.status === 'in_progress') {
                actionBtnText = 'ทำเสร็จ';
                actionBtnIcon = 'fa-check';
                actionFunction = `techCompleteRepair('${repair.id}')`;
            } else if (repair.status === 'completed') {
                actionBtnText = 'เสร็จสิ้น';
                actionBtnIcon = 'fa-check-circle';
                actionBtnClass = 'tech-card-btn-view';
                actionFunction = 'return false;';
            }
            
            return `
            <div class="tech-card">
                <!-- Header: รหัสพัสดุ + สถานะ -->
                <div class="tech-card-header">
                    <div class="tech-card-code">
                        <i class="fas fa-barcode"></i>
                        <span>${repair.equipment_number || '-'}</span>
                    </div>
                    <span class="tech-card-status" 
                          style="background: ${status.bg}; color: ${status.color};">
                        <i class="fas ${status.icon}"></i>
                        ${status.text}
                    </span>
                </div>
                
                <!-- Body: ข้อมูลการแจ้งซ่อม -->
                <div class="tech-card-body">
                    <div class="tech-card-title">
                        ${repair.equipment_name || '-'}
                    </div>
                    
                    <div class="tech-card-problem">
                        ${repair.problem_description || '-'}
                    </div>
                    
                    <div class="tech-card-info">
                        <span class="tech-card-info-label">
                            <i class="fas fa-user"></i>
                            ผู้แจ้ง
                        </span>
                        <span class="tech-card-info-value">
                            ${repair.reporter_name || '-'}
                        </span>
                    </div>
                    
                    <div class="tech-card-info">
                        <span class="tech-card-info-label">
                            <i class="fas fa-calendar"></i>
                            วันที่แจ้ง
                        </span>
                        <span class="tech-card-info-value">
                            ${techFormatDate(repair.created_at)}
                        </span>
                    </div>
                    
                    <div class="tech-card-info">
                        <span class="tech-card-info-label">
                            <i class="fas fa-flag"></i>
                            ความเร่งด่วน
                        </span>
                        <span class="tech-card-priority" 
                              style="background: ${priority.bg}; color: ${priority.color};">
                            <i class="fas ${priority.icon}"></i>
                            ${priority.text}
                        </span>
                    </div>

                    ${repair.damage_type ? `
                    <div class="tech-card-info">
                        <span class="tech-card-info-label">
                            <i class="fas fa-wrench"></i>
                            ประเภทความเสียหาย
                        </span>
                        <span class="tech-card-info-value">
                            ${techGetDamageTypeBadge(repair.damage_type)}
                        </span>
                    </div>
                    ` : ''}
                    
                    ${repair.equipment_location ? `
                    <div class="tech-card-info">
                        <span class="tech-card-info-label">
                            <i class="fas fa-map-marker-alt"></i>
                            สถานที่
                        </span>
                        <span class="tech-card-info-value">
                            ${repair.equipment_location}
                        </span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Footer: ปุ่มดำเนินการ -->
                <div class="tech-card-footer">
                    <button onclick="techShowDetail('${repair.id}')" 
                            class="tech-card-btn tech-card-btn-view">
                        <i class="fas fa-eye"></i>
                        <span>ดู</span>
                    </button>
                    <button onclick="${actionFunction}" 
                            class="tech-card-btn ${actionBtnClass}"
                            ${repair.status === 'completed' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas ${actionBtnIcon}"></i>
                        <span>${actionBtnText}</span>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }
    
    // Update showing info - เช็คว่า element มีอยู่ก่อน
    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    const showingTotal = document.getElementById('showingTotal');
    
    if (showingFrom) showingFrom.textContent = startIndex + 1;
    if (showingTo) showingTo.textContent = endIndex;
    if (showingTotal) showingTotal.textContent = techFilteredList.length;
}



function techCreateRow(repair, rowNumber) {
    const statusInfo = techGetStatusInfo(repair.status);
    const priorityInfo = techGetPriorityInfo(repair.priority);
    
    return `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${rowNumber}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${repair.equipment_number}</div>
                <div class="text-xs text-gray-500 font-mono">#${repair.id.substring(0, 8)}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${repair.equipment_name || '-'}</div>
                <div class="text-xs text-gray-500">${repair.equipment_type || ''} ${repair.equipment_brand || ''}</div>
            </td>
            
            <!-- 🔴 จุดที่แก้ไข: เปลี่ยนจากแสดงสถานที่ เป็นแสดงปัญหา และเอาสถานที่ไว้ด้านล่าง -->
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 line-clamp-2" title="${repair.problem_description || '-'}">
                    ${repair.problem_description || '-'}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                    ${repair.equipment_location || '-'}
                </div>
            </td>
            <!-- 🔴 สิ้นสุดการแก้ไข -->

            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${repair.reporter_name || '-'}</div>
                <div class="text-xs text-gray-500">${repair.reporter_contact || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${techFormatDate(repair.created_at)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusInfo.class} px-3 py-1 text-xs font-semibold rounded-full">
                    ${statusInfo.icon} ${statusInfo.text}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${priorityInfo.class} px-3 py-1 text-xs font-semibold rounded-full">
                    ${priorityInfo.icon} ${priorityInfo.text}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                    ${repair.status === 'pending' ? `
                        <button onclick="techStartRepair('${repair.id}')" 
                                class="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                title="เริ่มซ่อม">
                            <i class="fas fa-play mr-1"></i>เริ่ม
                        </button>
                    ` : ''}
                    ${repair.status === 'in_progress' ? `
                        <button onclick="techCompleteRepair('${repair.id}')" 
                                class="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                                title="ซ่อมเสร็จ">
                            <i class="fas fa-check mr-1"></i>เสร็จ
                        </button>
                    ` : ''}
                    ${repair.status === 'in_progress' ? `
                        <button onclick="techRecordSpareParts('${repair.id}')" 
                                class="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition text-xs font-medium"
                                title="บันทึกอะไหล่">
                            <i class="fas fa-cog mr-1"></i>อะไหล่
                        </button>
                    ` : ''}
                    ${repair.status === 'completed' ? `
                        <button onclick="techEditCompleted('${repair.id}')" 
                                class="bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition text-xs font-medium"
                                title="แก้ไขสถานะ">
                            <i class="fas fa-edit mr-1"></i>แก้ไข
                        </button>
                        ${techGetUserRole() === 'admin' ? `
                            <button onclick="techDeleteCompleted('${repair.id}')" 
                                    class="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-xs font-medium"
                                    title="ลบสถานะ"
                                    id="deleteBtn-${repair.id}">
                                <i class="fas fa-trash mr-1"></i>ลบ
                            </button>
                        ` : ''}
                    ` : ''}
                    <button onclick="techShowDetail('${repair.id}')" 
                            class="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition text-xs font-medium"
                            title="ดูรายละเอียด">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
// ============================================
// 📄 Pagination
// ============================================

function techRenderPagination() {
    const container = document.getElementById('techPaginationButtons');
    
    // 🔧 เพิ่มการเช็คว่า element มีอยู่จริง
    if (!container) {
        console.warn('Pagination container not found');
        return;
    }
    
    const buttons = [];
    
    // Previous button
    buttons.push(`
        <button onclick="techGoToPage(${techCurrentPage - 1})" 
                ${techCurrentPage === 1 ? 'disabled' : ''}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-left"></i>
        </button>
    `);
    
    // Page numbers
    const maxButtons = 5;
    let startPage = Math.max(1, techCurrentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(techTotalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(`
            <button onclick="techGoToPage(${i})" 
                    class="px-4 py-2 text-sm font-medium ${i === techCurrentPage ? 'text-white bg-blue-600' : 'text-gray-700 bg-white hover:bg-gray-50'} border border-gray-300 rounded-lg">
                ${i}
            </button>
        `);
    }
    
    // Next button
    buttons.push(`
        <button onclick="techGoToPage(${techCurrentPage + 1})" 
                ${techCurrentPage === techTotalPages ? 'disabled' : ''}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-chevron-right"></i>
        </button>
    `);
    
    container.innerHTML = buttons.join('');
}

function techGoToPage(page) {
    if (page < 1 || page > techTotalPages) return;
    techCurrentPage = page;
    techRenderTable();
    techRenderPagination();
    
    // Scroll to top of table
    document.querySelector('table').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// 📊 Update Counts
// ============================================

function techUpdateCounts() {
    const counts = {
        all: techRepairsList.length,
        pending: techRepairsList.filter(r => r.status === 'pending').length,
        in_progress: techRepairsList.filter(r => r.status === 'in_progress').length,
        completed: techRepairsList.filter(r => r.status === 'completed').length
    };
    
    const countAllEl = document.getElementById('countAll');
    const countPendingEl = document.getElementById('countPending');
    const countInProgressEl = document.getElementById('countInProgress');
    const countCompletedEl = document.getElementById('countCompleted');
    
    if (countAllEl) countAllEl.textContent = counts.all;
    if (countPendingEl) countPendingEl.textContent = counts.pending;
    if (countInProgressEl) countInProgressEl.textContent = counts.in_progress;
    if (countCompletedEl) countCompletedEl.textContent = counts.completed;
}

// ============================================
// ✅ Helper: Get Status Info (แก้ไข: เพิ่มสถานะ retired)
// ============================================
function techGetStatusInfo(status) {
    const configs = {
        'pending': {
            text: 'รอดำเนินการ',
            icon: '<i class="fas fa-clock"></i>',
            class: 'bg-yellow-100 text-yellow-800'
        },
        'in_progress': {
            text: 'กำลังซ่อม',
            icon: '<i class="fas fa-cog fa-spin"></i>',
            class: 'bg-blue-100 text-blue-800'
        },
        'completed': {
            text: 'เสร็จสิ้น',
            icon: '<i class="fas fa-check-circle"></i>',
            class: 'bg-green-100 text-green-800'
        },
        // 🔴 เพิ่มสถานะ retired
        'retired': {
            text: 'จำหน่าย',
            icon: '<i class="fas fa-times-circle"></i>',
            class: 'bg-red-100 text-red-800'
        },
        'cancelled': {
            text: 'ยกเลิก',
            icon: '<i class="fas fa-ban"></i>',
            class: 'bg-gray-100 text-gray-800'
        }
    };
    return configs[status] || configs['pending'];
}

function techGetPriorityInfo(priority) {
    const configs = {
        'low': {
            text: 'ปกติ',
            icon: '<i class="fas fa-circle"></i>',
            class: 'bg-gray-100 text-gray-800'
        },
        'normal': {
            text: 'ปกติ',
            icon: '<i class="fas fa-circle"></i>',
            class: 'bg-gray-100 text-gray-800'
        },
        'medium': {
            text: 'ปานกลาง',
            icon: '<i class="fas fa-exclamation-circle"></i>',
            class: 'bg-orange-100 text-orange-800'
        },
        'high': {
            text: 'เร่งด่วน',
            icon: '<i class="fas fa-exclamation-triangle"></i>',
            class: 'bg-red-100 text-red-800'
        },
        'urgent': {
            text: 'เร่งด่วน',
            icon: '<i class="fas fa-exclamation-triangle"></i>',
            class: 'bg-red-100 text-red-800'
        }
    };
    return configs[priority] || configs['normal'];
}

function techGetDamageTypeBadge(damageType) {
    const damageTypeMap = {
        'hardware': { class: 'bg-purple-100 text-purple-800', icon: 'fa-microchip', text: 'Hardware (ฮาร์ดแวร์)' },
        'software': { class: 'bg-blue-100 text-blue-800', icon: 'fa-code', text: 'Software (ซอฟต์แวร์)' },
        'network': { class: 'bg-indigo-100 text-indigo-800', icon: 'fa-wifi', text: 'Network (เครือข่าย)' },
        'user_error': { class: 'bg-yellow-100 text-yellow-800', icon: 'fa-user', text: 'User Error (การใช้งาน)' },
        'maintenance': { class: 'bg-green-100 text-green-800', icon: 'fa-tools', text: 'Maintenance (บำรุงรักษา)' },
        'unknown': { class: 'bg-gray-100 text-gray-800', icon: 'fa-question-circle', text: 'Unknown (ไม่ทราบ)' }
    };
    const damageInfo = damageTypeMap[damageType] || damageTypeMap['unknown'];
    return `<span class="${damageInfo.class} px-2 py-1 text-xs font-medium rounded-full"><i class="fas ${damageInfo.icon} mr-1"></i>${damageInfo.text}</span>`;
}

function techFormatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function techRefresh() {
    techCurrentPage = 1;
    techLoadData();
}

// ============================================
// 📋 Show Detail Modal - พร้อม Loading State
// ============================================

function techShowDetail(repairId) {
    const repair = techRepairsList.find(r => r.id === repairId);
    if (!repair) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบรายการซ่อมนี้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    // ✅ 1. แสดง Loading ทันที
    Swal.fire({
        title: 'กำลังโหลดข้อมูล...',
        html: '<div class="text-center my-3"><i class="fas fa-spinner fa-spin text-blue-600 text-3xl"></i><p class="mt-2 text-gray-500 text-sm">กรุณารอสักครู่</p></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const statusInfo = techGetStatusInfo(repair.status);
    const priorityInfo = techGetPriorityInfo(repair.priority);
    const sessionId = localStorage.getItem('sessionId'); 

    // 2. ดึงข้อมูลอะไหล่
    google.script.run
        .withSuccessHandler(function(sparePartsResult) {
            const spareParts = sparePartsResult.spareParts || [];

            // 3. ดึงข้อมูลพัสดุ (เพื่อเอารูป)
            google.script.run
                .withSuccessHandler(function(equipmentResult) {
                    let equipmentImageUrl = '';
                    if (equipmentResult.status === 'success' && equipmentResult.equipment) {
                        equipmentImageUrl = equipmentResult.equipment.image_url || '';
                    }

                    // --- สร้าง HTML ตารางอะไหล่ ---
                    let sparePartsHtml = '';
                    if (spareParts.length > 0) {
                        let totalPartsCost = 0;
                        const rows = spareParts.map((part, index) => {
                            totalPartsCost += (part.total_cost || 0);
                            return `
                                <tr class="border-b border-purple-200 last:border-0 bg-white">
                                    <td class="py-2 px-3 text-sm text-gray-700">${index + 1}</td>
                                    <td class="py-2 px-3 text-sm text-gray-900 font-medium">${part.part_name}</td>
                                    <td class="py-2 px-3 text-sm text-gray-700 text-center">${part.quantity} ${part.unit}</td>
                                    <td class="py-2 px-3 text-sm text-gray-700 text-right">฿${Number(part.unit_cost).toLocaleString()}</td>
                                    <td class="py-2 px-3 text-sm text-purple-700 text-right font-bold">฿${Number(part.total_cost).toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('');

                        sparePartsHtml = `
                            <div class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                                <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                    <i class="fas fa-tools text-purple-600 mr-2"></i>
                                    รายการอะไหล่ที่ใช้
                                </h4>
                                <div class="overflow-x-auto rounded-lg border border-purple-200">
                                    <table class="w-full text-left">
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
                                                <td class="py-2 px-3 text-sm font-bold text-purple-700 text-right border-t-2 border-purple-200">฿${totalPartsCost.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        `;
                    } else {
                        if (repair.status !== 'pending') {
                            sparePartsHtml = `
                                <div class="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200 text-sm text-gray-500 italic text-center">
                                    <i class="fas fa-box-open mr-1"></i> ไม่มีการเบิกอะไหล่ในงานซ่อมนี้
                                </div>
                            `;
                        }
                    }

                    // --- สร้าง HTML หลัก ---
                    if (typeof Swal !== 'undefined') {
                        const detailHTML = `
                            <div class="text-left space-y-4 max-h-[70vh] overflow-y-auto px-2">
                                <!-- Status & Priority -->
                                <div class="flex gap-2">
                                    <span class="${statusInfo.class} px-3 py-1 text-sm font-semibold rounded-full">
                                        ${statusInfo.icon} ${statusInfo.text}
                                    </span>
                                    <span class="${priorityInfo.class} px-3 py-1 text-sm font-semibold rounded-full">
                                        ${priorityInfo.icon} ${priorityInfo.text}
                                    </span>
                                </div>

                                <!-- Equipment Info -->
                                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                                        <i class="fas fa-box text-blue-600 mr-2"></i>
                                        ข้อมูลพัสดุ
                                    </h3>
                                    <div class="grid grid-cols-2 gap-2 text-sm">
                                        <div><span class="text-gray-600">รหัส:</span> <strong>${repair.equipment_number}</strong></div>
                                        <div><span class="text-gray-600">ชื่อ:</span> ${repair.equipment_name || '-'}</div>
                                        <div><span class="text-gray-600">ประเภท:</span> ${repair.equipment_type || '-'}</div>
                                        <div><span class="text-gray-600">ยี่ห้อ/รุ่น:</span> ${repair.equipment_brand || '-'} ${repair.equipment_model || ''}</div>
                                        <div class="col-span-2"><span class="text-gray-600">สถานที่:</span> ${repair.equipment_location || '-'}</div>
                                    </div>
                                </div>

                                <!-- Problem Description -->
                                <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                                        รายละเอียดปัญหา
                                    </h3>
                                    <div class="text-sm space-y-2">
                                        <div><span class="text-gray-600">ผู้แจ้ง:</span> ${repair.reporter_name} (${repair.reporter_contact})</div>
                                        <div><span class="text-gray-600">วันที่แจ้ง:</span> ${techFormatDate(repair.created_at)}</div>
                                        ${repair.damage_type ? `<div><span class="text-gray-600">ประเภทความเสียหาย:</span> ${techGetDamageTypeBadge(repair.damage_type)}</div>` : ''}
                                        <div class="pt-2 border-t border-yellow-300">
                                            <p class="text-gray-700 whitespace-pre-wrap">${repair.problem_description}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- ตารางอะไหล่ -->
                                ${sparePartsHtml}

                                <!-- รูปภาพปัญหา (ก่อนซ่อม) -->
                                ${repair.image_url ? `
                                    <div class="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <h3 class="font-bold text-gray-800 mb-3 flex items-center">
                                            <i class="fas fa-camera text-red-600 mr-2"></i>
                                            รูปภาพปัญหา (ก่อนซ่อม)
                                        </h3>
                                        <div class="relative group text-center">
                                            <img src="${repair.image_url}" 
                                                 alt="รูปปัญหา" 
                                                 class="max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 mx-auto"
                                                 style="max-height: 250px; object-fit: contain; background: white;"
                                                 onclick="window.open('${repair.image_url}', '_blank')">
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- Technician Info -->
                                ${repair.status !== 'pending' ? `
                                    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                                            <i class="fas fa-user-cog text-green-600 mr-2"></i>
                                            ข้อมูลการซ่อม
                                        </h3>
                                        <div class="text-sm space-y-2">
                                            <div><span class="text-gray-600">ช่างผู้รับผิดชอบ:</span> <strong>${repair.technician_name || '-'}</strong></div>
                                            ${repair.repair_cost ? `<div><span class="text-gray-600">ค่าบริการรวม:</span> <strong class="text-green-700">${Number(repair.repair_cost).toLocaleString()} บาท</strong></div>` : ''}
                                            ${repair.repair_notes ? `
                                                <div class="pt-2 border-t border-green-300">
                                                    <span class="text-gray-600 block mb-1">หมายเหตุการซ่อม:</span>
                                                    <p class="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-green-200">${repair.repair_notes}</p>
                                                </div>
                                            ` : ''}
                                            ${repair.updated_at ? `<div class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i>อัพเดตล่าสุด: ${techFormatDate(repair.updated_at)}</div>` : ''}
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- รูปภาพหลังซ่อม -->
                                ${repair.repair_image_url ? `
                                    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <h3 class="font-bold text-gray-800 mb-3 flex items-center">
                                            <i class="fas fa-camera text-green-600 mr-2"></i>
                                            รูปภาพหลังซ่อม
                                        </h3>
                                        <div class="relative group text-center">
                                            <img src="${repair.repair_image_url}" 
                                                 alt="รูปหลังซ่อม" 
                                                 class="max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 mx-auto"
                                                 style="max-height: 250px; object-fit: contain; background: white;"
                                                 onclick="window.open('${repair.repair_image_url}', '_blank')">
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- รูปพัสดุ (อ้างอิง) -->
                                ${equipmentImageUrl ? `
                                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                                            <i class="fas fa-box text-blue-400 mr-2"></i>
                                            รูปครุภัณฑ์ (อ้างอิง)
                                        </h4>
                                        <div class="text-center">
                                            <img src="${equipmentImageUrl}" 
                                                 class="max-w-full h-auto rounded-lg shadow-sm cursor-pointer mx-auto"
                                                 style="max-height: 150px; opacity: 0.8;"
                                                 onclick="window.open('${equipmentImageUrl}', '_blank')">
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;

                        // ✅ 4. อัพเดท Modal เป็นข้อมูลจริง (แทนที่ Loading)
                        Swal.fire({
                            title: '<span style="font-size: 1.5rem;">รายละเอียดการซ่อม</span>',
                            html: detailHTML,
                            width: '800px',
                            showCloseButton: true,
                            confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
                            confirmButtonColor: '#6b7280',
                            customClass: {
                                popup: 'tech-detail-modal',
                                htmlContainer: 'p-0'
                            }
                        });
                    }
                })
                .withFailureHandler(function(error) {
                    Swal.close(); // ปิด Loading ถ้า Error
                    console.error('Error fetching equipment info:', error);
                    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลพัสดุได้', 'error');
                })
                .getEquipmentByNumber(repair.equipment_number);

        })
        .withFailureHandler(function(error) {
            Swal.close(); // ปิด Loading ถ้า Error
            console.error('Error fetching spare parts:', error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลอะไหล่ได้', 'error');
        })
        .getRepairSpareParts(repairId, sessionId);
}

// ============================================
// ▶️ Start Repair
// ============================================

function techStartRepair(repairId) {
    const repair = techRepairsList.find(r => r.id === repairId);
    const user = window.currentUser || currentUser || {};
    
    Swal.fire({
        title: 'เริ่มดำเนินการซ่อม?',
        html: `
            <div class="text-left">
                <p class="mb-3">คุณต้องการรับงานซ่อมนี้ใช่หรือไม่?</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-sm"><strong>รหัสพัสดุ:</strong> ${repair.equipment_number}</p>
                    <p class="text-sm"><strong>ชื่อพัสดุ:</strong> ${repair.equipment_name}</p>
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-play mr-2"></i>เริ่มเลย',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            const sid = window.sessionId || sessionId;
            
            const updateData = {
                repairId: repairId,
                status: 'in_progress',
                technicianName: user.name || 'ช่าง'
            };
            
            Swal.fire({
                title: 'กำลังบันทึก...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'รับงานสำเร็จ!',
                        text: 'เริ่มดำเนินการซ่อมแล้ว',
                        confirmButtonText: 'ตกลง'
                    }).then(() => {
                        techRefresh();
                    });
                })
                .withFailureHandler((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถรับงานได้: ' + error.message,
                        confirmButtonText: 'ตกลง'
                    });
                })
                .updateRepairByTechnician(sid, updateData);
        }
    });
}

// ============================================
// ✅ Complete Repair (แก้ไข: เพิ่มตัวเลือกจำหน่าย)
// ============================================
function techCompleteRepair(repairId) {
    const repair = techRepairsList.find(r => r.id === repairId);
    const user = window.currentUser || currentUser || {};
    const userRole = user.role || 'technician';
    
    // ✅ ตรวจสอบสิทธิ์
    if (userRole !== 'technician' && userRole !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'สิทธิ์ไม่เพียงพอ',
            text: 'คุณไม่มีสิทธิ์ในการแก้ไขสถานะนี้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    // รีเซ็ตค่ารูปภาพก่อนเปิด modal
    techCompleteImageBase64 = null;
    
    Swal.fire({
        title: '<div style="text-align: center;"><i class="fas fa-edit text-blue-600 mr-2"></i>อัปเดตสถานะการซ่อม</div>',
        html: `
            <div style="text-align: left; padding: 0 10px;">
                <div style="margin-bottom: 20px;">
                    <!-- Equipment Info -->
                    <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: flex-start;">
                            <i class="fas fa-box" style="color: #2563EB; margin-right: 12px; margin-top: 4px; font-size: 18px;"></i>
                            <div style="flex: 1;">
                                <div style="font-weight: 700; color: #1F2937; margin-bottom: 4px;">${repair.equipment_number}</div>
                                <div style="font-size: 14px; color: #4B5563;">${repair.equipment_name}</div>
                                ${repair.equipment_location ? `<div style="font-size: 13px; color: #6B7280; margin-top: 4px;"><i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${repair.equipment_location}</div>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Status Selection -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-info-circle" style="margin-right: 6px;"></i>สถานะการซ่อม
                        </label>
                        <select id="swalStatus" 
                                style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; background-color: #fff;">
                            <option value="in_progress" ${repair.status === 'in_progress' ? 'selected' : ''}>กำลังดำเนินการ (ซ่อมต่อ)</option>
                            <option value="completed" style="color: #059669; font-weight: bold;">✅ ซ่อมเสร็จสิ้น (ใช้งานได้)</option>
                            <!-- 🔴 เพิ่มตัวเลือกจำหน่าย -->
                            <option value="retired" style="color: #DC2626; font-weight: bold;">❌ จำหน่าย (ซ่อมไม่ได้/เสื่อมสภาพ)</option>
                        </select>
                    </div>

                    <!-- Damage Type -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-wrench" style="margin-right: 6px;"></i>ประเภทความเสียหาย <span style="color: #DC2626;">*</span>
                        </label>
                        <select id="swalDamageType" 
                                style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;" required>
                            <option value="">-- เลือกประเภทความเสียหาย --</option>
                            <option value="hardware" ${repair.damage_type === 'hardware' ? 'selected' : ''}>Hardware (ปัญหาฮาร์ดแวร์)</option>
                            <option value="software" ${repair.damage_type === 'software' ? 'selected' : ''}>Software (ปัญหาซอฟต์แวร์)</option>
                            <option value="network" ${repair.damage_type === 'network' ? 'selected' : ''}>Network (ปัญหาเครือข่าย)</option>
                            <option value="user_error" ${repair.damage_type === 'user_error' ? 'selected' : ''}>User Error (ปัญหาการใช้งาน)</option>
                            <option value="maintenance" ${repair.damage_type === 'maintenance' ? 'selected' : ''}>Maintenance (บำรุงรักษา)</option>
                            <option value="unknown" ${repair.damage_type === 'unknown' ? 'selected' : ''}>Unknown (ไม่ทราบสาเหตุ)</option>
                        </select>
                    </div>

                    <!-- Cost -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-dollar-sign" style="margin-right: 6px;"></i>ค่าใช้จ่าย (บาท)
                        </label>
                        <input type="number" id="swalCost" min="0" step="0.01" value="${repair.repair_cost || 0}"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                               placeholder="ระบุค่าใช้จ่าย">
                    </div>

                    <!-- Notes -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-clipboard" style="margin-right: 6px;"></i>หมายเหตุการซ่อม <span style="color: #DC2626;">*</span>
                        </label>
                        <textarea id="swalNotes" rows="4"
                                  style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; resize: vertical;"
                                  placeholder="บันทึกรายละเอียดการซ่อม, สาเหตุที่จำหน่าย หรืออะไหล่ที่เปลี่ยน">${repair.repair_notes || ''}</textarea>
                    </div>

                    <!-- Image Upload -->
                    <div style="margin-bottom: 8px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-camera" style="margin-right: 6px;"></i>รูปภาพหลังซ่อม / สภาพซาก
                        </label>
                        <div onclick="document.getElementById('techCompleteImageInput').click()" 
                             style="border: 2px dashed #D1D5DB; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s;"
                             onmouseover="this.style.borderColor='#3B82F6'" 
                             onmouseout="this.style.borderColor='#D1D5DB'">
                            <input type="file" id="techCompleteImageInput" accept="image/*" 
                                   style="display: none;" onchange="handleTechCompleteImageUpload(this)">
                            <div id="techCompleteImagePreview">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #9CA3AF; margin-bottom: 8px;"></i>
                                <p style="font-size: 14px; color: #4B5563; margin: 8px 0 4px 0;">คลิกเพื่อเลือกรูปภาพ</p>
                                <p style="font-size: 12px; color: #6B7280; margin: 0;">JPG, PNG (ไม่เกิน 5MB)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: '650px',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        preConfirm: () => {
            const status = document.getElementById('swalStatus').value;
            const damageType = document.getElementById('swalDamageType').value;
            const cost = document.getElementById('swalCost').value;
            const notes = document.getElementById('swalNotes').value.trim();
            
            if (!notes) {
                Swal.showValidationMessage('กรุณากรอกหมายเหตุการซ่อม');
                return false;
            }
            
            if (!damageType) {
                Swal.showValidationMessage('กรุณาเลือกประเภทความเสียหาย');
                return false;
            }
            
            return { 
                status, 
                damageType,
                cost, 
                notes, 
                repairImage: techCompleteImageBase64 
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const sid = window.sessionId || sessionId;
            
            // เตรียมข้อมูลส่งไป Backend
            const updateData = {
                repairId: repairId,
                status: result.value.status,
                damageType: result.value.damageType,
                technicianName: repair.technician_name || user.name || 'ช่าง',
                repairCost: result.value.cost ? parseFloat(result.value.cost) : 0,
                repairNotes: result.value.notes,
                repairImage: result.value.repairImage || null,
                spare_parts: getSpareParts() // ส่งรายการอะไหล่ไปด้วย (ถ้ามี)
            };
            
            Swal.fire({
                title: 'กำลังบันทึก...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler((response) => {
                    Swal.close();
                    
                    if (response.status === 'success') {
                        let successTitle = 'บันทึกสำเร็จ!';
                        let successText = 'อัปเดตข้อมูลเรียบร้อยแล้ว';
                        
                        if (result.value.status === 'completed') {
                            successText = 'ซ่อมเสร็จสิ้นเรียบร้อยแล้ว';
                        } else if (result.value.status === 'retired') {
                            successTitle = 'จำหน่ายพัสดุแล้ว';
                            successText = 'สถานะพัสดุถูกปรับเป็น "จำหน่าย" เรียบร้อยแล้ว';
                        }

                        Swal.fire({
                            icon: 'success',
                            title: successTitle,
                            text: successText,
                            confirmButtonText: 'ตกลง'
                        }).then(() => {
                            techRefresh();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: response.message,
                            confirmButtonText: 'ตกลง'
                        });
                    }
                })
                .withFailureHandler((error) => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: error.message,
                        confirmButtonText: 'ตกลง'
                    });
                })
                .updateRepairByTechnician(sid, updateData);
        }
    });
}

// ============================================
// 📝 Edit Completed Repair (Technician & Admin)
// ============================================

window.techEditCompleted = function(repairId) {
    console.log('🔧 Edit completed repair:', repairId);
    
    const repair = techRepairsList.find(r => r.id === repairId);
    const user = window.currentUser || currentUser || {};
    const userRole = user.role || 'technician';
    
    // ✅ ตรวจสอบสิทธิ์ - เฉพาะ technician และ admin เท่านั้น
    if (userRole !== 'technician' && userRole !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'สิทธิ์ไม่เพียงพอ',
            text: 'คุณไม่มีสิทธิ์แก้ไขสถานะนี้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    if (!repair) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบรายการซ่อม',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    // Reset image
    techEditImageBase64 = null;
    
    Swal.fire({
        title: '<div style="text-align: center;"><i class="fas fa-edit text-yellow-600 mr-2"></i>แก้ไขสถานะการซ่อม</div>',
        html: `
            <div style="text-align: left; padding: 0 10px;">
                <div style="margin-bottom: 20px;">
                    <!-- Equipment Info -->
                    <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: flex-start;">
                            <i class="fas fa-box" style="color: #2563EB; margin-right: 12px; margin-top: 4px; font-size: 18px;"></i>
                            <div style="flex: 1;">
                                <div style="font-weight: 700; color: #1F2937; margin-bottom: 4px;">${repair.equipment_number}</div>
                                <div style="font-size: 14px; color: #4B5563;">${repair.equipment_name}</div>
                                ${repair.equipment_location ? `<div style="font-size: 13px; color: #6B7280; margin-top: 4px;"><i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>${repair.equipment_location}</div>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Status -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-info-circle" style="margin-right: 6px;"></i>สถานะการซ่อม
                        </label>
                        <select id="swalEditStatus" 
                                style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
                            <option value="completed" selected>ซ่อมเสร็จสิ้น</option>
                            <option value="in_progress">กลับมาซ่อมต่อ</option>
                        </select>
                    </div>

                    <!-- Cost -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-dollar-sign" style="margin-right: 6px;"></i>ค่าใช้จ่าย (บาท)
                        </label>
                        <input type="number" id="swalEditCost" min="0" step="0.01" value="${repair.repair_cost || 0}"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                               placeholder="ระบุค่าใช้จ่าย">
                    </div>

                    <!-- Notes -->
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                            <i class="fas fa-clipboard" style="margin-right: 6px;"></i>หมายเหตุการซ่อม
                        </label>
                        <textarea id="swalEditNotes" rows="4"
                                  style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; resize: vertical;"
                                  placeholder="บันทึกรายละเอียดการซ่อม">${repair.repair_notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `,
        width: '650px',
        showCancelButton: true,
        confirmButtonColor: '#EAB308',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        customClass: {
            container: 'tech-edit-modal',
            popup: 'tech-edit-popup'
        },
        preConfirm: () => {
            const status = document.getElementById('swalEditStatus').value;
            const cost = document.getElementById('swalEditCost').value;
            const notes = document.getElementById('swalEditNotes').value.trim();
            
            if (!notes) {
                Swal.showValidationMessage('กรุณากรอกหมายเหตุการซ่อม');
                return false;
            }
            
            return { 
                status, 
                cost, 
                notes
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const sid = window.sessionId || sessionId;
            
            const updateData = {
                repairId: repairId,
                status: result.value.status,
                technicianName: repair.technician_name || user.name || 'ช่าง',
                repairCost: result.value.cost ? parseFloat(result.value.cost) : 0,
                repairNotes: result.value.notes,
                repairImage: null
            };
            
            console.log('Sending edit completed repair data:', updateData);
            
            Swal.fire({
                title: 'กำลังบันทึก...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler((response) => {
                    Swal.close();
                    
                    if (response.status === 'success') {
                        const statusText = result.value.status === 'in_progress' ? 'ยกเลิกการซ่อมเสร็จ' : 'อัปเดตสถานะ';
                        Swal.fire({
                            icon: 'success',
                            title: 'บันทึกสำเร็จ!',
                            text: statusText + 'เรียบร้อยแล้ว',
                            confirmButtonText: 'ตกลง'
                        }).then(() => {
                            techRefresh();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: response.message,
                            confirmButtonText: 'ตกลง'
                        });
                    }
                })
                .withFailureHandler((error) => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: error.message,
                        confirmButtonText: 'ตกลง'
                    });
                })
                .updateRepairByTechnician(sid, updateData);
        }
    });
}

// ============================================
// 🗑️ Delete Completed Repair (Admin Only)
// ============================================

window.techDeleteCompleted = function(repairId) {
    console.log('🗑️ Delete completed repair:', repairId);
    
    const repair = techRepairsList.find(r => r.id === repairId);
    const user = window.currentUser || currentUser || {};
    const userRole = user.role || 'technician';
    
    // ✅ ตรวจสอบสิทธิ์ - เฉพาะ admin เท่านั้น
    if (userRole !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'สิทธิ์ไม่เพียงพอ',
            text: 'เฉพาะ Admin เท่านั้นที่สามารถลบสถานะได้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    if (!repair) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบรายการซ่อม',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    // ✅ ยืนยันการลบ
    Swal.fire({
        title: '<i class="fas fa-trash text-red-600 mr-2"></i>ลบการแจ้งซ่อม?',
        html: `
            <div style="text-align: left; padding: 0 10px;">
                <p style="margin-bottom: 15px; color: #374151;">คุณกำลังจะลบข้อมูลการแจ้งซ่อมต่อไปนี้ทั้งหมด:</p>
                <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                    <strong>${repair.equipment_number}</strong><br>
                    ${repair.equipment_name}
                </div>
                <p style="color: #DC2626; font-size: 14px; margin-bottom: 10px;">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <strong>⚠️ การกระทำนี้ไม่สามารถยกเลิกได้!</strong>
                </p>
                <p style="color: #6B7280; font-size: 13px;">
                    ข้อมูลการซ่อมนี้จะถูกลบออกจากระบบอย่างถาวร
                </p>
            </div>
        `,
        width: '600px',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยืนยันการลบ',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            const sid = window.sessionId || sessionId;
            
            const deleteData = {
                repairId: repairId,
                action: 'delete_completed_status',
                adminName: user.name || 'Admin'
            };
            
            console.log('Deleting completed status:', deleteData);
            
            Swal.fire({
                title: 'กำลังลบ...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler((response) => {
                    Swal.close();
                    
                    if (response.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบเรียบร้อย!',
                            text: 'ข้อมูลการแจ้งซ่อมได้ถูกลบออกจากระบบแล้ว',
                            confirmButtonText: 'ตกลง'
                        }).then(() => {
                            techRefresh();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: response.message,
                            confirmButtonText: 'ตกลง'
                        });
                    }
                })
                .withFailureHandler((error) => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: error.message,
                        confirmButtonText: 'ตกลง'
                    });
                })
                .deleteCompletedRepair(sid, deleteData);
        }
    });
}

function handleTechCompleteImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'ประเภทไฟล์ไม่ถูกต้อง',
            text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
            confirmButtonText: 'ตกลง'
        });
        input.value = '';
        return;
    }
    
    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        Swal.fire({
            icon: 'error',
            title: 'ไฟล์ใหญ่เกินไป',
            text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
            confirmButtonText: 'ตกลง'
        });
        input.value = '';
        return;
    }
    
    // ✅ อ่านไฟล์และแปลงเป็น Base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // เก็บ base64 (ลบ prefix data:image/...;base64, ออก)
        const base64String = e.target.result.split(',')[1];
        techCompleteImageBase64 = base64String;
        
        // แสดง Preview
        const previewContainer = document.getElementById('techCompleteImagePreview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" 
                         style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <button type="button" 
                            onclick="removeTechCompleteImage()" 
                            style="position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"
                            title="ลบรูปภาพ">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        console.log('✅ Image loaded successfully, base64 length:', base64String.length);
    };
    
    reader.onerror = function(error) {
        console.error('FileReader error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอ่านไฟล์ได้',
            confirmButtonText: 'ตกลง'
        });
        techCompleteImageBase64 = null;
    };
    
    reader.readAsDataURL(file);
}

function removeTechCompleteImage() {
    techCompleteImageBase64 = null;
    
    const input = document.getElementById('techCompleteImageInput');
    if (input) {
        input.value = '';
    }
    
    const previewContainer = document.getElementById('techCompleteImagePreview');
    if (previewContainer) {
        previewContainer.innerHTML = `
            <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #9CA3AF; margin-bottom: 8px;"></i>
            <p style="font-size: 14px; color: #4B5563; margin: 8px 0 4px 0;">คลิกเพื่อเลือกรูปภาพ</p>
            <p style="font-size: 12px; color: #6B7280; margin: 0;">JPG, PNG (ไม่เกิน 5MB)</p>
        `;
    }
    
    console.log('Image removed');
}


// ============================================
// 🛠️ Helper Functions
// ============================================

function techFormatDateFull(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// Spare Parts Management
// ============================================
let spareParts = [];

function addSparePartRow() {
    const name = prompt('ชื่อรายการอะไหล่:');
    if (!name) return;
    
    const qty = prompt('จำนวน:');
    if (!qty || isNaN(qty)) return;
    
    const price = prompt('ราคา/หน่วย:');
    if (!price || isNaN(price)) return;
    
    spareParts.push({
        name: name.trim(),
        qty: parseInt(qty),
        price: parseFloat(price)
    });
    
    updateSparePartsList();
}

function removeSparePartRow(index) {
    spareParts.splice(index, 1);
    updateSparePartsList();
}

function updateSparePartsList() {
    const list = document.getElementById('sparePartsList');
    if (!list) return;
    
    list.innerHTML = spareParts.map((part, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 6px; margin-bottom: 4px; border: 1px solid #E9D5FF;">
            <div style="flex: 1;">
                <p style="font-weight: 600; color: #374151; margin: 0;">${part.name}</p>
                <p style="font-size: 12px; color: #6B7280; margin: 0;">จำนวน: ${part.qty} × ${part.price} บาท = ${(part.qty * part.price).toLocaleString()} บาท</p>
            </div>
            <button type="button" onclick="removeSparePartRow(${idx})" 
                    style="background: #EF4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                ลบ
            </button>
        </div>
    `).join('');
    
    document.getElementById('sparePartsData').value = JSON.stringify(spareParts);
}

function getSpareParts() {
    return spareParts;
}

// ============================================
// Record Spare Parts (Modified: Open Modal)
// ============================================
function techRecordSpareParts(repairId) {
    const repair = techRepairsList.find(r => r.id === repairId);
    if (!repair) {
        Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลการซ่อม', 'error');
        return;
    }
    
    // ✅ 1. ตั้งค่าตัวแปร Global เพื่อให้ไฟล์ js-spare-parts.js รู้จัก
    window.currentTechRepairId = repairId;
    
    // ตั้งค่าตัวแปรของ spare parts system
    if (typeof sparePartsData !== 'undefined') {
        sparePartsData.currentRepairId = repairId;
    } else {
        // กรณีตัวแปรยังไม่ถูกประกาศ (ป้องกัน error)
        window.sparePartsData = { currentRepairId: repairId };
    }
    
    // ✅ 2. แสดง Loading และดึงข้อมูลอะไหล่ปัจจุบัน
    Swal.fire({
        title: 'กำลังโหลดข้อมูลอะไหล่...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
    });
    
    // โหลดข้อมูลอะไหล่
    const sessionId = localStorage.getItem('sessionId');
    google.script.run
        .withSuccessHandler(function(result) {
            // ดึงข้อมูล spare parts
            const currentParts = result.spareParts || [];
            
            // ดึงข้อมูล requests (pending) - ต้องเรียกแยกหรือรวมก็ได้ แต่ในที่นี้เอา parts ก่อน
            // เพื่อความง่าย จะแสดง Modal เลย
            showTechSparePartsModalWithData(repair, currentParts);
        })
        .withFailureHandler(function(error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลอะไหล่ได้', 'error');
        })
        .getRepairSpareParts(repairId, sessionId);
}

// ============================================
// ฟังก์ชันสร้างหน้าต่าง Modal จัดการอะไหล่ (UI ใหม่)
// ============================================
function showTechSparePartsModalWithData(repair, parts) {
    // คำนวณยอดรวม
    const totalCost = parts.reduce((sum, part) => sum + (part.total_cost || 0), 0);

    // สร้าง HTML รายการอะไหล่ (Card Style)
    let partsHtml = '';
    
    if (parts.length > 0) {
        partsHtml = parts.map((part, index) => {
            // ตรวจสอบรูปภาพ
            const imageHtml = part.image_url 
                ? `<div class="relative group cursor-pointer" onclick="window.open('${part.image_url}', '_blank')">
                     <img src="${part.image_url}" class="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-200">
                     <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                   </div>`
                : `<div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400">
                     <i class="fas fa-cube text-lg"></i>
                   </div>`;

            // ตรวจสอบสถานะ (ถ้ามี)
            let statusBadge = '';
            if (part.status === 'pending') statusBadge = '<span class="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-2">รออนุมัติ</span>';
            if (part.status === 'approved') statusBadge = '<span class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-2">อนุมัติ</span>';

             return `
            <div class="flex items-center gap-3 p-3 mb-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 group">
                <!-- ส่วนรูปภาพ -->
                <div class="flex-shrink-0">
                    ${imageHtml}
                </div>

                <!-- ส่วนข้อมูล -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                        <h4 class="font-semibold text-gray-800 text-sm truncate" title="${part.part_name}">
                            ${part.part_name}
                        </h4>
                        ${statusBadge}
                    </div>
                    
                    <div class="flex items-center text-xs text-gray-500 mt-0.5 space-x-2">
                        <span class="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 border border-gray-100">
                            ${part.quantity} ${part.unit}
                        </span>
                        <span>x</span>
                        <span>฿${Number(part.unit_cost).toLocaleString()}</span>
                    </div>
                    
                    ${part.supplier ? `<div class="text-[10px] text-gray-400 mt-0.5 truncate"><i class="fas fa-truck mr-1"></i>${part.supplier}</div>` : ''}
                </div>

                <!-- ส่วนราคาและการจัดการ -->
                <div class="text-right flex flex-col items-end gap-1">
                    <div class="font-bold text-green-600 text-sm">฿${Number(part.total_cost).toLocaleString()}</div>
                    
                    <div class="flex gap-1">
                        <!-- ✅ ปุ่มแก้ไขจำนวน / คืนของ -->
                        <button onclick="adjustSparePartUsage('${part.id}', '${part.part_name}', ${part.quantity}, '${part.unit}')" 
                                class="text-xs text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors" 
                                title="ปรับจำนวน / คืนของ">
                            <i class="fas fa-edit"></i>
                        </button>

                        <button onclick="confirmDeleteSparePart('${part.id}', '${part.part_name}')" 
                                class="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" 
                                title="ลบรายการ">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } else {
        partsHtml = `
            <div class="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <i class="fas fa-box-open text-gray-300 text-2xl"></i>
                </div>
                <p class="text-gray-500 font-medium text-sm">ยังไม่มีรายการอะไหล่</p>
                <p class="text-gray-400 text-xs mt-1">กดปุ่มด้านบนเพื่อเพิ่มรายการ</p>
            </div>
        `;
    }

    Swal.fire({
        title: `
            <div class="flex items-center justify-center gap-2 text-xl font-bold text-gray-800">
                <i class="fas fa-cogs text-blue-600"></i> จัดการอะไหล่
            </div>
        `,
        html: `
            <div class="text-left font-sans">
                <!-- Header Info Card -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 mb-4 shadow-sm">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-sm">
                            ${repair.equipment_number}
                        </span>
                        <span class="text-xs text-gray-500"><i class="far fa-clock mr-1"></i>${new Date().toLocaleDateString('th-TH')}</span>
                    </div>
                    <div class="text-sm font-medium text-gray-800 line-clamp-1">${repair.equipment_name}</div>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-3 mb-5">
                    <button onclick="techShowPickFromInventory()" 
                            class="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow hover:shadow-md transition-all active:scale-95 group">
                        <div class="bg-white bg-opacity-20 rounded-full p-1 group-hover:rotate-12 transition-transform">
                            <i class="fas fa-warehouse text-xs"></i>
                        </div>
                        <span class="text-sm font-medium">ดึงจากคลัง</span>
                    </button>
                    
                    <button onclick="showRequestNewPartForm()" 
                            class="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow hover:shadow-md transition-all active:scale-95 group">
                        <div class="bg-white bg-opacity-20 rounded-full p-1 group-hover:rotate-12 transition-transform">
                            <i class="fas fa-plus text-xs"></i>
                        </div>
                        <span class="text-sm font-medium">ขอเบิกใหม่</span>
                    </button>
                </div>

                <!-- Summary Header -->
                <div class="flex justify-between items-end mb-2 px-1">
                    <span class="text-sm font-semibold text-gray-700">
                        <i class="fas fa-list-ul mr-1.5 text-gray-400"></i>รายการ (${parts.length})
                    </span>
                    <div class="text-right">
                        <span class="text-xs text-gray-500 mr-1">รวมทั้งสิ้น</span>
                        <span class="text-lg font-bold text-green-600">฿${totalCost.toLocaleString()}</span>
                    </div>
                </div>

                <!-- Scrollable List -->
                <div class="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar pb-2">
                    ${partsHtml}
                </div>
                
                <!-- Footer Note -->
                <div class="mt-3 text-center">
                    <p class="text-[10px] text-gray-400">
                        <i class="fas fa-info-circle mr-1"></i>การเปลี่ยนแปลงจะถูกบันทึกทันที
                    </p>
                </div>
            </div>
        `,
        width: '480px',
        showConfirmButton: false,
        showCloseButton: true,
        padding: '1.5rem',
        customClass: {
            popup: 'rounded-2xl',
            closeButton: 'focus:outline-none'
        }
    });
}

// ============================================
// 1. ฟังก์ชันโหลดข้อมูลและเรียก Modal
// ============================================
function techShowPickFromInventory() {
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
                window.techPartsPerPage = 10; // จำนวนรายการต่อหน้า
                
                // 2. แสดง Modal
                renderTechInventoryModal();
            } else {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลคลังได้', 'error');
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            Swal.fire('Error', error.message, 'error');
        })
        .getSparePartsInventory(sessionId);
}

function showTechPickFromInventoryModal(availableParts) {
    // เก็บข้อมูลอะไหล่ทั้งหมด
    window.techAllAvailableParts = availableParts;
    window.techFilteredParts = availableParts;
    window.techPartsPerPage = 10;
    window.techCurrentPage = 1;
    
    Swal.fire({
        title: '📦 เลือกอะไหล่จากคลัง',
        html: `
            <div style="text-align: left; max-height: 80vh; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <button type="button" onclick="techShowPickFromInventory()" 
                            style="flex: 1; padding: 10px; background: #9333EA; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">
                        <i class="fas fa-warehouse mr-2"></i>ดึงจากคลัง
                    </button>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <input type="text" id="techPartSearchInput" placeholder="🔍 ค้นหาชื่ออะไหล่..." 
                           oninput="techFilterSparePartsList()" 
                           style="width: 100%; padding: 10px 12px; border: 2px solid #E5E7EB; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>
                
                <div id="techPartsListContainer" style="flex: 1; overflow-y: auto; margin-bottom: 12px; padding-right: 8px;">
                    <!-- Parts will be rendered here -->
                </div>
                
                <div id="techPaginationContainer" style="text-align: center; margin-bottom: 12px; display: none;">
                    <div style="display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;">
                        <!-- Pagination buttons will be rendered here -->
                    </div>
                </div>
                
                <div id="techSelectedPartInfo" style="display: none; padding: 12px; background: #F0F9FF; border: 2px solid #0EA5E9; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #0369A1;">
                        <i class="fas fa-check-circle mr-2"></i><span id="techSelectedPartName"></span>
                    </p>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div>
                            <label style="display: block; font-size: 12px; color: #6B7280; margin-bottom: 4px;">จำนวน</label>
                            <input type="number" id="techSparePartQty" min="1" value="1" 
                                   style="width: 100px; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        </div>
                        <button type="button" onclick="techAddPartToCart()" 
                                style="padding: 8px 16px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; white-space: nowrap; margin-top: 20px;">
                            <i class="fas fa-plus mr-1"></i>เพิ่มในรายการ
                        </button>
                    </div>
                </div>
            </div>
        `,
        width: '550px',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ตกลง',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        didOpen: () => {
            // ✅ เรียก renderTechPartsPage ที่นี่ หลังจาก HTML ถูกสร้าง
            renderTechPartsPage();
            
            // Focus on search input
            setTimeout(() => document.getElementById('techPartSearchInput').focus(), 100);
        },
        preConfirm: () => {
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // กลับไปยัง popup ที่ 1
            if (window.currentTechRepairId) {
                const repair = techRepairsList.find(r => r.id === window.currentTechRepairId);
                if (repair) {
                    Swal.fire({
                        title: 'กำลังโหลด...',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        willOpen: () => Swal.showLoading()
                    });
                    
                    google.script.run
                        .withSuccessHandler((response) => {
                            Swal.close();
                            if (response.status === 'success') {
                                showTechSparePartsModalWithData(repair, response.parts || [], spareParts);
                            }
                        })
                        .getAvailableSpareParts(window.sessionId);
                }
            }
        }
    });
}



function techFilterSparePartsList() {
    const searchInput = document.getElementById('techPartSearchInput');
    
    if (!searchInput) return;
    
    const searchText = searchInput.value.toLowerCase().trim();
    
    if (!searchText) {
        // แสดงทั้งหมด
        window.techFilteredParts = window.techAllAvailableParts;
    } else {
        // กรองตามค้นหา
        window.techFilteredParts = window.techAllAvailableParts.filter(part => 
            part.name.toLowerCase().includes(searchText)
        );
    }
    
    // รีเซ็ตไปหน้า 1
    window.techCurrentPage = 1;
    
    // Render หน้าใหม่
    renderTechPartsPage();
}

function techGoToPage(pageNum) {
    window.techCurrentPage = pageNum;
    renderTechPartsPage();
    
    // Scroll to top ของ parts list
    const container = document.getElementById('techPartsListContainer');
    if (container) {
        container.scrollTop = 0;
    }
}

function techAddHoverEffectToPartItems() {
    const items = document.querySelectorAll('.swal2-part-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.borderColor = '#3B82F6';
            this.style.backgroundColor = '#F0F9FF';
            this.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.1)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.borderColor = '#E5E7EB';
            this.style.backgroundColor = 'white';
            this.style.boxShadow = 'none';
        });
    });
}

function selectTechSparePart(part) {
    window.selectedTechPart = part;
    const info = document.getElementById('techSelectedPartInfo');
    const nameSpan = document.getElementById('techSelectedPartName');
    
    if (info && nameSpan) {
        nameSpan.textContent = part.name + ' (฿' + part.unit_cost.toLocaleString() + '/หน่วย)';
        info.style.display = 'block';
        document.getElementById('techSparePartQty').value = '1';
        document.getElementById('techSparePartQty').focus();
    }
}

function techAddPartToCart() {
    if (!window.selectedTechPart) {
        alert('กรุณาเลือกอะไหล่');
        return;
    }
    
    const qty = parseInt(document.getElementById('techSparePartQty').value);
    
    if (!qty || qty < 1) {
        alert('กรุณาใส่จำนวนที่ถูกต้อง');
        return;
    }
    
    const part = window.selectedTechPart;
    
    // ✅ ตัดสต๊อก ทันที
    Swal.fire({
        title: 'กำลังตัดสต๊อก...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
    });
    
    google.script.run
        .withSuccessHandler((response) => {
            Swal.close();
            
            if (response.status === 'success') {
                // ✅ ตัดสต๊อกสำเร็จ → เพิ่มเข้า spareParts array
                const existingIndex = spareParts.findIndex(p => p.name === part.name);
                
                if (existingIndex >= 0) {
                    spareParts[existingIndex].qty += qty;
                } else {
                    spareParts.push({
                        name: part.name,
                        qty: qty,
                        price: part.unit_cost,
                        unit: part.unit || 'pcs',
                        image_url: part.image_url || ''
                    });
                }
                
                // แสดง success notification
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มเรียบร้อย!',
                    text: `${part.name} จำนวน ${qty} ${part.unit || 'pcs'} (ตัดสต๊อกแล้ว)`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // เปิด popup ใหม่
                    if (window.currentTechRepairId) {
                        const repair = techRepairsList.find(r => r.id === window.currentTechRepairId);
                        if (repair) {
                            Swal.fire({
                                title: 'กำลังโหลด...',
                                allowOutsideClick: false,
                                showConfirmButton: false,
                                willOpen: () => Swal.showLoading()
                            });
                            
                            google.script.run
                                .withSuccessHandler((response) => {
                                    Swal.close();
                                    if (response.status === 'success') {
                                        showTechSparePartsModalWithData(repair, response.parts || [], spareParts);
                                    }
                                })
                                .getAvailableSpareParts(window.sessionId);
                        }
                    }
                });
            } else {
                // ❌ ตัดสต๊อกล้มเหลว
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: response.message || 'ไม่สามารถตัดสต๊อกได้'
                });
            }
        })
        .withFailureHandler((error) => {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: error.message || 'เกิดข้อผิดพลาดในการตัดสต๊อก'
            });
        })
        .deductInventoryStock({
            part_name: part.name,
            quantity: qty
        }, window.sessionId);
}


function techEditSparePartRequest(idx, requestId) {
    if (idx < 0 || idx >= spareParts.length) return;
    const part = spareParts[idx];
    
    Swal.fire({
        title: '✏️ แก้ไขคำขอเบิกอะไหล่',
        html: `
            <div style="text-align: left;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">ชื่ออะไหล่</label>
                    <input type="text" value="${part.name}" disabled
                           style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; box-sizing: border-box; background: #F3F4F6; color: #9CA3AF;">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">จำนวน <span style="color: #EF4444;">*</span></label>
                    <input type="number" id="techEditQty" value="${part.qty}" min="1"
                           style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">ราคาโดยประมาณ (บาท/หน่วย)</label>
                    <input type="number" id="techEditPrice" value="${part.price}" min="0" step="0.01"
                           style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">เหตุผล</label>
                    <textarea id="techEditReason" rows="3"
                              style="width: 100%; padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; box-sizing: border-box;">${part.note || ''}</textarea>
                </div>
            </div>
        `,
        width: '500px',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-save mr-2"></i>บันทึก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        preConfirm: () => {
            const qty = document.getElementById('techEditQty').value;
            if (!qty || qty < 1) {
                Swal.showValidationMessage('กรุณาใส่จำนวนที่ถูกต้อง');
                return false;
            }
            return {
                quantity: parseInt(qty),
                estimated_cost: parseFloat(document.getElementById('techEditPrice').value) || part.price,
                reason: document.getElementById('techEditReason').value.trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const updateData = result.value;
            
            Swal.fire({
                title: 'กำลังแก้ไข...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler((response) => {
                    Swal.close();
                    if (response.status === 'success') {
                        // อัปเดต local data
                        spareParts[idx].qty = updateData.quantity;
                        spareParts[idx].price = updateData.estimated_cost;
                        spareParts[idx].note = updateData.reason;
                        
                        updateTechSparePartsList();
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'แก้ไขและบันทึกเรียบร้อย!',
                            text: 'การเปลี่ยนแปลงถูกบันทึกแล้ว',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: response.message || 'ไม่สามารถแก้ไขได้'
                        });
                    }
                })
                .withFailureHandler((error) => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'ข้อผิดพลาด',
                        text: error.message || 'เกิดข้อผิดพลาด'
                    });
                    console.error('Error:', error);
                })
                .updateSparePartRequest(requestId, updateData, window.sessionId);
        }
    });
}

function techCancelSparePartRequest(idx, requestId) {
    if (idx < 0 || idx >= spareParts.length) return;
    const part = spareParts[idx];
    
    Swal.fire({
        title: '⚠️ ยกเลิกคำขอเบิก?',
        html: `
            <p>ต้องการยกเลิกคำขอเบิก <strong>${part.name}</strong> จำนวน ${part.qty} ${part.unit || 'หน่วย'} หรือไม่?</p>
            <p style="color: #6B7280; font-size: 12px; margin-top: 12px;">หมายเหตุ: สถานะในหน้า "บันทึกอะไหล่ที่ใช้" จะเป็น "ยกเลิก" ด้วย</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยกเลิก',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ปิด'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'กำลังยกเลิก...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => Swal.showLoading()
            });
            
            google.script.run
                .withSuccessHandler((response) => {
                    Swal.close();
                    if (response.status === 'success') {
                        // ลบจาก local array
                        spareParts.splice(idx, 1);
                        updateTechSparePartsList();
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'ยกเลิกและบันทึกเรียบร้อย!',
                            text: 'ยกเลิกคำขอเบิกแล้ว',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: response.message || 'ไม่สามารถยกเลิกได้'
                        });
                    }
                })
                .withFailureHandler((error) => {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'ข้อผิดพลาด',
                        text: error.message || 'เกิดข้อผิดพลาด'
                    });
                    console.error('Error:', error);
                })
                .cancelSparePartRequest(requestId, window.sessionId);
        }
    });
}

function removeTechSparePartRow(index) {
    spareParts.splice(index, 1);
    updateTechSparePartsList();
}

function updateTechSparePartsList() {
    const list = document.getElementById('techSparePartsList');
    if (!list) {
        console.warn('⚠️ techSparePartsList element not found');
        return;
    }
    
    console.log('🔄 Updating spare parts list. Current items:', spareParts.length);
    
    if (spareParts.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #9CA3AF; padding: 12px;">ยังไม่มีรายการอะไหล่</p>';
        console.log('⚠️ No spare parts in array');
    } else {
        const html = spareParts.map((part, idx) => {
            const total = part.qty * part.price;
            const imageUrl = part.image_url || '';
            const isNewRequest = part.is_new_request;
            const requestStatus = part.status || 'pending'; // ✅ สถานะของ request
            const requestId = part.request_id || '';
            
            // ✅ สีสถานะ
            let statusColor = '#FCD34D'; // pending - yellow
            let statusIcon = '⏳';
            let statusText = 'รออนุมัติ';
            
            if (requestStatus === 'approved') {
                statusColor = '#86EFAC';
                statusIcon = '✅';
                statusText = 'อนุมัติแล้ว';
            } else if (requestStatus === 'rejected') {
                statusColor = '#FCA5A5';
                statusIcon = '❌';
                statusText = 'ไม่อนุมัติ';
            } else if (requestStatus === 'cancelled') {
                statusColor = '#D1D5DB';
                statusIcon = '✖️';
                statusText = 'ยกเลิก';
            }
            
            const canEdit = requestStatus === 'pending'; // ✅ แก้ไขได้เฉพาะ pending
            const canCancel = requestStatus === 'pending'; // ✅ ยกเลิกได้เฉพาะ pending
            
            return `
                <div style="display: flex; gap: 12px; padding: 12px; background: #F9FAFB; border-radius: 8px; margin-bottom: 8px; border: 1px solid #E5E7EB;">
                    ${imageUrl ? `
                        <img src="${imageUrl}" alt="${part.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; background: #F3F4F6;">
                    ` : `
                        <div style="width: 70px; height: 70px; background: #F3F4F6; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-box text-gray-400" style="font-size: 28px;"></i>
                        </div>
                    `}
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <p style="font-weight: 600; color: #374151; margin: 0; font-size: 13px;">${part.name}</p>
                            ${isNewRequest ? `
                                <span style="background: #FCA5A5; color: #991B1B; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                    <i class="fas fa-star mr-1"></i>ขอเบิกใหม่
                                </span>
                            ` : ''}
                            ${isNewRequest ? `
                                <span style="background: ${statusColor}; color: #1F2937; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                    ${statusIcon} ${statusText}
                                </span>
                            ` : ''}
                        </div>
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0;">
                            <i class="fas fa-tag text-blue-500 mr-1"></i>฿${part.price.toLocaleString()}/หน่วย
                        </p>
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">
                            <i class="fas fa-cube text-green-500 mr-1"></i>จำนวน: ${part.qty} ${part.unit || 'หน่วย'} = <span style="font-weight: 600;">฿${total.toLocaleString()}</span>
                        </p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${canEdit ? `
                            <button type="button" onclick="techEditSparePartRequest(${idx}, '${requestId}')" 
                                    style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; white-space: nowrap;">
                                <i class="fas fa-edit mr-1"></i>แก้ไข
                            </button>
                        ` : `
                            <button type="button" disabled
                                    style="background: #D1D5DB; color: #9CA3AF; border: none; padding: 6px 12px; border-radius: 4px; cursor: not-allowed; font-size: 12px; font-weight: 500; white-space: nowrap;">
                                <i class="fas fa-edit mr-1"></i>แก้ไข
                            </button>
                        `}
                        ${canCancel ? `
                            <button type="button" onclick="techCancelSparePartRequest(${idx}, '${requestId}')" 
                                    style="background: #EF4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; white-space: nowrap;">
                                <i class="fas fa-times mr-1"></i>ยกเลิก
                            </button>
                        ` : `
                            <button type="button" disabled
                                    style="background: #D1D5DB; color: #9CA3AF; border: none; padding: 6px 12px; border-radius: 4px; cursor: not-allowed; font-size: 12px; font-weight: 500; white-space: nowrap;">
                                <i class="fas fa-times mr-1"></i>ยกเลิก
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
        
        list.innerHTML = html;
        console.log('✅ Updated list with ' + spareParts.length + ' items');
    }
    
    // อัปเดต hidden input
    const hiddenInput = document.getElementById('techSparePartsData');
    if (hiddenInput) {
        hiddenInput.value = JSON.stringify(spareParts);
    }
}

console.log('✅ Technician Management System (Table View) Loaded!');
</script>
