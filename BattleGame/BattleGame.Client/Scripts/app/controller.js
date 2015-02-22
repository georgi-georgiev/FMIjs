define(['jquery', 'sammy', 'mustache', 'toastr', 'underscore', './class', './persister', './layout', './views'],
    function ($, Sammy, Mustache, toastr, _, Class, persister, webLayout, viewsFactory) {
        'use strict';
        var dataPersister = persister.get("http://localhost:22954/api");
        var view = viewsFactory.get("Scripts/views");
        var layout = webLayout.get("#main", "#navigation", dataPersister, view);
        var app = Sammy("#main");
        var gameFieldInverval;
        var messagesInterval;

        function compare(a, b) {
            if (a.score < b.score)
                return 1;
            if (a.score > b.score)
                return -1;
            return 0;
        }

        function startMessageInterval() {
            console.log("here");
            if (dataPersister.isUserLoggedIn()) {
                console.log("here2");
                messagesInterval = setInterval(function () {
                    var messages;
                    dataPersister.message
                        .all()
                        .then(function (data) {
                            messages = data;
                            return view.message.index();
                        })
                        .then(function (template) {
                            _.each(messages, function (message) {
                                if (message.state === "read") {
                                    message.state = true;
                                } else {
                                    toastr.info(message.text);
                                }
                            });
                        });
                }, 1000);
            }
        }

        var MainController = Class.create({
            init: function () {
                this.home = new HomeController();
                this.user = new UserController();
                this.game = new GameController();
                this.message = new MessageController();
            }
        });

        var HomeController = Class.create({
            init: function () {
                app.route('get', '#/', function (context) {
                    if (dataPersister.isUserLoggedIn()) {
                        view.home
                            .index()
                            .then(function (template) {
                                layout.render(template);
                            });
                    }
                    else {
                        context.redirect("#/login");
                    }
                });
            }
        });

        var UserController = Class.create({
            init: function () {
                app.get('#/user/scoreboard', function () {
                    var scoreData;
                    dataPersister.user
                        .score()
                        .then(function (data) {
                            scoreData = data;
                            return view.user.scoreboard();
                        })
                        .then(function (template) {
                            scoreData.sort(compare);
                            var scoreboard = {
                                scoreboard: scoreData
                            };
                            var rendered = Mustache.render(template, scoreboard);
                            layout.render(rendered);
                        });
                });

                app.get('#/logout', function (context) {
                    clearInterval(gameFieldInverval);
                    clearInterval(messagesInterval);
                    dataPersister.user
                        .logout()
                        .then(function (data) {
                            context.redirect('#/');
                        });
                });

                app.post('#/register', function (context) {
                    if (dataPersister.isUserLoggedIn()) {
                        context.redirect('#/');
                    } else {
                        var user = {
                            username: this.params['username'],
                            nickname: this.params['nickname'],
                            password: this.params['password']
                        };

                        dataPersister.user
                            .register(user)
                            .then(function (data) {
                                context.redirect('#/');
                            }, function (error) {
                                var response = JSON.parse(error.responseText);
                                toastr.error(response.Message);
                            });
                    }
                });

                app.post('#/login', function (context) {
                    if (dataPersister.isUserLoggedIn()) {
                        context.redirect('#/');
                    } else {
                        var user = {
                            username: this.params['username'],
                            password: this.params['password']
                        };
                        dataPersister.user
                            .login(user)
                            .then(function (data) {
                                startMessageInterval();
                                context.redirect('#/');
                            }, function (error) {
                                var response = JSON.parse(error.responseText);
                                toastr.error(response.Message);
                            });
                    }
                });

                app.get('#/register', function () {
                    if (dataPersister.isUserLoggedIn()) {
                        context.redirect('#/');
                    } else {
                        view.user
                            .register()
                            .then(function (template) {
                                layout.render(template);
                            });
                    }
                });

                app.get('#/login', function (context) {
                    if (dataPersister.isUserLoggedIn()) {
                        context.redirect('#/');
                    } else {
                        view.user
                            .login()
                            .then(function (template) {
                                layout.render(template);
                            });
                    }
                });
            }
        });

        var GameController = Class.create({
            init: function () {
                app.route('get', '#/game/play/:id/:status', function () {
                    var gameData = {
                        id: this.params['id']
                    };
                    var status = this.params['status'];
                    if ((status === "in-progress" || status === "open") && dataPersister.isUserLoggedIn()) {
                        var cacheData;
                        gameFieldInverval = setInterval(function () {
                            dataPersister.game
                                .field(gameData)
                                .then(function (data) {
                                    if (!_.isEqual(cacheData, data)) {
                                        layout.loadGameFieldUI(data);
                                    }
                                    cacheData = data;
                                });
                        }, 1000);
                    } else {
                        dataPersister.game
                            .start(gameData)
                            .then(function (data) {
                                layout.loadGameFieldUI(data);
                            });
                    }
                });

                app.route('post', '#/game/join/:id', function (context) {
                    var gameData = {
                        gameId: this.params['id']
                    };
                    var password = this.params['password'];
                    if (password) {
                        gameData.password = password;
                    }
                    dataPersister.game
                        .join(gameData)
                        .then(function (data) {
                            toastr.success("Successfully join game");
                            context.redirect('#/game/active');
                        }, function (error) {
                            var response = JSON.parse(error.responseText);
                            toastr.error(response.Message);
                        });
                });

                app.route('get', '#/game/active', function () {
                    var gameData;
                    dataPersister.game
                        .active()
                        .then(function (data) {
                            gameData = data;
                            return view.game.active();
                        })
                        .then(function (template) {
                            var games = {
                                games: gameData
                            };
                            var rendered = Mustache.render(template, games);
                            layout.render(rendered);
                        });
                });

                app.route('get', '#/game/open/:id', function () {
                    var game = {
                        gameId: this.params['id']
                    };

                    view.game
                        .join()
                        .then(function (template) {
                            var rendered = Mustache.render(template, game);
                            layout.render(rendered);
                        });
                });

                app.route('get', '#/game/open', function () {
                    var gameData;
                    dataPersister.game
                        .open()
                        .then(function (data) {
                            gameData = data;
                            return view.game.open();
                        })
                        .then(function (template) {
                            var games = {
                                games: gameData
                            };
                            var rendered = Mustache.render(template, games);
                            layout.render(rendered);
                        });
                });

                app.route('get', '#/game/create', function () {
                    view.game
                        .create()
                        .then(function (template) {
                            layout.render(template);
                        });
                });

                app.route('post', '#/game/create', function (context) {
                    var gameData = {
                        title: this.params['game-title']
                    };
                    var password = this.params['password'];
                    if (password) {
                        gameData.password = password;
                    }

                    dataPersister.game
                        .create(gameData)
                        .then(function (data) {
                            toastr.success('Your game was created');
                            context.redirect('#/game/active');
                        }, function (error) {
                            var response = JSON.parse(error.responseText);
                            toastr.error(response.Message);
                        });
                });
            }
        });

        var MessageController = Class.create({
            init: function () {
                app.route('get', '#/messages', function () {
                    var messages;
                    dataPersister.message
                        .all()
                        .then(function (data) {
                            messages = data;
                            return view.message.index();
                        })
                        .then(function (template) {
                            _.each(messages, function (message) {
                                if (message.state === "read") {
                                    message.state = true;
                                } else {
                                    message.state = false;
                                }
                            });

                            var templateData = {
                                all: messages
                            };
                            var rendered = Mustache.render(template, templateData);
                            layout.render(rendered);
                        });
                });
            }
        });

        return {
            start: function () {
                var mainController = new MainController();
            },
            app: app
        }
    });