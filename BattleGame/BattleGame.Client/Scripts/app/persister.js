define(['./class', './httpRequester', './crypto-js'], function (Class, httpRequester, CryptoJS) {
    'use strict';
    var requester = httpRequester.get().jsonRequester;
    var nickname = localStorage.getItem("nickname");
    var sessionKey = localStorage.getItem("sessionKey");

    function saveUserData(userData) {
        localStorage.setItem("nickname", userData.nickname);
        localStorage.setItem("sessionKey", userData.sessionKey);
        nickname = userData.nickname;
        sessionKey = userData.sessionKey;
    }

    function clearUserData() {
        localStorage.removeItem("nickname");
        localStorage.removeItem("sessionKey");
        nickname = "";
        sessionKey = "";
    }

    var MainPersister = Class.create({
        init: function (url) {
            this.rootUrl = url;
            this.user = new UserPersister(this.rootUrl);
            this.game = new GamePersister(this.rootUrl);
            this.battle = new BattlePersister(this.rootUrl);
            this.message = new MessagePersister(this.rootUrl);
        },
        isUserLoggedIn: function () {
            return nickname !== "" && sessionKey !== "" && nickname !== null && sessionKey !== null;
        },
        nickname: function () {
            return nickname;
        }
    });

    var UserPersister = Class.create({
        init: function (url) {
            this.rootUrl = url + "/user";
        },
        login: function (data) {
            var url = this.rootUrl + "/login";
            var userData = {
                username: data.username,
                authCode: CryptoJS.SHA1(data.username + data.password).toString()
            };

            return requester
                .post(url, userData)
				.then(function (data) {
				    saveUserData(data);
				    return data;
				}, function (error) {
				    return error;
				});
        },
        register: function (data) {
            var url = this.rootUrl + "/register";
            var userData = {
                username: data.username,
                nickname: data.nickname,
                authCode: CryptoJS.SHA1(data.username + data.password).toString()
            };

            return requester
                .post(url, userData)
                .then(function (data) {
                    saveUserData(data);
                    return data;
                }, function (error) {
                    return error;
                });
        },
        logout: function () {
            var url = this.rootUrl + "/logout/" + sessionKey;
            clearUserData();
            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        score: function () {
            var url = this.rootUrl + "/scores/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        }
    });

    var GamePersister = Class.create({
        init: function (url) {
            this.rootUrl = url + "/game";
        },
        open: function () {
            var url = this.rootUrl + "/open/" + sessionKey;
            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        active: function () {
            var url = this.rootUrl + "/my-active/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        create: function (game) {
            var url = this.rootUrl + "/create/" + sessionKey;
            var gameData = {
                title: game.title
            };
            var password = game.password;
            if (password) {
                gameData.password = CryptoJS.SHA1(password).toString();
            }

            return requester
                .post(url, gameData)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        join: function (game) {
            var url = this.rootUrl + "/join/" + sessionKey;
            var gameData = {
                id: game.gameId,
            };
            var password = game.password;
            if (password) {
                gameData.password = password;
            }

            return requester
                .post(url, gameData)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        start: function (data) {
            var url = this.rootUrl + "/" + data.id + "/start/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        field: function (data) {
            var url = this.rootUrl + "/" + data.id + "/field/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        }
    });

    var MessagePersister = Class.create({
        init: function (url) {
            this.rootUrl = url + "/messages";
        },
        unread: function () {
            var url = this.rootUrl + "/unread/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        all: function () {
            var url = this.rootUrl + "/all/" + sessionKey;

            return requester
                .get(url)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        }
    });

    var BattlePersister = Class.create({
        init: function (url) {
            this.rootUrl = url + "/battle";
        },
        move: function (data) {
            var url = this.rootUrl + "/" + data.gameId + "/move/" + sessionKey;
            var unitData = {
                unitId: data.unitId,
                position: {
                    x: data.positionX,
                    y: data.positionY
                }
            };

            return requester
                .post(url, unitData)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        attack: function (data) {
            var url = this.rootUrl + "/" + data.gameId + "/attack/" + sessionKey;
            var unitData = {
                unitId: data.unitId,
                position: {
                    x: data.positionX,
                    y: data.positionY
                }
            };

            return requester
                .post(url, unitData)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        defend: function (data) {
            var url = this.rootUrl + "/" + data.gameId + "/defend/" + sessionKey;

            return requester
                .post(url, data.unitId)
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        }
    });

    return {
        get: function (url) {
            return new MainPersister(url);
        }
    }
});