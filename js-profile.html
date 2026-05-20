<script>
// ============================================
// Profile Management System - js-profile.js
// ระบบจัดการโปรไฟล์ผู้ใช้ (เวอร์ชันรวม Event Listeners)
// รองรับการแสดงผลบนมือถือ
// ============================================

let currentProfileData = null;

// ============================================
// 🆕 Global Function: window.loadProfile (รวมไว้ใน js-profile แล้ว)
// ============================================

window.loadProfile = function() {
    console.log('Loading Profile...');
    
    setActiveNavItem('profileBtn');
    currentView = 'profile';
    
    const contentArea = document.getElementById('contentArea') || document.getElementById('mainContent');
    if (!contentArea) {
        console.error('Content area not found!');
        return;
    }
    
    contentArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-blue-400 mb-4">
                <i class="fas fa-user-circle text-6xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">โหลดโปรไฟล์</h3>
            <p class="text-gray-500 mb-6">กำลังโหลดข้อมูลโปรไฟล์...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
    `;
    
    setTimeout(() => {
        if (typeof loadProfile === 'function' && loadProfile !== window.loadProfile) {
            console.log('✓ Found loadProfile implementation, loading...');
            loadProfile();
        } else {
            console.log('✓ Using built-in profile system');
            loadProfilePage();
        }
    }, 300);
};

// ============================================
// Main Functions
// ============================================

function loadProfile() {
    loadProfilePage();
}

function loadProfilePage() {
    const content = document.getElementById('mainContent') || document.getElementById('contentArea');
    
    // ✅ เพิ่มการตรวจสอบ currentUser
    if (!currentUser) {
        console.error('❌ currentUser is not defined!');
        content.innerHTML = getUnauthorizedTemplate();
        return;
    }
    
    // ✅ เพิ่มการ Debug ข้อมูล
    console.log('📊 Current User Data:', currentUser);
    
    content.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <!-- Header -->
            <div class="mb-6 sm:mb-8">
                <div class="flex items-center mb-2">
                    <i class="fas fa-user-circle text-3xl sm:text-4xl text-blue-600 mr-3"></i>
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
                        <p class="text-sm sm:text-base text-gray-600 mt-1">จัดการข้อมูลส่วนตัวและความปลอดภัย</p>
                    </div>
                </div>
            </div>
            
            <!-- Profile Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column: Profile Info Card -->
                <div class="lg:col-span-1">
                    ${getProfileCardTemplate()}
                </div>
                
                <!-- Right Column: Edit Forms -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Edit Profile Form -->
                    ${getEditProfileFormTemplate()}
                    
                    <!-- Change Password Form -->
                    ${getChangePasswordFormTemplate()}
                </div>
            </div>
        </div>
    `;
    
    // Initialize event listeners
    initProfileEventListeners();
    
    // Load current user data
    loadCurrentUserData();
}

// ============================================
// Template Functions
// ============================================

function getProfileCardTemplate() {
    const user = currentUser || {};
    
    // ✅ ตั้งค่า default values
    const username = user.username || 'unknown';
    const name = user.name || 'ไม่ระบุชื่อ';
    const role = user.role || 'user';
    const active = user.active !== undefined ? user.active : true;
    
    const roleColors = {
        'admin': 'bg-purple-100 text-purple-800 border-purple-200',
        'technician': 'bg-blue-100 text-blue-800 border-blue-200',
        'user': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const roleNames = {
        'admin': 'ผู้ดูแลระบบ',
        'technician': 'ช่างซ่อม',
        'user': 'ผู้ใช้ทั่วไป'
    };
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
            <!-- Profile Header with Gradient -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-24 sm:h-32"></div>
            
            <!-- Profile Avatar -->
            <div class="px-6 pb-6">
                <div class="flex flex-col items-center -mt-12 sm:-mt-16">
                    <!-- Avatar Circle -->
                    <div class="bg-white rounded-full p-2 shadow-lg">
                        <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span class="text-3xl sm:text-4xl font-bold text-white">
                                ${name ? name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- User Info -->
                    <div class="text-center mt-4 w-full">
                        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 break-words">${name}</h2>
                        <p class="text-sm sm:text-base text-gray-500 mt-1 break-all">@${username}</p>
                        
                        <!-- Role Badge -->
                        <div class="mt-3">
                            <span class="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border-2 ${roleColors[role] || roleColors.user}">
                                <i class="fas fa-shield-alt mr-1.5 sm:mr-2"></i>
                                ${roleNames[role] || 'ผู้ใช้'}
                            </span>
                        </div>
                        
                        <!-- Status Badge -->
                        <div class="mt-3">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                <i class="fas ${active ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
                                ${active ? 'บัญชีใช้งานปกติ' : 'บัญชีถูกระงับ'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getEditProfileFormTemplate() {
    const user = currentUser || {};
    const username = user.username || '';
    const name = user.name || '';
    
    return `
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div class="flex items-center mb-4 sm:mb-6">
                <i class="fas fa-user-edit text-xl sm:text-2xl text-blue-600 mr-3"></i>
                <h3 class="text-lg sm:text-xl font-bold text-gray-800">แก้ไขข้อมูลส่วนตัว</h3>
            </div>
            
            <form id="editProfileForm" class="space-y-4 sm:space-y-5">
                <!-- Username (Read-only) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user text-gray-400 mr-1"></i>
                        ชื่อผู้ใช้ (Username)
                    </label>
                    <input type="text" id="profileUsername" disabled
                           class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                           value="${username}">
                    <p class="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนชื่อผู้ใช้ได้</p>
                </div>
                
                <!-- Full Name -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-id-card text-gray-400 mr-1"></i>
                        ชื่อ-นามสกุล <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="profileName" required
                           class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                           placeholder="กรอกชื่อ-นามสกุล"
                           value="${name}">
                </div>
                
                <!-- Submit Button -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="submit" id="saveProfileBtn"
                            class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base">
                        <i class="fas fa-save mr-2"></i>
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <button type="button" onclick="window.loadProfile()"
                            class="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base">
                        <i class="fas fa-times mr-2"></i>
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    `;
}

function getChangePasswordFormTemplate() {
    return `
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div class="flex items-center mb-4 sm:mb-6">
                <i class="fas fa-key text-xl sm:text-2xl text-red-600 mr-3"></i>
                <h3 class="text-lg sm:text-xl font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h3>
            </div>
            
            <form id="changePasswordForm" class="space-y-4 sm:space-y-5">
                <!-- Current Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock text-gray-400 mr-1"></i>
                        รหัสผ่านปัจจุบัน <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="currentPassword" required
                               class="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                               placeholder="กรอกรหัสผ่านปัจจุบัน">
                        <button type="button" onclick="togglePasswordVisibility('currentPassword')" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <!-- New Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock text-gray-400 mr-1"></i>
                        รหัสผ่านใหม่ <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="newPassword" required
                               class="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                               placeholder="กรอกรหัสผ่านใหม่"
                               minlength="6">
                        <button type="button" onclick="togglePasswordVisibility('newPassword')" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>
                </div>
                
                <!-- Confirm New Password -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock text-gray-400 mr-1"></i>
                        ยืนยันรหัสผ่านใหม่ <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                        <input type="password" id="confirmPassword" required
                               class="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                               placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                               minlength="6">
                        <button type="button" onclick="togglePasswordVisibility('confirmPassword')" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Password Strength Indicator -->
                <div id="passwordStrength" class="hidden">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-gray-600">ความแข็งแรงของรหัสผ่าน:</span>
                        <span id="strengthText" class="text-xs font-medium"></span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="strengthBar" class="h-2 rounded-full transition-all duration-300"></div>
                    </div>
                </div>
                
                <!-- Submit Button -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="submit" id="changePasswordBtn"
                            class="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center shadow-md text-sm sm:text-base">
                        <i class="fas fa-key mr-2"></i>
                        เปลี่ยนรหัสผ่าน
                    </button>
                    <button type="button" onclick="document.getElementById('changePasswordForm').reset(); hidePasswordStrength();"
                            class="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base">
                        <i class="fas fa-times mr-2"></i>
                        ล้างข้อมูล
                    </button>
                </div>
            </form>
        </div>
    `;
}

function getUnauthorizedTemplate() {
    return `
        <div class="flex items-center justify-center min-h-screen bg-gray-50">
            <div class="text-center px-4">
                <i class="fas fa-lock text-6xl sm:text-8xl text-gray-300 mb-4"></i>
                <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
                <p class="text-sm sm:text-base text-gray-600 mb-6">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
                <button onclick="location.reload()" 
                        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    เข้าสู่ระบบ
                </button>
            </div>
        </div>
    `;
}

// ============================================
// Event Listeners
// ============================================

function initProfileEventListeners() {
    // Edit Profile Form
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Change Password Form
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Password Strength Indicator
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
}

// ============================================
// Form Handlers
// ============================================

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value.trim();
    
    if (!name) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูล',
            text: 'กรุณากรอกชื่อ-นามสกุล',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'กำลังบันทึก...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Update user data
        const updateData = {
            id: currentUser.id,
            name: name
        };
        
        google.script.run
            .withSuccessHandler(onProfileUpdateSuccess)
            .withFailureHandler(onProfileUpdateError)
            .updateUserProfile(updateData);
            
    } catch (error) {
        console.error('Profile update error:', error);
        onProfileUpdateError(error);
    }
}

function onProfileUpdateSuccess(result) {
    if (result.status === 'success') {
        // Update current user data
        currentUser.name = result.data.name;
        currentUser.updated_at = result.data.updated_at;
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ!',
            text: 'ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            // Reload profile page
            window.loadProfile();
            
            // Update sidebar username if exists
            updateSidebarUsername();
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: result.message || 'ไม่สามารถบันทึกข้อมูลได้',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
    }
}

function onProfileUpdateError(error) {
    console.error('Update error:', error);
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
    });
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูล',
            text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            text: 'กรุณากรอกรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    if (newPassword.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'รหัสผ่านสั้นเกินไป',
            text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'กำลังเปลี่ยนรหัสผ่าน...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const passwordData = {
            userId: currentUser.id,
            currentPassword: currentPassword,
            newPassword: newPassword
        };
        
        google.script.run
            .withSuccessHandler(onPasswordChangeSuccess)
            .withFailureHandler(onPasswordChangeError)
            .changeUserPassword(passwordData);
            
    } catch (error) {
        console.error('Password change error:', error);
        onPasswordChangeError(error);
    }
}

function onPasswordChangeSuccess(result) {
    if (result.status === 'success') {
        Swal.fire({
            icon: 'success',
            title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
            text: 'รหัสผ่านของคุณได้รับการเปลี่ยนแปลงแล้ว',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        }).then(() => {
            // Clear form
            document.getElementById('changePasswordForm').reset();
            hidePasswordStrength();
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: result.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#3b82f6'
        });
    }
}

function onPasswordChangeError(error) {
    console.error('Password change error:', error);
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
    });
}

// ============================================
// Helper Functions
// ============================================

function loadCurrentUserData() {
    currentProfileData = {...currentUser};
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const button = input.nextElementSibling;
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (!icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        hidePasswordStrength();
        return;
    }
    
    strengthDiv.classList.remove('hidden');
    
    let strength = 0;
    let text = '';
    let color = '';
    
    // Calculate strength
    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    // Determine text and color
    if (strength <= 30) {
        text = 'อ่อนแอ';
        color = 'bg-red-500';
    } else if (strength <= 50) {
        text = 'ปานกลาง';
        color = 'bg-yellow-500';
    } else if (strength <= 70) {
        text = 'ดี';
        color = 'bg-blue-500';
    } else {
        text = 'แข็งแรงมาก';
        color = 'bg-green-500';
    }
    
    strengthBar.style.width = strength + '%';
    strengthBar.className = `h-2 rounded-full transition-all duration-300 ${color}`;
    strengthText.textContent = text;
    strengthText.className = `text-xs font-medium ${color.replace('bg-', 'text-')}`;
}

function hidePasswordStrength() {
    const strengthDiv = document.getElementById('passwordStrength');
    if (strengthDiv) {
        strengthDiv.classList.add('hidden');
    }
}

function updateSidebarUsername() {
    const usernameElements = document.querySelectorAll('#userDisplayName, #currentUserName');
    if (usernameElements && currentUser) {
        usernameElements.forEach(el => {
            if (el) {
                el.textContent = currentUser.name || currentUser.username || 'ผู้ใช้';
            }
        });
    }
}

// ============================================
// 🆕 Auto-Initialize Event Listeners
// ============================================

(function() {
    // รอให้ DOM โหลดเสร็จ
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfileSystem);
    } else {
        initializeProfileSystem();
    }
})();

function initializeProfileSystem() {
    console.log('🔵 Initializing Profile System...');
    
    // ============================================
    // Event Listeners สำหรับ Sidebar
    // ============================================
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && !profileBtn.dataset.profileInitialized) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔵 Sidebar Profile clicked');
            window.loadProfile();
            if (typeof closeSidebar === 'function') {
                closeSidebar();
            }
        });
        profileBtn.dataset.profileInitialized = 'true';
        console.log('✓ Profile button (Sidebar) initialized');
    }
    
    // ============================================
    // Event Listeners สำหรับ Dropdown Menu
    // ============================================
    
    // User Menu Toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn && !userMenuBtn.dataset.profileInitialized) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
            }
        });
        userMenuBtn.dataset.profileInitialized = 'true';
        console.log('✓ User menu toggle initialized');
    }
    
    // Dropdown - Profile
    const dropdownProfileBtn = document.getElementById('dropdownProfileBtn');
    if (dropdownProfileBtn && !dropdownProfileBtn.dataset.profileInitialized) {
        dropdownProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔵 Dropdown Profile clicked');
            
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
            
            window.loadProfile();
            
            if (typeof closeSidebar === 'function') {
                closeSidebar();
            }
        });
        dropdownProfileBtn.dataset.profileInitialized = 'true';
        console.log('✓ Dropdown profile button initialized');
    }
    
    // Dropdown - Settings
    const dropdownSettingsBtn = document.getElementById('dropdownSettingsBtn');
    if (dropdownSettingsBtn && !dropdownSettingsBtn.dataset.profileInitialized) {
        dropdownSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔵 Dropdown Settings clicked');
            
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
            
            if (typeof loadSettings === 'function') {
                loadSettings();
            } else if (typeof window.loadSettings === 'function') {
                window.loadSettings();
            } else {
                console.log('Settings page not implemented yet');
                if (typeof showNotification === 'function') {
                    showNotification('ระบบตั้งค่ายังไม่พร้อมใช้งาน', 'info');
                }
            }
            
            if (typeof closeSidebar === 'function') {
                closeSidebar();
            }
        });
        dropdownSettingsBtn.dataset.profileInitialized = 'true';
        console.log('✓ Dropdown settings button initialized');
    }
    
    // Click Outside Handler
    if (!document.body.dataset.dropdownHandlerInitialized) {
        document.addEventListener('click', function(e) {
            const userMenu = document.getElementById('userMenuBtn');
            const dropdown = document.getElementById('userDropdown');
            
            if (userMenu && dropdown && 
                !userMenu.contains(e.target) && 
                !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        document.body.dataset.dropdownHandlerInitialized = 'true';
        console.log('✓ Click outside handler initialized');
    }
    
    console.log('✅ Profile System Initialized Successfully!');
}
 </script> 
