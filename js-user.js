<script>
// ============================================
// js-user.js - User Management Module
// ระบบจัดการผู้ใช้งาน พร้อมค้นหา กรอง Pagination และ SweetAlert2
// ============================================

let userList = []; // รายการผู้ใช้ทั้งหมด
let filteredUserList = []; // รายการผู้ใช้หลังกรอง
let currentUserPage = 1; // หน้าปัจจุบัน
const usersPerPage = 20; // จำนวนรายการต่อหน้า
let totalUserPages = 1; // จำนวนหน้าทั้งหมด

// ============================================
// ฟังก์ชันแสดงหน้าจัดการผู้ใช้งาน
// ============================================
function showUsersManagement() {
    console.log('showUsersManagement called');
    
    const content = document.getElementById('contentArea');
    if (!content) {
        console.error('contentArea not found!');
        return;
    }
    
    content.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">จัดการผู้ใช้งาน</h1>
                    <p class="text-gray-600">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
                </div>
                <button id="addUserBtn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-lg mt-4 sm:mt-0">
                    <i class="fas fa-user-plus mr-2"></i>
                    เพิ่มผู้ใช้ใหม่
                </button>
            </div>
            
            <!-- Search and Filter Bar -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Search -->
                    <div class="md:col-span-2">
                        <div class="relative">
                            <input type="text" 
                                   id="userSearch" 
                                   placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล..." 
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                        </div>
                    </div>
                    
                    <!-- Role Filter -->
                    <div>
                        <select id="userRoleFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">ทุกบทบาท</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                            <option value="technician">ช่างซ่อม</option>
                            <option value="user">ผู้ใช้ทั่วไป</option>
                        </select>
                    </div>
                    
                    <!-- Status Filter -->
                    <div>
                        <select id="userStatusFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">ทุกสถานะ</option>
                            <option value="active">ใช้งาน</option>
                            <option value="inactive">ปิดใช้งาน</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Users Table Wrapper -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden user-table-wrapper">
                <!-- Loading State -->
                <div id="usersLoading" class="hidden text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p class="text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
                </div>
                
                <!-- Empty State -->
                <div id="usersEmpty" class="hidden text-center py-12">
                    <i class="fas fa-users text-gray-300 text-6xl mb-4"></i>
                    <p class="text-gray-600 text-lg">ไม่พบข้อมูลผู้ใช้</p>
                </div>
                
                <!-- Desktop Table View -->
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เข้าสู่ระบบล่าสุด</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody" class="bg-white divide-y divide-gray-200">
                            <!-- Data will be inserted here -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Mobile Card View -->
                <div id="usersMobileCards" class="mobile-card-view" style="display: none;">
                    <!-- Mobile cards will be inserted here -->
                </div>
                
                <!-- Pagination -->
                <div id="usersPagination" class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <!-- Pagination controls will be inserted here -->
                </div>
            </div>
        </div>
        
        <!-- User Modal -->
        <div id="userModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h2>
                        <button id="closeUserModal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <form id="userForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Username -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อผู้ใช้ <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="userUsername" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="username">
                            </div>
                            
                            <!-- Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อ-นามสกุล <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="userName" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="ชื่อ นามสกุล">
                            </div>
                            
                            <!-- Password Field (shown only when adding new user) -->
                            <div id="userPasswordField">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสผ่าน <span class="text-red-500" id="passwordRequired">*</span>
                                </label>
                                <input type="password" id="userPassword"
                                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="รหัสผ่าน">
                                <p class="text-xs text-gray-500 mt-1" id="passwordHint">ปล่อยว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
                            </div>
                            
                            <!-- Role -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    บทบาท <span class="text-red-500">*</span>
                                </label>
                                <select id="userRole" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="user">ผู้ใช้ทั่วไป</option>
                                    <option value="technician">ช่างซ่อม</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    สิทธิ์การเข้าถึงจะถูกกำหนดตามบทบาทโดยอัตโนมัติ
                                </p>
                            </div>
                            
                            <!-- Active Status -->
                            <div class="md:col-span-2">
                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" id="userActive" checked class="rounded text-blue-600">
                                    <span class="text-sm font-medium text-gray-700">เปิดใช้งานบัญชี</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <button type="button" id="cancelUserBtn"
                                    class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                <i class="fas fa-times mr-2"></i>ยกเลิก
                            </button>
                            <button type="submit" id="saveUserBtn"
                                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-save mr-2"></i>บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Initialize event listeners
    initializeUserEventListeners();
    
    // Load users data
    loadUsersData();
}

// ============================================
// Initialize Event Listeners
// ============================================
function initializeUserEventListeners() {
    // Add user button
    document.getElementById('addUserBtn')?.addEventListener('click', () => showUserModal());
    
    // Close modal buttons
    document.getElementById('closeUserModal')?.addEventListener('click', hideUserModal);
    document.getElementById('cancelUserBtn')?.addEventListener('click', hideUserModal);
    
    // Form submit
    document.getElementById('userForm')?.addEventListener('submit', handleUserSubmit);
    
    // Search input
    document.getElementById('userSearch')?.addEventListener('input', filterUsers);
    
    // Filter selects
    document.getElementById('userRoleFilter')?.addEventListener('change', filterUsers);
    document.getElementById('userStatusFilter')?.addEventListener('change', filterUsers);
}

// ============================================
// Load Users Data
// ============================================
function loadUsersData() {
    const loading = document.getElementById('usersLoading');
    const empty = document.getElementById('usersEmpty');
    
    if (loading) loading.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    
    const sessionId = window.sessionId || sessionId;
    
    google.script.run
        .withSuccessHandler(function(result) {
            const loading = document.getElementById('usersLoading');
            
            if (loading) loading.classList.add('hidden');
            
            if (result.status === 'success') {
                userList = result.users || [];
                filteredUserList = [...userList];
                
                currentUserPage = 1;
                updateUserPagination();
                renderUsersTable();
            } else {
                showUserNotification(result.message || 'เกิดข้อผิดพลาด', 'error');
                document.getElementById('usersEmpty')?.classList.remove('hidden');
            }
        })
        .withFailureHandler(function(error) {
            console.error('Load users error:', error);
            const loading = document.getElementById('usersLoading');
            if (loading) loading.classList.add('hidden');
            document.getElementById('usersEmpty')?.classList.remove('hidden');
            showUserNotification('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้', 'error');
        })
        .getUserList(sessionId);
}

// ============================================
// Filter Users
// ============================================
function filterUsers() {
    const searchTerm = document.getElementById('userSearch')?.value.toLowerCase().trim() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    const statusFilter = document.getElementById('userStatusFilter')?.value || '';
    
    filteredUserList = userList.filter(user => {
        // Search filter
        const matchSearch = searchTerm === '' || 
            (user.username || '').toLowerCase().includes(searchTerm) ||
            (user.name || '').toLowerCase().includes(searchTerm);
        
        // Role filter
        const matchRole = roleFilter === '' || user.role === roleFilter;
        
        // Status filter
        const matchStatus = statusFilter === '' || 
            (statusFilter === 'active' && user.active) ||
            (statusFilter === 'inactive' && !user.active);
        
        return matchSearch && matchRole && matchStatus;
    });
    
    currentUserPage = 1;
    updateUserPagination();
    renderUsersTable();
}

// ============================================
// Pagination Functions
// ============================================
function updateUserPagination() {
    totalUserPages = Math.ceil(filteredUserList.length / usersPerPage);
    if (totalUserPages === 0) totalUserPages = 1;
    
    if (currentUserPage > totalUserPages) {
        currentUserPage = totalUserPages;
    }
    
    renderUserPaginationControls();
}

function renderUserPaginationControls() {
    const paginationContainer = document.getElementById('usersPagination');
    if (!paginationContainer) return;
    
    const startItem = (currentUserPage - 1) * usersPerPage + 1;
    const endItem = Math.min(currentUserPage * usersPerPage, filteredUserList.length);
    const totalItems = filteredUserList.length;
    
    if (totalItems === 0) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    paginationContainer.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
                แสดง <span class="font-medium">${startItem}</span> ถึง 
                <span class="font-medium">${endItem}</span> จาก 
                <span class="font-medium">${totalItems}</span> รายการ
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="goToUserPage(1)" 
                        ${currentUserPage === 1 ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="หน้าแรก">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button onclick="goToUserPage(${currentUserPage - 1})" 
                        ${currentUserPage === 1 ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ก่อนหน้า">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="px-4 py-1 text-sm font-medium text-gray-700">
                    หน้า ${currentUserPage} / ${totalUserPages}
                </span>
                <button onclick="goToUserPage(${currentUserPage + 1})" 
                        ${currentUserPage === totalUserPages ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ถัดไป">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button onclick="goToUserPage(${totalUserPages})" 
                        ${currentUserPage === totalUserPages ? 'disabled' : ''}
                        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="หน้าสุดท้าย">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        </div>
    `;
}

function goToUserPage(page) {
    if (page < 1 || page > totalUserPages) return;
    currentUserPage = page;
    renderUsersTable();
    renderUserPaginationControls();
}

// ============================================
// Render Users Table
// ============================================
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const mobileCards = document.getElementById('usersMobileCards');
    const empty = document.getElementById('usersEmpty');
    const pagination = document.getElementById('usersPagination');
    
    if (filteredUserList.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (mobileCards) mobileCards.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (empty) empty.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
    
    // Calculate pagination
    const startIndex = (currentUserPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, filteredUserList.length);
    const pageData = filteredUserList.slice(startIndex, endIndex);
    
    // Desktop Table View
    if (tbody) {
        tbody.innerHTML = pageData.map(user => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}">
                        ${getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(user.last_login)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full">
                        <i class="fas ${user.active ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${user.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editUser('${user.id}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3"
                            title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" 
                            class="text-red-600 hover:text-red-900"
                            title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Mobile Card View
    if (mobileCards) {
        mobileCards.innerHTML = pageData.map(user => `
            <div class="user-card">
                <!-- Card Header -->
                <div class="user-card-header">
                    <div class="user-card-username">${user.username}</div>
                    <span class="px-2 py-1 text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full">
                        <i class="fas ${user.active ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${user.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                </div>
                
                <!-- Card Body -->
                <div class="user-card-body">
                    <div class="user-card-name">${user.name}</div>
                    
                    <div class="user-card-info">
                        <span class="user-card-info-label">
                            <i class="fas fa-user-tag"></i>
                            บทบาท
                        </span>
                        <span class="user-card-role ${getRoleBadgeColor(user.role)}">
                            ${getRoleDisplayName(user.role)}
                        </span>
                    </div>
                    
                    <div class="user-card-info">
                        <span class="user-card-info-label">
                            <i class="fas fa-clock"></i>
                            เข้าสู่ระบบล่าสุด
                        </span>
                        <span class="user-card-info-value">
                            ${formatDate(user.last_login)}
                        </span>
                    </div>
                </div>
                
                <!-- Card Footer -->
                <div class="user-card-footer">
                    <button onclick="editUser('${user.id}')" 
                            class="user-card-btn user-card-btn-edit">
                        <i class="fas fa-edit"></i>
                        <span>แก้ไข</span>
                    </button>
                    <button onclick="deleteUser('${user.id}')" 
                            class="user-card-btn user-card-btn-delete">
                        <i class="fas fa-trash"></i>
                        <span>ลบ</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// Helper Functions
// ============================================
function getRoleBadgeColor(role) {
    const colors = {
        'admin': 'bg-purple-100 text-purple-800',
        'technician': 'bg-blue-100 text-blue-800',
        'user': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
}

function getRoleDisplayName(role) {
    const names = {
        'admin': 'ผู้ดูแลระบบ',
        'technician': 'ช่างซ่อม',
        'user': 'ผู้ใช้ทั่วไป'
    };
    return names[role] || role;
}

function getPermissionDisplayName(permission) {
    const names = {
        'all': 'ทั้งหมด',
        'inventory': 'พัสดุ',
        'repair': 'ซ่อม',
        'repair_view': 'ดูข้อมูลซ่อม',
        'reports': 'รายงาน'
    };
    return names[permission] || permission;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// Modal Functions
// ============================================
function showUserModal(isEdit = false) {
    const modal = document.getElementById('userModal');
    const modalTitle = modal.querySelector('h2');
    const submitBtn = document.getElementById('saveUserBtn');
    const passwordField = document.getElementById('userPasswordField');
    const passwordInput = document.getElementById('userPassword');
    const passwordRequired = document.getElementById('passwordRequired');
    const passwordHint = document.getElementById('passwordHint');
    
    if (isEdit) {
        modalTitle.textContent = 'แก้ไขผู้ใช้';
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกการแก้ไข';
        
        // ✅ แก้ไข: ลบ required และแสดงคำแนะนำ
        if (passwordInput) {
            passwordInput.required = false;
            passwordInput.value = '';
        }
        if (passwordRequired) passwordRequired.style.display = 'none';
        if (passwordHint) passwordHint.style.display = 'block';
        
    } else {
        modalTitle.textContent = 'เพิ่มผู้ใช้ใหม่';
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึก';
        
        // ✅ เพิ่ม required สำหรับผู้ใช้ใหม่
        if (passwordInput) {
            passwordInput.required = true;
            passwordInput.value = '';
        }
        if (passwordRequired) passwordRequired.style.display = 'inline';
        if (passwordHint) passwordHint.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
}

function hideUserModal() {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    
    modal.classList.add('hidden');
    form.reset();
    form.removeAttribute('data-edit-id');
    
    // Reset password field
    const passwordInput = document.getElementById('userPassword');
    const passwordRequired = document.getElementById('passwordRequired');
    const passwordHint = document.getElementById('passwordHint');
    
    if (passwordInput) {
        passwordInput.required = true;
        passwordInput.value = '';
    }
    if (passwordRequired) passwordRequired.style.display = 'inline';
    if (passwordHint) passwordHint.style.display = 'none';
}

// ============================================
// Form Submit Handler
// ============================================
function handleUserSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.getAttribute('data-edit-id');
    const isEdit = !!editId;
    
    // Get role and set permissions automatically based on role
    const role = document.getElementById('userRole').value;
    let permissions = [];
    
    // กำหนด permissions ตาม role โดยอัตโนมัติ
    switch (role) {
        case 'admin':
            permissions = ['all'];
            break;
        case 'technician':
            permissions = ['repair', 'repair_view', 'reports'];
            break;
        case 'user':
        default:
            permissions = ['repair_view'];
            break;
    }
    
    const userData = {
        username: document.getElementById('userUsername').value.trim(),
        name: document.getElementById('userName').value.trim(),
        role: role,
        permissions: permissions,
        active: document.getElementById('userActive').checked
    };
    
    // ✅ เพิ่มรหัสผ่านเฉพาะเมื่อมีการกรอก
    const passwordValue = document.getElementById('userPassword').value;
    if (!isEdit || (isEdit && passwordValue.trim() !== '')) {
        userData.password = passwordValue;
    }
    
    if (isEdit) {
        userData.id = editId;
    }
    
    // Show loading
    Swal.fire({
        title: 'กำลังบันทึก...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
    });
    
    const sessionId = window.sessionId || sessionId;
    
    if (isEdit) {
        // Update existing user
        google.script.run
            .withSuccessHandler(function(result) {
                Swal.close();
                
                if (result.status === 'success') {
                    hideUserModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ!',
                        text: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว',
                        confirmButtonText: 'ตกลง',
                        confirmButtonColor: '#3b82f6',
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        loadUsersData();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: result.message || 'ไม่สามารถแก้ไขข้อมูลได้',
                        confirmButtonText: 'ตกลง',
                        confirmButtonColor: '#3b82f6'
                    });
                }
            })
            .withFailureHandler(function(error) {
                Swal.close();
                console.error('Update user error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3b82f6'
                });
            })
            .updateUser(userData, sessionId);
    } else {
        // Add new user
        google.script.run
            .withSuccessHandler(function(result) {
                Swal.close();
                
                if (result.status === 'success') {
                    hideUserModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'สำเร็จ!',
                        text: 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว',
                        confirmButtonText: 'ตกลง',
                        confirmButtonColor: '#3b82f6',
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        loadUsersData();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: result.message || 'ไม่สามารถเพิ่มผู้ใช้ได้',
                        confirmButtonText: 'ตกลง',
                        confirmButtonColor: '#3b82f6'
                    });
                }
            })
            .withFailureHandler(function(error) {
                Swal.close();
                console.error('Add user error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3b82f6'
                });
            })
            .addUser(userData, sessionId);
    }
}

// ============================================
// Edit User
// ============================================
function editUser(userId) {
    const user = userList.find(u => u.id === userId);
    
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Show modal in edit mode
    showUserModal(true);
    
    // Set form data
    document.getElementById('userForm').setAttribute('data-edit-id', user.id);
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userName').value = user.name;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userActive').checked = user.active;
}

// ============================================
// Delete User
// ============================================
function deleteUser(userId) {
    const user = userList.find(u => u.id === userId);
    
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการลบ',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Prevent deleting current user
    const currentUser = window.currentUser || currentUser;
    if (currentUser && currentUser.id === userId) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถลบได้',
            text: 'คุณไม่สามารถลบบัญชีของตนเองได้',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    Swal.fire({
        title: 'ยืนยันการลบ?',
        html: `
            <div class="text-left">
                <p class="mb-3">คุณต้องการลบผู้ใช้นี้หรือไม่?</p>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p><strong>ชื่อผู้ใช้:</strong> ${user.username}</p>
                    <p><strong>ชื่อ:</strong> ${user.name}</p>
                    <p><strong>บทบาท:</strong> ${getRoleDisplayName(user.role)}</p>
                </div>
                <p class="mt-3 text-red-600 text-sm">
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-trash mr-2"></i>ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            performDeleteUser(userId);
        }
    });
}

function performDeleteUser(userId) {
    const sessionId = window.sessionId || sessionId;
    
    Swal.fire({
        title: 'กำลังลบ...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
    });
    
    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            
            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'ลบสำเร็จ!',
                    text: 'ลบผู้ใช้เรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    loadUsersData();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: result.message || 'ไม่สามารถลบผู้ใช้ได้',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3b82f6'
                });
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            console.error('Delete user error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#3b82f6'
            });
        })
        .deleteUser(userId, sessionId);
}

// ============================================
// Notification Helper
// ============================================
function showUserNotification(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        const iconMap = {
            'success': 'success',
            'error': 'error',
            'warning': 'warning',
            'info': 'info'
        };
        
        Swal.fire({
            icon: iconMap[type] || 'info',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        alert(message);
    }
}

console.log('✓ js-user.js loaded successfully');
</script>
