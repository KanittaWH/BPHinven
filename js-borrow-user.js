<script>
// ============================================
// js-borrow-user.js - ระบบยืม-คืนพัสดุ (ผู้ใช้งาน)
// Version: 2.0 with Real-time Equipment Validation
// ============================================

let borrowList = [];
let borrowFilteredList = [];
let borrowCurrentPage = 1;
let borrowItemsPerPage = 10;
let borrowTotalPages = 0;
let borrowSearchTimeout = null;
let borrowEquipmentFound = false;

// ============================================
// Load Borrow User Page
// ============================================
window.loadBorrowUserImpl = function() {
    console.log('Loading Borrow User Page...');
    
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) {
        console.error('Content area not found!');
        return;
    }
    
    contentArea.innerHTML = `
    <div class="bg-white rounded-lg shadow-md">
        <div class="p-6 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-hand-holding text-blue-600 mr-2"></i>
                        ยืม-คืนพัสดุ
                    </h2>
                    <p class="text-gray-600 mt-1">ระบบยืมและคืนพัสดุครุภัณฑ์</p>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                    <button onclick="requestBorrowEquipment()" 
                            class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        ขอยืมพัสดุ
                    </button>
                </div>
            </div>
        </div>
        
        <div class="p-4 sm:p-6">
            <!-- Tabs -->
            <div class="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
                <button id="borrowTabPending" 
                        onclick="switchBorrowTab('pending')" 
                        class="borrow-tab px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent transition-colors">
                    <i class="fas fa-clock mr-2"></i>
                    รอการอนุมัติ
                    <span id="badgePending" class="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">0</span>
                </button>
                <button id="borrowTabBorrowed" 
                        onclick="switchBorrowTab('borrowed')" 
                        class="borrow-tab px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent transition-colors">
                    <i class="fas fa-box mr-2"></i>
                    กำลังยืม
                    <span id="badgeBorrowed" class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">0</span>
                </button>
                <button id="borrowTabReturned" 
                        onclick="switchBorrowTab('returned')" 
                        class="borrow-tab px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent transition-colors">
                    <i class="fas fa-check-circle mr-2"></i>
                    คืนแล้ว
                    <span id="badgeReturned" class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">0</span>
                </button>
                <button id="borrowTabAll" 
                        onclick="switchBorrowTab('all')" 
                        class="borrow-tab px-6 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent transition-colors">
                    <i class="fas fa-list mr-2"></i>
                    ทั้งหมด
                    <span id="badgeAll" class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">0</span>
                </button>
            </div>
            
            <!-- Search and Filter -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <input type="text" 
                           id="borrowSearchInput" 
                           placeholder="ค้นหารหัสพัสดุ, ชื่อพัสดุ..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <div class="sm:w-48">
                    <select id="borrowStatusFilter" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                        <option value="">ทุกสถานะ</option>
                        <option value="pending">รอการอนุมัติ</option>
                        <option value="borrowed">กำลังยืม</option>
                        <option value="pending_return">รอการอนุมัติคืน</option>
                        <option value="returned">คืนแล้ว</option>
                        <option value="rejected">ไม่อนุมัติ</option>
                    </select>
                </div>
            </div>
            
            <!-- Loading State -->
            <div id="borrowLoading" class="text-center py-12">
                <div class="inline-flex flex-col items-center">
                    <div class="relative">
                        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <i class="fas fa-box text-blue-500 text-2xl"></i>
                        </div>
                    </div>
                    <p class="text-gray-700 mt-4 text-lg font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            </div>

            <!-- Empty State -->
            <div id="borrowEmpty" class="hidden text-center py-12">
                <div class="text-gray-400 mb-4">
                    <i class="fas fa-inbox text-6xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                <p class="text-gray-500">คุณยังไม่มีรายการยืมพัสดุในขณะนี้</p>
            </div>

            <!-- Table (Desktop) -->
            <div class="borrow-table-wrapper bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ยืม</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กำหนดคืน</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="borrowTableBody" class="bg-white divide-y divide-gray-200">
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Card View -->
            <div class="mobile-card-view md:hidden space-y-4">
            </div>

            <!-- Pagination -->
            <div id="borrowPagination" class="hidden mt-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                <div class="text-sm text-gray-700">
                    แสดง <span id="borrowShowingStart">0</span> ถึง <span id="borrowShowingEnd">0</span> จาก <span id="borrowTotal">0</span> รายการ
                </div>
                <div class="flex gap-2">
                    <button onclick="borrowPrevPage()" id="borrowPrevBtn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-left mr-2"></i>ก่อนหน้า
                    </button>
                    <div id="borrowPageNumbers" class="flex gap-2">
                    </div>
                    <button onclick="borrowNextPage()" id="borrowNextBtn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        ถัดไป<i class="fas fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Event Listeners
    document.getElementById('borrowSearchInput')?.addEventListener('input', borrowFilterData);
    document.getElementById('borrowStatusFilter')?.addEventListener('change', borrowFilterData);
    
    // Load Data
    loadBorrowList();
    
    // Set default tab
    switchBorrowTab('pending');
};

// ============================================
// 📊 Load Borrow List
// ============================================
function loadBorrowList() {
    showLoading('borrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            console.log('Borrow list loaded:', response);
            
            if (response.status === 'success') {
                borrowList = response.borrows || [];
                updateBadges();
                borrowFilterData();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
            }
            
            // ⭐ ย้ายมาไว้นี่ - ซ่อน loading หลังจากเรนเดอร์เสร็จแล้ว
            hideLoading('borrowLoading');
        })
        .withFailureHandler(function(error) {
            console.error('Load borrow list error:', error);
            showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
            hideLoading('borrowLoading');
        })
        .getUserBorrows(getSessionId());
}

// ============================================
// 🔢 Update Badge Counts
// ============================================
function updateBadges() {
    const pending = borrowList.filter(b => b.status === 'pending' || b.status === 'approved').length;
    const borrowed = borrowList.filter(b => b.status === 'borrowed').length;
    const returned = borrowList.filter(b => b.status === 'returned').length;
    const all = borrowList.length;
    
    const badgePendingEl = document.getElementById('badgePending');
    const badgeBorrowedEl = document.getElementById('badgeBorrowed');
    const badgeReturnedEl = document.getElementById('badgeReturned');
    const badgeAllEl = document.getElementById('badgeAll');
    
    if (badgePendingEl) badgePendingEl.textContent = pending;
    if (badgeBorrowedEl) badgeBorrowedEl.textContent = borrowed;
    if (badgeReturnedEl) badgeReturnedEl.textContent = returned;
    if (badgeAllEl) badgeAllEl.textContent = all;
}

// ============================================
// 🔄 Switch Tab
// ============================================
function switchBorrowTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.borrow-tab').forEach(t => {
        t.classList.remove('border-blue-600', 'text-blue-600');
        t.classList.add('border-transparent', 'text-gray-600');
    });
    
    // Add active class to selected tab
    const activeTab = document.getElementById(`borrowTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (activeTab) {
        activeTab.classList.remove('border-transparent', 'text-gray-600');
        activeTab.classList.add('border-blue-600', 'text-blue-600');
    }
    
    borrowFilterData();
}

// ============================================
// 🔍 Filter Data
// ============================================
function borrowFilterData() {
    const searchTerm = document.getElementById('borrowSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('borrowStatusFilter')?.value || '';
    const currentTab = document.querySelector('.borrow-tab.border-blue-600')?.id || 'borrowTabPending';
    
    let filtered = [...borrowList];
    
    // Filter by tab
    if (currentTab === 'borrowTabPending') {
        filtered = filtered.filter(b => b.status === 'pending' || b.status === 'approved');
    } else if (currentTab === 'borrowTabBorrowed') {
        filtered = filtered.filter(b => b.status === 'borrowed');
    } else if (currentTab === 'borrowTabReturned') {
        filtered = filtered.filter(b => b.status === 'returned');
    }
    
    // Filter by status
    if (statusFilter) {
        filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Search
    if (searchTerm) {
        filtered = filtered.filter(b =>
            (b.equipment_number || '').toLowerCase().includes(searchTerm) ||
            (b.equipment_name || '').toLowerCase().includes(searchTerm) ||
            (b.equipment_type || '').toLowerCase().includes(searchTerm)
        );
    }
    
    borrowFilteredList = filtered;
    borrowTotalPages = Math.ceil(borrowFilteredList.length / borrowItemsPerPage);
    borrowCurrentPage = 1;
    
    renderBorrowTable();
    renderBorrowPagination();
}

// ============================================
// 🎨 Render Table
// ============================================
function renderBorrowTable() {
    const tbody = document.getElementById('borrowTableBody');
    const loading = document.getElementById('borrowLoading');
    const empty = document.getElementById('borrowEmpty');
    const pagination = document.getElementById('borrowPagination');
    
    let mobileCardView = document.querySelector('.mobile-card-view');
    
    // ⭐ ลบบรรทัดนี้ออกแล้ว - ไม่ต้องซ่อน loading ที่นี่
    // if (loading) loading.classList.add('hidden');
    
    if (borrowFilteredList.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (mobileCardView) mobileCardView.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (empty) empty.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
    
    const startIndex = (borrowCurrentPage - 1) * borrowItemsPerPage;
    const endIndex = Math.min(startIndex + borrowItemsPerPage, borrowFilteredList.length);
    const pageData = borrowFilteredList.slice(startIndex, endIndex);
    
    // Desktop Table
    if (tbody) {
        tbody.innerHTML = pageData.map(borrow => createBorrowRow(borrow)).join('');
    }
    
    // Mobile Cards
    if (mobileCardView) {
        mobileCardView.innerHTML = pageData.map(borrow => createBorrowCard(borrow)).join('');
    }
}

// ============================================
// 🎨 Create Table Row
// ============================================
function createBorrowRow(borrow) {
    const statusBadge = getBorrowStatusBadge(borrow.status);
    const borrowDate = new Date(borrow.borrow_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const returnDate = new Date(borrow.return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${borrow.equipment_number}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${borrow.equipment_name}</div>
                <div class="text-sm text-gray-500">${borrow.equipment_type}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${borrowDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${returnDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick='viewBorrowDetail(${JSON.stringify(borrow).replace(/'/g, "&apos;")})' 
                        class="text-blue-600 hover:text-blue-900 mr-3" title="ดูรายละเอียด">
                    <i class="fas fa-eye"></i>
                </button>
                ${borrow.status === 'borrowed' ? `
                <button onclick="returnBorrow('${borrow.id}')" 
                        class="text-green-600 hover:text-green-900" title="คืนพัสดุ">
                    <i class="fas fa-undo"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `;
}

// ============================================
// 🎨 Create Mobile Card
// ============================================
function createBorrowCard(borrow) {
    const statusBadge = getBorrowStatusBadge(borrow.status);
    const borrowDate = new Date(borrow.borrow_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const returnDate = new Date(borrow.return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    return `
        <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <div class="font-medium text-gray-900">${borrow.equipment_name}</div>
                    <div class="text-sm text-gray-500">${borrow.equipment_number}</div>
                </div>
                ${statusBadge}
            </div>
            
            <div class="space-y-2 text-sm mb-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">วันที่ยืม:</span>
                    <span class="font-medium">${borrowDate}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">กำหนดคืน:</span>
                    <span class="font-medium">${returnDate}</span>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button onclick='viewBorrowDetail(${JSON.stringify(borrow).replace(/'/g, "&apos;")})' 
                        class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-eye mr-2"></i>ดูรายละเอียด
                </button>
                ${borrow.status === 'borrowed' ? `
                <button onclick="returnBorrow('${borrow.id}')" 
                        class="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-undo mr-2"></i>คืนพัสดุ
                </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================
// 📄 Render Pagination
// ============================================
function renderBorrowPagination() {
    const pagination = document.getElementById('borrowPagination');
    if (!pagination || borrowFilteredList.length === 0) return;
    
    const startIndex = (borrowCurrentPage - 1) * borrowItemsPerPage;
    const endIndex = Math.min(startIndex + borrowItemsPerPage, borrowFilteredList.length);
    
    const showingStartEl = document.getElementById('borrowShowingStart');
    const showingEndEl = document.getElementById('borrowShowingEnd');
    const totalEl = document.getElementById('borrowTotal');
    
    if (showingStartEl) showingStartEl.textContent = startIndex + 1;
    if (showingEndEl) showingEndEl.textContent = endIndex;
    if (totalEl) totalEl.textContent = borrowFilteredList.length;
    
    const prevBtn = document.getElementById('borrowPrevBtn');
    const nextBtn = document.getElementById('borrowNextBtn');
    
    if (prevBtn) prevBtn.disabled = borrowCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = borrowCurrentPage === borrowTotalPages;
    
    // Page numbers
    const pageNumbers = document.getElementById('borrowPageNumbers');
    if (pageNumbers) {
        let pages = '';
        for (let i = 1; i <= borrowTotalPages; i++) {
            if (i === borrowCurrentPage) {
                pages += `<button class="px-4 py-2 bg-blue-600 text-white rounded-lg">${i}</button>`;
            } else if (i === 1 || i === borrowTotalPages || (i >= borrowCurrentPage - 1 && i <= borrowCurrentPage + 1)) {
                pages += `<button onclick="borrowGoToPage(${i})" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">${i}</button>`;
            } else if (i === borrowCurrentPage - 2 || i === borrowCurrentPage + 2) {
                pages += `<span class="px-2">...</span>`;
            }
        }
        pageNumbers.innerHTML = pages;
    }
}

function borrowPrevPage() {
    if (borrowCurrentPage > 1) {
        borrowCurrentPage--;
        renderBorrowTable();
        renderBorrowPagination();
    }
}

function borrowNextPage() {
    if (borrowCurrentPage < borrowTotalPages) {
        borrowCurrentPage++;
        renderBorrowTable();
        renderBorrowPagination();
    }
}

function borrowGoToPage(page) {
    borrowCurrentPage = page;
    renderBorrowTable();
    renderBorrowPagination();
}

// ============================================
// Get Borrow Status Badge
// ============================================
function getBorrowStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><i class="fas fa-clock mr-1"></i>รอการอนุมัติ</span>',
        'borrowed': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><i class="fas fa-box mr-1"></i>กำลังยืม</span>',
        'pending_return': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"><i class="fas fa-clock mr-1"></i>รอการอนุมัติคืน</span>',
        'returned': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"><i class="fas fa-check-circle mr-1"></i>คืนแล้ว</span>',
        'rejected': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1"></i>ไม่อนุมัติ</span>'
    };
    return badges[status] || badges['pending'];
}

// ============================================
// 📋 Request Borrow Equipment (พร้อมตรวจสอบแบบเรียลไทม์)
// ============================================
function requestBorrowEquipment() {
    if (!validateCurrentSession()) return;
    
    borrowEquipmentFound = false;
    
    Swal.fire({
        title: '<i class="fas fa-hand-holding text-blue-600 mr-2"></i>ขอยืมพัสดุ',
        html: `
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-barcode mr-1"></i>
                        รหัสพัสดุ * <span class="text-xs text-gray-500">(ระบบจะตรวจสอบอัตโนมัติ)</span>
                    </label>
                    <div class="flex gap-2">
                        <input type="text" 
                               id="borrowEquipmentNumber" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                               placeholder="ระบุรหัสพัสดุ">
                        <button type="button" 
                                onclick="scanQRForBorrow()" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-qrcode"></i>
                        </button>
                    </div>
                    <!-- สถานะการตรวจสอบพัสดุ -->
                    <div id="borrowEquipmentStatus" class="mt-2"></div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-calendar-alt mr-1"></i>
                        วันที่ยืม *
                    </label>
                    <input type="date" 
                           id="borrowDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-calendar-check mr-1"></i>
                        กำหนดคืน *
                    </label>
                    <input type="date" 
                           id="returnDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-phone mr-1"></i>
                        เบอร์ติดต่อ *
                    </label>
                    <input type="tel" 
                           id="borrowerContact" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                           placeholder="เช่น 081-234-5678">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-building mr-1"></i>
                        แผนก/หน่วยงาน
                    </label>
                    <input type="text" 
                           id="borrowerDepartment" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                           placeholder="ระบุแผนกหรือหน่วยงาน">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-comment-dots mr-1"></i>
                        วัตถุประสงค์การยืม *
                    </label>
                    <textarea id="borrowPurpose" 
                              rows="3" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                              placeholder="ระบุวัตถุประสงค์ในการยืมพัสดุ"></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้ยืม *</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg">
                        <canvas id="signaturePad" width="520" height="200" class="cursor-crosshair"></canvas>
                    </div>
                    <div class="flex gap-2 mt-2">
                        <button type="button" onclick="clearSignature()" 
                                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <i class="fas fa-eraser mr-1"></i> ล้างลายเซ็น
                        </button>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยืนยันการยืม',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        confirmButtonColor: '#10b981',
        width: '650px',
        didOpen: () => {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            document.getElementById('borrowDate').valueAsDate = today;
            document.getElementById('returnDate').valueAsDate = nextWeek;
            
            initSignaturePad();
            
            // เพิ่ม Event Listener สำหรับตรวจสอบพัสดุ
            const equipmentNumberInput = document.getElementById('borrowEquipmentNumber');
            if (equipmentNumberInput) {
                updateBorrowEquipmentStatus('empty');
                
                equipmentNumberInput.addEventListener('input', function(e) {
                    const value = e.target.value.trim();
                    
                    if (borrowSearchTimeout) {
                        clearTimeout(borrowSearchTimeout);
                    }
                    
                    borrowEquipmentFound = false;
                    
                    if (!value) {
                        updateBorrowEquipmentStatus('empty');
                        return;
                    }
                    
                    updateBorrowEquipmentStatus('checking');
                    
                    borrowSearchTimeout = setTimeout(() => {
                        validateBorrowEquipment(value);
                    }, 800);
                });
            }
        },
        preConfirm: () => {
            const equipmentNumber = document.getElementById('borrowEquipmentNumber').value.trim();
            const borrowDate = document.getElementById('borrowDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const contact = document.getElementById('borrowerContact').value.trim();
            const department = document.getElementById('borrowerDepartment').value.trim();
            const purpose = document.getElementById('borrowPurpose').value.trim();
            const signature = window.signaturePad ? window.signaturePad.toDataURL() : '';
            
            if (!equipmentNumber) {
                Swal.showValidationMessage('กรุณาระบุรหัสพัสดุ');
                return false;
            }
            
            if (!borrowEquipmentFound) {
                Swal.showValidationMessage('กรุณาตรวจสอบรหัสพัสดุให้ถูกต้อง');
                return false;
            }
            
            if (!borrowDate || !returnDate) {
                Swal.showValidationMessage('กรุณาระบุวันที่ยืมและวันที่คืน');
                return false;
            }
            
            if (new Date(returnDate) <= new Date(borrowDate)) {
                Swal.showValidationMessage('วันที่คืนต้องมากกว่าวันที่ยืม');
                return false;
            }
            
            if (!contact) {
                Swal.showValidationMessage('กรุณาระบุเบอร์ติดต่อ');
                return false;
            }
            
            if (!purpose) {
                Swal.showValidationMessage('กรุณาระบุวัตถุประสงค์การยืม');
                return false;
            }
            
            if (window.signaturePad && window.signaturePad.isEmpty()) {
                Swal.showValidationMessage('กรุณาเซ็นชื่อยืนยัน');
                return false;
            }
            
            return {
                equipmentNumber: equipmentNumber,
                borrowDate: borrowDate,
                returnDate: returnDate,
                contact: contact,
                department: department,
                purpose: purpose,
                signature: signature
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            submitBorrowRequest(result.value);
        }
    });
}

// ============================================
// 🔍 Validate Borrow Equipment
// ============================================
function validateBorrowEquipment(equipmentNumber) {
    if (!equipmentNumber) {
        updateBorrowEquipmentStatus('empty');
        borrowEquipmentFound = false;
        return;
    }
    
    updateBorrowEquipmentStatus('searching');
    
    google.script.run
        .withSuccessHandler(function(result) {
            onBorrowEquipmentValidated(result);
        })
        .withFailureHandler(function(error) {
            console.error('Validate equipment error:', error);
            updateBorrowEquipmentStatus('error');
            borrowEquipmentFound = false;
        })
        .validateEquipmentForBorrow(equipmentNumber);
}

function onBorrowEquipmentValidated(result) {
    const statusDiv = document.getElementById('borrowEquipmentStatus');
    if (!statusDiv) return;
    
    if (result.status === 'error') {
        borrowEquipmentFound = false;
        
        if (result.error_type === 'not_active') {
            updateBorrowEquipmentStatus('not_active');
        } else if (result.error_type === 'already_borrowed') {
            updateBorrowEquipmentStatus('already_borrowed');
        } else {
            updateBorrowEquipmentStatus('not_found');
        }
        return;
    }
    
    if (result.status === 'success' && result.equipment) {
        borrowEquipmentFound = true;
        const eq = result.equipment;
        
        statusDiv.innerHTML = `
            <div class="flex items-start text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                <i class="fas fa-check-circle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                <div class="flex-1">
                    <div class="font-medium text-sm mb-1">✓ พบพัสดุในระบบ</div>
                    <div class="bg-white rounded-lg p-3 mt-2 border border-green-200">
                        <div class="flex items-center gap-3">
                            ${eq.image_url ? `
                            <img src="${eq.image_url}" 
                                 alt="${eq.name}" 
                                 class="w-16 h-16 object-cover rounded-lg border"
                                 onerror="this.style.display='none'">
                            ` : ''}
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">${eq.name}</div>
                                <div class="text-xs text-gray-600 mt-1">
                                    <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">ใช้งานปกติ</span>
                                    ${eq.type ? `<span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">${eq.type}</span>` : ''}
                                </div>
                                ${eq.location ? `<div class="text-xs text-gray-600 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${eq.location}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateBorrowEquipmentStatus(status) {
    const statusDiv = document.getElementById('borrowEquipmentStatus');
    if (!statusDiv) return;
    
    switch (status) {
        case 'empty':
            statusDiv.innerHTML = '';
            break;
            
        case 'checking':
            statusDiv.innerHTML = `
                <div class="flex items-center text-gray-500">
                    <i class="fas fa-keyboard mr-2"></i>
                    <span class="text-xs">กรุณากรอกรหัสพัสดุเพื่อตรวจสอบ...</span>
                </div>
            `;
            break;
            
        case 'searching':
            statusDiv.innerHTML = `
                <div class="flex items-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <i class="fas fa-spinner fa-spin mr-3"></i>
                    <span class="text-sm">กำลังตรวจสอบพัสดุ...</span>
                </div>
            `;
            break;
            
        case 'not_found':
            statusDiv.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <i class="fas fa-times-circle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm mb-1">ไม่พบพัสดุในระบบ</div>
                        <div class="text-xs text-gray-600">กรุณาตรวจสอบรหัสพัสดุอีกครั้ง</div>
                    </div>
                </div>
            `;
            break;
            
        case 'not_active':
            statusDiv.innerHTML = `
                <div class="flex items-start text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <i class="fas fa-exclamation-triangle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm mb-1">ไม่สามารถยืมพัสดุนี้ได้</div>
                        <div class="text-xs text-gray-600">พัสดุนี้ไม่ได้อยู่ในสถานะ "ใช้งานปกติ"</div>
                    </div>
                </div>
            `;
            break;
            
        case 'already_borrowed':
            statusDiv.innerHTML = `
                <div class="flex items-start text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <i class="fas fa-exclamation-circle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm mb-1">พัสดุกำลังถูกยืมอยู่</div>
                        <div class="text-xs text-gray-600">พัสดุนี้มีผู้ยืมอยู่แล้ว หรืออยู่ระหว่างรออนุมัติ</div>
                    </div>
                </div>
            `;
            break;
            
        case 'error':
            statusDiv.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <i class="fas fa-exclamation-circle mr-3 mt-1 flex-shrink-0 text-xl"></i>
                    <div class="flex-1">
                        <div class="font-medium text-sm mb-1">เกิดข้อผิดพลาด</div>
                        <div class="text-xs text-gray-600">ไม่สามารถตรวจสอบพัสดุได้ กรุณาลองใหม่</div>
                    </div>
                </div>
            `;
            break;
    }
}

// ============================================
// 📷 Scan QR for Borrow
// ============================================
function scanQRForBorrow() {
    Swal.fire({
        title: 'สแกน QR Code',
        html: '<div id="qr-reader" style="width: 100%;"></div>',
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'ปิด',
        didOpen: () => {
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    document.getElementById('borrowEquipmentNumber').value = decodedText;
                    
                    // Trigger validation
                    const event = new Event('input', { bubbles: true });
                    document.getElementById('borrowEquipmentNumber').dispatchEvent(event);
                    
                    html5QrCode.stop();
                    Swal.close();
                    showNotification('สแกน QR Code สำเร็จ', 'success');
                }
            ).catch(err => {
                console.error('QR Scanner error:', err);
                Swal.showValidationMessage('ไม่สามารถเปิดกล้องได้');
            });
        },
        willClose: () => {
            try {
                const html5QrCode = new Html5Qrcode("qr-reader");
                html5QrCode.stop().catch(() => {});
            } catch (e) {}
        }
    });
}

// ============================================
// ✍️ Initialize Signature Pad
// ============================================
function initSignaturePad() {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = (e.clientX || e.touches[0].clientX) - rect.left;
        lastY = (e.clientY || e.touches[0].clientY) - rect.top;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const currentX = (e.clientX || e.touches[0].clientX) - rect.left;
        const currentY = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    window.signaturePad = {
        isEmpty: function() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return !imageData.data.some(channel => channel !== 0);
        },
        clear: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        toDataURL: function() {
            return canvas.toDataURL('image/png');
        }
    };
}

function clearSignature() {
    if (window.signaturePad) {
        window.signaturePad.clear();
    }
}

// ============================================
// ✅ Submit Borrow Request
// ============================================
function submitBorrowRequest(data) {
    showLoading('borrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            hideLoading('borrowLoading');
            
            if (response.status === 'success') {
                showNotification('ส่งคำขอยืมพัสดุเรียบร้อย รอการอนุมัติ', 'success');
                loadBorrowList();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
            }
        })
        .withFailureHandler(function(error) {
            hideLoading('borrowLoading');
            showNotification('เกิดข้อผิดพลาดในการส่งคำขอ', 'error');
        })
        .createBorrowRequest(data, getSessionId());
}

// ============================================
// 🔄 Return Borrow (คืนพัสดุพร้อมลายเซ็นผู้คืน)
// ============================================
function returnBorrow(borrowId) {
    const borrow = borrowList.find(b => b.id === borrowId);
    if (!borrow) {
        showNotification('ไม่พบข้อมูลการยืม', 'error');
        return;
    }
    
    Swal.fire({
        title: '<i class="fas fa-undo text-blue-600 mr-2"></i>คืนพัสดุครุภัณฑ์',
        html: `
            <div class="text-left space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="text-sm">
                        <div class="font-medium text-gray-900">${borrow.equipment_name}</div>
                        <div class="text-gray-600">${borrow.equipment_number} | ${borrow.equipment_type}</div>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-star mr-1"></i>
                        สภาพหลังใช้งาน *
                    </label>
                    <select id="conditionAfter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                        <option value="good">ปกติ - ใช้งานได้ดี</option>
                        <option value="fair">พอใช้ - มีรอยขีดข่วนเล็กน้อย</option>
                        <option value="poor">ชำรุด - ต้องซ่อม</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-comment mr-1"></i>
                        หมายเหตุ (ถ้ามี)
                    </label>
                    <textarea id="returnNotes" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                              rows="2" 
                              placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้คืน *</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg">
                        <canvas id="returnerSignaturePad" width="520" height="200" class="cursor-crosshair"></canvas>
                    </div>
                    <div class="flex gap-2 mt-2">
                        <button type="button" onclick="clearReturnerSignature()" 
                                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <i class="fas fa-eraser mr-1"></i> ล้างลายเซ็น
                        </button>
                    </div>
                </div>
                
                <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <i class="fas fa-info-circle mr-1"></i>
                    ส่งคำขอคืนพัสดุ รอการอนุมัติจากเจ้าหน้าที่
                </p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-paper-plane mr-2"></i>ส่งคำขอคืน',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        confirmButtonColor: '#3b82f6',
        width: '650px',
        didOpen: () => {
            initReturnerSignaturePad();
        },
        preConfirm: () => {
            const conditionAfter = document.getElementById('conditionAfter').value;
            const notes = document.getElementById('returnNotes').value;
            
            if (window.returnerSignaturePad && window.returnerSignaturePad.isEmpty()) {
                Swal.showValidationMessage('กรุณาเซ็นชื่อยืนยัน');
                return false;
            }
            
            return {
                borrowId: borrowId,
                conditionAfter: conditionAfter,
                notes: notes,
                signature: window.returnerSignaturePad ? window.returnerSignaturePad.toDataURL() : ''
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            submitReturnBorrow(result.value);
        }
    });
}

// ============================================
// ✍️ Initialize Returner Signature Pad
// ============================================
function initReturnerSignaturePad() {
    const canvas = document.getElementById('returnerSignaturePad');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = (e.clientX || e.touches[0].clientX) - rect.left;
        lastY = (e.clientY || e.touches[0].clientY) - rect.top;
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const currentX = (e.clientX || e.touches[0].clientX) - rect.left;
        const currentY = (e.clientY || e.touches[0].clientY) - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    window.returnerSignaturePad = {
        isEmpty: function() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return !imageData.data.some(channel => channel !== 0);
        },
        clear: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        toDataURL: function() {
            return canvas.toDataURL('image/png');
        }
    };
}

function clearReturnerSignature() {
    if (window.returnerSignaturePad) {
        window.returnerSignaturePad.clear();
    }
}

// ============================================
// ✅ Submit Return Borrow
// ============================================
function submitReturnBorrow(data) {
    showLoading('borrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            hideLoading('borrowLoading');
            
            if (response.status === 'success') {
                showNotification('ส่งคำขอคืนพัสดุเรียบร้อย รอการอนุมัติ', 'success');
                loadBorrowList();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
            }
        })
        .withFailureHandler(function(error) {
            hideLoading('borrowLoading');
            console.error('Return borrow error:', error);
            showNotification('เกิดข้อผิดพลาดในการส่งคำขอคืน', 'error');
        })
        .returnBorrow(data, getSessionId());
}

// ============================================
// 👁️ View Borrow Detail (แสดงลายเซ็นผู้อนุมัติ)
// ============================================
function viewBorrowDetail(borrow) {
      console.log('View borrow detail:', borrow); // Debug log
    
    const statusBadge = getBorrowStatusBadge(borrow.status);
    const borrowDate = new Date(borrow.borrow_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const returnDate = new Date(borrow.return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const actualReturnDate = borrow.actual_return_date ? new Date(borrow.actual_return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    
    // สร้าง HTML สำหรับลายเซ็น (ขึ้นอยู่กับสถานะ)
    let signaturesHTML = '';
    
    // ✅ ถ้าสถานะ "รอการอนุมัติคืน" (pending_return) - แสดงเฉพาะลายเซ็นผู้คืน
    if (borrow.status === 'pending_return') {
        // แสดงเฉพาะลายเซ็นผู้คืน
        if (borrow.returner_signature_url) {
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-signature text-purple-600 mr-2"></i>ลายเซ็นผู้คืน
                    </h4>
                    <div class="bg-white border rounded-lg p-3">
                        <img src="${borrow.returner_signature_url}" 
                             alt="ลายเซ็นผู้คืน" 
                             class="max-h-40 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                    </div>
                </div>
            `;
        }
    }
    // ✅ ถ้าสถานะ "คืนแล้ว" (returned) - แสดงลายเซ็นที่เกี่ยวกับการคืน
    else if (borrow.status === 'returned') {
        // 1. ลายเซ็นผู้คืน
        if (borrow.returner_signature_url) {
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-signature text-purple-600 mr-2"></i>ลายเซ็นผู้คืน
                    </h4>
                    <div class="bg-white border rounded-lg p-3">
                        <img src="${borrow.returner_signature_url}" 
                             alt="ลายเซ็นผู้คืน" 
                             class="max-h-40 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                    </div>
                </div>
            `;
        }
        
        // 2. ลายเซ็นผู้อนุมัติการคืน (แสดงชื่อในหัวข้อ)
        if (borrow.return_approved_by || borrow.return_approver_signature_url) {
            const approverName = borrow.return_approved_by ? ` (${borrow.return_approved_by})` : '';
            
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-user-check text-indigo-600 mr-2"></i>ข้อมูลการอนุมัติการคืน
                    </h4>
                    <div class="space-y-2 text-sm bg-indigo-50 p-3 rounded-lg">
                        ${borrow.return_approved_by ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">ผู้อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${borrow.return_approved_by}</span>
                        </div>
                        ` : ''}
                        ${borrow.return_approved_at ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">วันที่อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${new Date(borrow.return_approved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${borrow.return_approver_signature_url ? `
                    <div class="mt-3">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">ลายเซ็นผู้อนุมัติการคืน${approverName}</h5>
                        <div class="bg-white border rounded-lg p-3">
                            <img src="${borrow.return_approver_signature_url}" 
                                 alt="ลายเซ็นผู้อนุมัติการคืน" 
                                 class="max-h-32 mx-auto"
                                 onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        // ❌ สถานะอื่นๆ - แสดงลายเซ็นทั้งหมด
        
        // 1. ลายเซ็นผู้ยืม
        if (borrow.signature_url) {
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-signature text-blue-600 mr-2"></i>ลายเซ็นผู้ยืม
                    </h4>
                    <div class="bg-white border rounded-lg p-3">
                        <img src="${borrow.signature_url}" 
                             alt="ลายเซ็นผู้ยืม" 
                             class="max-h-40 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                    </div>
                </div>
            `;
        }
        
        // 2. ลายเซ็นผู้อนุมัติการยืม (แสดงชื่อในหัวข้อ)
        if (borrow.approved_by || borrow.approver_signature_url) {
            const approverName = borrow.approved_by ? ` (${borrow.approved_by})` : '';
            
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-user-check text-green-600 mr-2"></i>ข้อมูลการอนุมัติการยืม
                    </h4>
                    <div class="space-y-2 text-sm bg-green-50 p-3 rounded-lg">
                        ${borrow.approved_by ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">ผู้อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${borrow.approved_by}</span>
                        </div>
                        ` : ''}
                        ${borrow.approved_at ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">วันที่อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${new Date(borrow.approved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${borrow.approver_signature_url ? `
                    <div class="mt-3">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">ลายเซ็นผู้อนุมัติการยืม${approverName}</h5>
                        <div class="bg-white border rounded-lg p-3">
                            <img src="${borrow.approver_signature_url}" 
                                 alt="ลายเซ็นผู้อนุมัติการยืม" 
                                 class="max-h-32 mx-auto"
                                 onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // 3. ลายเซ็นผู้คืน
        if (borrow.returner_signature_url) {
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-signature text-purple-600 mr-2"></i>ลายเซ็นผู้คืน
                    </h4>
                    <div class="bg-white border rounded-lg p-3">
                        <img src="${borrow.returner_signature_url}" 
                             alt="ลายเซ็นผู้คืน" 
                             class="max-h-40 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                    </div>
                </div>
            `;
        }
        
        // 4. ลายเซ็นผู้อนุมัติการคืน (แสดงชื่อในหัวข้อ)
        if (borrow.return_approved_by || borrow.return_approver_signature_url) {
            const returnApproverName = borrow.return_approved_by ? ` (${borrow.return_approved_by})` : '';
            
            signaturesHTML += `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-user-check text-indigo-600 mr-2"></i>ข้อมูลการอนุมัติการคืน
                    </h4>
                    <div class="space-y-2 text-sm bg-indigo-50 p-3 rounded-lg">
                        ${borrow.return_approved_by ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">ผู้อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${borrow.return_approved_by}</span>
                        </div>
                        ` : ''}
                        ${borrow.return_approved_at ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">วันที่อนุมัติ:</span>
                            <span class="font-medium text-gray-900">${new Date(borrow.return_approved_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${borrow.return_approver_signature_url ? `
                    <div class="mt-3">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">ลายเซ็นผู้อนุมัติการคืน${returnApproverName}</h5>
                        <div class="bg-white border rounded-lg p-3">
                            <img src="${borrow.return_approver_signature_url}" 
                                 alt="ลายเซ็นผู้อนุมัติการคืน" 
                                 class="max-h-32 mx-auto"
                                 onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-red-500 text-center py-4\\'>ไม่สามารถโหลดลายเซ็นได้</p>'">
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
    }
    
    Swal.fire({
        title: '<i class="fas fa-info-circle text-blue-600 mr-2"></i>รายละเอียดการยืมพัสดุ',
        html: `
            <div class="text-left space-y-4">
                <!-- สถานะ -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">สถานะ:</span>
                        ${statusBadge}
                    </div>
                </div>
                
                <!-- รูปภาพพัสดุ -->
                ${borrow.equipment_image_url ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-image text-blue-600 mr-2"></i>รูปภาพพัสดุ
                    </h4>
                    <img src="${borrow.equipment_image_url}" 
                         alt="${borrow.equipment_name}" 
                         class="w-full rounded-lg border"
                         onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-gray-500 text-center py-4\\'>ไม่สามารถโหลดรูปภาพได้</p>'">
                </div>
                ` : ''}
                
                <!-- รายละเอียดพัสดุ -->
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-box text-purple-600 mr-2"></i>รายละเอียดพัสดุ
                    </h4>
                    <div class="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <div class="flex justify-between">
                            <span class="text-gray-600">ชื่อพัสดุ:</span>
                            <span class="font-medium text-gray-900">${borrow.equipment_name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">รหัส:</span>
                            <span class="font-medium text-gray-900">${borrow.equipment_number}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">ประเภท:</span>
                            <span class="font-medium text-gray-900">${borrow.equipment_type}</span>
                        </div>
                    </div>
                </div>
                
                <!-- ข้อมูลการยืม -->
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-user text-blue-600 mr-2"></i>ข้อมูลการยืม
                    </h4>
                    <div class="space-y-2 text-sm bg-blue-50 p-3 rounded-lg">
                        <div class="flex justify-between">
                            <span class="text-gray-600">ผู้ยืม:</span>
                            <span class="font-medium text-gray-900">${borrow.borrower_name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">ติดต่อ:</span>
                            <span class="font-medium text-gray-900">${borrow.borrower_contact}</span>
                        </div>
                        ${borrow.borrower_department ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">แผนก/หน่วยงาน:</span>
                            <span class="font-medium text-gray-900">${borrow.borrower_department}</span>
                        </div>
                        ` : ''}
                        <div class="flex justify-between">
                            <span class="text-gray-600">วันที่ยืม:</span>
                            <span class="font-medium text-gray-900">${borrowDate}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">กำหนดคืน:</span>
                            <span class="font-medium text-gray-900">${returnDate}</span>
                        </div>
                        ${borrow.actual_return_date ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">วันที่คืนจริง:</span>
                            <span class="font-medium text-gray-900">${actualReturnDate}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- วัตถุประสงค์ (ไม่แสดงเมื่อคืนแล้ว) -->
                ${borrow.status !== 'returned' ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-comment-dots text-green-600 mr-2"></i>วัตถุประสงค์การยืม
                    </h4>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">${borrow.purpose || '-'}</p>
                </div>
                ` : ''}
                
                <!-- สภาพหลังใช้งาน (แสดงเมื่อรอการอนุมัติคืนหรือคืนแล้ว) -->
                ${(borrow.status === 'pending_return' || borrow.status === 'returned') && borrow.condition_after ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-star text-yellow-600 mr-2"></i>สภาพหลังใช้งาน
                    </h4>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        ${borrow.condition_after === 'good' ? '✅ ปกติ - ใช้งานได้ดี' : 
                          borrow.condition_after === 'fair' ? '⚠️ พอใช้ - มีรอยขีดข่วนเล็กน้อย' : 
                          borrow.condition_after === 'poor' ? '❌ ชำรุด - ต้องซ่อม' : borrow.condition_after}
                    </p>
                </div>
                ` : ''}
                
                <!-- ลายเซ็นทั้งหมด -->
                ${signaturesHTML}
                
                <!-- หมายเหตุ (ไม่แสดงเมื่อคืนแล้ว) -->
                ${borrow.notes && borrow.status !== 'returned' ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-sticky-note text-yellow-600 mr-2"></i>หมายเหตุ
                    </h4>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">${borrow.notes}</p>
                </div>
                ` : ''}
                
                <!-- หมายเหตุการคืน (แสดงเมื่อรอการอนุมัติคืนหรือคืนแล้ว) -->
                ${(borrow.status === 'pending_return' || borrow.status === 'returned') && borrow.return_notes ? `
                <div class="border-t pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-sticky-note text-orange-600 mr-2"></i>หมายเหตุการคืน
                    </h4>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">${borrow.return_notes}</p>
                </div>
                ` : ''}
            </div>
        `,
        width: '700px',
        confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
        confirmButtonColor: '#6b7280',
        customClass: {
            popup: 'swal-wide'
        }
    });
}

// ============================================
// Helper Functions
// ============================================
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.classList.remove('hidden');
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.classList.add('hidden');
}

function getSessionId() {
    return localStorage.getItem('sessionId') || '';
}

function validateCurrentSession() {
    const sessionId = getSessionId();
    if (!sessionId) {
        showNotification('กรุณาเข้าสู่ระบบใหม่', 'error');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        return false;
    }
    return true;
}

console.log('✓ js-borrow-user.js loaded successfully');
</script>
