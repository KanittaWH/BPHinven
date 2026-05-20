<script>
// ============================================
// Reports Management - ฉบับสมบูรณ์
// พร้อม Mobile Card View + Pagination
// Version: 2.0 Complete
// ============================================

let reportData = {
    repairs: [],
    costs: {},
    equipment: [],
    technicians: [],
    dateRange: {
        from: null,
        to: null
    }
};
let currentReportTab = 'repairs';
let reportCharts = {};

// Pagination Variables
let currentReportPage = 1;
const reportsPerPage = 20;
let totalReportPages = 1;

// ============================================
// Load Reports Page
// ============================================
function loadReports() {
    loadReportsImpl();
}

window.loadReportsImpl = function() {
    if (!hasPermission('reports') && !hasPermission('all')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavItem('reportsBtn');
    currentView = 'reports';
    
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">รายงาน</h1>
                    <p class="text-gray-600">รายงานสถิติและการวิเคราะห์ข้อมูลระบบ</p>
                </div>
            </div>
            
            <!-- Date Range Filter -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ตั้งแต่วันที่</label>
                        <input type="date" id="reportDateFrom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ถึงวันที่</label>
                        <input type="date" id="reportDateTo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทรายงาน</label>
                        <select id="reportPeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="all">ทั้งหมด</option>
                            <option value="monthly">รายเดือน</option>
                            <option value="quarterly">รายไตรมาส</option>
                            <option value="yearly">รายปี</option>
                        </select>
                    </div>
                    <button id="generateReportBtn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-chart-bar mr-2"></i>
                        สร้างรายงาน
                    </button>
                    <button id="exportPdfBtn" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors hidden">
                        <i class="fas fa-file-pdf mr-2"></i>
                        ส่งออก PDF
                    </button>
                </div>
            </div>
            
            <!-- Report Tabs -->
            <div class="bg-white rounded-lg shadow-md mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <button id="repairsTab" onclick="switchReportTab('repairs')" class="report-tab border-b-2 border-blue-500 text-blue-600 py-4 px-6 font-medium transition-colors">
                            <i class="fas fa-tools mr-2"></i>
                            รายงานการซ่อม
                        </button>
                        <button id="costsTab" onclick="switchReportTab('costs')" class="report-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-6 font-medium transition-colors">
                            <i class="fas fa-dollar-sign mr-2"></i>
                            รายงานค่าใช้จ่าย
                        </button>
                        <button id="equipmentTab" onclick="switchReportTab('equipment')" class="report-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-6 font-medium transition-colors">
                            <i class="fas fa-box mr-2"></i>
                            รายงานพัสดุ
                        </button>
                        <button id="techniciansTab" onclick="switchReportTab('technicians')" class="report-tab border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-6 font-medium transition-colors">
                            <i class="fas fa-user-tie mr-2"></i>
                            รายงานช่าง
                        </button>
                    </nav>
                </div>
                
                <!-- Report Content -->
                <div id="reportContent" class="p-6">
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-chart-line text-6xl mb-4 text-gray-300"></i>
                        <p>กรุณาเลือกช่วงวันที่และกดปุ่ม "สร้างรายงาน"</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    initializeReportsEventListeners();
    setDefaultDateRange();
    switchReportTab('repairs');
}

// ============================================
// Initialize Event Listeners
// ============================================
function initializeReportsEventListeners() {
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    document.getElementById('reportDateFrom')?.addEventListener('change', generateReport);
    document.getElementById('reportDateTo')?.addEventListener('change', generateReport);
    document.getElementById('reportPeriod')?.addEventListener('change', generateReport);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportReportToPDF);
}

// ============================================
// Set Default Date Range
// ============================================
function setDefaultDateRange() {
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)); // ขยายเป็น 90 วันเพื่อจับข้อมูลตัวอย่าง
    
    document.getElementById('reportDateFrom').value = ninetyDaysAgo.toISOString().split('T')[0];
    document.getElementById('reportDateTo').value = today.toISOString().split('T')[0];
}

// ============================================
// Switch Report Tab
// ============================================
function switchReportTab(tab) {
    currentReportTab = tab;
    currentReportPage = 1; // Reset pagination
    
    // Update tab styles
    document.querySelectorAll('.report-tab').forEach(tabElement => {
        tabElement.classList.remove('border-blue-500', 'text-blue-600');
        tabElement.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.getElementById(tab + 'Tab');
    if (activeTab) {
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-blue-500', 'text-blue-600');
    }
    
    generateReport();
}

// ============================================
// Generate Report
// ============================================
async function generateReport() {
    try {
        showReportLoading();
        
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        const period = document.getElementById('reportPeriod').value;
        
        if (!dateFrom || !dateTo) {
            showNotification('กรุณาเลือกช่วงวันที่', 'warning');
            hideReportLoading();
            return;
        }
        
        switch (currentReportTab) {
            case 'repairs':
                await loadRepairsReport(dateFrom, dateTo, period);
                break;
            case 'costs':
                await loadCostsReport(dateFrom, dateTo, period);
                break;
            case 'equipment':
                await loadEquipmentReport(dateFrom, dateTo, period);
                break;
            case 'technicians':
                await loadTechniciansReport(dateFrom, dateTo, period);
                break;
        }
        
    } catch (error) {
        console.error('Generate report error:', error);
        showNotification('เกิดข้อผิดพลาดในการสร้างรายงาน', 'error');
        hideReportLoading();
    }
}

// ============================================
// GET SAMPLE REPAIR DATA (For Fallback/Demo)
// ============================================
function getSampleRepairData() {
    return [
        {
            id: 'sample1',
            equipment_number: 'EQ001',
            equipment_name: 'เครื่องคอมพิวเตอร์ Dell OptiPlex',
            equipment_type: 'คอมพิวเตอร์',
            equipment_brand: 'Dell',
            equipment_model: 'OptiPlex 7090',
            equipment_location: 'อาคาร A ชั้น 1',
            reporter_name: 'นายสมชาย ใจดี',
            reporter_contact: '081-234-5678',
            priority: 'normal',
            problem_description: 'คอมพิวเตอร์เปิดไม่ติด จอดับ',
            status: 'pending',
            technician_name: '',
            repair_cost: 0,
            repair_note: '',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample2',
            equipment_number: 'EQ002',
            equipment_name: 'เครื่องพิมพ์ HP LaserJet',
            equipment_type: 'เครื่องพิมพ์',
            equipment_brand: 'HP',
            equipment_model: 'LaserJet Pro M404dn',
            equipment_location: 'อาคาร A ชั้น 2',
            reporter_name: 'นางสาวสุดา รักงาน',
            reporter_contact: '082-345-6789',
            priority: 'urgent',
            problem_description: 'เครื่องพิมพ์ติดกระดาษบ่อย พิมพ์ไม่ออก',
            status: 'in_progress',
            technician_name: 'นายช่าง มือดี',
            repair_cost: 500,
            repair_note: 'กำลังตรวจสอบและทำความสะอาดโรลเลอร์',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// ============================================
// REPAIRS REPORT
// ============================================
async function loadRepairsReport(dateFrom, dateTo, period) {
    const sessionId = localStorage.getItem('sessionId');
    
    google.script.run
        .withSuccessHandler(onRepairsReportLoaded)
        .withFailureHandler(onReportError)
        .getRepairReports(sessionId, dateFrom, dateTo);
}

function onRepairsReportLoaded(result) {
    hideReportLoading();
    console.log('✅ Repairs Report Loaded:', result);
    
    if (result.status === 'success') {
        reportData.repairs = result.reports || [];
        console.log('📊 Repairs count:', reportData.repairs.length);
        
        // บันทึกช่วงวันที่
        reportData.dateRange.from = document.getElementById('reportDateFrom').value;
        reportData.dateRange.to = document.getElementById('reportDateTo').value;
        
        // ถ้าไม่มีข้อมูล ให้แสดงข้อมูลตัวอย่าง
        if (reportData.repairs.length === 0) {
            console.warn('⚠️ No repairs data, using sample data');
            reportData.repairs = getSampleRepairData();
        }
        
        renderRepairsReport();
    } else {
        console.error('❌ Error loading repairs:', result.message);
        showNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน', 'error');
    }
}

function renderRepairsReport() {
    const content = document.getElementById('reportContent');
    const repairs = reportData.repairs;
    const period = document.getElementById('reportPeriod').value;
    
    // ✅ แสดงปุ่ม Export PDF
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.classList.remove('hidden');
    }
    
    // ✅ เพิ่ม error handling ตรวจสอบ element
    if (!content) {
        console.error('reportContent element not found');
        showNotification('ไม่พบ element สำหรับแสดงรายงาน', 'error');
        return;
    }
    
    // ✅ ตรวจสอบว่ามีข้อมูล repairs
    if (!repairs || repairs.length === 0) {
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-inbox text-gray-400 text-6xl mb-4"></i>
                <p class="text-gray-600 text-lg">ไม่มีข้อมูลการซ่อมสำหรับช่วงวันที่ที่เลือก</p>
            </div>
        `;
        return;
    }
    
    // Calculate statistics
    const stats = calculateRepairStats(repairs);
    const chartData = prepareRepairChartData(repairs, period);
    
    // Calculate pagination
    totalReportPages = Math.ceil(repairs.length / reportsPerPage);
    const startIndex = (currentReportPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, repairs.length);
    const pageData = repairs.slice(startIndex, endIndex);
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-blue-100 text-sm">รายการซ่อมทั้งหมด</p>
                            <p class="text-3xl font-bold">${stats.total}</p>
                        </div>
                        <i class="fas fa-tools text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-green-100 text-sm">ซ่อมเสร็จแล้ว</p>
                            <p class="text-3xl font-bold">${stats.completed}</p>
                        </div>
                        <i class="fas fa-check-circle text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-yellow-100 text-sm">กำลังดำเนินการ</p>
                            <p class="text-3xl font-bold">${stats.inProgress}</p>
                        </div>
                        <i class="fas fa-wrench text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-red-100 text-sm">เร่งด่วน</p>
                            <p class="text-3xl font-bold">${stats.urgent}</p>
                        </div>
                        <i class="fas fa-exclamation-triangle text-3xl opacity-80"></i>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">แนวโน้มการซ่อม</h3>
                    <canvas id="repairTrendChart" style="height: 300px;"></canvas>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">สถานะการซ่อม</h3>
                    <canvas id="repairStatusChart" style="height: 300px;"></canvas>
                </div>
            </div>
            
            <!-- Data Table -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b bg-gray-50">
                    <h3 class="text-lg font-semibold">รายละเอียดการซ่อม</h3>
                </div>
                
                <div class="report-table-wrapper overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่แจ้ง</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้แจ้ง</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ปัญหา</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ระยะเวลาซ่อม (นาที/ชม./วัน)</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ค่าใช้จ่าย</th>
                            </tr>
                        </thead>
                        <tbody id="reportTableBody" class="bg-white divide-y divide-gray-200">
                            ${pageData.map((repair, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-center text-sm text-gray-500">${startIndex + index + 1}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(repair.created_at)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${repair.equipment_number || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${repair.equipment_name || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${repair.reporter_name || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">${repair.problem_description || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">${getStatusBadge(repair.status)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">${calculateRepairDuration(repair)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatCurrency(repair.repair_cost || 0)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                ${repairs.length > reportsPerPage ? `
                    <div id="reportPagination" class="bg-white p-4 border-t">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-list mr-2"></i>
                                รายการทั้งหมด: <span class="font-semibold text-gray-800">${repairs.length}</span> รายการ
                            </div>
                            <div id="reportPaginationButtons" class="flex items-center gap-2"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Render Mobile Cards
    renderReportMobileCards(pageData, startIndex, 'repairs');
    
    // Render Pagination
    if (repairs.length > reportsPerPage) {
        renderReportPagination();
    }
    
    // Create Charts
    setTimeout(() => {
        createRepairTrendChart(chartData);
        createRepairStatusChart(stats);
    }, 100);
}

// ============================================
// GET SAMPLE COST DATA (For Fallback/Demo)
// ============================================
function getSampleCostData() {
    const today = new Date();
    const month1 = (today.getFullYear() - (today.getMonth() === 0 ? 1 : 0)) + '-' + 
                   String((today.getMonth() === 0 ? 12 : today.getMonth())).padStart(2, '0');
    const month2 = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    
    return {
        status: 'success',
        totalCost: 1500,
        costByMonth: {
            [month1]: 1000,
            [month2]: 500
        }
    };
}

// ============================================
// COSTS REPORT
// ============================================
async function loadCostsReport(dateFrom, dateTo, period) {
    const sessionId = localStorage.getItem('sessionId');
    
    google.script.run
        .withSuccessHandler(onCostsReportLoaded)
        .withFailureHandler(onReportError)
        .getCostReports(sessionId, dateFrom, dateTo);
}

function onCostsReportLoaded(result) {
    hideReportLoading();
    console.log('✅ Costs Report Loaded:', result);
    
    if (result.status === 'success') {
        reportData.costs = result;
        
        // ถ้าไม่มีข้อมูลค่าใช้จ่าย ให้ใช้ข้อมูลตัวอย่าง
        if (!reportData.costs.costByMonth || Object.keys(reportData.costs.costByMonth).length === 0) {
            console.warn('⚠️ No costs data, using sample data');
            reportData.costs = getSampleCostData();
        }
        
        renderCostsReport();
    } else {
        console.error('❌ Error loading costs:', result.message);
        showNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน', 'error');
    }
}

function renderCostsReport() {
    const content = document.getElementById('reportContent');
    const costData = reportData.costs;
    const period = document.getElementById('reportPeriod').value;
    
    // ✅ แสดงปุ่ม Export PDF
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.classList.remove('hidden');
    }
    
    const chartData = prepareCostChartData(costData.costByMonth, period);
    
    // Get cost details for table
    const costDetails = Object.entries(costData.costByMonth || {}).map(([month, cost]) => ({
        month: month,
        cost: cost
    }));
    
    // Calculate pagination
    totalReportPages = Math.ceil(costDetails.length / reportsPerPage);
    const startIndex = (currentReportPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, costDetails.length);
    const pageData = costDetails.slice(startIndex, endIndex);
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-purple-100 text-sm">ค่าใช้จ่ายรวม</p>
                            <p class="text-3xl font-bold">${formatCurrency(costData.totalCost || 0)}</p>
                        </div>
                        <i class="fas fa-money-bill-wave text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-indigo-100 text-sm">ค่าเฉลี่ยต่อเดือน</p>
                            <p class="text-3xl font-bold">${formatCurrency(calculateAverageCost(costData.costByMonth))}</p>
                        </div>
                        <i class="fas fa-chart-line text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-pink-100 text-sm">เดือนที่สูงสุด</p>
                            <p class="text-3xl font-bold">${formatCurrency(getMaxMonthlyCost(costData.costByMonth))}</p>
                        </div>
                        <i class="fas fa-arrow-up text-3xl opacity-80"></i>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">แนวโน้มค่าใช้จ่าย</h3>
                    <canvas id="costTrendChart" style="height: 300px;"></canvas>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">เปรียบเทียบรายเดือน</h3>
                    <canvas id="costComparisonChart" style="height: 300px;"></canvas>
                </div>
            </div>
            
            <!-- Data Table -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b bg-gray-50">
                    <h3 class="text-lg font-semibold">รายละเอียดค่าใช้จ่าย</h3>
                </div>
                
                <div class="report-table-wrapper overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เดือน/ปี</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ค่าใช้จ่าย (บาท)</th>
                            </tr>
                        </thead>
                        <tbody id="reportTableBody" class="bg-white divide-y divide-gray-200">
                            ${pageData.map((item, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-center text-sm text-gray-500">${startIndex + index + 1}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatMonth(item.month)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">${formatCurrency(item.cost)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                ${costDetails.length > reportsPerPage ? `
                    <div id="reportPagination" class="bg-white p-4 border-t">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-list mr-2"></i>
                                รายการทั้งหมด: <span class="font-semibold text-gray-800">${costDetails.length}</span> รายการ
                            </div>
                            <div id="reportPaginationButtons" class="flex items-center gap-2"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Render Mobile Cards
    renderReportMobileCards(pageData, startIndex, 'costs');
    
    // Render Pagination
    if (costDetails.length > reportsPerPage) {
        renderReportPagination();
    }
    
    // Create Charts
    setTimeout(() => {
        createCostTrendChart(chartData);
        createCostComparisonChart(costData.costByMonth);
    }, 100);
}

// ============================================
// GET SAMPLE EQUIPMENT DATA (For Fallback/Demo)
// ============================================
function getSampleEquipmentData() {
    return [
        {
            id: 'eq1',
            equipment_number: 'EQ001',
            name: 'เครื่องคอมพิวเตอร์ Dell OptiPlex 7090',
            type: 'คอมพิวเตอร์',
            brand: 'Dell',
            model: 'OptiPlex 7090',
            purchase_year: '2566',
            purchase_price: 35000,
            purchase_date: '2023-01-15',
            warranty_end_date: '2026-01-15',
            location: 'อาคาร A ชั้น 1',
            status: 'active',
            condition: 'good'
        },
        {
            id: 'eq2',
            equipment_number: 'EQ002',
            name: 'เครื่องพิมพ์ HP LaserJet Pro M404dn',
            type: 'เครื่องพิมพ์',
            brand: 'HP',
            model: 'LaserJet Pro M404dn',
            purchase_year: '2566',
            purchase_price: 12500,
            purchase_date: '2023-03-20',
            warranty_end_date: '2026-03-20',
            location: 'อาคาร A ชั้น 2',
            status: 'active',
            condition: 'good'
        }
    ];
}

// ============================================
// EQUIPMENT REPORT
// ============================================
async function loadEquipmentReport(dateFrom, dateTo, period) {
    const sessionId = localStorage.getItem('sessionId');
    
    google.script.run
        .withSuccessHandler(onEquipmentReportLoaded)
        .withFailureHandler(onReportError)
        .getEquipmentList(sessionId);
}

function onEquipmentReportLoaded(result) {
    hideReportLoading();
    console.log('✅ Equipment Report Loaded:', result);
    
    if (result.status === 'success') {
        reportData.equipment = result.equipment || [];
        console.log('📦 Equipment count:', reportData.equipment.length);
        
        // ถ้าไม่มีข้อมูลพัสดุ ให้ใช้ข้อมูลตัวอย่าง
        if (reportData.equipment.length === 0) {
            console.warn('⚠️ No equipment data, using sample data');
            reportData.equipment = getSampleEquipmentData();
        }
        
        renderEquipmentReport();
    } else {
        console.error('❌ Error loading equipment:', result.message);
        showNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน', 'error');
    }
}

function renderEquipmentReport() {
    const content = document.getElementById('reportContent');
    const equipment = reportData.equipment;
    
    // ✅ แสดงปุ่ม Export PDF
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.classList.remove('hidden');
    }
    
    const stats = calculateEquipmentStats(equipment);
    const yearData = groupEquipmentByYear(equipment);
    
    // Calculate pagination
    totalReportPages = Math.ceil(equipment.length / reportsPerPage);
    const startIndex = (currentReportPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, equipment.length);
    const pageData = equipment.slice(startIndex, endIndex);
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-blue-100 text-sm">พัสดุทั้งหมด</p>
                            <p class="text-3xl font-bold">${stats.total}</p>
                        </div>
                        <i class="fas fa-boxes text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-green-100 text-sm">ใช้งานปกติ</p>
                            <p class="text-3xl font-bold">${stats.active}</p>
                        </div>
                        <i class="fas fa-check text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-yellow-100 text-sm">ซ่อมบำรุง</p>
                            <p class="text-3xl font-bold">${stats.maintenance}</p>
                        </div>
                        <i class="fas fa-wrench text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-red-100 text-sm">จำหน่าย</p>
                            <p class="text-3xl font-bold">${stats.retired}</p>
                        </div>
                        <i class="fas fa-times text-3xl opacity-80"></i>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">สัดส่วนสถานะพัสดุ</h3>
                    <canvas id="equipmentStatusChart" style="height: 300px;"></canvas>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">จำนวนพัสดุตามปีที่จัดซื้อ</h3>
                    <canvas id="equipmentYearChart" style="height: 300px;"></canvas>
                </div>
            </div>
            
            <!-- Data Table -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b bg-gray-50">
                    <h3 class="text-lg font-semibold">รายละเอียดพัสดุ</h3>
                </div>
                
                <div class="report-table-wrapper overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อพัสดุ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ยี่ห้อ/รุ่น</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ปีที่จัดซื้อ</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="reportTableBody" class="bg-white divide-y divide-gray-200">
                            ${pageData.map((eq, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-center text-sm text-gray-500">${startIndex + index + 1}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${eq.equipment_number || '-'}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${eq.name || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${eq.type || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${eq.brand || '-'} ${eq.model || ''}</td>
                                    <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">${eq.purchase_year || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">${getEquipmentStatusBadge(eq.status)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                ${equipment.length > reportsPerPage ? `
                    <div id="reportPagination" class="bg-white p-4 border-t">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-list mr-2"></i>
                                รายการทั้งหมด: <span class="font-semibold text-gray-800">${equipment.length}</span> รายการ
                            </div>
                            <div id="reportPaginationButtons" class="flex items-center gap-2"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Render Mobile Cards
    renderReportMobileCards(pageData, startIndex, 'equipment');
    
    // Render Pagination
    if (equipment.length > reportsPerPage) {
        renderReportPagination();
    }
    
    // Create Charts
    setTimeout(() => {
        createEquipmentStatusChart(stats);
        createEquipmentYearChart(yearData);
    }, 100);
}

// ============================================
// GET SAMPLE TECHNICIAN DATA (For Fallback/Demo)
// ============================================
function getSampleTechnicianData() {
    return [
        {
            id: 'tech1',
            technician_name: 'นายช่าง มือดี',
            total_repairs: 15,
            completed_repairs: 12,
            in_progress_repairs: 2,
            pending_repairs: 1,
            average_repair_time: 45, // minutes
            total_cost: 3500,
            rating: 4.8,
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'tech2',
            technician_name: 'นางสาวช่าง มือเก่ง',
            total_repairs: 8,
            completed_repairs: 6,
            in_progress_repairs: 2,
            pending_repairs: 0,
            average_repair_time: 38,
            total_cost: 2100,
            rating: 4.6,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// ============================================
// TECHNICIANS REPORT
// ============================================
async function loadTechniciansReport(dateFrom, dateTo, period) {
    const sessionId = localStorage.getItem('sessionId');
    
    google.script.run
        .withSuccessHandler(onTechniciansReportLoaded)
        .withFailureHandler(onReportError)
        .getTechnicianReports(sessionId, dateFrom, dateTo);
}

function onTechniciansReportLoaded(result) {
    hideReportLoading();
    console.log('✅ Technicians Report Loaded:', result);
    
    if (result.status === 'success') {
        reportData.technicians = result.technicians || [];
        console.log('👨‍🔧 Technicians count:', reportData.technicians.length);
        
        // ถ้าไม่มีข้อมูลช่าง ให้ใช้ข้อมูลตัวอย่าง
        if (reportData.technicians.length === 0) {
            console.warn('⚠️ No technicians data, using sample data');
            reportData.technicians = getSampleTechnicianData();
        }
        
        renderTechniciansReport();
    } else {
        console.error('❌ Error loading technicians:', result.message);
        showNotification(result.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน', 'error');
    }
}

function renderTechniciansReport() {
    const content = document.getElementById('reportContent');
    const technicians = reportData.technicians;
    
    // ✅ แสดงปุ่ม Export PDF
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.classList.remove('hidden');
    }
    
    // ✅ เพิ่ม error handling ตรวจสอบ element
    if (!content) {
        console.error('reportContent element not found');
        showNotification('ไม่พบ element สำหรับแสดงรายงาน', 'error');
        return;
    }
    
    // ✅ ตรวจสอบว่ามีข้อมูล technicians
    if (!technicians || technicians.length === 0) {
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-user-tie text-gray-400 text-6xl mb-4"></i>
                <p class="text-gray-600 text-lg">ไม่มีข้อมูลช่างสำหรับช่วงวันที่ที่เลือก</p>
            </div>
        `;
        return;
    }
    
    // Calculate statistics
    const stats = calculateTechnicianStats(technicians);
    
    // Calculate pagination
    totalReportPages = Math.ceil(technicians.length / reportsPerPage);
    const startIndex = (currentReportPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, technicians.length);
    const pageData = technicians.slice(startIndex, endIndex);
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-purple-100 text-sm">ช่างทั้งหมด</p>
                            <p class="text-3xl font-bold">${stats.totalTechnicians}</p>
                        </div>
                        <i class="fas fa-user-tie text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-green-100 text-sm">ซ่อมเสร็จทั้งหมด</p>
                            <p class="text-3xl font-bold">${stats.totalCompleted}</p>
                        </div>
                        <i class="fas fa-check-circle text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-blue-100 text-sm">เวลาเฉลี่ย/งาน</p>
                            <p class="text-3xl font-bold">${stats.avgRepairTime}</p>
                        </div>
                        <i class="fas fa-clock text-3xl opacity-80"></i>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div class="flex items-center">
                        <div class="flex-1">
                            <p class="text-yellow-100 text-sm">ค่าใช้จ่ายรวม</p>
                            <p class="text-3xl font-bold">${formatCurrency(stats.totalCost)}</p>
                        </div>
                        <i class="fas fa-dollar-sign text-3xl opacity-80"></i>
                    </div>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">สถิติการซ่อมของช่าง</h3>
                    <canvas id="technicianPerformanceChart" style="height: 300px;"></canvas>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold mb-4">เปรียบเทียบประสิทธิภาพช่าง</h3>
                    <canvas id="technicianComparisonChart" style="height: 300px;"></canvas>
                </div>
            </div>
            
            <!-- Data Table -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b bg-gray-50">
                    <h3 class="text-lg font-semibold">รายละเอียดช่าง</h3>
                </div>
                
                <div class="report-table-wrapper overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อช่าง</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">งานทั้งหมด</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เสร็จแล้ว</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">กำลังทำ</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">รอดำเนินการ</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เวลาเฉลี่ย</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ค่าใช้จ่าย</th>
                                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody id="reportTableBody" class="bg-white divide-y divide-gray-200">
                            ${pageData.map((tech, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-center text-sm text-gray-500">${startIndex + index + 1}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tech.technician_name || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${tech.total_repairs || 0}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-semibold">${tech.completed_repairs || 0}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">${tech.in_progress_repairs || 0}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600">${tech.pending_repairs || 0}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${tech.average_repair_time || 0} นาที</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">${formatCurrency(tech.total_cost || 0)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        <div class="flex items-center justify-center">
                                            <i class="fas fa-star text-yellow-400 mr-1"></i>
                                            <span class="text-sm font-semibold text-gray-900">${tech.rating || 0}</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                ${technicians.length > reportsPerPage ? `
                    <div id="reportPagination" class="bg-white p-4 border-t">
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-list mr-2"></i>
                                รายการทั้งหมด: <span class="font-semibold text-gray-800">${technicians.length}</span> รายการ
                            </div>
                            <div id="reportPaginationButtons" class="flex items-center gap-2"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Render Mobile Cards
    renderReportMobileCards(pageData, startIndex, 'technicians');
    
    // Render Pagination
    if (technicians.length > reportsPerPage) {
        renderReportPagination();
    }
    
    // Create Charts
    setTimeout(() => {
        createTechnicianPerformanceChart(technicians);
        createTechnicianComparisonChart(technicians);
    }, 100);
}

// ============================================
// 🆕 Render Mobile Cards (ใช้ร่วมกัน 3 ประเภท)
// ============================================
function renderReportMobileCards(data, startIndex, reportType) {
    const tbody = document.getElementById('reportTableBody');
    let mobileCardView = document.querySelector('.report-table-wrapper .mobile-card-view');
    
    if (!mobileCardView) {
        mobileCardView = document.createElement('div');
        mobileCardView.className = 'mobile-card-view';
        const tableWrapper = tbody?.closest('.report-table-wrapper');
        if (tableWrapper) {
            tableWrapper.appendChild(mobileCardView);
        }
    }
    
    if (!mobileCardView) return;
    
    // สร้าง Cards ตามประเภทรายงาน
    switch(reportType) {
        case 'repairs':
            mobileCardView.innerHTML = data.map((repair, index) => createRepairCard(repair, startIndex + index + 1)).join('');
            break;
        case 'costs':
            mobileCardView.innerHTML = data.map((item, index) => createCostCard(item, startIndex + index + 1)).join('');
            break;
        case 'equipment':
            mobileCardView.innerHTML = data.map((eq, index) => createEquipmentCard(eq, startIndex + index + 1)).join('');
            break;
        case 'technicians':
            mobileCardView.innerHTML = data.map((tech, index) => createTechnicianCard(tech, startIndex + index + 1)).join('');
            break;
    }
}

function createRepairCard(repair, index) {
    const statusConfig = {
        'pending': { bg: '#fef3c7', color: '#92400e', icon: 'fa-clock', text: 'รอดำเนินการ' },
        'in_progress': { bg: '#dbeafe', color: '#1e40af', icon: 'fa-tools', text: 'กำลังซ่อม' },
        'completed': { bg: '#dcfce7', color: '#166534', icon: 'fa-check-circle', text: 'เสร็จสิ้น' },
        'cancelled': { bg: '#fee2e2', color: '#991b1b', icon: 'fa-times-circle', text: 'ยกเลิก' }
    };
    
    const status = statusConfig[repair.status] || statusConfig['pending'];
    
    return `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-card-code">
                    <i class="fas fa-qrcode"></i>
                    <span>${repair.equipment_number || 'ไม่ระบุ'}</span>
                </div>
                <div style="background: ${status.bg}; color: ${status.color}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                    <i class="fas ${status.icon}"></i>
                    <span>${status.text}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-box"></i> ชื่อพัสดุ</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${repair.equipment_name || '-'}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-user"></i> ผู้แจ้ง</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${repair.reporter_name || '-'}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-calendar"></i> วันที่แจ้ง</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${formatDate(repair.created_at)}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-dollar-sign"></i> ค่าใช้จ่าย</div>
                    <div style="font-size: 14px; font-weight: 700; color: #059669;">${formatCurrency(repair.repair_cost || 0)}</div>
                </div>
            </div>
        </div>
    `;
}

function createCostCard(item, index) {
    return `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-card-code">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${formatMonth(item.month)}</span>
                </div>
                <div style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                    <i class="fas fa-list"></i>
                    <span>ลำดับที่ ${index}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <div style="font-size: 14px; color: #6b7280;"><i class="fas fa-dollar-sign"></i> ค่าใช้จ่าย</div>
                    <div style="font-size: 18px; font-weight: 700; color: #059669;">${formatCurrency(item.cost)}</div>
                </div>
            </div>
        </div>
    `;
}

function createTechnicianCard(tech, index) {
    return `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-card-code">
                    <i class="fas fa-user-tie"></i>
                    <span>${tech.technician_name || 'ไม่ระบุ'}</span>
                </div>
                <div style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                    <i class="fas fa-list"></i>
                    <span>ลำดับที่ ${index}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-tools"></i> งานทั้งหมด</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${tech.total_repairs || 0}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-check-circle"></i> เสร็จแล้ว</div>
                    <div style="font-size: 13px; font-weight: 600; color: #059669;">${tech.completed_repairs || 0}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-clock"></i> เวลาเฉลี่ย</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${tech.average_repair_time || 0} นาที</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-dollar-sign"></i> ค่าใช้จ่าย</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${formatCurrency(tech.total_cost || 0)}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-star"></i> คะแนน</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${tech.rating || 0}</div>
                </div>
            </div>
        </div>
    `;
}

function createEquipmentCard(eq, index) {
    const statusConfig = {
        'active': { bg: '#dcfce7', color: '#166534', icon: 'fa-check', text: 'ใช้งานปกติ' },
        'maintenance': { bg: '#fef3c7', color: '#92400e', icon: 'fa-wrench', text: 'ซ่อมบำรุง' },
        'retired': { bg: '#fee2e2', color: '#991b1b', icon: 'fa-times', text: 'จำหน่าย' }
    };
    
    const status = statusConfig[eq.status] || statusConfig['active'];
    
    return `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-card-code">
                    <i class="fas fa-qrcode"></i>
                    <span>${eq.equipment_number || 'ไม่ระบุ'}</span>
                </div>
                <div style="background: ${status.bg}; color: ${status.color}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                    <i class="fas ${status.icon}"></i>
                    <span>${status.text}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-box"></i> ชื่อพัสดุ</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${eq.name || '-'}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-tag"></i> ประเภท</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${eq.type || '-'}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-industry"></i> ยี่ห้อ/รุ่น</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${eq.brand || '-'} ${eq.model || ''}</div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                    <div style="font-size: 12px; color: #6b7280;"><i class="fas fa-calendar"></i> ปีที่จัดซื้อ</div>
                    <div style="font-size: 13px; font-weight: 600; color: #374151;">${eq.purchase_year || '-'}</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 🆕 Render Pagination
// ============================================
function renderReportPagination() {
    const container = document.getElementById('reportPaginationButtons');
    if (!container) return;
    
    const buttons = [];
    let totalItems = 0;
    
    switch(currentReportTab) {
        case 'repairs':
            totalItems = reportData.repairs.length;
            break;
        case 'costs':
            totalItems = Object.keys(reportData.costs.costByMonth || {}).length;
            break;
        case 'equipment':
            totalItems = reportData.equipment.length;
            break;
        case 'technicians':
            totalItems = reportData.technicians.length;
            break;
    }
    
    buttons.push(`
        <button onclick="goToReportPage(${currentReportPage - 1})" 
                ${currentReportPage === 1 ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <i class="fas fa-chevron-left mr-2"></i>
            ก่อนหน้า
        </button>
    `);
    
    const startItem = totalItems === 0 ? 0 : (currentReportPage - 1) * reportsPerPage + 1;
    const endItem = Math.min(currentReportPage * reportsPerPage, totalItems);
    
    buttons.push(`
        <div class="px-4 py-2 text-gray-700 font-medium">
            ${startItem}-${endItem} จาก ${totalItems}
        </div>
    `);
    
    buttons.push(`
        <button onclick="goToReportPage(${currentReportPage + 1})" 
                ${currentReportPage === totalReportPages ? 'disabled' : ''} 
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            ถัดไป
            <i class="fas fa-chevron-right ml-2"></i>
        </button>
    `);
    
    container.innerHTML = buttons.join('');
}

function goToReportPage(page) {
    if (page < 1 || page > totalReportPages) return;
    currentReportPage = page;
    
    switch(currentReportTab) {
        case 'repairs':
            renderRepairsReport();
            break;
        case 'costs':
            renderCostsReport();
            break;
        case 'equipment':
            renderEquipmentReport();
            break;
        case 'technicians':
            renderTechniciansReport();
            break;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Format & Calculate Helper Functions
// ============================================
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
        return '-';
    }
}

function formatCurrency(value) {
    if (!value) return '฿0.00';
    return '฿' + parseFloat(value).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateRepairDuration(repair) {
    // ✅ ปรับปรุง: คำนวณระยะเวลาการซ่อม ตั้งแต่กดเริ่มงาน (started_at) ถึง เสร็จสิ้น (completed_at)
    // - ถ้างานเสร็จ: ใช้เวลาจาก started_at ถึง completed_at
    // - ถ้าไม่มี started_at ใช้ created_at แทน (เพื่อเข้ากันได้กับข้อมูลเก่า)
    // - ถ้าไม่มี completed_at ใช้ updated_at แทน (สำหรับข้อมูลเก่า)
    // - ถ้ายังไม่เสร็จ: ยังไม่นับ (แสดง "-")
    
    // ตรวจสอบว่าถูกปิดสถานะเป็น "completed" หรือไม่
    if (!repair.status || repair.status !== 'completed') {
        return '-';
    }
    
    // ใช้ started_at ถ้ามี ถ้าไม่มีใช้ created_at แทน
    const startTimeStr = repair.started_at || repair.created_at;
    if (!startTimeStr) {
        return '-';
    }
    
    const startTime = new Date(startTimeStr);
    if (isNaN(startTime.getTime())) {
        return '-';
    }
    
    // ใช้ completed_at ถ้ามี ถ้าไม่มีใช้ updated_at แทน (สำหรับข้อมูลเก่า)
    const endTimeStr = repair.completed_at || repair.updated_at;
    if (!endTimeStr) {
        return '-';
    }
    
    const endTime = new Date(endTimeStr);
    if (isNaN(endTime.getTime())) {
        return '-';
    }
    
    // คำนวณหน่วยเวลา
    const diffMs = endTime - startTime;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(totalHours / 24);
    const remainingHours = Math.floor(totalHours % 24);
    const remainingMinutes = totalMinutes % 60;
    
    // แสดงผลเป็น นาที/ชม./วัน
    if (diffDays === 0 && remainingHours === 0) {
        // แสดงนาทีเมื่อน้อยกว่า 1 ชั่วโมง
        return `${remainingMinutes} นาที`;
    } else if (diffDays === 0) {
        // แสดงชั่วโมงและนาทีเมื่อน้อยกว่า 1 วัน
        return `${remainingHours} ชม. ${remainingMinutes} นาที`;
    } else {
        // แสดงวัน ชั่วโมง และนาที
        return `${diffDays} วัน ${remainingHours} ชม. ${remainingMinutes} นาที`;
    }
}

// 🆕 ฟังก์ชันใหม่: คำนวณเวลาการซ่อมเสร็จเท่านั้น (สำหรับ SLA Analysis)
function getRepairCompletionTime(repair) {
    // ✅ ดึงเวลา "ตั้งแต่เปิด ถึง เสร็จสิ้น" เท่านั้น (ใช้สำหรับ SLA)
    if (!repair.completed_at) {
        return { text: 'ยังไม่เสร็จ', hours: null, days: null };
    }
    
    const startTime = new Date(repair.created_at);
    const endTime = new Date(repair.completed_at);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return { text: '-', hours: null, days: null };
    }
    
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = Math.round(diffHours % 24);
    
    let text = '';
    if (diffDays === 0) {
        text = `${Math.round(diffHours)} ชม.`;
    } else if (diffDays === 1 && remainingHours === 0) {
        text = `${diffDays} วัน`;
    } else if (diffDays > 0) {
        text = `${diffDays} วัน ${remainingHours} ชม.`;
    }
    
    return {
        text: text,
        hours: diffHours,
        days: diffDays,
        totalMinutes: diffMs / (1000 * 60),
        formatted: text
    };
}

function formatMonth(monthString) {
    if (!monthString || monthString === 'ไม่ระบุ') return monthString;
    
    const [year, month] = monthString.split('-');
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    if (monthString.includes('Q')) {
        return monthString; // Quarter format
    }
    
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
}

// ============================================
// Calculate Statistics
// ============================================
function calculateRepairStats(repairs) {
    return {
        total: repairs.length,
        pending: repairs.filter(r => r.status === 'pending').length,
        inProgress: repairs.filter(r => r.status === 'in_progress').length,
        completed: repairs.filter(r => r.status === 'completed').length,
        cancelled: repairs.filter(r => r.status === 'cancelled').length,
        urgent: repairs.filter(r => r.priority === 'urgent').length
    };
}

function calculateEquipmentStats(equipment) {
    return {
        total: equipment.length,
        active: equipment.filter(e => e.status === 'active').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        retired: equipment.filter(e => e.status === 'retired').length
    };
}

function calculateTechnicianStats(technicians) {
    const totalCompleted = technicians.reduce((sum, tech) => sum + (tech.completed_repairs || 0), 0);
    const totalCost = technicians.reduce((sum, tech) => sum + (tech.total_cost || 0), 0);
    const avgRepairTime = technicians.length > 0 ? 
        Math.round(technicians.reduce((sum, tech) => sum + (tech.average_repair_time || 0), 0) / technicians.length) : 0;
    
    return {
        totalTechnicians: technicians.length,
        totalCompleted: totalCompleted,
        totalCost: totalCost,
        avgRepairTime: avgRepairTime + ' นาที'
    };
}

function calculateAverageCost(costByMonth) {
    const values = Object.values(costByMonth || {});
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

function getMaxMonthlyCost(costByMonth) {
    const values = Object.values(costByMonth || {});
    return values.length > 0 ? Math.max(...values) : 0;
}

function groupEquipmentByYear(equipment) {
    const yearData = {};
    equipment.forEach(eq => {
        const year = eq.purchase_year || 'ไม่ระบุ';
        yearData[year] = (yearData[year] || 0) + 1;
    });
    return yearData;
}

// ============================================
// Prepare Chart Data
// ============================================
function prepareRepairChartData(repairs, period) {
    const chartData = { labels: [], values: [] };
    const groupedData = {};
    
    repairs.forEach(repair => {
        const date = new Date(repair.created_at);
        let key;
        
        switch(period) {
            case 'monthly':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            case 'quarterly':
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                key = `${date.getFullYear()}-Q${quarter}`;
                break;
            case 'yearly':
                key = String(date.getFullYear());
                break;
            default:
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
    });
    
    Object.keys(groupedData).sort().forEach(key => {
        chartData.labels.push(formatMonth(key));
        chartData.values.push(groupedData[key]);
    });
    
    return chartData;
}

function prepareCostChartData(costByMonth, period) {
    const chartData = { labels: [], values: [] };
    
    Object.keys(costByMonth || {}).sort().forEach(month => {
        chartData.labels.push(formatMonth(month));
        chartData.values.push(costByMonth[month]);
    });
    
    return chartData;
}

// ============================================
// Create Charts
// ============================================
function createRepairTrendChart(chartData) {
    const ctx = document.getElementById('repairTrendChart');
    if (!ctx) return;
    
    if (reportCharts.repairTrend) {
        reportCharts.repairTrend.destroy();
    }
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.repairTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'จำนวนการซ่อม',
                data: chartData.values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 2,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createRepairStatusChart(stats) {
    const ctx = document.getElementById('repairStatusChart');
    if (!ctx) return;
    
    if (reportCharts.repairStatus) {
        reportCharts.repairStatus.destroy();
    }
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.repairStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['รอดำเนินการ', 'กำลังซ่อม', 'เสร็จสิ้น', 'ยกเลิก'],
            datasets: [{
                data: [stats.pending, stats.inProgress, stats.completed, stats.cancelled],
                backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 1,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createCostTrendChart(chartData) {
    const ctx = document.getElementById('costTrendChart');
    if (!ctx) return;
    
    if (reportCharts.costTrend) {
        reportCharts.costTrend.destroy();
    }
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.costTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'ค่าใช้จ่าย (บาท)',
                data: chartData.values,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 2,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' บาท';
                        }
                    }
                }
            }
        }
    });
}

function createCostComparisonChart(costByMonth) {
    const ctx = document.getElementById('costComparisonChart');
    if (!ctx) return;
    
    if (reportCharts.costComparison) {
        reportCharts.costComparison.destroy();
    }
    
    const labels = [];
    const values = [];
    
    Object.keys(costByMonth || {}).sort().forEach(month => {
        labels.push(formatMonth(month));
        values.push(costByMonth[month]);
    });
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.costComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ค่าใช้จ่าย (บาท)',
                data: values,
                backgroundColor: '#8b5cf6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 2,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' บาท';
                        }
                    }
                }
            }
        }
    });
}

function createEquipmentStatusChart(stats) {
    const ctx = document.getElementById('equipmentStatusChart');
    if (!ctx) return;
    
    if (reportCharts.equipmentStatus) {
        reportCharts.equipmentStatus.destroy();
    }
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.equipmentStatus = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['ใช้งานปกติ', 'ซ่อมบำรุง', 'จำหน่าย'],
            datasets: [{
                data: [stats.active, stats.maintenance, stats.retired],
                backgroundColor: ['#10b981', '#fbbf24', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 1,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createEquipmentYearChart(yearData) {
    const ctx = document.getElementById('equipmentYearChart');
    if (!ctx) return;
    
    if (reportCharts.equipmentYear) {
        reportCharts.equipmentYear.destroy();
    }
    
    const years = Object.keys(yearData).sort();
    const values = years.map(year => yearData[year]);
    
    // ✅ กำหนดความสูง
    ctx.style.height = '350px';
    ctx.height = 350;
    
    reportCharts.equipmentYear = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'จำนวนพัสดุ',
                data: values,
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ✅ สำคัญ!
            aspectRatio: 2,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// ============================================
// Helper Functions
// ============================================
function onReportError(error) {
    hideReportLoading();
    console.error('❌ Report error:', error);
    
    // ใช้ข้อมูลตัวอย่างแทน
    console.log('📊 Using sample data as fallback');
    
    switch(currentReportTab) {
        case 'repairs':
            reportData.repairs = getSampleRepairData();
            renderRepairsReport();
            break;
        case 'costs':
            reportData.costs = getSampleCostData();
            renderCostsReport();
            break;
        case 'equipment':
            reportData.equipment = getSampleEquipmentData();
            renderEquipmentReport();
            break;
        case 'technicians':
            reportData.technicians = getSampleTechnicianData();
            renderTechniciansReport();
            break;
    }
    
    showNotification('⚠️ ใช้ข้อมูลตัวอย่าง - โปรดตรวจสอบการเชื่อมต่อ', 'warning');
}

function showReportLoading() {
    const content = document.getElementById('reportContent');
    content.innerHTML = `
        <div class="text-center py-12">
            <div class="inline-flex items-center">
                <i class="fas fa-spinner animate-spin text-blue-600 mr-3 text-2xl"></i>
                <span class="text-gray-600 text-lg">กำลังสร้างรายงาน...</span>
            </div>
        </div>
    `;
}

function hideReportLoading() {
    // Content will be replaced
}

function getStatusBadge(status) {
    const statusMap = {
        'pending': { class: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock', text: 'รอดำเนินการ' },
        'in_progress': { class: 'bg-blue-100 text-blue-800', icon: 'fa-tools', text: 'กำลังซ่อม' },
        'completed': { class: 'bg-green-100 text-green-800', icon: 'fa-check-circle', text: 'เสร็จสิ้น' },
        'cancelled': { class: 'bg-red-100 text-red-800', icon: 'fa-times-circle', text: 'ยกเลิก' }
    };
    
    const config = statusMap[status] || statusMap['pending'];
    return `<span class="${config.class} px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center">
                <i class="fas ${config.icon} mr-1"></i>${config.text}
            </span>`;
}

function getPriorityBadge(priority) {
    const priorityMap = {
        'normal': { class: 'bg-blue-100 text-blue-800', icon: 'fa-info-circle', text: 'ปกติ' },
        'medium': { class: 'bg-yellow-100 text-yellow-800', icon: 'fa-exclamation-circle', text: 'ปานกลาง' },
        'urgent': { class: 'bg-red-100 text-red-800', icon: 'fa-exclamation-triangle', text: 'เร่งด่วน' }
    };
    
    const config = priorityMap[priority] || priorityMap['normal'];
    return `<span class="${config.class} px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center">
                <i class="fas ${config.icon} mr-1"></i>${config.text}
            </span>`;
}

function getEquipmentStatusBadge(status) {
    const statusMap = {
        'active': { class: 'bg-green-100 text-green-800', text: 'ใช้งานปกติ', icon: 'check' },
        'maintenance': { class: 'bg-yellow-100 text-yellow-800', text: 'ซ่อมบำรุง', icon: 'wrench' },
        'retired': { class: 'bg-red-100 text-red-800', text: 'จำหน่าย', icon: 'times' }
    };
    
    const statusInfo = statusMap[status] || statusMap['active'];
    return `<span class="px-2 py-1 text-xs font-medium ${statusInfo.class} rounded-full">
                <i class="fas fa-${statusInfo.icon} mr-1"></i>
                ${statusInfo.text}
            </span>`;
}

function formatMonth(monthString) {
    if (!monthString || monthString === 'ไม่ระบุ') return monthString;
    
    const [year, month] = monthString.split('-');
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    if (monthString.includes('Q')) {
        return monthString; // Quarter format
    }
    
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
}

// Global functions
window.switchReportTab = switchReportTab;
window.goToReportPage = goToReportPage;

// ============================================
// Technician Chart Functions
// ============================================
function createTechnicianPerformanceChart(technicians) {
    const canvas = document.getElementById('technicianPerformanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = technicians.map(t => t.technician_name || 'ไม่ระบุ');
    const completedData = technicians.map(t => t.completed_repairs || 0);
    const inProgressData = technicians.map(t => t.in_progress_repairs || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'ซ่อมเสร็จ',
                    data: completedData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                },
                {
                    label: 'กำลังซ่อม',
                    data: inProgressData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนงาน'
                    }
                }
            }
        }
    });
}

function createTechnicianComparisonChart(technicians) {
    const canvas = document.getElementById('technicianComparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = technicians.map(t => t.technician_name || 'ไม่ระบุ');
    const avgTimeData = technicians.map(t => t.average_repair_time || 0);
    const costData = technicians.map(t => t.total_cost || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'เวลาเฉลี่ย (นาที)',
                    data: avgTimeData,
                    borderColor: 'rgba(251, 146, 60, 1)',
                    backgroundColor: 'rgba(251, 146, 60, 0.2)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'ค่าใช้จ่าย (บาท)',
                    data: costData,
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.2)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'เวลา (นาที)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'ค่าใช้จ่าย (บาท)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// ============================================
// Export Report to PDF
// ============================================

// ============================================
// Export Report to PDF
// ============================================
async function exportReportToPDF() {
    try {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) {
            showNotification('ไม่มีข้อมูลรายงานที่จะส่งออก', 'warning');
            return;
        }

        // เลือกประเภทรายงาน
        const result = await Swal.fire({
            title: 'เลือกประเภทรายงาน',
            icon: 'question',
            html: `
                <div class="space-y-3 text-left">
                    <label class="flex items-center p-3 border-2 border-blue-400 rounded-lg cursor-pointer bg-blue-50" style="background: #e0e7ff; border-color: #4f46e5;">
                        <input type="checkbox" name="selectAll" id="selectAll" class="mr-3 cursor-pointer" style="width: 20px; height: 20px;">
                        <span class="font-bold text-blue-700">✓ เลือกทั้งหมด</span>
                    </label>
                    <div style="height: 1px; background: #ddd; margin: 10px 0;"></div>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer hover:bg-blue-50">
                        <input type="checkbox" name="reportType" value="repairs" class="mr-3 checkbox-item" style="width: 18px; height: 18px;">
                        <span class="font-medium">📋 รายงานการซ่อม</span>
                    </label>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer hover:bg-blue-50">
                        <input type="checkbox" name="reportType" value="costs" class="mr-3 checkbox-item" style="width: 18px; height: 18px;">
                        <span class="font-medium">💰 รายงานค่าใช้จ่าย</span>
                    </label>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer hover:bg-blue-50">
                        <input type="checkbox" name="reportType" value="equipment" class="mr-3 checkbox-item" style="width: 18px; height: 18px;">
                        <span class="font-medium">📦 รายงานพัสดุ</span>
                    </label>
                </div>
            `,
            didOpen: () => {
                const selectAllCheckbox = document.getElementById('selectAll');
                const checkboxItems = document.querySelectorAll('.checkbox-item');
                
                // เลือกทั้งหมด
                selectAllCheckbox.addEventListener('change', function() {
                    checkboxItems.forEach(checkbox => {
                        checkbox.checked = this.checked;
                        if (this.checked) {
                            checkbox.parentElement.classList.add('border-blue-500', 'bg-blue-50');
                        } else {
                            checkbox.parentElement.classList.remove('border-blue-500', 'bg-blue-50');
                        }
                    });
                });
                
                // เช็คเมื่อคลิก checkbox ปกติ
                checkboxItems.forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            this.parentElement.classList.add('border-blue-500', 'bg-blue-50');
                        } else {
                            this.parentElement.classList.remove('border-blue-500', 'bg-blue-50');
                        }
                        
                        // อัพเดท selectAll
                        const allChecked = Array.from(checkboxItems).every(cb => cb.checked);
                        selectAllCheckbox.checked = allChecked;
                    });
                });
            },
            showCancelButton: true,
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
            allowOutsideClick: false,
            allowEscapeKey: true,
            preConfirm: () => {
                const checkedBoxes = document.querySelectorAll('.checkbox-item:checked');
                if (checkedBoxes.length === 0) {
                    Swal.showValidationMessage('กรุณาเลือกรายงานอย่างน้อย 1 รายการ');
                    return false;
                }
                return Array.from(checkedBoxes).map(cb => cb.value);
            }
        });

        if (!result.isConfirmed) return;

        const selectedReports = result.value;
        
        // โหลดข้อมูลทั้งหมด ถ้าเลือกมากกว่า 1 รายการ
        if (selectedReports.length > 1) {
            showReportLoading();
            
            // โหลดข้อมูลทั้ง 3 รายงาน
            const dateFrom = document.getElementById('reportDateFrom').value;
            const dateTo = document.getElementById('reportDateTo').value;
            const sessionId = localStorage.getItem('sessionId');
            
            try {
                // โหลด repairs
                if (selectedReports.includes('repairs')) {
                    await new Promise((resolve) => {
                        google.script.run
                            .withSuccessHandler((result) => {
                                onRepairsReportLoaded(result);
                                resolve();
                            })
                            .withFailureHandler(() => resolve())
                            .getRepairReports(sessionId, dateFrom, dateTo);
                    });
                }
                
                // โหลด costs
                if (selectedReports.includes('costs')) {
                    await new Promise((resolve) => {
                        google.script.run
                            .withSuccessHandler((result) => {
                                onCostsReportLoaded(result);
                                resolve();
                            })
                            .withFailureHandler(() => resolve())
                            .getCostReports(sessionId, dateFrom, dateTo);
                    });
                }
                
                // โหลด equipment
                if (selectedReports.includes('equipment')) {
                    await new Promise((resolve) => {
                        google.script.run
                            .withSuccessHandler((result) => {
                                onEquipmentReportLoaded(result);
                                resolve();
                            })
                            .withFailureHandler(() => resolve())
                            .getEquipmentList(sessionId);
                    });
                }
                
                hideReportLoading();
                // สร้าง PDF หลังโหลดข้อมูลเสร็จ
                generateMultiplePDF(selectedReports);
            } catch (error) {
                console.error('Error loading reports:', error);
                hideReportLoading();
                showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
            }
        } else {
            // ถ้าเลือกแค่ 1 รายการ
            generatePDF(selectedReports[0]);
        }
        
    } catch (error) {
        console.error('Export PDF error:', error);
        showNotification('เกิดข้อผิดพลาดในการส่งออก PDF', 'error');
    }
}

function generateMultiplePDF(reportTypes) {
    try {
        // ถ้าเลือกแค่ 1 รายการ ให้สร้างแบบปกติ
        if (reportTypes.length === 1) {
            generatePDF(reportTypes[0]);
            return;
        }

        const printWindow = window.open('', '_blank');
        
        // สร้าง HTML สำหรับทุกรายงาน
        let allHTML = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>รายงานรวม</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Sarabun', Arial, 'Segoe UI', Tahoma, sans-serif;
                        line-height: 1.4;
                        color: #333;
                        background: white;
                        padding: 15px;
                    }
                    
                    .page-break {
                        page-break-after: always;
                        margin: 20px 0;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 25px;
                        border-bottom: 2px solid #3b82f6;
                        padding-bottom: 12px;
                        margin-top: 20px;
                    }
                    
                    .header:first-of-type {
                        margin-top: 0;
                    }
                    
                    h1 {
                        color: #1f2937;
                        font-size: 20px;
                        margin-bottom: 5px;
                    }
                    
                    .subtitle {
                        color: #666;
                        font-size: 12px;
                        margin-bottom: 8px;
                    }
                    
                    .report-date {
                        color: #999;
                        font-size: 11px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 12px;
                    }
                    
                    th {
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        padding: 10px 8px;
                        text-align: left;
                        font-weight: 600;
                        border: 1px solid #1e40af;
                    }
                    
                    td {
                        padding: 8px;
                        border: 1px solid #ddd;
                        word-wrap: break-word;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    
                    tr:nth-child(odd) {
                        background-color: white;
                    }
                    
                    .badge {
                        display: inline-block;
                        padding: 3px 6px;
                        border-radius: 3px;
                        font-size: 10px;
                        font-weight: 600;
                        white-space: nowrap;
                    }
                    
                    .badge-success {
                        background-color: #d1fae5;
                        color: #065f46;
                    }
                    
                    .badge-warning {
                        background-color: #fef3c7;
                        color: #92400e;
                    }
                    
                    .badge-danger {
                        background-color: #fee2e2;
                        color: #991b1b;
                    }
                    
                    .badge-info {
                        background-color: #dbeafe;
                        color: #1e40af;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 12px;
                        border-top: 1px solid #ddd;
                        color: #999;
                        font-size: 11px;
                    }
                    
                    .no-data {
                        text-align: center;
                        padding: 20px;
                        color: #999;
                        font-style: italic;
                    }
                    
                    @media print {
                        body { padding: 10px; }
                        table { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        `;

        // เพิ่มแต่ละรายงาน
        reportTypes.forEach((reportType, index) => {
            let reportTitle = '';
            let reportSubtitle = '';
            let tablesHTML = '';
            
            switch(reportType) {
                case 'repairs':
                    reportTitle = 'รายงานการซ่อม';
                    reportSubtitle = 'การซ่อมบำรุงพัสดุครุภัณฑ์';
                    
                    if (reportData.repairs && reportData.repairs.length > 0) {
                        const repairs = reportData.repairs;
                        let tableHTML = '<table><thead><tr>';
                        tableHTML += '<th>ลำดับ</th><th>วันที่แจ้ง</th><th>รหัสพัสดุ</th><th>ชื่อพัสดุ</th>';
                        tableHTML += '<th>ผู้แจ้ง</th><th>ความเร่งด่วน</th><th>สถานะ</th><th>ค่าใช้จ่าย</th>';
                        tableHTML += '</tr></thead><tbody>';
                        
                        repairs.forEach((repair, idx) => {
                            tableHTML += `<tr>
                                <td>${idx + 1}</td>
                                <td>${repair.created_at ? new Date(repair.created_at).toLocaleDateString('th-TH') : '-'}</td>
                                <td>${repair.equipment_number || '-'}</td>
                                <td>${repair.equipment_name || '-'}</td>
                                <td>${repair.reporter_name || '-'}</td>
                                <td>${repair.priority === 'urgent' ? 'เร่งด่วน' : repair.priority === 'medium' ? 'ปานกลาง' : 'ปกติ'}</td>
                                <td>${repair.status === 'pending' ? 'รอดำเนินการ' : repair.status === 'in_progress' ? 'กำลังซ่อม' : repair.status === 'completed' ? 'เสร็จสิ้น' : '-'}</td>
                                <td>${repair.repair_cost ? Number(repair.repair_cost).toLocaleString() + ' บาท' : '-'}</td>
                            </tr>`;
                        });
                        
                        tableHTML += '</tbody></table>';
                        tablesHTML = tableHTML;
                    } else {
                        tablesHTML = '<div class="no-data">ไม่มีข้อมูลการซ่อม</div>';
                    }
                    break;
                    
                case 'costs':
                    reportTitle = 'รายงานค่าใช้จ่าย';
                    reportSubtitle = 'ค่าใช้จ่ายการซ่อมบำรุงพัสดุ';
                    
                    const costByMonth = reportData.costs?.costByMonth || {};
                    if (Object.keys(costByMonth).length > 0) {
                        let tableHTML = '<table><thead><tr><th>เดือน</th><th>ค่าใช้จ่าย</th></tr></thead><tbody>';
                        
                        Object.entries(costByMonth).forEach(([month, cost]) => {
                            tableHTML += `<tr><td>${month}</td><td>${Number(cost).toLocaleString()} บาท</td></tr>`;
                        });
                        
                        tableHTML += '</tbody></table>';
                        tablesHTML = tableHTML;
                    } else {
                        tablesHTML = '<div class="no-data">ไม่มีข้อมูลค่าใช้จ่าย</div>';
                    }
                    break;
                    
                case 'equipment':
                    reportTitle = 'รายงานพัสดุ';
                    reportSubtitle = 'ทะเบียนพัสดุครุภัณฑ์';
                    
                    const equipment = reportData.equipment || [];
                    if (equipment.length > 0) {
                        let tableHTML = '<table><thead><tr>';
                        tableHTML += '<th>ลำดับ</th><th>รหัสพัสดุ</th><th>ชื่อพัสดุ</th><th>ประเภท</th>';
                        tableHTML += '<th>ยี่ห้อ/รุ่น</th><th>ปีที่จัดซื้อ</th><th>สถานะ</th>';
                        tableHTML += '</tr></thead><tbody>';
                        
                        equipment.forEach((equip, idx) => {
                            const brandModel = `${equip.brand || '-'} ${equip.model || ''}`.trim();
                            const status = equip.status === 'active' ? 'ใช้งาน' : equip.status === 'maintenance' ? 'บำรุงรักษา' : 'จำหน่าย';
                            
                            tableHTML += `<tr>
                                <td>${idx + 1}</td>
                                <td>${equip.equipment_number || '-'}</td>
                                <td>${equip.name || equip.equipment_name || '-'}</td>
                                <td>${equip.type || equip.equipment_type || '-'}</td>
                                <td>${brandModel || '-'}</td>
                                <td>${equip.purchase_year || equip.created_at ? new Date(equip.created_at).getFullYear() : '-'}</td>
                                <td>${status}</td>
                            </tr>`;
                        });
                        
                        tableHTML += '</tbody></table>';
                        tablesHTML = tableHTML;
                    } else {
                        tablesHTML = '<div class="no-data">ไม่มีข้อมูลพัสดุ</div>';
                    }
                    break;
            }

            allHTML += `
                ${index > 0 ? '<div class="page-break"></div>' : ''}
                <div class="header">
                    <h1>${reportTitle}</h1>
                    <div class="subtitle">${reportSubtitle}</div>
                    <div class="report-date">สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}</div>
                </div>
                <div class="table-container">
                    ${tablesHTML}
                </div>
            `;
        });

        allHTML += `
                <div class="footer">
                    ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(allHTML);
        printWindow.document.close();

        // พิมพ์
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 100);
        };

    } catch (error) {
        console.error('Generate multiple PDF error:', error);
        showNotification('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
    }
}

function generatePDF(reportType) {
    try {
        const reportContent = document.getElementById('reportContent');
        
        // ดึงเฉพาะตาราง
        const tableElements = reportContent.querySelectorAll('table');
        if (tableElements.length === 0) {
            showNotification('ไม่พบตารางข้อมูล', 'warning');
            return;
        }

        // สร้าง window ใหม่เพื่อพิมพ์
        const printWindow = window.open('', '_blank');
        
        // กำหนดชื่อรายงาน
        let reportTitle = '';
        let reportSubtitle = '';
        
        switch(reportType) {
            case 'repairs':
                reportTitle = 'รายงานการซ่อม';
                reportSubtitle = 'การซ่อมบำรุงพัสดุครุภัณฑ์';
                break;
            case 'costs':
                reportTitle = 'รายงานค่าใช้จ่าย';
                reportSubtitle = 'ค่าใช้จ่ายการซ่อมบำรุงพัสดุ';
                break;
            case 'equipment':
                reportTitle = 'รายงานพัสดุ';
                reportSubtitle = 'ทะเบียนพัสดุครุภัณฑ์';
                break;
        }
        
        // รวมตาราง
        let tablesHTML = '';
        tableElements.forEach((table, index) => {
            tablesHTML += table.outerHTML;
        });

        const html = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${reportTitle}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Sarabun', Arial, 'Segoe UI', Tahoma, sans-serif;
                        line-height: 1.4;
                        color: #333;
                        background: white;
                        padding: 15px;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 25px;
                        border-bottom: 2px solid #3b82f6;
                        padding-bottom: 12px;
                    }
                    
                    h1 {
                        color: #1f2937;
                        font-size: 20px;
                        margin-bottom: 5px;
                    }
                    
                    .subtitle {
                        color: #666;
                        font-size: 12px;
                        margin-bottom: 8px;
                    }
                    
                    .report-date {
                        color: #999;
                        font-size: 11px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 12px;
                    }
                    
                    th {
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        padding: 10px 8px;
                        text-align: left;
                        font-weight: 600;
                        border: 1px solid #1e40af;
                    }
                    
                    td {
                        padding: 8px;
                        border: 1px solid #ddd;
                        word-wrap: break-word;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    
                    tr:nth-child(odd) {
                        background-color: white;
                    }
                    
                    .badge {
                        display: inline-block;
                        padding: 3px 6px;
                        border-radius: 3px;
                        font-size: 10px;
                        font-weight: 600;
                        white-space: nowrap;
                    }
                    
                    .badge-success {
                        background-color: #d1fae5;
                        color: #065f46;
                    }
                    
                    .badge-warning {
                        background-color: #fef3c7;
                        color: #92400e;
                    }
                    
                    .badge-danger {
                        background-color: #fee2e2;
                        color: #991b1b;
                    }
                    
                    .badge-info {
                        background-color: #dbeafe;
                        color: #1e40af;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 12px;
                        border-top: 1px solid #ddd;
                        color: #999;
                        font-size: 11px;
                    }
                    
                    @media print {
                        body { padding: 10px; }
                        table { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${reportTitle}</h1>
                    <div class="subtitle">${reportSubtitle}</div>
                    <div class="report-date">สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}</div>
                </div>
                
                <div class="table-container">
                    ${tablesHTML}
                </div>
                
                <div class="footer">
                    ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        // รอให้หน้าโหลดเสร็จ แล้วพิมพ์เป็น PDF
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 100);
        };
        
    } catch (error) {
        console.error('Generate PDF error:', error);
        showNotification('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
    }
}

window.exportReportToPDF = exportReportToPDF;

</script>
