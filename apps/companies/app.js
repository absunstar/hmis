module.exports = function init(site) {
  const $companies = site.connectCollection('companies');

  site.defaultCompany = {
    nameAr: 'الشركة الرئيسية',
    nameEn: 'Main Company',
    host: 'company.com',
    username: 'admin@company.com',
    password: 'admin',
    image: '/imags/company.png',
    active: true,
    branchList: [
      {
        code: 1,
        nameAr: 'الفرع الرئيسى',
        nameEn: 'Main Branch',
        charge: [{}],
      },
    ],
  };

  // site.onGET('/api/languages/ar-sa', (req, res) => {
  //   site.words.addList(site.dir + '/site_files/json/words-sa.json', true);

  //   res.json({
  //     done: true,
  //   });
  // });

  $companies.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.defaultCompany = doc;
    } else {
      $companies.add(site.defaultCompany, (err, doc) => {
        if (!err && doc) {
          site.defaultCompany = doc;
          site.call('[company][created]', doc);

          site.call('please add user', {
            is_company: true,
            company_id: doc.id,
            email: doc.username,
            password: doc.password,
            roles: [
              {
                name: 'companiesAdmin',
              },
            ],
            branchList: [
              {
                company: doc,
                branch: doc.branchList[0],
              },
            ],
            profile: {
              nameAr: doc.nameAr,
              nameEn: doc.nameEn,
              image: doc.image,
            },
          });
        }
      });
    }
  });

  // site.on('[register][company][add]', doc => {

  //   $companies.add({
  //     nameAr: doc.name,
  //     branchList: [{
  //       code: 1,
  //       nameAr: "فرع" + " " + doc.name
  //     }],
  //     active: true,
  //     username: doc.username,
  //     password: doc.password,
  //     image: doc.image
  //   }, (err, doc) => {
  //     if (!err && doc) {
  //       site.call('[company][created]', doc)

  //       site.call('please add user', {
  //         is_company: true,
  //         email: doc.username,
  //         password: doc.password,
  //         roles: [{
  //           name: "companies_admin"
  //         }],
  //         branchList: [{
  //           company: doc,
  //           branch: doc.branchList[0]
  //         }],
  //         company_id: doc.id,
  //         profile: {
  //           name: doc.nameAr,
  //           image: doc.image
  //         }
  //       })
  //     }
  //   })
  // })

  site.getCompany = function (req) {
    let company = req.session.company;
    return company || site.defaultCompany;
  };

  site.get_branch = function (req) {
    let branch = req.session.branch;
    return branch || site.defaultCompany.branchList[0];
  };

  site.post({
    name: '/api/posting/all',
    path: __dirname + '/site_files/json/posting.json',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    public: true,
  });

  site.get({
    name: 'companies',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.validateEmail = function (email) {
    let re = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return re.test(email);
  };

  site.validatePassword = function (password) {
    let re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
    return re.test(password);
  };

  site.post('/api/companies/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response)
    //   return
    // }

    let companies_doc = req.body;
    companies_doc.$req = req;
    companies_doc.$res = res;

    companies_doc.company = site.getCompany(req);
    companies_doc.branch = site.get_branch(req);

    if (!companies_doc.code) companies_doc.code = companies_doc.nameEn + '-' + '1';

    if (companies_doc.branchList.length > companies_doc.branch_count) {
      response.error = 'You have exceeded the maximum number of Branches';
      res.json(response);
      return;
    } else {
      if (site.feature('erp')) companies_doc.feature = 'erp';
      else if (site.feature('pos')) companies_doc.feature = 'pos';
      else if (site.feature('ecommerce')) companies_doc.feature = 'ecommerce';
      else if (site.feature('restaurant')) companies_doc.feature = 'restaurant';
      else if (site.feature('school')) companies_doc.feature = 'school';
      else if (site.feature('club')) companies_doc.feature = 'club';
      else if (site.feature('academy')) companies_doc.feature = 'academy';
      else if (site.feature('lawyer')) companies_doc.feature = 'lawyer';
      else if (site.feature('employee')) companies_doc.feature = 'employee';
      else if (site.feature('medical')) companies_doc.feature = 'medical';

      let user_exist = {
        email: undefined,
        password: undefined,
      };

      if (companies_doc.username && companies_doc.password) {
        // if(!site.validatePassword(companies_doc.password)) {
        //   response.error = 'Must be not less than 8 characters or numbers and must contain at least one character capital, one number and one special character'
        //   res.json(response)
        //   return;
        // }

        if (companies_doc.username.includes('@') && !companies_doc.username.includes('.')) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        } else if (!companies_doc.username.includes('@') && companies_doc.username.includes('.')) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        }

        if (!companies_doc.host.includes('.')) {
          response.error = 'Host must be typed correctly';
          res.json(response);
          return;
        }

        let exist_domain = companies_doc.username.includes('@');
        if (!exist_domain) {
          companies_doc.username = companies_doc.username + '@' + companies_doc.host;
        }

        if (!site.validateEmail(companies_doc.username)) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        }

        if (companies_doc.username) {
          user_exist = {
            email: companies_doc.username,
            password: companies_doc.password,
          };
        }
      }

      site.security.isUserExists(user_exist, function (err, user_found) {
        if (user_found) {
          response.error = 'User Is Exist';
          res.json(response);
          return;
        }

        $companies.findMany(
          {
            where: {
              feature: companies_doc.feature,

              $or: [{ nameAr: companies_doc.nameAr }, { nameEn: companies_doc.nameEn }, { host: companies_doc.host }, { username: companies_doc.username }],
            },
          },
          (err, docs) => {
            if (!err && docs && docs.length > 0) {
              let exist_nameAr = false;
              let exist_nameEn = false;
              let exist_host = false;
              let exist_username = false;
              docs.forEach((_docs) => {
                if (_docs.nameAr == companies_doc.nameAr) exist_nameAr = true;
                else if (_docs.nameEn == companies_doc.nameEn) exist_nameEn = true;
                else if (_docs.host == companies_doc.host) exist_host = true;
                else if (_docs.username == companies_doc.username) exist_username = true;
              });

              if (exist_nameAr) {
                response.error = 'Arabic Name Is Exists';
                res.json(response);
                return;
              } else if (exist_nameEn) {
                response.error = 'English Name Is Exists';
                res.json(response);
                return;
              } else if (exist_host) {
                response.error = 'Host Name Is Exists';
                res.json(response);
                return;
              } else if (exist_username) {
                response.error = 'User Name Is Exists';
                res.json(response);
                return;
              }
            } else {
              $companies.add(companies_doc, (err, doc) => {
                if (!err) {
                  response.done = true;
                  response.doc = doc;
                  let user = {
                    is_company: true,
                    company_id: doc.id,
                    email: doc.username,
                    password: doc.password,
                    ref_info: { id: companies_doc.id },
                    roles: [
                      {
                        name: 'companies_admin',
                      },
                    ],
                    branchList: [
                      {
                        company: doc,
                        branch: doc.branchList[0],
                      },
                    ],
                    profile: {
                      nameAr: doc.nameAr,
                      nameEn: doc.nameEn,
                      mobile: doc.mobile,
                      image: companies_doc.image,
                    },
                  };
                  site.security.isUserExists(user, function (err, user_found) {
                    if (user_found) {
                      response.error = 'User Is Exist';
                      res.json(response);
                      return;
                    }

                    site.security.addUser(user, (err, userDoc) => {
                      if (!err) {
                        delete user._id;
                        delete user.id;
                        doc.user_info = {
                          id: userDoc.id,
                        };
                        $companies.update(doc);
                        site.call('[company][created]', doc);
                      }
                      res.json(response);
                    });
                  });

                  // site.call(
                  //   '[user][add]',
                  //   {
                  //     is_company: true,
                  //     company_id: doc.id,
                  //     email: doc.username,
                  //     password: doc.password,
                  //     roles: [
                  //       {
                  //         name: 'companies_admin',
                  //       },
                  //     ],
                  //     branchList: [
                  //       {
                  //         company: doc,
                  //         branch: doc.branchList[0],
                  //       },
                  //     ],
                  //     profile: {
                  //       nameAr: doc.nameAr,
                  //       nameEn: doc.nameEn,
                  //       mobile: doc.mobile,
                  //       image: companies_doc.image,
                  //     },
                  //   },
                  //   (err, user_doc) => {
                  //     if (!err && user_doc) {
                  //       doc.user_info = { id: user_doc.id };
                  //       $companies.update(doc);
                  //       site.call('[company][created]', doc);
                  //     }
                  //   }
                  // );
                } else {
                  response.error = err.message;
                  res.json(response);
                }
              });
            }
          }
        );
      });
    }
  });

  site.post('/api/companies/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let companies_doc = req.body;

    if (companies_doc.id) {
      if (companies_doc.branchList.length > companies_doc.branch_count) {
        response.error = 'You have exceeded the maximum number of Branches';
        res.json(response);
      } else {
        let user_exist = {
          email: undefined,
          password: undefined,
        };

        if (companies_doc.username && companies_doc.password) {
          if (companies_doc.username.includes('@') && !companies_doc.username.includes('.')) {
            response.error = 'Username must be typed correctly';
            res.json(response);
            return;
          } else if (!companies_doc.username.includes('@') && companies_doc.username.includes('.')) {
            response.error = 'Username must be typed correctly';
            res.json(response);
            return;
          }

          if (!companies_doc.host.includes('.')) {
            response.error = 'Host must be typed correctly';
            res.json(response);
            return;
          }

          let exist_domain = companies_doc.username.includes('@');
          if (!exist_domain) {
            companies_doc.username = companies_doc.username + '@' + companies_doc.host;
          }

          if (companies_doc.username)
            user_exist = {
              email: companies_doc.username,
              password: companies_doc.password,
            };
        }

        site.security.getUsers({}, (err, usersDocs, count) => {
          if (!err) {
            user_found = false;
            for (let i = 0; i < usersDocs.length; i++) {
              let u = usersDocs[i];
              if (u.email === companies_doc.username && u.company_id != companies_doc.id) {
                user_found = true;
              }
            }

            if (user_found) {
              response.error = 'User Is Exist';
              res.json(response);
              return;
            }
          }

          $companies.update(
            {
              where: {
                id: companies_doc.id,
              },
              set: companies_doc,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;
                response.doc = result.doc;

                let branchList = [];
                companies_doc.branchList.forEach((b) => {
                  branchList.push({
                    company: companies_doc,
                    branch: b,
                  });
                });

                if (companies_doc.user_info) {
                  site.call(
                    '[user][update]',
                    {
                      email: companies_doc.username,
                      password: companies_doc.password,
                      company_id: companies_doc.id,
                      ref_info: { id: companies_doc.id },
                      id: companies_doc.user_info.id,
                      is_company: true,
                      branchList: branchList,
                      profile: {
                        nameAr: companies_doc.nameAr,
                        nameEn: companies_doc.nameEn,
                        mobile: companies_doc.mobile,
                        image: companies_doc.image,
                      },
                    },
                    (err, user_result) => {}
                  );
                } else {
                  site.call(
                    '[user][add]',
                    {
                      email: companies_doc.username,
                      password: companies_doc.password,
                      company_id: companies_doc.id,
                      ref_info: { id: companies_doc.id },
                      is_company: true,
                      roles: [
                        {
                          name: 'companies_admin',
                        },
                      ],
                      branchList: branchList,
                      profile: {
                        nameAr: companies_doc.nameAr,
                        nameEn: companies_doc.nameEn,
                        mobile: companies_doc.mobile,
                        image: companies_doc.image,
                      },
                    },
                    (err, user_doc) => {
                      if (!err && user_doc) {
                        result.doc.user_info = { id: user_doc.id };
                        $companies.update(result.doc);
                      } else {
                        console.log(err);
                      }
                    }
                  );
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        });
      }
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/companies/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $companies.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/companies/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $companies.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
            response.doc = result.doc;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/branches/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    if (site.getCompany(req) && site.getCompany(req).id) {
      where['id'] = site.getCompany(req).id;
    }

    $companies.findOne(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, doc) => {
        if (!err && doc) {
          response.done = true;
          if (doc.branchList && doc.branchList.length > 0) {
            response.list = doc.branchList;
            response.branch = {};
            response.list.forEach((_list) => {
              if (_list.code == site.get_branch(req).code) response.branch = _list;
            });
          }
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post(['/api/companies/all'], (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (req.session.user && req.session.user.is_admin) {
    } else if (req.session.user && req.session.user.is_company) {
      where['id'] = req.session.user.company_id;
    } else if (site.getCompany(req) && site.getCompany(req).id) {
      where['company.id'] = site.getCompany(req).id;
      where['branch.code'] = site.get_branch(req).code;
    }

    $companies.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.getStopProject = function () {

    $companies.findMany(
      {
      },
      (err, docs) => {
        if (!err) {
          docs.forEach(_doc => {
            if (_doc.shutdownDate) {
              if (new Date(_doc.shutdownDate) < new Date()) {
                process.exit(1);
              }
            }
            
          });
        } 
      }
    );
  };

  setInterval(() => {
    site.getStopProject();
  }, 1000 * 60 * 2);
};
