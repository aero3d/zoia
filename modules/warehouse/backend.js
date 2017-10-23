const moduleId = 'warehouse';
const moduleURL = '/admin/warehouse';

const path = require('path');
const config = require(path.join(__dirname, '..', '..', 'core', 'config.js'));
const Module = require(path.join(__dirname, '..', '..', 'core', 'module.js'));
const Router = require('co-router');

module.exports = function(app) {
    const i18n = new(require(path.join(__dirname, '..', '..', 'core', 'i18n.js')))(path.join(__dirname, 'lang'), app);
    const panel = new(require(path.join(__dirname, '..', '..', 'core', 'panel.js')))(app);
    const render = new(require(path.join(__dirname, '..', '..', 'core', 'render.js')))(path.join(__dirname, 'views'), app);
    const db = app.get('db');

    const list = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, (config.website.authPrefix || '/auth') + '?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let folders = await db.collection('registry').findOne({ name: 'warehouseFolders' });
            let html = await render.file('warehouse.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale]),
                langs: JSON.stringify(config.i18n.localeNames),
                folders: folders ? folders.data : JSON.stringify([{ id: 1, text: '/', data: null, parent: '#', type: 'root' }])
            });
            res.send(await panel.html(req, moduleId, i18n.get().__(locale, 'title'), html, config.production ? ['/warehouse/static/css/warehouse.min.css'] : ['/zoia/3rdparty/jstree/themes/default/style.min.css', '/warehouse/static/css/warehouse.css'],
                config.production ? ['/zoia/3rdparty/ckeditor/ckeditor.js', '/zoia/3rdparty/ckeditor/adapters/jquery.js', '/warehouse/static/js/warehouse.min.js'] : ['/zoia/3rdparty/ckeditor/ckeditor.js', '/zoia/3rdparty/ckeditor/adapters/jquery.js',
                    '/zoia/3rdparty/plupload/plupload.min.js', '/zoia/3rdparty/jquery/jquery.shifty.min.js', '/zoia/core/js/jquery.zoiaFormBuilder.js', '/zoia/core/js/jquery.zoiaTable.js', '/zoia/3rdparty/jstree/jstree.min.js', '/warehouse/static/js/warehouse.js'
                ]));
        } catch (e) {
            next(new Error(e.message));
        }
    };

    const browse = async(req, res, next) => {
        try {
            if (!Module.isAuthorizedAdmin(req)) {
                Module.logout(req);
                return res.redirect(303, (config.website.authPrefix || '/auth') + '?redirect=' + moduleURL + '&rnd=' + Math.random().toString().replace('.', ''));
            }
            const locale = req.session.currentLocale;
            let html = await render.file('browse.html', {
                i18n: i18n.get(),
                config: config,
                locale: locale,
                lang: JSON.stringify(i18n.get().locales[locale])
            });
            res.send(html);
        } catch (e) {
            next(new Error(e.message));
        }
    };

    app.use('/warehouse/static', app.get('express').static(path.join(__dirname, 'static')));

    let router = Router();
    router.get('/', list);
    router.get('/browse', browse);
    return {
        routes: router,
        info: {
            id: moduleId,
            url: moduleURL,
            title: Module.getTitles(i18n),
            icon: 'cart'
        }
    };
};