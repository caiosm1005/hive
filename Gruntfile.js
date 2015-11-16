module.exports = function ( grunt ) {
    grunt.loadNpmTasks( "grunt-typescript" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-processhtml" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );

    grunt.initConfig( {
        typescript: {
            base: {
                src: [ "scripts/typings/Core.ts" ],
                dest: "tmp/hive.js",
                options: {
                    module: "amd",
                    target: "es5"
                }
            }
        },

        uglify: {
            options: {
                screwIE8: true,
                banner: "/*! <%= grunt.package.name %> " +
                    "<%= grunt.package.version %> " +
                    "(<%= grunt.template.today('yyyy-mm-dd') %>) " +
                    "by Caio Santana Magalhães */\n"
            },
            publicTarget: {
                files: {
                    "public/hive.min.js": [
                        "scripts/libs/reqwest-2.0.5.min.js",
                        "scripts/libs/easeljs-0.8.1.min.js",
                        "scripts/libs/tweenjs-0.6.1.min.js",
                        "tmp/hive.js"
                    ]
                }
            }
        },

        processhtml: {
            dist: {
                files: {
                    "public/index.html": [ "scripts/templates/index.html" ]
                }
            },
            options: {
                environment: process.env[ "NODE_ENV" ]
            }
        },

        clean: {
            tmpFolder: [ "tmp/" ]
        },

        watch: {
            files: "scripts/*/**/*",
            tasks: [ "typescript", "uglify", "processhtml", "clean" ],
            options: {
                livereload: true
            }
        }
    } );

    grunt.registerTask( "default",
        [ "typescript", "uglify", "processhtml", "clean" ] );
};
