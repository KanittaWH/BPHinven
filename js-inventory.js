<script>
// ============================================
// Equipment/Inventory Management Functions
// ฉบับสมบูรณ์พร้อม SweetAlert2 และ Pagination
// ============================================

let equipmentList = [];
let filteredEquipmentList = [];
let currentEquipment = null;
let isEditMode = false;

// เก็บรายการสถานที่ที่ไม่ซ้ำกัน
let uniqueLocations = new Set();

// 🆕 Pagination Variables
let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;

// ============================================
// Load Equipment Management Page
// ============================================
function loadEquipmentManagement() {
    loadEquipmentManagementImpl();
}

// Store the actual implementation in window object for global access
window.loadEquipmentManagementImpl = function() {
    if (!hasPermission('inventory') && !hasPermission('all')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavItem('equipmentBtn');
    currentView = 'equipment';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">ทะเบียนพัสดุครุภัณฑ์</h1>
                    <p class="text-gray-600">จัดการข้อมูลพัสดุครุภัณฑ์ทั้งหมด</p>
                </div>
                <button id="addEquipmentBtn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-lg">
                    <i class="fas fa-plus mr-2"></i>
                    เพิ่มพัสดุใหม่
                </button>
            </div>
            
            <!-- Search and Filter Bar -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div class="search-bar">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="equipmentSearch" placeholder="ค้นหาพัสดุ..." 
                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <select id="typeFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">ประเภททั้งหมด</option>
                            <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                            <option value="เครื่องพิมพ์">เครื่องพิมพ์</option>
                            <option value="เครื่องใช้สำนักงาน">เครื่องใช้สำนักงาน</option>
                            <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                            <option value="อุปกรณ์ไฟฟ้า">อุปกรณ์ไฟฟ้า</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <select id="locationFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">สถานที่ทั้งหมด</option>
                        </select>
                    </div>
                    <div>
                        <select id="statusFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
    <option value="">สถานะทั้งหมด</option>
    <option value="active">ใช้งานปกติ</option>
    <option value="in_repair">กำลังซ่อม</option>
    <option value="maintenance">ซ่อมบำรุง</option>
    <option value="retired">จำหน่าย</option>
</select>
                    </div>
                    <div class="flex gap-2">
                        <button id="exportEquipmentBtn" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-file-excel mr-2"></i>
                            ส่งออก
                        </button>
                        <button id="printBarcodesBtn" class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-barcode mr-2"></i>
                            บาร์โค้ด
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Equipment Table -->
           <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="equipment-table-wrapper overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <!-- Checkbox -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" id="selectAll" class="custom-checkbox">
                    </th>
                    
                    <!-- รหัสพัสดุ -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รหัสพัสดุ
                    </th>
                    
                    <!-- ชื่อพัสดุ -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อพัสดุ
                    </th>
                    
                    <!-- ประเภท -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                    </th>
                    
                    <!-- ยี่ห้อ/รุ่น -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ยี่ห้อ/รุ่น
                    </th>
                    
                    <!-- สถานที่ -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานที่
                    </th>
                    
                    <!-- วันที่หมดประกัน -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันหมดประกัน
                    </th>
                    
                    <!-- สถานะ -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                    </th>
                    
                    <!-- การดำเนินการ -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การดำเนินการ
                    </th>
                </tr>
            </thead>
            <tbody id="equipmentTableBody" class="bg-white divide-y divide-gray-200">
                <!-- Table rows will be inserted here by JavaScript -->
            </tbody>
        </table>
        
        <!-- Mobile Card View จะถูกสร้างที่นี่โดย JavaScript -->
    </div>
    
    <!-- Loading state -->
    <div id="equipmentLoading" class="text-center py-12">
        <div class="inline-flex items-center">
            <i class="fas fa-spinner animate-spin text-blue-600 mr-3"></i>
            <span class="text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
    </div>
    
    <!-- Empty state -->
    <div id="equipmentEmpty" class="text-center py-12 hidden">
        <div class="text-gray-400 mb-4">
            <i class="fas fa-boxes text-6xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีพัสดุในระบบ</h3>
        <p class="text-gray-500 mb-6">เริ่มต้นด้วยการเพิ่มพัสดุครุภัณฑ์ใหม่</p>
        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" 
                onclick="showEquipmentModal()">
            <i class="fas fa-plus mr-2"></i>
            เพิ่มพัสดุใหม่
        </button>
    </div>
    
    <!-- Pagination Controls -->
    <div id="paginationControls"></div>
</div>
        </div>
        
        <!-- Equipment Modal -->
        <div id="equipmentModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center hidden">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 id="equipmentModalTitle" class="text-2xl font-bold text-gray-800">เพิ่มพัสดุใหม่</h2>
                        <button id="closeEquipmentModal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="equipmentForm" onsubmit="handleEquipmentSubmit(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">รหัสพัสดุ *</label>
                                    <input type="text" id="equipmentNumber" name="equipment_number" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                           required oninput="checkDuplicateEquipmentNumber()" onblur="generateBarcodePreview()">
                                    <div id="equipmentNumberError" class="hidden text-red-600 text-sm mt-1">
                                        <i class="fas fa-exclamation-circle"></i> รหัสพัสดุนี้มีในระบบแล้ว
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อพัสดุ *</label>
                                    <input type="text" id="equipmentName" name="name" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                           required>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                                        <select id="equipmentType" name="type" 
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                                required>
                                            <option value="">-- เลือกประเภท --</option>
                                            <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                                            <option value="เครื่องพิมพ์">เครื่องพิมพ์</option>
                                            <option value="เครื่องใช้สำนักงาน">เครื่องใช้สำนักงาน</option>
                                            <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
                                            <option value="อุปกรณ์ไฟฟ้า">อุปกรณ์ไฟฟ้า</option>
                                            <option value="อื่นๆ">อื่นๆ</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            ปีที่จัดซื้อ
                                            <span class="text-xs text-gray-500 font-normal">(ค.ศ. หรือ พ.ศ.)</span>
                                        </label>
                                        <input type="number" id="purchaseYear" name="purchase_year" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                               placeholder="เช่น 2024 หรือ 2567"
                                               min="1900" max="2700">
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">ยี่ห้อ</label>
                                        <input type="text" id="equipmentBrand" name="brand" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">รุ่น</label>
                                        <input type="text" id="equipmentModel" name="model" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">ราคาจัดซื้อ (บาท)</label>
                                        <input type="number" id="purchasePrice" name="purchase_price" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                                               step="0.01" min="0">
                                    </div>
                                    
                                    <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">สถานที่ *</label>
    <input type="text" id="equipmentLocation" name="location" 
           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
           required>
</div>

<!-- ✅ เพิ่มส่วนนี้ -->
<div>
    <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ *</label>
    <select id="equipmentStatus" name="status" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
            required>
        <option value="active">ใช้งานปกติ</option>
        <option value="in_repair">กำลังซ่อม</option>
        <option value="maintenance">ซ่อมบำรุง</option>
        <option value="retired">จำหน่าย</option>
    </select>
</div>
                                </div>
                            </div>
                            
                            <!-- Right Column -->
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">วันที่จัดซื้อ</label>
                                        <input type="date" id="purchaseDate" name="purchase_date" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">วันที่หมดประกัน</label>
                                        <input type="date" id="warrantyEndDate" name="warranty_end_date" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    </div>
                                </div>
                                
                                <!-- Image Upload -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">รูปภาพพัสดุ</label>
                                    <div class="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                        <input type="file" id="equipmentImage" name="image" accept="image/*" 
                                               class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                               onchange="previewEquipmentImage(event)">
                                        
                                        <div id="imageUploadPlaceholder">
                                            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                            <p class="text-sm text-gray-500">คลิกหรือลากรูปภาพมาวาง</p>
                                            <p class="text-xs text-gray-400">PNG, JPG, GIF ไม่เกิน 5MB</p>
                                        </div>
                                        
                                        <div id="imagePreview" class="hidden">
                                            <img id="imagePreviewImg" src="" alt="Preview" class="max-w-full h-auto max-h-48 mx-auto rounded">
                                            <button type="button" onclick="clearImagePreview()" 
                                                    class="mt-2 text-red-600 hover:text-red-800 text-sm">
                                                <i class="fas fa-times-circle"></i> ลบรูปภาพ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Barcode Preview -->
                                <div id="barcodePreview" class="hidden border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">บาร์โค้ดตัวอย่าง</label>
                                    <div id="barcodeImage" class="text-center mb-2"></div>
                                    <p id="barcodeText" class="text-center text-sm font-mono text-gray-600"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
                            <button type="button" id="cancelEquipmentBtn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                ยกเลิก
                            </button>
                            <button type="submit" id="saveEquipmentBtn" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Barcode Print Modal -->
        <div id="barcodePrintModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center hidden">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">พิมพ์บาร์โค้ด</h2>
                        <button id="closeBarcodePrintModal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนคอลัมน์</label>
                            <div class="flex space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="columns" value="2" class="mr-2" checked>
                                    2 คอลัมน์
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="columns" value="3" class="mr-2">
                                    3 คอลัมน์
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="columns" value="4" class="mr-2">
                                    4 คอลัมน์
                                </label>
                            </div>
                        </div>
                        
                        <div id="barcodePrintPreview" class="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                            <!-- Preview will be inserted here -->
                        </div>
                        
                        <div class="flex space-x-4 pt-4 border-t border-gray-200">
                            <button id="printBarcodes" class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-print mr-2"></i>
                                พิมพ์
                            </button>
                            <button id="cancelBarcodePrint" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize event listeners
    initializeEquipmentEventListeners();
    
    // Load equipment data
    loadEquipmentData();
}

// ============================================
// Initialize Event Listeners
// ============================================
function initializeEquipmentEventListeners() {
    // Add equipment button
    const addBtn = document.getElementById('addEquipmentBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showEquipmentModal());
    }
    
    // Modal close buttons
    const closeModal = document.getElementById('closeEquipmentModal');
    const cancelBtn = document.getElementById('cancelEquipmentBtn');
    if (closeModal) closeModal.addEventListener('click', hideEquipmentModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideEquipmentModal);
    
    // Search and filter
    const searchInput = document.getElementById('equipmentSearch');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterEquipment);
    if (typeFilter) typeFilter.addEventListener('change', filterEquipment);
    if (locationFilter) locationFilter.addEventListener('change', filterEquipment);
    if (statusFilter) statusFilter.addEventListener('change', filterEquipment);
    
    // Export button
    const exportBtn = document.getElementById('exportEquipmentBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportEquipmentToExcel);
    }
    
    // Barcode print button
    const printBarcodesBtn = document.getElementById('printBarcodesBtn');
    if (printBarcodesBtn) {
        printBarcodesBtn.addEventListener('click', showBarcodePrintModal);
    }
    
    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            document.querySelectorAll('.equipment-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
    }
    
    // Barcode print modal
    const closeBarcodePrint = document.getElementById('closeBarcodePrintModal');
    const cancelBarcodePrint = document.getElementById('cancelBarcodePrint');
    if (closeBarcodePrint) closeBarcodePrint.addEventListener('click', hideBarcodePrintModal);
    if (cancelBarcodePrint) cancelBarcodePrint.addEventListener('click', hideBarcodePrintModal);
    
    // Print barcodes button
    const printBarcodes = document.getElementById('printBarcodes');
    if (printBarcodes) {
        printBarcodes.addEventListener('click', printSelectedBarcodes);
    }
    
    // Column selection for barcode print
    document.querySelectorAll('input[name="columns"]').forEach(radio => {
        radio.addEventListener('change', updateBarcodePrintLayout);
    });
}

// ============================================
// Check Duplicate Equipment Number
// ============================================
function checkDuplicateEquipmentNumber() {
    const input = document.getElementById('equipmentNumber');
    const equipmentNumber = input.value.trim();
    const errorMsg = document.getElementById('equipmentNumberError');
    
    if (!equipmentNumber) {
        errorMsg.classList.add('hidden');
        input.classList.remove('border-red-500');
        return;
    }
    
    // ถ้าเป็นโหมดแก้ไข และรหัสไม่เปลี่ยน ไม่ต้องเช็ค
    if (isEditMode && currentEquipment && currentEquipment.equipment_number === equipmentNumber) {
        errorMsg.classList.add('hidden');
        input.classList.remove('border-red-500');
        return;
    }
    
    // เช็คว่ามีรหัสนี้ในระบบหรือไม่
    const isDuplicate = equipmentList.some(eq => eq.equipment_number === equipmentNumber);
    
    if (isDuplicate) {
        errorMsg.classList.remove('hidden');
        input.classList.add('border-red-500');
    } else {
        errorMsg.classList.add('hidden');
        input.classList.remove('border-red-500');
    }
}

// ============================================
// Load Equipment Data
// ============================================
function loadEquipmentData() {
    showEquipmentLoading();
    
    google.script.run
        .withSuccessHandler(onEquipmentDataLoaded)
        .withFailureHandler(onEquipmentDataError)
        .getEquipmentList(sessionId);
}

function onEquipmentDataLoaded(result) {
    hideEquipmentLoading();
    
    if (result.status === 'success') {
        equipmentList = result.equipment || [];
        filteredEquipmentList = [...equipmentList];
        
        // เก็บรายการสถานที่ที่ไม่ซ้ำกัน
        updateUniqueLocations();
        
        // อัพเดท location filter
        updateLocationFilter();
        
        // 🆕 คำนวณ pagination
        currentPage = 1;
        updatePagination();
        
        if (equipmentList.length === 0) {
            showEquipmentEmpty();
        } else {
            document.getElementById('equipmentEmpty')?.classList.add('hidden');
            renderEquipmentTable();
        }
    } else {
        showNotification(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
}

function onEquipmentDataError(error) {
    hideEquipmentLoading();
    console.error('Load equipment error:', error);
    showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
}

// ============================================
// 🆕 Pagination Functions
// ============================================
function updatePagination() {
    totalPages = Math.ceil(filteredEquipmentList.length / itemsPerPage);
    if (totalPages === 0) totalPages = 1;
    
    // ตรวจสอบว่า currentPage ไม่เกินจำนวนหน้าทั้งหมด
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    renderPaginationControls();
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('paginationControls');
    if (!paginationContainer) return;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredEquipmentList.length);
    const totalItems = filteredEquipmentList.length;
    
    if (totalItems === 0) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    paginationContainer.innerHTML = `
        <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div class="flex items-center">
                <p class="text-sm text-gray-700">
                    แสดง <span class="font-medium">${startItem}</span> ถึง 
                    <span class="font-medium">${endItem}</span> จาก 
                    <span class="font-medium">${totalItems}</span> รายการ
                </p>
            </div>
            <div class="flex items-center space-x-2">
                <button 
                    onclick="goToPage(1)" 
                    ${currentPage === 1 ? 'disabled' : ''}
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="หน้าแรก">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button 
                    onclick="goToPage(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-angle-left"></i> ก่อนหน้า
                </button>
                
                <span class="px-3 py-1 text-sm text-gray-700 font-medium">
                    หน้า ${currentPage} / ${totalPages}
                </span>
                
                <button 
                    onclick="goToPage(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    ถัดไป <i class="fas fa-angle-right"></i>
                </button>
                <button 
                    onclick="goToPage(${totalPages})" 
                    ${currentPage === totalPages ? 'disabled' : ''}
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="หน้าสุดท้าย">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        </div>
    `;
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderEquipmentTable();
    renderPaginationControls();
    
    // Scroll to top of table
    document.getElementById('equipmentTableBody')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Update Unique Locations
// ============================================
function updateUniqueLocations() {
    uniqueLocations.clear();
    equipmentList.forEach(eq => {
        if (eq.location && eq.location.trim()) {
            uniqueLocations.add(eq.location.trim());
        }
    });
}

// ============================================
// Update Location Filter Dropdown
// ============================================
function updateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');
    if (!locationFilter) return;
    
    // เก็บค่าที่เลือกไว้
    const selectedValue = locationFilter.value;
    
    // ล้าง options เดิม (ยกเว้น option แรก)
    locationFilter.innerHTML = '<option value="">สถานที่ทั้งหมด</option>';
    
    // เพิ่ม options จากรายการที่ไม่ซ้ำ (เรียงตามตัวอักษร)
    const sortedLocations = Array.from(uniqueLocations).sort();
    sortedLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
    
    // เลือกค่าเดิม (ถ้ายังมีอยู่)
    if (selectedValue && sortedLocations.includes(selectedValue)) {
        locationFilter.value = selectedValue;
    }
}

// ============================================
// MOBILE CARD - JavaScript ฉบับสมบูรณ์
// ฟังก์ชัน renderEquipmentTable() แบบเต็ม
// คัดลอกฟังก์ชันนี้ไปแทนที่ใน js-inventory.js
// ============================================

function renderEquipmentTable() {
    const tbody = document.getElementById('equipmentTableBody');
    const emptyState = document.getElementById('equipmentEmpty');
    
    // สร้าง/หา Mobile Card View container
    let mobileCardView = document.querySelector('.mobile-card-view');
    if (!mobileCardView) {
        mobileCardView = document.createElement('div');
        mobileCardView.className = 'mobile-card-view';
        const tableWrapper = tbody?.closest('.equipment-table-wrapper');
        if (tableWrapper) {
            tableWrapper.appendChild(mobileCardView);
        }
    }
    
    if (!tbody) return;
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (filteredEquipmentList.length === 0) {
        tbody.innerHTML = '';
        mobileCardView.innerHTML = '';
        emptyState?.classList.remove('hidden');
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }
    
    emptyState?.classList.add('hidden');
    
    // คำนวณ pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredEquipmentList.length);
    const currentPageItems = filteredEquipmentList.slice(startIndex, endIndex);
    
    // ============================================
    // 1. TABLE VIEW (Desktop)
    // ============================================
    tbody.innerHTML = currentPageItems.map(equipment => {
        const equipmentStatus = normalizeStatus(equipment.status);
        
        // คำนวณวันหมดประกัน (Code เดิม...)
        let warrantyHTML = '<span class="text-gray-400">-</span>';
        if (equipment.warranty_end_date) {
            const warrantyDate = new Date(equipment.warranty_end_date);
            const today = new Date();
            const daysLeft = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
            const dateDisplay = formatThaiDate(equipment.warranty_end_date);
            
            let badgeClass = daysLeft < 0 ? 'bg-red-50 text-red-700 border border-red-200' : 
                             daysLeft <= 30 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                             'bg-green-50 text-green-700 border border-green-200';
            
            warrantyHTML = `<div class="flex flex-col gap-1"><div class="text-sm font-medium text-gray-700">${dateDisplay}</div></div>`;
        }
        
        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap"><input type="checkbox" class="equipment-checkbox custom-checkbox" data-id="${equipment.id}"></td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline" onclick="showEquipmentBarcode('${equipment.equipment_number}')">
                    <i class="fas fa-barcode mr-1"></i>${equipment.equipment_number || '-'}
                </div>
            </td>
            <td class="px-6 py-4"><div class="text-sm text-gray-900">${equipment.name || '-'}</div></td>
            <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-500">${equipment.type || '-'}</div></td>
            <td class="px-6 py-4"><div class="text-sm text-gray-500">${equipment.brand || '-'} ${equipment.model || ''}</div></td>
            <td class="px-6 py-4"><div class="text-sm text-gray-500">${equipment.location || '-'}</div></td>
            <td class="px-6 py-4">${warrantyHTML}</td>
            <td class="px-6 py-4 whitespace-nowrap">${getEquipmentStatusBadge(equipmentStatus)}</td>
            
            <!-- ✅ ส่วนปุ่มดำเนินการ (Desktop) -->
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                    <button class="action-btn bg-purple-100 text-purple-600 hover:bg-purple-200" 
                            onclick="viewRepairHistory('${equipment.equipment_number}')" 
                            title="ประวัติการซ่อม">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="action-btn action-btn-view" onclick="viewEquipment('${equipment.id}')" title="ดูรายละเอียด">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn action-btn-edit" onclick="editEquipment('${equipment.id}')" title="แก้ไข">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deleteEquipment('${equipment.id}')" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    
    // ============================================
    // 2. MOBILE CARD VIEW
    // ============================================
    mobileCardView.innerHTML = currentPageItems.map(equipment => {
        // (ส่วน Code Mobile เดิม...)
        const equipmentStatus = normalizeStatus(equipment.status);
        const statusConfig = {
            'active': { bg: '#dcfce7', color: '#166534', icon: 'fa-check-circle', text: 'ใช้งานปกติ' },
            'maintenance': { bg: '#fef3c7', color: '#92400e', icon: 'fa-wrench', text: 'ซ่อมบำรุง' },
            'retired': { bg: '#fee2e2', color: '#991b1b', icon: 'fa-times-circle', text: 'จำหน่าย' }
        };
        const status = statusConfig[equipmentStatus] || statusConfig['active'];

        return `
        <div class="equipment-card" style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <span onclick="showEquipmentBarcode('${equipment.equipment_number}')" style="display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 4px 8px; border-radius: 6px; background: rgba(37, 99, 235, 0.1);">
                        <i class="fas fa-barcode" style="color: #2563eb;"></i>
                        <span style="font-weight: 700; color: #2563eb;">${equipment.equipment_number}</span>
                    </span>
                </div>
                <span style="padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${status.bg}; color: ${status.color};">
                    ${status.text}
                </span>
            </div>
            
            <!-- Body -->
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 10px;">${equipment.name}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 10px;">
                <i class="fas fa-map-marker-alt mr-1"></i> ${equipment.location || '-'}
            </div>

            <!-- ✅ Footer Buttons (Mobile) -->
            <div style="display: flex; gap: 8px; padding-top: 12px; border-top: 2px solid #f3f4f6;">
                <button onclick="viewRepairHistory('${equipment.equipment_number}')" 
                        style="flex: 1; padding: 10px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; background: #f3e8ff; color: #7e22ce;">
                    <i class="fas fa-history"></i> ประวัติ
                </button>
                <button onclick="viewEquipment('${equipment.id}')" style="flex: 1; padding: 10px; border-radius: 10px; font-size: 14px; border: none; background: #eff6ff; color: #2563eb;">
                    <i class="fas fa-eye"></i> ดู
                </button>
                <button onclick="editEquipment('${equipment.id}')" style="flex: 1; padding: 10px; border-radius: 10px; font-size: 14px; border: none; background: #fef3c7; color: #d97706;">
                    <i class="fas fa-edit"></i> แก้ไข
                </button>
                <button onclick="deleteEquipment('${equipment.id}')" style="flex: 1; padding: 10px; border-radius: 10px; font-size: 14px; border: none; background: #fee2e2; color: #dc2626;">
                    <i class="fas fa-trash"></i> ลบ
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    renderPaginationControls();
}

// ============================================
// Helper Functions (เพิ่มถ้ายังไม่มี)
// ============================================

function formatThaiDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}





// ============================================
// 🆕 Utility Function: Normalize Status
// ============================================
function normalizeStatus(status) {
    if (!status || status === '' || status === null || status === undefined) {
        return 'active';
    }
    
    let normalized = String(status).trim().toLowerCase();
    
    if (normalized === '') {
        return 'active';
    }
    
    // ✅ เพิ่ม 'in_repair'
    const validStatuses = ['active', 'in_repair', 'maintenance', 'retired'];
    if (validStatuses.includes(normalized)) {
        return normalized;
    }
    
    console.warn('Unknown status detected:', status, '-> defaulting to active');
    return 'active';
}

// ============================================
// Equipment Status Badge - 🔧 ใช้ normalizeStatus
// ============================================
function getEquipmentStatusBadge(status) {
    const currentStatus = normalizeStatus(status);
    
    const statusMap = {
        'active': { class: 'bg-green-100 text-green-800', text: 'ใช้งานปกติ', icon: 'check' },
        'in_repair': { class: 'bg-blue-100 text-blue-800', text: 'กำลังซ่อม', icon: 'tools' },
        'maintenance': { class: 'bg-yellow-100 text-yellow-800', text: 'ซ่อมบำรุง', icon: 'wrench' },
        'retired': { class: 'bg-red-100 text-red-800', text: 'จำหน่าย', icon: 'times' }
    };
    
    const statusInfo = statusMap[currentStatus] || statusMap['active'];
    return `<span class="px-2 py-1 text-xs font-medium ${statusInfo.class} rounded-full inline-flex items-center">
                <i class="fas fa-${statusInfo.icon} mr-1"></i>
                ${statusInfo.text}
            </span>`;
}


// ============================================
// Warranty Status
// ============================================
function getWarrantyStatus(warrantyEndDate) {
    if (!warrantyEndDate) return '';
    
    const endDate = new Date(warrantyEndDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return '<div class="text-xs text-red-600"><i class="fas fa-exclamation-circle"></i> หมดประกันแล้ว</div>';
    } else if (diffDays <= 30) {
        return `<div class="text-xs text-orange-600"><i class="fas fa-clock"></i> เหลือ ${diffDays} วัน</div>`;
    } else {
        return '<div class="text-xs text-green-600"><i class="fas fa-check-circle"></i> ยังไม่หมดประกัน</div>';
    }
}

// ============================================
// Show/Hide Loading
// ============================================
function showEquipmentLoading() {
    document.getElementById('equipmentLoading')?.classList.remove('hidden');
    document.getElementById('equipmentTableBody').innerHTML = '';
}

function hideEquipmentLoading() {
    document.getElementById('equipmentLoading')?.classList.add('hidden');
}

function showEquipmentEmpty() {
    document.getElementById('equipmentEmpty')?.classList.remove('hidden');
}

// ============================================
// Modal Functions - 🆕 ปรับปรุง
// ============================================
function showEquipmentModal(equipment = null) {
    isEditMode = !!equipment;
    currentEquipment = equipment;
    
    const modal = document.getElementById('equipmentModal');
    const title = document.getElementById('equipmentModalTitle');
    const form = document.getElementById('equipmentForm');
    const submitBtn = document.getElementById('saveEquipmentBtn');
    
    if (isEditMode) {
        // 🆕 โหมดแก้ไข
        title.textContent = 'แก้ไขพัสดุ';
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>บันทึกการแก้ไข';
        populateEquipmentForm(equipment);
    } else {
        // 🆕 โหมดเพิ่มใหม่
        title.textContent = 'เพิ่มพัสดุใหม่';
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>บันทึก';
        form.reset();
        clearImagePreview();
        hideBarcodePreview();
    }
    
    modal.classList.remove('hidden');
}

function hideEquipmentModal() {
    document.getElementById('equipmentModal').classList.add('hidden');
    document.getElementById('equipmentForm').reset();
    clearImagePreview();
    hideBarcodePreview();
    currentEquipment = null;
    isEditMode = false;
    
    // ล้าง error message
    document.getElementById('equipmentNumberError')?.classList.add('hidden');
    document.getElementById('equipmentNumber')?.classList.remove('border-red-500');
}

// ============================================
// Populate Form for Editing
// ============================================
function populateEquipmentForm(equipment) {
    // Basic information fields
    document.getElementById('equipmentNumber').value = equipment.equipment_number || '';
    document.getElementById('equipmentName').value = equipment.name || '';
    document.getElementById('equipmentType').value = equipment.type || '';
    document.getElementById('equipmentBrand').value = equipment.brand || '';
    document.getElementById('equipmentModel').value = equipment.model || '';
    document.getElementById('purchaseYear').value = equipment.purchase_year || '';
    document.getElementById('purchasePrice').value = equipment.purchase_price || '';
    document.getElementById('equipmentLocation').value = equipment.location || '';
    document.getElementById('purchaseDate').value = equipment.purchase_date || '';
    document.getElementById('warrantyEndDate').value = equipment.warranty_end_date || '';
    document.getElementById('equipmentStatus').value = equipment.status || 'active';
    
    // Show image if exists
    if (equipment.image_url) {
        showImagePreview(equipment.image_url);
    }
    
    // Generate barcode preview
    if (equipment.equipment_number) {
        generateBarcodePreview();
    }
}

// ============================================
// Handle Form Submission - 🆕 ปรับปรุง SweetAlert2
// ============================================
async function handleEquipmentSubmit(e) {
    e.preventDefault();
    
    // ตรวจสอบรหัสพัสดุซ้ำก่อน submit
    const equipmentNumber = document.getElementById('equipmentNumber').value.trim();
    const errorMsg = document.getElementById('equipmentNumberError');
    
    if (!isEditMode || (currentEquipment && currentEquipment.equipment_number !== equipmentNumber)) {
        const isDuplicate = equipmentList.some(eq => eq.equipment_number === equipmentNumber);
        if (isDuplicate) {
            errorMsg.classList.remove('hidden');
            document.getElementById('equipmentNumber').classList.add('border-red-500');
            
            // 🆕 SweetAlert2
            Swal.fire({
                icon: 'warning',
                title: 'รหัสพัสดุซ้ำ',
                text: 'รหัสพัสดุนี้มีในระบบแล้ว กรุณาใช้รหัสอื่น',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }
    }
    
    const form = e.target;
    
    try {
        // 🆕 แสดง loading
        Swal.fire({
            title: isEditMode ? 'กำลังแก้ไข...' : 'กำลังบันทึก...',
            html: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const formData = new FormData(form);
        const equipmentData = {};
        
        // Collect form data
        for (let [key, value] of formData.entries()) {
            if (key !== 'image') {
                equipmentData[key] = value;
            }
        }
        
       
        
        // Handle image upload
        const imageInput = document.getElementById('equipmentImage');
        if (imageInput && imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                equipmentData.image = e.target.result;
                saveEquipment(equipmentData);
            };
            
            reader.readAsDataURL(file);
        } else {
            if (isEditMode && currentEquipment?.image_url) {
                equipmentData.image_url = currentEquipment.image_url;
            }
            saveEquipment(equipmentData);
        }
        
    } catch (error) {
        console.error('Equipment submit error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้',
            confirmButtonColor: '#dc2626'
        });
    }
}

// ============================================
// Save Equipment
// ============================================
function saveEquipment(equipmentData) {
    if (isEditMode && currentEquipment) {
        google.script.run
            .withSuccessHandler(onEquipmentSaveSuccess)
            .withFailureHandler(onEquipmentSaveError)
            .updateEquipment(currentEquipment.id, equipmentData, sessionId);
    } else {
        google.script.run
            .withSuccessHandler(onEquipmentSaveSuccess)
            .withFailureHandler(onEquipmentSaveError)
            .addEquipment(equipmentData, sessionId);
    }
}

function onEquipmentSaveSuccess(result) {
    if (result.status === 'success') {
        // 🆕 SweetAlert2
        Swal.fire({
            icon: 'success',
            title: '<i class="fas fa-check-circle text-green-600"></i> สำเร็จ!',
            text: isEditMode ? 'แก้ไขพัสดุเรียบร้อยแล้ว' : 'เพิ่มพัสดุเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false
        });
        hideEquipmentModal();
        loadEquipmentData();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: result.message || 'ไม่สามารถบันทึกข้อมูลได้',
            confirmButtonColor: '#dc2626'
        });
    }
}

function onEquipmentSaveError(error) {
    console.error('Equipment save error:', error);
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626'
    });
}

// ============================================
// Equipment Actions - 🆕 ปรับปรุง SweetAlert2
// ============================================
function viewEquipment(equipmentId) {
    const equipment = equipmentList.find(eq => eq.id === equipmentId);
    if (!equipment) return;
    
    // 🔧 แก้ไข: ใช้ normalizeStatus
    const equipmentStatus = normalizeStatus(equipment.status);
    
    // คำนวณอายุพัสดุ
    const currentYear = new Date().getFullYear();
    const purchaseYear = equipment.purchase_year ? parseInt(equipment.purchase_year) : null;
    let equipmentAge = '';
    if (purchaseYear) {
        const normalizedYear = purchaseYear >= 2400 ? purchaseYear - 543 : purchaseYear;
        const age = currentYear - normalizedYear;
        equipmentAge = age > 0 ? `${age} ปี` : 'ปีนี้';
    }
    
    // คำนวณวันหมดประกัน
    let warrantyInfo = '';
    if (equipment.warranty_end_date) {
        const endDate = new Date(equipment.warranty_end_date);
        const now = new Date();
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            warrantyInfo = `<span class="text-red-600"><i class="fas fa-times-circle"></i> หมดประกันแล้ว ${Math.abs(diffDays)} วัน</span>`;
        } else if (diffDays <= 30) {
            warrantyInfo = `<span class="text-orange-600"><i class="fas fa-exclamation-triangle"></i> เหลือเวลาอีก ${diffDays} วัน</span>`;
        } else if (diffDays <= 90) {
            warrantyInfo = `<span class="text-yellow-600"><i class="fas fa-clock"></i> เหลือเวลาอีก ${diffDays} วัน</span>`;
        } else {
            warrantyInfo = `<span class="text-green-600"><i class="fas fa-check-circle"></i> ยังไม่หมดประกัน (เหลือ ${diffDays} วัน)</span>`;
        }
    }
    
    // 🆕 SweetAlert2 ที่สวยงามและครบถ้วนขึ้น
    Swal.fire({
        title: `<div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <i class="fas fa-box-open" style="color: #2563EB; font-size: 28px;"></i>
                    <span style="color: #1F2937;">${equipment.name}</span>
                </div>`,
        html: `
            <div style="text-align: left; padding: 20px 10px; max-height: 70vh; overflow-y: auto;">
                
                <!-- รูปภาพพัสดุ -->
                ${equipment.image_url ? `
                    <div style="margin-bottom: 24px; text-align: center;">
                        <img src="${equipment.image_url}" 
                             alt="Equipment" 
                             style="max-width: 100%; max-height: 300px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #E5E7EB;">
                    </div>
                ` : ''}
                
                <!-- ข้อมูลหลัก -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">
                                <i class="fas fa-barcode" style="margin-right: 6px;"></i>รหัสพัสดุ
                            </div>
                            <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
                                ${equipment.equipment_number || '-'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">
                                <i class="fas fa-info-circle" style="margin-right: 6px;"></i>สถานะ
                            </div>
                            <div style="font-size: 16px; font-weight: 600;">
                                ${getEquipmentStatusBadge(equipmentStatus)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ข้อมูลทั่วไป -->
                <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                    <h3 style="color: #1F2937; font-size: 14px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center;">
                        <i class="fas fa-clipboard-list" style="color: #3B82F6; margin-right: 8px;"></i>
                        ข้อมูลทั่วไป
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
                                <i class="fas fa-tag" style="margin-right: 6px;"></i>ประเภท
                            </div>
                            <div style="font-size: 14px; color: #1F2937; font-weight: 600;">
                                ${equipment.type || '-'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i>สถานที่
                            </div>
                            <div style="font-size: 14px; color: #1F2937; font-weight: 600;">
                                ${equipment.location || '-'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
                                <i class="fas fa-copyright" style="margin-right: 6px;"></i>ยี่ห้อ
                            </div>
                            <div style="font-size: 14px; color: #1F2937; font-weight: 600;">
                                ${equipment.brand || '-'}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
                                <i class="fas fa-cube" style="margin-right: 6px;"></i>รุ่น
                            </div>
                            <div style="font-size: 14px; color: #1F2937; font-weight: 600;">
                                ${equipment.model || '-'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ข้อมูลการจัดซื้อ -->
                <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                    <h3 style="color: #92400E; font-size: 14px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center;">
                        <i class="fas fa-shopping-cart" style="color: #F59E0B; margin-right: 8px;"></i>
                        ข้อมูลการจัดซื้อ
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                        <div>
                            <div style="font-size: 11px; color: #92400E; margin-bottom: 4px;">
                                <i class="fas fa-calendar-alt" style="margin-right: 6px;"></i>ปีที่จัดซื้อ
                            </div>
                            <div style="font-size: 14px; color: #78350F; font-weight: 600;">
                                ${equipment.purchase_year || '-'}
                                ${equipmentAge ? `<span style="font-size: 12px; color: #92400E;"> (อายุ ${equipmentAge})</span>` : ''}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #92400E; margin-bottom: 4px;">
                                <i class="fas fa-dollar-sign" style="margin-right: 6px;"></i>ราคาจัดซื้อ
                            </div>
                            <div style="font-size: 16px; color: #78350F; font-weight: 700;">
                                ${formatCurrency(equipment.purchase_price)}
                            </div>
                        </div>
                        <div style="grid-column: span 2;">
                            <div style="font-size: 11px; color: #92400E; margin-bottom: 4px;">
                                <i class="fas fa-calendar-check" style="margin-right: 6px;"></i>วันที่จัดซื้อ
                            </div>
                            <div style="font-size: 14px; color: #78350F; font-weight: 600;">
                                ${formatDate(equipment.purchase_date)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ข้อมูลการรับประกัน -->
                <div style="background: ${equipment.warranty_end_date ? '#DBEAFE' : '#F3F4F6'}; border: 1px solid ${equipment.warranty_end_date ? '#93C5FD' : '#D1D5DB'}; border-radius: 12px; padding: 20px;">
                    <h3 style="color: ${equipment.warranty_end_date ? '#1E40AF' : '#4B5563'}; font-size: 14px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center;">
                        <i class="fas fa-shield-alt" style="color: ${equipment.warranty_end_date ? '#3B82F6' : '#6B7280'}; margin-right: 8px;"></i>
                        ข้อมูลการรับประกัน
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                        <div>
                            <div style="font-size: 11px; color: ${equipment.warranty_end_date ? '#1E40AF' : '#6B7280'}; margin-bottom: 4px;">
                                <i class="fas fa-calendar-times" style="margin-right: 6px;"></i>วันที่หมดประกัน
                            </div>
                            <div style="font-size: 14px; color: ${equipment.warranty_end_date ? '#1E3A8A' : '#4B5563'}; font-weight: 600;">
                                ${formatDate(equipment.warranty_end_date)}
                            </div>
                        </div>
                        ${warrantyInfo ? `
                            <div style="padding: 12px; background: white; border-radius: 8px; font-size: 13px; font-weight: 600;">
                                ${warrantyInfo}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
            </div>
        `,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
        confirmButtonColor: '#6b7280',
        customClass: {
            popup: 'rounded-lg',
            confirmButton: 'px-6 py-2'
        }
    });
}

function editEquipment(equipmentId) {
    const equipment = equipmentList.find(eq => eq.id === equipmentId);
    if (equipment) {
        showEquipmentModal(equipment);
    }
}

function deleteEquipment(equipmentId) {
    const equipment = equipmentList.find(eq => eq.id === equipmentId);
    if (!equipment) return;
    
    // 🆕 SweetAlert2 ที่สวยงามขึ้น
    Swal.fire({
        title: '<i class="fas fa-exclamation-triangle text-red-600"></i> ยืนยันการลบ?',
        html: `
            <div class="text-center p-4">
                <p class="text-lg mb-2">คุณต้องการลบพัสดุนี้หรือไม่?</p>
                <div class="bg-gray-100 p-3 rounded-lg mt-3">
                    <p class="font-semibold text-gray-800">${equipment.name}</p>
                    <p class="text-sm text-gray-600">${equipment.equipment_number}</p>
                </div>
                <p class="text-sm text-red-600 mt-3">
                    <i class="fas fa-info-circle"></i> การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-trash mr-2"></i>ลบ',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>ยกเลิก',
        reverseButtons: true,
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
            // แสดง loading
            Swal.fire({
                title: 'กำลังลบ...',
                html: 'กรุณารอสักครู่',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            google.script.run
                .withSuccessHandler(onEquipmentDeleteSuccess)
                .withFailureHandler(onEquipmentDeleteError)
                .deleteEquipment(equipmentId, sessionId);
        }
    });
}

function onEquipmentDeleteSuccess(result) {
    if (result.status === 'success') {
        Swal.fire({
            icon: 'success',
            title: '<i class="fas fa-check-circle text-green-600"></i> สำเร็จ!',
            text: 'ลบพัสดุเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false
        });
        loadEquipmentData();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: result.message || 'ไม่สามารถลบพัสดุได้',
            confirmButtonColor: '#dc2626'
        });
    }
}

function onEquipmentDeleteError(error) {
    console.error('Delete equipment error:', error);
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626'
    });
}

// ============================================
// Image Handling
// ============================================
function previewEquipmentImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function showImagePreview(src) {
    const placeholder = document.getElementById('imageUploadPlaceholder');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('imagePreviewImg');
    
    placeholder.style.display = 'none';
    preview.classList.remove('hidden');
    previewImg.src = src;
}

function clearImagePreview() {
    const placeholder = document.getElementById('imageUploadPlaceholder');
    const preview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('equipmentImage');
    
    placeholder.style.display = 'block';
    preview.classList.add('hidden');
    imageInput.value = '';
}

// ============================================
// Barcode Functions
// ============================================
function generateBarcodePreview() {
    const equipmentNumber = document.getElementById('equipmentNumber').value;
    if (!equipmentNumber) {
        hideBarcodePreview();
        return;
    }
    
    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success') {
                const smallBarcodeUrl = result.url.replace('width=200&height=60', 'width=150&height=40');
                showBarcodePreview(smallBarcodeUrl, equipmentNumber);
            }
        })
        .withFailureHandler(function(error) {
            console.error('Barcode generation error:', error);
        })
        .generateBarcode(equipmentNumber);
}

function showBarcodePreview(barcodeUrl, text) {
    const preview = document.getElementById('barcodePreview');
    const image = document.getElementById('barcodeImage');
    const textElement = document.getElementById('barcodeText');
    
    image.innerHTML = `<img src="${barcodeUrl}" alt="Barcode" class="max-w-full h-auto mx-auto" style="max-height: 50px;">`;
    textElement.textContent = text;
    preview.classList.remove('hidden');
}

function hideBarcodePreview() {
    document.getElementById('barcodePreview')?.classList.add('hidden');
}

// ============================================
// 🆕 Show Equipment Barcode Popup
// ============================================
function showEquipmentBarcode(equipmentNumber) {
    if (!equipmentNumber) return;
    
    // หาข้อมูลพัสดุ
    const equipment = equipmentList.find(eq => eq.equipment_number === equipmentNumber);
    
    // แสดง loading
    Swal.fire({
        title: 'กำลังสร้างบาร์โค้ด...',
        html: '<i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>',
        showConfirmButton: false,
        allowOutsideClick: false
    });
    
    // เรียก Google Script เพื่อสร้างบาร์โค้ด
    google.script.run
        .withSuccessHandler(function(result) {
            if (result.status === 'success') {
                showBarcodeModal(equipmentNumber, result.url, equipment);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างบาร์โค้ดได้',
                    confirmButtonColor: '#dc2626'
                });
            }
        })
        .withFailureHandler(function(error) {
            console.error('Barcode generation error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                confirmButtonColor: '#dc2626'
            });
        })
        .generateBarcode(equipmentNumber);
}

function showBarcodeModal(equipmentNumber, barcodeUrl, equipment) {
    Swal.fire({
        title: `<div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                    <i class="fas fa-barcode" style="color: #2563EB; font-size: 28px;"></i>
                    <span style="color: #1F2937;">บาร์โค้ดพัสดุ</span>
                </div>`,
        html: `
            <div style="text-align: center; padding: 20px 10px;">
                
                <!-- รหัสพัสดุ -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="color: rgba(255,255,255,0.9); font-size: 12px; margin-bottom: 8px;">
                        รหัสพัสดุ
                    </div>
                    <div style="color: white; font-size: 32px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                        ${equipmentNumber}
                    </div>
                </div>
                
                <!-- บาร์โค้ด -->
                <div style="background: white; border: 3px solid #E5E7EB; border-radius: 12px; padding: 30px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <img src="${barcodeUrl}" 
                         alt="Barcode" 
                         style="width: 400px; height: 120px; display: block; margin: 0 auto; object-fit: contain;">
                </div>
                
                ${equipment ? `
                    <!-- ข้อมูลพัสดุ -->
                    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; text-align: left;">
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px; font-size: 14px;">
                            <div style="color: #6B7280;">
                                <i class="fas fa-tag" style="margin-right: 6px;"></i>ชื่อพัสดุ:
                            </div>
                            <div style="color: #1F2937; font-weight: 600;">
                                ${equipment.name || '-'}
                            </div>
                            
                            <div style="color: #6B7280;">
                                <i class="fas fa-cube" style="margin-right: 6px;"></i>ประเภท:
                            </div>
                            <div style="color: #1F2937; font-weight: 600;">
                                ${equipment.type || '-'}
                            </div>
                            
                            <div style="color: #6B7280;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i>สถานที่:
                            </div>
                            <div style="color: #1F2937; font-weight: 600;">
                                ${equipment.location || '-'}
                            </div>
                            
                            <div style="color: #6B7280;">
                                <i class="fas fa-info-circle" style="margin-right: 6px;"></i>สถานะ:
                            </div>
                            <div>
                                ${getEquipmentStatusBadge(normalizeStatus(equipment.status))}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- คำแนะนำ -->
                <div style="margin-top: 20px; padding: 12px; background: #DBEAFE; border: 1px solid #93C5FD; border-radius: 8px; font-size: 13px; color: #1E40AF;">
                    <i class="fas fa-info-circle" style="margin-right: 6px;"></i>
                    คลิกขวาที่บาร์โค้ดเพื่อบันทึกรูปภาพ
                </div>
                
            </div>
        `,
        width: '600px',
        showCloseButton: true,
        confirmButtonText: '<i class="fas fa-times mr-2"></i>ปิด',
        confirmButtonColor: '#6b7280',
        customClass: {
            popup: 'rounded-lg',
            confirmButton: 'px-6 py-2'
        }
    });
}


// ============================================
// Download Barcode
// ============================================
function downloadBarcode(barcodeUrl, equipmentNumber) {
    const link = document.createElement('a');
    link.href = barcodeUrl;
    link.download = `barcode_${equipmentNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({
        icon: 'success',
        title: 'ดาวน์โหลดเรียบร้อย',
        text: `บันทึกบาร์โค้ด ${equipmentNumber} แล้ว`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ============================================
// Barcode Print Modal
// ============================================
function showBarcodePrintModal() {
    const selectedCheckboxes = document.querySelectorAll('.equipment-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบรายการที่เลือก',
            text: 'กรุณาเลือกพัสดุที่ต้องการพิมพ์บาร์โค้ด',
            confirmButtonColor: '#f59e0b'
        });
        return;
    }
    
    const selectedEquipment = getSelectedEquipment();
    updateBarcodePrintPreview(selectedEquipment, 2);
    
    document.getElementById('barcodePrintModal').classList.remove('hidden');
}

function hideBarcodePrintModal() {
    document.getElementById('barcodePrintModal').classList.add('hidden');
}

function getSelectedEquipment() {
    const checkboxes = document.querySelectorAll('.equipment-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.id);
    return equipmentList.filter(eq => selectedIds.includes(eq.id));
}

function updateBarcodePrintLayout() {
    const columns = document.querySelector('input[name="columns"]:checked').value;
    const selectedEquipment = getSelectedEquipment();
    updateBarcodePrintPreview(selectedEquipment, columns);
}

function updateBarcodePrintPreview(items, columns) {
    const preview = document.getElementById('barcodePrintPreview');
    const gridClass = `grid-cols-${columns}`;
    
    preview.innerHTML = `
        <div class="grid ${gridClass} gap-4">
            ${items.map(item => `
                <div class="border border-gray-300 p-3 text-center bg-white rounded">
                    <img src="https://barcode.orcascan.com/?type=code128&data=${encodeURIComponent(item.equipment_number)}&format=png&width=150&height=40" 
                         alt="Barcode" class="mx-auto mb-2">
                    <p class="text-xs font-mono">${item.equipment_number}</p>
                    <p class="text-xs text-gray-600 mt-1 truncate">${item.name}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function printSelectedBarcodes() {
    const selectedEquipment = getSelectedEquipment();
    
    if (selectedEquipment.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่มีรายการที่เลือก',
            text: 'กรุณาเลือกพัสดุที่ต้องการพิมพ์',
            confirmButtonColor: '#f59e0b'
        });
        return;
    }
    
    const columns = document.querySelector('input[name="columns"]:checked').value;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถเปิดหน้าพิมพ์ได้',
            text: 'กรุณาอนุญาตให้เปิด popup window',
            confirmButtonColor: '#ef4444'
        });
        return;
    }
    
    // สร้าง HTML header
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>พิมพ์บาร์โค้ด - ${new Date().toLocaleDateString('th-TH')}</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Sarabun', 'Tahoma', sans-serif;
                    padding: 20px;
                    background: white;
                }
                
                h1 {
                    text-align: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #1f2937;
                }
                
                .barcode-grid {
                    display: grid;
                    grid-template-columns: repeat(${columns}, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .barcode-item {
                    border: 1px solid #d1d5db;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    page-break-inside: avoid;
                }
                
                .barcode-item svg {
                    max-width: 100%;
                    height: auto;
                    margin: 10px 0;
                }
                
                .barcode-number {
                    font-weight: bold;
                    font-size: 14px;
                    margin: 8px 0;
                    font-family: monospace;
                    word-break: break-all;
                }
                
                .barcode-name {
                    font-size: 12px;
                    color: #6b7280;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .print-info {
                    page-break-before: avoid;
                }
                
                @media print {
                    body {
                        padding: 10mm;
                    }
                    
                    .print-info {
                        page-break-before: avoid;
                    }
                    
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                }
            </style>
        </head>
        <body>
            <h1>บาร์โค้ดพัสดุครุภัณฑ์</h1>
            
            <div class="barcode-grid">
    `;
    
    // เพิ่มแต่ละ barcode item
    selectedEquipment.forEach(item => {
        const idSafe = item.equipment_number.replace(/[^a-zA-Z0-9]/g, '');
        printContent += `
                <div class="barcode-item">
                    <svg id="barcode-${idSafe}"></svg>
                    <div class="barcode-number">${item.equipment_number}</div>
                    <div class="barcode-name" title="${item.name}">${item.name || '-'}</div>
                </div>
        `;
    });
    
    // สร้าง footer
    printContent += `
            </div>
            
            <div class="print-info">
                พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')} | จำนวน: ${selectedEquipment.length} รายการ
            </div>
            
            <script>
                const equipmentData = ${JSON.stringify(selectedEquipment)};
                
                // สร้าง barcode ทั้งหมด
                equipmentData.forEach(item => {
                    const idSafe = item.equipment_number.replace(/[^a-zA-Z0-9]/g, '');
                    try {
                        JsBarcode('#barcode-' + idSafe, item.equipment_number, {
                            format: 'CODE128',
                            width: 2,
                            height: 50,
                            displayValue: false
                        });
                    } catch (e) {
                        console.error('Barcode error:', e);
                    }
                });
                
                // เรียก print หลังจาก barcode สร้างเสร็จ
                setTimeout(() => {
                    window.print();
                }, 500);
                
                window.onafterprint = function() {
                    setTimeout(() => window.close(), 500);
                };
            <\/script>
        </body>
        </html>
    `;
    
    // ใช้ Blob URL
    try {
        const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        printWindow.location.href = url;
    } catch (e) {
        console.error('Error creating print window:', e);
        // fallback: ใช้ setTimeout และ document.write
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
    
    hideBarcodePrintModal();
    
    Swal.fire({
        icon: 'success',
        title: 'กำลังเตรียมพิมพ์',
        text: `เตรียมพิมพ์บาร์โค้ด ${selectedEquipment.length} รายการ`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ============================================
// Filter Equipment - 🆕 รองรับ Pagination และแก้ปัญหาการกรอง
// ============================================
function filterEquipment() {
    const search = document.getElementById('equipmentSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    filteredEquipmentList = equipmentList.filter(equipment => {
        const matchSearch = !search || 
            (equipment.equipment_number && equipment.equipment_number.toLowerCase().includes(search)) ||
            (equipment.name && equipment.name.toLowerCase().includes(search)) ||
            (equipment.brand && equipment.brand.toLowerCase().includes(search)) ||
            (equipment.model && equipment.model.toLowerCase().includes(search));
            
        const matchType = !typeFilter || equipment.type === typeFilter;
        const matchLocation = !locationFilter || equipment.location === locationFilter;
        
        // 🔧 แก้ไข: ทำความสะอาด status และเปรียบเทียบอย่างถูกต้อง
        let equipmentStatus = equipment.status || 'active';
        
        // ตัดช่องว่างหน้าและหลัง และแปลงเป็นตัวพิมพ์เล็ก
        if (typeof equipmentStatus === 'string') {
            equipmentStatus = equipmentStatus.trim().toLowerCase();
        }
        
        // ถ้าเป็นค่าว่าง ให้เป็น active
        if (!equipmentStatus || equipmentStatus === '') {
            equipmentStatus = 'active';
        }
        
        // เปรียบเทียบ status
        const matchStatus = !statusFilter || equipmentStatus === statusFilter.toLowerCase();
        
        return matchSearch && matchType && matchLocation && matchStatus;
    });
    
    // 🆕 รีเซ็ตไปหน้า 1 เมื่อกรอง
    currentPage = 1;
    updatePagination();
    renderEquipmentTable();
    
    // 🐛 Debug: แสดงข้อมูลใน console
    console.log('Filter applied:', {
        statusFilter,
        totalEquipment: equipmentList.length,
        filteredCount: filteredEquipmentList.length,
        statusCounts: countStatusInList()
    });
}

// 🆕 ฟังก์ชันช่วยนับจำนวนแต่ละ status (สำหรับ debug)
function countStatusInList() {
    const counts = { active: 0, in_repair: 0, maintenance: 0, retired: 0, undefined: 0, other: 0 };
    
    equipmentList.forEach(eq => {
        let status = eq.status || 'active';
        if (typeof status === 'string') {
            status = status.trim().toLowerCase();
        }
        
        if (!status || status === '') {
            counts.undefined++;
        } else if (status === 'active') {
            counts.active++;
        } else if (status === 'in_repair') {
            counts.in_repair++;
        } else if (status === 'maintenance') {
            counts.maintenance++;
        } else if (status === 'retired') {
            counts.retired++;
        } else {
            counts.other++;
            console.log('Unknown status found:', status, 'in equipment:', eq.equipment_number);
        }
    });
    
    return counts;
}

// ============================================
// Export to Excel
// ============================================
function exportEquipmentToExcel() {
    Swal.fire({
        title: 'กำลังสร้างไฟล์...',
        html: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    google.script.run
        .withSuccessHandler(function(result) {
            Swal.close();
            if (result.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: 'สร้างไฟล์ Excel เรียบร้อยแล้ว',
                    confirmButtonText: 'เปิดไฟล์',
                    showCancelButton: true,
                    cancelButtonText: 'ปิด'
                }).then((clickResult) => {
    if (clickResult.isConfirmed && result.url) {
        window.open(result.url, '_blank');
    }
});
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: result.message || 'ไม่สามารถสร้างไฟล์ได้'
                });
            }
        })
        .withFailureHandler(function(error) {
            Swal.close();
            console.error('Export error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถส่งออกข้อมูลได้'
            });
        })
        .exportEquipmentToExcel(sessionId);
}

// ============================================
// 🐛 Debug Function - ตรวจสอบ status ของพัสดุ
// ============================================
function debugEquipmentStatus(equipmentNumber) {
    const equipment = equipmentList.find(eq => eq.equipment_number === equipmentNumber);
    
    if (!equipment) {
        console.error('ไม่พบพัสดุ:', equipmentNumber);
        return;
    }
    
    console.log('=== Debug Equipment Status ===');
    console.log('รหัสพัสดุ:', equipment.equipment_number);
    console.log('ชื่อ:', equipment.name);
    console.log('Status (original):', equipment.status);
    console.log('Status type:', typeof equipment.status);
    console.log('Status length:', equipment.status ? equipment.status.length : 0);
    console.log('Status (normalized):', normalizeStatus(equipment.status));
    console.log('Status bytes:', equipment.status ? [...equipment.status].map(c => c.charCodeAt(0)) : []);
    console.log('============================');
    
    // แสดง alert สำหรับผู้ใช้
    Swal.fire({
        title: 'Debug Status',
        html: `
            <div class="text-left">
                <p><strong>รหัสพัสดุ:</strong> ${equipment.equipment_number}</p>
                <p><strong>ชื่อ:</strong> ${equipment.name}</p>
                <p><strong>Status ที่เก็บ:</strong> <code>"${equipment.status}"</code></p>
                <p><strong>ประเภทข้อมูล:</strong> ${typeof equipment.status}</p>
                <p><strong>ความยาว:</strong> ${equipment.status ? equipment.status.length : 0} ตัวอักษร</p>
                <p><strong>Status (normalized):</strong> <code>"${normalizeStatus(equipment.status)}"</code></p>
            </div>
        `,
        icon: 'info',
        width: '600px'
    });
}

// เพิ่มปุ่ม debug ในหน้าจัดการพัสดุ (เรียกผ่าน console)
window.debugEquipmentStatus = debugEquipmentStatus;

// ============================================
// Utility Functions
// ============================================

// Make showEquipmentBarcode global
window.showEquipmentBarcode = showEquipmentBarcode;

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('th-TH', { 
        style: 'currency', 
        currency: 'THB' 
    }).format(amount);
}

function showNotification(message, type = 'info') {
    // Fallback notification if SweetAlert2 not available
    if (typeof Swal === 'undefined') {
        alert(message);
        return;
    }
    
    const icons = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    Swal.fire({
        icon: icons[type] || 'info',
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// ============================================
// 📜 View Repair History Function
// ============================================
function viewRepairHistory(equipmentNumber) {
    if (!equipmentNumber) return;

    // แสดง Loading
    Swal.fire({
        title: 'กำลังโหลดประวัติ...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // เรียก Backend
    google.script.run
        .withSuccessHandler((result) => {
            Swal.close();
            if (result.status === 'success') {
                showHistoryModal(equipmentNumber, result.repairs);
            } else {
                Swal.fire('เกิดข้อผิดพลาด', result.message, 'error');
            }
        })
        .withFailureHandler((error) => {
            Swal.close();
            console.error('Error fetching history:', error);
            Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        })
        .getEquipmentRepairHistory(equipmentNumber);
}

// ============================================
// 📜 Show History Modal (Enhanced UX/UI)
// ============================================
function showHistoryModal(equipmentNumber, repairs) {
    let contentHtml = '';

    // 1. คำนวณสรุปยอดรวม (Summary Dashboard)
    const totalRepairs = repairs.length;
    const totalCost = repairs.reduce((sum, r) => sum + (Number(r.repair_cost) || 0), 0);
    const lastRepairDate = repairs.length > 0 ? new Date(repairs[0].created_at).toLocaleDateString('th-TH') : '-';
    
    const summaryHtml = `
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                <div class="text-xs text-blue-500 font-medium uppercase tracking-wider">จำนวนครั้ง</div>
                <div class="text-xl font-bold text-blue-700 mt-1">${totalRepairs}</div>
            </div>
            <div class="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                <div class="text-xs text-green-500 font-medium uppercase tracking-wider">ค่าใช้จ่ายรวม</div>
                <div class="text-xl font-bold text-green-700 mt-1">฿${totalCost.toLocaleString()}</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center">
                <div class="text-xs text-purple-500 font-medium uppercase tracking-wider">ซ่อมล่าสุด</div>
                <div class="text-xl font-bold text-purple-700 mt-1">${lastRepairDate}</div>
            </div>
        </div>
    `;

    // 2. ตรวจสอบข้อมูลว่าง
    if (repairs.length === 0) {
        contentHtml = `
            <div class="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <i class="fas fa-clipboard-check text-3xl text-green-200"></i>
                </div>
                <p class="font-medium">ไม่พบประวัติการซ่อม</p>
                <p class="text-xs mt-1">พัสดุนี้ยังไม่เคยมีการแจ้งซ่อม</p>
            </div>
        `;
    } else {
        // 3. สร้าง Timeline รายการซ่อม
        const historyItems = repairs.map((repair, index) => {
            // แปลงวันที่
            const createDate = new Date(repair.created_at);
            const dateStr = createDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = createDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            
            // Config สถานะ
            const statusConfig = {
                'pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'fa-clock', text: 'รอดำเนินการ' },
                'in_progress': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'fa-tools', text: 'กำลังซ่อม' },
                'completed': { color: 'bg-green-100 text-green-700 border-green-200', icon: 'fa-check-circle', text: 'เสร็จสิ้น' },
                'cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: 'fa-times-circle', text: 'ยกเลิก' }
            };
            const status = statusConfig[repair.status] || statusConfig['pending'];

            // แปลง Spare Parts (ถ้ามี)
            let sparePartsHtml = '';
            if (repair.spare_parts) {
                let parts = [];
                try {
                    parts = typeof repair.spare_parts === 'string' ? JSON.parse(repair.spare_parts) : repair.spare_parts;
                } catch(e) { parts = []; }

                if (parts && parts.length > 0) {
                    const partsList = parts.map(p => 
                        `<div class="flex justify-between text-xs text-gray-600 border-b border-dashed border-gray-200 py-1 last:border-0">
                            <span>• ${p.name || p.part_name} (x${p.qty || p.quantity})</span>
                            <span>฿${Number(p.total_cost || (p.price * p.qty)).toLocaleString()}</span>
                         </div>`
                    ).join('');
                    
                    sparePartsHtml = `
                        <div class="mt-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
                            <div class="text-[10px] font-semibold text-gray-500 uppercase mb-1">อะไหล่ที่ใช้</div>
                            ${partsList}
                        </div>
                    `;
                }
            }

            // รูปภาพ (ถ้ามี)
            let imagesHtml = '';
            if (repair.image_url || repair.repair_image_url) {
                imagesHtml = `<div class="flex gap-2 mt-3 overflow-x-auto pb-1">`;
                if (repair.image_url) {
                    imagesHtml += `<img src="${repair.image_url}" class="h-16 w-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80" onclick="window.open('${repair.image_url}')" title="รูปปัญหา">`;
                }
                if (repair.repair_image_url) {
                    imagesHtml += `<img src="${repair.repair_image_url}" class="h-16 w-16 object-cover rounded-lg border border-green-200 cursor-pointer hover:opacity-80 ring-2 ring-green-100" onclick="window.open('${repair.repair_image_url}')" title="รูปหลังซ่อม">`;
                }
                imagesHtml += `</div>`;
            }

            // หมายเหตุช่าง
            const technicianNote = repair.repair_notes ? 
                `<div class="mt-2 text-xs text-gray-600 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                    <i class="fas fa-comment-dots mr-1 text-yellow-500"></i> ช่าง: "${repair.repair_notes}"
                 </div>` : '';

            // Timeline Item UI
            return `
                <div class="relative pl-8 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0 group">
                    <!-- Dot -->
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-[3px] ${repair.status === 'completed' ? 'border-green-500' : 'border-gray-300'} group-hover:border-blue-500 transition-colors shadow-sm"></div>
                    
                    <!-- Card -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 relative overflow-hidden">
                        
                        <!-- Header -->
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="text-sm font-bold text-gray-800">${repair.problem_description}</div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    <i class="far fa-calendar-alt mr-1"></i>${dateStr} <span class="text-gray-300">|</span> <i class="far fa-clock mr-1"></i>${timeStr}
                                </div>
                            </div>
                            <span class="text-[10px] px-2 py-1 rounded-lg border font-medium flex items-center gap-1 ${status.color}">
                                <i class="fas ${status.icon}"></i> ${status.text}
                            </span>
                        </div>

                        <!-- Details -->
                        <div class="flex flex-wrap gap-y-1 gap-x-4 text-xs text-gray-500 mt-2">
                            <span class="flex items-center"><i class="fas fa-user-circle mr-1.5 text-gray-400"></i>แจ้งโดย: ${repair.reporter_name}</span>
                            ${repair.technician_name ? `<span class="flex items-center"><i class="fas fa-tools mr-1.5 text-blue-400"></i>ช่าง: ${repair.technician_name}</span>` : ''}
                        </div>

                        <!-- Extra Info -->
                        ${sparePartsHtml}
                        ${technicianNote}
                        ${imagesHtml}

                        <!-- Cost Footer -->
                        ${repair.repair_cost > 0 ? `
                            <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end items-center">
                                <span class="text-xs text-gray-500 mr-2">ค่าซ่อมสุทธิ:</span>
                                <span class="text-sm font-bold text-green-600">฿${Number(repair.repair_cost).toLocaleString()}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        contentHtml = `
            ${summaryHtml}
            <div class="relative mt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                ${historyItems}
            </div>
        `;
    }

    Swal.fire({
        title: `
            <div class="flex items-center justify-center gap-2 text-xl font-bold text-gray-800">
                <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <i class="fas fa-history text-sm"></i>
                </div>
                ประวัติการซ่อม
            </div>
        `,
        html: `
            <div class="text-left">
                <div class="flex items-center justify-center mb-6">
                    <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                        <i class="fas fa-barcode mr-2 text-gray-400"></i>${equipmentNumber}
                    </span>
                </div>
                ${contentHtml}
            </div>
        `,
        width: '600px',
        showConfirmButton: false,
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'ปิดหน้าต่าง',
        cancelButtonColor: '#6B7280',
        padding: '1.5rem',
        customClass: {
            popup: 'rounded-2xl',
            closeButton: 'focus:outline-none'
        }
    });
}
</script>
