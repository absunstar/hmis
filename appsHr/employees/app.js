module.exports = function init(site) {
    let app = {
        name: 'employees',
        allowMemory: false,
        memoryList: [],
        allowCache: false,
        cacheList: [],
        allowRoute: true,
        allowRouteGet: true,
        allowRouteGetEmployeeVacationBalance: true,
        allowPaySlip: true,
        allowRouteAdd: true,
        allowRouteUpdate: true,
        allowRouteDelete: true,
        allowRouteView: true,
        allowRouteAll: true,
    };

    app.$collection = site.connectCollection(app.name);
    // app.$collection = site.connectCollection('users_info');

    site.calculatePaySlipAllownce = function (item, basicSalary) {
        const allowance = { id: item.allowance.id, code: item.allowance.code, nameAr: item.allowance.nameAr, nameEn: item.allowance.nameEn, value: 0 };

        if (item.type == 'percent') {
            allowance.value = (item.value / 100) * basicSalary;
        } else {
            allowance.value = item.value;
        }

        return allowance;
    };

    site.calculatePaySlipDeduction = function (item, basicSalary) {
        const deduction = { id: item.deduction.id, code: item.deduction.code, nameAr: item.deduction.nameAr, nameEn: item.deduction.nameEn, value: 0 };

        if (item.type == 'percent') {
            deduction.value = (item.value / 100) * basicSalary;
        } else {
            deduction.value = item.value;
        }

        return deduction;
    };

    site.calculateValue = function (doc) {
        let value = 0;
        if (doc && doc.type) {
            if (doc.type.id === 1) {
                value = doc.value * doc.hourSalary;
            }
            if (doc.type.id === 2) {
                value = doc.value * doc.daySalary;
            }
            if (doc.type.id === 3) {
                value = (doc.basicSalary / 100) * doc.value;
            }
            if (doc.type.id === 4) {
                value = doc.value;
            }
        }

        return { category: doc.category, type: doc.type, value: site.toMoney(value) };
    };

    site.calculateEmployeeBasicSalary = function (employeeDoc) {
        const originalSalary = site.toMoney(employeeDoc.basicSalary);
        let basicSalary = employeeDoc.basicSalary;
        let housingAllownce = 0;
        if (employeeDoc.allowancesList && employeeDoc.allowancesList.length) {
            employeeDoc.allowancesList.forEach((doc) => {
                if (doc.allowance && doc.allowance.addToBasicSalary) {
                    housingAllownce = doc.value;
                }
            });
        }

        const insurceCalculatedPercent = employeeDoc.totalSubscriptionsEmployee / 100;
        const netSalary = Math.abs(basicSalary * insurceCalculatedPercent - basicSalary);
        const housingAfterInsurce = Math.abs(housingAllownce * insurceCalculatedPercent - housingAllownce);

        return { originalSalary, basicSalary: site.toMoney(netSalary), housingAllowance: site.toMoney(housingAfterInsurce), netSalary: site.toMoney(netSalary + housingAfterInsurce) };
    };

    site.getEmployeePaySlipData = function (req, data, callback) {
        let paySlip = {
            bonusValue: 0,
            bonusList: [],
            // جزاءات
            penalityValue: 0,
            penalityCount: 0,
            penalityList: [],
            overtimeValue: 0,
            overtimeList: [],
            vacationsValue: 0,
            vacationsRequestsDataList: [],
            globalVacationsValue: 0,
            globalVacationsDataList: [],
            // absentHours: 0,
            // absentDays: 0,

            delayValue: 0,
            delayRequestsDataList: [],
            // اذن تأخير
            delayRequestsList: [],
            // مامورية
            workErrandValue: 0,
            workErrandDataList: [],
            attendanceDataList: [],
            // تأخير
            absentHoursCount: 0,
            absentHoursValue: 0,
            absentHoursList: [],
            //غياب بدون اذن
            absentDaysCount: 0,
            absentDaysValue: 0,
            absentDaysList: [],
            // اجازة بدون راتب
            unpaidVacationsCount: 0,
            unpaidVacationsValue: 0,
            unpaidVacationsList: [],
        };
        paySlip = { ...paySlip, ...data };
        console.log('hour', paySlip.hourSalary);
        console.log('day', paySlip.daySalary);
        console.log('minute', paySlip.minuteSalary);

        site.getEmployeeBounus(paySlip, (paySlip2) => {
            site.getEmployeePenalties(req, paySlip2, (paySlip3) => {
                site.getEmployeeOvertime(req, paySlip3, (paySlip4) => {
                    site.getEmployeeGlobalVacation(paySlip4, (paySlip5) => {
                        site.getEmployeeVacationsRequests(paySlip5, (paySlip6) => {
                            site.getEmployeeDelayRequest(paySlip6, (paySlip7) => {
                                site.getEmployeeWorkErrandRequests(paySlip7, (paySlip8) => {
                                    site.getEmployeeAttendance(paySlip8, (paySlip9) => {
                                        // console.log('hours', paySlip9.absentHoursList.length);
                                        app.calculateEmployeePaySlipItems(req, paySlip9, (finalPaySlip) => {
                                            callback(finalPaySlip);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    app.calculateEmployeePaySlipItems = function (req, paySlip, callback) {
        const systemSetting = site.getSystemSetting(req).hrSettings;


        let calculateSalaryValues;
        if ((paySlip.shiftApproved && paySlip.useSystemSetting) || !paySlip.shiftApproved || !paySlip.useSystemSetting) {
            calculateSalaryValues = { ...systemSetting, ...paySlip.penaltiesList };
        } else {
            calculateSalaryValues = { ...paySlip.salaryAccountSettings, ...paySlip.penaltiesList };
        }

        // console.log('calculateSalaryValues', calculateSalaryValues);

        //    useSystemSetting: shiftDoc.useSystemSetting,
        //    salaryAccountSettings,
        // console.log('leng', paySlip.attendanceDataList[0]);
        // console.log('length', paySlip.attendanceDataList.length);

        paySlip.attendanceDataList.forEach((_att) => {
            // console.log('_att', _att);
            // console.log('_att.attendanceTimeDifference', _att.attendanceTimeDifference);
            // console.log('_att.leaveTimeDifference', _att.leaveTimeDifference);
            if (_att) {
                const globalVacationIndex = paySlip.globalVacationsDataList.findIndex((globalVacation) => new Date(globalVacation.date).getTime() == new Date(_att.date).getTime());
                const vacationRequestIndex = paySlip.vacationsRequestsDataList.findIndex((vacationRequest) => new Date(vacationRequest.date).getTime() == new Date(_att.date).getTime());
                const delayRequestIndex = paySlip.delayRequestsDataList.findIndex((delayRequest) => new Date(delayRequest.date).getTime() == new Date(_att.date).getTime());
                const workErrandIndex = paySlip.workErrandDataList.findIndex((workErrand) => new Date(workErrand.date).getTime() == new Date(_att.date).getTime());
                const vacationType = paySlip.globalVacationsDataList[globalVacationIndex] || paySlip.vacationsRequestsDataList[vacationRequestIndex];
                const delayType = paySlip.workErrandDataList[workErrandIndex] || paySlip.delayRequestsDataList[delayRequestIndex];

                // console.log('globalVacationIndex', globalVacationIndex, vacationRequestIndex);
                // console.log('_att.absence', _att.absence);

                if (_att.absence) {
                    let absentDay = {
                        // appName: _att.appName,
                        date: _att.date,
                        count: 0,
                        value: 0,
                        source: {},
                    };

                    if (globalVacationIndex != -1 || vacationRequestIndex != -1) {
                        absentDay.count = 1;
                        absentDay.value = 0;
                        absentDay.source = vacationType.vacationName || vacationType.approvedVacationType;
                        if (vacationType?.approvedVacationType && vacationType.approvedVacationType.id === 3) {
                            paySlip.unpaidVacationsCount += absentDay.count;
                            paySlip.unpaidVacationsValue += absentDay.value;
                            paySlip.unpaidVacationsList.push(absentDay);
                        } else {
                            // console.log('absentDay.source', absentDay.source);

                            paySlip.absentDaysCount += absentDay.count;
                            paySlip.absentDaysValue += absentDay.value;
                            paySlip.absentDaysList.push(absentDay);
                        }
                    } else {
                        absentDay.count = 1;
                        absentDay.value = calculateSalaryValues.absenceDays * paySlip.daySalary;
                        paySlip.absentDaysCount += absentDay.count;
                        paySlip.absentDaysValue += absentDay.value;
                        absentDay.source = { nameAr: 'غياب', nameEn: 'Absence' };
                    }
                    paySlip.absentDaysList.push(absentDay);
                    // absentCount * systemSetting.absenceHours * (paySlip.hourSalary / 60);
                    // موجود طلب اجازة رقم 3

                    /// old
                    // if (globalVacationIndex != -1 || vacationRequestIndex != -1) {
                    //     // console.log('vacationType', vacationType);
                    //     let absentCount = 0;
                    //     let absentValue = 0;
                    //     absentDay = {
                    //         appName: _att.appName,
                    //         date: _att.date,
                    //     };

                    //     if (vacationType.approvedVacationType && vacationType.approvedVacationType.id === 3) {
                    //         absentCount = 1;
                    //         absentValue = paySlip.daySalary;
                    //         absentDay['count'] = absentCount;
                    //         absentDay['value'] = absentValue;
                    //         paySlip.unpaidVacationsCount += absentCount;
                    //         paySlip.unpaidVacationsValue += absentValue;
                    //         paySlip.unpaidVacationsList.push(absentDay);
                    //     } else {
                    //         absentCount = 1;
                    //         absentValue = 0;
                    //         absentDay['count'] = absentCount;
                    //         absentDay['value'] = absentValue;
                    //         paySlip.absentDaysCount += absentCount;
                    //         paySlip.absentDaysValue += absentValue;
                    //         paySlip.absentDaysList.push(absentDay);
                    //     }
                    // } else if (globalVacationIndex == -1 || vacationRequestIndex == -1 || vacationType.approvedVacationType.id != 3) {
                    //     absentDay = {
                    //         appName: _att.appName,
                    //         date: _att.date,
                    //     };
                    //     absentCount = 1;
                    //     absentValue = systemSetting.absenceDays * paySlip.daySalary;
                    //     absentDay['count'] = absentCount;
                    //     absentDay['value'] = absentValue;
                    //     paySlip.absentDaysCount += absentCount;
                    //     paySlip.absentDaysValue += absentValue;
                    //     paySlip.absentDaysList.push(absentDay);
                    // }
                }

                if (!_att.absence) {
                    let absentHourObj = {
                        date: _att.date,
                        from: '',
                        to: '',
                        count: 0,
                        value: 0,
                        source: {},
                    };

                    // console.log('_att.attendanceTimeDifference', _att.attendanceTimeDifference);
                    // console.log('_att.leaveTimeDifference', _att.leaveTimeDifference);
                    // console.log('absentHourObj.count', absentHourObj.count);

                    // if (workErrandIndex != -1 || delayRequestIndex != -1) {
                    //     absentHourObj.from = _att.attendTime;
                    //     absentHourObj.to = _att.leaveTime;
                    //     absentHourObj.count = 0;
                    //     paySlip.absentHoursValue += 0;
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }

                    // if (workErrandIndex != -1 || delayRequestIndex != -1) {

                    // console.log('_att', _att);
                    if (_att.leaveTimeDifference < 0) {
                        const earlyCount = Math.abs(_att.leaveTimeDifference) - (delayType?.allwedTime || 0);
                        absentHourObj.from = _att.shiftEnd;
                        absentHourObj.to = _att.leaveTime;
                        if (workErrandIndex != -1) {
                            absentHourObj.source = { nameAr: 'مأمورية', nameEn: 'Work Errand' };
                            absentHourObj.from = delayType.fromTime;
                            absentHourObj.count = 0;
                        } else if (delayRequestIndex != -1) {
                            absentHourObj.source = { nameAr: 'إذن', nameEn: 'Delay Request' };
                            absentHourObj.from = delayType.fromTime;
                            absentHourObj.count = 0;
                        } else {
                            absentHourObj.source = { nameAr: 'إنصراف مبكر', nameEn: 'Early Leave' };
                            absentHourObj.count = Math.abs(earlyCount);
                        }
                        absentHourObj.value = site.toMoney(absentHourObj.count * calculateSalaryValues.absenceHours * paySlip.minuteSalary);
                    }

                    if (_att.attendanceTimeDifference < 0) {
                        const delayCount = Math.abs(_att.attendanceTimeDifference) - (delayType?.allwedTime || 0);
                        absentHourObj.from = _att.shiftStart;
                        absentHourObj.to = _att.attendTime;
                        if (workErrandIndex != -1) {
                            absentHourObj.source = { nameAr: 'مأمورية', nameEn: 'Work Errand' };
                            absentHourObj.from = delayType.toTime;
                            absentHourObj.count = 0;
                        } else if (delayRequestIndex != -1) {
                            absentHourObj.source = { nameAr: 'إذن', nameEn: 'Delay Request' };
                            absentHourObj.from = delayType.toTime;
                            absentHourObj.count = 0;
                        } else {
                            absentHourObj.source = { nameAr: 'حضور متأخر', nameEn: 'Delay Attendane' };
                            absentHourObj.count = Math.abs(delayCount);
                        }
                        absentHourObj.value = site.toMoney(absentHourObj.count * calculateSalaryValues.absenceHours * paySlip.minuteSalary);
                    }

                    paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    paySlip.absentHoursValue += site.toMoney(absentHourObj.value);
                    paySlip.absentHoursList.push(absentHourObj);

                    // }

                    // if (delayRequestIndex == -1) {
                    // }

                    // if (_att.attendanceTimeDifference < 0) {
                    //     // console.log('attendanceTimeDifference delayCount', delayCount);

                    //     if (workErrandIndex != -1) {
                    //         const delayCount = Math.abs(_att.attendanceTimeDifference) - delayType.allwedDelaytime;
                    //         absentHourObj.from = _att.attendTime;
                    //         absentHourObj.to = _att.leaveTime;
                    //         absentHourObj.count = Math.abs(_att.attendanceTimeDifference);
                    //         absentHourObj.value = absentHourObj.count > delayType.allwedDelaytime ? delayCount : 0;
                    //         absentHourObj.source = { nameAr: 'مأمورية', nameEn: 'Work Errand' };
                    //         absentHourObj.value = site.toMoney(absentHourObj.count * calculateSalaryValues.absenceHours * paySlip.minuteSalary);
                    //     } else if (delayRequestIndex != -1) {
                    //         absentHourObj.source = { nameAr: 'إذن', nameEn: 'Delay Request' };
                    //     } else {
                    //         absentHourObj.from = _att.shiftStart;
                    //         absentHourObj.to = _att.attendTime;
                    //         absentHourObj.source = { nameAr: 'حضور متأخر', nameEn: 'Delay Attendane' };
                    //         // absentHourObj.count = Math.abs(_att.attendanceTimeDifference);
                    //         absentHourObj.value = site.toMoney(absentHourObj.count * calculateSalaryValues.absenceHours * paySlip.minuteSalary);
                    //     }

                    //     // console.log('attendanceTimeDifference calc count', absentHourObj.count);
                    //     // console.log('attendanceTimeDifference calc value', absentHourObj.value);

                    //     paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    //     paySlip.absentHoursValue += site.toMoney(absentHourObj.value);
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }

                    // absentHourObj = { ...absentHourObj };
                    // if (_att.leaveTimeDifference < 0) {
                    //     console.log('delayType', delayType);

                    // console.log('leaveTimeDifference delayCount', delayCount);

                    // if (workErrandIndex != -1) {
                    //     const delayCount = Math.abs(_att.leaveTimeDifference - delayType.allwedDelaytime);
                    //     absentHourObj.from = _att.leaveTime;
                    //     absentHourObj.to = _att.shiftEnd;
                    //     absentHourObj.count = Math.abs(_att.leaveTimeDifference);
                    //     absentHourObj.value = absentHourObj.count > delayType.allwedDelaytime ? delayCount : 0;
                    //     absentHourObj.source = { nameAr: 'مأمورية', nameEn: 'Work Errand' };
                    // } else if (delayRequestIndex != -1) {
                    //     absentHourObj.source = { nameAr: 'إذن', nameEn: 'Delay Request' };
                    // } else {
                    //     absentHourObj.from = _att.shiftStart;
                    //     absentHourObj.to = _att.attendTime;
                    //     absentHourObj.source = { nameAr: 'انصراف مبكر', nameEn: 'Early Leave' };
                    //     // absentHourObj.count = Math.abs(_att.attendanceTimeDifference);
                    // }
                    //     absentHourObj.value = site.toMoney(delayCount * calculateSalaryValues.absenceHours * paySlip.minuteSalary);

                    //     console.log('leaveTimeDifference calc count', absentHourObj.count);
                    //     console.log('leaveTimeDifference calc value', absentHourObj.value);

                    //     paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    //     paySlip.absentHoursValue += site.toMoney(absentHourObj.value);
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }

                    // else {
                    //     absentHourObj.from = _att.attendTime;
                    //     absentHourObj.to = _att.leaveTime;
                    //     absentHourObj.count = Math.abs(_att.attendanceTimeDifference);
                    //     paySlip.absentHoursValue += 0;
                    //     paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }
                    // absentHourObj = { ...absentHourObj };

                    // if (_att.leaveTimeDifference < 0 && (workErrandIndex == -1 || delayRequestIndex == -1)) {
                    //     absentHourObj.from = _att.leaveTime;
                    //     absentHourObj.to = _att.shiftEnd;
                    //     absentHourObj.source = { nameAr: 'إنصراف مبكر', nameEn: 'Leave Early' };
                    //     absentHourObj.count = Math.abs(_att.leaveTimeDifference);
                    //     absentHourObj.value = site.toMoney(absentHourObj.count * calculateSalaryValues.absenceHours * paySlip.hourSalary);
                    //     paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    //     paySlip.absentHoursValue += site.toMoney(absentHourObj.value);
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // } else {
                    //     absentHourObj.from = _att.attendTime;
                    //     absentHourObj.to = _att.leaveTime;
                    //     absentHourObj.count = Math.abs(_att.leaveTimeDifference);
                    //     paySlip.absentHoursValue += 0;
                    //     paySlip.absentHoursCount += site.toNumber(absentHourObj.count);
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }

                    // console.log('11111', new Date(shiftStartTime), new Date(attendTime));
                    // console.log('diffAttend', diffAttend);
                    // console.log('diffLeave', diffLeave);
                    // console.log('shiftTime', shiftTime);
                    // console.log('allowdDelayMiniutes', allowdDelayMiniutes);
                    // console.log('allowdLeaveMiniutes', allowdLeaveMiniutes);
                    // console.log('attendanceTimeDifference', attendanceTimeDifference);
                    // console.log('leaveTimeDifference', leaveTimeDifference);

                    // absentHourObj.count = site.toNumber((shiftTime - allowdDelayMiniutes || allowdLeaveMiniutes) / 60);
                    // absentHourObj.from = _att.attendTime;
                    // absentHourObj.to = _att.leaveTime;

                    // absentHourObj.value = site.toMoney(absentHourObj.count * systemSetting.absenceHours * paySlip.hourSalary);
                    //
                    // paySlip.absentHoursValue += site.toMoney(absentHourObj.value);
                    // paySlip.absentHoursList.push(absentHourObj);

                    /// old
                    // if (_att.attendanceTimeDifference < 0 || _att.leaveTimeDifference > 0) {
                    //     let absentHourObj;
                    //     let absentCount = 0;
                    //     let absentValue = 0;

                    //     if (workErrandIndex != -1 || delayRequestIndex != -1) {
                    //         const attendTime = new Date(_att.attendTime).getTime();
                    //         const allowedTimeAttend = new Date(delayType.toTime).getTime();
                    //         const allowdDelayMiniutes = (attendTime - allowedTimeAttend) / 1000 / 60;

                    //         if (attendTime <= allowedTimeAttend) {
                    //             absentHourObj = {
                    //                 appName: _att.appName,
                    //                 date: _att.date,
                    //                 from: delayType.fromTime,
                    //                 to: delayType.toTime,
                    //             };
                    //         } else {
                    //             absentHourObj = {
                    //                 appName: _att.appName,
                    //                 date: _att.date,
                    //                 from: delayType.fromTime,
                    //                 to: _att.attendTime,
                    //             };
                    //         }
                    //         absentCount = Math.abs(_att.attendanceTimeDifference) - allowdDelayMiniutes;
                    //         absentValue = absentCount * systemSetting.absenceHours * (paySlip.hourSalary / 60);
                    //         absentHourObj['count'] = site.toNumber(absentCount / 60);
                    //         absentHourObj['value'] = absentValue;
                    //     } else {
                    //         if (_att.leaveTimeDifference > 0) {
                    //             absentHourObj = {
                    //                 appName: _att.appName,
                    //                 date: _att.date,
                    //                 from: _att.attendTime,
                    //                 to: _att.leaveTime,
                    //             };
                    //             absentCount = _att.leaveTimeDifference;
                    //             absentValue = absentCount * systemSetting.absenceHours * (paySlip.hourSalary / 60);
                    //             absentHourObj['count'] = site.toNumber(absentCount / 60);
                    //             absentHourObj['value'] = absentValue;
                    //         } else {
                    //             absentHourObj = {
                    //                 appName: _att.appName,
                    //                 date: _att.date,
                    //                 from: _att.attendTime,
                    //                 to: _att.leaveTime,
                    //             };
                    //             absentCount = Math.abs(_att.attendanceTimeDifference);
                    //             absentValue = absentCount * systemSetting.absenceHours * (paySlip.hourSalary / 60);

                    //             absentHourObj['count'] = site.toNumber(absentCount / 60);
                    //             absentHourObj['value'] = absentValue;
                    //         }
                    //     }
                    //     paySlip.absentHoursCount += site.toNumber(absentCount / 60);
                    //     paySlip.absentHoursValue += absentValue;
                    //     paySlip.absentHoursList.push(absentHourObj);
                    // }
                }
            }
        });
        callback(paySlip);
    };
    app.init = function () {
        if (app.allowMemory) {
            app.$collection.findMany({}, (err, docs) => {
                if (!err) {
                    if (docs.length == 0) {
                        app.cacheList.forEach((_item, i) => {
                            app.$collection.add(_item, (err, doc) => {
                                if (!err && doc) {
                                    app.memoryList.push(doc);
                                }
                            });
                        });
                    } else {
                        docs.forEach((doc) => {
                            app.memoryList.push(doc);
                        });
                    }
                }
            });
        }
    };
    app.add = function (_item, callback) {
        app.$collection.add(_item, (err, doc) => {
            if (callback) {
                callback(err, doc);
            }

            if (app.allowMemory && !err && doc) {
                app.memoryList.push(doc);
            }
        });
    };
    app.update = function (_item, callback) {
        app.$collection.edit(
            {
                where: {
                    id: _item.id,
                },
                set: _item,
            },
            (err, result) => {
                if (callback) {
                    callback(err, result);
                }
                if (app.allowMemory && !err && result) {
                    let index = app.memoryList.findIndex((itm) => itm.id === result.doc.id);
                    if (index !== -1) {
                        app.memoryList[index] = result.doc;
                    } else {
                        app.memoryList.push(result.doc);
                    }
                } else if (app.allowCache && !err && result) {
                    let index = app.cacheList.findIndex((itm) => itm.id === result.doc.id);
                    if (index !== -1) {
                        app.cacheList[index] = result.doc;
                    } else {
                        app.cacheList.push(result.doc);
                    }
                }
            }
        );
    };
    app.delete = function (_item, callback) {
        app.$collection.delete(
            {
                id: _item.id,
            },
            (err, result) => {
                if (callback) {
                    callback(err, result);
                }
                if (app.allowMemory && !err && result.count === 1) {
                    let index = app.memoryList.findIndex((a) => a.id === _item.id);
                    if (index !== -1) {
                        app.memoryList.splice(index, 1);
                    }
                } else if (app.allowCache && !err && result.count === 1) {
                    let index = app.cacheList.findIndex((a) => a.id === _item.id);
                    if (index !== -1) {
                        app.cacheList.splice(index, 1);
                    }
                }
            }
        );
    };
    app.view = function (_item, callback) {
        if (callback) {
            if (app.allowMemory) {
                if ((item = app.memoryList.find((itm) => itm.id == _item.id))) {
                    callback(null, item);
                    return;
                }
            } else if (app.allowCache) {
                if ((item = app.cacheList.find((itm) => itm.id == _item.id))) {
                    callback(null, item);
                    return;
                }
            }

            app.$collection.find({ id: _item.id }, (err, doc) => {
                callback(err, doc);

                if (!err && doc) {
                    if (app.allowMemory) {
                        app.memoryList.push(doc);
                    } else if (app.allowCache) {
                        app.cacheList.push(doc);
                    }
                }
            });
        }
    };

    app.all = function (_options, callback) {
        if (callback) {
            if (app.allowMemory) {
                callback(null, app.memoryList);
            } else {
                app.$collection.findMany(_options, callback);
            }
        }
    };

    if (app.allowRoute) {
        if (app.allowRouteGet) {
            site.get(
                {
                    name: app.name,
                },
                (req, res) => {
                    res.render(app.name + '/index.html', { title: app.name, appName: 'Employees' }, { parser: 'html', compres: true });
                }
            );
        }

        if (app.allowRouteAdd) {
            site.post({ name: `/api/${app.name}/add`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };
                let _data = req.data;
                _data.company = site.getCompany(req);
                _data.branch = site.getBranch(req);
                _data.branchList = [
                    {
                        company: _data.company,
                        branch: _data.branch,
                    },
                ];
                let numObj = {
                    company: site.getCompany(req),
                    screen: app.name,
                    date: new Date(),
                };

                _data.roles = [
                    {
                        moduleName: 'public',
                        name: 'employeePermissions',
                        En: 'Employee Permissions',
                        Ar: 'صلاحيات الموظف',
                    },
                ];

                if (_data.mobileList.length > 0) {
                    _data.mobile = _data.mobileList[0].mobile;
                } else {
                    response.error = 'Must Add Mobile Number';
                    res.json(response);
                    return;
                }

                let cb = site.getNumbering(numObj);
                if (!_data.code && !cb.auto) {
                    response.error = 'Must Enter Code';
                    res.json(response);
                    return;
                } else if (cb.auto) {
                    _data.code = cb.code;
                }

                _data.addUserInfo = req.getUserFinger();
                // _data.type = { id: 3, name: 'Employee' };

                if (!_data.email) {
                    _data.email = _data.nameEn + Math.floor(Math.random() * 1000 + 1).toString();
                }

                app.add(_data, (err, doc) => {
                    if (!err && doc) {
                        response.done = true;
                        response.doc = doc;
                    } else {
                        response.error = err?.message || 'Add Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteUpdate) {
            site.post({ name: `/api/${app.name}/update`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                _data.editUserInfo = req.getUserFinger();

                if (_data.mobileList.length > 0) {
                    _data.mobile = _data.mobileList[0].mobile;
                } else {
                    response.error = 'Must Add Mobile Number';
                    res.json(response);
                    return;
                }

                app.update(_data, (err, result) => {
                    if (!err) {
                        response.done = true;
                        response.result = result;
                    } else {
                        response.error = err?.message || 'Update Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteDelete) {
            site.post({ name: `/api/${app.name}/delete`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };
                let _data = req.data;

                app.delete(_data, (err, result) => {
                    if (!err && result.count === 1) {
                        response.done = true;
                        response.result = result;
                    } else {
                        response.error = err?.message || 'Deleted Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteView) {
            site.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                app.view(_data, (err, doc) => {
                    if (!err && doc) {
                        response.done = true;
                        response.doc = doc;
                    } else {
                        response.error = err?.message || 'Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteGetEmployeeVacationBalance) {
            site.post({ name: `/api/${app.name}/getEmployeeVacationBalance`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;

                if (!_data.id) {
                    response.done = false;
                    response.error = 'Please Select Employee';
                    res.json(response);
                    return;
                }

                app.$collection.find({ id: _data.id }, (err, doc) => {
                    if (doc) {
                        const regularVacations = doc.regularVacations || 0;
                        const casualVacations = doc.casualVacations || 0;

                        response.done = true;
                        response.doc = { regularVacations, casualVacations };

                        res.json(response);
                    }
                });
            });
        }
        if (app.allowPaySlip) {
            site.post({ name: `/api/${app.name}/calculatePaySlip`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;

                if (!_data.employee) {
                    response.done = false;
                    response.error = 'Please Select Employee';
                    res.json(response);
                    return;
                }

                app.$collection.find({ id: _data.employee.id, active: true }, (err, doc) => {
                    if (doc) {
                        const jobShiftApp = site.getApp('jobsShifts');
                        jobShiftApp.$collection.find({ where: { id: doc.shift.id } }, (err, shiftDoc) => {
                            const salary = site.calculateEmployeeBasicSalary(doc);
                            // const employeeWorkCost = site.getEmployeeWorkCost(doc);
                            const startDate = site.toDate(_data.fromDate);
                            const endDate = site.toDate(_data.toDate);
                            const diffTime = Math.abs(endDate - startDate) + 1;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const realWorkTimesList = [];
                            for (let i = 0; i < diffDays; i++) {
                                let date = new Date(_data.fromDate);
                                let day = new Date(date).getDate() + i;
                                date.setDate(day);
                                const dayIndex = date.getDay();

                                let shiftData = shiftDoc.worktimesList.find((w) => w.active && w.day && w.day.index == dayIndex);

                                if (shiftData) {
                                    shiftData.start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), shiftData.start.getHours(), shiftData.start.getMinutes());
                                    shiftData.end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), shiftData.end.getHours(), shiftData.end.getMinutes());
                                    realWorkTimesList.push({ date, day, dayIndex, shiftData });
                                }
                            }

                            let salaryAccountSettings;
                            if (shiftDoc.useSystemSetting) {
                                salaryAccountSettings = shiftDoc.salaryAccountSettings;
                            }

                            const data = {
                                employeeId: doc.id,
                                basicSalary: salary.basicSalary,
                                daySalary: site.toMoney(doc.daySalary),
                                hourSalary: site.toMoney(doc.hourSalary),
                                minuteSalary: site.toMoney(doc.hourSalary / 60),
                                fromDate: _data.fromDate,
                                toDate: _data.toDate,
                                realWorkTimesList,
                                penaltiesList: shiftDoc.penaltiesList,
                                useSystemSetting: shiftDoc.useSystemSetting,
                                shiftApproved: shiftDoc.approved,
                                salaryAccountSettings,
                            };

                            site.getEmployeePaySlipData(req, data, (result) => {
                                // console.log('result', result);

                                const allowancesList = [];
                                const deductionsList = [];
                                const basicSalary = salary.basicSalary;
                                const originalSalary = salary.originalSalary;

                                let totalAllowance = 0;
                                let totalDeductions = 0;
                                doc.allowancesList.forEach((_elm) => {
                                    if (_elm && _elm.active && !_elm.allowance.addToBasicSalary) {
                                        const allowance = site.calculatePaySlipAllownce(_elm, basicSalary);
                                        totalAllowance += allowance.value;
                                        allowancesList.push(allowance);
                                    } else if (_elm.allowance.addToBasicSalary) {
                                        allowancesList.push({
                                            id: _elm.allowance.id,
                                            code: _elm.allowance.code,
                                            nameAr: _elm.allowance.nameAr,
                                            nameEn: _elm.allowance.nameEn,
                                            addToBasicSalary: _elm.allowance.addToBasicSalary,
                                            value: salary.housingAllowance,
                                            originalValue: _elm.value,
                                        });
                                    }
                                });

                                doc.deductionsList.forEach((_elm) => {
                                    if (_elm && _elm.active) {
                                        const deuction = site.calculatePaySlipDeduction(_elm, basicSalary);
                                        deductionsList.push(deuction);
                                    }
                                });

                                if (result.bonusList && result.bonusList.length) {
                                    const paySlipItem = {
                                        code: result.bonusList[0].appName,
                                        nameAr: 'مكافأت',
                                        nameEn: 'Bonus',
                                        list: result.bonusList,
                                        value: site.toMoney(result.bonusValue),
                                    };

                                    allowancesList.push(paySlipItem);
                                }

                                if (result.overtimeList && result.overtimeList.length) {
                                    const paySlipItem = {
                                        code: result.overtimeList[0].appName,
                                        nameAr: 'إضافي',
                                        nameEn: 'Overtime',
                                        list: result.overtimeList,
                                        value: site.toMoney(result.overtimeValue),
                                    };

                                    allowancesList.push(paySlipItem);
                                }

                                if (result.penalityList && result.penalityList.length) {
                                    const paySlipItem = {
                                        code: result.penalityList[0].appName,
                                        nameAr: 'جزاء',
                                        nameEn: 'Penality',
                                        list: result.penalityList,
                                        count: result.penalityCount,
                                        value: site.toMoney(result.penalityValue),
                                    };

                                    deductionsList.push(paySlipItem);
                                }

                                if (result.unpaidVacationsList && result.unpaidVacationsList.length) {
                                    const paySlipItem = {
                                        code: 'unpaidVacations',
                                        nameAr: 'اجازة بدون راتب',
                                        nameEn: 'Vacation Without Salary',
                                        list: result.unpaidVacationsList,
                                        count: result.unpaidVacationsCount,
                                        value: site.toMoney(result.unpaidVacationsValue),
                                    };

                                    deductionsList.push(paySlipItem);
                                }

                                if (result.absentDaysList && result.absentDaysList.length) {
                                    const paySlipItem = {
                                        code: 'absentDays',
                                        nameAr: 'أيام الغياب',
                                        nameEn: 'Absent Days',
                                        list: result.absentDaysList,
                                        count: result.absentDaysCount,
                                        value: site.toMoney(result.absentDaysValue),
                                    };

                                    deductionsList.push(paySlipItem);
                                }

                                if (result.absentHoursList && result.absentHoursList.length) {
                                    const paySlipItem = {
                                        code: 'absentHours',
                                        nameAr: 'دقائق الغياب',
                                        nameEn: 'Absent Minutes',
                                        list: result.absentHoursList,
                                        count: result.absentHoursCount,
                                        value: site.toMoney(result.absentHoursValue),
                                    };

                                    deductionsList.push(paySlipItem);
                                }

                                allowancesList.forEach((_elm) => {
                                    if (!_elm.addToBasicSalary) {
                                        totalAllowance += _elm.value;
                                    }
                                });

                                deductionsList.forEach((_elm) => {
                                    totalDeductions += _elm.value;
                                });

                                response.done = true;
                                totalAllowance += salary.netSalary;

                                response.doc = {
                                    originalSalary,
                                    basicSalary,
                                    allowancesList,
                                    deductionsList,
                                    totalAllowance: site.toMoney(totalAllowance),
                                    totalDeductions: site.toMoney(totalDeductions),
                                };

                                res.json(response);
                            });
                        });
                    }
                });
            });
        }

        if (app.allowRouteAll) {
            site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
                let where = req.body.where || {};
                let search = req.body.search || '';
                let limit = req.body.limit || 10;
                let select = req.body.select || {
                    id: 1,
                    code: 1,
                    fullNameEn: 1,
                    fullNameAr: 1,
                    mobile: 1,
                    image: 1,
                    active: 1,
                };

                if (search) {
                    where.$or = [];

                    where.$or.push({
                        id: site.get_RegExp(search, 'i'),
                    });

                    where.$or.push({
                        code: site.get_RegExp(search, 'i'),
                    });

                    where.$or.push({
                        fullNameAr: site.get_RegExp(search, 'i'),
                    });

                    where.$or.push({
                        fullNameEn: site.get_RegExp(search, 'i'),
                    });
                }

                if (app.allowMemory) {
                    if (!search) {
                        search = 'id';
                    }
                    let list = app.memoryList
                        .filter((g) => g.company && g.company.id == site.getCompany(req).id && (!where.active || g.active === where.active) && JSON.stringify(g).contains(search))
                        .slice(0, limit);

                    res.json({
                        done: true,
                        list: list,
                    });
                } else {
                    where['company.id'] = site.getCompany(req).id;

                    app.all({ where, select, limit }, (err, docs) => {
                        res.json({
                            done: true,
                            list: docs,
                        });
                    });
                }
            });
        }
    }

    app.init();
    site.addApp(app);
};
