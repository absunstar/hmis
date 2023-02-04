const site = require('../isite')({
  port: [12345],
  lang: 'En',
  version: '2023.01.01',
  name: 'HMIS',
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'HMIS',
    limit: 100000,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['21232f297a57a5a743894a0e4a801fc3', 'f6fdffe48c908deb0f4c3bd36c032e72'],
  },
});

site.get({
  name: '/',
  path: site.dir + '/',
});

site.get(
  {
    name: '/',
  },
  (req, res) => {
    res.render('index.html', { title: site.word('Site Title')}, { parser: 'html', compres: true });
  }
);

site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');

site.run();
