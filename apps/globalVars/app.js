module.exports = function init(site) {
  site.patientTypes = [
    { id: 1, code: 'N', nameEn: 'Normal', nameAr: 'عادي' },
    { id: 4, code: 'H', nameEn: 'HIJ', nameAr: 'مركز الحجامة' },
    { id: 9, code: 'V', nameEn: 'VIP PATIENT', nameAr: 'مميز' },
    { id: 10, code: 'G', nameEn: 'GOVERMENT PATIENT', nameAr: 'مسئول' },
    { id: 11, code: 'T', nameEn: 'TADAWI PROGRAM', nameAr: 'برامج تداوي' },
    { id: 12, code: '2', nameEn: 'JESTRE JOYCE BALILA ILUSTRE', nameAr: 'J' },
    { id: 13, code: 'F', nameEn: 'A', nameAr: 'فحص العمالة' },
    { id: 14, code: 'I', nameEn: 'I', nameAr: 'I' },
    { id: 15, code: 'B', nameEn: 'B', nameAr: 'B' },
    { id: 16, code: 'S', nameEn: 'S', nameAr: 'Seha' },
  ];

  site.qualificationTypes = [
    { id: 1, nameEn: 'High qualified', nameAr: 'مؤهل عالي' },
    { id: 3, nameEn: 'Upper intermediate', nameAr: 'فوق المتوسط' },
    { id: 4, nameEn: 'Intermediate', nameAr: 'المتوسط' },
    { id: 5, nameEn: 'Preparatory', nameAr: 'إعدادية' },
    { id: 6, nameEn: 'Primary', nameAr: 'إبتدائية' },
    { id: 7, nameEn: 'Student', nameAr: 'طالب' },
    { id: 8, nameEn: 'Literacy', nameAr: 'محو أمية' },
    { id: 9, nameEn: 'Without qualified', nameAr: 'بدون مؤهل' },
  ];

  site.employeeStatus = [
    { id: 1, nameEn: 'Active', nameAr: 'نشط' },
    { id: 2, nameEn: 'Inactive', nameAr: 'خامل' },
    { id: 3, nameEn: 'Resignation', nameAr: 'إستقالة' },
    { id: 4, nameEn: 'Cessation', nameAr: 'إنقطاع' },
    { id: 5, nameEn: 'Dispensing', nameAr: 'إستغناء' },
    { id: 6, nameEn: 'Termination', nameAr: 'فصل' },
    { id: 7, nameEn: 'Release', nameAr: 'إخلاء' },
  ];

  site.servicesOrdersSources = [
    { id: 1, nameEn: 'Direct', nameAr: 'مباشر' },
    { id: 2, nameEn: 'Doctor DeskTop', nameAr: 'مكتب الطبيب' },
    { id: 3, nameEn: 'Doctor Appointment', nameAr: 'ميعاد طبيب' },
  ];

  site.doctorTypes = [
    { id: 1, code: 'G', nameEn: 'General', nameAr: 'عام' },
    { id: 2, code: 'M', nameEn: 'Medical Director', nameAr: 'المدير الطبي' },
  ];

  site.paymentTypes = [
    { id: 1, code: 001, nameEn: 'CASH', nameAr: 'النقد' },
    { id: 2, code: 002, nameEn: 'CHEQUE', nameAr: 'بالشيك' },
    { id: 3, code: 003, nameEn: 'CREDIT CARD', nameAr: 'بطاقة أجلا' },
    { id: 4, code: 004, nameEn: 'SPAN', nameAr: 'بطاقة سبان' },
    { id: 5, code: 005, nameEn: 'BANK DEPOSIT', nameAr: 'إيداع بنكي' },
  ];

  site.maritalStatus = [
    { id: 1, code: 's', nameEn: 'Single', nameAr: 'أعزب' },
    { id: 2, code: 'm', nameEn: 'Married', nameAr: 'متزوج' },
    { id: 3, code: 'd', nameEn: 'Divorced', nameAr: 'مطلق' },
    { id: 4, code: 'w', nameEn: 'Widower', nameAr: 'أرمل' },
    { id: 5, code: 'u', nameEn: 'unknown', nameAr: 'غير معروف' },
  ];

  site.filesTypes = [
    { id: 1, nameEn: 'Iqama', nameAr: 'إقامة' },
    { id: 2, nameEn: 'Passport', nameAr: 'جواز سفر' },
    { id: 3, nameEn: 'Contract', nameAr: 'عقد' },
    { id: 4, nameEn: 'Insurance', nameAr: 'تأمين' },
    { id: 5, nameEn: 'ConsDocument', nameAr: 'مستند' },
    { id: 6, nameEn: 'InvesDocument', nameAr: 'مستند' },
    { id: 7, nameEn: 'Approvals', nameAr: 'موافقات' },
    { id: 8, nameEn: 'LabDocument', nameAr: 'مستنند معمل' },
    { id: 9, nameEn: 'XRay', nameAr: 'أشعة' },
    { id: 10, nameEn: 'CT-Scan', nameAr: 'أشعة مقطعية' },
    { id: 11, nameEn: 'Personal', nameAr: 'شخصي' },
    { id: 12, nameEn: 'A4', nameAr: 'A4' },
    { id: 13, nameEn: 'INPATIENT', nameAr: 'مريض داخلي' },
    { id: 14, nameEn: 'Fax', nameAr: 'فاكس' },
    { id: 15, nameEn: 'Signature', nameAr: 'توقيع' },
    { id: 16, nameEn: 'Letter', nameAr: 'خطاب' },
  ];

  site.centersTypes = [
    { id: 2, code: 'P', nameEn: 'Pharmacy', nameAr: 'صيدلية' },
    { id: 3, code: 'C', nameEn: 'Clinic', nameAr: 'عيادة' },
    { id: 4, code: 'T', nameEn: 'Therapy', nameAr: 'علاج' },
    { id: 5, code: 'E', nameEn: 'Emergency', nameAr: 'طوارئ' },
    { id: 6, code: 'X', nameEn: 'X-Ray', nameAr: 'أشعة' },
    { id: 7, code: 'L', nameEn: 'Laboratory', nameAr: 'معمل' },
    { id: 1, code: 'O', nameEn: 'Other', nameAr: 'أخرى' },
  ];

  site.servicesTypeGroups = [
    { id: 1, code: 'S', nameEn: 'Service', nameAr: 'خدمة' },
    { id: 2, code: 'C', nameEn: 'Consultation', nameAr: 'إستشارة' },
    { id: 3, code: 'L', nameEn: 'Laboratory', nameAr: 'معمل' },
    { id: 4, code: 'X', nameEn: 'X-Ray', nameAr: 'أشعة' },
    { id: 5, code: 'M', nameEn: 'Medicine', nameAr: 'دواء' },
    { id: 6, code: 'T', nameEn: 'Therapy', nameAr: 'علاج' },
    { id: 8, code: 'E', nameEn: 'Emergency', nameAr: 'طوارئ' },
    { id: 9, code: 'K', nameEn: 'Kitchen', nameAr: 'مطبخ' },
    { id: 7, code: 'U', nameEn: 'Unknown', nameAr: 'مجهول' },
  ];

  site.genders = [
    { id: 1, nameEn: 'Male', nameAr: 'ذكر' },
    { id: 2, nameEn: 'Female', nameAr: 'أنثى' },
  ];

  site.recipientPerson = [
    { id: 1, nameEn: 'The same patient', nameAr: 'المريض نفسه' },
    { id: 2, nameEn: 'Another person', nameAr: 'شخص أخر' },
  ];

  site.storesTypes = [
    { id: 1, code: '001', nameEn: 'Main Store', nameAr: 'رئيسي' },
    { id: 2, code: '002', nameEn: 'Sub Store', nameAr: 'فرعي' },
  ];

  site.weekDays = [
    { id: 1, index: 6, nameEn: 'Saturday', nameAr: 'السبت' },
    { id: 2, index: 0, nameEn: 'Sunday', nameAr: 'الأحد' },
    { id: 3, index: 1, nameEn: 'Monday', nameAr: 'الإثنين' },
    { id: 4, index: 2, nameEn: 'Tuesday', nameAr: 'الثلاثاء' },
    { id: 5, index: 3, nameEn: 'Wednesday', nameAr: 'الأربعاء' },
    { id: 6, index: 4, nameEn: 'Thursday', nameAr: 'الخميس' },
    { id: 7, index: 5, nameEn: 'Friday', nameAr: 'الجمعة' },
  ];

  site.safesTypes = [
    { id: 1, code: '001', nameEn: 'Cash', nameAr: 'نقدي' },
    { id: 2, code: '002', nameEn: 'Bank', nameAr: 'بنك' },
    { id: 3, code: '003', nameEn: 'Bank Account', nameAr: 'حساب بنكي' },
  ];

  site.delayDiscountsTypes = [
    { id: 1, nameEn: 'Day', nameAr: 'يوم' },
    { id: 2, nameEn: 'Hour', nameAr: 'ساعة' },
    { id: 3, nameEn: 'Value', nameAr: 'مبلغ' },
  ];

  site.amountCategory = [
    { id: 1, nameEn: 'Administrative', nameAr: 'إداري' },
    { id: 2, nameEn: 'Financial', nameAr: 'مالي' },
  ];

  site.amountTypes = [
    { id: 1, nameEn: 'Hours', nameAr: 'ساعات' },
    { id: 2, nameEn: 'Days', nameAr: 'أيام' },
    { id: 3, nameEn: 'Percent', nameAr: 'نسبة' },
    { id: 4, nameEn: 'Value', nameAr: 'مبلغ' },
  ];

  site.doctorDeskTopTypes = [
    { id: 1, nameEn: 'Pending', nameAr: 'قيد الإنتظار' },
    { id: 2, nameEn: 'At doctor', nameAr: 'عند الطبيب' },
    { id: 3, nameEn: 'Detected', nameAr: 'تم الكشف' },
    { id: 4, nameEn: 'Cancel reservation', nameAr: 'إلغاء الحجز' },
  ];

  site.laboratoryDeskTopTypes = [
    { id: 1, nameEn: 'Pending', nameAr: 'قيد الإنتظار' },
    { id: 2, nameEn: 'Entrance laboratory', nameAr: 'دخول المعمل' },
    { id: 3, nameEn: 'Complete analysis', nameAr: 'إتمام التحليل' },
    { id: 4, nameEn: 'Put results', nameAr: 'وضع النتائج' },
    { id: 5, nameEn: 'Delivered', nameAr: 'تم التسليم' },
    { id: 6, nameEn: 'Cancel reservation', nameAr: 'إلغاء الحجز' },
  ];

  site.radiologyDeskTopTypes = [
    { id: 1, nameEn: 'Pending', nameAr: 'قيد الإنتظار' },
    { id: 2, nameEn: 'Entrance radiology', nameAr: 'دخول الأشعة' },
    { id: 3, nameEn: 'Complete radiology', nameAr: 'إتمام الأشعة' },
    { id: 4, nameEn: 'Put results', nameAr: 'وضع النتائج' },
    { id: 5, nameEn: 'Delivered', nameAr: 'تم التسليم' },
    { id: 6, nameEn: 'Cancel reservation', nameAr: 'إلغاء الحجز' },
  ];

  site.servicesTypeGroups = [
    { id: 1, code: 'S', nameEn: 'Service', nameAr: 'خدمة' },
    { id: 2, code: 'C', nameEn: 'Consultation', nameAr: 'إستشارة' },
    { id: 3, code: 'L', nameEn: 'Laboratory', nameAr: 'معمل' },
    { id: 4, code: 'X', nameEn: 'X-Ray', nameAr: 'أشعة' },
    { id: 5, code: 'M', nameEn: 'Medicine', nameAr: 'دواء' },
    { id: 6, code: 'T', nameEn: 'Therapy', nameAr: 'علاج' },
    { id: 8, code: 'E', nameEn: 'Emergency', nameAr: 'طوارئ' },
    { id: 9, code: 'K', nameEn: 'Kitchen', nameAr: 'مطبخ' },
    { id: 7, code: 'U', nameEn: 'Unknown', nameAr: 'مجهول' },
  ];

  site.itemsTypes = [
    { id: 1, code: '001', nameEn: 'Store Category', nameAr: 'صنف مخزني' },
    { id: 2, code: '002', nameEn: 'Service Class', nameAr: 'صنف خدمي' },
  ];

  site.purchaseOrdersSource = [
    { id: 1, code: '001', nameEn: 'Purchase Request', nameAr: 'طلب شراء' },
    { id: 2, code: '002', nameEn: 'Purchase Order / Invoice', nameAr: 'أمر شراء / فاتورة' },
  ];

  site.storesTransactionsTypes = [
    { id: 1, code: 'storesOpeningBalances', nameEn: 'Stores Opening Balances', nameAr: 'رصيد إفتتاحي' },
    { id: 2, code: 'purchaseOrders', nameEn: 'Purchase Order / Invoice', nameAr: 'أمر شراء / فاتورة' },
    { id: 3, code: 'salesInvoices', nameEn: 'Sales Invoice', nameAr: 'فاتورة بيع' },
    { id: 4, code: 'returnPurchaseOrders', nameEn: 'Return Purchase Orders', nameAr: 'مرتجع فاتورة شراء' },
    { id: 5, code: 'returnSalesInvoices', nameEn: 'Return Sales Invoices', nameAr: 'مرتجع فاتورة مبيعات' },
    { id: 6, code: 'transferItemsOrders', nameEn: 'Transfer Item Order', nameAr: 'أمر تحويل أصناف' },
    { id: 7, code: 'convertUnits', nameEn: 'Convert Units', nameAr: 'تحويل وحدات' },
    { id: 8, code: 'damageItems', nameEn: 'Damage Items', nameAr: 'إتلاف أصناف' },
    { id: 9, code: 'stockTaking', nameEn: 'Stocktaking', nameAr: 'جرد مخزني' },
  ];

  site.transferItemsOrdersSource = [
    { id: 1, code: '001', nameEn: 'Transfer Items Request', nameAr: 'طلب تحويل أصناف' },
    { id: 2, code: '002', nameEn: 'Transfer Items Order', nameAr: 'أمر تحويل أصناف' },
  ];

  site.vacationsTypes = [
    { id: 1, code: '001', nameEn: 'Regular', nameAr: 'إعتيادي' },
    { id: 2, code: '002', nameEn: 'Casual', nameAr: 'عارضة' },
    { id: 3, code: '003', nameEn: 'Without Salary', nameAr: 'بدون مرتب' },
    { id: 4, code: '004', nameEn: 'Rest Allowance', nameAr: 'بدل راحة' },
    { id: 5, code: '005', nameEn: 'Pilgrimage', nameAr: 'حج' },
    { id: 6, code: '006', nameEn: 'Sick', nameAr: 'مرضي' },
    { id: 7, code: '007', nameEn: 'Marriage', nameAr: 'زواج' },
    { id: 8, code: '008', nameEn: 'Paid', nameAr: 'مدفوعة الأجر' },
    { id: 9, code: '009', nameEn: 'Annual', nameAr: 'سنوية' },
    { id: 10, code: '010', nameEn: 'Exams', nameAr: 'إمتحانات' },
  ];

  site.workflowPositionsList = [
    { id: 1, code: '001', nameEn: 'CEO', nameAr: 'المدير التنفيذي' },
    { id: 2, code: '002', nameEn: 'Deputy CEO', nameAr: 'نائب المدير التنفيذي' },
    { id: 3, code: '003', nameEn: 'Financial Manager', nameAr: 'المدير المالي' },
    { id: 4, code: '004', nameEn: 'Deputy Financial Manager', nameAr: 'نائب المدير المالي' },
    { id: 5, code: '005', nameEn: 'HR Manager', nameAr: 'مدير الموارد البشرية' },
    { id: 6, code: '006', nameEn: 'Deputy HR Manager', nameAr: 'نائب مدير الموارد البشرية' },
  ];

  site.workflowScreensList = [
    { id: 1, code: 'employeesBonuses', nameEn: 'Employees Bonuses', nameAr: 'مكافات الموظفين' },
    { id: 2, code: 'employeesPenalties', nameEn: 'Employees Penalties', nameAr: 'جزاءات الموظفين' },
    { id: 3, code: 'overtimeRequests', nameEn: 'Overtime Requests', nameAr: 'طلبات الوقت الإضافي' },
    { id: 4, code: 'vacationsRequests', nameEn: 'Vacations Requests', nameAr: 'طلبات الأجازات' },
  ];

  site.printersTypes = [
    { id: 1, nameEn: 'Normal', nameAr: 'عادي' },
    { id: 2, nameEn: 'Thermal', nameAr: 'حراري' },
  ];

  site.countryQRList = [
    { id: 1, nameEn: 'KSA', nameAr: 'السعودية' },
    { id: 2, nameEn: 'KWT', nameAr: 'الكويت' },
    { id: 2, nameEn: 'BAH', nameAr: 'البحرين' },
    { id: 3, nameEn: 'OM', nameAr: 'سلطنة عمان' },
    { id: 4, nameEn: 'EGYPT', nameAr: 'مصر' },
  ];

  site.placeQRList = [
    { id: 1, nameEn: 'Online', nameAr: 'أونلاين' },
    { id: 2, nameEn: 'Local', nameAr: 'محلي' },
  ];

  site.thermalLangList = [
    { id: 1, nameEn: 'Arabic', nameAr: 'عربي' },
    { id: 2, nameEn: 'English', nameAr: 'إنجليزي' },
    { id: 3, nameEn: 'Depending on User language', nameAr: 'إعتمادا على لغة المستخدم' },
  ];

  site.post('/api/countryQRList', (req, res) => {
    res.json({
      done: true,
      list: site.countryQRList,
    });
  });

  site.post('/api/placeQRList', (req, res) => {
    res.json({
      done: true,
      list: site.placeQRList,
    });
  });

  site.post('/api/thermalLangList', (req, res) => {
    res.json({
      done: true,
      list: site.thermalLangList,
    });
  });

  site.post('/api/printersTypes', (req, res) => {
    res.json({
      done: true,
      list: site.printersTypes,
    });
  });

  site.post('/api/delayDiscountsTypes', (req, res) => {
    res.json({
      done: true,
      list: site.delayDiscountsTypes,
    });
  });

  site.post('/api/amountCategory', (req, res) => {
    res.json({
      done: true,
      list: site.amountCategory,
    });
  });

  site.post('/api/amountTypes', (req, res) => {
    res.json({
      done: true,
      list: site.amountTypes,
    });
  });

  site.post('/api/patientTypes', (req, res) => {
    res.json({
      done: true,
      list: site.patientTypes,
    });
  });

  site.post('/api/doctorTypes', (req, res) => {
    res.json({
      done: true,
      list: site.doctorTypes,
    });
  });

  site.post('/api/qualificationTypes', (req, res) => {
    res.json({
      done: true,
      list: site.qualificationTypes,
    });
  });

  site.post('/api/paymentTypes', (req, res) => {
    res.json({
      done: true,
      list: site.paymentTypes,
    });
  });

  site.post('/api/maritalStatus', (req, res) => {
    res.json({
      done: true,
      list: site.maritalStatus,
    });
  });

  site.post('/api/laboratoryDeskTopTypes', (req, res) => {
    res.json({
      done: true,
      list: site.laboratoryDeskTopTypes,
    });
  });

  site.post('/api/radiologyDeskTopTypes', (req, res) => {
    res.json({
      done: true,
      list: site.radiologyDeskTopTypes,
    });
  });

  site.post('/api/filesTypes', (req, res) => {
    res.json({
      done: true,
      list: site.filesTypes,
    });
  });

  site.post('/api/centersTypes', (req, res) => {
    res.json({
      done: true,
      list: site.centersTypes,
    });
  });

  site.post('/api/doctorDeskTopTypes', (req, res) => {
    res.json({
      done: true,
      list: site.doctorDeskTopTypes,
    });
  });

  site.post('/api/servicesTypeGroups', (req, res) => {
    res.json({
      done: true,
      list: site.servicesTypeGroups,
    });
  });

  site.post('/api/servicesOrdersSources', (req, res) => {
    res.json({
      done: true,
      list: site.servicesOrdersSources,
    });
  });

  site.post('/api/employeeStatus', (req, res) => {
    res.json({
      done: true,
      list: site.employeeStatus,
    });
  });

  site.post('/api/genders', (req, res) => {
    res.json({
      done: true,
      list: site.genders,
    });
  });

  site.post('/api/recipientPerson', (req, res) => {
    res.json({
      done: true,
      list: site.recipientPerson,
    });
  });

  site.post('/api/storesTypes', (req, res) => {
    res.json({
      done: true,
      list: site.storesTypes,
    });
  });

  site.post('/api/safesTypes', (req, res) => {
    res.json({
      done: true,
      list: site.safesTypes,
    });
  });

  site.post('/api/weekDays', (req, res) => {
    res.json({
      done: true,
      list: site.weekDays,
    });
  });

  site.post('/api/itemsTypes', (req, res) => {
    res.json({
      done: true,
      list: site.itemsTypes,
    });
  });
  site.post('/api/purchaseOrdersSource', (req, res) => {
    res.json({
      done: true,
      list: site.purchaseOrdersSource,
    });
  });

  site.post('/api/storesTransactionsTypes', (req, res) => {
    res.json({
      done: true,
      list: site.storesTransactionsTypes,
    });
  });

  site.post('/api/transferItemsOrdersSource', (req, res) => {
    res.json({
      done: true,
      list: site.transferItemsOrdersSource,
    });
  });
  site.post('/api/vacationsTypes', (req, res) => {
    res.json({
      done: true,
      list: site.vacationsTypes,
    });
  });
  site.post('/api/workflowPositionsList', (req, res) => {
    res.json({
      done: true,
      list: site.workflowPositionsList,
    });
  });
  site.post('/api/workflowScreensList', (req, res) => {
    res.json({
      done: true,
      list: site.workflowScreensList,
    });
  });
};
