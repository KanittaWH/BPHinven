<script>
// ============================================
// js-borrow-admin.js - จัดการยืม-คืนพัสดุ (Admin)
// Version: 2.0 with Return Approval
// ============================================

let adminBorrowList = [];
let adminBorrowFilteredList = [];
let adminBorrowCurrentPage = 1;
let adminBorrowItemsPerPage = 10;
let adminBorrowTotalPages = 0;

// ============================================
// Load Borrow Admin Page
// ============================================
window.loadBorrowAdminImpl = function() {
    console.log('Loading Borrow Admin Page...');
    
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
                        <i class="fas fa-tasks text-purple-600 mr-2"></i>
                        จัดการยืม-คืนพัสดุ
                    </h2>
                    <p class="text-gray-600 mt-1">อนุมัติและจัดการการยืม-คืนพัสดุครุภัณฑ์</p>
                </div>
            </div>
        </div>
        
        <div class="p-4 sm:p-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-yellow-600 font-medium">รออนุมัติ</p>
                            <p class="text-2xl font-bold text-yellow-900" id="adminPendingCount">0</p>
                        </div>
                        <div class="text-yellow-500">
                            <i class="fas fa-clock text-3xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600 font-medium">กำลังยืม</p>
                            <p class="text-2xl font-bold text-green-900" id="adminBorrowedCount">0</p>
                        </div>
                        <div class="text-green-500">
                            <i class="fas fa-box text-3xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-blue-600 font-medium">รออนุมัติคืน</p>
                            <p class="text-2xl font-bold text-blue-900" id="adminPendingReturnCount">0</p>
                        </div>
                        <div class="text-blue-500">
                            <i class="fas fa-undo text-3xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 font-medium">คืนแล้ว</p>
                            <p class="text-2xl font-bold text-gray-900" id="adminReturnedCount">0</p>
                        </div>
                        <div class="text-gray-500">
                            <i class="fas fa-check-circle text-3xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Search and Filter -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <input type="text" 
                           id="adminBorrowSearchInput" 
                           placeholder="ค้นหารหัสพัสดุ, ชื่อพัสดุ, ผู้ยืม..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                </div>
                <div class="sm:w-48">
                    <select id="adminBorrowStatusFilter" 
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
            <div id="adminBorrowLoading" class="text-center py-12">
                <div class="inline-flex flex-col items-center">
                    <div class="relative">
                        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <i class="fas fa-tasks text-purple-500 text-2xl"></i>
                        </div>
                    </div>
                    <p class="text-gray-700 mt-4 text-lg font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            </div>

            <!-- Empty State -->
            <div id="adminBorrowEmpty" class="hidden text-center py-12">
                <div class="text-gray-400 mb-4">
                    <i class="fas fa-inbox text-6xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                <p class="text-gray-500">ยังไม่มีรายการยืมพัสดุในระบบ</p>
            </div>

            <!-- Table (Desktop) -->
            <div class="admin-borrow-table-wrapper bg-white rounded-lg shadow-md overflow-hidden hidden md:block">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ยืม</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ยืม</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กำหนดคืน</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="adminBorrowTableBody" class="bg-white divide-y divide-gray-200">
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Card View -->
            <div class="mobile-card-view md:hidden space-y-4">
            </div>

            <!-- Pagination -->
            <div id="adminBorrowPagination" class="hidden mt-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                <div class="text-sm text-gray-700">
                    แสดง <span id="adminBorrowShowingStart">0</span> ถึง <span id="adminBorrowShowingEnd">0</span> จาก <span id="adminBorrowTotal">0</span> รายการ
                </div>
                <div class="flex gap-2">
                    <button onclick="adminBorrowPrevPage()" id="adminBorrowPrevBtn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-chevron-left mr-2"></i>ก่อนหน้า
                    </button>
                    <div id="adminBorrowPageNumbers" class="flex gap-2">
                    </div>
                    <button onclick="adminBorrowNextPage()" id="adminBorrowNextBtn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        ถัดไป<i class="fas fa-chevron-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Event Listeners
    document.getElementById('adminBorrowSearchInput')?.addEventListener('input', adminBorrowFilterData);
    document.getElementById('adminBorrowStatusFilter')?.addEventListener('change', adminBorrowFilterData);
    
    // Load Data
    loadAdminBorrowList();
};

// ============================================
// 📊 Load Admin Borrow List
// ============================================
function loadAdminBorrowList() {
    showLoading('adminBorrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            console.log('Admin borrow list loaded:', response);
            
            if (response.status === 'success') {
                adminBorrowList = response.borrows || [];
                updateAdminBorrowStats();
                adminBorrowFilterData();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
            }
            
            hideLoading('adminBorrowLoading');
        })
        .withFailureHandler(function(error) {
            console.error('Load admin borrow list error:', error);
            showNotification('เกิดข้อผิดพลาด', 'error');
            hideLoading('adminBorrowLoading');
        })
        .getAllBorrows(getSessionId());
}

// ============================================
// 📊 Update Stats
// ============================================
function updateAdminBorrowStats() {
    const pending = adminBorrowList.filter(b => b.status === 'pending').length;
    const borrowed = adminBorrowList.filter(b => b.status === 'borrowed').length;
    const pendingReturn = adminBorrowList.filter(b => b.status === 'pending_return').length;
    const returned = adminBorrowList.filter(b => b.status === 'returned').length;
    
    const adminPendingEl = document.getElementById('adminPendingCount');
    const adminBorrowedEl = document.getElementById('adminBorrowedCount');
    const adminPendingReturnEl = document.getElementById('adminPendingReturnCount');
    const adminReturnedEl = document.getElementById('adminReturnedCount');
    
    if (adminPendingEl) adminPendingEl.textContent = pending;
    if (adminBorrowedEl) adminBorrowedEl.textContent = borrowed;
    if (adminPendingReturnEl) adminPendingReturnEl.textContent = pendingReturn;
    if (adminReturnedEl) adminReturnedEl.textContent = returned;
}

// ============================================
// 🔍 Filter Data
// ============================================
function adminBorrowFilterData() {
    const searchTerm = document.getElementById('adminBorrowSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('adminBorrowStatusFilter')?.value || '';
    
    let filtered = [...adminBorrowList];
    
    // Filter by status
    if (statusFilter) {
        filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Search
    if (searchTerm) {
        filtered = filtered.filter(b =>
            (b.equipment_number || '').toLowerCase().includes(searchTerm) ||
            (b.equipment_name || '').toLowerCase().includes(searchTerm) ||
            (b.equipment_type || '').toLowerCase().includes(searchTerm) ||
            (b.borrower_name || '').toLowerCase().includes(searchTerm)
        );
    }
    
    adminBorrowFilteredList = filtered;
    adminBorrowTotalPages = Math.ceil(adminBorrowFilteredList.length / adminBorrowItemsPerPage);
    adminBorrowCurrentPage = 1;
    
    renderAdminBorrowTable();
    renderAdminBorrowPagination();
}

// ============================================
// 🎨 Render Table
// ============================================
function renderAdminBorrowTable() {
    const tbody = document.getElementById('adminBorrowTableBody');
    const loading = document.getElementById('adminBorrowLoading');
    const empty = document.getElementById('adminBorrowEmpty');
    const pagination = document.getElementById('adminBorrowPagination');
    
    let mobileCardView = document.querySelector('.mobile-card-view');
    
    if (loading) loading.classList.add('hidden');
    
    if (adminBorrowFilteredList.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (mobileCardView) mobileCardView.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (empty) empty.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
    
    const startIndex = (adminBorrowCurrentPage - 1) * adminBorrowItemsPerPage;
    const endIndex = Math.min(startIndex + adminBorrowItemsPerPage, adminBorrowFilteredList.length);
    const pageData = adminBorrowFilteredList.slice(startIndex, endIndex);
    
    // Desktop Table
    if (tbody) {
        tbody.innerHTML = pageData.map(borrow => createAdminBorrowRow(borrow)).join('');
    }
    
    // Mobile Cards
    if (mobileCardView) {
        mobileCardView.innerHTML = pageData.map(borrow => createAdminBorrowCard(borrow)).join('');
    }
}

// ============================================
// 🎨 Create Table Row
// ============================================
function createAdminBorrowRow(borrow) {
    const statusBadge = getBorrowStatusBadge(borrow.status);
    const borrowDate = new Date(borrow.borrow_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const returnDate = new Date(borrow.return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const now = new Date();
    const isOverdue = borrow.status === 'borrowed' && new Date(borrow.return_date) < now;
    
    return `
        <tr class="hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${borrow.equipment_number}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${borrow.equipment_name}</div>
                <div class="text-sm text-gray-500">${borrow.equipment_type}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${borrow.borrower_name}</div>
                <div class="text-xs text-gray-500">${borrow.borrower_contact}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${borrowDate}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${returnDate}</div>
                ${isOverdue ? '<div class="text-xs text-red-600 font-medium">เลยกำหนด!</div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                    <button onclick='viewAdminBorrowDetail(${JSON.stringify(borrow).replace(/'/g, "&apos;")})' 
                            class="text-blue-600 hover:text-blue-900" title="ดูรายละเอียด">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${borrow.status === 'pending' ? `
                    <button onclick="approveBorrow('${borrow.id}')" 
                            class="text-green-600 hover:text-green-900" title="อนุมัติ">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="rejectBorrow('${borrow.id}')" 
                            class="text-red-600 hover:text-red-900" title="ไม่อนุมัติ">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                    ${borrow.status === 'pending_return' ? `
                    <button onclick="approveReturn('${borrow.id}')" 
                            class="text-green-600 hover:text-green-900" title="อนุมัติการคืน">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

// ============================================
// 🎨 Create Mobile Card
// ============================================
function createAdminBorrowCard(borrow) {
    const statusBadge = getBorrowStatusBadge(borrow.status);
    const borrowDate = new Date(borrow.borrow_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const returnDate = new Date(borrow.return_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    const now = new Date();
    const isOverdue = borrow.status === 'borrowed' && new Date(borrow.return_date) < now;
    
    return `
        <div class="bg-white rounded-lg shadow-md p-4 border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'}">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <div class="font-medium text-gray-900">${borrow.equipment_name}</div>
                    <div class="text-sm text-gray-500">${borrow.equipment_number}</div>
                    <div class="text-sm text-gray-600 mt-1">ผู้ยืม: ${borrow.borrower_name}</div>
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
                    <span class="font-medium ${isOverdue ? 'text-red-600' : ''}">${returnDate}</span>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button onclick='viewAdminBorrowDetail(${JSON.stringify(borrow).replace(/'/g, "&apos;")})' 
                        class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-eye mr-2"></i>ดูรายละเอียด
                </button>
                ${borrow.status === 'pending' ? `
                <button onclick="approveBorrow('${borrow.id}')" 
                        class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="rejectBorrow('${borrow.id}')" 
                        class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
                ${borrow.status === 'pending_return' ? `
                <button onclick="approveReturn('${borrow.id}')" 
                        class="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-check-circle mr-2"></i>อนุมัติคืน
                </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================
// 📄 Render Pagination
// ============================================
function renderAdminBorrowPagination() {
    const pagination = document.getElementById('adminBorrowPagination');
    if (!pagination || adminBorrowFilteredList.length === 0) return;
    
    const startIndex = (adminBorrowCurrentPage - 1) * adminBorrowItemsPerPage;
    const endIndex = Math.min(startIndex + adminBorrowItemsPerPage, adminBorrowFilteredList.length);
    
    const showingStartEl = document.getElementById('adminBorrowShowingStart');
    const showingEndEl = document.getElementById('adminBorrowShowingEnd');
    const totalEl = document.getElementById('adminBorrowTotal');
    
    if (showingStartEl) showingStartEl.textContent = startIndex + 1;
    if (showingEndEl) showingEndEl.textContent = endIndex;
    if (totalEl) totalEl.textContent = adminBorrowFilteredList.length;
    
    const prevBtn = document.getElementById('adminBorrowPrevBtn');
    const nextBtn = document.getElementById('adminBorrowNextBtn');
    
    if (prevBtn) prevBtn.disabled = adminBorrowCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = adminBorrowCurrentPage === adminBorrowTotalPages;
    
    // Page numbers
    const pageNumbers = document.getElementById('adminBorrowPageNumbers');
    if (pageNumbers) {
        let pages = '';
        for (let i = 1; i <= adminBorrowTotalPages; i++) {
            if (i === adminBorrowCurrentPage) {
                pages += `<button class="px-4 py-2 bg-purple-600 text-white rounded-lg">${i}</button>`;
            } else if (i === 1 || i === adminBorrowTotalPages || (i >= adminBorrowCurrentPage - 1 && i <= adminBorrowCurrentPage + 1)) {
                pages += `<button onclick="adminBorrowGoToPage(${i})" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">${i}</button>`;
            } else if (i === adminBorrowCurrentPage - 2 || i === adminBorrowCurrentPage + 2) {
                pages += `<span class="px-2">...</span>`;
            }
        }
        pageNumbers.innerHTML = pages;
    }
}

function adminBorrowPrevPage() {
    if (adminBorrowCurrentPage > 1) {
        adminBorrowCurrentPage--;
        renderAdminBorrowTable();
        renderAdminBorrowPagination();
    }
}

function adminBorrowNextPage() {
    if (adminBorrowCurrentPage < adminBorrowTotalPages) {
        adminBorrowCurrentPage++;
        renderAdminBorrowTable();
        renderAdminBorrowPagination();
    }
}

function adminBorrowGoToPage(page) {
    adminBorrowCurrentPage = page;
    renderAdminBorrowTable();
    renderAdminBorrowPagination();
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
// ✅ Approve Borrow (อนุมัติการยืม)
// ============================================
function approveBorrow(borrowId) {
    const borrow = adminBorrowList.find(b => b.id === borrowId);
    if (!borrow) {
        showNotification('ไม่พบข้อมูลการยืม', 'error');
        return;
    }
    
    Swal.fire({
        title: '<i class="fas fa-check text-green-600 mr-2"></i>อนุมัติการยืมพัสดุ',
        html: `
            <div class="text-left space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="text-sm">
                        <div class="font-medium text-gray-900">${borrow.equipment_name}</div>
                        <div class="text-gray-600">${borrow.equipment_number} | ${borrow.equipment_type}</div>
                        <div class="text-gray-600 mt-1">ผู้ยืม: ${borrow.borrower_name}</div>
                    </div>
                </div>
                
                ${borrow.signature_url ? `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้ยืม</label>
                    <div class="border rounded-lg p-2 bg-white">
                        <img src="${borrow.signature_url}" 
                             alt="ลายเซ็นผู้ยืม" 
                             class="max-h-32 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-gray-500 text-center py-2\\'>ไม่สามารถแสดงลายเซ็นได้</p>'">
                    </div>
                </div>
                ` : ''}
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้อนุมัติ *</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg">
                        <canvas id="approverSignaturePad" width="520" height="200" class="cursor-crosshair"></canvas>
                    </div>
                    <div class="flex gap-2 mt-2">
                        <button type="button" onclick="clearApproverSignature()" 
                                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <i class="fas fa-eraser mr-1"></i> ล้างลายเซ็น
                        </button>
                    </div>
                </div>
                
                <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <i class="fas fa-info-circle mr-1"></i>
                    กรุณาเซ็นชื่อเพื่อยืนยันการอนุมัติ
                </p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยืนยันอนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981',
        width: '650px',
        didOpen: () => {
            initApproverSignaturePad();
        },
        preConfirm: () => {
            if (window.approverSignaturePad && window.approverSignaturePad.isEmpty()) {
                Swal.showValidationMessage('กรุณาเซ็นชื่อยืนยันการอนุมัติ');
                return false;
            }
            
            return {
                borrowId: borrowId,
                signature: window.approverSignaturePad ? window.approverSignaturePad.toDataURL() : ''
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            submitApproveBorrow(result.value);
        }
    });
}

// Initialize Approver Signature Pad
function initApproverSignaturePad() {
    const canvas = document.getElementById('approverSignaturePad');
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
    
    window.approverSignaturePad = {
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

function clearApproverSignature() {
    if (window.approverSignaturePad) {
        window.approverSignaturePad.clear();
    }
}

function submitApproveBorrow(data) {
    showLoading('adminBorrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            hideLoading('adminBorrowLoading');
            
            if (response.status === 'success') {
                showNotification('อนุมัติการยืมพัสดุเรียบร้อยแล้ว', 'success');
                loadAdminBorrowList();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
            }
        })
        .withFailureHandler(function(error) {
            hideLoading('adminBorrowLoading');
            showNotification('เกิดข้อผิดพลาดในการอนุมัติ', 'error');
        })
        .approveBorrow(data.borrowId, data.signature, getSessionId());
}

// ============================================
// ❌ Reject Borrow
// ============================================
function rejectBorrow(borrowId) {
    Swal.fire({
        title: 'ไม่อนุมัติการยืมพัสดุ',
        input: 'textarea',
        inputLabel: 'เหตุผลที่ไม่อนุมัติ',
        inputPlaceholder: 'ระบุเหตุผล...',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-times mr-2"></i>ไม่อนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444',
        preConfirm: (reason) => {
            if (!reason) {
                Swal.showValidationMessage('กรุณาระบุเหตุผล');
                return false;
            }
            return reason;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            showLoading('adminBorrowLoading');
            
            google.script.run
                .withSuccessHandler(function(response) {
                    hideLoading('adminBorrowLoading');
                    
                    if (response.status === 'success') {
                        showNotification('ไม่อนุมัติการยืมพัสดุเรียบร้อยแล้ว', 'success');
                        loadAdminBorrowList();
                    } else {
                        showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
                    }
                })
                .withFailureHandler(function(error) {
                    hideLoading('adminBorrowLoading');
                    showNotification('เกิดข้อผิดพลาด', 'error');
                })
                .rejectBorrow(borrowId, result.value, getSessionId());
        }
    });
}

// ============================================
// ✅ Approve Return (อนุมัติการคืนพัสดุ)
// ============================================
function approveReturn(borrowId) {
    const borrow = adminBorrowList.find(b => b.id === borrowId);
    if (!borrow) {
        showNotification('ไม่พบข้อมูลการยืม', 'error');
        return;
    }
    
    Swal.fire({
        title: '<i class="fas fa-check text-green-600 mr-2"></i>อนุมัติการคืนพัสดุ',
        html: `
            <div class="text-left space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="text-sm">
                        <div class="font-medium text-gray-900">${borrow.equipment_name}</div>
                        <div class="text-gray-600">${borrow.equipment_number} | ${borrow.equipment_type}</div>
                        <div class="text-gray-600 mt-1">ผู้คืน: ${borrow.borrower_name}</div>
                        <div class="text-gray-600 mt-1">สภาพหลังใช้: ${borrow.condition_after || 'ปกติ'}</div>
                    </div>
                </div>
                
                ${borrow.returner_signature_url ? `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้คืน</label>
                    <div class="border rounded-lg p-2 bg-white">
                        <img src="${borrow.returner_signature_url}" 
                             alt="ลายเซ็นผู้คืน" 
                             class="max-h-32 mx-auto"
                             onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-gray-500 text-center py-2\\'>ไม่สามารถแสดงลายเซ็นได้</p>'">
                    </div>
                </div>
                ` : ''}
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-calendar-alt mr-1"></i>
                        วันที่คืนจริง *
                    </label>
                    <input type="date" 
                           id="actualReturnDate" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ลายเซ็นผู้อนุมัติการคืน *</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg">
                        <canvas id="returnApproverSignaturePad" width="520" height="200" class="cursor-crosshair"></canvas>
                    </div>
                    <div class="flex gap-2 mt-2">
                        <button type="button" onclick="clearReturnApproverSignature()" 
                                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <i class="fas fa-eraser mr-1"></i> ล้างลายเซ็น
                        </button>
                    </div>
                </div>
                
                <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <i class="fas fa-info-circle mr-1"></i>
                    กรุณาเซ็นชื่อเพื่อยืนยันการอนุมัติการคืน
                </p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check mr-2"></i>ยืนยันอนุมัติ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981',
        width: '650px',
        didOpen: () => {
            initReturnApproverSignaturePad();
        },
        preConfirm: () => {
            const actualReturnDate = document.getElementById('actualReturnDate').value;
            
            if (!actualReturnDate) {
                Swal.showValidationMessage('กรุณาระบุวันที่คืนจริง');
                return false;
            }
            
            if (window.returnApproverSignaturePad && window.returnApproverSignaturePad.isEmpty()) {
                Swal.showValidationMessage('กรุณาเซ็นชื่อยืนยันการอนุมัติ');
                return false;
            }
            
            return {
                borrowId: borrowId,
                actualReturnDate: actualReturnDate,
                signature: window.returnApproverSignaturePad ? window.returnApproverSignaturePad.toDataURL() : ''
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            submitApproveReturn(result.value);
        }
    });
}

// Initialize Return Approver Signature Pad
function initReturnApproverSignaturePad() {
    const canvas = document.getElementById('returnApproverSignaturePad');
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
    
    window.returnApproverSignaturePad = {
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

function clearReturnApproverSignature() {
    if (window.returnApproverSignaturePad) {
        window.returnApproverSignaturePad.clear();
    }
}

function submitApproveReturn(data) {
    showLoading('adminBorrowLoading');
    
    google.script.run
        .withSuccessHandler(function(response) {
            hideLoading('adminBorrowLoading');
            
            if (response.status === 'success') {
                showNotification('อนุมัติการคืนพัสดุเรียบร้อยแล้ว', 'success');
                loadAdminBorrowList();
            } else {
                showNotification(response.message || 'เกิดข้อผิดพลาด', 'error');
            }
        })
        .withFailureHandler(function(error) {
            hideLoading('adminBorrowLoading');
            showNotification('เกิดข้อผิดพลาดในการอนุมัติ', 'error');
        })
        .approveReturn(data, getSessionId());
}

// ============================================
// 👁️ View Admin Borrow Detail (แสดงลายเซ็นตามสถานะ)
// ============================================
function viewAdminBorrowDetail(borrow) {
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

console.log('✓ js-borrow-admin.js loaded successfully');
</script>
