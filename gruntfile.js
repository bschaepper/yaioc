"use strict";

module.exports = function (grunt) {

    grunt.initConfig({

        jshint: {
            jsFiles: ["**/*.js", "!coverage/**", "!node_modules/**", "!reports/**"],
            options: {
                jshintrc: true
            }
        },

        plato: {
            reports: {
                options : {
                    jshint : false,
                    exclude: /^(node_modules|coverage|reports)\//
                },
                files: {
                    reports: ["**/*.js"]
                }
            }
        },

        mochaTest: {
            options: {
                reporter: "spec"
            },
            src: ["test/**/*.js"]
        },

        mocha_istanbul: {
            coverage: {
                src: "./test/**",
                options: {
                    reporter: "spec",
                    recursive: true,
                    coverageFolder: "./coverage"
                }
            }
        },

        release: {
            options: {
                tagName: "release-<%= version %>"
            }
        }

    });

    require("load-grunt-tasks")(grunt);

    grunt.registerTask("test", ["jshint", "mocha_istanbul"]);

};
