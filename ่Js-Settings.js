<script>
// ============================================
// Settings Management - จัดการตั้งค่าระบบ
// ============================================

// Global flag to track if settings are initialized
let settingsInitialized = false;

// ============================================
// Load Settings Page
// ============================================
function loadSettings() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
    <div class="bg-white rounded-lg shadow-md">
        <div class="p-6 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-cog text-blue-600 mr-2"></i>
                        ตั้งค่าระบบ
                    </h2>
                    <p class="text-gray-600 mt-1">จัดการการตั้งค่าทั่วไปและการแจ้งเตือน</p>
                </div>
                <div class="flex gap-2 w-full sm:w-auto">
                    <button id="resetSettingsBtn" class="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-redo mr-2"></i>
                        รีเซ็ต
                    </button>
                </div>
            </div>
        </div>
        
        <div class="p-4 sm:p-6">
            <form id="settingsForm">
                <!-- Grid Layout: 1 column บนมือถือ, 2 columns บน desktop -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- ============================================
                         Left Column - การตั้งค่าทั่วไป
                         ============================================ -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                            <i class="fas fa-cog text-blue-600 mr-2"></i>
                            การตั้งค่าทั่วไป
                        </h3>
                        
                        <!-- ชื่อระบบ -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-tag text-blue-600 mr-2"></i>
                                ชื่อระบบ
                            </label>
                            <input type="text" 
                                   id="appName" 
                                   name="app_name" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   placeholder="ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม">
                        </div>
                        
                        <!-- โลโก้ระบบ -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-image text-purple-600 mr-2"></i>
                                โลโก้ระบบ
                            </label>
                            <div class="flex flex-col gap-3">
                                <div id="logoPreview" class="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img id="logoImg" style="display:none; max-width:100%; max-height:100%; object-fit:contain;">
                                    <span id="logoPlaceholder" class="text-gray-400 text-sm text-center">
                                        <i class="fas fa-image text-3xl mb-2 block"></i>
                                        โลโก้ยังไม่ได้อัพโหลด
                                    </span>
                                </div>
                                <input type="file" 
                                       id="logoFile" 
                                       accept="image/*" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                       onchange="previewLogo(this)">
                                <input type="hidden" 
                                       id="logoFileId" 
                                       name="logo_file_id">
                            </div>
                        </div>
                        
                        <!-- จำนวนวันแจ้งเตือนหมดประกัน -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-calendar-alt text-green-600 mr-2"></i>
                                จำนวนวันแจ้งเตือนหมดประกัน
                            </label>
                            <input type="number" 
                                   id="warrantyAlertDays" 
                                   name="warranty_alert_days" 
                                   min="1" 
                                   max="365" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   placeholder="30">
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                ระบบจะแจ้งเตือนเมื่อใกล้หมดประกันตามจำนวนวันที่กำหนด
                            </p>
                        </div>
                        
                        <!-- โฟลเดอร์เก็บรูปภาพ -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-folder text-yellow-600 mr-2"></i>
                                โฟลเดอร์เก็บรูปภาพ (Google Drive ID)
                            </label>
                            <input type="text" 
                                   id="folderId" 
                                   name="folder_id" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   placeholder="1a2b3c4d5e6f7g8h9i0j">
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                ID ของโฟลเดอร์ Google Drive สำหรับเก็บรูปภาพพัสดุ
                            </p>
                        </div>
                        
                        <!-- เวลาทำงาน -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-clock text-purple-600 mr-2"></i>
                                เวลาทำงาน
                            </label>
                            <input type="text" 
                                   id="workHours" 
                                   name="work_hours" 
                                   placeholder="08:00-17:00" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                ช่วงเวลาทำงานของทีมซ่อมบำรุง
                            </p>
                        </div>
                    </div>
                    
                    <!-- ============================================
                         Right Column - การแจ้งเตือน
                         ============================================ -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                            <i class="fas fa-bell text-blue-600 mr-2"></i>
                            การแจ้งเตือน
                        </h3>
                        
                        <!-- เปิดใช้งานการแจ้งเตือน -->
                        <div class="settings-field">
                            <label class="flex items-center cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-200">
                                <input type="checkbox" 
                                       id="notificationEnabled" 
                                       name="notification_enabled" 
                                       class="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                                <div class="flex-1">
                                    <span class="text-sm font-medium text-gray-700 block">
                                        <i class="fas fa-bell text-red-600 mr-2"></i>
                                        เปิดใช้งานการแจ้งเตือน
                                    </span>
                                    <span class="text-xs text-gray-500">รับการแจ้งเตือนผ่าน Telegram</span>
                                </div>
                            </label>
                        </div>
                        
                        <!-- Telegram Bot Token -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fab fa-telegram text-blue-500 mr-2"></i>
                                Telegram Bot Token
                            </label>
                            <input type="text" 
                                   id="telegramBotToken" 
                                   name="telegram_bot_token" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz">
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                Token ที่ได้จาก @BotFather
                            </p>
                        </div>
                        
                        <!-- Telegram Chat ID -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fab fa-telegram text-blue-500 mr-2"></i>
                                Telegram Chat ID
                            </label>
                            <input type="text" 
                                   id="telegramChatId" 
                                   name="telegram_chat_id" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                   placeholder="-1001234567890">
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                Chat ID ของกลุ่มที่ต้องการรับการแจ้งเตือน
                            </p>
                        </div>
                        
                        <!-- เปิดใช้งานอีเมลแจ้งเตือน -->
                        <div class="settings-field">
                            <label class="flex items-center cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-blue-200">
                                <input type="checkbox" 
                                       id="emailNotifications" 
                                       name="email_notifications" 
                                       class="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                                <div class="flex-1">
                                    <span class="text-sm font-medium text-gray-700 block">
                                        <i class="fas fa-envelope text-pink-600 mr-2"></i>
                                        เปิดใช้งานอีเมลแจ้งเตือน
                                    </span>
                                    <span class="text-xs text-gray-500">รับการแจ้งเตือนผ่านอีเมล</span>
                                </div>
                            </label>
                        </div>
                        
                        <!-- รายชื่ออีเมล -->
                        <div class="settings-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-at text-indigo-600 mr-2"></i>
                                รายชื่ออีเมล (คั่นด้วยเครื่องหมายจุลภาค)
                            </label>
                            <textarea id="emailList" 
                                      name="email_list" 
                                      rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                      placeholder="admin@example.com, manager@example.com"></textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                คั่นแต่ละอีเมลด้วยเครื่องหมายจุลภาค (,)
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                    <button type="button" 
                            id="cancelSettingsBtn" 
                            class="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
                        <i class="fas fa-times mr-2"></i>
                        ยกเลิก
                    </button>
                    <button type="submit" 
                            id="saveSettingsBtn" 
                            class="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <i class="fas fa-save mr-2"></i>
                        บันทึกการตั้งค่า
                    </button>
                </div>
            </form>
        </div>
        
        <!-- Loading State -->
        <div id="settingsLoading" class="p-6 text-center py-12">
            <div class="inline-flex flex-col items-center">
                <div class="relative">
                    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <i class="fas fa-cog text-blue-500 text-2xl"></i>
                    </div>
                </div>
                <p class="text-gray-700 mt-4 text-lg font-medium">กำลังโหลดการตั้งค่า...</p>
                <p class="text-gray-500 text-sm mt-1">กรุณารอสักครู่</p>
            </div>
        </div>
    </div>
    `;
    
    // Initialize settings
    initializeSettingsManagement();
    loadSettingsData();
}

// ============================================
// Initialize Settings Management
// ============================================
function initializeSettingsManagement() {
    if (settingsInitialized) return;
    
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
        settingsInitialized = true;
    }
    
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'ยืนยันการรีเซ็ต',
                text: 'คุณต้องการโหลดค่าการตั้งค่าใหม่หรือไม่?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ใช่, รีเซ็ต',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    loadSettingsData();
                }
            });
        });
    }
    
    const cancelBtn = document.getElementById('cancelSettingsBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'ยืนยันการยกเลิก',
                text: 'การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะหายไป',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ใช่, ยกเลิก',
                cancelButtonText: 'กลับไปแก้ไข',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280'
            }).then((result) => {
                if (result.isConfirmed) {
                    loadDashboard();
                }
            });
        });
    }
}

// ============================================
// Load Settings Data
// ============================================
function loadSettingsData() {
    const loading = document.getElementById('settingsLoading');
    const form = document.getElementById('settingsForm');
    
    if (loading) loading.classList.remove('hidden');
    if (form) form.style.display = 'none';
    
    google.script.run
        .withSuccessHandler(function(result) {
            if (loading) loading.classList.add('hidden');
            if (form) form.style.display = 'block';
            
            if (result.status === 'success') {
                const config = result.config;
                
                // Fill form with data
                document.getElementById('appName').value = config.app_name || '';
                document.getElementById('warrantyAlertDays').value = config.warranty_alert_days || 30;
                document.getElementById('folderId').value = config.folder_id || '';
                document.getElementById('workHours').value = config.work_hours || '08:00-17:00';
                document.getElementById('notificationEnabled').checked = config.notification_enabled || false;
                document.getElementById('telegramBotToken').value = config.telegram_bot_token || '';
                document.getElementById('telegramChatId').value = config.telegram_chat_id || '';
                document.getElementById('emailNotifications').checked = config.email_notifications || false;
                document.getElementById('emailList').value = config.email_list || '';
                
                // แสดงโลโก้ที่มี
                if (config.logo_file_id) {
                    const logoUrl = `https://lh5.googleusercontent.com/d/${config.logo_file_id}`;
                    
                    const logoImg = document.getElementById('logoImg');
                    const logoPlaceholder = document.getElementById('logoPlaceholder');
                    
                    if (logoImg && logoPlaceholder) {
                        logoImg.src = logoUrl;
                        logoImg.style.display = 'block';
                        logoPlaceholder.style.display = 'none';
                    }
                    
                    document.getElementById('logoFileId').value = config.logo_file_id;
                }
                
                // Show success notification
                showNotification('โหลดข้อมูลการตั้งค่าสำเร็จ', 'success');
            } else {
                showNotification(result.message || 'ไม่สามารถโหลดข้อมูลได้', 'error');
            }
        })
        .withFailureHandler(function(error) {
            if (loading) loading.classList.add('hidden');
            if (form) form.style.display = 'block';
            
            console.error('Load settings error:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถโหลดการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#ef4444'
            });
        })
        .getConfig(sessionId);
}

// ============================================
// Handle Settings Submit (แก้ไขใหม่)
// ============================================
async function handleSettingsSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const form = e.target;
        const submitBtn = document.getElementById('saveSettingsBtn');
        
        if (submitBtn.disabled) {
            console.log('กำลังประมวลผล กรุณารอ...');
            return false;
        }
        
        const originalBtnHTML = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังบันทึก...';
        
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        }
        
        // ✅ Validate ข้อมูล
        const appName = document.getElementById('appName').value.trim();
        if (!appName) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกข้อมูล',
                text: 'กรุณากรอกชื่อระบบ'
            });
            return false;
        }
        
        // ✅ ตรวจสอบว่ามีการอัพโหลดโลโก้ใหม่หรือไม่
        const logoFileInput = document.getElementById('logoFile');
        let logoFileId = document.getElementById('logoFileId').value.trim();
        
        if (logoFileInput.files.length > 0) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังอัพโหลดโลโก้...';
            
            try {
                // อัพโหลดโลโก้ใหม่
                const logoFile = logoFileInput.files[0];
                const base64 = await convertFileToBase64(logoFile);
                
                const uploadResult = await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .uploadLogoImage(base64);
                });
                
                if (uploadResult.status === 'success') {
                    logoFileId = uploadResult.fileId;
                    console.log('✅ Logo uploaded successfully:', logoFileId);
                } else {
                    throw new Error('อัพโหลดโลโก้ไม่สำเร็จ');
                }
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                Swal.fire({
                    icon: 'error',
                    title: 'อัพโหลดโลโก้ไม่สำเร็จ',
                    text: uploadError.message || 'กรุณาลองใหม่อีกครั้ง'
                });
                return false;
            }
        }
        
        // ✅ สร้าง config object พร้อม logo_file_id
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>กำลังบันทึกการตั้งค่า...';
        
        const configData = {
            app_name: appName,
            warranty_alert_days: parseInt(document.getElementById('warrantyAlertDays').value) || 30,
            folder_id: document.getElementById('folderId').value.trim(),
            work_hours: document.getElementById('workHours').value.trim() || '08:00-17:00',
            notification_enabled: document.getElementById('notificationEnabled').checked,
            telegram_bot_token: document.getElementById('telegramBotToken').value.trim(),
            telegram_chat_id: document.getElementById('telegramChatId').value.trim(),
            email_notifications: document.getElementById('emailNotifications').checked,
            email_list: document.getElementById('emailList').value.trim(),
            logo_file_id: logoFileId // ✅ บันทึก logo_file_id
        };
        
        console.log('💾 Saving config:', configData);
        
        // ✅ บันทึกลง Config Sheet
        const result = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Request timeout')), 30000);
            
            google.script.run
                .withSuccessHandler((result) => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .withFailureHandler((error) => {
                    clearTimeout(timeout);
                    reject(error);
                })
                .updateConfig(configData, sessionId);
        });
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        console.log('📊 Update result:', result);
        
        if (result && result.status === 'success') {
            // ✅ อัพเดต logo ใน UI ทันที
            if (logoFileId) {
                updateSystemLogoInIndex(logoFileId);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // รีโหลดหน้าเพื่อดึงข้อมูลใหม่
                loadSettingsData();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: result?.message || 'ไม่สามารถบันทึกได้'
            });
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        const submitBtn = document.getElementById('saveSettingsBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกการตั้งค่า';
        }
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'กรุณาลองใหม่อีกครั้ง'
        });
    }
    
    return false;
}

// ============================================
// Helper Function: Convert File to Base64
// ============================================
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// Logo Preview and Upload
// ============================================
function previewLogo(input) {
    const file = input.files[0];
    const preview = document.getElementById('logoPreview');
    const logoImg = document.getElementById('logoImg');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoImg.src = e.target.result;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
            
            // อัพโหลดไปยัง Google Drive
            uploadLogoToGoogleDrive(file);
        };
        reader.readAsDataURL(file);
    }
}

function uploadLogoToGoogleDrive(file) {
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const base64String = fileReader.result.split(',')[1]; // ตัด Data URL header
        
        // แสดง loading สถานะ
        Swal.fire({
            title: 'กำลังอัพโหลดโลโก้',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        google.script.run
            .withSuccessHandler((result) => {
                if (result.status === 'success') {
                    document.getElementById('logoFileId').value = result.fileId;
                    // บันทึกใน localStorage
                    localStorage.setItem('systemLogoFileId', result.fileId);
                    
                    // อัพเดตหน้า index ทันที
                    updateSystemLogoInIndex(result.fileId);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'อัพโหลดโลโก้สำเร็จ',
                        timer: 2000
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่สามารถอัพโหลดโลโก้',
                        text: result.message || 'เกิดข้อผิดพลาด'
                    });
                }
            })
            .withFailureHandler((error) => {
                console.error('Upload logo error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถอัพโหลดโลโก้',
                    text: error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
                    confirmButtonColor: '#3B82F6'
                });
            })
            .uploadLogoImage(base64String);
    };
    fileReader.readAsDataURL(file);
}

function updateSystemLogoInIndex(fileId) {
    const logoUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
    localStorage.setItem('systemLogoUrl', logoUrl);
    
    // อัพเดต navbar logo ทันที
    const navLogo = document.getElementById('navbarLogo');
    if (navLogo) {
        navLogo.src = logoUrl;
    }
}

// Make function globally accessible
window.loadSettings = loadSettings;
window.previewLogo = previewLogo;
</script>
