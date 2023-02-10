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
        { id: 'S', nameEn: 'SINGLE', nameAr: 'أعزب' },
        { id: 'M', nameEn: 'MARRIED', nameAr: 'متزوج' },
        { id: 'D', nameEn: 'DIV', nameAr: 'أعزب' },
        { id: 'W', nameEn: 'WID', nameAr: 'أعزب' },
        { id: 'L', nameEn: 'Legally Separated', nameAr: 'مطلق' },
        { id: 'U', nameEn: 'Unknown', nameAr: 'مجهول' },
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
        { id: 'm', nameEn: 'Male', nameAr: 'ذكر' },
        { id: 'f', nameEn: 'Female', nameAr: 'أنثى' },
    ];

    site.storesTypes = [
        { id: 1, code: '001', nameEn: 'Main Store', nameAr: 'رئيسي' },
        { id: 2, code: '002', nameEn: 'Sub Store', nameAr: 'فرعي' },
    ];

    site.safesTypes = [
        { id: 1, code: '001', nameEn: 'Cash', nameAr: 'نقدي' },
        { id: 2, code: '002', nameEn: 'Bank', nameAr: 'بنك' },
        { id: 3, code: '003', nameEn: 'Bank Account', nameAr: 'حساب بنكي' },
    ];

    site.doctorDeskTopTypes = [
        { id: 1, nameEn: 'Pending', nameAr: 'قيد الإنتظار' },
        { id: 2, nameEn: 'At doctor', nameAr: 'عند الطبيب' },
        { id: 3, nameEn: 'Detected', nameAr: 'تم الكشف' },
        { id: 4, nameEn: 'Cancel detection', nameAr: 'إلغاء الكشف' },
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
        { id: 2, code: '002', nameEn: 'Order / Invoice', nameAr: 'أمر شراء / فاتورة' },
    ];

    site.storesTransactionsTypes = [
        { id: 1, code: '001', nameEn: 'Order / Invoice', nameAr: 'أمر شراء / فاتورة' },
        { id: 2, code: '002', nameEn: 'Sales Invoice', nameAr: 'فاتورة بيع' },
        { id: 3, code: '003', nameEn: 'Transfer Item Order', nameAr: 'أمر تحويل أصناف' },
    ];

    site.transferItemsOrdersSource = [
        { id: 1, code: '001', nameEn: 'Transfer Items Request', nameAr: 'طلب تحويل أصناف' },
        { id: 2, code: '002', nameEn: 'Transfer Items order', nameAr: 'أمر تحويل أصناف' },
    ];

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
};
