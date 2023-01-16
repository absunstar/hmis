module.exports = function init(site) {
  site.post('/api/patientType', (req, res) => {
    let list = [
      { id: 1, code : 'N', name: 'Normal',nameAr : 'عادي' },
      { id: 4, code : 'H', name: 'HIJ',nameAr : 'مركز الحجامة' },
      { id: 9, code : 'V', name: 'VIP PATIENT',nameAr : 'مميز' },
      { id: 10, code : 'G', name: 'GOVERMENT PATIENT',nameAr : 'مسئول' },
      { id: 11, code : 'T', name: 'TADAWI PROGRAM',nameAr : 'برامج تداوي' },
      { id: 12, code : '2', name: 'JESTRE JOYCE BALILA ILUSTRE',nameAr : 'J' },
      { id: 13, code : 'F', name: 'A',nameAr : 'فحص العمالة' },
      { id: 14, code : 'I', name: 'I',nameAr : 'I' },
      { id: 15, code : 'B', name: 'B',nameAr : 'B' },
      { id: 16, code : 'S', name: 'S',nameAr : 'Seha' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });

  site.post('/api/paymentType', (req, res) => {
    let list = [
      { id: 1, code : 001, name: 'CASH',nameAr : 'النقد' },
      { id: 2, code : 002, name: 'CHEQUE',nameAr : 'بالشيك' },
      { id: 3, code : 003, name: 'CREDIT CARD',nameAr : 'بطاقة أجلا' },
      { id: 4, code : 004, name: 'SPAN',nameAr : 'بطاقة سبان' },
      { id: 5, code : 005, name: 'BANK DEPOSIT',nameAr : 'إيداع بنكي' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });


  site.post('/api/maritalStatus', (req, res) => {
    let list = [
      { id: 'S', name: 'SINGLE' },
      { id: 'M', name: 'MARRIED' },
      { id: 'D', name: 'DIV' },
      { id: 'W', name: 'WID' },
      { id: 'L', name: 'Legally Separated' },
      { id: 'U', name: 'Unknown' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });

  site.post('/api/filesTypes', (req, res) => {
    let list = [
      { id: 1, name: 'Iqama' },
      { id: 2, name: 'Passport' },
      { id: 3, name: 'Contract' },
      { id: 4, name: 'Insurance' },
      { id: 5, name: 'ConsDocument' },
      { id: 6, name: 'InvesDocument' },
      { id: 7, name: 'Approvals' },
      { id: 8, name: 'LabDocument' },
      { id: 9, name: 'XRay' },
      { id: 10, name: 'CT-Scan' },
      { id: 11, name: 'Personal' },
      { id: 12, name: 'A4' },
      { id: 13, name: 'INPATIENT' },
      { id: 14, name: 'Fax' },
      { id: 15, name: 'Signature' },
      { id: 16, name: 'Letter' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });

  site.post('/api/costCenters', (req, res) => {
    let list = [
      { id: 1, code : 'O', name: 'Other' },
      { id: 2, code : 'P', name: 'Pharmacy' },
      { id: 3, code : 'C', name: 'Clinic' },
      { id: 4, code : 'T', name: 'Therapy' },
      { id: 5, code : 'E', name: 'Emergency' },
      { id: 6, code : 'X', name: 'X-Ray' },
      { id: 7, code : 'L', name: 'Laboratory' },
  
    ];

    res.json({
      done: true,
      list: list,
    });
  });
  
  site.post('/api/servicesTypeGroups', (req, res) => {
    let list = [
      { id: 1, code : 'S', name: 'Service' },
      { id: 2, code : 'C', name: 'Consultation' },
      { id: 3, code : 'L', name: 'Laboratory' },
      { id: 4, code : 'X', name: 'X-Ray' },
      { id: 5, code : 'M', name: 'Medicine' },
      { id: 6, code : 'T', name: 'Therapy' },
      { id: 7, code : 'U', name: 'Unknown' },
      { id: 8, code : 'E', name: 'Emergency' },
      { id: 9, code : 'K', name: 'Kitchen' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });

  site.post('/api/gender', (req, res) => {
    let list = [
      { id: 'm', name: 'Male' },
      { id: 'f', name: 'Female' },
    ];

    res.json({
      done: true,
      list: list,
    });
  });
};
