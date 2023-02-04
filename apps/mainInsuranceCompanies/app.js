module.exports = function init(site) {
  let appIncuranceContract = site.getApp('insuranceContracts');
  let appServicesGroup = site.getApp('servicesGroups');
  let appServicesCategory = site.getApp('servicesCategories');
  let app = {
    name: 'mainInsuranceCompanies',
    allowMemory: true,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteAdd: true,
    allowRouteUpdate: true,
    allowRouteDelete: true,
    allowRouteView: true,
    allowRouteAll: true,
  };
  app.$collection = site.connectCollection(app.name);

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
      site.get({
        name: '/',
        path: __dirname + '/site_files/',
      });

      site.get(
        {
          name: app.name,
        },
        (req, res) => {
          res.render(app.name + '/index.html', { title: app.name }, { parser: 'html', compres: true });
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

        let numObj = {
          company: site.getCompany(req),
          screen: app.name,
          date: new Date(),
        };

        let cb = site.getNumbering(numObj);
        if (!_data.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;
        } else if (cb.auto) {
          _data.code = cb.code;
        }

        _data.addUserInfo = req.getUserFinger();

        app.add(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err.mesage;
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

        app.update(_data, (err, result) => {
          if (!err) {
            response.done = true;
            response.result = result;
          } else {
            response.error = err.message;
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

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let where = req.body.where || {};
        let select = req.body.select || { id: 1, code: 1, nameEn: 1, nameAr: 1, image: 1 };
        let list = [];
        app.memoryList
          .filter((g) => g.company && g.company.id == site.getCompany(req).id)
          .forEach((doc) => {
            let obj = { ...doc };

            for (const p in obj) {
              if (!Object.hasOwnProperty.call(select, p)) {
                delete obj[p];
              }
            }
            if (!where.active || doc.active) {
              list.push(obj);
            }
          });
        res.json({
          done: true,
          list: list,
        });
      });
    }
  }

  site.post({ name: `/api/mainIncurances/fromSub`, require: { permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };
    let _data = req.data;
    let incuranceContract = appIncuranceContract.memoryList.find((_c) => _c.insuranceCompany.id == _data.insuranceCompany);
    if (incuranceContract) {
      if (new Date() >= new Date(incuranceContract.startDate) && new Date() <= new Date(incuranceContract.endDate)) {
        app.view({ id: incuranceContract.mainInsuranceCompany.id }, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err?.message || 'Not Exists';
          }
          res.json(response);
        });
      } else {
        response.error = "The insurance company's contract date is invalid";
        res.json(response);
      }
    } else {
      response.error = 'Not Exists';
      res.json(response);
    }
  });

  site.post({ name: `/api/serviceMainIncurance`, require: { permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    let mainIncurance = app.memoryList.find((_c) => _data.mainInsuranceCompany && _c.id == _data.mainInsuranceCompany.id);
    if (mainIncurance) {
      response.done = true;
      let foundService = false;
      let service = {};
      if (mainIncurance.coverageServicesList && mainIncurance.coverageServicesList.length > 0) {
        mainIncurance.coverageServicesList.forEach((_cService) => {
          if (_cService.id == _data.service.id) {
            _cService.incuranceClassesList.forEach((_iClass) => {
              if (_data.patientClass && _data.patientClass.id == _iClass.id) {
                foundService = true;
                service = {
                  id: _data.service.id,
                  nameAr: _data.service.nameAr,
                  nameEn: _data.service.nameEn,
                  price: 0,
                  discount: 0,
                  total: 0,
                  vat: 0,
                  pVat: 0,
                  comVat: 0,
                  needApproval: _cService.needApproval,
                };
              }
            });
          }
        });
      } if (!foundService && mainIncurance.coverageServicesGroupsList && mainIncurance.coverageServicesGroupsList.length > 0) {
        mainIncurance.coverageServicesGroupsList.forEach((_cGroup) => {
          if (!foundService && _cGroup.id == _data.service.serviceGroup.id) {
            _cGroup.incuranceClassesList.forEach((_iClass) => {
              if (_data.patientClass && _data.patientClass.id == _iClass.id) {
                service = {
                  id: _data.service.id,
                  nameAr: _data.service.nameAr,
                  nameEn: _data.service.nameEn,
                  price: 0,
                  discount: 0,
                  total: 0,
                  vat: 0,
                  pVat: 0,
                  comVat: 0,
                  needApproval: _cGroup.needApproval,
                };
                foundService = true;
              }
            });
          } else if (!foundService) {
            let group = appServicesGroup.memoryList.find((_c) => _c.id == _cGroup.id);
            if (group && group.servicesCategoriesList && group.servicesCategoriesList.length > 0) {
              group.servicesCategoriesList.forEach((_sCateGory) => {
                let category = appServicesCategory.memoryList.find((_c) => _c.id == _sCateGory.id);
                if (category && category.servicesList && category.servicesList.length > 0) {
                  category.servicesList.forEach((_s) => {
                    if (_s.id == _data.service.id) {
                      _cGroup.incuranceClassesList.forEach((_iClass) => {
                        if (_data.patientClass && _data.patientClass.id == _iClass.id) {
                          foundService = true;
                          service = {
                            id: _data.service.id,
                            nameAr: _data.service.nameAr,
                            nameEn: _data.service.nameEn,
                            price: 0,
                            discount: 0,
                            total: 0,
                            vat: 0,
                            pVat: 0,
                            comVat: 0,
                            needApproval: _cGroup.needApproval,
                          };
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        });
      } if (!foundService && mainIncurance.coverageServicesCategoriesList && mainIncurance.coverageServicesCategoriesList.length > 0) {
        mainIncurance.coverageServicesCategoriesList.forEach((_cCategory) => {
          let category = appServicesCategory.memoryList.find((_c) => _c.id == _cCategory.id);
          if (category && category.servicesList && category.servicesList.length > 0) {
            category.servicesList.forEach((_s) => {
              if (_s.id == _data.service.id) {
                _cCategory.incuranceClassesList.forEach((_iClass) => {
                  if (_data.patientClass && _data.patientClass.id == _iClass.id) {
                    foundService = true;
                    service = {
                      id: _data.service.id,
                      nameAr: _data.service.nameAr,
                      nameEn: _data.service.nameEn,
                      price: 0,
                      discount: 0,
                      total: 0,
                      vat: 0,
                      pVat: 0,
                      comVat: 0,
                      needApproval: _cCategory.needApproval,
                    };
                  }
                });
              }
            });
          }
        });
      } if (!foundService && mainIncurance.discountServicesList && mainIncurance.discountServicesList.length > 0) {
        mainIncurance.discountServicesList.forEach((_cService) => {
          if (_cService.id == _data.service.id) {
            foundService = true;
            service = {
              id: _data.service.id,
              nameAr: _data.service.nameAr,
              nameEn: _data.service.nameEn,
              coCode: _data.service.coCode,
              coName: _data.service.coName,
              vat: 0,
              pVat: 0,
              comVat: mainIncurance.vat,
            };

            if (_data.type == 'out') {
              if (_data.payment == 'cash') {
                service.price = _cService.cashOut;
                service.discount = _cService.cashOutDesk;
              } else if (_data.payment == 'credit') {
                service.price = _cService.creditOut;
                service.discount = _cService.creditOutDesk;
              }
            } else if (_data.type == 'in') {
              if (_data.payment == 'cash') {
                service.price = _cService.cashIn;
                service.discount = _cService.cashInDesk;
              } else if (_data.payment == 'credit') {
                service.price = _cService.creditIn;
                service.discount = _cService.creditInDesk;
              }
            }
            service.total = service.price - (service.price * service.discount) / 100;
          }
        });
      } if (!foundService && mainIncurance.discountServicesGroupsList && mainIncurance.discountServicesGroupsList.length > 0) {
        mainIncurance.discountServicesGroupsList.forEach((_cGroup) => {
          if (!foundService && _cGroup.id == _data.service.serviceGroup.id) {
            service = {
              id: _data.service.id,
              nameAr: _data.service.nameAr,
              nameEn: _data.service.nameEn,
              price: 0,
              discount: 0,
              total: 0,
              vat: 0,
              pVat: 0,
              comVat: mainIncurance.vat,
            };
            foundService = true;

            if (_data.type == 'out') {
              if (_data.payment == 'cash') {
                service.price = _data.service.cashPriceOut;
                service.discount = applyDiscOut ? _cGroup.cashOut : 0;
              } else if (_data.payment == 'credit') {
                service.price = _data.service.creditPriceOut;
                service.discount = applyDiscOut ? _cGroup.creditOut : 0;
              }
            } else if (_data.type == 'in') {
              if (_data.payment == 'cash') {
                service.price = _cGroup.cashPriceIn;
                service.discount = applyDiscIn ? _cGroup.cashIn : 0;
              } else if (_data.payment == 'credit') {
                service.price = _cGroup.creditPriceIn;
                service.discount = applyDiscIn ? _cGroup.creditIn : 0;
              }
            }
            service.total = service.price - (service.price * service.discount) / 100;
          } else if (!foundService) {
            let group = appServicesGroup.memoryList.find((_c) => _c.id == _cGroup.id);
            if (group && group.servicesCategoriesList && group.servicesCategoriesList.length > 0) {
              group.servicesCategoriesList.forEach((_sCateGory) => {
                let category = appServicesCategory.memoryList.find((_c) => _c.id == _sCateGory.id);
                if (category && category.servicesList && category.servicesList.length > 0) {
                  category.servicesList.forEach((_s) => {
                    if (_s.id == _data.service.id) {
                      foundService = true;
                      service = {
                        id: _data.service.id,
                        nameAr: _data.service.nameAr,
                        nameEn: _data.service.nameEn,
                        vat: 0,
                        pVat: 0,
                        comVat: mainIncurance.vat,
                      };

                      if (_data.type == 'out') {
                        if (_data.payment == 'cash') {
                          service.price = _data.service.cashPriceOut;
                          service.discount = applyDiscOut ? _cGroup.cashOut : 0;
                        } else if (_data.payment == 'credit') {
                          service.price = _data.service.creditPriceOut;
                          service.discount = applyDiscOut ? _cGroup.creditOut : 0;
                        }
                      } else if (_data.type == 'in') {
                        if (_data.payment == 'cash') {
                          service.price = _cGroup.cashPriceIn;
                          service.discount = applyDiscIn ? _cGroup.cashIn : 0;
                        } else if (_data.payment == 'credit') {
                          service.price = _cGroup.creditPriceIn;
                          service.discount = applyDiscIn ? _cGroup.creditIn : 0;
                        }
                      }
                      service.total = service.price - (service.price * service.discount) / 100;
                    }
                  });
                }
              });
            }
          }
        });
      } if (!foundService && mainIncurance.discountServicesCategoriesList && mainIncurance.discountServicesCategoriesList.length > 0) {
        mainIncurance.discountServicesCategoriesList.forEach((_cCategory) => {
          let category = appServicesCategory.memoryList.find((_c) => _c.id == _cCategory.id);
          if (category && category.servicesList && category.servicesList.length > 0) {
            category.servicesList.forEach((_s) => {
              if (_s.id == _data.service.id) {
                foundService = true;
                service = {
                  id: _data.service.id,
                  nameAr: _data.service.nameAr,
                  nameEn: _data.service.nameEn,
                  vat: 0,
                  pVat: 0,
                  comVat: mainIncurance.vat,
                };

                if (_data.type == 'out') {
                  if (_data.payment == 'cash') {
                    service.price = _data.service.cashPriceOut;
                    service.discount = applyDiscOut ? _cCategory.cashOut : 0;
                  } else if (_data.payment == 'credit') {
                    service.price = _data.service.creditPriceOut;
                    service.discount = applyDiscOut ? _cCategory.creditOut : 0;
                  }
                } else if (_data.type == 'in') {
                  if (_data.payment == 'cash') {
                    service.price = _cCategory.cashPriceIn;
                    service.discount = applyDiscIn ? _cCategory.cashIn : 0;
                  } else if (_data.payment == 'credit') {
                    service.price = _cCategory.creditPriceIn;
                    service.discount = applyDiscIn ? _cCategory.creditIn : 0;
                  }
                }
                service.total = service.price - (service.price * service.discount) / 100;
              }
            });
          }
        });
      }
      if (foundService) {
        response.done = true;
        response.doc = service;
      } else {
        response.error = 'Not Exists';
      }
      res.json(response);
    } else {
      response.error = 'Not Exists';
      res.json(response);
    }
  });

  app.init();
  site.addApp(app);
};
