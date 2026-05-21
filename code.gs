// ============================================
// ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม
// Google Apps Script Backend - ฉบับสมบูรณ์
// Version: 2.0
// ============================================

// ============================================
// Configuration และ Constants  
// ============================================
const CONFIG = {
  APP_NAME: 'ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม',
  VERSION: '2.0',
  SESSION_TIMEOUT: 3600000, // 1 hour
  TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN',
  TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID',
  ADMIN_USERS: {
    'admin': 'admin123',
    'manager': 'manager123'
  },
  USER_ROLES: {
    'admin': {
      name: 'ผู้ดูแลระบบ',
      permissions: ['all']
    },
    'manager': {
      name: 'ผู้จัดการ',
      permissions: ['inventory', 'repair', 'reports', 'users']
    },
    'technician': {
      name: 'ช่างเทคนิค',
      permissions: ['repair']
    },
    'user': {
      name: 'ผู้ใช้ทั่วไป',
      permissions: ['repair_view']
    }
  }
};

// ============================================
// Main Functions
// ============================================

function doGet(e) {
  try {
    initializeSheets();
    
    // ดึงข้อมูล Config
    const configResult = getConfig('system');
    const appName = configResult.status === 'success' ? 
                    configResult.config.app_name : 
                    CONFIG.APP_NAME;
    
    const template = HtmlService.createTemplateFromFile('index');
    template.appName = appName; // ส่งชื่อระบบไปยัง template
    
    const html = template.evaluate()
      .setTitle(appName) // เปลี่ยน title ด้วย
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .addMetaTag('mobile-web-app-capable', 'yes')
      .addMetaTag('apple-mobile-web-app-capable', 'yes')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return html;
  } catch (error) {
    console.error('doGet error:', error);
    return HtmlService.createHtmlOutput('เกิดข้อผิดพลาดในการโหลดระบบ<br>กรุณาลองใหม่อีกครั้ง')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================
// Sheet Initialization - ฟังก์ชันสร้าง Sheet ทั้งหมด
// คัดลอกทั้งหมดนี้แทนที่ function initializeSheets() เดิม
// ============================================

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const sheetNames = sheets.map(sheet => sheet.getName());

  // ============================================
  // สร้าง sheet Config ถ้ายังไม่มี
  // ============================================
  if (sheetNames.indexOf('Config') === -1) {
    const configSheet = ss.insertSheet('Config');
    configSheet.appendRow(['config_json']);
    configSheet.appendRow([JSON.stringify({
      app_name: CONFIG.APP_NAME,
      telegram_bot_token: CONFIG.TELEGRAM_BOT_TOKEN,
      telegram_chat_id: CONFIG.TELEGRAM_CHAT_ID,
      folder_id: '',
      notification_enabled: true,
      app_version: '2.0',
      maintenance_mode: false,
      session_timeout: CONFIG.SESSION_TIMEOUT,
      email_notifications: false,
      email_list: '',
      auto_assign: false,
      work_hours: '08:00-17:00',
      warranty_alert_days: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })]);
  }

  // ============================================
  // สร้าง sheet Equipment (พัสดุครุภัณฑ์)
  // ============================================
  if (sheetNames.indexOf('Equipment') === -1) {
    const equipmentSheet = ss.insertSheet('Equipment');
    equipmentSheet.appendRow(['equipment_json']);
    
    // เพิ่มข้อมูลตัวอย่าง
    const sampleEquipment = [
      {
        id: Utilities.getUuid(),
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
        condition: 'good',
        image_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: Utilities.getUuid(),
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
        condition: 'good',
        image_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    sampleEquipment.forEach(equipment => {
      equipmentSheet.appendRow([JSON.stringify(equipment)]);
    });
  }

  // ============================================
  // สร้าง sheet Repairs (การแจ้งซ่อม)
  // ============================================
  if (sheetNames.indexOf('Repairs') === -1) {
    const repairsSheet = ss.insertSheet('Repairs');
    repairsSheet.appendRow(['repair_json']);
    
    // เพิ่มข้อมูลตัวอย่าง
    const sampleRepairs = [
      {
        id: Utilities.getUuid(),
        user_id: '',
        equipment_id: '',
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
        image_url: '',
        status: 'pending',
        technician_id: '',
        technician_name: '',
        repair_cost: 0,
        repair_note: '',
        repair_image_url: '',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: Utilities.getUuid(),
        user_id: '',
        equipment_id: '',
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
        image_url: '',
        status: 'in_progress',
        technician_id: '',
        technician_name: 'นายช่าง มือดี',
        repair_cost: 500,
        repair_note: 'กำลังตรวจสอบและทำความสะอาดโรลเลอร์',
        repair_image_url: '',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    sampleRepairs.forEach(repair => {
      repairsSheet.appendRow([JSON.stringify(repair)]);
    });
  }

// ============================================
// สร้าง sheet Users (ผู้ใช้งาน)
// ============================================
if (sheetNames.indexOf('Users') === -1) {
  const usersSheet = ss.insertSheet('Users');
  usersSheet.appendRow(['user_json']);
  
  // สร้าง Admin Account เริ่มต้น
  const adminPassword = 'admin123'; // รหัสผ่านเริ่มต้น
  const adminId = Utilities.getUuid();
  
  const adminUser = {
    id: adminId,
    username: 'admin',
    password: adminPassword, // ✅ ใช้ plain text โดยตรง
    name: 'ผู้ดูแลระบบ',
    email: 'admin@system.local',
    role: 'admin',
    department: 'IT',
    phone: '',
    permissions: ['all'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null
  };
  
  usersSheet.appendRow([JSON.stringify(adminUser)]);
  console.log('✓ Created default admin account (username: admin, password: admin123)');
}

  // ============================================
  // สร้าง sheet Sessions
  // ============================================
  if (sheetNames.indexOf('Sessions') === -1) {
    const sessionsSheet = ss.insertSheet('Sessions');
    sessionsSheet.appendRow(['session_json']);
  }

  // ============================================
  // สร้าง sheet Activities
  // ============================================
  if (sheetNames.indexOf('Activities') === -1) {
    const activitiesSheet = ss.insertSheet('Activities');
    activitiesSheet.appendRow(['activity_json']);
    
    // เพิ่มกิจกรรมเริ่มต้น
    const initActivity = {
      id: Utilities.getUuid(),
      type: 'system_init',
      description: 'เริ่มต้นระบบและสร้าง Sheets',
      user: 'System',
      created_at: new Date().toISOString()
    };
    
    activitiesSheet.appendRow([JSON.stringify(initActivity)]);
  }

  // ============================================
  // 📦 สร้าง sheet Borrows (การยืม-คืนพัสดุ)
  // ============================================
  if (sheetNames.indexOf('Borrows') === -1) {
    const borrowsSheet = ss.insertSheet('Borrows');
    borrowsSheet.appendRow(['borrow_json']);
    
    // เพิ่มข้อมูลตัวอย่าง
    const sampleBorrow = {
      id: Utilities.getUuid(),
      user_id: '',
      equipment_id: '',
      equipment_number: 'EQ001',
      equipment_name: 'เครื่องคอมพิวเตอร์ Dell OptiPlex 7090',
      equipment_type: 'คอมพิวเตอร์',
      equipment_brand: 'Dell',
      equipment_model: 'OptiPlex 7090',
      borrower_name: 'นายสมชาย ใจดี',
      borrower_contact: '081-234-5678',
      borrower_department: 'แผนกไอที',
      borrow_date: new Date().toISOString().split('T')[0],
      return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_return_date: null,
      purpose: 'ใช้งานโครงการพัฒนาระบบ',
      status: 'pending', // pending, approved, borrowed, returned, rejected
      condition_before: 'good',
      condition_after: null,
      approved_by: null,
      approved_at: null,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    borrowsSheet.appendRow([JSON.stringify(sampleBorrow)]);
    console.log('✓ Created Borrows sheet with sample data');
  }

  console.log('✓ All sheets initialized successfully');
  return true;
}

// ============================================
// Authentication Functions
// ============================================

function login(username, password) {
  try {
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const userData = JSON.parse(data[i][0]);
      
      // ✅ แก้ไขเงื่อนไขนี้
      if (userData.username === username && 
          userData.password === password && 
          (userData.active === true || userData.status === 'active')) {  // เช็คทั้ง active และ status
        
        // สร้าง session
        const sessionId = Utilities.getUuid();
        const sessionData = {
          id: sessionId,
          user_id: userData.id,
          username: userData.username,
          role: userData.role,
          permissions: userData.permissions,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + CONFIG.SESSION_TIMEOUT).toISOString()
        };
        
        const sessionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessions');
        sessionsSheet.appendRow([JSON.stringify(sessionData)]);
        
        // อัพเดต last_login
        userData.last_login = new Date().toISOString();
        usersSheet.getRange(i + 1, 1).setValue(JSON.stringify(userData));
        
        // บันทึกกิจกรรม
        addActivity('login', `${userData.name} เข้าสู่ระบบ`, userData.name);
        
        return {
          status: 'success',
          sessionId: sessionId,
          user: {
            id: userData.id,
            username: userData.username,
            role: userData.role,
            name: userData.name,
            permissions: userData.permissions
          }
        };
      }
    }
    
    return { status: 'error', message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  } catch (error) {
    console.error('Login error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}

function validateSession(sessionId) {
  try {
    const sessionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessions');
    const data = sessionsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const sessionData = JSON.parse(data[i][0]);
      if (sessionData.id === sessionId) {
        if (new Date() < new Date(sessionData.expires_at)) {
          return { status: 'valid', session: sessionData };
        } else {
          // Session หมดอายุ - ลบออก
          sessionsSheet.deleteRow(i + 1);
          return { status: 'expired' };
        }
      }
    }
    
    return { status: 'invalid' };
  } catch (error) {
    console.error('Session validation error:', error);
    return { status: 'error' };
  }
}

function logout(sessionId) {
  try {
    const sessionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sessions');
    const data = sessionsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const sessionData = JSON.parse(data[i][0]);
      if (sessionData.id === sessionId) {
        sessionsSheet.deleteRow(i + 1);
        return { status: 'success' };
      }
    }
    
    return { status: 'success' };
  } catch (error) {
    console.error('Logout error:', error);
    return { status: 'error' };
  }
}

// ============================================
// Equipment Functions
// ============================================

function addEquipment(equipmentData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    if (!sessionCheck.session.permissions.includes('all') && !sessionCheck.session.permissions.includes('inventory')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เพิ่มพัสดุ' };
    }

    // 🆕 Upload รูปภาพถ้ามี
    let imageUrl = equipmentData.image_url || '';
    
    if (equipmentData.image) {
      Logger.log('Uploading equipment image...');
      
      // แยก base64 data (ลบ data:image/xxx;base64, ออก)
      const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      const base64String = equipmentData.image.replace(base64Pattern, '');
      
      // เรียกใช้ฟังก์ชัน uploadImage ที่มีอยู่แล้ว
      const uploadResult = uploadImage(
        base64String, 
        'equipment_' + equipmentData.equipment_number + '_' + new Date().getTime() + '.jpg'
      );
      
      if (uploadResult.status === 'success') {
        imageUrl = uploadResult.url;
        Logger.log('Image uploaded: ' + imageUrl);
      } else {
        Logger.log('Image upload failed');
      }
    }

    const equipment = {
      id: Utilities.getUuid(),
      equipment_number: equipmentData.equipment_number,
      name: equipmentData.name,
      type: equipmentData.type,
      brand: equipmentData.brand || '',
      model: equipmentData.model || '',
      purchase_year: equipmentData.purchase_year || '',
      purchase_price: parseFloat(equipmentData.purchase_price) || 0,
      purchase_date: equipmentData.purchase_date || '',
      warranty_end_date: equipmentData.warranty_end_date || '',
      location: equipmentData.location || '',
      status: equipmentData.status || 'active',
      image_url: imageUrl,  // 🆕 ใช้ URL ที่ upload แล้ว
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    equipmentSheet.appendRow([JSON.stringify(equipment)]);

    // บันทึกกิจกรรม
    addActivity('equipment_add', `เพิ่มพัสดุใหม่: ${equipment.name} (${equipment.equipment_number})`, sessionCheck.session.username);

    // ส่งการแจ้งเตือน
    sendTelegramNotification(`📦 เพิ่มพัสดุใหม่\nรหัส: ${equipment.equipment_number}\nชื่อ: ${equipment.name}\nประเภท: ${equipment.type}\nสถานที่: ${equipment.location}`);

    return { status: 'success', message: 'เพิ่มพัสดุเรียบร้อยแล้ว', equipment: equipment };
  } catch (error) {
    console.error('Add equipment error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการเพิ่มพัสดุ: ' + error.toString() };
  }
}


function getEquipmentList(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();
    const equipment = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        equipment.push(JSON.parse(data[i][0]));
      }
    }

    return { status: 'success', equipment: equipment };
  } catch (error) {
    console.error('Get equipment list error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพัสดุ' };
  }
}

function updateEquipment(equipmentId, equipmentData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    if (!sessionCheck.session.permissions.includes('all') && !sessionCheck.session.permissions.includes('inventory')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์แก้ไขพัสดุ' };
    }

    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        if (equipment.id === equipmentId) {
          
          // 🆕 Upload รูปภาพใหม่ถ้ามี
          if (equipmentData.image) {
            Logger.log('Uploading new equipment image...');
            
            // แยก base64 data (ลบ data:image/xxx;base64, ออก)
            const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
            const base64String = equipmentData.image.replace(base64Pattern, '');
            
            // เรียกใช้ฟังก์ชัน uploadImage ที่มีอยู่แล้ว
            const uploadResult = uploadImage(
              base64String, 
              'equipment_' + equipment.equipment_number + '_' + new Date().getTime() + '.jpg'
            );
            
            if (uploadResult.status === 'success') {
              equipmentData.image_url = uploadResult.url;
              Logger.log('New image uploaded: ' + uploadResult.url);
            } else {
              Logger.log('Image upload failed');
            }
          }
          
          // อัพเดตข้อมูล
          Object.keys(equipmentData).forEach(key => {
            if (key !== 'image') {  // 🆕 ข้าม key 'image' เพราะใช้ image_url แทน
              if (key === 'purchase_price') {
                equipment[key] = parseFloat(equipmentData[key]) || 0;
              } else {
                equipment[key] = equipmentData[key];
              }
            }
          });
          
          equipment.updated_at = new Date().toISOString();

          equipmentSheet.getRange(i + 1, 1).setValue(JSON.stringify(equipment));

          // บันทึกกิจกรรม
          addActivity('equipment_update', `แก้ไขพัสดุ: ${equipment.name} (${equipment.equipment_number})`, sessionCheck.session.username);

          return { status: 'success', message: 'แก้ไขพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบพัสดุที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update equipment error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขพัสดุ: ' + error.toString() };
  }
}

function deleteEquipment(equipmentId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ลบพัสดุ' };
    }

    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        if (equipment.id === equipmentId) {
          equipmentSheet.deleteRow(i + 1);

          // บันทึกกิจกรรม
          addActivity('equipment_delete', `ลบพัสดุ: ${equipment.name} (${equipment.equipment_number})`, sessionCheck.session.username);

          return { status: 'success', message: 'ลบพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบพัสดุที่ต้องการลบ' };
  } catch (error) {
    console.error('Delete equipment error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบพัสดุ' };
  }
}

// ============================================
// แก้ไขฟังก์ชัน getEquipmentByNumber ใน code.gs
// ให้หาพัสดุได้ทุกสถานะ ไม่กรองด้วย status
// ============================================

/**
 * ค้นหาพัสดุด้วยรหัสพัสดุ
 * @param {string} equipmentNumber - รหัสพัสดุ
 * @param {boolean} activeOnly - (Optional) หาเฉพาะสถานะ active/maintenance (default: false)
 * @returns {Object} - ผลการค้นหา
 */
function getEquipmentByNumber(equipmentNumber, activeOnly = false) {
  try {
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        
        // ⭐ ตรวจสอบ equipment_number ตรงกัน
        if (equipment.equipment_number === equipmentNumber) {
          
          // ถ้าต้องการกรองเฉพาะ active/maintenance
          if (activeOnly) {
            if (equipment.status === 'active' || 
                equipment.status === 'maintenance' || 
                !equipment.status) {
              return { status: 'success', equipment: equipment };
            }
          } else {
            // ⭐ คืนค่าพัสดุโดยไม่สนใจสถานะ
            return { status: 'success', equipment: equipment };
          }
        }
      }
    }

    return { status: 'error', message: 'ไม่พบพัสดุ' };
  } catch (error) {
    console.error('Get equipment by number error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการค้นหาพัสดุ' };
  }
}

// ============================================
// เพิ่มฟังก์ชันช่วยดีบัก: ดูสถานะพัสดุปัจจุบัน
// ============================================

/**
 * ฟังก์ชันสำหรับ Debug - ดูข้อมูลพัสดุทั้งหมด
 */
function debugEquipment(equipmentNumber) {
  try {
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        if (equipment.equipment_number === equipmentNumber) {
          Logger.log('=== Debug Equipment ===');
          Logger.log('Equipment Number: ' + equipment.equipment_number);
          Logger.log('Name: ' + equipment.name);
          Logger.log('Status: ' + equipment.status);
          Logger.log('Full Data: ' + JSON.stringify(equipment, null, 2));
          return equipment;
        }
      }
    }
    
    Logger.log('Equipment not found: ' + equipmentNumber);
    return null;
  } catch (error) {
    Logger.log('Debug error: ' + error);
    return null;
  }
}

// ============================================
// 🔧 Debug และแก้ไข Status ของพัสดุ
// ============================================

/**
 * ตรวจสอบ status ของพัสดุทั้งหมด
 */
function debugAllEquipmentStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Equipment');
  const data = sheet.getDataRange().getValues();
  
  Logger.log('=== Debug All Equipment Status ===');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      const equipment = JSON.parse(data[i][0]);
      Logger.log(`${equipment.equipment_number} | "${equipment.status}" | Type: ${typeof equipment.status} | Length: ${equipment.status ? equipment.status.length : 0}`);
    }
  }
}

/**
 * แก้ไข status ของพัสดุเฉพาะรายการ
 */
function fixEquipmentStatus(equipmentNumber, newStatus = 'active') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Equipment');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      const equipment = JSON.parse(data[i][0]);
      if (equipment.equipment_number === equipmentNumber) {
        const oldStatus = equipment.status;
        equipment.status = newStatus;
        equipment.updated_at = new Date().toISOString();
        
        sheet.getRange(i + 1, 1).setValue(JSON.stringify(equipment));
        
        Logger.log(`แก้ไข ${equipmentNumber}: "${oldStatus}" -> "${newStatus}"`);
        return {
          status: 'success',
          message: `แก้ไขสถานะ ${equipmentNumber} เรียบร้อย`,
          oldStatus: oldStatus,
          newStatus: newStatus
        };
      }
    }
  }
  
  return { status: 'error', message: 'ไม่พบพัสดุ' };
}

/**
 * แก้ไข status ของพัสดุทั้งหมดที่ผิดพลาด
 */
function fixAllEquipmentStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Equipment');
  const data = sheet.getDataRange().getValues();
  
  let fixedCount = 0;
  const fixes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      const equipment = JSON.parse(data[i][0]);
      const oldStatus = equipment.status;
      let needsFix = false;
      let newStatus = oldStatus;
      
      // แก้ไขกรณีต่างๆ
      if (!oldStatus || oldStatus === '' || oldStatus === null || oldStatus === undefined) {
        newStatus = 'active';
        needsFix = true;
      } else if (typeof oldStatus === 'string') {
        // ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็ก
        const cleaned = oldStatus.trim().toLowerCase();
        
        // เช็คว่าเป็น status ที่ถูกต้องหรือไม่
        if (!['active', 'maintenance', 'retired'].includes(cleaned)) {
          newStatus = 'active'; // ถ้าไม่รู้จัก ให้เป็น active
          needsFix = true;
        } else if (cleaned !== oldStatus) {
          newStatus = cleaned;
          needsFix = true;
        }
      }
      
      if (needsFix) {
        equipment.status = newStatus;
        equipment.updated_at = new Date().toISOString();
        sheet.getRange(i + 1, 1).setValue(JSON.stringify(equipment));
        
        fixes.push({
          equipment_number: equipment.equipment_number,
          name: equipment.name,
          oldStatus: oldStatus,
          newStatus: newStatus
        });
        
        fixedCount++;
        Logger.log(`แก้ไข ${equipment.equipment_number}: "${oldStatus}" -> "${newStatus}"`);
      }
    }
  }
  
  Logger.log(`แก้ไขทั้งหมด ${fixedCount} รายการ`);
  
  return {
    status: 'success',
    message: `แก้ไขสถานะทั้งหมด ${fixedCount} รายการ`,
    fixes: fixes,
    count: fixedCount
  };
}

/**
 * ตรวจสอบและแก้ไขฟังก์ชัน updateEquipmentStatus
 * เพื่อให้แน่ใจว่าบันทึก status ถูกต้อง
 */
function updateEquipmentStatus(equipmentNumber, newStatus) {
  try {
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        if (equipment.equipment_number === equipmentNumber) {
          // 🔧 ตรวจสอบว่า newStatus เป็น string และเป็นค่าที่ถูกต้อง
          const validStatuses = ['active', 'maintenance', 'retired'];
          const cleanedStatus = String(newStatus).trim().toLowerCase();
          
          if (!validStatuses.includes(cleanedStatus)) {
            Logger.log(`⚠️ WARNING: Invalid status "${newStatus}" for ${equipmentNumber}, using "active" instead`);
            equipment.status = 'active';
          } else {
            equipment.status = cleanedStatus;
          }
          
          equipment.updated_at = new Date().toISOString();
          equipmentSheet.getRange(i + 1, 1).setValue(JSON.stringify(equipment));
          
          Logger.log(`✅ Updated ${equipmentNumber} status to "${equipment.status}"`);
          
          return { status: 'success', message: 'อัพเดทสถานะพัสดุเรียบร้อย' };
        }
      }
    }
    
    return { status: 'warning', message: 'ไม่พบพัสดุที่ต้องการอัพเดท' };
  } catch (error) {
    console.error('Update equipment status error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะพัสดุ' };
  }
}
// ============================================
// Repair Functions (แก้ไขเพื่อรองรับการอัพเดทสถานะพัสดุ)
// ============================================

// ฟังก์ชันเดิม - เก็บไว้เพื่อ backward compatibility
function submitRepairRequest(repairData) {
  return submitRepairRequestWithSnapshot(repairData, '', '');
}

/**
 * ฟังก์ชันรับ sessionId เพื่อดึง user_id
 */
function submitRepairRequestWithSession(repairData, sessionId) {
  try {
    let userId = '';
    let reporterName = repairData.reporter_name;
    
    // ถ้ามี sessionId ให้ดึงข้อมูล user
    if (sessionId) {
      const sessionCheck = validateSession(sessionId);
      if (sessionCheck.status === 'valid') {
        userId = sessionCheck.session.user_id || '';
        
        // ถ้าไม่มีชื่อผู้แจ้ง ให้ใช้ชื่อจาก session
        if (!reporterName) {
          const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
          const userData = usersSheet.getDataRange().getValues();
          
          for (let i = 1; i < userData.length; i++) {
            if (userData[i][0]) {
              const user = JSON.parse(userData[i][0]);
              if (user.id === userId) {
                reporterName = user.name;
                break;
              }
            }
          }
        }
      }
    }
    
    return submitRepairRequestWithSnapshot(repairData, userId, reporterName);
    
  } catch (error) {
    console.error('Submit repair with session error:', error);
    return submitRepairRequestWithSnapshot(repairData, '', repairData.reporter_name);
  }
}

/**
 * ตรวจสอบพัสดุและงานซ่อมค้างอยู่ก่อนอนุญาตให้แจ้งซ่อม
 * @param {string} equipmentNumber - รหัสพัสดุ
 * @param {string} currentRepairId - (Optional) ID ของรายการซ่อมที่กำลังแก้ไข (เพื่อยกเว้นจากการตรวจสอบ)
 * @returns {Object} - ผลการตรวจสอบพร้อมข้อมูลพัสดุและงานซ่อมค้างอยู่
 */
function validateEquipmentForRepair(equipmentNumber, currentRepairId) {
  try {
    if (!equipmentNumber || equipmentNumber.trim() === '') {
      return { status: 'error', message: 'กรุณาระบุรหัสพัสดุ' };
    }
    
    const equipmentResult = getEquipmentByNumber(equipmentNumber);
    
    if (equipmentResult.status !== 'success' || !equipmentResult.equipment) {
      return { 
        status: 'error', 
        message: 'ไม่พบพัสดุในระบบ',
        equipment: null,
        has_pending: false
      };
    }
    
    const equipment = equipmentResult.equipment;
    
    // ✅ เพิ่มการตรวจสอบสถานะ "จำหน่าย"
    if (equipment.status === 'retired') {
      return {
        status: 'error',
        error_type: 'retired',
        message: 'ไม่สามารถแจ้งซ่อมได้ เนื่องจากพัสดุนี้มีสถานะ "จำหน่าย"',
        equipment: equipment,
        has_pending: false
      };
    }
    
    // ⭐ ส่ง currentRepairId ไปด้วยเพื่อยกเว้นรายการที่กำลังแก้ไข
    const pendingCheck = checkPendingRepair(equipmentNumber, currentRepairId);
    
    if (pendingCheck.status === 'has_pending') {
      return {
        status: 'success',
        equipment: equipment,
        has_pending: true,
        pending_count: pendingCheck.count,
        pending_repairs: pendingCheck.repairs,
        message: `พัสดุนี้มีงานซ่อมค้างอยู่แล้ว ${pendingCheck.count} รายการ`
      };
    }
    
    return {
      status: 'success',
      equipment: equipment,
      has_pending: false,
      pending_count: 0,
      pending_repairs: [],
      message: 'พร้อมแจ้งซ่อม'
    };
    
  } catch (error) {
    console.error('Validate equipment for repair error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบพัสดุ',
      equipment: null,
      has_pending: false
    };
  }
}
/**
 * ตรวจสอบว่าพัสดุมีงานซ่อมค้างอยู่หรือไม่
 * @param {string} equipmentNumber - รหัสพัสดุ
 * @param {string} excludeRepairId - (Optional) ID ของรายการซ่อมที่ต้องการยกเว้นจากการตรวจสอบ
 * @returns {Object} - ผลการตรวจสอบและรายการงานซ่อมค้างอยู่
 */
function checkPendingRepair(equipmentNumber, excludeRepairId = null) {
  try {
    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    if (!repairsSheet) {
      return { status: 'error', message: 'ไม่พบแผ่นงาน Repairs' };
    }
    
    const data = repairsSheet.getDataRange().getValues();
    const pendingRepairs = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const repair = JSON.parse(data[i][0]);
          
          // ⭐ ยกเว้นรายการที่กำลังแก้ไขออก
          if (excludeRepairId && repair.id === excludeRepairId) {
            continue;  // ข้ามรายการนี้
          }
          
          if (repair.equipment_number === equipmentNumber && 
              (repair.status === 'pending' || repair.status === 'in_progress')) {
            
            pendingRepairs.push({
              id: repair.id,
              status: repair.status,
              problem_description: repair.problem_description,
              created_at: repair.created_at,
              technician_name: repair.technician_name || '',
              reporter_name: repair.reporter_name || '',
              priority: repair.priority || 'normal'
            });
          }
        } catch (parseError) {
          console.error('Error parsing repair data at row ' + (i + 1), parseError);
          continue;
        }
      }
    }
    
    if (pendingRepairs.length > 0) {
      return { 
        status: 'has_pending', 
        message: 'พัสดุนี้มีงานซ่อมค้างอยู่',
        repairs: pendingRepairs,
        count: pendingRepairs.length
      };
    }
    
    return { 
      status: 'no_pending', 
      message: 'ไม่มีงานซ่อมค้างอยู่',
      repairs: [],
      count: 0
    };
    
  } catch (error) {
    console.error('Check pending repair error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ',
      repairs: [],
      count: 0
    };
  }
}

function submitRepairRequestWithSnapshot(repairData, userId, reporterName) {
  try {
    // ✅ ตรวจสอบว่ามีงานซ่อมค้างอยู่หรือไม่ก่อน
    const pendingCheck = checkPendingRepair(repairData.equipment_number);
    
    if (pendingCheck.status === 'has_pending') {
      return { 
        status: 'error', 
        message: 'ไม่สามารถแจ้งซ่อมได้ เนื่องจากพัสดุนี้มีงานซ่อมค้างอยู่แล้ว ' + pendingCheck.count + ' รายการ',
        pending_repairs: pendingCheck.repairs,
        pending_count: pendingCheck.count
      };
    }
    
    // ค้นหาข้อมูลพัสดุ
    const equipmentResult = getEquipmentByNumber(repairData.equipment_number);
    
    // ✅ อนุญาตให้แจ้งซ่อม "รายการอื่น" ที่ไม่อยู่ในระบบ
    let equipment = null;
    const isOtherItem = !equipmentResult.equipment; // ถ้าไม่พบในระบบ = เป็นรายการอื่น
    
    if (!isOtherItem && equipmentResult.status === 'success' && equipmentResult.equipment) {
      equipment = equipmentResult.equipment;
      
      // ⭐⭐⭐ ตรวจสอบสถานะจำหน่าย (สำหรับพัสดุที่มีในระบบ)
      if (equipment.status === 'retired') {
        return {
          status: 'error',
          message: 'ไม่สามารถแจ้งซ่อมได้ เนื่องจากพัสดุนี้มีสถานะ "จำหน่าย"'
        };
      }
      // ⭐⭐⭐ จบการตรวจสอบสถานะจำหน่าย
    }
    // ✅ ถ้าเป็นรายการอื่น ยังคงให้ดำเนินการต่อ (ไม่ต้องค้นหา equipment)
    
    // สร้างข้อมูลการแจ้งซ่อม
    const repair = {
      id: Utilities.getUuid(),
      user_id: userId || '',
      equipment_id: equipment?.id || '',
      equipment_number: repairData.equipment_number,
      
      // บันทึก snapshot ข้อมูลพัสดุ ณ เวลาที่แจ้งซ่อม (หรือชื่อรายการอื่น)
      equipment_name: equipment?.name || repairData.equipment_number, // ✅ ใช้ชื่อรายการถ้าไม่มีในระบบ
      equipment_type: equipment?.type || (isOtherItem ? 'อื่น ๆ' : '-'),
      equipment_brand: equipment?.brand || '-',
      equipment_model: equipment?.model || '-',
      equipment_location: repairData.location || equipment?.location || '-', // ✅ เพิ่มสถานที่
      
      reporter_name: reporterName || repairData.reporter_name,
      reporter_contact: repairData.reporter_contact,
      priority: repairData.priority || 'normal',
      damage_type: repairData.damage_type || 'unknown',
      problem_description: repairData.problem_description,
      image_url: repairData.image_url || '',
      
      status: 'pending',
      technician_id: '',
      technician_name: '',
      repair_cost: 0,
      repair_note: '',
      repair_image_url: '',
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // บันทึกข้อมูลการแจ้งซ่อม
    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    if (!repairsSheet) {
      return { 
        status: 'error', 
        message: 'ไม่พบแผ่นงาน Repairs' 
      };
    }
    
    repairsSheet.appendRow([JSON.stringify(repair)]);
    
    // ✅ อัพเดทสถานะพัสดุเป็น "maintenance" เมื่อมีการแจ้งซ่อม
    const updateResult = updateEquipmentStatus(repairData.equipment_number, 'maintenance');
    const statusMessage = updateResult.status === 'success' ? 
      'ซ่อมบำรุง' : 'ไม่สามารถอัพเดทสถานะได้';
    
    // บันทึกกิจกรรม
    addActivity(
      'repair_submit', 
      `แจ้งซ่อม: ${repair.equipment_number} (สถานะพัสดุเปลี่ยนเป็น ${statusMessage})`, 
      repair.reporter_name
    );
    
    // ส่งการแจ้งเตือน Telegram
    try {
      sendTelegramNotification(
        `🔧 การแจ้งซ่อมใหม่\n` +
        `รหัสพัสดุ: ${repair.equipment_number}\n` +
        `ชื่อพัสดุ: ${repair.equipment_name}\n` +
        `ผู้แจ้ง: ${repair.reporter_name}\n` +
        `ปัญหา: ${repair.problem_description}\n` +
        `ความเร่งด่วน: ${repair.priority}\n\n` +
        `✅ สถานะพัสดุเปลี่ยนเป็น: ${statusMessage}`
      );
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
      // ไม่ให้ error จาก Telegram ทำให้การแจ้งซ่อมล้มเหลว
    }
    
    return { 
      status: 'success', 
      message: `ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว${updateResult.status === 'success' ? ' (สถานะพัสดุอัพเดทเป็น ซ่อมบำรุง)' : ''}`, 
      repair: repair 
    };
    
  } catch (error) {
    console.error('Submit repair request error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการส่งคำร้องแจ้งซ่อม: ' + error.toString() 
    };
  }
}

/**
 * ✅ Get single repair by ID
 */
function getRepairById(repairId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const repairsData = repairsSheet.getDataRange().getValues();
    
    for (let i = 1; i < repairsData.length; i++) {
      if (repairsData[i][0]) {
        const repair = JSON.parse(repairsData[i][0]);
        
        if (repair.id === repairId) {
          console.log('✅ Found repair:', repairId);
          return { status: 'success', repair: repair };
        }
      }
    }
    
    console.log('❌ Repair not found:', repairId);
    return { status: 'error', message: 'ไม่พบรายการซ่อม' };
    
  } catch (error) {
    console.error('getRepairById error:', error);
    return { status: 'error', message: error.toString() };
  }
}

// ============================================
// แก้ไขฟังก์ชัน getRepairList ใน code.gs
// กรองข้อมูลตามสิทธิ์ผู้ใช้งาน
// ============================================

function getRepairList(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    
    const repairsData = repairsSheet.getDataRange().getValues();
    const equipmentData = equipmentSheet.getDataRange().getValues();
    
    const repairs = [];
    
    // สร้าง Map ของ Equipment เพื่อค้นหาเร็ว
    const equipmentMap = {};
    for (let i = 1; i < equipmentData.length; i++) {
      if (equipmentData[i][0]) {
        const equipment = JSON.parse(equipmentData[i][0]);
        equipmentMap[equipment.equipment_number] = equipment;
      }
    }
    
    // ข้อมูลผู้ใช้ปัจจุบัน
    const currentUserId = sessionCheck.session.user_id || '';
    const currentUserName = sessionCheck.session.name || ''; // ใช้ชื่อในการเทียบกับ technician_name
    const userRole = sessionCheck.session.role;
    
    // เช็คว่าเป็น Admin หรือไม่
    const isAdmin = sessionCheck.session.permissions.includes('all') || userRole === 'admin';

    for (let i = 1; i < repairsData.length; i++) {
      if (repairsData[i][0]) {
        const repair = JSON.parse(repairsData[i][0]);
        
        let canView = false;
        
        // 🔒 เงื่อนไขการมองเห็นข้อมูล
        if (isAdmin) {
          // 1. Admin เห็นทั้งหมด
          canView = true;
        } else if (userRole === 'technician') {
          // 2. ช่างซ่อม เห็นงานของตัวเอง (ที่แจ้งเอง) และ งานที่ได้รับมอบหมาย (ชื่อตรงกัน)
          if (repair.user_id === currentUserId || repair.technician_name === currentUserName) {
            canView = true;
          }
        } else {
          // 3. ผู้ใช้ทั่วไป เห็นเฉพาะงานที่ตัวเองแจ้ง
          if (repair.user_id === currentUserId) {
            canView = true;
          }
        }
        
        if (canView) {
          // JOIN กับข้อมูล Equipment
          const equipment = equipmentMap[repair.equipment_number];
          if (equipment) {
            repair.equipment_name = equipment.name;
            repair.equipment_type = equipment.type;
            repair.equipment_brand = equipment.brand;
            repair.equipment_model = equipment.model;
            repair.equipment_location = equipment.location;
          } else {
            if (!repair.equipment_name) repair.equipment_name = '-';
            if (!repair.equipment_type) repair.equipment_type = '-';
            if (!repair.equipment_brand) repair.equipment_brand = '-';
            if (!repair.equipment_model) repair.equipment_model = '-';
            if (!repair.equipment_location) repair.equipment_location = '-';
          }
          
          // ตรวจสอบ spare_parts
          if (!repair.spare_parts) {
            repair.spare_parts = [];
          } else if (typeof repair.spare_parts === 'string') {
            try {
              repair.spare_parts = JSON.parse(repair.spare_parts);
            } catch (e) {
              repair.spare_parts = [];
            }
          }
          
          repairs.push(repair);
        }
      }
    }

    // เรียงลำดับตามวันที่ใหม่สุด
    repairs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { status: 'success', repairs: repairs };
  } catch (error) {
    console.error('Get repair list error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งซ่อม' };
  }
}

function updateRepairStatus(repairId, updateData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    if (!sessionCheck.session.permissions.includes('all') && !sessionCheck.session.permissions.includes('repair')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์แก้ไขข้อมูลการซ่อม' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        if (repair.id === repairId) {
          // เก็บสถานะเก่าไว้เพื่อเช็ค
          const oldStatus = repair.status;
          
          // อัพเดตข้อมูล
          Object.keys(updateData).forEach(key => {
            repair[key] = updateData[key];
          });
          
          // ✅ เพิ่ม: ตรวจสอบและบันทึก spare_parts
          if (updateData.spare_parts) {
            // ถ้า updateData.spare_parts เป็น string JSON ให้แปลงเป็น object
            if (typeof updateData.spare_parts === 'string') {
              try {
                repair.spare_parts = JSON.parse(updateData.spare_parts);
              } catch (e) {
                repair.spare_parts = updateData.spare_parts;
              }
            } else {
              repair.spare_parts = updateData.spare_parts;
            }
          } else if (!repair.spare_parts) {
            // ถ้าไม่มี spare_parts ให้สร้าง empty array
            repair.spare_parts = [];
          }
          
          repair.updated_at = new Date().toISOString();
          repair.updated_by = sessionCheck.session.username;
          
          // ถ้าไม่มีช่างกำหนดไว้ ให้ใส่ชื่อคนที่อัพเดต
          if (!repair.technician_name && sessionCheck.session.role === 'technician') {
            repair.technician_name = sessionCheck.session.username;
          }

          repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));

          // 🔧 แก้ไข: อัพเดทสถานะพัสดุตามสถานะการซ่อม
          let equipmentStatus = '';
          let statusMessage = '';
          
          if (updateData.status === 'completed') {
            // ✅ ซ่อมเสร็จ → เปลี่ยนสถานะพัสดุเป็น "active"
            equipmentStatus = 'active';
            statusMessage = 'ใช้งานปกติ';
            
            // ✅ ตรวจสอบและบันทึก started_at ถ้ายังไม่มี (เพื่อเข้ากันได้กับข้อมูลเก่า)
            if (!repair.started_at) {
              repair.started_at = repair.created_at; // ใช้เวลาแจ้งหากไม่มีเวลาเริ่ม
            }
            
            repair.completed_at = new Date().toISOString(); // บันทึกเวลาที่เสร็จสิ้น
            updateEquipmentStatus(repair.equipment_number, equipmentStatus);
            
          } else if (updateData.status === 'in_progress') {
            // ✅ กำลังซ่อม → คงสถานะ "maintenance"
            equipmentStatus = 'maintenance';
            statusMessage = 'ซ่อมบำรุง';
            repair.started_at = repair.started_at || new Date().toISOString(); // บันทึกเวลาเริ่มต้น
            updateEquipmentStatus(repair.equipment_number, equipmentStatus);
            
          } else if (updateData.status === 'cancelled') {
            // ✅ ยกเลิกการซ่อม → เปลี่ยนกลับเป็น "active"
            equipmentStatus = 'active';
            statusMessage = 'ใช้งานปกติ';
            updateEquipmentStatus(repair.equipment_number, equipmentStatus);
          }

          // บันทึกกิจกรรม
          let activityDesc = `อัพเดตการซ่อม: ${repair.equipment_number}`;
          if (updateData.status === 'completed') {
            activityDesc = `ซ่อมเสร็จ: ${repair.equipment_number} (สถานะพัสดุเปลี่ยนเป็น ${statusMessage})`;
          } else if (updateData.status === 'in_progress') {
            activityDesc = `เริ่มซ่อม: ${repair.equipment_number} (สถานะพัสดุ: ${statusMessage})`;
          } else if (updateData.status === 'cancelled') {
            activityDesc = `ยกเลิกการซ่อม: ${repair.equipment_number} (สถานะพัสดุเปลี่ยนเป็น ${statusMessage})`;
          }
          addActivity('repair_update', activityDesc, sessionCheck.session.username);

          // ส่งการแจ้งเตือน
          if (updateData.status === 'completed') {
            sendTelegramNotification(`✅ การซ่อมเสร็จสิ้น\nรหัสพัสดุ: ${repair.equipment_number}\nชื่อพัสดุ: ${repair.equipment_name}\nช่าง: ${repair.technician_name}\nค่าใช้จ่าย: ${repair.repair_cost || 0} บาท\n\n✅ สถานะพัสดุเปลี่ยนเป็น: ${statusMessage}`);
          } else if (updateData.status === 'in_progress') {
            sendTelegramNotification(`🔧 เริ่มซ่อม\nรหัสพัสดุ: ${repair.equipment_number}\nชื่อพัสดุ: ${repair.equipment_name}\nช่าง: ${repair.technician_name}\n\n⚙️ สถานะพัสดุ: ${statusMessage}`);
          } else if (updateData.status === 'cancelled') {
            sendTelegramNotification(`❌ ยกเลิกการซ่อม\nรหัสพัสดุ: ${repair.equipment_number}\nชื่อพัสดุ: ${repair.equipment_name}\n\n✅ สถานะพัสดุเปลี่ยนเป็น: ${statusMessage}`);
          }

          return { 
            status: 'success', 
            message: `อัพเดตสถานะการซ่อมเรียบร้อยแล้ว${equipmentStatus ? ' (สถานะพัสดุอัพเดทเป็น ' + statusMessage + ')' : ''}` 
          };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการซ่อมที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update repair status error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการอัพเดตสถานะการซ่อม' };
  }
}

function updateRepairData(repairId, repairData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const currentUserId = sessionCheck.session.user_id || '';
    const isAdmin = sessionCheck.session.permissions.includes('all');
    const isTechnician = sessionCheck.session.permissions.includes('repair');

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        if (repair.id === repairId) {
          // ตรวจสอบสิทธิ์
          const isOwner = (repair.user_id === currentUserId);
          if (!isAdmin && !isTechnician && !isOwner) {
            return { status: 'error', message: 'ไม่มีสิทธิ์แก้ไขรายการนี้' };
          }

          // อัพเดตข้อมูลที่อนุญาตให้แก้ไข
          const allowedFields = [
            'equipment_number',
            'reporter_name', 
            'reporter_contact',
            'priority',
            'problem_description',
            'image_url'
          ];

          allowedFields.forEach(field => {
            if (repairData.hasOwnProperty(field)) {
              repair[field] = repairData[field];
            }
          });

          // อัพเดต snapshot ข้อมูลพัสดุถ้ามีการเปลี่ยนรหัสพัสดุ
          if (repairData.equipment_number && repairData.equipment_number !== repair.equipment_number) {
            const equipmentResult = getEquipmentByNumber(repairData.equipment_number);
            if (equipmentResult.status === 'success' && equipmentResult.equipment) {
              const eq = equipmentResult.equipment;
              repair.equipment_id = eq.id;
              repair.equipment_name = eq.name;
              repair.equipment_type = eq.type || '-';
              repair.equipment_brand = eq.brand || '-';
              repair.equipment_model = eq.model || '-';
              repair.equipment_location = eq.location || '-';
            }
          }

          repair.updated_at = new Date().toISOString();

          repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));

          // บันทึกกิจกรรม
          addActivity('repair_update', `แก้ไขการแจ้งซ่อม: ${repair.equipment_number}`, sessionCheck.session.username);

          return { 
            status: 'success', 
            message: 'แก้ไขรายการแจ้งซ่อมเรียบร้อยแล้ว',
            repair: repair 
          };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update repair data error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' };
  }
}

function deleteRepair(repairId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }
    
    const currentUserId = sessionCheck.session.user_id || '';
    const isAdmin = sessionCheck.session.permissions.includes('all');
    
    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        if (repair.id === repairId) {
          // ตรวจสอบสิทธิ์
          const isOwner = (repair.user_id === currentUserId);
          if (!isAdmin && !isOwner) {
            return { status: 'error', message: 'ไม่มีสิทธิ์ลบรายการนี้' };
          }
          
          // ลบแถว
          repairsSheet.deleteRow(i + 1);
          
          // บันทึกกิจกรรม
          addActivity('repair_delete', `ลบการแจ้งซ่อม: ${repair.equipment_number}`, sessionCheck.session.username);
          
          return { status: 'success', message: 'ลบรายการเรียบร้อยแล้ว' };
        }
      }
    }
    
    return { status: 'error', message: 'ไม่พบรายการที่ต้องการลบ' };
  } catch (error) {
    console.error('Delete repair error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}

// ============================================
// ฟังก์ชันเสริม: ตรวจสอบและรีเซ็ตสถานะพัสดุ
// ============================================

function checkAndResetMaintenanceStatus() {
  try {
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    
    const equipmentData = equipmentSheet.getDataRange().getValues();
    const repairsData = repairsSheet.getDataRange().getValues();
    
    // สร้าง Map ของพัสดุที่มีงานซ่อมค้างอยู่
    const activeRepairs = new Set();
    for (let i = 1; i < repairsData.length; i++) {
      if (repairsData[i][0]) {
        const repair = JSON.parse(repairsData[i][0]);
        // ถ้าสถานะเป็น pending หรือ in_progress = ยังซ่อมอยู่
        if (repair.status === 'pending' || repair.status === 'in_progress') {
          activeRepairs.add(repair.equipment_number);
        }
      }
    }
    
    // เช็คพัสดุที่อยู่ในสถานะ maintenance แต่ไม่มีงานซ่อมค้างอยู่
    let resetCount = 0;
    for (let i = 1; i < equipmentData.length; i++) {
      if (equipmentData[i][0]) {
        const equipment = JSON.parse(equipmentData[i][0]);
        
        // ถ้าสถานะเป็น maintenance แต่ไม่มีงานซ่อมค้างอยู่
        if (equipment.status === 'maintenance' && !activeRepairs.has(equipment.equipment_number)) {
          equipment.status = 'active';
          equipment.updated_at = new Date().toISOString();
          equipmentSheet.getRange(i + 1, 1).setValue(JSON.stringify(equipment));
          resetCount++;
          
          Logger.log(`รีเซ็ตสถานะพัสดุ ${equipment.equipment_number} เป็น active`);
        }
      }
    }
    
    if (resetCount > 0) {
      Logger.log(`รีเซ็ตสถานะพัสดุทั้งหมด ${resetCount} รายการ`);
      return { status: 'success', message: `รีเซ็ตสถานะพัสดุทั้งหมด ${resetCount} รายการ`, count: resetCount };
    } else {
      return { status: 'success', message: 'ไม่มีพัสดุที่ต้องรีเซ็ตสถานะ', count: 0 };
    }
    
  } catch (error) {
    console.error('Check and reset maintenance status error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด' };
  }
}

function getEquipmentStatusStats() {
  try {
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();
    
    const stats = {
      total: 0,
      active: 0,
      maintenance: 0,
      retired: 0
    };
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        stats.total++;
        
        const status = equipment.status || 'active';
        if (status === 'active') {
          stats.active++;
        } else if (status === 'maintenance') {
          stats.maintenance++;
        } else if (status === 'retired') {
          stats.retired++;
        }
      }
    }
    
    return { status: 'success', stats: stats };
  } catch (error) {
    console.error('Get equipment status stats error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด' };
  }
}

function getEquipmentRepairHistory(equipmentNumber) {
  try {
    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    const repairs = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        if (repair.equipment_number === equipmentNumber) {
          repairs.push(repair);
        }
      }
    }
    
    // เรียงตามวันที่ล่าสุด
    repairs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return { status: 'success', repairs: repairs, count: repairs.length };
  } catch (error) {
    console.error('Get equipment repair history error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงประวัติการซ่อม' };
  }
}

// ============================================
// Image & Barcode Functions
// ============================================

function uploadImage(base64Data, filename) {
  try {
    const configResult = getConfig('system');
    let folderId = '';
    
    if (configResult.status === 'success' && configResult.config.folder_id) {
      folderId = configResult.config.folder_id;
    }
    
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', filename);
    
    let file;
    if (folderId) {
      const folder = DriveApp.getFolderById(folderId);
      file = folder.createFile(blob);
    } else {
      file = DriveApp.createFile(blob);
    }
    
    // ทำให้ไฟล์เป็น public
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    const imageUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
    
    return { status: 'success', url: imageUrl };
  } catch (error) {
    console.error('Upload image error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ' };
  }
}

function generateBarcode(text) {
  try {
    // สร้าง barcode URL ด้วยการกำหนดขนาดที่เหมาะสม (ปรับขนาดให้เล็กลง)
    const barcodeUrl = `https://barcode.orcascan.com/?type=code128&data=${encodeURIComponent(text)}&format=png&width=200&height=30`;
    return { status: 'success', url: barcodeUrl };
  } catch (error) {
    console.error('Generate barcode error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการสร้างบาร์โค้ด' };
  }
}


// ============================================
// Activity Logging
// ============================================

function addActivity(type, description, user) {
  try {
    const activitiesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Activities');
    
    const activity = {
      id: Utilities.getUuid(),
      type: type,
      description: description,
      user: user,
      created_at: new Date().toISOString()
    };
    
    activitiesSheet.appendRow([JSON.stringify(activity)]);
    
    // เก็บเฉพาะ 100 รายการล่าสุด
    const data = activitiesSheet.getDataRange().getValues();
    if (data.length > 101) {
      activitiesSheet.deleteRows(2, data.length - 101);
    }
    
  } catch (error) {
    console.error('Add activity error:', error);
  }
}

function getRecentActivities(sessionId, limit = 20) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const activitiesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Activities');
    const data = activitiesSheet.getDataRange().getValues();
    const activities = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const activity = JSON.parse(data[i][0]);
        activities.push(activity);
      }
    }

    // เรียงลำดับตามวันที่ใหม่สุด
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // เอาเฉพาะจำนวนที่ต้องการ (default 20 รายการ เพื่อรองรับ pagination)
    return { status: 'success', activities: activities.slice(0, limit) };
  } catch (error) {
    console.error('Get recent activities error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม' };
  }
}

// ============================================
// Notification Functions
// ============================================

function sendTelegramNotification(message) {
  try {
    const configResult = getConfig('system');
    
    if (configResult.status === 'success') {
      const config = configResult.config;
      
      if (!config.notification_enabled) {
        return { status: 'skipped', message: 'การแจ้งเตือนถูกปิดใช้งาน' };
      }
      
      const botToken = config.telegram_bot_token;
      const chatId = config.telegram_chat_id;
      
      if (!botToken || !chatId || botToken === 'YOUR_BOT_TOKEN') {
        return { status: 'error', message: 'ไม่ได้ตั้งค่า Telegram Bot' };
      }
      
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      };
      
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
      
      if (result.ok) {
        return { status: 'success', message: 'ส่งการแจ้งเตือนเรียบร้อยแล้ว' };
      } else {
        return { status: 'error', message: 'ส่งการแจ้งเตือนไม่สำเร็จ' };
      }
    }
    
    return { status: 'error', message: 'ไม่สามารถดึงการตั้งค่าได้' };
  } catch (error) {
    console.error('Send Telegram notification error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน' };
  }
}

// ============================================
// Dashboard & Statistics
// ============================================

function getDashboardData(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const equipmentResult = getEquipmentList(sessionId);
    const repairResult = getRepairList(sessionId);
    
    let totalEquipment = 0;
    let expiringSoon = 0;
    let pendingRepairs = 0;
    let completedRepairs = 0;

    if (equipmentResult.status === 'success') {
      totalEquipment = equipmentResult.equipment.length;
      
      // นับพัสดุที่ใกล้หมดประกัน
      const configResult = getConfig(sessionId);
      let alertDays = 30;
      if (configResult.status === 'success') {
        alertDays = configResult.config.warranty_alert_days || 30;
      }
      
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + alertDays);
      
      expiringSoon = equipmentResult.equipment.filter(eq => {
        if (!eq.warranty_end_date) return false;
        const warrantyDate = new Date(eq.warranty_end_date);
        return warrantyDate <= alertDate && warrantyDate >= new Date();
      }).length;
    }

    if (repairResult.status === 'success') {
      pendingRepairs = repairResult.repairs.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
      completedRepairs = repairResult.repairs.filter(r => r.status === 'completed').length;
    }

    return {
      status: 'success',
      data: {
        totalEquipment: totalEquipment,
        expiringSoon: expiringSoon,
        pendingRepairs: pendingRepairs,
        completedRepairs: completedRepairs
      }
    };
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' };
  }
}

// ============================================
// Configuration Functions
// ============================================

function uploadLogoImage(base64Data) {
  try {
    if (!base64Data) {
      return { status: 'error', message: 'ไม่มีข้อมูลรูปภาพ' };
    }

    // สร้าง folder สำหรับเก็บโลโก้
    let logoFolder;
    const folderIterator = DriveApp.getFoldersByName('SystemLogos');
    if (folderIterator.hasNext()) {
      logoFolder = folderIterator.next();
    } else {
      logoFolder = DriveApp.getRootFolder().createFolder('SystemLogos');
    }

    // แปลง base64 เป็น blob
    const bytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(bytes, 'image/png', 'logo.png');

    // ลบไฟล์เก่าถ้ามี
    const files = logoFolder.getFilesByName('logo.png');
    while (files.hasNext()) {
      files.next().setTrashed(true);
    }

    // อัพโหลดไฟล์ใหม่
    const file = logoFolder.createFile(blob);
    
    // ตั้งค่าการแชร์เป็น public
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    return { 
      status: 'success', 
      fileId: file.getId(),
      message: 'อัพโหลดโลโก้เรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Upload logo error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการอัพโหลด: ' + error.toString() };
  }
}

function getSystemConfig() {
  try {
    const configResult = getConfig('system');
    if (configResult.status === 'success') {
      const config = configResult.config;
      
      // แปลง logo_file_id เป็น logo_url ถ้ามี
      if (config.logo_file_id && !config.logo_url) {
        config.logo_url = 'https://lh5.googleusercontent.com/d/' + config.logo_file_id;
      }
      
      return { status: 'success', config: config };
    }
    return { 
      status: 'success', 
      config: {
        app_name: CONFIG.APP_NAME,
        organization_name: '',
        logo_url: null
      }
    };
  } catch (error) {
    console.error('Get system config error:', error);
    return { 
      status: 'error', 
      config: {
        app_name: CONFIG.APP_NAME,
        organization_name: '',
        logo_url: null
      }
    };
  }
}

function getConfig(sessionId) {
  try {
    if (sessionId !== 'system') {
      const sessionCheck = validateSession(sessionId);
      if (sessionCheck.status !== 'valid') {
        return { status: 'error', message: 'Session ไม่ถูกต้อง' };
      }
    }

    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    const data = configSheet.getDataRange().getValues();
    
    if (data.length > 1 && data[1][0]) {
      const config = JSON.parse(data[1][0]);
      return { status: 'success', config: config };
    }

    return { status: 'error', message: 'ไม่พบข้อมูลการตั้งค่า' };
  } catch (error) {
    console.error('Get config error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า' };
  }
}

function updateConfig(configData, sessionId) {
  try {
    console.log('🔵 updateConfig called');
    console.log('Session ID:', sessionId);
    console.log('Config Data:', JSON.stringify(configData, null, 2));
    
    const sessionCheck = validateSession(sessionId);
    console.log('Session check result:', sessionCheck);
    
    if (sessionCheck.status !== 'valid' || !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!configSheet) {
      return { status: 'error', message: 'ไม่พบ Config Sheet' };
    }
    
    const data = configSheet.getDataRange().getValues();
    console.log('Config sheet rows:', data.length);
    
    if (data.length > 1 && data[1][0]) {
      const config = JSON.parse(data[1][0]);
      console.log('Current config:', config);
      
      // ✅ อัพเดตข้อมูลทั้งหมด
      Object.keys(configData).forEach(key => {
        if (configData[key] !== null && configData[key] !== undefined && configData[key] !== '') {
          config[key] = configData[key];
        }
      });
      
      // ✅ บังคับอัพเดต logo_url จาก logo_file_id ทุกครั้ง
      if (config.logo_file_id) {
        config.logo_url = 'https://lh5.googleusercontent.com/d/' + config.logo_file_id;
        console.log('✅ Logo URL updated:', config.logo_url);
      }
      
      config.updated_at = new Date().toISOString();
      
      console.log('New config to save:', JSON.stringify(config, null, 2));
      
      // บันทึกลง Sheet
      configSheet.getRange(2, 1).setValue(JSON.stringify(config));
      
      console.log('✅ Config saved successfully');
      
      // บันทึกกิจกรรม
      addActivity('config_update', 'อัพเดตการตั้งค่าระบบ', sessionCheck.session.username);
      
      return { status: 'success', message: 'อัพเดตการตั้งค่าเรียบร้อยแล้ว', config: config };
    } else {
      return { status: 'error', message: 'ไม่พบข้อมูลการตั้งค่า' };
    }
  } catch (error) {
    console.error('❌ Update config error:', error);
    return { status: 'error', message: error.toString() };
  }
}

// ============================================
// Report Functions
// ============================================

function getRepairReports(sessionId, startDate = '', endDate = '') {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    const reports = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        
        // กรองตามวันที่ถ้ามี
        if (startDate && endDate) {
          const repairDate = new Date(repair.created_at);
          const start = new Date(startDate);
          const end = new Date(endDate + 'T23:59:59');
          if (repairDate < start || repairDate > end) {
            continue;
          }
        }

        reports.push(repair);
      }
    }

    return { status: 'success', reports: reports };
  } catch (error) {
    console.error('Get repair reports error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน' };
  }
}

function getCostReports(sessionId, startDate = '', endDate = '') {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    let totalCost = 0;
    const costByMonth = {};

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        
        if (repair.status === 'completed' && repair.repair_cost > 0) {
          // กรองตามวันที่ถ้ามี
          if (startDate && endDate) {
            const repairDate = new Date(repair.updated_at);
            const start = new Date(startDate);
            const end = new Date(endDate + 'T23:59:59');
            if (repairDate < start || repairDate > end) {
              continue;
            }
          }

          const cost = parseFloat(repair.repair_cost) || 0;
          totalCost += cost;
          
          const month = new Date(repair.updated_at).toISOString().substring(0, 7);
          if (!costByMonth[month]) {
            costByMonth[month] = 0;
          }
          costByMonth[month] += cost;
        }
      }
    }

    return { 
      status: 'success', 
      totalCost: totalCost,
      costByMonth: costByMonth
    };
  } catch (error) {
    console.error('Get cost reports error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานค่าใช้จ่าย' };
  }
}

function generatePDFReport(reportType, reportData, dateRange) {
  try {
    // สร้าง HTML สำหรับ PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Sarabun', sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 18px; font-weight: bold; }
          .subtitle { font-size: 14px; color: #666; }
          .date-range { font-size: 12px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ระบบทะเบียนพัสดุครุภัณฑ์และแจ้งซ่อม</div>
          <div class="subtitle">${getReportTitle(reportType)}</div>
          <div class="date-range">ช่วงวันที่: ${dateRange || 'ทั้งหมด'}</div>
          <div class="date-range">วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</div>
        </div>
    `;

    if (reportType === 'repairs') {
      htmlContent += generateRepairsHTML(reportData);
    } else if (reportType === 'costs') {
      htmlContent += generateCostsHTML(reportData);
    } else if (reportType === 'equipment') {
      htmlContent += generateEquipmentHTML(reportData);
    }

    htmlContent += `
      </body>
      </html>
    `;

    // สร้าง PDF จาก HTML (Google Apps Script จะแปลง HTML เป็น PDF อัตโนมัติ)
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
    const file = DriveApp.createFile(blob);
    file.setName(`${reportType}_report_${new Date().getTime()}.html`);
    
    return { 
      status: 'success', 
      url: file.getUrl(),
      downloadUrl: file.getDownloadUrl()
    };
    
  } catch (error) {
    console.error('Generate PDF error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการสร้าง PDF' };
  }
}

function getReportTitle(reportType) {
  const titles = {
    'repairs': 'รายงานการซ่อม',
    'costs': 'รายงานค่าใช้จ่าย',
    'equipment': 'รายงานพัสดุครุภัณฑ์'
  };
  return titles[reportType] || 'รายงาน';
}

function generateRepairsHTML(repairs) {
  let html = `
    <div class="summary">
      <strong>สรุปข้อมูลการซ่อม</strong><br>
      รายการทั้งหมด: ${repairs.length} รายการ<br>
      เสร็จสิ้น: ${repairs.filter(r => r.status === 'completed').length} รายการ<br>
      กำลังดำเนินการ: ${repairs.filter(r => r.status === 'in_progress').length} รายการ<br>
      รอดำเนินการ: ${repairs.filter(r => r.status === 'pending').length} รายการ
    </div>
    
    <table>
      <thead>
        <tr>
          <th>วันที่แจ้ง</th>
          <th>รหัสพัสดุ</th>
          <th>ผู้แจ้ง</th>
          <th>ปัญหา</th>
          <th>ความเร่งด่วน</th>
          <th>สถานะ</th>
          <th>ช่าง</th>
          <th class="text-right">ค่าใช้จ่าย</th>
        </tr>
      </thead>
      <tbody>
  `;

  repairs.forEach(repair => {
    html += `
      <tr>
        <td>${new Date(repair.created_at).toLocaleDateString('th-TH')}</td>
        <td>${repair.equipment_number}</td>
        <td>${repair.reporter_name}</td>
        <td>${repair.problem_description.substring(0, 50)}${repair.problem_description.length > 50 ? '...' : ''}</td>
        <td>${repair.priority}</td>
        <td>${repair.status}</td>
        <td>${repair.technician_name || '-'}</td>
        <td class="text-right">${(repair.repair_cost || 0).toLocaleString()} บาท</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateCostsHTML(costData) {
  const totalCost = costData.totalCost || 0;
  const costByMonth = costData.costByMonth || {};

  let html = `
    <div class="summary">
      <strong>สรุปค่าใช้จ่ายการซ่อม</strong><br>
      ค่าใช้จ่ายรวม: ${totalCost.toLocaleString()} บาท<br>
      จำนวนเดือน: ${Object.keys(costByMonth).length} เดือน
    </div>
    
    <table>
      <thead>
        <tr>
          <th>เดือน/ปี</th>
          <th class="text-right">ค่าใช้จ่าย (บาท)</th>
          <th class="text-right">เปอร์เซ็นต์</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(costByMonth).forEach(([month, cost]) => {
    const percentage = totalCost > 0 ? ((cost / totalCost) * 100).toFixed(1) : '0.0';
    html += `
      <tr>
        <td>${month}</td>
        <td class="text-right">${cost.toLocaleString()}</td>
        <td class="text-right">${percentage}%</td>
      </tr>
    `;
  });

  html += `
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background-color: #f0f0f0;">
          <td>รวม</td>
          <td class="text-right">${totalCost.toLocaleString()}</td>
          <td class="text-right">100.0%</td>
        </tr>
      </tfoot>
    </table>
  `;

  return html;
}

function generateEquipmentHTML(equipment) {
  const totalValue = equipment.reduce((sum, eq) => sum + (parseFloat(eq.purchase_price) || 0), 0);

  let html = `
    <div class="summary">
      <strong>สรุปข้อมูลพัสดุ</strong><br>
      จำนวนพัสดุทั้งหมด: ${equipment.length} รายการ<br>
      มูลค่ารวม: ${totalValue.toLocaleString()} บาท
    </div>
    
    <table>
      <thead>
        <tr>
          <th>รหัสพัสดุ</th>
          <th>ชื่อพัสดุ</th>
          <th>ประเภท</th>
          <th>ยี่ห้อ/รุ่น</th>
          <th>ปีที่จัดซื้อ</th>
          <th class="text-right">ราคาจัดซื้อ</th>
          <th>วันหมดประกัน</th>
        </tr>
      </thead>
      <tbody>
  `;

  equipment.forEach(eq => {
    html += `
      <tr>
        <td>${eq.equipment_number}</td>
        <td>${eq.name}</td>
        <td>${eq.type || '-'}</td>
        <td>${eq.brand || ''} ${eq.model || ''}</td>
        <td class="text-center">${eq.purchase_year || '-'}</td>
        <td class="text-right">${(eq.purchase_price || 0).toLocaleString()}</td>
        <td class="text-center">${eq.warranty_end_date ? new Date(eq.warranty_end_date).toLocaleDateString('th-TH') : '-'}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}

// ============================================
// User Management Functions
// ============================================

function getUserList(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ✅ ตรวจสอบสิทธิ์ - เฉพาะ admin เท่านั้นที่จัดการผู้ใช้ได้
    const isAdmin = sessionCheck.session.permissions.includes('all');
    
    if (!isAdmin) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();
    const users = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const user = JSON.parse(data[i][0]);
        // ไม่ส่งรหัสผ่านกลับไป
        delete user.password;
        users.push(user);
      }
    }

    return { status: 'success', users: users };
  } catch (error) {
    console.error('Get user list error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' };
  }
}

function addUser(userData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์ - เฉพาะ admin
    const isAdmin = sessionCheck.session.permissions.includes('all');
    
    if (!isAdmin) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    // Validate required fields
    if (!userData.username || !userData.password || !userData.name || !userData.role) {
      return { status: 'error', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }

    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();

    // ตรวจสอบว่ามี username ซ้ำหรือไม่
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const existingUser = JSON.parse(data[i][0]);
        if (existingUser.username === userData.username) {
          return { status: 'error', message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' };
        }
      }
    }

    // สร้างผู้ใช้ใหม่
    const newUser = {
      id: Utilities.getUuid(),
      username: userData.username,
      password: userData.password, // ในการใช้งานจริงควร hash รหัสผ่าน
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions || [],
      active: userData.active !== undefined ? userData.active : true,
      created_at: new Date().toISOString(),
      last_login: null
    };

    // บันทึกลงใน sheet
    usersSheet.appendRow([JSON.stringify(newUser)]);

    // บันทึกกิจกรรม
    addActivity('user_add', `เพิ่มผู้ใช้: ${newUser.username}`, sessionCheck.session.username);

    return { status: 'success', message: 'เพิ่มผู้ใช้เรียบร้อยแล้ว', user: newUser };
  } catch (error) {
    console.error('Add user error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้' };
  }
}

function updateUser(userData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์ - เฉพาะ admin
    const isAdmin = sessionCheck.session.permissions.includes('all');
    
    if (!isAdmin) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    if (!userData.id) {
      return { status: 'error', message: 'ไม่พบข้อมูลผู้ใช้' };
    }

    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const user = JSON.parse(data[i][0]);
        
        if (user.id === userData.id) {
          // อัพเดทข้อมูล
          user.username = userData.username || user.username;
          user.name = userData.name || user.name;
          user.role = userData.role || user.role;
          user.permissions = userData.permissions || user.permissions;
          user.active = userData.active !== undefined ? userData.active : user.active;
          
          // อัพเดทรหัสผ่านเฉพาะเมื่อมีการส่งมา
          if (userData.password && userData.password.trim() !== '') {
            user.password = userData.password;
          }
          
          user.updated_at = new Date().toISOString();

          // บันทึกกลับลง sheet
          usersSheet.getRange(i + 1, 1).setValue(JSON.stringify(user));

          // บันทึกกิจกรรม
          addActivity('user_update', `แก้ไขผู้ใช้: ${user.username}`, sessionCheck.session.username);

          return { status: 'success', message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update user error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' };
  }
}

function deleteUser(userId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์ - เฉพาะ admin
    const isAdmin = sessionCheck.session.permissions.includes('all');
    
    if (!isAdmin) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    // ป้องกันไม่ให้ลบตัวเอง
    if (sessionCheck.session.user_id === userId) {
      return { status: 'error', message: 'ไม่สามารถลบบัญชีของตนเองได้' };
    }

    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const user = JSON.parse(data[i][0]);
        
        if (user.id === userId) {
          // ลบแถว
          usersSheet.deleteRow(i + 1);

          // บันทึกกิจกรรม
          addActivity('user_delete', `ลบผู้ใช้: ${user.username}`, sessionCheck.session.username);

          return { status: 'success', message: 'ลบผู้ใช้เรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบผู้ใช้ที่ต้องการลบ' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบผู้ใช้' };
  }
}

// ============================================
// ✅ อัปเดตสถานะการซ่อมโดยช่าง (แก้ไขแล้ว)
// ============================================

// ============================================
// ✅ บันทึกอะไหล่สำหรับการซ่อมที่เสร็จสิ้น
// ============================================
function updateRepairSpareParts(sessionId, repairId, spareParts) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('repair') ||
                          sessionCheck.session.role === 'technician';
    
    if (!hasPermission) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลการซ่อม' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    if (!repairsSheet) {
      return { status: 'error', message: 'ไม่พบ Repairs sheet' };
    }
    
    const data = repairsSheet.getDataRange().getValues();
    
    // ค้นหารายการซ่อม
    for (let i = 1; i < data.length; i++) {
      try {
        if (data[i][0]) {
          const repair = JSON.parse(data[i][0]);
          if (repair.id === repairId) {
            // บันทึก spare_parts
            repair.spare_parts = Array.isArray(spareParts) ? spareParts : [];
            repair.updated_at = new Date().toISOString();
            repair.updated_by = sessionCheck.session.username;
            
            Logger.log('🔧 Updating spare_parts for repair: ' + repairId);
            Logger.log('Spare parts: ' + JSON.stringify(repair.spare_parts));
            
            // บันทึกลง sheet
            repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));
            
            Logger.log('✅ Spare parts saved successfully');
            
            return { 
              status: 'success', 
              message: 'บันทึกอะไหล่เรียบร้อยแล้ว',
              saved_parts: repair.spare_parts
            };
          }
        }
      } catch (parseError) {
        Logger.log('Error parsing row ' + i + ': ' + parseError.toString());
        continue;
      }
    }
    
    Logger.log('Repair not found: ' + repairId);
    return { status: 'error', message: 'ไม่พบรายการซ่อม' };
  } catch (error) {
    Logger.log('Error in updateRepairSpareParts: ' + error.toString());
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// ============================================
// ✅ Backend: Update Repair by Technician (แก้ไข: รองรับสถานะ retired)
// ============================================
function updateRepairByTechnician(sessionId, updateData) {
  try {
    // 1. ตรวจสอบ session และสิทธิ์
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('repair') ||
                          sessionCheck.session.role === 'technician';
    
    if (!hasPermission) {
      return { status: 'error', message: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลการซ่อม' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    let repairIndex = -1;
    let repair = null;
    
    // 2. ค้นหารายการซ่อม
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const existingRepair = JSON.parse(data[i][0]);
        if (existingRepair.id === updateData.repairId) {
          repair = existingRepair;
          repairIndex = i + 1;
          break;
        }
      }
    }
    
    if (!repair) {
      return { status: 'error', message: 'ไม่พบรายการซ่อม' };
    }

    // 3. อัพเดทข้อมูลใน Object Repair
    if (updateData.status) repair.status = updateData.status;
    if (updateData.technicianName) repair.technician_name = updateData.technicianName;
    if (updateData.repairCost !== undefined && updateData.repairCost !== null) repair.repair_cost = updateData.repairCost;
    if (updateData.repairNotes !== undefined) repair.repair_notes = updateData.repairNotes;
    if (updateData.damageType) repair.damage_type = updateData.damageType; // อัพเดทประเภทความเสียหาย

    // จัดการรูปภาพ (ถ้ามี)
    if (updateData.repairImage) {
      try {
        const uploadResult = uploadImage(
          updateData.repairImage, 
          'repair_after_' + repair.id + '_' + new Date().getTime() + '.jpg'
        );
        if (uploadResult.status === 'success') {
          repair.repair_image_url = uploadResult.url;
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
    
    // จัดการอะไหล่ (Spare parts)
    if (updateData.spare_parts && Array.isArray(updateData.spare_parts)) {
      repair.spare_parts = updateData.spare_parts;
    } else if (!repair.spare_parts) {
      repair.spare_parts = [];
    }
    
    repair.updated_at = new Date().toISOString();
    repair.updated_by = sessionCheck.session.username;
    
    // 4. บันทึกข้อมูลกลับลง Sheet Repairs
    repairsSheet.getRange(repairIndex, 1).setValue(JSON.stringify(repair));
    
    // 5. ✅✅✅ อัพเดทสถานะพัสดุในทะเบียน (Equipment Sheet) ✅✅✅
    let equipmentStatus = 'maintenance'; // ค่าเริ่มต้น
    let statusMessage = 'กำลังซ่อม';

    if (updateData.status === 'completed') {
      equipmentStatus = 'active';
      statusMessage = 'ใช้งานปกติ';
      updateEquipmentStatus(repair.equipment_number, 'active');
      
    } else if (updateData.status === 'in_progress') {
      equipmentStatus = 'maintenance';
      statusMessage = 'กำลังซ่อม';
      updateEquipmentStatus(repair.equipment_number, 'maintenance');
      
    } else if (updateData.status === 'retired') {
      // 🔴 กรณีจำหน่าย
      equipmentStatus = 'retired';
      statusMessage = 'จำหน่าย';
      updateEquipmentStatus(repair.equipment_number, 'retired');
    }
    
    // 6. บันทึก Log กิจกรรม
    let activityDesc = `อัพเดทการซ่อม: ${repair.equipment_number}`;
    if (updateData.status === 'in_progress') activityDesc = `เริ่มซ่อม: ${repair.equipment_number}`;
    else if (updateData.status === 'completed') activityDesc = `ซ่อมเสร็จ: ${repair.equipment_number}`;
    else if (updateData.status === 'retired') activityDesc = `จำหน่ายพัสดุ: ${repair.equipment_number} (ซ่อมไม่ได้)`;
    
    addActivity(
      'repair_update',
      activityDesc,
      repair.technician_name || sessionCheck.session.username
    );
    
    // 7. ส่งการแจ้งเตือน Telegram
    try {
      if (updateData.status === 'completed') {
        sendTelegramNotification(
          `✅ ซ่อมเสร็จสิ้น\n` +
          `รหัส: ${repair.equipment_number}\n` +
          `ชื่อ: ${repair.equipment_name}\n` +
          `ช่าง: ${repair.technician_name}\n` +
          `ค่าใช้จ่าย: ${repair.repair_cost} บาท\n` +
          `สถานะพัสดุ: ใช้งานปกติ`
        );
      } else if (updateData.status === 'retired') {
        sendTelegramNotification(
          `❌ จำหน่ายพัสดุ\n` +
          `รหัส: ${repair.equipment_number}\n` +
          `ชื่อ: ${repair.equipment_name}\n` +
          `ช่าง: ${repair.technician_name}\n` +
          `สาเหตุ: ${repair.repair_notes || 'ซ่อมไม่ได้/เสื่อมสภาพ'}\n` +
          `สถานะพัสดุ: จำหน่ายออก`
        );
      } else if (updateData.status === 'in_progress') {
        sendTelegramNotification(
          `🔧 เริ่มดำเนินการซ่อม\n` +
          `รหัส: ${repair.equipment_number}\n` +
          `ช่าง: ${repair.technician_name}`
        );
      }
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
    }
    
    return { 
      status: 'success', 
      message: 'อัพเดทข้อมูลเรียบร้อย',
      repair: repair 
    };
    
  } catch (error) {
    console.error('Update repair by technician error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล: ' + error.toString() 
    };
  }
}

// ============================================
// Delete Completed Repair (Admin Only) - ลบสถานะ "เสร็จสิ้น"
// ============================================

function deleteCompletedRepair(sessionId, deleteData) {
  try {
    // ตรวจสอบ session
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ✅ ตรวจสอบสิทธิ์ - เฉพาะ admin เท่านั้น
    if (sessionCheck.session.role !== 'admin' && !sessionCheck.session.permissions.includes('all')) {
      return { 
        status: 'error', 
        message: 'เฉพาะ Admin เท่านั้นที่สามารถลบสถานะได้' 
      };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    let repairIndex = -1;
    let repair = null;
    
    // ค้นหารายการซ่อม
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const existingRepair = JSON.parse(data[i][0]);
        if (existingRepair.id === deleteData.repairId) {
          repair = existingRepair;
          repairIndex = i + 1;
          break;
        }
      }
    }
    
    if (!repair) {
      return { status: 'error', message: 'ไม่พบรายการซ่อม' };
    }

    // ✅ ตรวจสอบว่าสถานะเป็น completed
    if (repair.status !== 'completed') {
      return { 
        status: 'error', 
        message: 'สามารถลบได้เฉพาะสถานะ "เสร็จสิ้น" เท่านั้น' 
      };
    }

    // ✅ ลบแถวข้อมูลออกจาก sheet
    Logger.log('=== Delete Repair Record ===');
    Logger.log('Repair ID: ' + deleteData.repairId);
    Logger.log('Equipment: ' + repair.equipment_number);
    Logger.log('Row to delete: ' + repairIndex);
    Logger.log('Admin: ' + deleteData.adminName);
    
    // ลบแถวออกจาก sheet
    repairsSheet.deleteRow(repairIndex);
    Logger.log('✅ Repair record deleted from sheet');
    
    // บันทึกกิจกรรม
    addActivity(
      'repair_deleted',
      `ลบการแจ้งซ่อม: ${repair.equipment_number} (โดย Admin)`,
      deleteData.adminName || sessionCheck.session.username
    );
    
    // ส่งการแจ้งเตือน Telegram
    try {
      sendTelegramNotification(
        `🗑️ ลบการแจ้งซ่อม\n` +
        `รหัสพัสดุ: ${repair.equipment_number}\n` +
        `ชื่อพัสดุ: ${repair.equipment_name}\n` +
        `ลบโดย: ${deleteData.adminName}`
      );
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
    }
    
    Logger.log('=== Delete Complete ===');
    
    return { 
      status: 'success', 
      message: 'ลบข้อมูลการแจ้งซ่อมเรียบร้อยแล้ว',
      repair: repair 
    };
    
  } catch (error) {
    Logger.log('❌ Delete completed repair error: ' + error.toString());
    console.error('Delete completed repair error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการลบสถานะ: ' + error.toString() 
    };
  }
}

// ============================================
// Delete Repair
// ============================================

function deleteRepair(sessionId, repairId) {
  try {
    // ตรวจสอบ session
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('repair');
    
    if (!hasPermission) {
      return { status: 'error', message: 'คุณไม่มีสิทธิ์ในการลบรายการซ่อม' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    let repairIndex = -1;
    let repair = null;
    
    // ค้นหารายการซ่อม
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const existingRepair = JSON.parse(data[i][0]);
        if (existingRepair.id === repairId) {
          repair = existingRepair;
          repairIndex = i + 1;
          break;
        }
      }
    }
    
    if (!repair) {
      return { status: 'error', message: 'ไม่พบรายการซ่อม' };
    }

    // ลบแถว
    repairsSheet.deleteRow(repairIndex);
    
    // อัพเดทสถานะพัสดุกลับเป็นใช้งานปกติ
    updateEquipmentStatus(repair.equipment_number, 'ใช้งานปกติ');
    
    // บันทึกกิจกรรม
    addActivity(
      'repair_delete',
      `ลบรายการซ่อม: ${repair.equipment_number}`,
      sessionCheck.session.username
    );
    
    return { 
      status: 'success', 
      message: 'ลบรายการซ่อมเรียบร้อย' 
    };
    
  } catch (error) {
    console.error('Delete repair error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการลบรายการ: ' + error.toString() 
    };
  }
}



// ============================================
// Get Repair Statistics (สำหรับช่าง)
// ============================================

function getTechnicianRepairStats(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    const stats = {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      myRepairs: 0,
      totalCost: 0
    };
    
    const currentUser = sessionCheck.session.username;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        stats.total++;
        
        if (repair.status === 'pending') stats.pending++;
        if (repair.status === 'in_progress') stats.in_progress++;
        if (repair.status === 'completed') stats.completed++;
        
        // นับงานที่เป็นของช่างคนนี้
        if (repair.technician_name && repair.technician_name.includes(currentUser)) {
          stats.myRepairs++;
        }
        
        // รวมค่าใช้จ่าย
        if (repair.repair_cost) {
          stats.totalCost += parseFloat(repair.repair_cost);
        }
      }
    }
    
    return {
      status: 'success',
      stats: stats
    };
    
  } catch (error) {
    console.error('Get technician stats error:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    };
  }
}

// ============================================
// Assign Repair to Technician (สำหรับ Admin)
// ============================================

function assignRepairToTechnician(sessionId, repairId, technicianName) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('repair');
    
    if (!hasPermission) {
      return { status: 'error', message: 'คุณไม่มีสิทธิ์ในการมอบหมายงาน' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        if (repair.id === repairId) {
          repair.technician_name = technicianName;
          repair.status = 'in_progress';
          repair.updated_at = new Date().toISOString();
          repair.updated_by = sessionCheck.session.username;
          
          repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));
          
          // บันทึกกิจกรรม
          addActivity(
            'repair_assign',
            `มอบหมายงานซ่อม: ${repair.equipment_number} ให้กับ ${technicianName}`,
            sessionCheck.session.username
          );
          
          // ส่งการแจ้งเตือน
          try {
            sendTelegramNotification(
              `📋 มอบหมายงานซ่อม\n` +
              `รหัสพัสดุ: ${repair.equipment_number}\n` +
              `ชื่อพัสดุ: ${repair.equipment_name}\n` +
              `ช่างที่รับผิดชอบ: ${technicianName}\n` +
              `ปัญหา: ${repair.problem_description}`
            );
          } catch (telegramError) {
            console.error('Telegram notification error:', telegramError);
          }
          
          return {
            status: 'success',
            message: 'มอบหมายงานเรียบร้อย',
            repair: repair
          };
        }
      }
    }
    
    return { status: 'error', message: 'ไม่พบรายการซ่อม' };
    
  } catch (error) {
    console.error('Assign repair error:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการมอบหมายงาน: ' + error.toString()
    };
  }
}

// ============================================
// Get Repairs by Technician
// ============================================

function getRepairsByTechnician(sessionId, technicianName) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    const repairs = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        
        // กรองเฉพาะงานของช่างคนนี้
        if (repair.technician_name === technicianName) {
          repairs.push(repair);
        }
      }
    }
    
    return {
      status: 'success',
      repairs: repairs
    };
    
  } catch (error) {
    console.error('Get repairs by technician error:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      repairs: []
    };
  }
}

// ============================================
// Export Repair Report (สำหรับรายงาน)
// ============================================

function exportRepairReport(sessionId, filterOptions) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('reports');
    
    if (!hasPermission) {
      return { status: 'error', message: 'คุณไม่มีสิทธิ์ในการดูรายงาน' };
    }

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const data = repairsSheet.getDataRange().getValues();
    
    const repairs = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const repair = JSON.parse(data[i][0]);
        
        // Filter by status if provided
        if (filterOptions && filterOptions.status && repair.status !== filterOptions.status) {
          continue;
        }
        
        // Filter by date range if provided
        if (filterOptions && filterOptions.startDate) {
          const repairDate = new Date(repair.created_at);
          const startDate = new Date(filterOptions.startDate);
          if (repairDate < startDate) continue;
        }
        
        if (filterOptions && filterOptions.endDate) {
          const repairDate = new Date(repair.created_at);
          const endDate = new Date(filterOptions.endDate);
          if (repairDate > endDate) continue;
        }
        
        repairs.push(repair);
      }
    }
    
    return {
      status: 'success',
      repairs: repairs,
      count: repairs.length
    };
    
  } catch (error) {
    console.error('Export repair report error:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการส่งออกรายงาน'
    };
  }
}

// ============================================
// Export Equipment to Excel
// เพิ่มฟังก์ชันนี้ใน code.gs
// ============================================

function exportEquipmentToExcel(sessionId) {
  try {
    // ตรวจสอบ session
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    // ตรวจสอบสิทธิ์
    const hasPermission = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('inventory');
    
    if (!hasPermission) {
      return { status: 'error', message: 'คุณไม่มีสิทธิ์ในการส่งออกข้อมูล' };
    }

    // ดึงข้อมูลพัสดุทั้งหมด
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    const data = equipmentSheet.getDataRange().getValues();
    
    const equipmentList = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const equipment = JSON.parse(data[i][0]);
        equipmentList.push(equipment);
      }
    }

    if (equipmentList.length === 0) {
      return { status: 'error', message: 'ไม่มีข้อมูลพัสดุให้ส่งออก' };
    }

    // สร้าง Spreadsheet ใหม่
    const ss = SpreadsheetApp.create('รายงานพัสดุครุภัณฑ์ - ' + new Date().toLocaleDateString('th-TH'));
    const sheet = ss.getActiveSheet();
    sheet.setName('พัสดุครุภัณฑ์');

    // สร้าง Header
    const headers = [
      'รหัสพัสดุ',
      'ชื่อพัสดุ',
      'ประเภท',
      'ยี่ห้อ',
      'รุ่น',
      'ปีที่จัดซื้อ',
      'ราคา',
      'วันที่จัดซื้อ',
      'วันหมดประกัน',
      'สถานที่',
      'สถานะ',
      'วันที่สร้าง',
      'วันที่แก้ไข'
    ];

    // ตั้งค่า Header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    // เตรียมข้อมูล
    const rows = equipmentList.map(eq => {
      // แปลง status เป็นภาษาไทย
      let statusText = 'ใช้งานปกติ';
      if (eq.status === 'maintenance') statusText = 'ซ่อมบำรุง';
      else if (eq.status === 'retired') statusText = 'จำหน่าย';

      return [
        eq.equipment_number || '',
        eq.name || '',
        eq.type || '',
        eq.brand || '',
        eq.model || '',
        eq.purchase_year || '',
        eq.purchase_price || 0,
        eq.purchase_date ? new Date(eq.purchase_date).toLocaleDateString('th-TH') : '',
        eq.warranty_end_date ? new Date(eq.warranty_end_date).toLocaleDateString('th-TH') : '',
        eq.location || '',
        statusText,
        eq.created_at ? new Date(eq.created_at).toLocaleDateString('th-TH') : '',
        eq.updated_at ? new Date(eq.updated_at).toLocaleDateString('th-TH') : ''
      ];
    });

    // เขียนข้อมูล
    if (rows.length > 0) {
      const dataRange = sheet.getRange(2, 1, rows.length, headers.length);
      dataRange.setValues(rows);
      
      // จัดรูปแบบข้อมูล
      dataRange.setVerticalAlignment('middle');
      
      // จัดรูปแบบตัวเลข (ราคา)
      const priceColumn = sheet.getRange(2, 7, rows.length, 1);
      priceColumn.setNumberFormat('#,##0.00');
    }

    // ปรับความกว้างคอลัมน์อัตโนมัติ
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    // เพิ่มเส้นขอบ
    const allRange = sheet.getRange(1, 1, rows.length + 1, headers.length);
    allRange.setBorder(true, true, true, true, true, true);

    // เพิ่ม Freeze Row แรก
    sheet.setFrozenRows(1);

    // บันทึกกิจกรรม
    addActivity('equipment_export', `ส่งออกข้อมูลพัสดุ ${equipmentList.length} รายการ`, sessionCheck.session.username);

    // ส่งการแจ้งเตือน
    sendTelegramNotification(`📊 ส่งออกรายงานพัสดุ\nจำนวน: ${equipmentList.length} รายการ\nโดย: ${sessionCheck.session.username}`);

    return {
      status: 'success',
      message: 'สร้างไฟล์ Excel เรียบร้อยแล้ว',
      url: ss.getUrl(),
      fileId: ss.getId(),
      count: equipmentList.length
    };

  } catch (error) {
    console.error('Export equipment error:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล: ' + error.toString()
    };
  }
}

// ============================================
// Profile Management Backend Functions
// เพิ่มฟังก์ชันเหล่านี้ใน code.gs
// ============================================

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้
 * @param {Object} updateData - ข้อมูลที่ต้องการอัปเดต {id, name}
 * @returns {Object} ผลลัพธ์การอัปเดต
 */
function updateUserProfile(updateData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'ไม่พบข้อมูลผู้ใช้ในระบบ'
      };
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!updateData.id || !updateData.name) {
      return {
        status: 'error',
        message: 'ข้อมูลไม่ครบถ้วน กรุณากรอกชื่อ-นามสกุล'
      };
    }
    
    // หาผู้ใช้ที่ต้องการแก้ไข
    const data = usersSheet.getDataRange().getValues();
    let userFound = false;
    let updatedUser = null;
    
    for (let i = 1; i < data.length; i++) {
      const userJson = data[i][0];
      if (!userJson) continue;
      
      const user = JSON.parse(userJson);
      
      if (user.id === updateData.id) {
        // อัปเดตข้อมูล
        user.name = updateData.name.trim();
        user.updated_at = new Date().toISOString();
        
        // บันทึกกลับ
        usersSheet.getRange(i + 1, 1).setValue(JSON.stringify(user));
        
        updatedUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          updated_at: user.updated_at
        };
        
        userFound = true;
        
        // บันทึกกิจกรรม
        logActivity({
          type: 'profile_update',
          description: `อัปเดตโปรไฟล์: ${user.name}`,
          userId: user.id,
          username: user.username
        });
        
        break;
      }
    }
    
    if (!userFound) {
      return {
        status: 'error',
        message: 'ไม่พบผู้ใช้ในระบบ'
      };
    }
    
    return {
      status: 'success',
      message: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ',
      data: updatedUser
    };
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message
    };
  }
}

/**
 * เปลี่ยนรหัสผ่านผู้ใช้
 * @param {Object} passwordData - ข้อมูลรหัสผ่าน {userId, currentPassword, newPassword}
 * @returns {Object} ผลลัพธ์การเปลี่ยนรหัสผ่าน
 */
function changeUserPassword(passwordData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'ไม่พบข้อมูลผู้ใช้ในระบบ'
      };
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!passwordData.userId || !passwordData.currentPassword || !passwordData.newPassword) {
      return {
        status: 'error',
        message: 'ข้อมูลไม่ครบถ้วน'
      };
    }
    
    // ตรวจสอบความยาวรหัสผ่านใหม่
    if (passwordData.newPassword.length < 6) {
      return {
        status: 'error',
        message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
      };
    }
    
    // หาผู้ใช้และตรวจสอบรหัสผ่านปัจจุบัน
    const data = usersSheet.getDataRange().getValues();
    let userFound = false;
    let passwordCorrect = false;
    
    for (let i = 1; i < data.length; i++) {
      const userJson = data[i][0];
      if (!userJson) continue;
      
      const user = JSON.parse(userJson);
      
      if (user.id === passwordData.userId) {
        userFound = true;
        
        // ตรวจสอบรหัสผ่านปัจจุบัน
        if (user.password === passwordData.currentPassword) {
          passwordCorrect = true;
          
          // อัปเดตรหัสผ่านใหม่
          user.password = passwordData.newPassword;
          user.updated_at = new Date().toISOString();
          
          // บันทึกกลับ
          usersSheet.getRange(i + 1, 1).setValue(JSON.stringify(user));
          
          // บันทึกกิจกรรม
          logActivity({
            type: 'password_change',
            description: `เปลี่ยนรหัสผ่าน: ${user.name}`,
            userId: user.id,
            username: user.username
          });
          
          break;
        } else {
          return {
            status: 'error',
            message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
          };
        }
      }
    }
    
    if (!userFound) {
      return {
        status: 'error',
        message: 'ไม่พบผู้ใช้ในระบบ'
      };
    }
    
    if (!passwordCorrect) {
      return {
        status: 'error',
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      };
    }
    
    return {
      status: 'success',
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    };
    
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + error.message
    };
  }
}

/**
 * บันทึกกิจกรรมของระบบ
 * @param {Object} activityData - ข้อมูลกิจกรรม
 */
function logActivity(activityData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let activitiesSheet = ss.getSheetByName('Activities');
    
    // สร้าง sheet ถ้ายังไม่มี
    if (!activitiesSheet) {
      activitiesSheet = ss.insertSheet('Activities');
      activitiesSheet.appendRow(['activity_json']);
    }
    
    const activity = {
      id: Utilities.getUuid(),
      type: activityData.type || 'general',
      description: activityData.description || '',
      userId: activityData.userId || '',
      username: activityData.username || '',
      timestamp: new Date().toISOString(),
      metadata: activityData.metadata || {}
    };
    
    activitiesSheet.appendRow([JSON.stringify(activity)]);
    
    // เก็บกิจกรรมล่าสุดไว้ไม่เกิน 1000 รายการ
    const dataRange = activitiesSheet.getDataRange();
    const numRows = dataRange.getNumRows();
    
    if (numRows > 1001) { // 1 header + 1000 data rows
      activitiesSheet.deleteRows(2, numRows - 1001);
    }
    
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้ตาม ID
 * @param {String} userId - ID ของผู้ใช้
 * @returns {Object} ข้อมูลโปรไฟล์
 */
function getUserProfile(userId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'ไม่พบข้อมูลผู้ใช้ในระบบ'
      };
    }
    
    const data = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const userJson = data[i][0];
      if (!userJson) continue;
      
      const user = JSON.parse(userJson);
      
      if (user.id === userId) {
        // ส่งกลับข้อมูลโดยไม่รวมรหัสผ่าน
        return {
          status: 'success',
          data: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            active: user.active,
            last_login: user.last_login,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        };
      }
    }
    
    return {
      status: 'error',
      message: 'ไม่พบผู้ใช้ในระบบ'
    };
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message
    };
  }
}

/**
 * ดึงกิจกรรมล่าสุดของผู้ใช้
 * @param {String} userId - ID ของผู้ใช้
 * @param {Number} limit - จำนวนกิจกรรมที่ต้องการดึง (default: 10)
 * @returns {Object} รายการกิจกรรม
 */
function getUserActivities(userId, limit = 10) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const activitiesSheet = ss.getSheetByName('Activities');
    
    if (!activitiesSheet) {
      return {
        status: 'success',
        data: []
      };
    }
    
    const data = activitiesSheet.getDataRange().getValues();
    const activities = [];
    
    // อ่านจากล่างขึ้นบนเพื่อได้กิจกรรมล่าสุดก่อน
    for (let i = data.length - 1; i >= 1; i--) {
      const activityJson = data[i][0];
      if (!activityJson) continue;
      
      const activity = JSON.parse(activityJson);
      
      if (activity.userId === userId) {
        activities.push(activity);
        
        if (activities.length >= limit) {
          break;
        }
      }
    }
    
    return {
      status: 'success',
      data: activities
    };
    
  } catch (error) {
    console.error('Error getting user activities:', error);
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message,
      data: []
    };
  }
}

// ============================================
// 🔧 อัพเดท Backend Functions ใน code.gs
// เพิ่ม/แก้ไขฟังก์ชันเหล่านี้
// ============================================

/**
 * สร้างคำขอยืมพัสดุ (อัพเดทเพื่อรองรับลายเซ็นและรูปภาพ)
 */
function createBorrowRequest(data, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!data.equipmentNumber || !data.borrowDate || !data.returnDate || !data.contact || !data.purpose) {
      return { status: 'error', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }

    const equipmentCheck = getEquipmentByNumber(data.equipmentNumber, true);
    if (equipmentCheck.status !== 'success' || !equipmentCheck.equipment) {
      return { status: 'error', message: 'ไม่พบพัสดุหรือพัสดุไม่พร้อมให้ยืม' };
    }

    const equipment = equipmentCheck.equipment;
    
    // ⭐ เช็คสถานะพัสดุว่าเป็น "active" เท่านั้น
    if (equipment.status !== 'active') {
      return { 
        status: 'error', 
        message: 'ไม่สามารถยืมพัสดุนี้ได้ เนื่องจากพัสดุไม่ได้อยู่ในสถานะใช้งานปกติ' 
      };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const borrowData = borrowsSheet.getDataRange().getValues();
    
    for (let i = 1; i < borrowData.length; i++) {
      if (borrowData[i][0]) {
        const borrow = JSON.parse(borrowData[i][0]);
        if (borrow.equipment_number === data.equipmentNumber && 
            (borrow.status === 'borrowed' || borrow.status === 'approved' || borrow.status === 'pending')) {
          return { status: 'error', message: 'พัสดุนี้กำลังถูกยืมหรือรออนุมัติอยู่' };
        }
      }
    }

    const borrowId = Utilities.getUuid();
    
    // ⭐ ดึงชื่อผู้ยืมจาก session และ user data
    let borrowerName = sessionCheck.session.name || '';
    
    // ⭐ ถ้าไม่มีชื่อใน session ให้ดึงจาก Users sheet
    if (!borrowerName || borrowerName === '') {
      try {
        const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
        if (usersSheet) {
          const userData = usersSheet.getDataRange().getValues();
          for (let i = 1; i < userData.length; i++) {
            if (userData[i][0]) {
              const user = JSON.parse(userData[i][0]);
              if (user.id === sessionCheck.session.user_id) {
                borrowerName = user.name || user.username || 'ผู้ใช้งาน';
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Get user name error:', err);
        borrowerName = sessionCheck.session.username || 'ผู้ใช้งาน';
      }
    }
    
    // ⭐ อัพโหลดลายเซ็น (ใช้ URL แบบ Google Drive)
    let signatureUrl = '';
    if (data.signature) {
      try {
        const folder = getFolderOrCreate('Signatures');
        const base64Data = data.signature.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `signature_${borrowId}.png`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // ⭐ ใช้ URL แบบที่แสดงภาพได้โดยตรง
        const fileId = file.getId();
        signatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
        
        console.log('Signature uploaded:', signatureUrl);
      } catch (err) {
        console.error('Upload signature error:', err);
      }
    }
    
    const newBorrow = {
      id: borrowId,
      user_id: sessionCheck.session.user_id || '',
      equipment_id: equipment.id || '',
      equipment_number: data.equipmentNumber,
      equipment_name: equipment.name,
      equipment_type: equipment.type,
      equipment_brand: equipment.brand || '',
      equipment_model: equipment.model || '',
      equipment_image_url: equipment.image_url || '',
      borrower_name: borrowerName, // ⭐ ใช้ชื่อที่ดึงมาได้
      borrower_contact: data.contact,
      borrower_department: data.department || '',
      borrow_date: data.borrowDate,
      return_date: data.returnDate,
      actual_return_date: null,
      purpose: data.purpose,
      status: 'pending',
      condition_before: equipment.condition || 'good',
      condition_after: null,
      signature_url: signatureUrl,
      approved_by: null,
      approved_at: null,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    borrowsSheet.appendRow([JSON.stringify(newBorrow)]);

    addActivity('borrow_request', `ส่งคำขอยืมพัสดุ: ${equipment.name} (${data.equipmentNumber})`, sessionCheck.session.username);

    try {
      const config = getConfig();
      if (config.notification_enabled && config.telegram_bot_token && config.telegram_chat_id) {
        const message = `🔔 *คำขอยืมพัสดุใหม่*\n\n` +
                       `📦 พัสดุ: ${equipment.name}\n` +
                       `🔢 รหัส: ${data.equipmentNumber}\n` +
                       `👤 ผู้ยืม: ${borrowerName}\n` +
                       `📅 วันที่ยืม: ${data.borrowDate}\n` +
                       `📅 กำหนดคืน: ${data.returnDate}\n` +
                       `📝 วัตถุประสงค์: ${data.purpose}\n\n` +
                       `⏰ ${new Date().toLocaleString('th-TH')}`;
        
        sendTelegramNotification(message, config.telegram_bot_token, config.telegram_chat_id);
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    return { 
      status: 'success', 
      message: 'ส่งคำขอยืมพัสดุเรียบร้อย รอการอนุมัติ',
      borrow: newBorrow 
    };
  } catch (error) {
    console.error('Create borrow request error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * Helper function: สร้างหรือหาโฟลเดอร์
 */
function getFolderOrCreate(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Helper function: แปลง Google Drive URL เป็นรูปแบบที่แสดงภาพได้
 */
function convertToDirectImageUrl(driveUrl) {
  if (!driveUrl) return '';
  
  // ถ้าเป็น URL แบบ https://drive.google.com/file/d/FILE_ID/view
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh5.googleusercontent.com/d/${fileId}`;
  }
  
  // ถ้าเป็น URL แบบอื่น ให้ใช้ของเดิม
  return driveUrl;
}

/**
 * ดึงรายการยืมของ User
 */
function getUserBorrows(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    if (!borrowsSheet) {
      return { status: 'success', borrows: [] };
    }

    const data = borrowsSheet.getDataRange().getValues();
    const borrows = [];
    const userId = sessionCheck.session.user_id;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const borrow = JSON.parse(data[i][0]);
        if (borrow.user_id === userId) {
          borrows.push(borrow);
        }
      }
    }

    borrows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { status: 'success', borrows: borrows };
  } catch (error) {
    console.error('Get user borrows error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * ดึงรายการยืมทั้งหมด (Admin)
 */
function getAllBorrows(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์เข้าถึง' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    if (!borrowsSheet) {
      return { status: 'success', borrows: [] };
    }

    const data = borrowsSheet.getDataRange().getValues();
    const borrows = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const borrow = JSON.parse(data[i][0]);
        borrows.push(borrow);
      }
    }

    borrows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { status: 'success', borrows: borrows };
  } catch (error) {
    console.error('Get all borrows error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * อนุมัติการยืม (Admin) - เพิ่มลายเซ็นผู้อนุมัติ
 */
function approveBorrow(borrowId, approverSignature, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ในการอนุมัติ' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const data = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const borrow = JSON.parse(data[i][0]);
        if (borrow.id === borrowId) {
          
          // ⭐ อัพโหลดลายเซ็นผู้อนุมัติ
          let approverSignatureUrl = '';
          if (approverSignature) {
            try {
              const folder = getFolderOrCreate('Signatures');
              const base64Data = approverSignature.split(',')[1];
              const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `approver_${borrowId}_${Date.now()}.png`);
              const file = folder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              
              const fileId = file.getId();
              approverSignatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
              
              console.log('Approver signature uploaded:', approverSignatureUrl);
            } catch (err) {
              console.error('Upload approver signature error:', err);
            }
          }
          
          borrow.status = 'borrowed';
          borrow.approved_by = sessionCheck.session.name;
          borrow.approved_at = new Date().toISOString();
          borrow.approver_signature_url = approverSignatureUrl; // ⭐ ลายเซ็นผู้อนุมัติ
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_approved', `อนุมัติการยืมพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number})`, sessionCheck.session.username);

          try {
            const config = getConfig();
            if (config.notification_enabled && config.telegram_bot_token && config.telegram_chat_id) {
              const message = `✅ *การยืมได้รับการอนุมัติ*\n\n` +
                             `📦 พัสดุ: ${borrow.equipment_name}\n` +
                             `🔢 รหัส: ${borrow.equipment_number}\n` +
                             `👤 ผู้ยืม: ${borrow.borrower_name}\n` +
                             `👮 อนุมัติโดย: ${sessionCheck.session.name}\n` +
                             `📅 กำหนดคืน: ${borrow.return_date}\n\n` +
                             `⏰ ${new Date().toLocaleString('th-TH')}`;
              
              sendTelegramNotification(message, config.telegram_bot_token, config.telegram_chat_id);
            }
          } catch (notifyError) {
            console.error('Notification error:', notifyError);
          }

          return { status: 'success', message: 'อนุมัติการยืมพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Approve borrow error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}


/**
 * ไม่อนุมัติการยืม (Admin)
 */
function rejectBorrow(borrowId, reason, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ในการปฏิเสธ' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const data = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const borrow = JSON.parse(data[i][0]);
        if (borrow.id === borrowId) {
          borrow.status = 'rejected';
          borrow.notes = `ไม่อนุมัติโดย ${sessionCheck.session.name}: ${reason}`;
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_rejected', `ไม่อนุมัติการยืมพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number})`, sessionCheck.session.username);

          return { status: 'success', message: 'ไม่อนุมัติการยืมพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Reject borrow error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * คืนพัสดุ (User)
 */
function returnBorrow(data, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const borrowData = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < borrowData.length; i++) {
      if (borrowData[i][0]) {
        const borrow = JSON.parse(borrowData[i][0]);
        if (borrow.id === data.borrowId) {
          if (borrow.user_id !== sessionCheck.session.user_id) {
            return { status: 'error', message: 'ไม่มีสิทธิ์คืนพัสดุรายการนี้' };
          }

          // ⭐ อัพโหลดลายเซ็นผู้คืน
          let returnerSignatureUrl = '';
          if (data.signature) {
            try {
              const folder = getFolderOrCreate('Signatures');
              const base64Data = data.signature.split(',')[1];
              const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `returner_${borrow.id}_${Date.now()}.png`);
              const file = folder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              
              const fileId = file.getId();
              returnerSignatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
              
              console.log('Returner signature uploaded:', returnerSignatureUrl);
            } catch (err) {
              console.error('Upload returner signature error:', err);
            }
          }

          borrow.status = 'pending_return'; // ⭐ รอการอนุมัติการคืน
          borrow.pending_return_date = new Date().toISOString().split('T')[0];
          borrow.condition_after = data.conditionAfter || 'good';
          borrow.returner_signature_url = returnerSignatureUrl; // ⭐ ลายเซ็นผู้คืน
          if (data.notes) {
            borrow.return_notes = data.notes;
          }
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_pending_return', `ส่งคำขอคืนพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number})`, sessionCheck.session.username);

          try {
            const config = getConfig();
            if (config.notification_enabled && config.telegram_bot_token && config.telegram_chat_id) {
              const message = `🔄 *คำขอคืนพัสดุ (รอการอนุมัติ)*\n\n` +
                             `📦 พัสดุ: ${borrow.equipment_name}\n` +
                             `🔢 รหัส: ${borrow.equipment_number}\n` +
                             `👤 ผู้คืน: ${borrow.borrower_name}\n` +
                             `📅 วันที่ส่งคำขอ: ${borrow.pending_return_date}\n` +
                             `✨ สภาพ: ${data.conditionAfter}\n\n` +
                             `⏰ ${new Date().toLocaleString('th-TH')}`;
              
              sendTelegramNotification(message, config.telegram_bot_token, config.telegram_chat_id);
            }
          } catch (notifyError) {
            console.error('Notification error:', notifyError);
          }

          return { status: 'success', message: 'ส่งคำขอคืนพัสดุเรียบร้อย รอการอนุมัติ' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Return borrow error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * อนุมัติการคืนพัสดุ (Admin) - เพิ่มลายเซ็นผู้อนุมัติการคืน
 */
function approveReturn(data, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ในการอนุมัติ' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const borrowData = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < borrowData.length; i++) {
      if (borrowData[i][0]) {
        const borrow = JSON.parse(borrowData[i][0]);
        if (borrow.id === data.borrowId) {
          
          // ⭐ อัพโหลดลายเซ็นผู้อนุมัติการคืน
          let returnApproverSignatureUrl = '';
          if (data.signature) {
            try {
              const folder = getFolderOrCreate('Signatures');
              const base64Data = data.signature.split(',')[1];
              const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `return_approver_${borrow.id}_${Date.now()}.png`);
              const file = folder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              
              const fileId = file.getId();
              returnApproverSignatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
              
              console.log('Return approver signature uploaded:', returnApproverSignatureUrl);
            } catch (err) {
              console.error('Upload return approver signature error:', err);
            }
          }
          
          borrow.status = 'returned';
          borrow.actual_return_date = data.actualReturnDate || new Date().toISOString().split('T')[0];
          borrow.return_approved_by = sessionCheck.session.name; // ⭐ ผู้อนุมัติการคืน
          borrow.return_approved_at = new Date().toISOString();
          borrow.return_approver_signature_url = returnApproverSignatureUrl; // ⭐ ลายเซ็นผู้อนุมัติการคืน
          
          if (data.conditionAfter) {
            borrow.condition_after = data.conditionAfter;
          }
          if (data.notes) {
            borrow.return_notes = (borrow.return_notes || '') + '\n' + data.notes;
          }
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_return_approved', `อนุมัติการคืนพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number})`, sessionCheck.session.username);

          try {
            const config = getConfig();
            if (config.notification_enabled && config.telegram_bot_token && config.telegram_chat_id) {
              const message = `✅ *การคืนพัสดุได้รับการอนุมัติ*\n\n` +
                             `📦 พัสดุ: ${borrow.equipment_name}\n` +
                             `🔢 รหัส: ${borrow.equipment_number}\n` +
                             `👤 ผู้คืน: ${borrow.borrower_name}\n` +
                             `👮 อนุมัติการคืนโดย: ${sessionCheck.session.name}\n` +
                             `📅 วันที่คืนจริง: ${borrow.actual_return_date}\n\n` +
                             `⏰ ${new Date().toLocaleString('th-TH')}`;
              
              sendTelegramNotification(message, config.telegram_bot_token, config.telegram_chat_id);
            }
          } catch (notifyError) {
            console.error('Notification error:', notifyError);
          }

          return { status: 'success', message: 'อนุมัติการคืนพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Approve return error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * คืนพัสดุ (User) - เพิ่มลายเซ็นผู้คืน
 */
function returnBorrow(data, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const borrowData = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < borrowData.length; i++) {
      if (borrowData[i][0]) {
        const borrow = JSON.parse(borrowData[i][0]);
        if (borrow.id === data.borrowId) {
          if (borrow.user_id !== sessionCheck.session.user_id) {
            return { status: 'error', message: 'ไม่มีสิทธิ์คืนพัสดุรายการนี้' };
          }

          // ⭐ อัพโหลดลายเซ็นผู้คืน
          let returnerSignatureUrl = '';
          if (data.signature) {
            try {
              const folder = getFolderOrCreate('Signatures');
              const base64Data = data.signature.split(',')[1];
              const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `returner_${borrow.id}_${Date.now()}.png`);
              const file = folder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              
              const fileId = file.getId();
              returnerSignatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
              
              console.log('Returner signature uploaded:', returnerSignatureUrl);
            } catch (err) {
              console.error('Upload returner signature error:', err);
            }
          }

          borrow.status = 'pending_return'; // ⭐ รอการอนุมัติการคืน
          borrow.pending_return_date = new Date().toISOString().split('T')[0];
          borrow.condition_after = data.conditionAfter || 'good';
          borrow.returner_signature_url = returnerSignatureUrl; // ⭐ ลายเซ็นผู้คืน
          if (data.notes) {
            borrow.return_notes = data.notes;
          }
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_pending_return', `ส่งคำขอคืนพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number})`, sessionCheck.session.username);

          try {
            const config = getConfig();
            if (config.notification_enabled && config.telegram_bot_token && config.telegram_chat_id) {
              const message = `🔄 *คำขอคืนพัสดุ (รอการอนุมัติ)*\n\n` +
                             `📦 พัสดุ: ${borrow.equipment_name}\n` +
                             `🔢 รหัส: ${borrow.equipment_number}\n` +
                             `👤 ผู้คืน: ${borrow.borrower_name}\n` +
                             `📅 วันที่ส่งคำขอ: ${borrow.pending_return_date}\n` +
                             `✨ สภาพ: ${data.conditionAfter}\n\n` +
                             `⏰ ${new Date().toLocaleString('th-TH')}`;
              
              sendTelegramNotification(message, config.telegram_bot_token, config.telegram_chat_id);
            }
          } catch (notifyError) {
            console.error('Notification error:', notifyError);
          }

          return { status: 'success', message: 'ส่งคำขอคืนพัสดุเรียบร้อย รอการอนุมัติ' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Return borrow error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * บันทึกการคืนพัสดุ (Admin)
 */
function adminReturnBorrow(data, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ในการบันทึก' };
    }

    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    const borrowData = borrowsSheet.getDataRange().getValues();

    for (let i = 1; i < borrowData.length; i++) {
      if (borrowData[i][0]) {
        const borrow = JSON.parse(borrowData[i][0]);
        if (borrow.id === data.borrowId) {
          
          // ⭐ อัพโหลดลายเซ็นผู้บันทึกการคืน (Admin)
          let adminSignatureUrl = '';
          if (data.signature) {
            try {
              const folder = getFolderOrCreate('Signatures');
              const base64Data = data.signature.split(',')[1];
              const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/png', `admin_return_${borrow.id}_${Date.now()}.png`);
              const file = folder.createFile(blob);
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              
              const fileId = file.getId();
              adminSignatureUrl = `https://lh5.googleusercontent.com/d/${fileId}`;
            } catch (err) {
              console.error('Upload admin signature error:', err);
            }
          }
          
          borrow.status = 'returned';
          borrow.actual_return_date = data.actualReturnDate || new Date().toISOString().split('T')[0];
          borrow.condition_after = data.conditionAfter || 'good';
          borrow.return_approved_by = sessionCheck.session.name;
          borrow.return_approved_at = new Date().toISOString();
          borrow.return_approver_signature_url = adminSignatureUrl; // ⭐ ลายเซ็น Admin
          
          if (data.notes) {
            borrow.return_notes = data.notes;
          }
          borrow.updated_at = new Date().toISOString();

          borrowsSheet.getRange(i + 1, 1).setValue(JSON.stringify(borrow));

          addActivity('borrow_returned_admin', `บันทึกการคืนพัสดุ: ${borrow.equipment_name} (${borrow.equipment_number}) โดย Admin`, sessionCheck.session.username);

          return { status: 'success', message: 'บันทึกการคืนพัสดุเรียบร้อยแล้ว' };
        }
      }
    }

    return { status: 'error', message: 'ไม่พบรายการยืมพัสดุ' };
  } catch (error) {
    console.error('Admin return borrow error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * ตรวจสอบพัสดุสำหรับการยืม (ยืมได้เฉพาะสถานะ active)
 */
function validateEquipmentForBorrow(equipmentNumber) {
  try {
    if (!equipmentNumber || equipmentNumber.trim() === '') {
      return { status: 'error', message: 'กรุณาระบุรหัสพัสดุ' };
    }
    
    const equipmentResult = getEquipmentByNumber(equipmentNumber);
    
    if (equipmentResult.status !== 'success' || !equipmentResult.equipment) {
      return { 
        status: 'error',
        error_type: 'not_found', 
        message: 'ไม่พบพัสดุในระบบ',
        equipment: null
      };
    }
    
    const equipment = equipmentResult.equipment;
    
    // ✅ ตรวจสอบสถานะพัสดุ - ยืมได้เฉพาะสถานะ active
    if (equipment.status !== 'active') {
      return {
        status: 'error',
        error_type: 'not_active',
        message: 'ไม่สามารถยืมพัสดุนี้ได้ เนื่องจากพัสดุไม่อยู่ในสถานะ "ใช้งานปกติ"',
        equipment: equipment
      };
    }
    
    // ✅ ตรวจสอบว่ามีการยืมค้างอยู่หรือไม่
    const borrowsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Borrows');
    if (borrowsSheet) {
      const borrowData = borrowsSheet.getDataRange().getValues();
      
      for (let i = 1; i < borrowData.length; i++) {
        if (borrowData[i][0]) {
          const borrow = JSON.parse(borrowData[i][0]);
          if (borrow.equipment_number === equipmentNumber && 
              (borrow.status === 'borrowed' || borrow.status === 'pending' || borrow.status === 'approved')) {
            return {
              status: 'error',
              error_type: 'already_borrowed',
              message: 'พัสดุนี้กำลังถูกยืมหรือรออนุมัติอยู่',
              equipment: equipment
            };
          }
        }
      }
    }
    
    return {
      status: 'success',
      equipment: equipment,
      message: 'พัสดุพร้อมให้ยืม'
    };
    
  } catch (error) {
    console.error('Validate equipment for borrow error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบพัสดุ',
      equipment: null
    };
  }
}

// ============================================
// Get Repairs for Technician (Spare Parts)
// ============================================
/**
 * Get repairs only for current technician
 */
function getRepairsForTechnician(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const currentRole = sessionCheck.session.role;
    const currentUsername = sessionCheck.session.username;
    const hasFullAccess = sessionCheck.session.permissions.includes('all') || 
                          sessionCheck.session.permissions.includes('repair');

    const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
    const equipmentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    
    const repairsData = repairsSheet.getDataRange().getValues();
    const equipmentData = equipmentSheet.getDataRange().getValues();
    
    const repairs = [];
    
    const equipmentMap = {};
    for (let i = 1; i < equipmentData.length; i++) {
      if (equipmentData[i][0]) {
        const equipment = JSON.parse(equipmentData[i][0]);
        equipmentMap[equipment.equipment_number] = equipment;
      }
    }
    
    for (let i = 1; i < repairsData.length; i++) {
      if (repairsData[i][0]) {
        const repair = JSON.parse(repairsData[i][0]);
        
        let includeRepair = false;
        
        if (hasFullAccess) {
          includeRepair = true;
        } else if (currentRole === 'technician') {
          includeRepair = (repair.technician_name === currentUsername || 
                          repair.assigned_to === currentUsername);
        }
        
        if (includeRepair) {
          const equipment = equipmentMap[repair.equipment_number];
          if (equipment) {
            repair.equipment_name = equipment.name;
            repair.equipment_type = equipment.type;
            repair.equipment_brand = equipment.brand;
            repair.equipment_model = equipment.model;
            repair.equipment_location = equipment.location;
          } else {
            if (!repair.equipment_name) repair.equipment_name = '-';
            if (!repair.equipment_type) repair.equipment_type = '-';
            if (!repair.equipment_brand) repair.equipment_brand = '-';
            if (!repair.equipment_model) repair.equipment_model = '-';
            if (!repair.equipment_location) repair.equipment_location = '-';
          }
          
          repairs.push(repair);
        }
      }
    }
    
    return { status: 'success', repairs: repairs };
  } catch (error) {
    console.error('Get repairs for technician error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' };
  }
}

// ============================================
// Spare Parts/Materials Tracking - Backend
// ============================================

/**
 * Initialize Spare Parts sheet
 */
function initializeSparePartsSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('SpareParts');
    
    if (!sheet) {
      sheet = ss.insertSheet('SpareParts');
      sheet.getRange(1, 1).setValue('id');
      sheet.getRange(1, 2).setValue('repair_id');
      sheet.getRange(1, 3).setValue('part_name');
      sheet.getRange(1, 4).setValue('quantity');
      sheet.getRange(1, 5).setValue('unit');
      sheet.getRange(1, 6).setValue('unit_cost');
      sheet.getRange(1, 7).setValue('total_cost');
      sheet.getRange(1, 8).setValue('supplier');
      sheet.getRange(1, 9).setValue('notes');
      sheet.getRange(1, 10).setValue('created_at');
      sheet.getRange(1, 11).setValue('created_by');
      
      console.log('✓ SpareParts sheet created');
    }
    
    return sheet;
  } catch (error) {
    console.error('Initialize SpareParts error:', error);
    return null;
  }
}

/**
 * Get spare parts for a repair
 */
function getRepairSpareParts(repairId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'success', spareParts: [] };
    }

    const data = sheet.getDataRange().getValues();
    const spareParts = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          // Parse JSON from column A
          const part = JSON.parse(data[i][0]);

          if (part.repair_id === repairId) {
            spareParts.push(part);
          }
        } catch (parseError) {
          console.error('Error parsing spare parts at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    return { status: 'success', spareParts: spareParts };
  } catch (error) {
    console.error('Get repair spare parts error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่' };
  }
}



/**
 * Update spare part
 */
function updateSparePart(partId, sparePartData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('repair') && !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์แก้ไขอะไหล่' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'error', message: 'ไม่พบ SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === partId) {
        const quantity = Number(sparePartData.quantity) || Number(data[i][3]);
        const unitCost = Number(sparePartData.unit_cost) || Number(data[i][5]);
        const totalCost = quantity * unitCost;

        sheet.getRange(i + 1, 3).setValue(sparePartData.part_name || data[i][2]);
        sheet.getRange(i + 1, 4).setValue(quantity);
        sheet.getRange(i + 1, 5).setValue(sparePartData.unit || data[i][4]);
        sheet.getRange(i + 1, 6).setValue(unitCost);
        sheet.getRange(i + 1, 7).setValue(totalCost);
        sheet.getRange(i + 1, 8).setValue(sparePartData.supplier || data[i][7]);
        sheet.getRange(i + 1, 9).setValue(sparePartData.notes || data[i][8]);

        addActivity('spare_part_update', `แก้ไขอะไหล่: ${sparePartData.part_name}`, sessionCheck.session.username);

        return { status: 'success', message: 'อัพเดตอะไหล่เรียบร้อยแล้ว' };
      }
    }

    return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update spare part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่' };
  }
}

/**
 * Delete spare part
 */
function deleteSparePart(partId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('repair') && !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ลบอะไหล่' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'error', message: 'ไม่พบ SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === partId) {
        sheet.deleteRow(i + 1);
        addActivity('spare_part_delete', `ลบอะไหล่: ${data[i][2]}`, sessionCheck.session.username);
        return { status: 'success', message: 'ลบอะไหล่เรียบร้อยแล้ว' };
      }
    }

    return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการลบ' };
  } catch (error) {
    console.error('Delete spare part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบอะไหล่' };
  }
}

/**
 * Get spare parts analytics
 */
function getSparePartsAnalytics(dateFrom, dateTo, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'success', analytics: { totalCost: 0, totalParts: 0, partCount: 0, suppliers: {}, topParts: [] } };
    }

    const data = sheet.getDataRange().getValues();
    let totalCost = 0;
    let totalQuantity = 0;
    let partCount = 0;
    const suppliers = {};
    const partFrequency = {};

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const createdAt = new Date(data[i][9]);
          
          if (createdAt >= startDate && createdAt <= endDate) {
            const quantity = Number(data[i][3]) || 0;
            const totalPartCost = Number(data[i][6]) || 0;
            const supplier = data[i][7] || 'ไม่ระบุ';
            const partName = data[i][2] || 'ไม่ระบุ';

            totalCost += totalPartCost;
            totalQuantity += quantity;
            partCount++;

            // Count by supplier
            suppliers[supplier] = (suppliers[supplier] || 0) + totalPartCost;

            // Track part frequency
            partFrequency[partName] = (partFrequency[partName] || 0) + 1;
          }
        } catch (parseError) {
          console.error('Error parsing analytics at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    // Top parts
    const topParts = Object.entries(partFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      status: 'success',
      analytics: {
        totalCost: totalCost,
        totalQuantity: totalQuantity,
        partCount: partCount,
        avgCostPerPart: partCount > 0 ? (totalCost / partCount).toFixed(2) : 0,
        suppliers: suppliers,
        topParts: topParts
      }
    };
  } catch (error) {
    console.error('Get spare parts analytics error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูลอะไหล่' };
  }
}

/**
 * ดึงข้อมูลอะไหล่ที่มีคงเหลือในคลัง (แก้ไข: ดึง Location)
 */
function getAvailableSpareParts(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'success', parts: [] };
    }

    const data = sheet.getDataRange().getValues();
    const inventory = {};

    // สร้าง inventory เหมือนใน getSparePartsInventory
    for (let i = 1; i < data.length; i++) {
      try {
        const part = JSON.parse(data[i][0]);
        const partName = part.part_name;
        const repairId = part.repair_id || '';
        const isStockAdd = part.is_stock_add || false;
        const quantity = Number(part.quantity) || 0;

        if (!inventory[partName]) {
          inventory[partName] = {
            name: partName, // ใช้ key 'name' เพื่อความเข้ากันได้กับ frontend บางส่วน
            part_name: partName,
            // ✅ เพิ่ม Location
            location: part.location || '',
            stock_quantity: 0,
            used_quantity: 0,
            unit: part.unit || 'pcs',
            unit_cost: Number(part.unit_cost) || 0,
            supplier: part.supplier || '',
            image_url: part.image_url || ''
          };
        }

        if (isStockAdd || (repairId === '' || repairId === null || repairId === undefined)) {
          inventory[partName].stock_quantity += quantity;
          // ✅ อัปเดต Location จากรายการล่าสุดที่มีข้อมูล
          if (part.location) inventory[partName].location = part.location;
        } else if (repairId !== '') {
          inventory[partName].used_quantity += quantity;
        }

        // อัพเดตข้อมูล
        if (part.unit_cost) inventory[partName].unit_cost = Number(part.unit_cost);
        if (part.supplier) inventory[partName].supplier = part.supplier;
        if (part.image_url) inventory[partName].image_url = part.image_url;

      } catch (e) {
        continue;
      }
    }

    // กรองเฉพาะอะไหล่ที่มีคงเหลือ และเรียงตามชื่อ
    const availableParts = Object.values(inventory)
      .filter(part => (part.stock_quantity - part.used_quantity) > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'th'));

    return { status: 'success', parts: availableParts };
  } catch (error) {
    Logger.log('Error in getAvailableSpareParts: ' + error.toString());
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * ดึงข้อมูลคลังอะไหล่ (แก้ไข: ดึง Location)
 */
function getSparePartsInventory(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'success', inventory: [] };
    }

    const data = sheet.getDataRange().getValues();
    const inventory = {};

    for (let i = 1; i < data.length; i++) {
      try {
        const part = JSON.parse(data[i][0]);
        const partName = part.part_name;
        const repairId = part.repair_id || '';
        const isStockAdd = part.is_stock_add || false;
        const quantity = Number(part.quantity) || 0;

        if (!inventory[partName]) {
          inventory[partName] = {
            part_name: partName,
            // ✅ เพิ่ม: ค่าเริ่มต้น location
            location: part.location || '',
            stock_quantity: 0,
            used_quantity: 0,
            unit: part.unit || 'pcs',
            unit_cost: Number(part.unit_cost) || 0,
            supplier: part.supplier || '',
            image_url: part.image_url || '',
            last_updated: part.created_at || ''
          };
        }

        // แยกนับ stock_quantity และ used_quantity
        if (!repairId || repairId === '' || isStockAdd) {
          // เพิ่มเข้าคลังโดยตรง หรือ เพิ่มสต็อก
          inventory[partName].stock_quantity += quantity;
          
          // ✅ อัปเดต Location หากเจอรายการที่มีข้อมูล (ให้ความสำคัญกับรายการที่มีข้อมูล)
          if (part.location) {
             inventory[partName].location = part.location;
          }
        } else {
          // ใช้ในงานซ่อม
          inventory[partName].used_quantity += quantity;
        }

        // อัพเดตข้อมูลล่าสุด
        if (part.unit_cost) inventory[partName].unit_cost = Number(part.unit_cost);
        if (part.supplier) inventory[partName].supplier = part.supplier;
        if (part.image_url) inventory[partName].image_url = part.image_url;
        if (part.created_at > inventory[partName].last_updated) {
          inventory[partName].last_updated = part.created_at;
        }

      } catch (e) {
        continue;
      }
    }

    // แปลงเป็น array และเรียงลำดับตามคงเหลือ (น้อย -> มาก)
    const inventoryList = Object.values(inventory).sort((a, b) => {
      const remainA = a.stock_quantity - a.used_quantity;
      const remainB = b.stock_quantity - b.used_quantity;
      return remainA - remainB;
    });

    return { status: 'success', inventory: inventoryList };
  } catch (error) {
    console.error('Get spare parts inventory error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// ============================================
// Spare Parts/Materials Tracking - Backend
// ============================================

/**
 * Initialize Spare Parts sheet (JSON format like other sheets)
 */
function initializeSparePartsSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('SpareParts');
    
    if (!sheet) {
      sheet = ss.insertSheet('SpareParts');
      sheet.getRange(1, 1).setValue('data');
      console.log('✓ SpareParts sheet created');
    }
    
    return sheet;
  } catch (error) {
    console.error('Initialize SpareParts error:', error);
    return null;
  }
}

/**
 * Get spare parts for a repair
 */
function getRepairSpareParts(repairId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'success', spareParts: [] };
    }

    const data = sheet.getDataRange().getValues();
    const spareParts = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const part = JSON.parse(data[i][0]);
          if (part.repair_id === repairId) {
            spareParts.push(part);
          }
        } catch (parseError) {
          console.error('Error parsing spare parts at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    return { status: 'success', spareParts: spareParts };
  } catch (error) {
    console.error('Get repair spare parts error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่' };
  }
}

/**
 * Add spare part to repair (JSON format)
 */
function addSparePart(repairId, sparePartData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('repair') && !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์บันทึกอะไหล่' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'error', message: 'ไม่สามารถเข้าถึง SpareParts sheet' };
    }

    const partId = 'SP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const quantity = Number(sparePartData.quantity) || 0;
    const unitCost = Number(sparePartData.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    const part = {
      id: partId,
      repair_id: repairId,
      part_name: sparePartData.part_name || '',
      quantity: quantity,
      unit: sparePartData.unit || 'pcs',
      unit_cost: unitCost,
      total_cost: totalCost,
      supplier: sparePartData.supplier || '',
      notes: sparePartData.notes || '',
      image_url: sparePartData.image_url || '',  // ✅ เพิ่มบรรทัดนี้
      created_at: new Date().toISOString(),
      created_by: sessionCheck.session.username || ''
    };

    // Add to sheet as JSON (single column)
    sheet.appendRow([JSON.stringify(part)]);

    addActivity('spare_part_add', `เพิ่มอะไหล่: ${part.part_name} (งานซ่อม: ${repairId})`, sessionCheck.session.username);

    return { status: 'success', message: 'บันทึกอะไหล่เรียบร้อยแล้ว', sparePart: part };
  } catch (error) {
    console.error('Add spare part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกอะไหล่: ' + error.toString() };
  }
}

/**
 * Update spare part (JSON format)
 */
function updateSparePart(partId, sparePartData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('repair') && !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์แก้ไขอะไหล่' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'error', message: 'ไม่พบ SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const part = JSON.parse(data[i][0]);
          
          if (part.id === partId) {
            const quantity = Number(sparePartData.quantity) || Number(part.quantity);
            const unitCost = Number(sparePartData.unit_cost) || Number(part.unit_cost);
            const totalCost = quantity * unitCost;

            part.part_name = sparePartData.part_name || part.part_name;
            part.quantity = quantity;
            part.unit = sparePartData.unit || part.unit;
            part.unit_cost = unitCost;
            part.total_cost = totalCost;
            part.supplier = sparePartData.supplier || part.supplier;
            part.notes = sparePartData.notes || part.notes;
            part.updated_at = new Date().toISOString();

            sheet.getRange(i + 1, 1).setValue(JSON.stringify(part));

            addActivity('spare_part_update', `แก้ไขอะไหล่: ${part.part_name}`, sessionCheck.session.username);

            return { status: 'success', message: 'อัพเดตอะไหล่เรียบร้อยแล้ว' };
          }
        } catch (parseError) {
          console.error('Error parsing spare part at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการแก้ไข' };
  } catch (error) {
    console.error('Update spare part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่: ' + error.toString() };
  }
}

/**
 * Delete spare part (JSON format)
 */
function deleteSparePart(partId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    if (!sessionCheck.session.permissions.includes('repair') && !sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'ไม่มีสิทธิ์ลบอะไหล่' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'error', message: 'ไม่พบ SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const part = JSON.parse(data[i][0]);
          
          if (part.id === partId) {
            sheet.deleteRow(i + 1);
            addActivity('spare_part_delete', `ลบอะไหล่: ${part.part_name}`, sessionCheck.session.username);
            return { status: 'success', message: 'ลบอะไหล่เรียบร้อยแล้ว' };
          }
        } catch (parseError) {
          console.error('Error parsing spare part at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการลบ' };
  } catch (error) {
    console.error('Delete spare part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบอะไหล่: ' + error.toString() };
  }
}

/**
 * Get spare parts analytics
 */
function getSparePartsAnalytics(dateFrom, dateTo, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) {
      return { status: 'success', analytics: { totalCost: 0, totalQuantity: 0, partCount: 0, avgCostPerPart: 0, suppliers: {}, topParts: [] } };
    }

    const data = sheet.getDataRange().getValues();
    let totalCost = 0;
    let totalQuantity = 0;
    let partCount = 0;
    const suppliers = {};
    const partFrequency = {};
    const inventory = {}; // ✅ ติดตาม current stock แยกจาก used

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const part = JSON.parse(data[i][0]);
          const createdAt = new Date(part.created_at);
          const quantity = Number(part.quantity) || 0;
          const supplier = part.supplier || 'ไม่ระบุ';
          const partName = part.part_name || 'ไม่ระบุ';
          const totalPartCost = Number(part.total_cost) || 0;
          const repairId = part.repair_id || '';
          const isStockAdd = part.is_stock_add || false;
          const unitCost = Number(part.unit_cost) || 0;
          
          // ✅ สร้าง inventory tracking (เหมือนใน getSparePartsInventory)
          if (!inventory[partName]) {
            inventory[partName] = {
              stock_quantity: 0,
              used_quantity: 0,
              unit_cost: unitCost,
              supplier: supplier
            };
          }
          
          // แยกนับ stock vs used
          if (!repairId || repairId === '' || isStockAdd) {
            inventory[partName].stock_quantity += quantity;
          } else {
            inventory[partName].used_quantity += quantity;
          }
          
          // อัพเดตข้อมูล
          if (unitCost) inventory[partName].unit_cost = unitCost;
          if (supplier) inventory[partName].supplier = supplier;
          
          // ✅ นับเฉพาะอะไหล่ที่อยู่ระหว่างช่วงเวลา
          if (createdAt >= startDate && createdAt <= endDate) {
            partFrequency[partName] = (partFrequency[partName] || 0) + 1;
          }
        } catch (parseError) {
          console.error('Error parsing analytics at row ' + (i + 1), parseError);
          continue;
        }
      }
    }

    // ✅ คำนวณจาก current stock (stock_quantity - used_quantity)
    Object.entries(inventory).forEach(([partName, data]) => {
      const currentStock = data.stock_quantity - data.used_quantity;
      if (currentStock > 0) {
        const costPerUnit = data.unit_cost || 0;
        const partTotalCost = currentStock * costPerUnit;
        totalCost += partTotalCost;
        totalQuantity += currentStock;
        partCount++;
        
        const supplier = data.supplier || 'ไม่ระบุ';
        suppliers[supplier] = (suppliers[supplier] || 0) + partTotalCost;
      }
    });

    const topParts = Object.entries(partFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      status: 'success',
      analytics: {
        totalCost: totalCost,
        totalQuantity: totalQuantity,
        partCount: partCount,
        avgCostPerPart: totalQuantity > 0 ? (totalCost / totalQuantity).toFixed(2) : 0,
        suppliers: suppliers,
        topParts: topParts
      }
    };
  } catch (error) {
    console.error('Get spare parts analytics error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูลอะไหล่: ' + error.toString() };
  }
}



/**
 * Upload spare part image to Google Drive
 */
function uploadSparePartImage(base64ImageData, repairId) {
  try {
    if (!base64ImageData) {
      console.error("❌ No image data provided");
      return null;
    }

    console.log("📸 Starting image upload...");
    console.log("Base64 length: " + base64ImageData.length);
    console.log("Base64 starts with: " + base64ImageData.substring(0, 80));

    // Create folder structure: SpareParts/RepairID/
    let sparePartsFolder;
    const folderIterator = DriveApp.getFoldersByName("SpareParts");
    if (folderIterator.hasNext()) {
      sparePartsFolder = folderIterator.next();
    } else {
      sparePartsFolder = DriveApp.getRootFolder().createFolder("SpareParts");
    }

    const repairFolderName = "Repair_" + repairId;
    let repairFolder;
    const repairFolderIterator = sparePartsFolder.getFoldersByName(repairFolderName);
    if (repairFolderIterator.hasNext()) {
      repairFolder = repairFolderIterator.next();
    } else {
      repairFolder = sparePartsFolder.createFolder(repairFolderName);
    }

    console.log("📁 Folder created/found: " + repairFolderName);

    // Extract MIME type and base64 data
    let base64String = base64ImageData;
    let mimeType = "image/jpeg"; // Default
    let fileExtension = "jpg";
    
    if (base64String.includes(",")) {
      // Extract MIME type from data URL: data:image/png;base64,xxxxx
      const matches = base64String.match(/^data:([^;]+);base64,/);
      if (matches && matches[1]) {
        mimeType = matches[1];
        console.log("📷 Detected MIME type: " + mimeType);
        
        // Set file extension based on MIME type
        if (mimeType.includes("png")) {
          fileExtension = "png";
        } else if (mimeType.includes("gif")) {
          fileExtension = "gif";
        } else if (mimeType.includes("webp")) {
          fileExtension = "webp";
        } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
          fileExtension = "jpg";
        }
      }
      
      // Remove data URL prefix, keep only base64 data
      base64String = base64String.split(",")[1];
      console.log("✂️ Stripped data URL prefix, new length: " + base64String.length);
    }

    console.log("🔄 Decoding base64...");
    
    // ✅ ใช้ base64Decode (ไม่ใช่ base64DecodeWebSafe)
    let decodedBytes;
    try {
      decodedBytes = Utilities.base64Decode(base64String);
    } catch (decodeError) {
      console.error("❌ base64Decode failed, trying base64DecodeWebSafe...");
      // Fallback: บาง base64 อาจต้องใช้ WebSafe
      decodedBytes = Utilities.base64DecodeWebSafe(base64String);
    }
    
    const fileName = "spare_part_" + Date.now() + "." + fileExtension;
    const imageBlob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    console.log("✓ Blob created, size: " + imageBlob.getBytes().length + " bytes");

    // Upload file
    console.log("📤 Uploading to Google Drive...");
    const file = repairFolder.createFile(imageBlob);
    
    console.log("✓ File created: " + file.getName());

    // Make file publicly accessible
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    console.log("✓ Sharing set to public");

    // Return public URL
    const fileId = file.getId();
    const publicUrl = "https://lh5.googleusercontent.com/d/" + fileId;
    
    console.log("✅ Image uploaded successfully!");
    console.log("🔗 File ID: " + fileId);
    console.log("🔗 URL: " + publicUrl);
    
    return publicUrl;

  } catch (error) {
    console.error("❌ Upload spare part image error:");
    console.error("Error message: " + error.toString());
    console.error("Error name: " + error.name);
    if (error.stack) {
      console.error("Error stack: " + error.stack);
    }
    console.error("Image data length: " + (base64ImageData ? base64ImageData.length : 0));
    return null;
  }
}

/**
 * เพิ่มอะไหล่เข้าคลังโดยตรง (แก้ไข: รองรับ Location)
 */
function addSparePartToInventory(sparePartData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'error', message: 'ไม่สามารถเข้าถึง SpareParts sheet' };
    }

    const partId = 'SP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const quantity = Number(sparePartData.quantity) || 0;
    const unitCost = Number(sparePartData.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    const part = {
      id: partId,
      repair_id: '',  // ว่างสำหรับ direct add
      part_name: sparePartData.part_name || '',
      // ✅ เพิ่ม: บันทึกสถานที่เก็บ
      location: sparePartData.location || '', 
      quantity: quantity,
      unit: sparePartData.unit || 'pcs',
      unit_cost: unitCost,
      total_cost: totalCost,
      supplier: sparePartData.supplier || '',
      notes: sparePartData.notes || 'เพิ่มเข้าคลังโดยตรง',
      image_url: sparePartData.image_url || '',
      is_stock_add: sparePartData.is_stock_add || false,
      created_at: new Date().toISOString(),
      created_by: sessionCheck.session.username || ''
    };

    sheet.appendRow([JSON.stringify(part)]);
    
    // บันทึก Activity
    addActivity('spare_part_add', `เพิ่มอะไหล่เข้าคลัง: ${part.part_name} (${part.location || 'ไม่ระบุที่เก็บ'})`, sessionCheck.session.username);

    return { status: 'success', message: 'เพิ่มอะไหล่เรียบร้อยแล้ว', sparePart: part };
  } catch (error) {
    console.error('Add spare part to inventory error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการเพิ่มอะไหล่: ' + error.toString() };
  }
}

/**
 * แก้ไขอะไหล่ในคลัง
 */
/**
 * ✅ ตัดสต๊อกอะไหล่จากคลัง
 */
function deductInventoryStock(deductData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'error', message: 'ไม่สามารถเข้าถึง SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();
    let deductedCount = 0;
    let message = '';
    
    // ✅ ชื่ออะไหล่ที่ต้องตัด (trim เพื่อลบ space)
    const partNameToFind = deductData.part_name.trim();
    const deductQty = Number(deductData.quantity || 0);

    console.log('🔍 ค้นหาอะไหล่: "' + partNameToFind + '" จำนวน: ' + deductQty);

    for (let i = 1; i < data.length; i++) {
      try {
        const part = JSON.parse(data[i][0]);
        const partName = (part.part_name || '').trim();
        
        console.log('📦 Row ' + i + ': "' + partName + '" = ' + part.quantity + ' ' + part.unit);
        
        // ✅ เปรียบเทียบชื่อแบบ case-insensitive หรือ trim
        if (partName === partNameToFind) {
          const currentQty = Number(part.quantity || 0);
          
          console.log('✅ พบอะไหล่! จำนวนปัจจุบัน: ' + currentQty);
          
          // ตรวจสอบว่ามีสต๊อกพอหรือไม่
          if (currentQty < deductQty) {
            console.log('❌ สต๊อกไม่พอ: ' + currentQty + ' < ' + deductQty);
            return { 
              status: 'error', 
              message: `สต๊อกไม่พอ! ${part.part_name} มี ${currentQty} ${part.unit} ต้องการตัด ${deductQty} ${part.unit}` 
            };
          }
          
          // ✅ ตัดสต๊อก
          part.quantity = currentQty - deductQty;
          part.total_cost = (part.quantity || 0) * (part.unit_cost || 0);
          part.updated_at = new Date().toISOString();
          part.updated_by = sessionCheck.session.username || '';

          sheet.getRange(i + 1, 1).setValue(JSON.stringify(part));
          
          // ✅ บังคับบันทึกข้อมูลทันที
          SpreadsheetApp.flush();
          
          console.log('✅ ตัดสต๊อกสำเร็จ! เหลือ: ' + part.quantity);
          
          // บันทึก activity
          addActivity('spare_part_deduct', `ตัดสต๊อก ${part.part_name}: -${deductQty} ${part.unit}`, sessionCheck.session.username);
          
          deductedCount++;
          message = `ตัดสต๊อก ${part.part_name} เรียบร้อยแล้ว (เหลือ: ${part.quantity} ${part.unit})`;
          break;
        }
      } catch (e) {
        console.error('Parse error row ' + i + ':', e);
        continue;
      }
    }

    if (deductedCount > 0) {
      return { status: 'success', message: message };
    } else {
      console.log('❌ ไม่พบอะไหล่: "' + partNameToFind + '"');
      return { status: 'error', message: `ไม่พบอะไหล่ "${deductData.part_name}" ในคลัง` };
    }

  } catch (error) {
    console.error('deductInventoryStock error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * แก้ไขอะไหล่ในคลัง (แก้ไข: รองรับ Location)
 */
function updateInventoryPart(updateData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'error', message: 'ไม่สามารถเข้าถึง SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();
    let updatedCount = 0;

    for (let i = 1; i < data.length; i++) {
      try {
        const part = JSON.parse(data[i][0]);
        
        // อัพเดตเฉพาะรายการที่ชื่อตรงกับ original_name
        if (part.part_name === updateData.original_name) {
          // อัพเดตข้อมูล
          part.part_name = updateData.part_name || part.part_name;
          
          // ✅ เพิ่ม: อัปเดตสถานที่เก็บ
          if (updateData.location !== undefined) {
            part.location = updateData.location;
          }
          
          part.unit = updateData.unit || part.unit;
          part.unit_cost = updateData.unit_cost !== undefined ? Number(updateData.unit_cost) : part.unit_cost;
          part.supplier = updateData.supplier !== undefined ? updateData.supplier : part.supplier;
          
          // อัพเดต total_cost
          part.total_cost = (part.quantity || 0) * (part.unit_cost || 0);
          
          // อัพเดตรูป (ถ้ามี)
          if (updateData.image_url !== undefined) {
            part.image_url = updateData.image_url;
          }
          
          part.updated_at = new Date().toISOString();
          part.updated_by = sessionCheck.session.username || '';

          sheet.getRange(i + 1, 1).setValue(JSON.stringify(part));
          updatedCount++;
        }
      } catch (e) {
        continue;
      }
    }

    if (updatedCount > 0) {
      addActivity('spare_part_update', 'แก้ไขอะไหล่: ' + updateData.original_name + ' -> ' + updateData.part_name, sessionCheck.session.username);
      return { status: 'success', message: 'แก้ไขอะไหล่เรียบร้อยแล้ว (' + updatedCount + ' รายการ)' };
    } else {
      return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการแก้ไข' };
    }
  } catch (error) {
    console.error('Update inventory part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่: ' + error.toString() };
  }
}

/**
 * ลบอะไหล่จากคลัง
 */
function deleteInventoryPart(partName, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartsSheet();
    if (!sheet) {
      return { status: 'error', message: 'ไม่สามารถเข้าถึง SpareParts sheet' };
    }

    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];

    // หาแถวที่ต้องลบ (จากล่างขึ้นบน)
    for (let i = data.length - 1; i >= 1; i--) {
      try {
        const part = JSON.parse(data[i][0]);
        if (part.part_name === partName) {
          rowsToDelete.push(i + 1); // +1 เพราะ sheet เริ่มที่ 1
        }
      } catch (e) {
        continue;
      }
    }

    if (rowsToDelete.length === 0) {
      return { status: 'error', message: 'ไม่พบอะไหล่ที่ต้องการลบ' };
    }

    // ลบแถวจากล่างขึ้นบน (เพื่อไม่ให้ index เลื่อน)
    for (let i = 0; i < rowsToDelete.length; i++) {
      sheet.deleteRow(rowsToDelete[i]);
    }

    addActivity('spare_part_delete', 'ลบอะไหล่: ' + partName + ' (' + rowsToDelete.length + ' รายการ)', sessionCheck.session.username);

    return { status: 'success', message: 'ลบอะไหล่เรียบร้อยแล้ว (' + rowsToDelete.length + ' รายการ)' };
  } catch (error) {
    console.error('Delete inventory part error:', error);
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการลบอะไหล่: ' + error.toString() };
  }
}

// ============================================
// 🔧 SPARE PART REQUESTS & APPROVAL SYSTEM (JSON VERSION)
// Add this to the bottom of code.gs
// ============================================

/**
 * Initialize Spare Part Requests sheet (JSON Format)
 */
function initializeSparePartRequestsSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('SparePartRequests');
    
    if (!sheet) {
      sheet = ss.insertSheet('SparePartRequests');
      // เก็บเป็น JSON ในคอลัมน์ A คอลัมน์เดียว
      sheet.appendRow(['request_json']);
      console.log('✓ SparePartRequests sheet created (JSON format)');
    }
    return sheet;
  } catch (error) {
    console.error('Initialize SparePartRequests error:', error);
    return null;
  }
}

function createSparePartRequest(requestData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = initializeSparePartRequestsSheet();
    if (!sheet) return { status: 'error', message: 'System error: Cannot access requests sheet' };

    const requestId = 'REQ-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const now = new Date().toISOString();
    
    // ✅ แก้ไข: รับ URL รูปภาพที่ส่งมาจาก Frontend (ถ้ามี)
    let imageUrl = requestData.image_url || '';
    
    // ถ้ายังไม่มี URL แต่มี base64 (Fallback case เผื่ออนาคต)
    if (!imageUrl && requestData.image_base64) {
      try {
        const base64Data = requestData.image_base64.split(',')[1] || requestData.image_base64;
        const filename = `spare-part-${requestId}.jpg`;
        const uploadResult = uploadImage(base64Data, filename);
        if (uploadResult.status === 'success') {
          imageUrl = uploadResult.url;
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
      }
    }

    // สร้าง Object ที่มี field image_url
    const newRequest = {
      id: requestId,
      repair_id: requestData.repair_id,
      part_name: requestData.part_name,
      quantity: Number(requestData.quantity),
      unit: requestData.unit || 'pcs',
      estimated_cost: Number(requestData.estimated_cost),
      total_cost: Number(requestData.total_cost),
      reason: requestData.reason,
      requested_by: requestData.requested_by,
      image_url: imageUrl, // ✅ ใช้ URL ที่รับมาหรืออัปโหลดใหม่
      status: 'pending',
      approver_note: '',
      approved_by: '',
      approved_at: '',
      created_at: now,
      updated_at: now
    };

    // บันทึกเป็น JSON String
    sheet.appendRow([JSON.stringify(newRequest)]);

    // Notify (Optional)
    try {
      let msg = `🆕 <b>คำขอเบิกอะไหล่ใหม่</b>\nงานซ่อม: ${requestData.repair_id}\nอะไหล่: ${requestData.part_name}\nจำนวน: ${requestData.quantity} ${requestData.unit}\nผู้ขอ: ${requestData.requested_by}`;
      if(imageUrl) msg += `\n🖼️ มีรูปภาพแนบ`;
      sendTelegramNotification(msg);
    } catch (e) {}

    return { status: 'success', message: 'ส่งคำขอเรียบร้อยแล้ว', request_id: requestId, image_url: imageUrl };

  } catch (error) {
    console.error('createSparePartRequest error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Get pending requests for a specific repair
 */
/**
 * ✅ ยกเลิกคำขอเบิกอะไหล่ (ใช้ได้เฉพาะสถานะ pending)
 */
function cancelSparePartRequest(requestId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    if (!sheet) return { status: 'error', message: 'ไม่สามารถเข้าถึง SparePartRequests sheet' };

    const data = sheet.getDataRange().getValues();
    let foundRequest = null;
    let foundRowIndex = -1;

    // ค้นหา request
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const req = JSON.parse(data[i][0]);
          if (req.id === requestId) {
            foundRequest = req;
            foundRowIndex = i;
            break;
          }
        } catch (e) {
          console.error('Parse error:', e);
          continue;
        }
      }
    }

    if (!foundRequest) {
      return { status: 'error', message: 'ไม่พบคำขอเบิก' };
    }

    // ✅ อนุญาตให้ยกเลิกได้ทั้ง pending และ approved
    if (foundRequest.status !== 'pending' && foundRequest.status !== 'approved') {
      return { status: 'error', message: `ไม่สามารถยกเลิกได้ (สถานะ: ${foundRequest.status})` };
    }

    // ✅ ถ้าเป็น approved ให้ของกลับสู่สต๊อก
    if (foundRequest.status === 'approved') {
      try {
        // ลบอะไหล่ที่เบิกออกจากการซ่อม
        const spareParts = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
        if (spareParts) {
          const spareData = spareParts.getDataRange().getValues();
          
          // ค้นหา spare part ที่ตรงกับ request
          for (let i = 1; i < spareData.length; i++) {
            if (spareData[i][0]) {
              try {
                const part = JSON.parse(spareData[i][0]);
                
                // ถ้าเป็น part ที่เบิกจาก request นี้ ให้ลบออก
                if (part.notes && part.notes.includes(requestId)) {
                  spareParts.deleteRow(i + 1);
                  console.log('✅ ลบ spare part ออก:', part.part_name);
                  break; // ลบแค่ row เดียว
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
        
        // เพิ่มของกลับเข้าคลัง (reverse stock)
        const inventorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
        if (inventorySheet) {
          const reverseStockData = {
            part_name: foundRequest.part_name,
            quantity: foundRequest.quantity,
            unit: foundRequest.unit,
            unit_cost: foundRequest.estimated_cost,
            supplier: '',
            notes: `ยกเลิกคำขอและคืนสต๊อก (จากการยกเลิก: ${requestId})`,
            is_stock_add: true  // ✅ นี่คือการเพิ่มสต๊อก
          };
          
          addSparePartToInventory(reverseStockData, sessionId);
          console.log('✅ คืนสต๊อก:', foundRequest.part_name);
        }
      } catch (e) {
        console.error('Error returning stock:', e);
        // ถ้าคืนสต๊อกล้มเหลว ให้ยกเลิก request ได้ต่อไป
      }
    }

    // อัพเดท request status
    foundRequest.status = 'cancelled';
    foundRequest.updated_at = new Date().toISOString();
    foundRequest.updated_by = sessionCheck.session.username || '';
    
    sheet.getRange(foundRowIndex + 1, 1).setValue(JSON.stringify(foundRequest));
    
    // ✅ บังคับบันทึก
    SpreadsheetApp.flush();
    
    // บันทึก activity
    addActivity('spare_part_cancel', `ยกเลิกคำขอเบิก: ${foundRequest.part_name}`, sessionCheck.session.username);
    
    // ✅ Update spare_parts ใน repair data
    try {
      const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
      const repairsData = repairsSheet.getDataRange().getValues();
      
      for (let i = 1; i < repairsData.length; i++) {
        if (repairsData[i][0]) {
          try {
            const repair = JSON.parse(repairsData[i][0]);
            
            if (repair.id === foundRequest.repair_id && repair.spare_parts && Array.isArray(repair.spare_parts)) {
              
              // ลบ spare part ที่ match request_id
              let updated = false;
              repair.spare_parts = repair.spare_parts.filter((part) => {
                if (part.request_id === requestId) {
                  console.log('✅ ลบ spare_parts ออกจาก repair:', part.name);
                  updated = true;
                  return false; // ลบออก
                }
                return true;
              });
              
              // บันทึกกลับ
              if (updated) {
                repair.updated_at = new Date().toISOString();
                repair.updated_by = sessionCheck.session.username;
                repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));
                SpreadsheetApp.flush();
              }
            }
          } catch (e) {
            console.error('Error updating repair spare_parts:', e);
          }
        }
      }
    } catch (e) {
      console.error('Update spare_parts in repair error:', e);
    }

    return { status: 'success', message: 'ยกเลิกคำขอเรียบร้อยแล้ว' };

  } catch (error) {
    console.error('cancelSparePartRequest error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * ✅ แก้ไขคำขอเบิกอะไหล่ (ใช้ได้เฉพาะสถานะ pending)
 */
function updateSparePartRequest(requestId, updateData, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้อง' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    if (!sheet) return { status: 'error', message: 'ไม่สามารถเข้าถึง SparePartRequests sheet' };

    const data = sheet.getDataRange().getValues();
    let updated = false;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const req = JSON.parse(data[i][0]);
          if (req.id === requestId) {
            // ✅ อนุญาตให้แก้ไขได้เฉพาะ pending
            if (req.status !== 'pending') {
              return { status: 'error', message: `ไม่สามารถแก้ไขได้ (สถานะ: ${req.status})` };
            }
            
            // อัปเดตข้อมูล
            if (updateData.quantity !== undefined) req.quantity = Number(updateData.quantity);
            if (updateData.estimated_cost !== undefined) req.estimated_cost = Number(updateData.estimated_cost);
            if (updateData.reason !== undefined) req.reason = updateData.reason;
            
            // คำนวณ total_cost
            req.total_cost = (req.quantity || 0) * (req.estimated_cost || 0);
            req.updated_at = new Date().toISOString();
            req.updated_by = sessionCheck.session.username || '';
            
            sheet.getRange(i + 1, 1).setValue(JSON.stringify(req));
            
            // บันทึก activity
            addActivity('spare_part_edit', `แก้ไขคำขอเบิก: ${req.part_name}`, sessionCheck.session.username);
            
            updated = true;
            break;
          }
        } catch (e) {
          console.error('Parse error:', e);
          continue;
        }
      }
    }

    if (updated) {
      return { status: 'success', message: 'แก้ไขคำขอเรียบร้อยแล้ว' };
    } else {
      return { status: 'error', message: 'ไม่พบคำขอเบิก' };
    }

  } catch (error) {
    console.error('updateSparePartRequest error:', error);
    return { status: 'error', message: error.toString() };
  }
}

function getSparePartRequestsByRepair(repairId, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') return { status: 'error', message: 'Session Invalid' };

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    if (!sheet) return { status: 'success', requests: [] };

    const data = sheet.getDataRange().getValues();
    const requests = [];

    // วนลูปอ่าน JSON จากคอลัมน์ A (index 0)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const req = JSON.parse(data[i][0]);
          if (req.repair_id === repairId && req.status !== 'cancelled') {
            requests.push(req);
          }
        } catch (e) {
          console.error('Error parsing request row ' + (i + 1));
        }
      }
    }

    return { status: 'success', requests: requests };

  } catch (error) {
    console.error('getSparePartRequestsByRepair error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Get all requests (for Admin dashboard)
 */
function getAllSparePartRequests(sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') return { status: 'error', message: 'Session Invalid' };
    
    // Check Admin/Manager permissions
    if (!sessionCheck.session.permissions.includes('all') && !sessionCheck.session.permissions.includes('repair')) {
      return { status: 'error', message: 'Access Denied' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    if (!sheet) return { status: 'success', requests: [] };

    const data = sheet.getDataRange().getValues();
    const requests = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const req = JSON.parse(data[i][0]);
          requests.push(req);
        } catch (e) {
          continue;
        }
      }
    }

    // Sort by status (pending first) then date
    requests.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return { status: 'success', requests: requests };

  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Get count of pending requests
 */
function getPendingRequestsCount(sessionId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    if (!sheet) return { status: 'success', count: 0 };

    const data = sheet.getDataRange().getValues();
    let count = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const req = JSON.parse(data[i][0]);
          if (req.status === 'pending') {
            count++;
          }
        } catch (e) {}
      }
    }
    return { status: 'success', count: count };
  } catch (e) {
    return { status: 'error', count: 0 };
  }
}

/**
 * Approve a request (Updated: Auto Add Stock + Assign to Repair + Force Flush + Image Support)
 */
function approveSparePartRequest(requestId, approvalData, sessionId) {
  try {
    // 1. ตรวจสอบสิทธิ์
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') return { status: 'error', message: 'Session Invalid' };
    
    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'Unauthorized' };
    }

    // 2. ค้นหาคำขอใน Sheet
    const reqSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    const reqData = reqSheet.getDataRange().getValues();
    let foundRequest = null;

    for (let i = 1; i < reqData.length; i++) {
      if (reqData[i][0]) {
        try {
          const req = JSON.parse(reqData[i][0]);
          if (req.id === requestId) {
            if (req.status !== 'pending') {
              return { status: 'error', message: 'Request is not pending' };
            }
            
            // 3. อัพเดทสถานะคำขอเป็น Approved
            req.status = 'approved';
            req.approver_note = approvalData.notes || 'Approved';
            req.approved_by = sessionCheck.session.username;
            req.approved_at = new Date().toISOString();
            req.updated_at = new Date().toISOString();

            // บันทึกกลับลง Sheet
            reqSheet.getRange(i + 1, 1).setValue(JSON.stringify(req));
            
            // ✅ บังคับให้ Google Sheet บันทึกข้อมูลทันที (แก้ปัญหาเลข Badge ไม่หาย)
            SpreadsheetApp.flush();
            
            foundRequest = req;
            break;
          }
        } catch (e) {}
      }
    }

    if (!foundRequest) return { status: 'error', message: 'Request not found' };

    // 4. ขั้นตอนที่ 1: รับของเข้าคลัง (Stock In)
    const stockData = {
      part_name: foundRequest.part_name,
      quantity: foundRequest.quantity,
      unit: foundRequest.unit,
      unit_cost: approvalData.actual_cost, // ใช้ราคาจริงที่อนุมัติ
      supplier: approvalData.supplier,
      notes: 'รับเข้าอัตโนมัติจากการอนุมัติคำขอ: ' + requestId,
      is_stock_add: true, // Flag บอกว่าเป็นสต็อกเข้า
      
      // ✅ ส่ง URL รูปภาพไปด้วย (ถ้ามี)
      image_url: foundRequest.image_url || '' 
    };
    
    addSparePartToInventory(stockData, sessionId);

    // 5. ขั้นตอนที่ 2: ตัดจ่ายเข้างานซ่อม (Usage)
    const usageData = {
      part_name: foundRequest.part_name,
      quantity: foundRequest.quantity,
      unit: foundRequest.unit,
      unit_cost: approvalData.actual_cost,
      supplier: approvalData.supplier,
      notes: (approvalData.notes ? approvalData.notes + ' ' : '') + '(จากการเบิก: ' + requestId + ')',
      
      // ✅ ส่ง URL รูปภาพไปด้วย (ถ้ามี)
      image_url: foundRequest.image_url || ''
    };

    const addResult = addSparePart(foundRequest.repair_id, usageData, sessionId);

    // ✅ 5.5 Update spare_parts status ใน repair data
    try {
      const repairsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
      const repairsData = repairsSheet.getDataRange().getValues();
      
      for (let i = 1; i < repairsData.length; i++) {
        if (repairsData[i][0]) {
          try {
            const repair = JSON.parse(repairsData[i][0]);
            
            // ✅ ค้นหา repair ที่มี request_id ตรงกัน
            if (repair.id === foundRequest.repair_id && repair.spare_parts && Array.isArray(repair.spare_parts)) {
              
              // Update status ของ spare part ที่ match request_id
              let updated = false;
              repair.spare_parts.forEach((part) => {
                if (part.request_id === requestId && part.status !== 'approved') {
                  part.status = 'approved';
                  updated = true;
                  console.log('✅ Updated spare_parts status in repair:', repair.id, part.name);
                }
              });
              
              // บันทึกกลับ
              if (updated) {
                repair.updated_at = new Date().toISOString();
                repair.updated_by = sessionCheck.session.username;
                repairsSheet.getRange(i + 1, 1).setValue(JSON.stringify(repair));
                SpreadsheetApp.flush();
              }
            }
          } catch (e) {
            console.error('Error updating repair spare_parts:', e);
          }
        }
      }
    } catch (e) {
      console.error('Update spare_parts in repair error:', e);
    }

    // 6. แจ้งเตือน Telegram (ถ้ามี)
    try {
        const message = `✅ <b>อนุมัติคำขอเบิกอะไหล่</b>\n` +
                        `งานซ่อม: ${foundRequest.repair_id}\n` +
                        `อะไหล่: ${foundRequest.part_name}\n` +
                        `จำนวน: ${foundRequest.quantity} ${foundRequest.unit}\n` +
                        `อนุมัติโดย: ${sessionCheck.session.username}`;
        sendTelegramNotification(message);
    } catch (e) {}

    if (addResult.status === 'success') {
       return { status: 'success', message: 'อนุมัติและบันทึกรายการเรียบร้อย' };
    } else {
       return { status: 'warning', message: 'อนุมัติแล้ว แต่บันทึกเข้างานซ่อมล้มเหลว: ' + addResult.message };
    }

  } catch (error) {
    console.error('Approve error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Reject a request
 */
function rejectSparePartRequest(requestId, reason, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') return { status: 'error', message: 'Session Invalid' };
    
    if (!sessionCheck.session.permissions.includes('all')) {
      return { status: 'error', message: 'Unauthorized' };
    }

    const reqSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SparePartRequests');
    const reqData = reqSheet.getDataRange().getValues();
    
    for (let i = 1; i < reqData.length; i++) {
      if (reqData[i][0]) {
        try {
          const req = JSON.parse(reqData[i][0]);
          if (req.id === requestId) {
            req.status = 'rejected';
            req.approver_note = reason;
            req.approved_by = sessionCheck.session.username; // ผู้ปฏิเสธ
            req.updated_at = new Date().toISOString();

            reqSheet.getRange(i + 1, 1).setValue(JSON.stringify(req));
            return { status: 'success', message: 'ปฏิเสธคำขอเรียบร้อย' };
          }
        } catch (e) {}
      }
    }
    return { status: 'error', message: 'Request not found' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

// ============================================
// 📦 ฟังก์ชันคืนอะไหล่เข้าคลัง (จากหน้าจัดการอะไหล่)
// ============================================
function returnSparePartToInventory(partId, newQty, returnQty, sessionId) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session หมดอายุ' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SpareParts');
    if (!sheet) return { status: 'error', message: 'ไม่พบฐานข้อมูล' };

    const data = sheet.getDataRange().getValues();
    let partFound = false;
    let originalPartData = null;

    // 1. แก้ไขจำนวนในรายการเดิม (ลดจำนวนลง)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        try {
          const part = JSON.parse(data[i][0]);
          if (part.id === partId) {
            originalPartData = { ...part }; // เก็บข้อมูลเดิมไว้สร้างรายการคืน
            
            // อัปเดตจำนวนและราคารวมของรายการเดิม
            part.quantity = Number(newQty);
            part.total_cost = Number(newQty) * Number(part.unit_cost);
            part.updated_at = new Date().toISOString();
            part.updated_by = sessionCheck.session.username;
            
            sheet.getRange(i + 1, 1).setValue(JSON.stringify(part));
            partFound = true;
            break;
          }
        } catch (e) {}
      }
    }

    if (!partFound || !originalPartData) {
      return { status: 'error', message: 'ไม่พบรายการอะไหล่' };
    }

    // 2. สร้างรายการใหม่เพื่อ "คืนเข้าคลัง" (Stock In)
    const returnStockId = 'SP-RET-' + Date.now();
    const returnItem = {
      id: returnStockId,
      repair_id: '', // ว่างไว้เพราะเป็นของในคลัง
      part_name: originalPartData.part_name,
      quantity: Number(returnQty),
      unit: originalPartData.unit,
      unit_cost: originalPartData.unit_cost,
      total_cost: Number(returnQty) * Number(originalPartData.unit_cost),
      supplier: originalPartData.supplier,
      image_url: originalPartData.image_url,
      
      // ✅ Key สำคัญ: บอกว่าเป็นสต็อกเข้า
      is_stock_add: true, 
      notes: `คืนจากงานซ่อม ${originalPartData.repair_id} (เหลือใช้)`,
      
      created_at: new Date().toISOString(),
      created_by: sessionCheck.session.username
    };

    sheet.appendRow([JSON.stringify(returnItem)]);
    
    // บันทึก Log
    addActivity('spare_part_return', `คืนอะไหล่ ${originalPartData.part_name} จำนวน ${returnQty} เข้าคลัง`, sessionCheck.session.username);

    return { status: 'success', message: 'ปรับปรุงข้อมูลเรียบร้อย' };

  } catch (error) {
    console.error('returnSparePartToInventory error:', error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * 🔧 แก้ไข logo_url ให้ตรงกับ logo_file_id
 * รันครั้งเดียวเพื่อซิงค์ข้อมูล
 */
function fixLogoUrlMismatch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    Logger.log('❌ ไม่พบ Config Sheet');
    return;
  }
  
  const data = configSheet.getDataRange().getValues();
  
  if (data.length > 1 && data[1][0]) {
    const config = JSON.parse(data[1][0]);
    
    Logger.log('📊 Config ปัจจุบัน:');
    Logger.log('  logo_file_id: ' + config.logo_file_id);
    Logger.log('  logo_url: ' + config.logo_url);
    
    if (config.logo_file_id) {
      const correctUrl = 'https://lh5.googleusercontent.com/d/' + config.logo_file_id;
      
      if (config.logo_url !== correctUrl) {
        Logger.log('⚠️ พบความไม่ตรงกัน! กำลังแก้ไข...');
        
        config.logo_url = correctUrl;
        config.updated_at = new Date().toISOString();
        
        configSheet.getRange(2, 1).setValue(JSON.stringify(config));
        
        Logger.log('✅ แก้ไขเรียบร้อย:');
        Logger.log('  logo_url ใหม่: ' + config.logo_url);
      } else {
        Logger.log('✅ ข้อมูลถูกต้องแล้ว ไม่ต้องแก้ไข');
      }
    } else {
      Logger.log('⚠️ ไม่มี logo_file_id');
    }
  } else {
    Logger.log('❌ ไม่พบข้อมูล Config');
  }
}

function createAdminUser() {
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  
  if (!usersSheet) {
    Logger.log('ไม่พบ Users sheet');
    return;
  }
  
  const adminUser = {
    id: Utilities.getUuid(),
    username: 'admin',
    password: 'admin123', // plain text
    name: 'ผู้ดูแลระบบ',
    email: 'admin@system.local',
    role: 'admin',
    department: 'IT',
    phone: '',
    permissions: ['all'],
    status: 'active',
    active: true, // สำคัญ!
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null
  };
  
  usersSheet.appendRow([JSON.stringify(adminUser)]);
  Logger.log('✅ สร้างบัญชี admin สำเร็จ');
}

// ============================================
// Technician Report Functions
// ============================================

function getTechnicianReports(sessionId, dateFrom, dateTo) {
  try {
    const sessionCheck = validateSession(sessionId);
    if (sessionCheck.status !== 'valid') {
      return { status: 'error', message: 'Session ไม่ถูกต้องหรือหมดอายุ' };
    }
    
    // ดึงข้อมูลจาก sheet แจ้งซ่อม แล้วคำนวณเป็นสถิติช่าง
    const technicianStats = calculateTechnicianStatsFromRepairs(dateFrom, dateTo);
    
    return {
      status: 'success',
      technicians: technicianStats
    };
    
  } catch (error) {
    console.error('Get technician reports error:', error);
    return { 
      status: 'error', 
      message: 'เกิดข้อผิดพลาด: ' + error.toString() 
    };
  }
}

function calculateTechnicianStatsFromRepairs(dateFrom, dateTo) {
  // Debug: แสดงชื่อ sheet ทั้งหมด
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  console.log('ชื่อ sheet ทั้งหมด:');
  sheets.forEach(sheet => console.log('  - ' + sheet.getName()));
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Repairs');
  if (!sheet) {
    console.error('ไม่พบ sheet Repairs กรุณาตรวจสอบชื่อ sheet');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  
  // เก็บรวมข้อมูลตามช่าง
  const technicianMap = new Map();
  
  // ข้ามแถวแรก (header)
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; // ข้ามถ้าคอลัมน์ A ว่าง
    
    try {
      const repair = JSON.parse(data[i][0]); // Parse JSON จากคอลัมน์ A
      
      const technicianName = repair.technician_name || 'ไม่ระบุ';
      const status = repair.status || '';
      const repairCost = parseFloat(repair.repair_cost) || 0;
      const createdAt = repair.created_at ? new Date(repair.created_at) : null;
      const completedAt = repair.updated_at && repair.status === 'completed' ? new Date(repair.updated_at) : null;
      
      // กรองตามช่วงวันที่
      if (createdAt && dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        if (createdAt < fromDate || createdAt > toDate) {
          continue;
        }
      }
      
      // สร้างหรืออัพเดตข้อมูลช่าง
      if (!technicianMap.has(technicianName)) {
        technicianMap.set(technicianName, {
          technician_name: technicianName,
          total_repairs: 0,
          completed_repairs: 0,
          in_progress_repairs: 0,
          pending_repairs: 0,
          total_cost: 0,
          repair_times: [],
          rating: 0
        });
      }
      
      const tech = technicianMap.get(technicianName);
      tech.total_repairs++;
      tech.total_cost += repairCost;
      
      // นับตามสถานะ
      switch(status) {
        case 'completed':
          tech.completed_repairs++;
          // คำนวณเวลาซ่อม
          if (completedAt && createdAt) {
            const repairTime = Math.round((completedAt - createdAt) / (1000 * 60)); // นาที
            tech.repair_times.push(repairTime);
          }
          break;
        case 'in_progress':
          tech.in_progress_repairs++;
          break;
        case 'pending':
          tech.pending_repairs++;
          break;
      }
    } catch (e) {
      console.error('Error parsing repair data at row ' + (i + 1) + ':', e);
    }
  }
  
  // คำนวณค่าเฉลี่ยและคะแนน
  const technicians = Array.from(technicianMap.values()).map(tech => {
    // คำนวณเวลาเฉลี่ย
    const avgTime = tech.repair_times.length > 0 
      ? Math.round(tech.repair_times.reduce((a, b) => a + b, 0) / tech.repair_times.length)
      : 0;
    
    // คำนวณคะแนน (ตัวอย่าง: จากอัตราการเสร็จและเวลาเฉลี่ย)
    const completionRate = tech.total_repairs > 0 ? tech.completed_repairs / tech.total_repairs : 0;
    const rating = Math.min(5, Math.round((completionRate * 3 + (avgTime < 60 ? 2 : 0)) * 10) / 10);
    
    return {
      ...tech,
      average_repair_time: avgTime,
      rating: rating
    };
  });
  
  return technicians;
}

// ============================================
// Depreciation Functions
// ============================================

function getEquipmentForDepreciation() {
  try {
    initializeSheets();
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Equipment');
    if (!sheet) {
      return { status: 'error', message: 'ไม่พบแผ่นงาน Equipment' };
    }
    
    const data = sheet.getDataRange().getValues();
    const equipment = [];
    
    // ข้ามแถวแรก (header)
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0]) continue; // ข้ามถ้าคอลัมน์ A ว่าง
      
      const row = data[i];
      const cellA = String(row[0]).trim();
      
      // ✅ ตรวจสอบว่าคอลัมน์ A เป็น JSON string หรือไม่
      if (cellA.startsWith('{')) {
        try {
          const parsed = JSON.parse(cellA);
          if (parsed && typeof parsed === 'object') {
            equipment.push({
              id: parsed.id || '',
              code: parsed.equipment_number || parsed.code || parsed.id || '',
              name: parsed.name || '',
              type: parsed.type || '',
              brand: parsed.brand || '',
              model: parsed.model || '',
              serialNumber: parsed.serial_number || parsed.serialNumber || '',
              purchaseDate: parsed.purchase_date || parsed.purchaseDate || '',
              cost: parseFloat(parsed.purchase_price || parsed.cost || parsed.price || 0),
              location: parsed.location || '',
              department: parsed.department || '',
              status: parsed.status || 'active',
              usefulLife: parseInt(parsed.useful_life || parsed.usefulLife || 5),
              residualValuePercent: parseFloat(parsed.residualValuePercent || parsed.residual_percent || 10),
              purchaseYear: parsed.purchase_year || '',
              warrantyExpiry: parsed.warranty_end_date || parsed.warrantyExpiry || '',
              imageUrl: parsed.image_url || ''
            });
            continue; // ไปแถวถัดไป
          }
        } catch (e) {
          // ไม่ใช่ JSON → อ่านแบบปกติ
        }
      }
      
      // ✅ อ่านแบบปกติ (คอลัมน์แยก)
      equipment.push({
        id: row[0] || '',
        code: row[0] || '',
        name: row[1] || '',
        type: row[2] || '',
        brand: row[3] || '',
        model: row[4] || '',
        serialNumber: row[5] || '',
        purchaseDate: row[6] || '',
        cost: parseFloat(row[7]) || 0,
        location: row[8] || '',
        department: row[9] || '',
        status: row[10] || 'active',
        usefulLife: parseInt(row[11]) || 5,
        residualValuePercent: parseFloat(row[12]) || 10,
        description: row[13] || '',
        warrantyExpiry: row[14] || '',
        notes: row[15] || ''
      });
    }
    
    return { status: 'success', equipment: equipment };
    
  } catch (error) {
    console.error('Error in getEquipmentForDepreciation:', error);
    return { status: 'error', message: 'ไม่สามารถโหลดข้อมูลพัสดุได้: ' + error.toString() };
  }
}

function calculateDepreciationBatch(equipmentIds, method, usefulLife, residualValuePercent) {
  try {
    const result = getEquipmentForDepreciation();
    if (result.status !== 'success') {
      return result;
    }
    
    const allEquipment = result.equipment;
    const selectedEquipment = allEquipment.filter(eq => equipmentIds.includes(eq.id));
    
    const calculations = selectedEquipment.map(equipment => {
      const cost = parseFloat(equipment.cost) || 0;
      const usefulLifeYears = parseInt(usefulLife) || parseInt(equipment.usefulLife) || 5;
      const residualValue = cost * (parseFloat(residualValuePercent) || 10) / 100;
      const purchaseDate = new Date(equipment.purchaseDate);
      const currentDate = new Date();
      
      const yearsInUse = Math.floor((currentDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000));
      const yearsInUseCapped = Math.min(yearsInUse, usefulLifeYears);
      
      let annualDepreciation = 0;
      let accumulatedDepreciation = 0;
      let netBookValue = cost;
      
      switch (method) {
        case 'straight-line':
          annualDepreciation = (cost - residualValue) / usefulLifeYears;
          accumulatedDepreciation = annualDepreciation * yearsInUseCapped;
          break;
          
        case 'declining-balance':
          const rate = 2 / usefulLifeYears;
          accumulatedDepreciation = cost * (1 - Math.pow(1 - rate, yearsInUseCapped));
          annualDepreciation = cost * rate * Math.pow(1 - rate, yearsInUseCapped);
          break;
          
        case 'sum-of-years':
          const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
          for (let year = 1; year <= yearsInUseCapped; year++) {
            const yearDepreciation = (cost - residualValue) * (usefulLifeYears - year + 1) / sumOfYears;
            accumulatedDepreciation += yearDepreciation;
            if (year === yearsInUseCapped) {
              annualDepreciation = yearDepreciation;
            }
          }
          break;
      }
      
      accumulatedDepreciation = Math.min(accumulatedDepreciation, cost - residualValue);
      netBookValue = cost - accumulatedDepreciation;
      
      return {
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.name,
        cost: cost,
        usefulLife: usefulLifeYears,
        residualValue: residualValue,
        yearsInUse: yearsInUse,
        annualDepreciation: annualDepreciation,
        accumulatedDepreciation: accumulatedDepreciation,
        netBookValue: netBookValue,
        method: method
      };
    });
    
    return { status: 'success', calculations: calculations };
    
  } catch (error) {
    console.error('Error in calculateDepreciationBatch:', error);
    return { status: 'error', message: 'ไม่สามารถคำนวณค่าเสื่อมได้: ' + error.toString() };
  }
}

function exportDepreciationReport(format, filters) {
  try {
    const result = getEquipmentForDepreciation();
    if (result.status !== 'success') {
      return result;
    }
    
    let equipment = result.equipment;
    
    // Apply filters if provided
    if (filters) {
      if (filters.type) {
        equipment = equipment.filter(eq => eq.type === filters.type);
      }
      if (filters.status) {
        equipment = equipment.filter(eq => eq.status === filters.status);
      }
      if (filters.location) {
        equipment = equipment.filter(eq => eq.location.includes(filters.location));
      }
    }
    
    if (format === 'csv') {
      const csvData = equipment.map(eq => {
        const depreciation = calculateSingleDepreciation(eq, 'straight-line');
        return [
          eq.code,
          eq.name,
          eq.type,
          eq.purchaseDate,
          eq.cost,
          eq.usefulLife,
          depreciation.annualDepreciation,
          depreciation.accumulatedDepreciation,
          depreciation.netBookValue
        ].join(',');
      });
      
      const csvHeader = 'รหัสพัสดุ,ชื่อพัสดุ,ประเภท,วันที่ซื้อ,มูลค่าเริ่มต้น,อายุการใช้งาน(ปี),ค่าเสื่อม/ปี,ค่าเสื่อมสะสม,มูลค่าปัจจุบัน';
      const csvContent = csvHeader + '\n' + csvData.join('\n');
      
      return { status: 'success', content: csvContent, filename: 'depreciation_report.csv' };
    }
    
    return { status: 'error', message: 'ไม่รองรับรูปแบบ: ' + format };
    
  } catch (error) {
    console.error('Error in exportDepreciationReport:', error);
    return { status: 'error', message: 'ไม่สามารถส่งออกรายงานได้: ' + error.toString() };
  }
}

function calculateSingleDepreciation(equipment, method) {
  const cost = parseFloat(equipment.cost) || 0;
  const usefulLife = parseInt(equipment.usefulLife) || 5;
  const residualValuePercent = parseFloat(equipment.residualValuePercent) || 10;
  const residualValue = cost * (residualValuePercent / 100);
  const purchaseDate = new Date(equipment.purchaseDate);
  const currentDate = new Date();
  
  const yearsInUse = Math.floor((currentDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000));
  const yearsInUseCapped = Math.min(yearsInUse, usefulLife);
  
  let annualDepreciation = 0;
  let accumulatedDepreciation = 0;
  let netBookValue = cost;
  
  switch (method) {
    case 'straight-line':
      annualDepreciation = (cost - residualValue) / usefulLife;
      accumulatedDepreciation = annualDepreciation * yearsInUseCapped;
      break;
      
    case 'declining-balance':
      const rate = 2 / usefulLife;
      accumulatedDepreciation = cost * (1 - Math.pow(1 - rate, yearsInUseCapped));
      annualDepreciation = cost * rate * Math.pow(1 - rate, yearsInUseCapped);
      break;
      
    case 'sum-of-years':
      const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
      for (let year = 1; year <= yearsInUseCapped; year++) {
        const yearDepreciation = (cost - residualValue) * (usefulLife - year + 1) / sumOfYears;
        accumulatedDepreciation += yearDepreciation;
        if (year === yearsInUseCapped) {
          annualDepreciation = yearDepreciation;
        }
      }
      break;
  }
  
  accumulatedDepreciation = Math.min(accumulatedDepreciation, cost - residualValue);
  netBookValue = cost - accumulatedDepreciation;
  
  return {
    annualDepreciation: annualDepreciation,
    accumulatedDepreciation: accumulatedDepreciation,
    netBookValue: netBookValue,
    yearsInUse: yearsInUse,
    residualValue: residualValue
  };
}
