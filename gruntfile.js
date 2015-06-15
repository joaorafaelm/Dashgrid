module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            development: {
                options: {
                    paths: ["src/less"],
                    cleancss: true // minification
                },
                files: {"build/css/dashgrid.css": "src/less/main.less"}
            }
        },
        watch: {
            css: {
                files: ['src/less/*.less', 'src/js/*.js'],
                tasks: ['less', 'concat', 'jshint']
            }
        },
        jshint: {
            dashgrid: ['src/js/*.js']
        },
        concat: {
            build: {
                src: ['src/js/*.js'],
                dest: 'build/js/dashgrid.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint', 'less', 'concat']);

};
