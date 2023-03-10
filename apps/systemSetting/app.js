module.exports = function init(site) {
  let app = {
    name: 'systemSetting',
    allowMemory: true,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteSave: true,
    allowRouteGetSetting: true,
  };
  let printerProgram = {
    invoiceHeader: [],
    invoiceHeader2: [],
    invoiceFooter: [],
    thermalHeader: [],
    thermalFooter: [],
  };
  site.setting = {
    printerProgram: printerProgram,
    storesSetting: {
      hasDefaultVendor: false,
      cannotExceedMaximumDiscount: false,
      allowOverdraft: false,
      defaultStore: {},
      idefaultItemType: {},
      idefaultItemGroup: {},
      defaultItemUnit: {},
      defaultVendor: {},
    },
    accountsSetting: {
      paymentType: {},
      currencySymbol: 'SR',
    },
    generalSystemSetting: {},
    hrSettings: {
      delay: 0,
      overtime: 0,
      penality: 0,
      absenceHours: 0,
      absenceDays: 0,
    },
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
    site.word({ name: '$', Ar: site.setting.accountsSetting.currencySymbol, En: site.setting.accountsSetting.currencySymbol });
  };

  site.getSystemSetting = function (req) {
    let company = site.getCompany(req);
    let branch = site.getBranch(req);

    // let setting = app.memoryList.find((s) => s.company.id == company.id && s.branch.id == branch.code);
    site.setting = app.memoryList.find((s) => s.company.id == company.id) || site.setting;
    // app.save(_data, (err, result) => {
    //     if (!err) {
    //         response.done = true;
    //         response.result = result;
    //     } else {
    //         response.error = err.message;
    //     }
    //     res.json(response);
    return site.setting;
    // });
  };

  app.save = function (_item, callback) {
    app.$collection.find({ where: { 'company.id': _item.company.id } }, (err, doc) => {
      if (!doc) {
        app.$collection.add(_item, (err, doc) => {
          if (callback) {
            callback(err, doc);
          }
          if (app.allowMemory && !err && doc) {
            app.memoryList.push(doc);
          }
          site.word({ name: '$', Ar: doc.accountsSetting.currencySymbol, En: doc.accountsSetting.currencySymbol });
        });
      } else {
        doc = { ...doc, ..._item };
        app.$collection.edit(doc, (err, result) => {
          if (callback) {
            callback(err, result);
          }
          if (result && result.doc) {
            site.word({ name: '$', Ar: result.doc.accountsSetting.currencySymbol, En: result.doc.accountsSetting.currencySymbol });
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
        });
      }
    });
  };

  if (app.allowRoute) {
    if (app.allowRouteGet) {
      site.get(
        {
          name: app.name,
        },
        (req, res) => {
          res.render(app.name + '/index.html', { title: app.name, appName: 'System Settings' }, { parser: 'html', compres: true });
        }
      );
    }

    if (app.allowRouteSave) {
      site.post({ name: `/api/${app.name}/save`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        _data.company = site.getCompany(req);
        _data.editUserInfo = req.getUserFinger();

        app.save(_data, (err, result) => {
          if (!err) {
            response.done = true;
            response.result = result;
            site.word({ name: '$', Ar: result.doc.accountsSetting.currencySymbol, En: result.doc.accountsSetting.currencySymbol });
          } else {
            response.error = err.message;
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteGetSetting) {
      site.post({ name: `/api/${app.name}/get`, public: true }, (req, res) => {
        site.setting = site.getSystemSetting(req);
        res.json({
          done: true,
          doc: site.setting,
        });
      });
    }
  }

  site.addZero = function (code, number) {
    let c = number - code.toString().length;
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString();
    }
    return code;
  };

  app.init();
  site.addApp(app);
};
