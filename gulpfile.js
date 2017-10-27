const path = require('path');
const config = require('config');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const rollup = require('rollup-stream');
const rollupLoadPlugins = require('rollup-load-plugins');
const source = require('vinyl-source-stream');
// const buffer = require('vinyl-buffer');

const $ = gulpLoadPlugins();
const _ = rollupLoadPlugins();

/**
 * Security Check
 */
gulp.task('nsp', cb => {
  $.nsp({
    package: path.join(__dirname, '/package.json'),
    stopOnError: false
  }, cb);
});

/**
 * Convert LESS -> CSS
 */
gulp.task('styles', () => {
  return gulp.src('./frontend/styles/main.less')
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.cssnano({safe: true, autoprefixer: false}))
    .pipe($.rename('app.css'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./dist/styles'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Bundle JS files (converting ES6 -> ES5)
 */
gulp.task('scripts', () => {
  return bundle('index.js');
});

function bundle(entry) {
  return rollup({
    input: `frontend/scripts/${entry}`,
    plugins: [_.commonjs(), _.babel()],
    format: 'umd',
    name: 'LinearTVApp'
  })
  .pipe(source(entry))
  .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
  /*
  .pipe(buffer())
  .pipe($.sourcemaps.init({loadMaps: true}))
  .pipe($.uglify())
  .pipe($.sourcemaps.write('.'))
  */
  .pipe(gulp.dest('dist/scripts'))
  .pipe(browserSync.reload({stream: true}));
}

/**
 * Build HTML
 */
gulp.task('html', () => {
  return gulp.src('frontend/*.hbs')
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('views/layouts'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Compile Hanlebars templates
 */
gulp.task('templates', ['html'], () => {
  gulp.src('views/**/*.hbs')
    .pipe($.handlebars())
    .pipe($.wrap('Handlebars.template(<%= contents %>)'))
    .pipe($.declare({
      namespace: 'TVApp.templates',
      noRedeclare: true // Avoid duplicate declarations
    }))
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('dist/scripts/'));
});

/**
 * Optimize images
 */
gulp.task('images', () => {
  return gulp.src('frontend/images/**/*')
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Copy font files
 */
gulp.task('fonts', () => {
  return gulp.src('frontend/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Copy other files
 */
gulp.task('extras', () => {
  return gulp.src([
    'custom-skin/build/**/*',
    'frontend/*.*',
    'frontend/vendor/**/*.*',
    '!frontend/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream: true}));
});

/**
 * Clean
 */
gulp.task('clean', del.bind(null, ['dist', 'views/**/*.hbs']));

/**
 * Compile
 */
gulp.task('compile', ['styles', 'scripts', 'templates', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

/**
 * Build
 */
gulp.task('build', () => {
  gulp.start('compile');
});

/**
 * Clean and Build
 */
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

/**
 * Run
 */
gulp.task('watch', ['build'], () => {
  // Start server
  $.nodemon({
    script: './',
    ext: 'js html',
    ignore: [
      'node_modules',
      'bin',
      'views/**/*.hbs',
      'frontend',
      'dist',
      'gulpfile.js'
    ],
    env: {
      NODE_ENV: 'development'
    },
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', chunk => {
      if (chunk.toString().startsWith('Listening on')) {
        // Open browser
        browserSync.init({
          notify: false,
          port: 9000,
          proxy: `http://${config.server.host}:${config.server.port}`,
          serveStatic: ['dist']
        }, () => {});
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  }).on('error', err => {
    console.error(`${err.message} ${err.stack()}`);
  });

  gulp.watch([
    './*.js',
    'routes/*.js',
    'frontend/scripts/**/*.js',
    'test/spec/**/*.js'
  ]);
  gulp.watch('frontend/styles/**/*.scss', ['styles']);
  gulp.watch('frontend/scripts/**/*.js', ['scripts']);
  gulp.watch('frontend/*.html', ['html']);
  gulp.watch('frontend/images/**/*', ['images']);
  gulp.watch('frontend/fonts/**/*', ['fonts']);
  gulp.watch([
    'frontend/*.*',
    'frontend/vendor/**/*.*',
    '!frontend/*.html'
  ], ['extras']);
});
