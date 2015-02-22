define(['jquery', 'mustache', 'toastr', 'underscore', './class', './persister'],
    function ($, Mustache, toastr, _, Class, persister) {
        'use strict';
        var MainLayout = Class.create({
            init: function (mainSelector, navigationSelector, dataPersister, view) {
                this.mainSelector = mainSelector;
                this.navigation = navigationSelector;
                this.dataPersister = dataPersister;
                this.view = view;
                this.attachEventHandlers();
            },
            loadGameFieldUI: function (game) {
                var title = "<h2 class='left'>Title: " + game.title + "</h2>";
                var turn = "<h2 class='left' style='margin-left: 300px;'>Turn: " + game.turn + "</h2>";
                var inTurn = "<h2 class='right'>In turn: " + game.inTurn + "</h2>";

                var gameInfo = "<div id='game-info'>" + title + turn + inTurn + "</div><div class='clear'></div>";

                var units = _.range(9).map(function (row) {
                    return _.range(9).map(function (col) {
                        return "<div class='game-field-box' data-position-x='" +
                            row + "' data-position-y='" + col + "'></div>";
                    });
                });

                _.each(game.blue.units, function (blueUnit) {
                    var blueUnitAttack = "<div class='attack'>" + blueUnit.attack + "</div>";
                    var blueUnitRange = "<div class='range'>" + blueUnit.range + "</div>";
                    var blueUnitSpeed = "<div class='speed'>" + blueUnit.speed + "</div>";
                    var blueUnitHitPoints = "<div class='hp'>" + blueUnit.hitPoints + "</div>";
                    var blueUnitArmor = "<div class='armor'>" + blueUnit.armor + "</div>";

                    var blueUnitInfoWar = "<div class='right'>" + blueUnitAttack + blueUnitRange +
                        blueUnitSpeed + blueUnitHitPoints + blueUnitArmor + "</div>";

                    var blueUnitInfoRange = "<div class='left'>" + blueUnitAttack + blueUnitRange +
                        blueUnitSpeed + blueUnitHitPoints + blueUnitArmor + "</div>";

                    if (blueUnit.type === "ranger") {
                        units[blueUnit.position.x][blueUnit.position.y] =
                            "<div class='game-field-box-ranger-blue game-figure' data-game-id='" +
                            game.gameId + "' data-id='" + blueUnit.id + "' data-position-x='" +
                            blueUnit.position.x + "' data-position-y='" + blueUnit.position.y +
                            "'>" + blueUnitInfoRange + "</div>";
                    } else if (blueUnit.type === "warrior") {
                        units[blueUnit.position.x][blueUnit.position.y] =
                            "<div class='game-field-box-warrior-blue game-figure' data-game-id='" +
                            game.gameId + "' data-id='" + blueUnit.id + "' data-position-x='" +
                            blueUnit.position.x + "' data-position-y='" + blueUnit.position.y +
                            "'>" + blueUnitInfoWar + "</div>";
                    }
                });

                _.each(game.red.units, function (redUnit) {
                    var redUnitAttack = "<div class='attack'>" + redUnit.attack + "</div>";
                    var redUnitRange = "<div class='range'>" + redUnit.range + "</div>";
                    var redUnitSpeed = "<div class='speed'>" + redUnit.speed + "</div>";
                    var redUnitHitPoints = "<div class='hp'>" + redUnit.hitPoints + "</div>";
                    var redUnitArmor = "<div class='armor'>" + redUnit.armor + "</div>";

                    var redUnitInfoWar = "<div class='right'>" + redUnitAttack + redUnitRange +
                        redUnitSpeed + redUnitHitPoints + redUnitArmor + "</div>";

                    var redUnitInfoRange = "<div class='right'>" + redUnitAttack + redUnitRange +
                        redUnitSpeed + redUnitHitPoints + redUnitArmor + "</div>";

                    if (redUnit.type === "ranger") {
                        units[redUnit.position.x][redUnit.position.y] =
                            "<div class='game-field-box-ranger-red game-figure' data-game-id='" +
                            game.gameId + "' data-id='" + redUnit.id + "' data-position-x='" + redUnit.position.x + "' data-position-y='" +
                            redUnit.position.y + "'>" + redUnitInfoRange + "</div>";
                    } else if (redUnit.type === "warrior") {
                        units[redUnit.position.x][redUnit.position.y] =
                            "<div class='game-field-box-warrior-red game-figure' data-game-id='" +
                            game.gameId + "' data-id='" + redUnit.id + "' data-position-x='" + redUnit.position.x + "' data-position-y='" +
                            redUnit.position.y + "'>" + redUnitInfoWar + "</div>";
                    }
                });

                var gameFieldBoxes = "";

                _.each(units, function (row) {
                    _.each(row, function (col) {
                        gameFieldBoxes += col;
                    });

                    gameFieldBoxes += "<div style='clear: left;'></div>";
                });

                var gameField = "<div id='game-field'>" + gameFieldBoxes + "</div>";
                this.render(gameInfo + gameField);
            },
            render: function (template) {
                $(this.mainSelector).html(template);
                this.renderNavigation();
            },
            renderNavigation: function () {
                if (this.dataPersister.isUserLoggedIn() && $(this.navigation).length === 0) {
                    var self = this;
                    this.view.shared.navigation()
                        .then(function (template) {
                            var user = {
                                nickname: self.dataPersister.nickname()
                            };
                            var rendered = Mustache.render(template, user);
                            $(self.mainSelector).parent().prepend(rendered);
                        });
                } else if (!this.dataPersister.isUserLoggedIn()) {
                    $(this.navigation).remove();
                }
            },
            attachEventHandlers: function () {
                var self = this;

                var warBlue = "game-field-box-warrior-blue";
                var rangeBlue = "game-field-box-ranger-blue";
                var warRed = "game-field-box-warrior-red";
                var rangeRed = "game-field-box-ranger-red";

                $('body').on("click", ".game-figure", function (e) {
                    var target = e.currentTarget;
                    var id = parseInt($(target).data("id"));
                    var gameId = parseInt($(target).data("game-id"));

                    var positionX = parseInt($(target).data("position-x"));
                    var positionY = parseInt($(target).data("position-y"));

                    var nextPositionX = positionX + 1;
                    var previousPositionX = positionX - 1;
                    var nextPositionY = positionY + 1;
                    var previousPositionY = positionY - 1;

                    $(".game-field-action").each(function () {
                        $(this).attr("style", "");

                        var notBlue = !$(target).hasClass(warBlue) && !$(target).hasClass(rangeBlue);
                        var notRed = !$(target).hasClass(warRed) && !$(target).hasClass(rangeRed);
                        if (notBlue && notRed) {
                            $(this).attr("data-id", "");
                            $(this).attr("data-game-id", "");
                        }

                        $(this).removeClass("game-field-action");
                    });

                    self.dataPersister.game
                        .field({ id: gameId })
                        .then(function (gameField) {
                            var isRed = gameField.red.nickname === self.dataPersister.nickname();
                            var isBlue = gameField.blue.nickname === self.dataPersister.nickname();

                            if ((isRed && ($(target).hasClass(warBlue) || $(target).hasClass(rangeBlue))) ||
                                (isBlue && ($(target).hasClass(warRed) || $(target).hasClass(rangeRed)))) {
                                return false;
                            }

                            var right = $("div[data-position-x='" + positionX + "'][data-position-y='" + nextPositionY + "']");
                            var left = $("div[data-position-x='" + positionX + "'][data-position-y='" + previousPositionY + "']");
                            var down = $("div[data-position-x='" + nextPositionX + "'][data-position-y='" + positionY + "']");
                            var downRight = $("div[data-position-x='" + nextPositionX + "'][data-position-y='" + nextPositionY + "']");
                            var downLeft = $("div[data-position-x='" + nextPositionX + "'][data-position-y='" + previousPositionY + "']");
                            var up = $("div[data-position-x='" + previousPositionX + "'][data-position-y='" + positionY + "']");
                            var upRight = $("div[data-position-x='" + previousPositionX + "'][data-position-y='" + previousPositionY + "']");
                            var upLeft = $("div[data-position-x='" + previousPositionX + "'][data-position-y='" + nextPositionY + "']");

                            var moves = [right, left, down, downRight, downLeft, up, upRight, upLeft];

                            _.each(moves, function (move) {
                                if ((isRed && !(move.hasClass(warRed) || move.hasClass(rangeRed))) ||
                                (isBlue && !(move.hasClass(warBlue) || move.hasClass(rangeBlue)))) {
                                    move.css("background-color", "green");
                                    move.addClass("game-field-action");
                                    move.attr("data-id", id);
                                    move.attr("data-game-id", gameId);
                                }
                            });
                        });
                });

                $('body').on("click", ".game-field-action", function (e) {
                    var target = e.currentTarget;
                    var unitData = {
                        gameId: $(this)[0].dataset.gameId,
                        unitId: $(this)[0].dataset.id,
                        positionX: $(this)[0].dataset.positionX,
                        positionY: $(this)[0].dataset.positionY
                    };

                    self.dataPersister.game
                        .field({ id: unitData.gameId })
                        .then(function (data) {
                            var isRed = data.red.nickname === self.dataPersister.nickname();
                            var isBlue = data.blue.nickname === self.dataPersister.nickname();

                            if ((isRed && ($(target).hasClass(warBlue) || $(target).hasClass(rangeBlue))) ||
                                (isBlue && ($(target).hasClass(warRed) || $(target).hasClass(rangeRed)))) {
                                self.dataPersister.battle
                                    .attack(unitData)
                                    .then(function () {
                                        return self.dataPersister.game.field({ id: unitData.gameId });
                                    }, function (error) {
                                        var response = JSON.parse(error.responseText);
                                        toastr.error(response.Message);
                                    })
                                    .then(function (gameField) {
                                        self.loadGameFieldUI(gameField);
                                    }, function (error) {
                                        var response = JSON.parse(error.responseText);
                                        toastr.error(response.Message);
                                    });
                            } else {
                                self.dataPersister.battle
                                    .move(unitData)
                                    .then(function () {
                                        return self.dataPersister.game.field({ id: unitData.gameId });
                                    }, function (error) {
                                        var response = JSON.parse(error.responseText);
                                        toastr.error(response.Message);
                                    })
                                    .then(function (gameField) {
                                        self.loadGameFieldUI(gameField);
                                    }, function (error) {
                                        var response = JSON.parse(error.responseText);
                                        toastr.error(response.Message);
                                    });
                            }
                        });
                });
            }
        });

        return {
            get: function (mainSelector, navigationSelector, dataPersister, view) {
                return new MainLayout(mainSelector, navigationSelector, dataPersister, view);
            }
        }
    });