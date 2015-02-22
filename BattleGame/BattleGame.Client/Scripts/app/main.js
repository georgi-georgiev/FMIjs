define(function (require) {
    'use strict';
    var jquery = require('jquery');
    var controller = require('../app/controller');
    var bootstrap = require('bootstrap');
    var cntrl = controller.start();

    $(function () {
        controller.app.run('#/');
    });
});