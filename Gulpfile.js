var gulp = require("gulp"),
  autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  concat = require("gulp-concat"),
  cssnano = require("cssnano"),
  //   del = require("del"),
  imagemin = require("gulp-imagemin"),
  merge = require("merge-stream"),
  mqpacker = require("css-mqpacker"), //mqpacker is dead but no alternative
  newer = require("gulp-newer"),
  postcss = require("gulp-postcss"),
  rename = require("gulp-rename"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  terser = require("gulp-terser");
//   uglify = require("gulp-uglify"),
//   uncss = require("postcss-uncss");

var paths = {
  styles: {
    // By using styles/**/*.sass we're telling gulp to check all folders for any sass file
    src: "./sass/*.scss",
    // Compiled files will end up in whichever folder it's found in (partials are not compiled)
    dest: "./"
  },
  scripts: {
    src: "./js/**/*.js",
    dest: "./build/js"
  },

  images: {
    src: "./images/**/*",
    dest: "./build/images"
  }

  // Easily add additional paths
  // ,html: {
  //  src: '...',
  //  dest: '...'
  // }
};

// CSS
function style() {
  return (
    gulp
      .src(paths.styles.src)
      // Initialize sourcemaps before compilation starts
      .pipe(sourcemaps.init())
      .pipe(sass())
      .on("error", sass.logError)
      // Use postcss with media query packer, autoprefixer and compress the compiled file using cssnano
      .pipe(
        postcss([
          mqpacker(),
          autoprefixer(),
          // uncss to remove unused css
          //     uncss({html: [
          //     'http://localhost/index.html',
          //     'http://localhost/about.html',
          // ]}),
        //  cssnano()
        ])
      )
      // Now add/write the sourcemaps
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(paths.styles.dest))
      // Add browsersync stream pipe after compilation
      .pipe(browserSync.stream())
  );
}

// Minify Images

// Optimize Images
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(paths.images.dest));
}

// Transpile, concatenate and minify scripts
function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(concat("scripts.js"))
    .pipe(rename("scripts.min.js"))
    .pipe(terser())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// A simple task to reload the page
function reload() {
  browserSync.reload();
}

// Add browsersync initialization at the start of the watch task
function watch() {
  browserSync.init({
    // You can tell browserSync to use this directory and serve it as a mini-server
    // server: {
    //     baseDir: "./src"
    // }
    // If you are already serving your website locally using something like apache
    // You can use the proxy setting to proxy that instead
    proxy: "localhost"
  });
  gulp.watch(paths.styles.src, style);
  // We should tell gulp which files to watch to trigger the reload
  // This can be html or whatever you're using to develop your website
  // Note -- you can obviously add the path to the Paths object
  //gulp.watch("src/*.html", reload);
  gulp.watch("src/*.html").on("change", browserSync.reload);
}

// Copy vendor files to assets
// function vendor() {
//   // await del("./assets/vendor/");

//   // Bootstrap JS
//   var bootstrapJS = gulp
//     .src("./node_modules/bootstrap/dist/js/*")
//     .pipe(gulp.dest("./assets/vendor/bootstrap/js"));

//   // Bootstrap SCSS
//   var bootstrapSCSS = gulp
//     .src("./node_modules/bootstrap/scss/**/*")
//     .pipe(gulp.dest("./assets/vendor/bootstrap/scss"));

//   // ChartJS
//   var chartJS = gulp
//     .src("./node_modules/chart.js/dist/*.js")
//     .pipe(gulp.dest("./assets/vendor/chart.js"));

//   // dataTables
//   var dataTables = gulp
//     .src([
//       "./node_modules/datatables.net/js/*.js",
//       "./node_modules/datatables.net-bs4/js/*.js",
//       "./node_modules/datatables.net-bs4/css/*.css"
//     ])
//     .pipe(gulp.dest("./assets/vendor/datatables"));

//   // Dropzone
//   var dropzone = gulp
//     .src("./node_modules/dropzone/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/dropzone"));

//   // Feather Icons
//   var featherIcons = gulp
//     .src("./node_modules/feather-icons/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/feather-icons"));

//   // Font Awesome
//   var fontAwesome = gulp
//     .src("./node_modules/@fortawesome/fontawesome-free/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/fontawesome-free"));

//   // jQuery Easing
//   var jqueryEasing = gulp
//     .src("./node_modules/jquery.easing/*.js")
//     .pipe(gulp.dest("./assets/vendor/jquery-easing"));

//   // jQuery
//   var jquery = gulp
//     .src([
//       "./node_modules/jquery/dist/*",
//       "!./node_modules/jquery/dist/core.js"
//     ])
//     .pipe(gulp.dest("./assets/vendor/jquery"));

//   // Magic Grid
//   var magicGrid = gulp
//     .src("./node_modules/magic-grid/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/magic-grid"));

//   // SimpleMDE
//   var simplemde = gulp
//     .src("./node_modules/simplemde/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/simplemde"));

//   // Slugify
//   var slugify = gulp
//     .src("./node_modules/slugify-js/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/slugify-js"));

//   // Tablesorter
//   var tablesorter = gulp
//     .src("./node_modules/tablesorter/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/tablesorter"));

//   // Trumbowyg editor
//   var trumbowyg = gulp
//     .src("./node_modules/trumbowyg/**/*.*")
//     .pipe(gulp.dest("./assets/vendor/trumbowyg"));

//   return merge(
//     bootstrapJS,
//     bootstrapSCSS,
//     chartJS,
//     dataTables,
//     dropzone,
//     featherIcons,
//     fontAwesome,
//     jquery,
//     jqueryEasing,
//     magicGrid,
//     simplemde,
//     slugify,
//     tablesorter,
//     trumbowyg
//   );
// }

// We don't have to expose the reload function
// It's currently only useful in other functions

// Don't forget to expose the task!
exports.watch = watch;

// Expose the task by exporting it
// This allows you to run it from the commandline using
// $ gulp style
exports.style = style;

// expose images task
exports.images = images;
//expose js
exports.scripts = scripts;

exports.vendor = vendor;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.parallel(style, watch);

/*
 * You can still use `gulp.task` to expose tasks
 */
//gulp.task('build', build);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task("default", build);