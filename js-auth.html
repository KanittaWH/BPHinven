<script>
// ============================================
// Authentication Functions
// ============================================

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'warning');
        return;
    }
    
    try {
        // ⭐ แสดง Loading SweetAlert2
        Swal.fire({
            title: 'กำลังเข้าสู่ระบบ',
            html: `
                <div class="flex flex-col items-center justify-center py-6">
                    <div class="relative">
                        <div class="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <i class="fas fa-user text-blue-500 text-2xl"></i>
                        </div>
                    </div>
                    <p class="text-gray-700 mt-6 text-lg font-medium">กำลังตรวจสอบข้อมูล</p>
                    <p class="text-gray-500 text-sm mt-2">กรุณารอสักครู่...</p>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: '#fff'
        });
        
        showLoading(submitBtn);
        
        // Call Google Apps Script login function
        google.script.run
            .withSuccessHandler(onLoginSuccess)
            .withFailureHandler(onLoginError)
            .login(username, password);
            
    } catch (error) {
        console.error('Login error:', error);
        Swal.close();
        showNotification('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
    } finally {
        hideLoading(submitBtn);
    }
}

function onLoginSuccess(result) {
    // ⭐ ปิด Loading SweetAlert2
    Swal.close();
    
    if (result.status === 'success') {
        // Store session data
        sessionId = result.sessionId;
        currentUser = result.user;
        
        // Set window.sessionId for cross-module access
        window.sessionId = sessionId;
        window.currentUser = currentUser;
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // ⭐ แสดงข้อความสำเร็จพร้อมไอคอน
        Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ!',
            html: `
                <div class="text-center py-4">
                    <p class="text-lg font-medium mb-2">ยินดีต้อนรับ</p>
                    <p class="text-2xl font-bold text-blue-600 mb-2">${currentUser.name}</p>
                    <div class="inline-block px-4 py-2 rounded-full ${getRoleBadgeColor(currentUser.role)}">
                        <i class="fas fa-user-shield mr-1"></i>
                        ${getRoleDisplayName(currentUser.role)}
                    </div>
                </div>
            `,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        }).then(() => {
            // Show app and load dashboard
            showApp();
            loadDashboard();
            
            // Clear login form
            document.getElementById('loginForm').reset();
        });
        
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            confirmButtonText: 'ลองอีกครั้ง',
            confirmButtonColor: '#3b82f6'
        });
    }
}

function onLoginError(error) {
    console.error('Login error:', error);
    
    // ⭐ ปิด Loading และแสดง Error
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
    });
}

// Helper function for role badge color
function getRoleBadgeColor(role) {
    const colors = {
        'admin': 'bg-purple-100 text-purple-800',
        'technician': 'bg-blue-100 text-blue-800',
        'user': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
}

// Helper function for role display name
function getRoleDisplayName(role) {
    const names = {
        'admin': 'ผู้ดูแลระบบ',
        'technician': 'ช่างซ่อม',
        'user': 'ผู้ใช้ทั่วไป'
    };
    return names[role] || role;
}

// Logout function
async function logout() {
    // ⭐ แสดง Confirmation Dialog
    const result = await Swal.fire({
        title: 'ออกจากระบบ?',
        text: 'คุณต้องการออกจากระบบหรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        // ⭐ แสดง Loading ขณะ Logout
        Swal.fire({
            title: 'กำลังออกจากระบบ...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        if (sessionId) {
            google.script.run
                .withSuccessHandler(onLogoutSuccess)
                .withFailureHandler(onLogoutError)
                .logout(sessionId);
        }
        
        // Clear local storage
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
        
        // Reset variables
        sessionId = null;
        currentUser = null;
        window.sessionId = null;
        window.currentUser = null;
        
        // ⭐ แสดงข้อความสำเร็จ
        await Swal.fire({
            icon: 'success',
            title: 'ออกจากระบบสำเร็จ',
            text: 'ขอบคุณที่ใช้บริการ',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Show login modal
        showLoginModal();
        
    } catch (error) {
        console.error('Logout error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถออกจากระบบได้',
            confirmButtonText: 'ตกลง'
        });
    }
}

function onLogoutSuccess(result) {
    console.log('Logout successful');
}

function onLogoutError(error) {
    console.error('Logout error:', error);
}

// Check user permissions
function hasPermission(permission) {
    if (!currentUser || !currentUser.permissions) {
        return false;
    }
    
    // Admin has all permissions
    if (currentUser.permissions.includes('all')) {
        return true;
    }
    
    return currentUser.permissions.includes(permission);
}

// Show access denied message
function showAccessDenied() {
    Swal.fire({
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
    });
}

// Require permission wrapper
function requirePermission(permission, callback) {
    if (hasPermission(permission)) {
        callback();
    } else {
        showAccessDenied();
    }
}

// Auto logout on session expiry
function checkSessionExpiry() {
    if (sessionId && currentUser) {
        google.script.run
            .withSuccessHandler(function(result) {
                if (result.status !== 'valid') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'เซสชันหมดอายุ',
                        text: 'กรุณาเข้าสู่ระบบอีกครั้ง',
                        confirmButtonText: 'ตกลง',
                        allowOutsideClick: false
                    }).then(() => {
                        logout();
                    });
                }
            })
            .withFailureHandler(function(error) {
                console.error('Session check error:', error);
            })
            .validateSession(sessionId);
    }
}

// Check session every 5 minutes
setInterval(checkSessionExpiry, 5 * 60 * 1000);

// Handle password visibility toggle
function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    const icon = buttonElement.querySelector('i');
    
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

// Handle forgot password (placeholder)
function handleForgotPassword() {
    Swal.fire({
        title: 'ลืมรหัสผ่าน?',
        text: 'กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน',
        icon: 'info',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
    });
}

// Handle remember me (localStorage)
function handleRememberMe(checked, username) {
    if (checked) {
        localStorage.setItem('rememberedUsername', username);
    } else {
        localStorage.removeItem('rememberedUsername');
    }
}

// Load remembered username on page load
function loadRememberedUsername() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        const usernameInput = document.getElementById('username');
        const rememberCheckbox = document.getElementById('rememberMe');
        
        if (usernameInput) {
            usernameInput.value = rememberedUsername;
        }
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    loadRememberedUsername();
    
    // Add remember me functionality if checkbox exists
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            const username = document.getElementById('username').value;
            handleRememberMe(this.checked, username);
        });
    }
    
    // Add forgot password link if exists
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
});

// Role-based navigation visibility
// Admin: เห็นทั้งหมด
// Technician: ซ่อน อนุมัติคำขอเบิกอะไหล่, ทะเบียนพัสดุ, จัดการยืม-คืน, จัดการผู้ใช้, ตั้งค่าระบบ
// User: ซ่อน ข้อมูลพัสดุฯ, บันทึกอะไหล่, อนุมัติคำขอเบิกอะไหล่, ทะเบียนพัสดุ, จัดการงานซ่อม, จัดการยืม-คืน, รายงาน, จัดการผู้ใช้, ตั้งค่าระบบ
function updateNavigationByRole() {
    if (!currentUser) return;
    
    const role = currentUser.role; // 'admin', 'technician', 'user'
    console.log('📋 [js-auth] updateNavigationByRole - role:', role);
    
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
    // เมนู "ข้อมูลพัสดุฯ" - Admin + Technician
    // ============================================
    const sparePartsGroup = document.getElementById('sparePartsGroup');
    if (sparePartsGroup) {
        if (role === 'admin' || role === 'technician') {
            sparePartsGroup.style.display = 'block';
            sparePartsGroup.classList.remove('hidden');
        } else {
            sparePartsGroup.style.display = 'none';
            sparePartsGroup.classList.add('hidden');
        }
    }
    
    // ============================================
    // เมนู "บันทึกอะไหล่" - Admin + Technician
    // ============================================
    const sparePartsRecordMenu = document.getElementById('sparePartsRecordMenu');
    if (sparePartsRecordMenu) {
        if (role === 'admin' || role === 'technician') {
            showMenu(sparePartsRecordMenu);
        } else {
            hideMenu(sparePartsRecordMenu);
        }
    }
    
    // ============================================
    // เมนู "อนุมัติคำขอเบิกอะไหล่" - ADMIN ONLY
    // ============================================
    const sparePartsApprovalBtn = document.getElementById('sparePartsApprovalBtn');
    if (sparePartsApprovalBtn) {
        if (role === 'admin') {
            showMenu(sparePartsApprovalBtn);
        } else {
            hideMenu(sparePartsApprovalBtn);
        }
    }
    
    // ============================================
    // เมนู "ทะเบียนพัสดุ" - ADMIN ONLY
    // ============================================
    const equipmentBtn = document.getElementById('equipmentBtn');
    if (equipmentBtn) {
        if (role === 'admin') {
            showMenu(equipmentBtn);
        } else {
            hideMenu(equipmentBtn);
        }
    }
    
    // ============================================
    // เมนู "คำนวณค่าเสื่อม" - Admin + Technician
    // ============================================
    const depreciationBtn = document.getElementById('depreciationBtn');
    if (depreciationBtn) {
        if (role === 'admin' || role === 'technician') {
            showMenu(depreciationBtn);
            console.log('✓ Depreciation: VISIBLE (Admin/Technician)');
        } else {
            hideMenu(depreciationBtn);
            console.log('⭕ Depreciation: HIDDEN (User)');
        }
    }
    
    // ============================================
    // เมนู "แจ้งซ่อม" - ทุก Role
    // ============================================
    const repairBtn = document.getElementById('repairBtn');
    if (repairBtn) {
        repairBtn.style.display = 'flex';
        repairBtn.classList.remove('hidden');
    }
    
    // ============================================
    // เมนู "ยืม-คืนพัสดุ" - ทุก Role
    // ============================================
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
        showMenu(borrowBtn);
    }
    
    // ============================================
    // หัวข้อ "เมนูเจ้าหน้าที่" - Admin + Technician
    // ============================================
    const staffMenuSection = document.getElementById('staffMenuSection');
    if (staffMenuSection) {
        if (role === 'user') {
            staffMenuSection.style.display = 'none';
        } else {
            staffMenuSection.style.display = 'block';
        }
    }
    
    // ============================================
    // เมนู "จัดการงานซ่อม" - Admin + Technician
    // ============================================
    const technicianBtn = document.getElementById('technicianBtn');
    if (technicianBtn) {
        if (role === 'admin' || role === 'technician') {
            showMenu(technicianBtn);
        } else {
            hideMenu(technicianBtn);
        }
    }
    
    // ============================================
    // เมนู "จัดการยืม-คืน" - ADMIN ONLY
    // ============================================
    const borrowAdminBtn = document.getElementById('borrowAdminBtn');
    if (borrowAdminBtn) {
        if (role === 'admin') {
            showMenu(borrowAdminBtn);
        } else {
            hideMenu(borrowAdminBtn);
        }
    }
    
    // ============================================
    // เมนู "รายงาน" - Admin + Technician
    // ============================================
    const reportsBtn = document.getElementById('reportsBtn');
    if (reportsBtn) {
        if (role === 'admin' || role === 'technician') {
            showMenu(reportsBtn);
        } else {
            hideMenu(reportsBtn);
        }
    }
    
    // ============================================
    // หัวข้อ "การจัดการ" - ADMIN ONLY
    // ============================================
    const managementSection = document.getElementById('managementSection');
    if (managementSection) {
        if (role === 'admin') {
            managementSection.style.display = 'block';
        } else {
            managementSection.style.display = 'none';
        }
    }
    
    // ============================================
    // เมนู "จัดการผู้ใช้" - ADMIN ONLY
    // ============================================
    const usersBtn = document.getElementById('usersBtn');
    if (usersBtn) {
        if (role === 'admin') {
            showMenu(usersBtn);
        } else {
            hideMenu(usersBtn);
        }
    }
    
    // ============================================
    // เมนู "ตั้งค่าระบบ" - ADMIN ONLY
    // ============================================
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        if (role === 'admin') {
            showMenu(settingsBtn);
        } else {
            hideMenu(settingsBtn);
        }
    }
    
    console.log('✅ [js-auth] Navigation updated for role:', role);
}

// Call after successful login
function initializeUserInterface() {
    updateNavigationByRole();
    
    // Set user info in header
    const userDisplayName = document.getElementById('userDisplayName');
    const userRoleBadge = document.getElementById('userRoleBadge');
    
    if (userDisplayName && currentUser) {
        userDisplayName.textContent = currentUser.name;
    }
    
    if (userRoleBadge && currentUser) {
        userRoleBadge.textContent = getRoleDisplayName(currentUser.role);
        userRoleBadge.className = `px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(currentUser.role)}`;
    }
}

// Session Manager for better session handling
const SessionManager = {
    setSession(sessionData) {
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('currentUser', JSON.stringify(sessionData.user));
        localStorage.setItem('sessionTimestamp', Date.now().toString());
    },
    
    getSession() {
        const sessionId = localStorage.getItem('sessionId');
        const userStr = localStorage.getItem('currentUser');
        const timestamp = localStorage.getItem('sessionTimestamp');
        
        if (!sessionId || !userStr || !timestamp) {
            return null;
        }
        
        return {
            sessionId,
            user: JSON.parse(userStr),
            timestamp: parseInt(timestamp)
        };
    },
    
    clearSession() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionTimestamp');
    },
    
    isSessionExpired() {
        const session = this.getSession();
        if (!session) return true;
        
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        return sessionAge > maxAge;
    }
};

// Enhanced session validation
async function validateSessionEnhanced() {
    const session = SessionManager.getSession();
    
    if (!session || SessionManager.isSessionExpired()) {
        SessionManager.clearSession();
        showLoginModal();
        return false;
    }
    
    try {
        const result = await new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .validateSession(session.sessionId);
        });
        
        if (result.status === 'valid') {
            sessionId = session.sessionId;
            currentUser = session.user;
            window.sessionId = sessionId;
            window.currentUser = currentUser;
            return true;
        } else {
            SessionManager.clearSession();
            showLoginModal();
            return false;
        }
        
    } catch (error) {
        console.error('Session validation error:', error);
        SessionManager.clearSession();
        showLoginModal();
        return false;
    }
}

// Auto-save form data (for better UX)
class FormAutoSave {
    static save(formId, data) {
        localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    }
    
    static load(formId) {
        const data = localStorage.getItem(`form_${formId}`);
        return data ? JSON.parse(data) : null;
    }
    
    static clear(formId) {
        localStorage.removeItem(`form_${formId}`);
    }
    
    static setupAutoSave(formElement, formId) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const formData = new FormData(formElement);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                this.save(formId, data);
            });
        });
    }
    
    static restoreFormData(formElement, formId) {
        const data = this.load(formId);
        if (data) {
            Object.keys(data).forEach(key => {
                const element = formElement.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = data[key];
                }
            });
        }
    }
}
</script>
