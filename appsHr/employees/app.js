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

    // site.getEmployeeWorkCost = function (employee) {
    //     let hourSalary = 0;
    //     let daySalary = 0;
    //     if (employee && employee.hourSalary) {
    //         hourSalary = employee.hourSalary;
    //     }
    //     if (employee && employee.daySalary) {
    //         daySalary = employee.daySalary;
    //     }

    //     return { hourSalary: site.toMoney(hourSalary), daySalary: site.toMoney(daySalary) };
    // };

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

    site.calculateEmployeePaySlipItems = function (data, callback) {
        let paySlip = {
            bonusValue: 0,
            bonusList: [],
            penalityValue: 0,
            penalityList: [],
            overtimeValue: 0,
            overtimeList: [],
            vacationsValue: 0,
            vacationsList: [],
            globalVacationsValue: 0,
            globalVacationsList: [],
            absentValue: 0,
            attendeesList: [],
        };
        paySlip = { ...paySlip, ...data };
        site.getEmployeeBounus(paySlip, (paySlip2) => {
            site.getEmployeePenalties(paySlip2, (paySlip3) => {
                site.getEmployeeOvertime(paySlip3, (paySlip4) => {
                    site.getEmployeeVacationsRequests(paySlip4, (paySlip5) => {
                        site.getEmployeeGlobalVacation(paySlip5, (paySlip6) => {
                            // console.log('paySlip6', paySlip6);
                            callback(paySlip6);
                        });
                    });
                });
            });
        });
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
                        const salary = site.calculateEmployeeBasicSalary(doc);
                        // const employeeWorkCost = site.getEmployeeWorkCost(doc);

                        const data = {
                            employeeId: doc.id,
                            basicSalary: salary.basicSalary,
                            daySalary: site.toMoney(doc.daySalary),
                            hourSalary: site.toMoney(doc.hourSalary),
                            fromDate: _data.fromDate,
                            toDate: _data.toDate,
                        };

                        site.calculateEmployeePaySlipItems(data, (result) => {
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

                            if (result.bonusList.length) {
                                const paySlipItem = {
                                    code: result.bonusList[0].appName,
                                    nameAr: 'مكافأت',
                                    nameEn: 'Bonus',
                                    list: result.bonusList,
                                    value: site.toMoney(result.bonusValue),
                                };

                                allowancesList.push(paySlipItem);
                            }

                            if (result.overtimeList.length) {
                                const paySlipItem = {
                                    code: result.overtimeList[0].appName,
                                    nameAr: 'إضافي',
                                    nameEn: 'Overtime',
                                    list: result.overtimeList,
                                    value: site.toMoney(result.overtimeValue),
                                };

                                allowancesList.push(paySlipItem);
                            }

                            if (result.penalityList.length) {
                                const paySlipItem = {
                                    code: result.penalityList[0].appName,
                                    nameAr: 'جزاء',
                                    nameEn: 'Penality',
                                    list: result.penalityList,
                                    value: site.toMoney(result.penalityValue),
                                };

                                deductionsList.push(paySlipItem);
                            }

                            if (result.vacationsList.length) {
                                const paySlipItem = {
                                    code: result.vacationsList[0].appName,
                                    nameAr: 'اجازة بدون راتب',
                                    nameEn: 'Vacation Without Salary',
                                    list: result.vacationsList,
                                    value: site.toMoney(result.vacationsValue),
                                };

                                deductionsList.push(paySlipItem);
                            }

                            if (result.globalVacationsList.length) {
                                const paySlipItem = {
                                    code: result.globalVacationsList[0].appName,
                                    nameAr: 'غياب اجازة مجمعة',
                                    nameEn: 'Global Vacations Absent',
                                    list: result.globalVacationsList,
                                    value: site.toMoney(result.globalVacationsValue),
                                };

                                deductionsList.push(paySlipItem);
                            }

                            // allowancesList.push({
                            //     code: result.bonus.category.code,
                            //     nameAr: result.bonus.category.nameAr,
                            //     nameEn: result.bonus.category.nameEn,
                            //     value: result.bonus.value,
                            // });

                            // deductionsList.push({
                            //     code: result.penality.category.code,
                            //     nameAr: result.penality.category.nameAr,
                            //     nameEn: result.penality.category.nameEn,
                            //     value: result.penality.value,
                            // });

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

                            response.doc = { originalSalary, basicSalary, allowancesList, deductionsList, totalAllowance, totalDeductions };

                            res.json(response);
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
