module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: './public',
                        src: ['**'],
                        dest: './app/public',
                    },
                ],
                files: [
                    {
                        expand: true,
                        cwd: './static',
                        src: ['**'],
                        dest: './app/static',
                    },
                ],
            },
        },
        exec: {
            tsc_watch: {
                cmd: './node_modules/.bin/tsc -p tsconfig.json --watch --pretty',
            },
            tsc: {
                cmd: './node_modules/.bin/tsc -p tsconfig.json --pretty',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build', ['copy', 'tsc']);
    grunt.registerTask('tsc', ['exec:tsc']);
    grunt.registerTask('tsc-watch', ['exec:tsc_watch']);
};
