const scss = require('gulp-sass')(require('sass'));
const { src, dest, watch, parallel ,series } = require('gulp');
const concat = require('gulp-concat');                         //для склеивания файлов
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');                         //Минифицирует файлы
const browserSync = require('browser-sync').create();               //Для обновления страницы
const imagemin = require('gulp-imagemin');

const del = require('del');

 function cleanDist(){
    return del('dist')
}


function build () {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js'
    ], {base : 'app'})
    .pipe(dest('dist'))
    images()
}
function refresh() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false

    })
}
function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}
function styles() {
    return src(
        [
            'app/scss/style.scss',
            'app/scss/var.scss'
        ]
    )
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}
function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


exports.scripts = scripts
exports.styles = styles;
exports.watching = watching;
exports.refresh = refresh;
exports.cleanDist = cleanDist;
exports.images = images;

exports.build = series(cleanDist , build , images)
exports.default = parallel(styles, scripts, watching, refresh)











