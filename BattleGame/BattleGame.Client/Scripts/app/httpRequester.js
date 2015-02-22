define(['jquery', 'rsvp', './class'], function ($, RSVP, Class) {
    'use strict';
    var timeout = 5000;

    var MainHttpRequester = Class.create({
        init: function () {
            this.jsonRequester = new JsonRequester();
        }
    });

    var JsonRequester = Class.create({
        init: function () {
            this.contentType = "application/json";
        },
        get: function (serviceUrl, headers) {
            var self = this;
            var promise = new RSVP.Promise(function (resolve, reject) {
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: self.contentType,
                    timeout: timeout,
                    headers: headers,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
            return promise;
        },
        post: function (serviceUrl, data, headers) {
            var self = this;
            var promise = new RSVP.Promise(function (resolve, reject) {
                $.ajax({
                    url: serviceUrl,
                    type: "POST",
                    contentType: self.contentType,
                    data: JSON.stringify(data),
                    timeout: timeout,
                    headers: headers,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
            return promise;
        },
        put: function (serviceUrl, data, headers) {
            var self = this;
            var promise = new RSVP.Promise(function (resolve, reject) {
                $.ajax({
                    url: serviceUrl,
                    type: "PUT",
                    contentType: self.contentType,
                    data: JSON.stringify(data),
                    timeout: timeout,
                    headers: headers,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
            return promise;
        },
        delete: function (serviceUrl, headers) {
            var self = this;
            var promise = new RSVP.Promise(function (resolve, reject) {
                $.ajax({
                    url: serviceUrl,
                    type: "DELETE",
                    contentType: self.contentType,
                    timeout: timeout,
                    headers: headers,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
            return promise;
        }
    });

    return {
        get: function () {
            return new MainHttpRequester();
        }
    }
});