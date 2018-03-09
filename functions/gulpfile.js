var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("build", function () {
    return tsProject.src()
        .pipe(tsProject())
        .on('error', function() { process.exit(1) })
        .js.pipe(gulp.dest("dist"));
});
