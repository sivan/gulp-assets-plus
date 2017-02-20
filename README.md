# gulp-assets-plus

md5/sha256 the static files(eg. javascript, style, image files) and change the hash strings in the quoted file. Forked from [gulp-md5-assets](https://github.com/stipsan/gulp-md5-assets).

``` html
<link rel="stylesheet" href="./css/main.css" />
=>
<link rel="stylesheet" href="./css/main.css?56318d54ed" />
```
``` css
.gf {
  background-image: url(./img/goldenfinger.jpg);
}
=>
.gf {
  background-image: url(./img/goldenfinger.jpg?56318d54ed);
}
```

## Usage

First, install `gulp-assets-plus` as a development dependency:

``` shell
npm i --save-dev gulp-assets-plus
```

Then, add the code below to your `gulpfile.js`.

Example 1: Md5 all css files in the src folder and change these css names in the quoted html.

``` js
var hashAssets = require("gulp-assets-plus");

gulp.src("./src/*.css")
  .pipe(hashAssets('./output/*.html'))
  .pipe(gulp.dest("./dist")
);
```

Example 2: First, optimize all images in the img folder including all sub folders; then sha256 all these images limited to a length of 6 and change these images'names in the quoted css files.

``` js
gulp.task('img' ,function() {
  var imgSrc = './static/img/**';
  var quoteSrc = './output/static/css/**/*.css',
  var imgDst = './output/static/img';

  return gulp.src(imgSrc)
    .pipe(imagemin())
    .pipe(hashAssets(quoteSrc, {
      size: 6,
      algorithm: 'sha256'
    }))
    .pipe(gulp.dest(imgDst));
});
```

#### note

the directory of the md5ed files in the imgDst folder is the same as that of original files in the imgSrc folder; and css files can refer the image file with the same name in different folder rightly.

## API

### hashAssets(file, opt)

#### file

Type: `String`

Default: null

Optionnal: the file need to replace the file name of the hashed files. Dir is also supported.

Example:

``` javascript
gulp.src('static/js/*')
  .pipe(hashAssets('./output/html/*.html'), {size: 6})
  .pipe(gulp.dest('./output')
);
```

The sample above will append the md5 hash(length: 6) to each of the file in the `static/js` folder then repalce the link file name in the `output/html/` using md5ed file name; at last store all of that into the `output` folder.

#### opt

##### opt.size

Type: `String`

Default: 7

Optionnal: you can pass the size to limit the size of the hash that is appended.

##### opt.assetsPath

Type: `String`

Default: null

Optionnal: you can declare the assets folder manually when the assets path is different to the quoted source.

Example:

``` html
<link rel="stylesheet" href="http://127.0.0.1/css/main.css?56318d54ed" />
```
``` javascript
gulp.src('dist/css/**/*.css')
  .pipe(hashAssets('./output/html/*.html'), {
    assetsPath: 'dist/'
  })
  .pipe(gulp.dest('./output')
);
```

##### opt.quotedPath

Type: `String`

Default: null

Optionnal: you can declare the quotes folder manually when quoted source is diffrent from actual Path (rewritten).

Example:

``` html
<link rel="stylesheet" href="http://127.0.0.1/rewrite_to_css/main.css?56318d54ed" />
```
``` javascript
gulp.src('css/**/*.css')
  .pipe(hashAssets('./output/html/*.html'), {
    quotedPath: 'rewrite_to_css/'
  })
);
```


##### opt.whitelist

Type: `String` | `Array`

Default: null

Optionnal: you can pass a whitelist array to filter the files you don't want to add the hash. For example: use `['base', 'jquery']` will ignore all the files which contains 'base' or 'jquery' in the filename, it's useful when you don't want to add hash to some file.

##### opt.ignore

Type: `String` | `Array`

Default: null

Optionnal: you can pass an ignore string/array to filter the files with this hash. For example: use `['debug']` or `'debug'` will ignore these files when you quote them like `<link rel="stylesheet" href="./css/main.css?debug" />`. It's useful when you change some file frequently during development, but don't forget to remove that string before publish.

##### opt.algorithm

Type: `String`

Default: 'md5'

Optionnal: generate hash digests using the given algorithm. On recent releases of OpenSSL, `openssl list-message-digest-algorithms` will display the available digest algorithms. See more at [Node.js Documentation](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm).

## License

MIT License
