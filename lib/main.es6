'use strict';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import gutil from 'gulp-util';
import extend from 'extend';
import glob from 'glob';
import through from 'through2';

function getHashStr(file, len, algorithm) {
  const hash = crypto.createHash(algorithm);
  hash.update(file.contents, 'utf8');
  return len > 0 ? hash.digest('hex').slice(0, len) : hash.digest('hex');
}

/**
 * [exports description]
 * @param  {String} ifile css|js|blob
 * @param  {Object} opt options
 * @return {Object}
 */
module.exports = function hashAseets(ifile, opt) {
  const defaults = {
    size: 7, // limit the size of the hash that is appended
    assetsPath: '', // assets relative path to split
    whitelist: null, // keywords string|array that shouldn't add hash
    ignore: null, // keywords string|array that ignore
    algorithm: 'md5', // md5 | sha256
  };
  const options = extend({}, defaults, opt);
  options.size = options.size | 0;
  return through.obj(function transformFun(file, enc, cb) {
    const chunk = file;
    const hashStr = getHashStr(file, options.size, options.algorithm);
    const filename = path.basename(file.path);
    const assetsDir = path.resolve(__dirname.slice(0, __dirname.lastIndexOf('/node_modules')),
      options.assetsPath);
    const subNamepath = path.relative(assetsDir, file.path)
      .replace(new RegExp(filename), '').split(path.sep).join('/');
    let isSubFolder = false;
    let filenameReg;

    if (file.base.split(path.sep).filter(Boolean).length >
        assetsDir.split(path.sep).filter(Boolean).length) isSubFolder = true;

    if (isSubFolder) {
      filenameReg = new RegExp(`()(${subNamepath}${filename}[\\?\\w+]*)`, 'g');
    } else {
      filenameReg = new RegExp(`(['"]?\\.*\\/?)(${subNamepath}${filename}[\\?\\w+]*)`, 'g');
    }

    const md5Filename = `${filename}?${hashStr}`;
    const md5FilenameReg = new RegExp(`${subNamepath}${filename}\\?${hashStr}`, 'g');

    // Check if filename contains keywords in the list
    function isListedStr(str, list) {
      let isListed = false;

      if (Object.prototype.toString.call(list) === '[object Array]') {
        list.forEach((elm, i, arr) => {
          if (str.indexOf(arr[i]) !== -1) isListed = true;
        });
      } else {
        if (str.indexOf(list)) isListed = true;
      }

      return isListed;
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
      return cb();
    }

    if (!ifile || !file.contents) return cb();

    // Check if filename is in the whitelist
    if (options.whitelist && isListedStr(filename, options.whitelist)) {
      gutil.log(gutil.colors.yellow('Whitelist:'), gutil.colors.magenta(filename));
      return cb();
    }

    glob(ifile, (err, files) => {
      if (err) return gutil.log(gutil.colors.red(err));

      files.forEach((ilist) => {
        const _file = fs.readFileSync(ilist, 'utf8');
        const _nameResult = filenameReg.exec(_file);
        filenameReg.lastIndex = 0; 
        md5FilenameReg.lastIndex = 0; 
        const isIncludeFile = filenameReg.test(_file);
        const isIncludeMd5File = md5FilenameReg.test(_file);

        // Check if current hash string is in the ignore list
        if (options.ignore && _nameResult && isListedStr(_nameResult[2], options.ignore)) {
          gutil.log(
            gutil.colors.yellow('Ignore:'),
            gutil.colors.magenta(ilist),
            '=>',
            gutil.colors.magenta(filename)
          );
          return;
        }

        if (isIncludeFile && !isIncludeMd5File) {
          gutil.log(
            gutil.colors.magenta(subNamepath + filename),
            '=>',
            gutil.colors.green(hashStr)
          );
          const result = _file.replace(filenameReg, `$1${subNamepath}${md5Filename}`);
          fs.writeFileSync(ilist, result, 'utf8');
        }
      });
      return ifile;
    });

    const dir = path.dirname(file.path[0] === '.' ? path.join(file.base, file.path) : file.path);
    chunk.path = path.join(dir, md5Filename);
    this.push(file);
    return cb();
  }, (cb) => cb());
};
