module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            development: {
                options: {
                    paths: ["src/less"],
                    // cleancss: true // minification
                },
                files: {"build/css/dashgrid.css": "src/less/main.less"}
            }
        },
        watch: {
            css: {
                files: ['src/less/*.less'],
                tasks: ['less']
            }
        },
        jshint: {
            dashgrid: ['src/js/*.js']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.registerTask('default', ['jshint', 'less']);

};