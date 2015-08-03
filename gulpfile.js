'use strict';

var gulp = require('gulp');
var del = require('del');
var join = require('path').join;
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');

var plugins = require('gulp-load-plugins')({
    scope: ['dependencies']
});

var projectMap = {
    folder: {
        tests: '/tests',
        tmp: '/.tmp',
        public: '/public',
        bower: '/public/vendor',
        fonts: '/resources/fonts',
        images: '/resources/images',
        js: '/resources/javascripts',
        scss: '/resources/stylesheets'
    },
    file: {
        main_css: 'main.css',
        main_js: 'main.js',
        main_min_css: 'main.min.css',
        main_min_js: 'main.min.js',
        index_html: 'index.html'
    }
};

var getPath = function (path) {
    return join(path.type === 'folder' ?  __dirname : '', projectMap[path.type][path.name]);
};

var publicPath = getPath({type: 'folder', name: 'public'});

// ################################################################################
// ##                          JavaScript compression.                           ##
// ################################################################################
gulp.task('js:compress', function () {
    var path = join(publicPath, 'js');
    var fileName = getPath({type: 'file', name: 'main_js'});

    return gulp.src(join(path, fileName))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stripDebug())
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            extname: '.min.js'
        }))
        // For using ES6
        //.pipe(plugins.babel())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(path))
        .pipe(plugins.size({title: 'Total compressed JavaScript files (with source maps) size:'}));
});

// ################################################################################
// ##                         JavaScript concatenation.                          ##
// ################################################################################
gulp.task('js:concat', function () {
    var path = getPath({type: 'folder', name: 'js'});
    var fileName = getPath({type: 'file', name: 'main_js'});
    var filesOrder = [
        // ...
        'main.js'
        // ...
    ].map(function(key) {
            return join(path, key);
        });

    return gulp.src(filesOrder)
        .pipe(plugins.concat({
            path: fileName,
            stat: {
                mode: '0666'
            }
        }))
        .pipe(gulp.dest(join(publicPath, 'js')))
        .pipe(plugins.size({title: 'Total uncompressed main.js file size:'}));
});

// ################################################################################
// ##                Relocation JavaScript vendor files (bower).                 ##
// ################################################################################
gulp.task('js:relocate_vendor', function () {
    var path = getPath({type: 'folder', name: 'bower'});
    var files = [
        join(path, '**/*.min.js'),
        join(path, '**/*-min.js')
    ];

    return gulp.src(files)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.flatten())
        .pipe(plugins.sourcemaps.write('../maps'))
        .pipe(gulp.dest(join(publicPath, 'js/vendor')));
});

// ################################################################################
// ##                 Make css from scss, compile and minification.              ##
// ################################################################################
gulp.task('css:compile', function () {
    var path = getPath({'type': 'folder', 'name': 'scss'});
    var bowerPath = getPath({type: 'folder', name: 'bower'});

    // For best performance, don't add Sass partials to `gulp.src`.
    return gulp.src([
        join(path, '**/*.scss'),
        join('!', path, 'vendor/**')
    ])
        .pipe(plugins.changed('styles', {extension: '.scss'}))
        .pipe(plugins.sass({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: [
                bowerPath + '/bootstrap-sass/assets/stylesheets',
                bowerPath + '/font-awesome/scss'
            ]
        }))
        .on('error', console.error.bind(console))
        .pipe(gulp.dest(join(publicPath, 'css')))
        // Concatenate And Minify Styles.
        .pipe(plugins.if('*.css', plugins.minifyCss()))
        // Rename to .min.css.
        .pipe(plugins.if('*.css',
            plugins.rename({
                extname: '.min.css'
            })
        ))
        .pipe(gulp.dest(join(publicPath, 'css')))
        .pipe(plugins.size({title: 'Total compressed css files (with source maps) size:'}));
});

// ################################################################################
// ##                            Compress images.                                ##
// ################################################################################
gulp.task('image:compress', function () {
    var path = getPath({type: 'folder', name: 'images'});

    return gulp.src(join(path, '**/*'))
        .pipe(plugins.size({title: 'Total images size before compression:'}))
        .pipe(plugins.imagemin({
            progressive: true,
            interlaced: true,
            // Don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling.
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant({
                quality: '50-70',
                speed: 4
            })]
        }))
        .pipe(gulp.dest(join(publicPath, 'img')))
        .pipe(plugins.size({title: 'Total images size after compression:'}));
});

// ################################################################################
// ##                         Install bower components.                          ##
// ################################################################################
gulp.task('bower:install', function() {
    return plugins.bower({ cmd: 'install'});
});

// ################################################################################
// ##                   Clean output and temp directories.                       ##
// ################################################################################
gulp.task('clean', del.bind(null, [
    join(getPath({type: 'folder', name: 'tmp'}), '*'),
    join(publicPath, 'js/*'),
    join(publicPath, 'css/*'),
    join(publicPath, 'img/*')
]));

// ################################################################################
// ##                          Build production files.                           ##
// ################################################################################
gulp.task('build', ['clean', 'bower:install'], function (callback) {
    runSequence(
        [
            'js:concat',
            'js:relocate_vendor'
        ],
        [
            'css:compile'
        ],
        [
            'image:compress',
            'js:compress'
        ],
        callback);
});

gulp.task('backend:run', ['build'], function () {
    // Start the server
    var server = plugins.liveServer('server.js');
    server.start();
});

gulp.task('backend:test', function () {
    var path = getPath({type: 'folder', name: 'tests'});
    return gulp.src(join(path, '**/*.js'))
        .pipe(plugins.mocha({reporter: 'spec'}));
});

gulp.task('run', ['backend:test', 'backend:run'], function () {});

gulp.task('help', function () {
    console.log('The list of available tasks:');
    plugins.taskListing();
});

gulp.task('default', ['help'], function () {});