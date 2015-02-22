define(['jquery', 'rsvp', './class'], function ($, RSVP, Class) {
    'use strict';
    var templates = {};

    function getTemplate(templatePath) {
        var promise = new RSVP.Promise(function (resolve, reject) {
            if (templates[templatePath]) {
                resolve(templates[templatePath]);
            }
            else {
                $.ajax({
                    url: templatePath + ".html",
                    type: "GET",
                    success: function (template) {
                        templates[templatePath] = template;
                        resolve(template);
                    },
                    error: function (error) {
                        reject(error)
                    }
                });
            }
        });
        return promise;
    }

    var MainView = Class.create({
        init: function (path) {
            this.path = path;
            this.shared = new SharedView(path);
            this.home = new HomeView(path);
            this.user = new UserView(path);
            this.game = new GameView(path);
            this.battle = new BattleView(path);
            this.message = new MessageView(path);
        }
    });

    var SharedView = Class.create({
        init: function (path) {
            this.path = path + "/shared";
        },
        navigation: function () {
            var templatePath = this.path + "/navigation";
            return getTemplate(templatePath);
        }
    });

    var HomeView = Class.create({
        init: function (path) {
            this.path = path + "/home";
        },
        index: function () {
            var templatePath = this.path + "/index";
            return getTemplate(templatePath);
        }
    });

    var UserView = Class.create({
        init: function (path) {
            this.path = path + "/user";
        },
        scoreboard: function () {
            var templatePath = this.path + "/scoreboard";
            return getTemplate(templatePath);
        },
        register: function () {
            var templatePath = this.path + "/register";
            return getTemplate(templatePath);
        },
        login: function () {
            var templatePath = this.path + "/login";
            return getTemplate(templatePath);
        }
    });

    var GameView = Class.create({
        init: function (path) {
            this.path = path + "/game";
        },
        create: function () {
            var templatePath = this.path + "/create";
            return getTemplate(templatePath);
        },
        open: function () {
            var templatePath = this.path + "/open";
            return getTemplate(templatePath);
        },
        active: function () {
            var templatePath = this.path + "/active";
            return getTemplate(templatePath);
        },
        join: function () {
            var templatePath = this.path + "/join";
            return getTemplate(templatePath);
        }
    });

    var BattleView = Class.create({
        init: function (path) {
            this.path = path + "/battle";
        }
    });

    var MessageView = Class.create({
        init: function (path) {
            this.path = path + "/message";
        },
        index: function () {
            var templatePath = this.path + "/index";
            return getTemplate(templatePath);
        }
    });

    return {
        get: function (path) {
            return new MainView(path);
        }
    }
});