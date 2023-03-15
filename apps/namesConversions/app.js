module.exports = function init(site) {
  let app = {
    name: 'namesConversions',
    allowMemory: false,
    memoryList: [],
    allowCache: true,
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
      site.get(
        {
          name: app.name,
        },
        (req, res) => {
          res.render(app.name + '/index.html', { title: app.name, appName: 'Names Conversions' }, { parser: 'html', compres: true });
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;

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
        let select = req.body.select || { id: 1, nameEn: 1, nameAr: 1 };
        let list = [];
        if (app.allowMemory) {
          app.memoryList.forEach((doc) => {
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
        } else {
          if (where.name) {
            where.$or = [
              {
                nameEn: site.get_RegExp(where.name, 'i'),
              },
              {
                nameAr: site.get_RegExp(where.name, 'i'),
              },
            ];

            delete where.name;
          }
          app.$collection.findMany({ select, where, limit: 500 }, (err, docs) => {
            res.json({
              done: true,
              list: docs,
            });
          });
        }
      });
    }

    site.post({ name: `/api/${app.name}/changeName`, public: true }, (req, res) => {
      let select = { nameEn: 1, nameAr: 1 };
      let objNames = req.body.names || {};
      let type = req.body.type || {};
      let where = {};
      if (objNames) {
        // where.$or = [
        //   {
        //     nameEn: site.get_RegExp(objNames.fullNameEn, 'i'),
        //   },
        //   {
        //     nameAr: site.get_RegExp(objNames.fullNameAr, 'i'),
        //   },

        //   {
        //     nameEn: site.get_RegExp(objNames.nameEn, 'i'),
        //   },
        //   {
        //     nameAr: site.get_RegExp(objNames.nameAr, 'i'),
        //   },

        //   {
        //     nameEn: site.get_RegExp(objNames.parentNameEn, 'i'),
        //   },
        //   {
        //     nameAr: site.get_RegExp(objNames.parentNameAr, 'i'),
        //   },

        //   {
        //     nameEn: site.get_RegExp(objNames.grantFatherNameEn, 'i'),
        //   },
        //   {
        //     nameAr: site.get_RegExp(objNames.grantFatherNameAr, 'i'),
        //   },

        //   {
        //     nameEn: site.get_RegExp(objNames.familyNameEn, 'i'),
        //   },
        //   {
        //     nameAr: site.get_RegExp(objNames.familyNameAr, 'i'),
        //   },
        // ];

        where.$or = [];
        if (objNames.fullNameEn) {
          where.$or.push({
            nameEn: objNames.fullNameEn,
          });
        }
        if (objNames.fullNameAr) {
          where.$or.push({
            nameAr: objNames.fullNameAr,
          });
        }

        if (objNames.nameEn) {
          where.$or.push({
            nameEn: objNames.nameEn,
          });
        }
        if (objNames.nameAr) {
          where.$or.push({
            nameAr: objNames.nameAr,
          });
        }

        if (objNames.parentNameEn) {
          where.$or.push({
            nameEn: objNames.parentNameEn,
          });
        }
        if (objNames.parentNameAr) {
          where.$or.push({
            nameAr: objNames.parentNameAr,
          });
        }

        if (objNames.grantFatherNameEn) {
          where.$or.push({
            nameEn: objNames.grantFatherNameEn,
          });
        }
        if (objNames.grantFatherNameAr) {
          where.$or.push({
            nameAr: objNames.grantFatherNameAr,
          });
        }

        if (objNames.familyNameEn) {
          where.$or.push({
            nameEn: objNames.familyNameEn,
          });
        }
        if (objNames.familyNameAr) {
          where.$or.push({
            nameAr: objNames.familyNameAr,
          });
        }
      }

      app.all({ select, where, limit: 1000 }, (err, docs) => {
        for (let i = 0; i < docs.length; i++) {
          let n = docs[i];

          if (type == 'nameEn' && objNames.nameEn && objNames.nameEn.contains(n.nameEn)) {
            objNames.nameAr = n.nameAr;
            objNames.nameEn = n.nameEn;
            site.changeFullName(objNames, n, 0);
          } else if (type == 'nameAr' && objNames.nameAr && objNames.nameAr.contains(n.nameAr)) {
            objNames.nameEn = n.nameEn;
            objNames.nameAr = n.nameAr;
            site.changeFullName(objNames, n, 0);
          } else if (type == 'parentNameAr' && objNames.parentNameAr && objNames.parentNameAr.contains(n.nameAr)) {
            objNames.parentNameAr = n.nameAr;
            objNames.parentNameEn = n.nameEn;
            site.changeFullName(objNames, n, 1);
          } else if (type == 'parentNameEn' && objNames.parentNameEn && objNames.parentNameEn.contains(n.nameEn)) {
            objNames.parentNameEn = n.nameEn;
            objNames.parentNameAr = n.nameAr;
            site.changeFullName(objNames, n, 1);
          } else if (type == 'grantFatherNameEn' && objNames.grantFatherNameEn && objNames.grantFatherNameEn.contains(n.nameEn)) {
            objNames.grantFatherNameEn = n.nameEn;
            objNames.grantFatherNameAr = n.nameAr;
            site.changeFullName(objNames, n, 2);
          } else if (type == 'grantFatherNameAr' && objNames.grantFatherNameAr && objNames.grantFatherNameAr.contains(n.nameAr)) {
            objNames.grantFatherNameAr = n.nameAr;
            objNames.grantFatherNameEn = n.nameEn;
            site.changeFullName(objNames, n, 2);
          } else if (type == 'familyNameEn' && objNames.familyNameEn && objNames.familyNameEn.contains(n.nameEn)) {
            objNames.familyNameEn = n.nameEn;
            objNames.familyNameAr = n.nameAr;
            site.changeFullName(objNames, n, 3);
          } else if (type == 'familyNameAr' && objNames.familyNameAr && objNames.familyNameAr.contains(n.nameAr)) {
            objNames.familyNameAr = n.nameAr;
            objNames.familyNameEn = n.nameEn;
            site.changeFullName(objNames, n, 3);
          } else if (type == 'fullNameEn' && objNames.fullNameEn && objNames.fullNameEn.contains(n.nameEn)) {
            if (objNames.fullNameEn.split(/\s+/)[0] && objNames.fullNameEn.split(/\s+/)[0].contains(n.nameEn)) {
              objNames.fullNameEn = objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[0], n.nameEn);
              objNames.fullNameAr = objNames.fullNameAr && objNames.fullNameAr.split(/\s+/)[0] ? objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[0], n.nameAr) : n.nameAr;
              objNames.nameEn = n.nameEn;
              objNames.nameAr = n.nameAr;
            }
            if (objNames.fullNameEn.split(/\s+/)[1] && objNames.fullNameEn.split(/\s+/)[1].contains(n.nameEn)) {
              objNames.fullNameEn = objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[1], n.nameEn);
              objNames.fullNameAr =
                objNames.fullNameAr && objNames.fullNameAr.split(/\s+/)[1] ? objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[1], n.nameAr) : objNames.fullNameAr + ' ' + n.nameAr;
              objNames.parentNameEn = n.nameEn;
              objNames.parentNameAr = n.nameAr;
            }
            if (objNames.fullNameEn.split(/\s+/)[2] && objNames.fullNameEn.split(/\s+/)[2].contains(n.nameEn)) {
              objNames.fullNameEn = objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[2], n.nameEn);
              objNames.fullNameAr =
                objNames.fullNameAr && objNames.fullNameAr.split(/\s+/)[2] ? objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[2], n.nameAr) : objNames.fullNameAr + ' ' + n.nameAr;
              objNames.grantFatherNameEn = n.nameEn;
              objNames.grantFatherNameAr = n.nameAr;
            }
            if (objNames.fullNameEn.split(/\s+/)[3] && objNames.fullNameEn.split(/\s+/)[3].contains(n.nameEn)) {
              objNames.fullNameEn = objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[3], n.nameEn);
              objNames.fullNameAr =
                objNames.fullNameAr && objNames.fullNameAr.split(/\s+/)[3] ? objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[3], n.nameEn) : objNames.fullNameAr + ' ' + n.nameAr;
              objNames.familyNameEn = n.nameEn;
              objNames.familyNameAr = n.nameAr;
            }
          } else if (type == 'fullNameAr' && objNames.fullNameAr && objNames.fullNameAr.contains(n.nameAr)) {
            if (objNames.fullNameAr.split(/\s+/)[0] && objNames.fullNameAr.split(/\s+/)[0].contains(n.nameAr)) {
              objNames.fullNameAr = objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[0], n.nameAr);
              objNames.fullNameEn = objNames.fullNameEn && objNames.fullNameEn.split(/\s+/)[0] ? objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[0], n.nameEn) : n.nameEn;
              objNames.nameEn = n.nameEn;
              objNames.nameAr = n.nameAr;
            }
            if (objNames.fullNameAr.split(/\s+/)[1] && objNames.fullNameAr.split(/\s+/)[1].contains(n.nameAr)) {
              objNames.fullNameAr = objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[1], n.nameAr);
              objNames.fullNameEn =
                objNames.fullNameEn && objNames.fullNameEn.split(/\s+/)[1] ? objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[1], n.nameEn) : objNames.fullNameEn + ' ' + n.nameEn;
              objNames.parentNameEn = n.nameEn;
              objNames.parentNameAr = n.nameAr;
            }
            if (objNames.fullNameAr.split(/\s+/)[2] && objNames.fullNameAr.split(/\s+/)[2].contains(n.nameAr)) {
              objNames.fullNameAr = objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[2], n.nameAr);
              objNames.fullNameEn =
                objNames.fullNameEn && objNames.fullNameEn.split(/\s+/)[2] ? objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[2], n.nameEn) : objNames.fullNameEn + ' ' + n.nameEn;
              objNames.grantFatherNameEn = n.nameEn;
              objNames.grantFatherNameAr = n.nameAr;
            }
            if (objNames.fullNameAr.split(/\s+/)[3] && objNames.fullNameAr.split(/\s+/)[3].contains(n.nameAr)) {
              objNames.fullNameAr = objNames.fullNameAr.replace(objNames.fullNameAr.split(/\s+/)[3], n.nameAr);
              objNames.fullNameEn =
                objNames.fullNameEn && objNames.fullNameEn.split(/\s+/)[3] ? objNames.fullNameEn.replace(objNames.fullNameEn.split(/\s+/)[3], n.nameEn) : objNames.fullNameEn + ' ' + n.nameEn;
              objNames.familyNameEn = n.nameEn;
              objNames.familyNameAr = n.nameAr;
            }
          }
        }
        res.json({
          done: true,
          doc: objNames,
        });
      });
    });

    site.changeFullName = function (item, n, i) {
      if (item.fullNameAr && item.fullNameAr.split(/\s+/)[i]) {
        item.fullNameAr = item.fullNameAr.replace(item.fullNameAr.split(/\s+/)[i], n.nameAr);
      } else {
        item.fullNameAr = !item.fullNameAr ? n.nameAr : item.fullNameAr + ' ' + n.nameAr;
      }
      if (item.fullNameEn && item.fullNameEn.split(/\s+/)[i]) {
        item.fullNameEn = item.fullNameEn.replace(item.fullNameEn.split(/\s+/)[i], n.nameEn);
      } else {
        item.fullNameEn = !item.fullNameEn ? n.nameEn : item.fullNameEn + ' ' + n.nameEn;
      }
    };

    site.post(`api/${app.name}/import`, (req, res) => {
      let response = {
        done: false,
        file: req.form.files.fileToUpload,
      };

      if (site.isFileExistsSync(response.file.filepath)) {
        let docs = [];
        if (response.file.originalFilename.like('*.xls*')) {
          let workbook = site.XLSX.readFile(response.file.filepath);
          docs = site.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
          docs = site.fromJson(site.readFileSync(response.file.filepath).toString());
        }

        if (Array.isArray(docs)) {
          console.log('Importing Array Count : ' + docs.length);
          docs.forEach((doc) => {
            let newDoc = {
              nameAr: doc.ArbName,
              nameEn: doc.EngName,
            };
            newDoc.company = site.getCompany(req);
            newDoc.branch = site.getBranch(req);
            newDoc.addUserInfo = req.getUserFinger();

            app.$collection.add(newDoc, (err, doc2) => {
              if (!err && doc2) {
                site.dbMessage = 'import doc id : ' + doc2.id;
                console.log(site.dbMessage);
              } else {
                site.dbMessage = err.message;
                console.log(site.dbMessage);
              }
            });
          });
        } else {
          site.dbMessage = 'can not import unknown type : ' + site.typeof(docs);
          console.log(site.dbMessage);
        }
      } else {
        site.dbMessage = 'file not exists : ' + response.file.filepath;
        console.log(site.dbMessage);
      }

      res.json(response);
    });
  }

  app.init();
  site.addApp(app);
};
