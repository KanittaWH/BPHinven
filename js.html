<!-- SweetAlert2 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/11.7.32/sweetalert2.min.js"></script>

<!-- Chart.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>

<!-- QR Scanner (optional) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>

<script>
// ============================================
// Global Variables และ Configuration
// ============================================
let currentUser = null;
let sessionId = null;
let currentView = 'dashboard';
let dashboardData = {};
let recentActivities = [];
let systemConfig = null; // เพิ่มตัวแปรเก็บ config


let currentActivityPage = 0;
const ACTIVITIES_PER_PAGE = 5;

// *** เพิ่มตัวแปรสำหรับ Guest Repair ***
let guestEquipmentFound = false;
let guestSearchTimeout = null;

// SweetAlert2 configuration
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

// ============================================
// Load System Config - โหลด Logo และชื่อระบบ
// ============================================
async function loadSystemConfig() {
    try {
        console.log('Loading system config...');
        
        return new Promise((resolve) => {
            google.script.run
                .withSuccessHandler((data) => {
                    console.log('System config received:', data);
                    
                    if (data.status === 'success' && data.config) {
                        systemConfig = data.config;
                        
                        // อัพเดท navbar
                        updateNavbarConfig(data.config);
                        
                        // อัพเดท sidebar
                        updateSidebarConfig(data.config);
                        
                        // รอให้ DOM update ก่อนจึง resolve
                        setTimeout(() => resolve(), 100);
                    } else {
                        resolve();
                    }
                })
                .withFailureHandler((error) => {
                    console.warn('Error loading system config:', error);
                    resolve();
                })
                .getSystemConfig();
        });
    } catch (error) {
        console.warn('Error loading system config:', error);
    }
}

function updateNavbarConfig(config) {
    try {
        console.log('updateNavbarConfig called with:', { logo_url: config.logo_url, app_name: config.app_name });
        
        // อัพเดท Logo ใน Navbar
        if (config.logo_url) {
            const navbarLogo = document.getElementById('navbarLogo');
            const navbarLogoIcon = document.getElementById('navbarLogoIcon');
            
            if (navbarLogo && navbarLogoIcon) {
                // ตั้ง event listener ก่อนเสมอ
                navbarLogo.onload = function() {
                    console.log('✓ Navbar logo loaded');
                    navbarLogoIcon.classList.add('hidden');
                    navbarLogo.classList.remove('hidden');
                };
                
                navbarLogo.onerror = function() {
                    console.warn('✗ Failed to load navbar logo from:', config.logo_url);
                    navbarLogoIcon.classList.remove('hidden');
                    navbarLogo.classList.add('hidden');
                };
                
                // เซ็ต src หลัง และให้ไป trigger onload
                if (!navbarLogo.src || navbarLogo.src !== config.logo_url) {
                    navbarLogo.src = config.logo_url;
                }
            }
        }
        
        // อัพเดท Logo ใน Login Modal
        if (config.logo_url) {
            const loginLogo = document.getElementById('loginLogo');
            const loginLogoIcon = document.getElementById('loginLogoIcon');
            
            if (loginLogo && loginLogoIcon) {
                // ตั้ง event listener ก่อนเสมอ
                loginLogo.onload = function() {
                    console.log('✓ Login logo loaded');
                    loginLogoIcon.classList.add('hidden');
                    loginLogo.classList.remove('hidden');
                };
                
                loginLogo.onerror = function() {
                    console.warn('✗ Failed to load login logo from:', config.logo_url);
                    loginLogoIcon.classList.remove('hidden');
                    loginLogo.classList.add('hidden');
                };
                
                // เซ็ต src หลัง
                loginLogo.src = config.logo_url;
            }
        }
        
        // อัพเดท App Name ใน Navbar Header
        if (config.app_name) {
            const headerTitle = document.querySelector('header h1');
            if (headerTitle) {
                headerTitle.textContent = config.app_name;
                console.log('✓ Header title updated to:', config.app_name);
            }
            
            // อัพเดท App Name ใน Login Modal
            const loginTitle = document.querySelector('#loginModal h2');
            if (loginTitle) {
                loginTitle.textContent = config.app_name;
                console.log('✓ Login title updated to:', config.app_name);
            }
        }
        
        console.log('✓ Navbar config updated successfully');
    } catch (error) {
        console.warn('Error updating navbar config:', error);
    }
}

function updateSidebarConfig(config) {
    try {
        // อัพเดท App Name
        if (config.app_name) {
            const appNameEl = document.getElementById('sidebarAppName');
            if (appNameEl) appNameEl.textContent = config.app_name;
        }
        
        // อัพเดท Organization Name
        if (config.organization_name) {
            const orgNameEl = document.getElementById('sidebarOrgName');
            if (orgNameEl) orgNameEl.textContent = config.organization_name;
        }
        
        // อัพเดท Logo
        if (config.logo_url) {
            const logoImage = document.getElementById('sidebarLogoImage');
            const logoIcon = document.getElementById('sidebarLogoIcon');
            const logoContainer = document.getElementById('sidebarLogoContainer');
            
            if (logoImage) {
                logoImage.src = config.logo_url;
                logoImage.onload = function() {
                    logoIcon.classList.add('hidden');
                    logoImage.classList.remove('hidden');
                    logoContainer.style.backgroundColor = 'transparent';
                };
                logoImage.onerror = function() {
                    logoIcon.classList.remove('hidden');
                    logoImage.classList.add('hidden');
                };
            }
        }
        
        console.log('✓ Sidebar config updated');
    } catch (error) {
        console.warn('Error updating sidebar config:', error);
    }
}

// ============================================
// Utility Functions
// ============================================

// Show loading state
function showLoading(element = null) {
    if (element) {
        element.classList.add('btn-loading');
        element.disabled = true;
    }
}

// Hide loading state
function hideLoading(element = null) {
    if (element) {
        element.classList.remove('btn-loading');
        element.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    Toast.fire({
        icon: type,
        title: message
    });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount || 0);
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'status-pending', text: 'รอดำเนินการ', icon: 'clock' },
        'in_progress': { class: 'status-in-progress', text: 'กำลังซ่อม', icon: 'wrench' },
        'completed': { class: 'status-completed', text: 'เสร็จสิ้น', icon: 'check' },
        'cancelled': { class: 'status-cancelled', text: 'ยกเลิก', icon: 'times' }
    };
    
    const statusInfo = statusMap[status] || statusMap['pending'];
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}">
                <i class="fas fa-${statusInfo.icon} mr-1"></i>
                ${statusInfo.text}
            </span>`;
}

// Get priority badge HTML
function getPriorityBadge(priority) {
    const priorityMap = {
        'normal': { class: 'priority-normal', text: 'ปกติ', icon: 'minus' },
        'medium': { class: 'priority-medium', text: 'ปานกลาง', icon: 'exclamation' },
        'urgent': { class: 'priority-urgent', text: 'เร่งด่วน', icon: 'exclamation-triangle' }
    };
    
    const priorityInfo = priorityMap[priority] || priorityMap['normal'];
    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.class}">
                <i class="fas fa-${priorityInfo.icon} mr-1"></i>
                ${priorityInfo.text}
            </span>`;
}

// Generate UUID (simple version)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Image to base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// Navigation Functions
// ============================================

function setActiveNavItem(itemId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current item
    const activeItem = document.getElementById(itemId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
}

// ============================================
// Dashboard Functions
// ============================================

async function loadDashboard() {
    try {
        setActiveNavItem('dashboardBtn');
        currentView = 'dashboard';
        
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="animate-fadeIn">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">แดชบอร์ด</h1>
                    <p class="text-gray-600">ภาพรวมของระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม</p>
                </div>
                
                <!-- Dashboard Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="dashboard-card dashboard-card-blue animate-slideUp">
                        <div class="flex items-center">
                            <div class="flex-1">
                                <p class="text-blue-100 text-sm">พัสดุทั้งหมด</p>
                                <p class="text-2xl font-bold" id="totalEquipment">-</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-boxes"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card dashboard-card-orange animate-slideUp" style="animation-delay: 0.1s">
                        <div class="flex items-center">
                            <div class="flex-1">
                                <p class="text-orange-100 text-sm">ใกล้หมดประกัน</p>
                                <p class="text-2xl font-bold" id="expiringSoon">-</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card dashboard-card-red animate-slideUp" style="animation-delay: 0.2s">
                        <div class="flex items-center">
                            <div class="flex-1">
                                <p class="text-red-100 text-sm">รอการซ่อม</p>
                                <p class="text-2xl font-bold" id="pendingRepairs">-</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-wrench"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card dashboard-card-green animate-slideUp" style="animation-delay: 0.3s">
                        <div class="flex items-center">
                            <div class="flex-1">
                                <p class="text-green-100 text-sm">ซ่อมเสร็จแล้ว</p>
                                <p class="text-2xl font-bold" id="completedRepairs">-</p>
                            </div>
                            <div class="text-3xl opacity-80">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6 animate-slideUp" style="animation-delay: 0.4s">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">
                            <i class="fas fa-bolt text-blue-600 mr-2"></i>
                            การดำเนินการด่วน
                        </h3>
                        <div class="space-y-3">
                            ${hasPermission('inventory') || hasPermission('all') ? `
                            <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200" onclick="loadEquipmentManagement()">
                                <i class="fas fa-plus text-blue-600 mr-3"></i>
                                เพิ่มพัสดุใหม่
                            </button>
                            ` : ''}
                            <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200" onclick="showGuestRepairModal()">
                                <i class="fas fa-tools text-green-600 mr-3"></i>
                                แจ้งซ่อมด่วน
                            </button>
                            ${hasPermission('reports') || hasPermission('all') ? `
                            <button class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" onclick="loadReports()">
                                <i class="fas fa-chart-bar text-purple-600 mr-3"></i>
                                ดูรายงาน
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6 animate-slideUp" style="animation-delay: 0.5s">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">
                            <i class="fas fa-history text-orange-600 mr-2"></i>
                            กิจกรรมล่าสุด
                        </h3>
                        <div class="space-y-3" id="recentActivities">
                            <div class="flex items-center p-2 text-gray-600">
                                <i class="fas fa-spinner animate-spin mr-3"></i>
                                กำลังโหลดข้อมูล...
                            </div>
                        </div>
                    </div>
                </div>
                
        `;
        
        // Load dashboard data
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดแดชบอร์ด', 'error');
    }
}

async function loadDashboardData() {
    try {
        google.script.run
            .withSuccessHandler(onDashboardDataSuccess)
            .withFailureHandler(onDashboardDataError)
            .getDashboardData(sessionId);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function onDashboardDataSuccess(result) {
    if (result.status === 'success') {
        dashboardData = result.data;
        updateDashboardCards();
        loadRecentActivities();
        createCharts(); // ✅ สร้างกราฟหลังโหลดข้อมูลเสร็จ
    } else {
        showNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function onDashboardDataError(error) {
    console.error('Dashboard data error:', error);
    showNotification('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
}

function updateDashboardCards() {
    const totalEquipmentEl = document.getElementById('totalEquipment');
    const expiringEl = document.getElementById('expiringSoon');
    const pendingRepairsEl = document.getElementById('pendingRepairs');
    const completedRepairsEl = document.getElementById('completedRepairs');
    
    if (totalEquipmentEl) totalEquipmentEl.textContent = dashboardData.totalEquipment || 0;
    if (expiringEl) expiringEl.textContent = dashboardData.expiringSoon || 0;
    if (pendingRepairsEl) pendingRepairsEl.textContent = dashboardData.pendingRepairs || 0;
    if (completedRepairsEl) completedRepairsEl.textContent = dashboardData.completedRepairs || 0;
}

function loadRecentActivities() {
    // เรียกข้อมูลกิจกรรมจริงจาก Google Apps Script
    google.script.run
        .withSuccessHandler(onRecentActivitiesSuccess)
        .withFailureHandler(onRecentActivitiesError)
        .getRecentActivities(sessionId);
}

function onRecentActivitiesSuccess(result) {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;
    
    if (result.status === 'success' && result.activities.length > 0) {
        recentActivities = result.activities;
        currentActivityPage = 0; // รีเซ็ตกลับไปหน้าแรก
        renderActivities();
    } else {
        activitiesContainer.innerHTML = `
            <div class="flex items-center p-2 text-gray-500">
                <i class="fas fa-info-circle mr-3"></i>
                <span>ยังไม่มีกิจกรรมล่าสุด</span>
            </div>
        `;
    }
}

function renderActivities() {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;
    
    const startIndex = currentActivityPage * ACTIVITIES_PER_PAGE;
    const endIndex = startIndex + ACTIVITIES_PER_PAGE;
    const currentActivities = recentActivities.slice(startIndex, endIndex);
    const totalPages = Math.ceil(recentActivities.length / ACTIVITIES_PER_PAGE);
    
    let html = '';
    
    // แสดงกิจกรรม
    html += currentActivities.map(activity => {
        const timeAgo = getTimeAgo(activity.created_at);
        const icon = getActivityIcon(activity.type);
        const color = getActivityColor(activity.type);
        
        return `
            <div class="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-${icon} text-${color}-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 truncate">${activity.description}</p>
                    <p class="text-xs text-gray-500">${timeAgo} โดย ${activity.user}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // เพิ่มปุ่ม pagination (ถ้ามีมากกว่า 1 หน้า)
    if (totalPages > 1) {
        html += `
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
                <div class="text-xs text-gray-500">
                    หน้า ${currentActivityPage + 1} จาก ${totalPages}
                </div>
                <div class="flex space-x-2">
                    ${currentActivityPage > 0 ? `
                        <button onclick="previousActivityPage()" 
                                class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                            <i class="fas fa-chevron-left mr-1"></i>
                            ก่อนหน้า
                        </button>
                    ` : ''}
                    ${currentActivityPage < totalPages - 1 ? `
                        <button onclick="nextActivityPage()" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            หน้าถัดไป
                            <i class="fas fa-chevron-right ml-1"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    activitiesContainer.innerHTML = html;
}

function nextActivityPage() {
    const totalPages = Math.ceil(recentActivities.length / ACTIVITIES_PER_PAGE);
    if (currentActivityPage < totalPages - 1) {
        currentActivityPage++;
        renderActivities();
    }
}

function previousActivityPage() {
    if (currentActivityPage > 0) {
        currentActivityPage--;
        renderActivities();
    }
}

function onRecentActivitiesError(error) {
    console.error('Recent activities error:', error);
    const activitiesContainer = document.getElementById('recentActivities');
    if (activitiesContainer) {
        activitiesContainer.innerHTML = `
            <div class="flex items-center p-2 text-red-500">
                <i class="fas fa-exclamation-triangle mr-3"></i>
                <span>เกิดข้อผิดพลาดในการโหลดกิจกรรม</span>
            </div>
        `;
    }
}

function getActivityIcon(type) {
    const iconMap = {
        'login': 'sign-in-alt',
        'equipment_add': 'plus',
        'equipment_update': 'edit',
        'equipment_delete': 'trash',
        'repair_submit': 'tools',
        'repair_update': 'wrench',
        'repair_complete': 'check-circle',
        'user_add': 'user-plus',
        'user_update': 'user-edit',
        'user_delete': 'user-minus',
        'config_update': 'cog'
    };
    return iconMap[type] || 'info-circle';
}

function getActivityColor(type) {
    const colorMap = {
        'login': 'blue',
        'equipment_add': 'green',
        'equipment_update': 'yellow',
        'equipment_delete': 'red',
        'repair_submit': 'orange',
        'repair_update': 'blue',
        'repair_complete': 'green',
        'user_add': 'purple',
        'user_update': 'indigo',
        'user_delete': 'red',
        'config_update': 'gray'
    };
    return colorMap[type] || 'gray';
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'เมื่อสักครู่';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} วันที่แล้ว`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} สัปดาห์ที่แล้ว`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} เดือนที่แล้ว`;
    
    return `${Math.floor(days / 365)} ปีที่แล้ว`;
}


// ============================================
// 📊 DASHBOARD - ปรับปรุงใหม่พร้อมกราฟสวยงาม
// ============================================

/**
 * แสดงหน้า Dashboard พร้อมกราฟสวยงาม ไม่ยืด
 */
async function renderDashboard() {
    try {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="dashboard-container animate-fadeIn">
                <!-- Header Section -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        <i class="fas fa-tachometer-alt text-blue-600 mr-3"></i>
                        แดศบอร์ด
                    </h1>
                    <p class="text-gray-600">ภาพรวมของระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม</p>
                </div>
                
                <!-- Dashboard Cards (4 การ์ด) -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Card 1: พัสดุทั้งหมด -->
                    <div class="dashboard-card dashboard-card-blue animate-slideUp">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-blue-100 text-sm mb-1">พัสดุทั้งหมด</p>
                                <p class="text-3xl font-bold" id="totalEquipment">0</p>
                                <p class="text-blue-100 text-xs mt-2">รายการ</p>
                            </div>
                            <div class="text-5xl opacity-20">
                                <i class="fas fa-boxes"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 2: ใกล้หมดประกัน -->
                    <div class="dashboard-card dashboard-card-orange animate-slideUp" style="animation-delay: 0.1s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-orange-100 text-sm mb-1">ใกล้หมดประกัน</p>
                                <p class="text-3xl font-bold" id="expiringSoon">0</p>
                                <p class="text-orange-100 text-xs mt-2">รายการ</p>
                            </div>
                            <div class="text-5xl opacity-20">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 3: รอซ่อม -->
                    <div class="dashboard-card dashboard-card-red animate-slideUp" style="animation-delay: 0.2s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-red-100 text-sm mb-1">รอดำเนินการซ่อม</p>
                                <p class="text-3xl font-bold" id="pendingRepairs">0</p>
                                <p class="text-red-100 text-xs mt-2">รายการ</p>
                            </div>
                            <div class="text-5xl opacity-20">
                                <i class="fas fa-tools"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Card 4: ซ่อมเสร็จ -->
                    <div class="dashboard-card dashboard-card-green animate-slideUp" style="animation-delay: 0.3s">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-100 text-sm mb-1">ซ่อมเสร็จแล้ว</p>
                                <p class="text-3xl font-bold" id="completedRepairs">0</p>
                                <p class="text-green-100 text-xs mt-2">รายการ</p>
                            </div>
                            <div class="text-5xl opacity-20">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ✨ Charts Section (กราฟสวยงาม ไม่ยืด) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Chart 1: แนวโน้มการแจ้งซ่อม -->
                    <div class="bg-white rounded-xl shadow-lg p-6 animate-slideUp" style="animation-delay: 0.4s">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                                แนวโน้มการแจ้งซ่อม
                            </h3>
                            <span class="text-xs text-gray-500">7 วันล่าสุด</span>
                        </div>
                        <!-- ✅ กำหนดขนาดชัดเจน ไม่ยืด -->
                        <div class="chart-wrapper" style="position: relative; height: 300px; max-height: 300px;">
                            <canvas id="repairTrendChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Chart 2: สถานะการซ่อม (Doughnut) -->
                    <div class="bg-white rounded-xl shadow-lg p-6 animate-slideUp" style="animation-delay: 0.5s">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-chart-pie text-purple-600 mr-2"></i>
                                สถานะการซ่อม
                            </h3>
                            <span class="text-xs text-gray-500">สรุปภาพรวม</span>
                        </div>
                        <!-- ✅ กำหนดขนาดชัดเจน ไม่ยืด -->
                        <div class="chart-wrapper" style="position: relative; height: 300px; max-height: 300px;">
                            <canvas id="repairStatusChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions & Recent Activities -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-lg p-6 animate-slideUp" style="animation-delay: 0.6s">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-bolt text-yellow-500 mr-2"></i>
                            เมนูด่วน
                        </h3>
                        <div class="space-y-3">
                            <button class="w-full text-left p-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 group" onclick="loadEquipment()">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-box text-blue-600 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                                        <span class="font-medium text-gray-700">จัดการพัสดุ</span>
                                    </div>
                                    <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                                </div>
                            </button>
                            
                            <button class="w-full text-left p-4 rounded-lg border-2 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all duration-200 group" onclick="loadRepairs()">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-tools text-green-600 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                                        <span class="font-medium text-gray-700">แจ้งซ่อม</span>
                                    </div>
                                    <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all"></i>
                                </div>
                            </button>
                            
                            ${currentUser && (currentUser.permissions.includes('all') || currentUser.permissions.includes('reports')) ? `
                            <button class="w-full text-left p-4 rounded-lg border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 group" onclick="loadReports()">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-chart-bar text-purple-600 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                                        <span class="font-medium text-gray-700">ดูรายงาน</span>
                                    </div>
                                    <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"></i>
                                </div>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Recent Activities -->
                    <div class="bg-white rounded-xl shadow-lg p-6 animate-slideUp" style="animation-delay: 0.7s">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-history text-orange-600 mr-2"></i>
                            กิจกรรมล่าสุด
                        </h3>
                        <div class="space-y-3" id="recentActivities">
                            <div class="flex items-center p-3 text-gray-600">
                                <i class="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
                                <span class="text-sm">กำลังโหลดข้อมูล...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // โหลดข้อมูล Dashboard
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดแดชบอร์ด', 'error');
    }
}

// ============================================
// 📊 CHART FUNCTIONS - สร้างกราฟสวยงาม ไม่ยืด
// ============================================

/**
 * สร้างกราฟทั้งหมด
 */
function createCharts() {
    setTimeout(() => {
        try {
            console.log('🎨 กำลังสร้างกราฟ...');
            
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js ไม่ได้โหลด');
                return;
            }
            
            // สร้างกราฟทั้งสอง
            createRepairTrendChart();
            createRepairStatusChart();
            
            console.log('✅ สร้างกราฟสำเร็จ');
            
        } catch (error) {
            console.error('❌ Error in createCharts:', error);
        }
    }, 300);
}

/**
 * กราฟ 1: แนวโน้มการแจ้งซ่อม (Line Chart)
 */
function createRepairTrendChart() {
    const canvas = document.getElementById('repairTrendChart');
    if (!canvas) {
        console.log('⚠️ ไม่พบ canvas #repairTrendChart');
        return;
    }
    
    // ทำลายกราฟเก่า
    if (window.dashboardRepairChart) {
        window.dashboardRepairChart.destroy();
    }
    
    // ข้อมูลจำลอง 7 วันล่าสุด
    const mockData = {
        labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
        datasets: [{
            label: 'จำนวนการแจ้งซ่อม',
            data: [3, 5, 2, 8, 6, 4, 3],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#1d4ed8',
            pointHoverBorderColor: '#ffffff',
        }]
    };
    
    window.dashboardRepairChart = new Chart(canvas, {
        type: 'line',
        data: mockData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // ✅ ไม่ยืด
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#ffffff',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyColor: '#ffffff',
                    bodyFont: { size: 13 },
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'แจ้งซ่อม: ' + context.parsed.y + ' รายการ';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 },
                        stepSize: 2,
                        callback: function(value) {
                            return value + ' ';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

/**
 * กราฟ 2: สถานะการซ่อม (Doughnut Chart)
 */
function createRepairStatusChart() {
    const canvas = document.getElementById('repairStatusChart');
    if (!canvas) {
        console.log('⚠️ ไม่พบ canvas #repairStatusChart');
        return;
    }
    
    // ทำลายกราฟเก่า
    if (window.dashboardStatusChart) {
        window.dashboardStatusChart.destroy();
    }
    
    // ข้อมูลจำลอง
    const mockData = {
        labels: ['รอดำเนินการ', 'กำลังซ่อม', 'เสร็จสิ้น', 'ยกเลิก'],
        datasets: [{
            data: [8, 5, 12, 2],
            backgroundColor: [
                '#fbbf24', // เหลือง - รอดำเนินการ
                '#3b82f6', // น้ำเงิน - กำลังซ่อม
                '#10b981', // เขียว - เสร็จสิ้น
                '#ef4444'  // แดง - ยกเลิก
            ],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 10
        }]
    };
    
    window.dashboardStatusChart = new Chart(canvas, {
        type: 'doughnut',
        data: mockData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // ✅ ไม่ยืด
            cutout: '65%', // ทำให้กลางโปร่ง
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 13 },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#374151'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#ffffff',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyColor: '#ffffff',
                    bodyFont: { size: 13 },
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} รายการ (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


function createCostChart(chartData) {
    const ctx = document.getElementById('costChart');
    if (!ctx) {
        console.error('Canvas element "costChart" not found');
        return;
    }
    
    try {
        // ทำลายชาร์ตเก่าก่อน (ถ้ามี)
        if (window.costChart && typeof window.costChart.destroy === 'function') {
            window.costChart.destroy();
        }
        
        // ตรวจสอบข้อมูล
        if (!chartData || !chartData.labels || !chartData.values) {
            console.error('Invalid chart data:', chartData);
            return;
        }
        
        console.log('Creating cost chart with data:', chartData);
        
        // ตั้งค่าขนาด canvas
        ctx.style.height = '300px';
        ctx.height = 300;
        
        window.costChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'ค่าใช้จ่าย (บาท)',
                    data: chartData.values,
                    backgroundColor: [
                        '#ef4444', '#f97316', '#eab308', '#22c55e',
                        '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 60
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#6b7280',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'ค่าใช้จ่าย: ' + new Intl.NumberFormat('th-TH').format(context.parsed.y) + ' บาท';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 6,
                            callback: function(value) {
                                return new Intl.NumberFormat('th-TH').format(value) + ' ฿';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Cost chart created successfully');
        
    } catch (error) {
        console.error('Error creating cost chart:', error);
    }
}

function generateMockRepairTrendData() {
    try {
        const currentDate = new Date();
        const labels = [];
        const data = [];
        
        // สร้างข้อมูล 6 เดือนย้อนหลัง
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            const monthYear = date.toLocaleDateString('th-TH', { 
                month: 'short', 
                year: 'numeric' 
            });
            
            labels.push(monthYear);
            data.push(Math.floor(Math.random() * 20) + 5); // สุ่มจำนวน 5-24
        }
        
        console.log('Generated repair trend data - Labels:', labels, 'Values:', data);
        
        return {
            labels: labels,
            values: data
        };
    } catch (error) {
        console.error('Error generating mock repair trend data:', error);
        return {
            labels: ['ม.ค. 2568', 'ก.พ. 2568', 'มี.ค. 2568', 'เม.ย. 2568', 'พ.ค. 2568', 'มิ.ย. 2568'],
            values: [10, 15, 8, 12, 18, 14]
        };
    }
}

function generateMockCostData() {
    try {
        const currentDate = new Date();
        const labels = [];
        const data = [];
        
        // สร้างข้อมูล 6 เดือนย้อนหลัง
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            const monthYear = date.toLocaleDateString('th-TH', { 
                month: 'short', 
                year: 'numeric' 
            });
            
            labels.push(monthYear);
            data.push(Math.floor(Math.random() * 15000) + 3000); // สุ่มจำนวน 3000-17999
        }
        
        console.log('Generated cost data - Labels:', labels, 'Values:', data);
        
        return {
            labels: labels,
            values: data
        };
    } catch (error) {
        console.error('Error generating mock cost data:', error);
        return {
            labels: ['ม.ค. 2568', 'ก.พ. 2568', 'มี.ค. 2568', 'เม.ย. 2568', 'พ.ค. 2568', 'มิ.ย. 2568'],
            values: [8000, 12000, 6500, 10000, 15000, 11000]
        };
    }
}

// ============================================
// Navigation Functions - แก้ไขให้มี Global Functions
// ============================================

// เพิ่มฟังก์ชันเหล่านี้เป็น Global functions
window.loadEquipmentManagement = function() {
    if (!hasPermission('inventory') && !hasPermission('all')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavItem('equipmentBtn');
    currentView = 'equipment';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
                <i class="fas fa-boxes text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบจัดการพัสดุ</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบจัดการพัสดุครุภัณฑ์...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    // จำลองการโหลดข้อมูลพัสดุ
    setTimeout(() => {
        if (typeof initializeEquipmentSystem === 'function') {
            initializeEquipmentSystem();
        } else if (typeof window.loadEquipmentManagementImpl === 'function') {
            window.loadEquipmentManagementImpl();
        } else {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-blue-400 mb-4">
                        <i class="fas fa-boxes text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ระบบจัดการพัสดุ</h3>
                    <p class="text-gray-500 mb-6">ระบบจัดการพัสดุครุภัณฑ์พร้อมใช้งาน</p>
                    <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                        <p class="text-gray-600">ฟีเจอร์หลัก:</p>
                        <ul class="mt-4 text-left space-y-2">
                            <li>• เพิ่ม แก้ไข ลบ พัสดุครุภัณฑ์</li>
                            <li>• สร้างและพิมพ์บาร์โค้ด</li>
                            <li>• อัพโหลดรูปภาพพัสดุ</li>
                            <li>• แจ้งเตือนวันหมดประกัน</li>
                            <li>• ค้นหาและกรองข้อมูล</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }, 1000);
};

window.loadRepairManagement = function() {
    if (!hasPermission('repair') && !hasPermission('repair_view') && !hasPermission('all')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavItem('repairBtn');
    currentView = 'repair';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
                <i class="fas fa-tools text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบแจ้งซ่อม</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบจัดการการแจ้งซ่อม...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    // จำลองการโหลดข้อมูลการซ่อม
    setTimeout(() => {
        if (typeof window.loadRepairManagementImpl === 'function') {
            window.loadRepairManagementImpl();
        } else {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-green-400 mb-4">
                        <i class="fas fa-tools text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ระบบแจ้งซ่อม</h3>
                    <p class="text-gray-500 mb-6">ระบบจัดการการแจ้งซ่อมพร้อมใช้งาน</p>
                    <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                        <p class="text-gray-600">ฟีเจอร์หลัก:</p>
                        <ul class="mt-4 text-left space-y-2">
                            <li>• แจ้งซ่อมสำหรับ User และ Guest</li>
                            <li>• สแกนบาร์โค้ดเพื่อระบุพัสดุ</li>
                            <li>• อัพโหลดรูปภาพปัญหา</li>
                            <li>• ระบบ workflow สำหรับช่าง</li>
                            <li>• บันทึกค่าใช้จ่ายและรูปภาพหลังซ่อม</li>
                        </ul>
                        <div class="mt-6">
                            <button onclick="showGuestRepairModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-tools mr-2"></i>
                                แจ้งซ่อมด่วน
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1000);
};

window.loadReports = function() {
    if (!hasPermission('reports') && !hasPermission('all')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavItem('reportsBtn');
    currentView = 'reports';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
                <i class="fas fa-chart-bar text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบรายงาน</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบรายงานและสถิติ...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    // จำลองการโหลดข้อมูลรายงาน
    setTimeout(() => {
        if (typeof window.loadReportsImpl === 'function') {
            window.loadReportsImpl();
        } else {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-purple-400 mb-4">
                        <i class="fas fa-chart-bar text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ระบบรายงาน</h3>
                    <p class="text-gray-500 mb-6">ระบบรายงานและสถิติพร้อมใช้งาน</p>
                    <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                        <p class="text-gray-600">ประเภทรายงาน:</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <i class="fas fa-wrench text-blue-600 text-2xl mb-2"></i>
                                <h4 class="font-medium text-blue-800">รายงานการซ่อม</h4>
                                <p class="text-sm text-blue-600">สถิติและแนวโน้มการซ่อม</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <i class="fas fa-money-bill-wave text-green-600 text-2xl mb-2"></i>
                                <h4 class="font-medium text-green-800">รายงานค่าใช้จ่าย</h4>
                                <p class="text-sm text-green-600">การวิเคราะห์ค่าใช้จ่าย</p>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <i class="fas fa-boxes text-purple-600 text-2xl mb-2"></i>
                                <h4 class="font-medium text-purple-800">รายงานพัสดุ</h4>
                                <p class="text-sm text-purple-600">สถิติพัสดุครุภัณฑ์</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }, 1000);
};

// ============================================
// เมนูจัดการผู้ใช้งาน
// ============================================
window.loadUserManagement = function() {
    console.log('Loading User Management...');
    
    setActiveNavItem('usersBtn');
    currentView = 'users';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-purple-400 mb-4">
                <i class="fas fa-users text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบจัดการผู้ใช้งาน</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบจัดการผู้ใช้งาน...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        if (typeof showUsersManagement === 'function') {
            console.log('✓ Found showUsersManagement, loading...');
            showUsersManagement();
        } else {
            console.error('✗ js-user.js not loaded!');
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 mb-4">
                        <i class="fas fa-exclamation-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบไฟล์ js-user.js</h3>
                    <p class="text-gray-500 mb-6">กรุณาตรวจสอบว่าได้สร้างและโหลดไฟล์ js-user.js แล้ว</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                        <h4 class="font-semibold text-gray-800 mb-2">ตรวจสอบ:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>มีไฟล์ js-user.js.html ใน Apps Script หรือไม่?</li>
                            <li>ได้เพิ่ม &lt;?!= include('js-user'); ?&gt; ใน index.html หรือไม่?</li>
                            <li>กด Save และ Deploy ใหม่หรือยัง?</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 500);
};


// ⭐ เพิ่มโค้ดนี้ที่ส่วนท้ายของไฟล์ js.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔵 DOM Ready - scheduling navigation update...');
    
    // รอให้ currentUser load เสร็จ
    setTimeout(() => {
        if (currentUser && currentUser.role) {
            console.log('✅ currentUser found - updating navigation...');
            updateNavigationByRole();
        } else {
            console.warn('⚠️ currentUser not ready yet');
        }
    }, 1000);
});

// ⭐ หรือเรียกใช้ทันทีหลังจาก showApp()
const originalShowApp = window.showApp;
window.showApp = function() {
    if (originalShowApp) {
        originalShowApp();
    }
    console.log('🔵 showApp() executed - calling updateNavigationByRole...');
    setTimeout(() => {
        updateNavigationByRole();
    }, 100);
};

/**
 * ผูก Event Listeners เมื่อ DOM โหลดเสร็จ
 */
document.addEventListener('DOMContentLoaded', function() {
    setupGuestRepairModalEvents();
});

function setupGuestRepairModalEvents() {
    console.log('Setting up Guest Repair Modal events...');
    
    // ปุ่มเปิด Modal (อาจอยู่ที่หน้าแดชบอร์ด)
    const openModalBtn = document.querySelector('[onclick*="showGuestRepairModal"]');
    if (openModalBtn) {
        console.log('✓ Open modal button found');
    }
    
    // ปุ่มปิด Modal (X)
    const closeBtn = document.getElementById('closeGuestRepair');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideGuestRepairModal();
        });
        console.log('✓ Close button event attached');
    }
    
    // ปุ่มยกเลิก
    const cancelBtn = document.getElementById('cancelGuestRepair');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideGuestRepairModal();
        });
        console.log('✓ Cancel button event attached');
    }
    
    // คลิกนอก Modal เพื่อปิด (Optional)
    const modal = document.getElementById('guestRepairModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            // ปิดเฉพาะเมื่อคลิกที่ backdrop (ไม่ใช่ตัว modal content)
            if (e.target === modal) {
                hideGuestRepairModal();
            }
        });
        console.log('✓ Click outside to close enabled');
    }
    
    // กด ESC เพื่อปิด Modal (Optional)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('guestRepairModal');
            if (modal && !modal.classList.contains('hidden')) {
                hideGuestRepairModal();
            }
        }
    });
    console.log('✓ ESC key to close enabled');
    
    console.log('Guest Repair Modal events setup complete!');
}


// เพิ่ม Event Listener สำหรับ Auto-check
document.addEventListener('DOMContentLoaded', function() {
    const guestEquipmentInput = document.getElementById('guestEquipmentNumber');
    if (guestEquipmentInput) {
        let searchTimeout;
        guestEquipmentInput.addEventListener('input', function(e) {
            const value = e.target.value.trim();
            
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            if (!value) {
                updateGuestEquipmentStatus('empty');
                guestEquipmentFound = false;
                const submitBtn = document.querySelector('#guestRepairForm button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                }
                return;
            }
            
            updateGuestEquipmentStatus('checking');
            
            // Auto-search after 800ms delay
            searchTimeout = setTimeout(() => {
                validateGuestEquipment();
            }, 800);
        });
    }
});

// ============================================
// Guest Repair Image Upload Functions
// ============================================

/**
 * จัดการเมื่อเลือกรูปภาพ
 */
function handleGuestImageChange(input) {
    const file = input.files[0];
    
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'ประเภทไฟล์ไม่ถูกต้อง',
            text: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)',
            confirmButtonText: 'ตกลง'
        });
        input.value = ''; // ล้างการเลือกไฟล์
        return;
    }
    
    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        Swal.fire({
            icon: 'error',
            title: 'ไฟล์ใหญ่เกินไป',
            text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
            confirmButtonText: 'ตกลง'
        });
        input.value = ''; // ล้างการเลือกไฟล์
        return;
    }
    
    // แสดง Preview
    showGuestImagePreview(file);
}

/**
 * แสดง Preview รูปภาพ
 */
function showGuestImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewImg = document.getElementById('guestRepairImagePreviewImg');
        const previewDiv = document.getElementById('guestRepairImagePreview');
        const uploadArea = document.getElementById('guestRepairImageUploadArea');
        
        if (previewImg) {
            previewImg.src = e.target.result;
        }
        
        if (previewDiv) {
            previewDiv.classList.remove('hidden');
        }
        
        if (uploadArea) {
            uploadArea.classList.add('hidden');
        }
        
        console.log('Image preview shown successfully');
        
        // แสดงข้อความสำเร็จ
        showNotification('เลือกรูปภาพสำเร็จ', 'success');
    };
    
    reader.onerror = function(error) {
        console.error('FileReader error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอ่านไฟล์ได้',
            confirmButtonText: 'ตกลง'
        });
    };
    
    reader.readAsDataURL(file);
}

/**
 * ลบรูปภาพที่อัพโหลด
 */
function removeGuestImageUpload() {
    const imageInput = document.getElementById('guestProblemImage');
    const previewDiv = document.getElementById('guestRepairImagePreview');
    const uploadArea = document.getElementById('guestRepairImageUploadArea');
    const previewImg = document.getElementById('guestRepairImagePreviewImg');
    
    // ล้างค่า input
    if (imageInput) {
        imageInput.value = '';
    }
    
    // ซ่อน preview
    if (previewDiv) {
        previewDiv.classList.add('hidden');
    }
    
    // แสดง upload area
    if (uploadArea) {
        uploadArea.classList.remove('hidden');
    }
    
    // ล้างรูปภาพ
    if (previewImg) {
        previewImg.src = '';
    }
    
    console.log('Image removed');
    showNotification('ลบรูปภาพแล้ว', 'info');
}

/**
 * ล้างรูปภาพทั้งหมด (เรียกเมื่อปิด modal)
 */
function clearGuestRepairImagePreview() {
    const imageInput = document.getElementById('guestProblemImage');
    const previewDiv = document.getElementById('guestRepairImagePreview');
    const uploadArea = document.getElementById('guestRepairImageUploadArea');
    const previewImg = document.getElementById('guestRepairImagePreviewImg');
    
    if (imageInput) imageInput.value = '';
    if (previewDiv) previewDiv.classList.add('hidden');
    if (uploadArea) uploadArea.classList.remove('hidden');
    if (previewImg) previewImg.src = '';
}

/**
 * แปลงรูปภาพเป็น Base64
 */
async function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1]; // เอาแค่ base64 ออกมา
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// Update Submit Function to Handle Image
// ============================================

/**
 * ส่งคำร้องแจ้งซ่อม (รวมการอัพโหลดรูปภาพ)
 */
async function submitGuestRepair(event) {
    event.preventDefault();
    
    if (!guestEquipmentFound) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถส่งคำร้องได้',
            text: 'กรุณาตรวจสอบรหัสพัสดุให้ถูกต้องก่อน',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    
    // แสดง Loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังส่งคำร้อง...';
    
    try {
        // รวบรวมข้อมูล
        const repairData = {
            equipment_number: document.getElementById('guestEquipmentNumber').value.trim(),
            reporter_name: document.getElementById('guestReporterName').value.trim(),
            reporter_contact: document.getElementById('guestReporterContact').value.trim(),
            priority: document.getElementById('guestPriority').value,
            problem_description: document.getElementById('guestProblemDescription').value.trim()
        };
        
        // Validate ข้อมูลที่จำเป็น
        if (!repairData.equipment_number || !repairData.reporter_name || 
            !repairData.reporter_contact || !repairData.problem_description) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        
        // ตรวจสอบว่ามีรูปภาพหรือไม่
        const imageFile = document.getElementById('guestProblemImage').files[0];
        
        if (imageFile) {
            console.log('Uploading image:', imageFile.name);
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังอัพโหลดรูปภาพ...';
            
            try {
                // แปลงรูปภาพเป็น Base64
                const base64Image = await imageToBase64(imageFile);
                
                // อัพโหลดรูปภาพไปยัง Google Drive
                const uploadResult = await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .uploadImage(base64Image, `guest_repair_${Date.now()}.jpg`);
                });
                
                if (uploadResult.status === 'success') {
                    repairData.image_url = uploadResult.url;
                    console.log('Image uploaded successfully:', uploadResult.url);
                } else {
                    console.warn('Image upload failed, continuing without image');
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                // ถ้าอัพโหลดรูปไม่สำเร็จ ให้ส่งคำร้องต่อไปโดยไม่มีรูป
                Swal.fire({
                    icon: 'warning',
                    title: 'อัพโหลดรูปภาพไม่สำเร็จ',
                    text: 'ระบบจะส่งคำร้องโดยไม่มีรูปภาพ',
                    confirmButtonText: 'ตกลง',
                    timer: 3000
                });
            }
        }
        
        // ส่งคำร้องแจ้งซ่อม
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังบันทึกข้อมูล...';
        
        const result = await new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .submitRepairRequestWithSession(repairData, null);
        });
        
        // ซ่อน Loading
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        // แสดงผลลัพธ์
        if (result.status === 'success') {
            // ปิด Modal
            hideGuestRepairModal();
            
            // แสดงข้อความสำเร็จ
            Swal.fire({
                icon: 'success',
                title: 'ส่งคำร้องเรียบร้อย!',
                html: `
                    <div class="text-left space-y-3">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p class="font-semibold text-gray-800 mb-2">รายละเอียดการแจ้งซ่อม</p>
                            <p><strong>รหัสการแจ้งซ่อม:</strong> <code class="bg-gray-100 px-2 py-1 rounded">${result.repair.id.substring(0, 8)}</code></p>
                            <p><strong>รหัสพัสดุ:</strong> ${result.repair.equipment_number}</p>
                            <p><strong>ชื่อพัสดุ:</strong> ${result.repair.equipment_name || '-'}</p>
                            <p><strong>ผู้แจ้ง:</strong> ${result.repair.reporter_name}</p>
                        </div>
                        <hr>
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-info-circle text-blue-500 mr-1"></i>
                            เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง
                        </p>
                        <p class="text-xs text-gray-500">
                            💡 กรุณาเก็บรหัสการแจ้งซ่อมไว้เพื่อใช้ในการติดตามสถานะ
                        </p>
                    </div>
                `,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#10b981',
                width: '500px'
            });
            
            // Refresh dashboard ถ้ามี
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            
        } else if (result.status === 'error' && result.pending_repairs) {
            // กรณีมีงานซ่อมค้างอยู่
            Swal.fire({
                icon: 'warning',
                title: '⚠️ ไม่สามารถแจ้งซ่อมได้',
                html: `
                    <div class="text-left">
                        <p class="text-red-600 font-medium mb-3">${result.message}</p>
                        <p class="text-sm text-gray-600">
                            พัสดุนี้มีงานซ่อมค้างอยู่ ${result.pending_count} รายการ<br>
                            กรุณารอให้งานซ่อมเดิมเสร็จสิ้นก่อน หรือติดต่อช่างเพื่อเพิ่มรายละเอียด
                        </p>
                    </div>
                `,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#f59e0b'
            });
        } else {
            // กรณีอื่นๆ
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: result.message || 'ไม่สามารถส่งคำร้องได้',
                confirmButtonText: 'ตกลง'
            });
        }
        
    } catch (error) {
        console.error('Submit guest repair error:', error);
        
        // ซ่อน Loading
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถเชื่อมต่อกับระบบได้',
            confirmButtonText: 'ตกลง'
        });
    }
}

// ============================================
// Notification Helper (ถ้ายังไม่มี)
// ============================================

function showNotification(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        const icon = type === 'success' ? 'success' : 
                     type === 'error' ? 'error' : 
                     type === 'warning' ? 'warning' : 'info';
        
        Swal.fire({
            title: message,
            icon: icon,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initializeApp();
    
    // Navigation event listeners
    document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
    
    // Menu navigation
    document.getElementById('dashboardBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadDashboard();
        closeSidebar();
    });

    document.getElementById('analyticsBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadAnalyticsDashboard();
        closeSidebar();
    });

    document.getElementById('sparePartsBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = document.getElementById('sparePartsSubmenu');
        const chevron = document.getElementById('sparePartsChevron');
        
        if (submenu) {
            submenu.classList.toggle('hidden');
            if (chevron) {
                chevron.classList.toggle('rotate-180');
            }
        }
    });
    
    document.getElementById('equipmentBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadEquipmentManagement();
        closeSidebar();
    });
    
    document.getElementById('repairBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Toggle submenu
        const repairSubmenu = document.getElementById('repairSubmenu');
        const repairChevron = document.getElementById('repairChevron');
        
        if (repairSubmenu) {
            repairSubmenu.classList.toggle('hidden');
            if (repairChevron) {
                repairChevron.style.transform = repairSubmenu.classList.contains('hidden') 
                    ? 'rotate(0deg)' 
                    : 'rotate(180deg)';
            }
        }
    });

    // 👇 เพิ่มโค้ดนี้
// เมนูยืม-คืนพัสดุ (User)
document.getElementById('borrowBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadBorrowUser();
    closeSidebar();
});

    // 👇 เพิ่มโค้ดนี้
document.getElementById('technicianBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadTechnicianManagement();
    closeSidebar();
});

document.getElementById('borrowAdminBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadBorrowAdmin();
    closeSidebar();
});

document.getElementById('depreciationBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadDepreciation();
    closeSidebar();
});
    
    document.getElementById('reportsBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadReports();
        closeSidebar();
    });
    
    document.getElementById('usersBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadUserManagement();
        closeSidebar();
    });
    
 document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadSettings();  // ⭐ ฟังก์ชันนี้จะมาจาก js-settings.js
    closeSidebar();
});
    
    // User menu
    document.getElementById('userMenuBtn')?.addEventListener('click', function() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');
    });
    
    // Close user dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const userMenu = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userDropdown');
        
        if (!userMenu.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Guest repair modal
    document.getElementById('guestReportBtn')?.addEventListener('click', showGuestRepairModal);
    document.getElementById('closeGuestRepair')?.addEventListener('click', hideGuestRepairModal);
    document.getElementById('cancelGuestRepair')?.addEventListener('click', hideGuestRepairModal);
    
    // Guest repair form
    document.getElementById('guestRepairForm')?.addEventListener('submit', handleGuestRepairSubmit);
    
    // Guest repair - quick other item button
    document.getElementById('guestQuickOtherEquipmentBtn')?.addEventListener('click', showGuestQuickOtherItemModal);
    
    // Scanner button
    document.getElementById('scanEquipmentBtn')?.addEventListener('click', startBarcodeScanner);
    document.getElementById('guestScanEquipmentBtn')?.addEventListener('click', startBarcodeScanner);
});

// ============================================
// App Initialization
// ============================================

async function initializeApp() {
    try {
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
        
        // Check if user is logged in
        const savedSessionId = localStorage.getItem('sessionId');
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedSessionId && savedUser) {
            sessionId = savedSessionId;
            currentUser = JSON.parse(savedUser);
            
            // Set window variables for cross-module access
            window.sessionId = sessionId;
            window.currentUser = currentUser;
            
            // Validate session
            google.script.run
                .withSuccessHandler(onSessionValidated)
                .withFailureHandler(onSessionError)
                .validateSession(sessionId);
        } else {
            showLoginModal();
        }
        
    } catch (error) {
        console.error('App initialization error:', error);
        showLoginModal();
    }
}

async function onSessionValidated(result) {
    if (result.status === 'valid') {
        // Set window variables for cross-module access
        window.sessionId = sessionId;
        window.currentUser = currentUser;
        
        // ⭐ โหลดชื่อระบบจาก Config (เพิ่มใหม่)
        loadAppName();
        
        // ⭐ โหลด logo และ config อื่นๆ
        await loadSystemConfig();
        
        showApp();
        loadDashboard();
    } else {
        logout();
    }
}

function onSessionError(error) {
    console.error('Session validation error:', error);
    logout();
}

function loadAppName() {
    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success' && result.config.app_name) {
                // อัพเดทชื่อระบบในหัวเรื่อง (Header)
                const titleElement = document.querySelector('header h1');
                if (titleElement) {
                    titleElement.textContent = result.config.app_name;
                }
                
                // อัพเดท Title ของเบราว์เซอร์
                document.title = result.config.app_name;
                
                // อัพเดทชื่อใน Login Modal (ถ้ามี)
                const loginTitle = document.querySelector('#loginModal h2');
                if (loginTitle) {
                    loginTitle.textContent = result.config.app_name;
                }
            }
        })
        .withFailureHandler(function(error) {
            console.error('Load app name error:', error);
            // ไม่ต้องแสดง notification เพราะไม่ใช่ error ที่ critical
        })
        .getConfig(sessionId);
}

function showApp() {
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('loginModal').classList.add('hidden');
    
    // Update user display
    if (currentUser) {
        const userDisplayNameEl = document.getElementById('userDisplayName');
        if (userDisplayNameEl) {
            userDisplayNameEl.textContent = currentUser.name || currentUser.username;
        }
    }
    
    // ⭐ เรียกใช้ฟังก์ชั่นอัพเดทเมนูตามบทบาท
    console.log('🔵 showApp() called - updating navigation...');
    updateNavigationByRole();
}

// ✅ อัพเดทเมนูตามรอล
// Admin: เห็นทั้งหมด
// Technician: ซ่อน อนุมัติคำขอเบิกอะไหล่, ทะเบียนพัสดุ, จัดการยืม-คืน, จัดการผู้ใช้, ตั้งค่าระบบ
// User: ซ่อน ข้อมูลพัสดุฯ, บันทึกอะไหล่, อนุมัติคำขอเบิกอะไหล่, ทะเบียนพัสดุ, จัดการงานซ่อม, จัดการยืม-คืน, รายงาน, จัดการผู้ใช้, ตั้งค่าระบบ
function updateNavigationByRole() {
    if (!currentUser) {
        console.warn('❌ currentUser is not set');
        return;
    }
    
    const role = currentUser.role; // 'admin', 'technician', 'user'
    console.log('📋 updateNavigationByRole - role:', role);
    console.log('📋 currentUser:', currentUser);
    
    // Helper function สำหรับแสดง/ซ่อนเมนู
    const showMenu = (element) => {
        if (element) {
            element.style.display = 'flex';
            element.style.visibility = 'visible';
            element.classList.remove('hidden');
        }
    };
    
    const hideMenu = (element) => {
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
        }
    };
    
    // ============================================
    // เมนู "ข้อมูลพัสดุฯ" (sparePartsGroup) - Admin + Technician เท่านั้น
    // ============================================
    const sparePartsGroup = document.getElementById('sparePartsGroup');
    if (sparePartsGroup) {
        if (role === 'admin' || role === 'technician') {
            sparePartsGroup.style.display = 'block';
            sparePartsGroup.classList.remove('hidden');
            console.log('✓ Spare Parts Group: VISIBLE (Admin/Technician)');
        } else {
            sparePartsGroup.style.display = 'none';
            sparePartsGroup.classList.add('hidden');
            console.log('⭕ Spare Parts Group: HIDDEN (User)');
        }
    }
    
    // ============================================
    // เมนู "บันทึกอะไหล่" - Admin + Technician เท่านั้น
    // ============================================
    const sparePartsRecordMenu = document.getElementById('sparePartsRecordMenu');
    if (sparePartsRecordMenu) {
        if (role === 'admin' || role === 'technician') {
            showMenu(sparePartsRecordMenu);
            console.log('✓ Spare Parts Record: VISIBLE (Admin/Technician)');
        } else {
            hideMenu(sparePartsRecordMenu);
            console.log('⭕ Spare Parts Record: HIDDEN (User)');
        }
    }
    
    // ============================================
    // เมนู "อนุมัติคำขอเบิกอะไหล่" - ADMIN ONLY
    // ============================================
    const sparePartsApprovalBtn = document.getElementById('sparePartsApprovalBtn');
    if (sparePartsApprovalBtn) {
        if (role === 'admin') {
            showMenu(sparePartsApprovalBtn);
            sparePartsApprovalBtn.style.height = 'auto';
            sparePartsApprovalBtn.style.opacity = '1';
            console.log('✓ Spare Parts Approval: VISIBLE (Admin only)');
        } else {
            hideMenu(sparePartsApprovalBtn);
            console.log('⭕ Spare Parts Approval: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // เมนู "ทะเบียนพัสดุ" - ADMIN ONLY
    // ============================================
    const equipmentBtn = document.getElementById('equipmentBtn');
    if (equipmentBtn) {
        if (role === 'admin') {
            showMenu(equipmentBtn);
            console.log('✓ Equipment: VISIBLE (Admin only)');
        } else {
            hideMenu(equipmentBtn);
            console.log('⭕ Equipment: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // เมนู "แจ้งซ่อม" - ทุก Role เห็น
    // ============================================
    const repairBtn = document.getElementById('repairBtn');
    if (repairBtn) {
        repairBtn.style.display = 'flex';
        repairBtn.style.visibility = 'visible';
        repairBtn.classList.remove('hidden');
        console.log('✓ Repair: VISIBLE (All roles)');
    }
    
    // ============================================
    // เมนู "ยืม-คืนพัสดุ" - ทุก Role เห็น
    // ============================================
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
        showMenu(borrowBtn);
        console.log('✓ Borrow: VISIBLE (All roles)');
    }
    
    // ============================================
    // หัวข้อ "เมนูเจ้าหน้าที่" - ซ่อนสำหรับ User
    // ============================================
    const staffMenuSection = document.getElementById('staffMenuSection');
    if (staffMenuSection) {
        if (role === 'user') {
            staffMenuSection.style.display = 'none';
            console.log('⭕ Staff Menu Section: HIDDEN (User)');
        } else {
            staffMenuSection.style.display = 'block';
            console.log('✓ Staff Menu Section: VISIBLE (Admin/Technician)');
        }
    }
    
    // ============================================
    // เมนู "จัดการงานซ่อม" - Admin + Technician
    // ============================================
    const technicianBtn = document.getElementById('technicianBtn');
    if (technicianBtn) {
        if (role === 'admin' || role === 'technician') {
            showMenu(technicianBtn);
            console.log('✓ Technician: VISIBLE (Admin/Technician)');
        } else {
            hideMenu(technicianBtn);
            console.log('⭕ Technician: HIDDEN (User)');
        }
    }
    
    // ============================================
    // เมนู "จัดการยืม-คืน" - ADMIN ONLY
    // ============================================
    const borrowAdminBtn = document.getElementById('borrowAdminBtn');
    if (borrowAdminBtn) {
        if (role === 'admin') {
            showMenu(borrowAdminBtn);
            console.log('✓ Borrow Admin: VISIBLE (Admin only)');
        } else {
            hideMenu(borrowAdminBtn);
            console.log('⭕ Borrow Admin: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // เมนู "รายงาน" - Admin + Technician
    // ============================================
    const reportsBtn = document.getElementById('reportsBtn');
    if (reportsBtn) {
        if (role === 'admin' || role === 'technician') {
            showMenu(reportsBtn);
            console.log('✓ Reports: VISIBLE (Admin/Technician)');
        } else {
            hideMenu(reportsBtn);
            console.log('⭕ Reports: HIDDEN (User)');
        }
    }
    
    // ============================================
    // เมนู "จัดการผู้ใช้" - ADMIN ONLY
    // ============================================
    const usersBtn = document.getElementById('usersBtn');
    if (usersBtn) {
        if (role === 'admin') {
            showMenu(usersBtn);
            console.log('✓ Users: VISIBLE (Admin only)');
        } else {
            hideMenu(usersBtn);
            console.log('⭕ Users: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // เมนู "ตั้งค่าระบบ" - ADMIN ONLY
    // ============================================
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        if (role === 'admin') {
            showMenu(settingsBtn);
            console.log('✓ Settings: VISIBLE (Admin only)');
        } else {
            hideMenu(settingsBtn);
            console.log('⭕ Settings: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // ซ่อนหัวข้อ "การจัดการ" ถ้าไม่ใช่ Admin
    // ============================================
    const managementSection = document.getElementById('managementSection');
    if (managementSection) {
        if (role === 'admin') {
            managementSection.style.display = 'block';
            console.log('✓ Management Section Header: VISIBLE (Admin only)');
        } else {
            managementSection.style.display = 'none';
            console.log('⭕ Management Section Header: HIDDEN (Technician/User)');
        }
    }
    
    // ============================================
    // สรุปผล
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Navigation Update Summary:');
    console.log('  👤 Role:', role.toUpperCase());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  เมนูหลัก:');
    console.log('    ✅ หน้าแรก (ทั้งหมด)');
    console.log('    ' + (role === 'admin' || role === 'technician' ? '✅' : '⭕') + ' ข้อมูลพัสดุฯ');
    console.log('    ' + (role === 'admin' || role === 'technician' ? '✅' : '⭕') + ' บันทึกอะไหล่');
    console.log('    ' + (role === 'admin' ? '✅' : '⭕') + ' อนุมัติคำขอเบิกอะไหล่');
    console.log('    ' + (role === 'admin' ? '✅' : '⭕') + ' ทะเบียนพัสดุ');
    console.log('    ' + (role === 'admin' || role === 'technician' ? '✅' : '⭕') + ' คำนวณค่าเสื่อม');
    console.log('    ✅ แจ้งซ่อม (ทั้งหมด)');
    console.log('    ✅ ยืม-คืนพัสดุ (ทั้งหมด)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  เมนูเจ้าหน้าที่: ' + (role === 'user' ? '⭕ ซ่อนหมด' : '✅ แสดง'));
    if (role !== 'user') {
        console.log('    ' + (role === 'admin' || role === 'technician' ? '✅' : '⭕') + ' จัดการงานซ่อม');
        console.log('    ' + (role === 'admin' ? '✅' : '⭕') + ' จัดการยืม-คืน');
        console.log('    ' + (role === 'admin' || role === 'technician' ? '✅' : '⭕') + ' รายงาน');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  การจัดการ: ' + (role === 'admin' ? '✅ แสดง' : '⭕ ซ่อนหมด'));
    if (role === 'admin') {
        console.log('    ✅ จัดการผู้ใช้');
        console.log('    ✅ ตั้งค่าระบบ');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
// ============================================
// Event Listener สำหรับ Admin Navigation
// ============================================
document.getElementById('sparePartsApprovalBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('🔵 Spare Parts Approval clicked!');
    
    if (currentUser?.role === 'admin') {
        showSparePartsTab('requests');
        closeSidebar();
    } else {
        showNotification('⚠️ เฉพาะ Admin เท่านั้น', 'warning');
    }
});

function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    
    // โหลด config เพื่ออัพเดท login UI
    loadSystemConfig();
}

/**
 * เปิด Modal แจ้งซ่อมพัสดุ
 */
function showGuestRepairModal() {
    const modal = document.getElementById('guestRepairModal');
    if (!modal) {
        console.error('Guest Repair Modal not found');
        return;
    }
    
    // รีเซ็ตฟอร์มก่อนเปิด Modal
    resetGuestRepairForm();
    
    // เปิด Modal
    modal.classList.remove('hidden');
    
    console.log('Guest Repair Modal opened');
}


/**
 * ปิด Modal แจ้งซ่อมพัสดุ + รีเซ็ตฟอร์มทั้งหมด
 */
function hideGuestRepairModal() {
    const modal = document.getElementById('guestRepairModal');
    if (!modal) {
        console.error('Guest Repair Modal not found');
        return;
    }
    
    // ปิด Modal
    modal.classList.add('hidden');
    
    // รีเซ็ตฟอร์มทั้งหมด
    resetGuestRepairForm();
    
    console.log('Guest Repair Modal closed and form reset');
}

/**
 * ฟังก์ชันรีเซ็ตฟอร์มทั้งหมด
 */
function resetGuestRepairForm() {
    console.log('Resetting Guest Repair Form...');
    
    // 1. รีเซ็ตฟอร์ม
    const form = document.getElementById('guestRepairForm');
    if (form) {
        form.reset();
        console.log('✓ Form reset');
    }
    
    // 2. ล้างค่า input ทั้งหมดด้วยตนเอง (เผื่อ reset() ไม่ครบ)
    const equipmentInput = document.getElementById('guestEquipmentNumber');
    const reporterName = document.getElementById('guestReporterName');
    const reporterContact = document.getElementById('guestReporterContact');
    const priority = document.getElementById('guestPriority');
    const problemDesc = document.getElementById('guestProblemDescription');
    
    if (equipmentInput) equipmentInput.value = '';
    if (reporterName) reporterName.value = '';
    if (reporterContact) reporterContact.value = '';
    if (priority) priority.value = 'normal';
    if (problemDesc) problemDesc.value = '';
    
    // 3. รีเซ็ตสถานะตรวจสอบพัสดุ
    guestEquipmentFound = false;
    updateGuestEquipmentStatus('empty');
    console.log('✓ Equipment status reset');
    
    // 4. ล้างข้อมูลพัสดุที่แสดง
    const equipmentInfo = document.getElementById('guestEquipmentInfo');
    if (equipmentInfo) {
        equipmentInfo.innerHTML = '';
        console.log('✓ Equipment info cleared');
    }
    
    // 5. ลบรูปภาพ preview
    clearGuestRepairImagePreview();
    console.log('✓ Image preview cleared');
    
    // 6. ปิดการใช้งานปุ่ม Submit (จนกว่าจะตรวจสอบพัสดุ)
    const submitBtn = document.querySelector('#guestRepairForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>ส่งคำร้องแจ้งซ่อม';
        console.log('✓ Submit button disabled');
    }
    
    // 7. ลบ border สีแดงจาก validation (ถ้ามี)
    const inputs = form ? form.querySelectorAll('input, textarea, select') : [];
    inputs.forEach(input => {
        input.classList.remove('border-red-500', 'border-red-300');
        input.classList.add('border-gray-300');
    });
    console.log('✓ Validation styles cleared');
    
    console.log('Guest Repair Form reset complete! ✓');
}

function validateGuestEquipment() {
    const equipmentNumber = document.getElementById('guestEquipmentNumber').value.trim();
    
    if (!equipmentNumber) {
        updateGuestEquipmentStatus('empty');
        guestEquipmentFound = false;
        const submitBtn = document.querySelector('#guestRepairForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    updateGuestEquipmentStatus('checking');
    
    // Guest ไม่มีการแก้ไข ดังนั้นส่ง null เป็น currentRepairId
    google.script.run
        .withSuccessHandler(onGuestEquipmentValidated)
        .withFailureHandler(onGuestEquipmentSearchError)
        .validateEquipmentForRepair(equipmentNumber, null);
}

function handleGuestEquipmentInput(e) {
    const value = e.target.value.trim();
    
    // Clear timeout เดิม
    if (guestSearchTimeout) {
        clearTimeout(guestSearchTimeout);
    }
    
    // Reset สถานะ
    guestEquipmentFound = false;
    updateGuestEquipmentStatus('checking');
    
    // ถ้าว่างเปล่า
    if (!value) {
        updateGuestEquipmentStatus('empty');
        return;
    }
    
    // ตั้งเวลารอ 800ms หลังจากพิมพ์เสร็จ แล้วค่อยตรวจสอบ
    guestSearchTimeout = setTimeout(() => {
        autoSearchGuestEquipment(value);
    }, 800);
}

function onGuestEquipmentValidated(result) {
    const infoElement = document.getElementById('guestEquipmentInfo');
    const submitBtn = document.querySelector('#guestRepairForm button[type="submit"]');
    
    if (!result || result.status === 'error') {
        guestEquipmentFound = false;
        
        // ✅ ตรวจสอบว่าเป็น error ประเภท retired หรือไม่
        if (result.error_type === 'retired') {
            updateGuestEquipmentStatus('retired');
            
            if (infoElement) {
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
            }
        } else {
            updateGuestEquipmentStatus('error');
            
            if (infoElement) {
                infoElement.innerHTML = `
                    <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        <i class="fas fa-exclamation-circle mr-2 mt-1"></i>
                        <div class="flex-1">
                            <div class="font-medium">✗ ไม่พบพัสดุในระบบ</div>
                            <div class="text-xs text-gray-700 mt-1">
                                กรุณาตรวจสอบรหัสพัสดุให้ถูกต้อง หรือติดต่อเจ้าหน้าที่
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    // ✅ ตรวจสอบว่ามีงานซ่อมค้างอยู่หรือไม่
    if (result.has_pending) {
        guestEquipmentFound = false;
        updateGuestEquipmentStatus('has_pending');
        
        const eq = result.equipment;
        const pendingRepairs = result.pending_repairs || [];
        
        // สร้าง HTML สำหรับแสดงรายการซ่อมค้างอยู่
        let repairsListHTML = '<div class="space-y-2 max-h-48 overflow-y-auto">';
        pendingRepairs.forEach((repair, index) => {
            const statusText = repair.status === 'pending' ? 'รอดำเนินการ' : 'กำลังซ่อม';
            const statusColor = repair.status === 'pending' ? 'yellow' : 'blue';
            const createdDate = repair.created_at ? new Date(repair.created_at).toLocaleDateString('th-TH', {
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
                        <span class="text-sm font-semibold text-gray-900">งานซ่อม #${index + 1}</span>
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
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }
    
    // ✅ พบพัสดุและไม่มีงานซ่อมค้าง
    const eq = result.equipment;
    guestEquipmentFound = true;
    updateGuestEquipmentStatus('found');
    
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
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}


function onGuestEquipmentSearchSuccess(result) {
    const infoElement = document.getElementById('guestEquipmentInfo');
    
    if (result.status === 'success' && result.equipment) {
        guestEquipmentFound = true;
        const eq = result.equipment;
        
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="flex items-start text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <i class="fas fa-check-circle mr-2 mt-1 flex-shrink-0"></i>
                    <div class="flex-1">
                        <div class="font-medium">✓ พบพัสดุในระบบ</div>
                        <div class="text-xs text-gray-700 mt-1">
                            <strong>${eq.name}</strong>
                            ${eq.type ? `<span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">${eq.type}</span>` : ''}
                        </div>
                        ${eq.location ? `<div class="text-xs text-gray-600 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>${eq.location}</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // เปิดใช้งานปุ่มส่งคำร้อง
        const form = document.getElementById('guestRepairForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        
    } else {
        guestEquipmentFound = false;
        
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="flex items-start text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <i class="fas fa-exclamation-circle mr-2 mt-1 flex-shrink-0"></i>
                    <div class="flex-1">
                        <div class="font-medium">✗ ไม่พบพัสดุในระบบ</div>
                        <div class="text-xs text-gray-700 mt-1">
                            กรุณาตรวจสอบรหัสพัสดุให้ถูกต้อง หรือติดต่อเจ้าหน้าที่
                        </div>
                    </div>
                </div>
            `;
        }
        
        // ปิดการใช้งานปุ่มส่งคำร้อง
        const form = document.getElementById('guestRepairForm');
        const submitBtn = form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function onGuestEquipmentSearchError(error) {
    console.error('Guest equipment search error:', error);
    guestEquipmentFound = false;
    updateGuestEquipmentStatus('error');
    
    const submitBtn = document.querySelector('#guestRepairForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    showNotification('เกิดข้อผิดพลาดในการตรวจสอบพัสดุ', 'error');
}



/**
 * อัพเดทสถานะการตรวจสอบพัสดุ
 */
function updateGuestEquipmentStatus(status) {
    const statusElement = document.getElementById('guestEquipmentStatus');
    if (!statusElement) return;
    
    const statusConfig = {
        empty: {
            icon: 'fa-info-circle',
            color: 'text-gray-500',
            message: 'กรุณากรอกรหัสพัสดุ'
        },
        checking: {
            icon: 'fa-spinner fa-spin',
            color: 'text-blue-600',
            message: 'กำลังตรวจสอบ...'
        },
        found: {
            icon: 'fa-check-circle',
            color: 'text-green-600',
            message: '✓ พบพัสดุในระบบ'
        },
        not_found: {
            icon: 'fa-times-circle',
            color: 'text-red-600',
            message: '✗ ไม่พบพัสดุ'
        },
        has_pending: {
            icon: 'fa-exclamation-triangle',
            color: 'text-orange-600',
            message: '⚠️ มีงานซ่อมค้างอยู่'
        },
        // ✅ เพิ่ม case สำหรับสถานะ retired
        retired: {
            icon: 'fa-ban',
            color: 'text-red-600',
            message: '✗ สถานะจำหน่าย'
        },
        error: {
            icon: 'fa-exclamation-circle',
            color: 'text-red-600',
            message: 'เกิดข้อผิดพลาด'
        }
    };
    
    const config = statusConfig[status] || statusConfig.empty;
    statusElement.innerHTML = `
        <i class="fas ${config.icon} ${config.color} mr-2"></i>
        <span class="${config.color}">${config.message}</span>
    `;
}

function autoSearchGuestEquipment(equipmentNumber) {
    if (!equipmentNumber || equipmentNumber.trim() === '') {
        updateGuestEquipmentStatus('empty');
        guestEquipmentFound = false;
        return;
    }
    
    updateGuestEquipmentStatus('checking');
    
    // Guest ไม่มีการแก้ไข ดังนั้นส่ง null เป็น currentRepairId
    google.script.run
        .withSuccessHandler(onGuestEquipmentValidated)
        .withFailureHandler(onGuestEquipmentSearchError)
        .validateEquipmentForRepair(equipmentNumber, null);
}

// ============================================
// Guest Quick Other Item Modal
// ============================================

function showGuestQuickOtherItemModal() {
    const commonOtherItems = [
        'ไฟสำนัก', 'หลอดไฟ', 'พัดลม', 'สวิตช์ไฟ', 
        'ปลั๊กไฟ', 'สายไฟ', 'หม้อแปลง', 'เข็มขัดไฟ', 'อื่น ๆ'
    ];
    
    let buttonsHTML = commonOtherItems.map(item => `
        <button type="button" class="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition text-sm whitespace-nowrap border border-orange-300 hover:border-orange-500" data-guest-item="${item}">
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
                        <input type="text" id="guestQuickOtherInput" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="เช่น เข็มขัดไฟ, หม้อแปลง ฯลฯ" />
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#f97316',
            width: '450px',
            didOpen: () => {
                // Event listener สำหรับปุ่มรายการ
                document.querySelectorAll('[data-guest-item]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const input = document.getElementById('guestQuickOtherInput');
                        if (input) {
                            input.value = btn.getAttribute('data-guest-item');
                            input.focus();
                            btn.classList.add('ring-2', 'ring-orange-500', 'bg-orange-300');
                        }
                    });
                });
                
                const guestQuickInput = document.getElementById('guestQuickOtherInput');
                if (guestQuickInput) {
                    guestQuickInput.focus();
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const input = document.getElementById('guestQuickOtherInput');
                const selectedItem = input?.value.trim();
                
                if (!selectedItem) {
                    safeShowNotification('กรุณาเลือกหรือกรอกรายการ', 'warning');
                    return;
                }
                
                setGuestOtherEquipmentItem(selectedItem);
            }
        });
    }
}

function setGuestOtherEquipmentItem(itemName) {
    const equipmentInput = document.getElementById('guestEquipmentNumber');
    if (equipmentInput) {
        equipmentInput.value = itemName;
    }
    
    const infoElement = document.getElementById('guestEquipmentInfo');
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
                            <button type="button" class="text-blue-600 hover:text-blue-800 underline" id="guestChangeOtherItemBtn">เปลี่ยนรายการ</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const changeBtn = document.getElementById('guestChangeOtherItemBtn');
            if (changeBtn) {
                changeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showGuestQuickOtherItemModal();
                });
            }
        }, 100);
    }
}

async function handleGuestRepairSubmit(e) {
    e.preventDefault();
    
    // *** เพิ่มการตรวจสอบก่อน submit ***
    if (!guestEquipmentFound) {
        Swal.fire({
            title: 'ไม่สามารถส่งคำร้องได้',
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
                    </div>
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#ef4444'
        });
        return;
    }
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        showLoading(submitBtn);
        
        const repairData = {
            equipment_number: document.getElementById('guestEquipmentNumber').value,
            reporter_name: document.getElementById('guestReporterName').value,
            reporter_contact: document.getElementById('guestReporterContact').value,
            priority: document.getElementById('guestPriority').value,
            problem_description: document.getElementById('guestProblemDescription').value
        };
        
        // Handle image upload if any
        const imageFile = document.getElementById('guestProblemImage').files[0];
        if (imageFile) {
            const base64 = await imageToBase64(imageFile);
            
            // Upload image first
            const uploadResult = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .uploadImage(base64, `guest_repair_${Date.now()}.jpg`);
            });
            
            if (uploadResult.status === 'success') {
                repairData.image_url = uploadResult.url;
            }
        }
        
        google.script.run
            .withSuccessHandler(onGuestRepairSuccess)
            .withFailureHandler(onGuestRepairError)
            .submitRepairRequestWithSession(repairData, null);
            
    } catch (error) {
        console.error('Guest repair submit error:', error);
        showNotification('เกิดข้อผิดพลาดในการส่งคำร้อง', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

/**
 * Callback เมื่อส่งคำร้องสำเร็จ
 */
function onGuestRepairSuccess(result) {
    console.log('Guest repair success:', result);
    
    if (result.status === 'success') {
        // ปิด Modal
        hideGuestRepairModal();
        
        // แสดงข้อความสำเร็จด้วย SweetAlert2
        Swal.fire({
            icon: 'success',
            title: 'ส่งคำร้องเรียบร้อย!',
            html: `
                <div class="text-left">
                    <p class="mb-2">ระบบได้รับคำร้องแจ้งซ่อมของคุณเรียบร้อยแล้ว</p>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm text-gray-600">รหัสพัสดุ: <strong>${result.repair?.equipment_number || '-'}</strong></p>
                        <p class="text-sm text-gray-600">ผู้แจ้ง: <strong>${result.repair?.reporter_name || '-'}</strong></p>
                    </div>
                </div>
            `,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        
        showNotification('ส่งคำร้องแจ้งซ่อมเรียบร้อย', 'success');
    } else {
        showNotification(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
}

/**
 * Callback เมื่อส่งคำร้องล้มเหลว
 */
function onGuestRepairError(error) {
    console.error('Guest repair error:', error);
    showNotification('เกิดข้อผิดพลาดในการส่งคำร้อง กรุณาลองใหม่อีกครั้ง', 'error');
    
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งคำร้องแจ้งซ่อมได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#ef4444'
    });
}


/**
 * ลบรูปภาพ preview (เรียกจาก resetGuestRepairForm)
 */
function clearGuestRepairImagePreview() {
    const imageInput = document.getElementById('guestProblemImage');
    const previewDiv = document.getElementById('guestRepairImagePreview');
    const uploadArea = document.getElementById('guestRepairImageUploadArea');
    const previewImg = document.getElementById('guestRepairImagePreviewImg');
    
    // ล้างค่า input
    if (imageInput) {
        imageInput.value = '';
    }
    
    // ซ่อน preview
    if (previewDiv) {
        previewDiv.classList.add('hidden');
    }
    
    // แสดง upload area
    if (uploadArea) {
        uploadArea.classList.remove('hidden');
    }
    
    // ล้างรูปภาพ
    if (previewImg) {
        previewImg.src = '';
    }
}

// ============================================
// Barcode Scanner
// ============================================



function startBarcodeScanner() {
    Swal.fire({
        title: 'สแกนบาร์โค้ด',
        html: '<div id="qr-reader" style="width: 100%; min-height: 300px;"></div>',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        showConfirmButton: false,
        width: '600px',
        didOpen: () => {
            // ตรวจสอบว่ามี Html5Qrcode library หรือไม่
            if (typeof Html5Qrcode === 'undefined') {
                Swal.close();
                showNotification('ระบบสแกนบาร์โค้ดไม่พร้อมใช้งาน', 'error');
                return;
            }

            const html5QrCode = new Html5Qrcode("qr-reader");
            
            html5QrCode.start(
                { facingMode: "environment" }, // ใช้กล้องหลัง
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    // ✅ หยุดสแกนทันที
                    html5QrCode.stop().then(() => {
                        // ปิด SweetAlert
                        Swal.close();
                        
                        // ✅ ใส่ค่าลง input
                        const equipmentInput = document.getElementById('guestEquipmentNumber');
                        if (equipmentInput) {
                            equipmentInput.value = decodedText;
                            
                            // ✅ เรียกใช้ฟังก์ชันค้นหาอัตโนมัติ (เหมือนตอนพิมพ์เอง)
                            autoSearchGuestEquipment(decodedText);
                        }
                        
                        // แสดงข้อความสำเร็จ
                        showNotification('สแกนบาร์โค้ดเรียบร้อย กำลังค้นหาพัสดุ...', 'success');
                        
                        console.log('Barcode scanned:', decodedText);
                    }).catch(err => {
                        console.error('Error stopping scanner:', err);
                    });
                },
                (errorMessage) => {
                    // ไม่ต้องแสดง error ทุกครั้ง (มันจะ error บ่อยตอนสแกน)
                    // แค่ log ไว้
                    // console.log('Scan error:', errorMessage);
                }
            ).catch(err => {
                console.error('QR scanner error:', err);
                Swal.close();
                
                // แสดงข้อความ error ที่เหมาะสม
                if (err.name === 'NotAllowedError') {
                    showNotification('กรุณาอนุญาตการเข้าถึงกล้อง', 'warning');
                } else if (err.name === 'NotFoundError') {
                    showNotification('ไม่พบกล้องในอุปกรณ์นี้', 'error');
                } else {
                    showNotification('ไม่สามารถเปิดกล้องได้: ' + err.message, 'error');
                }
            });
        },
        willClose: () => {
            // ปิดกล้องเมื่อปิด modal
            const qrReaderElement = document.getElementById('qr-reader');
            if (qrReaderElement) {
                try {
                    const html5QrCode = new Html5Qrcode("qr-reader");
                    html5QrCode.stop().catch(err => {
                        console.log('Scanner already stopped or not started');
                    });
                } catch (e) {
                    console.log('Error stopping scanner on close:', e);
                }
            }
        }
    });
}


// ============================================
// เมนูจัดการงานซ่อม (ช่าง)
// ============================================

window.loadTechnicianManagement = function() {
    console.log('Loading Technician Management...');
    
    setActiveNavItem('technicianBtn');
    currentView = 'technician';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-blue-400 mb-4">
                <i class="fas fa-user-cog text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบจัดการงานซ่อม</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบจัดการงานซ่อมสำหรับช่าง...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        if (typeof window.loadTechnicianManagementImpl === 'function') {
            console.log('✓ Found loadTechnicianManagementImpl, loading...');
            window.loadTechnicianManagementImpl();
        } else {
            console.error('✗ js-technician.js not loaded!');
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 mb-4">
                        <i class="fas fa-exclamation-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบไฟล์ js-technician.js</h3>
                    <p class="text-gray-500 mb-6">กรุณาตรวจสอบว่าได้สร้างและโหลดไฟล์ js-technician.js แล้ว</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                        <h4 class="font-semibold text-gray-800 mb-2">ตรวจสอบ:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>มีไฟล์ js-technician ใน Apps Script หรือไม่?</li>
                            <li>ได้เพิ่ม &lt;?!= include('js-technician'); ?&gt; ใน index.html หรือไม่?</li>
                            <li>กด Save และ Deploy ใหม่หรือยัง?</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 500);
};

// จับ JavaScript errors ทั้งหมด
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // ป้องกันจอขาว
    e.preventDefault();
    return true;
});

// จับ Promise rejections ที่ไม่ได้ handle
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

function validateSession() {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        Swal.fire({
            icon: 'warning',
            title: 'Session หมดอายุ',
            text: 'กรุณาเข้าสู่ระบบใหม่'
        }).then(() => {
            window.location.href = '/login';
        });
        return false;
    }
    return true;
}

// เรียกใช้ก่อนทำงานสำคัญ
function handleSettingsSubmit(e) {
    e.preventDefault();
    
    if (!validateSession()) {
        return false;
    }
    
    // ... ดำเนินการต่อ
}

// ============================================
// เมนูยืม-คืนพัสดุ (User)
// ============================================
window.loadBorrowUser = function() {
    console.log('Loading Borrow User Page...');
    
    setActiveNavItem('borrowBtn');
    currentView = 'borrow-user';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-green-400 mb-4">
                <i class="fas fa-handshake text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบยืม-คืนพัสดุ</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบยืม-คืนพัสดุครุภัณฑ์...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        // ⭐ เรียกฟังก์ชันจริงที่อยู่ใน js-borrow-user.html
        if (typeof window.loadBorrowUserImpl === 'function') {
            console.log('✓ Found loadBorrowUserImpl, loading...');
            window.loadBorrowUserImpl(); // 👈 เรียกฟังก์ชันจริง
        } else {
            console.error('✗ js-borrow-user.html not loaded!');
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 mb-4">
                        <i class="fas fa-exclamation-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบไฟล์ js-borrow-user</h3>
                    <p class="text-gray-500 mb-6">กรุณาตรวจสอบว่าได้สร้างและโหลดไฟล์ js-borrow-user แล้ว</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                        <h4 class="font-semibold text-gray-800 mb-2">ตรวจสอบ:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>มีไฟล์ <strong>js-borrow-user</strong> ใน Apps Script หรือไม่?</li>
                            <li>ได้เพิ่ม <code>&lt;?!= include('js-borrow-user') ?&gt;</code> ใน index.html หรือไม่?</li>
                            <li>ลอง Deploy ใหม่และรีเฟรชหน้าเว็บ (Ctrl+Shift+R)</li>
                            <li>เปิด Console (F12) ดู error</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 100);
};

// ============================================
// เมนูจัดการยืม-คืนพัสดุ (Admin)
// ============================================
window.loadBorrowAdmin = function() {
    console.log('Loading Borrow Admin Page...');
    
    setActiveNavItem('borrowAdminBtn');
    currentView = 'borrow-admin';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-purple-400 mb-4">
                <i class="fas fa-tasks text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบจัดการยืม-คืน</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบจัดการยืม-คืนพัสดุ...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        // ⭐ เรียกฟังก์ชันจริงที่อยู่ใน js-borrow-admin.html
        if (typeof window.loadBorrowAdminImpl === 'function') {
            console.log('✓ Found loadBorrowAdminImpl, loading...');
            window.loadBorrowAdminImpl(); // 👈 เรียกฟังก์ชันจริง
        } else {
            console.error('✗ js-borrow-admin.html not loaded!');
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 mb-4">
                        <i class="fas fa-exclamation-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบไฟล์ js-borrow-admin</h3>
                    <p class="text-gray-500 mb-6">กรุณาตรวจสอบว่าได้สร้างและโหลดไฟล์ js-borrow-admin แล้ว</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                        <h4 class="font-semibold text-gray-800 mb-2">ตรวจสอบ:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>มีไฟล์ <strong>js-borrow-admin</strong> ใน Apps Script หรือไม่?</li>
                            <li>ได้เพิ่ม <code>&lt;?!= include('js-borrow-admin') ?&gt;</code> ใน index.html หรือไม่?</li>
                            <li>ลอง Deploy ใหม่และรีเฟรชหน้าเว็บ (Ctrl+Shift+R)</li>
                            <li>เปิด Console (F12) ดู error</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 100);
};

// ============================================
// 🧪 Debug: ตรวจสอบว่าโหลดไฟล์สำเร็จหรือไม่
// ============================================
console.log('Checking borrow functions...');
console.log('loadBorrowUserImpl:', typeof window.loadBorrowUserImpl);
console.log('loadBorrowAdminImpl:', typeof window.loadBorrowAdminImpl);

// ============================================
// Depreciation Functions
// ============================================
function loadDepreciation() {
    setActiveNavItem('depreciationBtn');
    currentView = 'depreciation';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-amber-400 mb-4">
                <i class="fas fa-calculator text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดระบบคำนวณค่าเสื่อม</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดระบบคำนวณค่าเสื่อมราคาพัสดุ...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        if (typeof window.loadDepreciationImpl === 'function') {
            console.log('✓ Found loadDepreciationImpl, loading...');
            window.loadDepreciationImpl();
        } else {
            console.error('✗ js-depreciation not loaded!');
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-400 mb-4">
                        <i class="fas fa-exclamation-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบไฟล์ js-depreciation</h3>
                    <p class="text-gray-500 mb-6">กรุณาตรวจสอบว่าได้สร้างและโหลดไฟล์ js-depreciation แล้ว</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                        <h4 class="font-semibold text-gray-800 mb-2">ตรวจสอบ:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
                            <li>มีไฟล์ <strong>js-depreciation</strong> ใน Apps Script หรือไม่?</li>
                            <li>ได้เพิ่ม <code>&lt;?!= include('js-depreciation') ?&gt;</code> ใน index.html หรือไม่?</li>
                            <li>ลอง Deploy ใหม่และรีเฟรชหน้าเว็บ (Ctrl+Shift+R)</li>
                            <li>เปิด Console (F12) ดู error</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }, 100);
};

</script>
