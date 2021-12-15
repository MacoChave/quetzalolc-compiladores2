(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.load = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruccion = void 0;
var Instruccion = /** @class */ (function () {
    function Instruccion(tipo, fila, columna) {
        this.tipoDato = tipo;
        this.fila = fila;
        this.columna = columna;
    }
    return Instruccion;
}());
exports.Instruccion = Instruccion;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodoAST = /** @class */ (function () {
    function nodoAST(valor) {
        this.listaNodos = new Array();
        this.valor = valor;
    }
    nodoAST.prototype.agregarHijo = function (val, ambito, operador) {
        if (ambito != undefined) {
            switch (ambito) {
                case 'ar':
                    switch (operador) {
                        case 0:
                            val = '+';
                            break;
                        case 1:
                            val = '-';
                            break;
                        case 2:
                            val = '*';
                            break;
                        case 3:
                            val = '/';
                            break;
                        case 4:
                            val = '^';
                            break;
                        case 5:
                            val = '%';
                            break;
                    }
                    break;
                case 'log':
                    switch (operador) {
                        case 0:
                            val = '||';
                            break;
                        case 1:
                            val = '&&';
                            break;
                        case 2:
                            val = '!';
                            break;
                    }
                    break;
                case 'rel':
                    switch (operador) {
                        case 0:
                            val = '==';
                            break;
                        case 1:
                            val = '!=';
                            break;
                        case 2:
                            val = '>';
                            break;
                        case 3:
                            val = '<';
                            break;
                        case 4:
                            val = '>=';
                            break;
                        case 5:
                            val = '<=';
                            break;
                    }
                    break;
            }
            this.listaNodos.push(new nodoAST(val));
        }
        else
            this.listaNodos.push(new nodoAST(val));
    };
    nodoAST.prototype.agregarHijoAST = function (hijo) {
        if (hijo != undefined)
            this.listaNodos.push(hijo);
    };
    nodoAST.prototype.getValor = function () {
        return this.valor;
    };
    nodoAST.prototype.getHijos = function () {
        return this.listaNodos;
    };
    return nodoAST;
}());
exports.default = nodoAST;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errores = /** @class */ (function () {
    function Errores(tipo, desc, fila, columna) {
        this.tipoError = tipo;
        this.desc = desc;
        this.fila = fila;
        this.columna = columna;
    }
    Errores.prototype.getDesc = function () {
        return this.desc;
    };
    Errores.prototype.getTipoError = function () {
        return this.tipoError;
    };
    Errores.prototype.getcolumna = function () {
        return this.columna;
    };
    Errores.prototype.getFila = function () {
        return this.fila;
    };
    Errores.prototype.returnError = function () {
        return ('Se obtuvo: ' + this.tipoError + ' desc:{' + this.desc + '} en la fila: ' + this.fila + ' en la columna: ' + this.columna +
            '\n');
    };
    return Errores;
}());
exports.default = Errores;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listaErrores = void 0;
var arbolNuevo;
var contador;
var cuerpo;
//tablas arboles y excepcciones
// class Listado_Errores {
// 	public interpretar(entrada: string) {
// 		listaErrores = new Array<Errores>();
// 		let parser = require('../analizador');
// 		try {
// 			let ast = new Arbol(parser.parse(entrada));
// 			var tabla = new tablaSimbolos();
// 			ast.settablaGlobal(tabla);
// 			for (let i of ast.getinstrucciones()) {
// 				if (i instanceof Metodos || i instanceof Funciones) {
// 					ast.getfunciones().push(i);
// 				}
// 			}
// 			for (let i of ast.getinstrucciones()) {
// 				if (i instanceof Errores) {
// 					listaErrores.push(i);
// 					ast.actualizaConsola((<Errores>i).returnError());
// 				}
// 				if (
// 					i instanceof Metodos ||
// 					i instanceof Funciones ||
// 					i instanceof Exec
// 				)
// 					continue;
// 				if (
// 					i instanceof Declaracion ||
// 					i instanceof Asignacion ||
// 					i instanceof declaracionVectores ||
// 					i instanceof declaracionListas ||
// 					i instanceof asignacionVector ||
// 					i instanceof asignacionLista ||
// 					i instanceof agregarLista
// 				) {
// 					var resultador = i.interpretar(ast, tabla);
// 					if (resultador instanceof Errores) {
// 						listaErrores.push(resultador);
// 						ast.actualizaConsola(
// 							(<Errores>resultador).returnError()
// 						);
// 					}
// 				} else {
// 					let error = new Errores(
// 						'SEMANTICO',
// 						'SENTENCIA FUERA DE METODO',
// 						i.fila,
// 						i.columna
// 					);
// 					listaErrores.push(error);
// 					ast.actualizaConsola((<Errores>error).returnError());
// 				}
// 			}
// 			for (let i of ast.getinstrucciones()) {
// 				if (i instanceof Exec) {
// 					var resultador = i.interpretar(ast, tabla);
// 					if (resultador instanceof Errores) {
// 						listaErrores.push(resultador);
// 						ast.actualizaConsola(
// 							(<Errores>resultador).returnError()
// 						);
// 					}
// 				}
// 			}
// 			arbolNuevo = ast;
// 			/*res.send({
//           resultado: ast.getconsola(),
//           errores: listaErrores,
//           tabla: ast.getSimbolos(),
//         });*/
// 		} catch (err) {
// 			/*res.json({ error: err, errores: listaErrores });*/
// 		}
// 	}
// 	public graficar() {
// 		let otro = arbolNuevo;
// 		if (otro == null) return /*res.json({ msg: false })*/;
// 		let arbolAst = new nodoAST('RAIZ');
// 		let nodoINS = new nodoAST('INSTRUCCIONES');
// 		otro.getinstrucciones().forEach((element) => {
// 			nodoINS.agregarHijoAST(element.getNodo());
// 		});
// 		arbolAst.agregarHijoAST(nodoINS);
// 		graficarArbol(<nodoAST>arbolAst);
// 		return /*res.json({ msg: true })*/;
// 	}
// }
// export const listado_Errores = new Listado_Errores();

},{}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operadores = void 0;
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Aritmetica = /** @class */ (function (_super) {
    __extends(Aritmetica, _super);
    function Aritmetica(operador, fila, columna, op1, op2) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.operacion = operador;
        if (!op2)
            _this.valorUnario = op1;
        else {
            _this.valor1 = op1;
            _this.valor2 = op2;
        }
        return _this;
    }
    Aritmetica.prototype.getNodo = function () {
        var _a, _b;
        var nodo = new nodoAST_1.default('ARITMETICA');
        if (this.valorUnario != null) {
            nodo.agregarHijo(this.operacion + '');
            nodo.agregarHijoAST(this.valorUnario.getNodo());
        }
        else {
            nodo.agregarHijoAST((_a = this.valor1) === null || _a === void 0 ? void 0 : _a.getNodo());
            nodo.agregarHijo(this.operacion + '', 'ar', this.operacion);
            nodo.agregarHijoAST((_b = this.valor2) === null || _b === void 0 ? void 0 : _b.getNodo());
        }
        return nodo;
    };
    Aritmetica.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        var izq, der, uno;
        izq = der = uno = null;
        if (this.valorUnario != null) {
            uno = this.valorUnario.interpretar(arbol, tabla);
            if (uno instanceof Errores_1.default)
                return uno;
        }
        else {
            izq = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
            if (izq instanceof Errores_1.default)
                return izq;
            der = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.interpretar(arbol, tabla);
            if (der instanceof Errores_1.default)
                return der;
        }
        switch (this.operacion) {
            case Operadores.SUMA:
                return this.operador1Suma(izq, der);
            case Operadores.RESTA:
                return this.operador1Resta(izq, der);
            case Operadores.MULTIPLICACION:
                return this.operador1Multi(izq, der);
            case Operadores.DIVISION:
                return this.operador1Division(izq, der);
            case Operadores.MODULADOR:
                return this.operador1Mod(izq, der);
            case Operadores.MENOSNUM:
                return this.opMenosUnario(uno);
            default:
                return new Errores_1.default('ERROR SEMANTICO', 'OPERADOR INVALIDO', this.fila, this.columna);
        }
    };
    /*----------------------------------------------------------MENOSUNARIO------------------------------------------------- */
    Aritmetica.prototype.opMenosUnario = function (izq) {
        var _a;
        var opUn = (_a = this.valorUnario) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        switch (opUn) {
            case Tipo_1.tipoDato.ENTERO:
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                return parseInt(izq) * -1;
            case Tipo_1.tipoDato.DECIMAL:
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                return parseFloat(izq) * -1.0;
        }
    };
    /*----------------------------------------------------------SUMA------------------------------------------------- */
    Aritmetica.prototype.operador1Suma = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.ENTERO:
                return this.op2Suma(1, op2, izq, der);
            case Tipo_1.tipoDato.DECIMAL:
                return this.op2Suma(2, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Suma(3, op2, izq, der);
        }
    };
    Aritmetica.prototype.op2Suma = function (numero, op2, izq, der) {
        if (numero == 1) {
            //entero
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(Entero + Entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    return parseInt(izq) + parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(Entero + Double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) + parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(entero + caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) + res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //decimal
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(double + entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) + parseFloat(der);
                case Tipo_1.tipoDato.DECIMAL: //(double + double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) + parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(double + caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) + res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA', this.fila, this.columna);
            }
        }
        else if (numero == 3) {
            //caracter
            switch (op2) { //2DO OPERADOR
                case Tipo_1.tipoDato.ENTERO: //(caracter + entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = izq + '';
                    var res = da.charCodeAt(0);
                    return res + parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(caracter + double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = izq + '';
                    var res = da.charCodeAt(0);
                    return res + parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: // (caracter + caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 + res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA', this.fila, this.columna);
            }
        }
    };
    /*----------------------------------------------------------RESTA------------------------------------------------- */
    Aritmetica.prototype.operador1Resta = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.ENTERO:
                return this.op2Resta(1, op2, izq, der);
            case Tipo_1.tipoDato.DECIMAL:
                return this.op2Resta(2, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Resta(3, op2, izq, der);
        }
    };
    Aritmetica.prototype.op2Resta = function (numero, op2, izq, der) {
        if (numero == 1) {
            //entero
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(Entero - Entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    return parseInt(izq) - parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(Entero - Double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) - parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(entero - caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) - res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA RESTA', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //decimal
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(double - entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) - parseFloat(der);
                case Tipo_1.tipoDato.DECIMAL: //(double - double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) - parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(double - caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) - res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA', this.fila, this.columna);
            }
        }
        else if (numero == 3) {
            //caracter
            switch (op2) { //2DO OPERADOR
                case Tipo_1.tipoDato.ENTERO: //(caracter - entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = izq + '';
                    var res = da.charCodeAt(0);
                    return res - parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(caracter - double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = izq + '';
                    var res = da.charCodeAt(0);
                    return res - parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: // (caracter - caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 - res;
                default: //OPERACION ENTRE BOOLEANOS O STRING
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA SUMA', this.fila, this.columna);
            }
        }
    };
    /*----------------------------------------------------------MULTIPLICACION------------------------------------------------- */
    Aritmetica.prototype.operador1Multi = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.ENTERO:
                return this.op2Multi(1, op2, izq, der);
            case Tipo_1.tipoDato.DECIMAL:
                return this.op2Multi(2, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Multi(3, op2, izq, der);
        }
    };
    Aritmetica.prototype.op2Multi = function (numero, op2, izq, der) {
        if (numero == 1) {
            //entero
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(entero * entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    return parseInt(izq) * parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(entero * double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) * parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(entero * caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) * res;
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //decimal
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(double * entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) * parseFloat(der);
                case Tipo_1.tipoDato.DECIMAL: //(double * double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) * parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(double * caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseFloat(izq) * res;
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION', this.fila, this.columna);
            }
        }
        else if (numero == 3) {
            //caracter
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(caracter * entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 * parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(caracter * double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 * parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: // (caracter * caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 * res;
                default:
                    //error semantico
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION', this.fila, this.columna);
            }
        }
    };
    /*----------------------------------------------------------DIVISION------------------------------------------------- */
    Aritmetica.prototype.operador1Division = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.ENTERO:
                return this.op2Division(1, op2, izq, der);
            case Tipo_1.tipoDato.DECIMAL:
                return this.op2Division(2, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Division(3, op2, izq, der);
        }
    };
    Aritmetica.prototype.op2Division = function (numero, op2, izq, der) {
        if (numero == 1) {
            //entero
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(entero / entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return der != 0
                        ? parseInt(izq) / parseInt(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.DECIMAL: //(entero / double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return der != 0
                        ? parseFloat(izq) / parseFloat(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.CARACTER: //(entero / caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return res != 0
                        ? parseInt(izq) / res
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA DIVISION', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //decimal
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(double / entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return der != 0
                        ? parseFloat(izq) / parseFloat(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.DECIMAL: //(double / double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return der != 0
                        ? parseFloat(izq) / parseFloat(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.CARACTER: // (double / caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return der != 0
                        ? parseFloat(izq) / res
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO PERMITIDO', this.fila, this.columna);
            }
        }
        else if (numero == 3) {
            //caracter
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(caracter / entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return der != 0
                        ? res1 / parseInt(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.DECIMAL: //(caracter / double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return der != 0
                        ? res1 / parseFloat(der)
                        : 'NO SE PUEDE DIVIDIR SOBRE CERO';
                case Tipo_1.tipoDato.CARACTER: // (caracter / caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res != 0
                        ? res1 / res
                        : "NO SE PUEDE DIVIDIR SOBRE 0";
                default:
                    //error semantico
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OPERAR EN UNA MULTIPLICACION', this.fila, this.columna);
            }
        }
    };
    /*----------------------------------------------------------MODULACION------------------------------------------------- */
    Aritmetica.prototype.operador1Mod = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.ENTERO:
                return this.op2Mod(1, op2, izq, der);
            case Tipo_1.tipoDato.DECIMAL:
                return this.op2Mod(2, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Mod(3, op2, izq, der);
        }
    };
    Aritmetica.prototype.op2Mod = function (numero, op2, izq, der) {
        if (numero == 1) {
            //entero
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(entero % entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    return parseInt(izq) % parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(entero % double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) % parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(entero % caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) * res;
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //decimal
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //retorna decimal
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) % parseFloat(der);
                case Tipo_1.tipoDato.DECIMAL: //retorna decimal
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    return parseFloat(izq) % parseFloat(der);
                case Tipo_1.tipoDato.CARACTER: //(entero % caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    return parseInt(izq) * res;
                default:
                    //error
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO', this.fila, this.columna);
            }
        }
        else if (numero == 3) {
            //caracter
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(caracter / entero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 % parseInt(der);
                case Tipo_1.tipoDato.DECIMAL: //(caracter / double)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 % parseInt(der);
                case Tipo_1.tipoDato.CARACTER: // (caracter / caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                    var da = der + '';
                    var res = da.charCodeAt(0);
                    var da1 = izq + '';
                    var res1 = da1.charCodeAt(0);
                    return res1 % res;
                default:
                    //error semantico
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO SE PUEDE OBTENER EL MODULO', this.fila, this.columna);
            }
        }
    };
    return Aritmetica;
}(Instruccion_1.Instruccion));
exports.default = Aritmetica;
var Operadores;
(function (Operadores) {
    Operadores[Operadores["SUMA"] = 0] = "SUMA";
    Operadores[Operadores["RESTA"] = 1] = "RESTA";
    Operadores[Operadores["MULTIPLICACION"] = 2] = "MULTIPLICACION";
    Operadores[Operadores["DIVISION"] = 3] = "DIVISION";
    Operadores[Operadores["MODULADOR"] = 4] = "MODULADOR";
    Operadores[Operadores["MENOSNUM"] = 5] = "MENOSNUM";
})(Operadores = exports.Operadores || (exports.Operadores = {}));

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operadores = void 0;
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Cadena = /** @class */ (function (_super) {
    __extends(Cadena, _super);
    function Cadena(operador, fila, columna, op1, op2) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.operacion = operador;
        if (!op2)
            _this.valorUnario = op1;
        else {
            _this.valor1 = op1;
            _this.valor2 = op2;
        }
        return _this;
    }
    Cadena.prototype.getNodo = function () {
        var _a, _b;
        var nodo = new nodoAST_1.default('ARITMETICA');
        if (this.valorUnario != null) {
            nodo.agregarHijo(this.operacion + '');
            nodo.agregarHijoAST(this.valorUnario.getNodo());
        }
        else {
            nodo.agregarHijoAST((_a = this.valor1) === null || _a === void 0 ? void 0 : _a.getNodo());
            nodo.agregarHijo(this.operacion + '', 'ar', this.operacion);
            nodo.agregarHijoAST((_b = this.valor2) === null || _b === void 0 ? void 0 : _b.getNodo());
        }
        return nodo;
    };
    Cadena.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        var izq, der, uno;
        izq = der = uno = null;
        izq = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
        if (izq instanceof Errores_1.default)
            return izq;
        der = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.interpretar(arbol, tabla);
        if (der instanceof Errores_1.default)
            return der;
        switch (this.operacion) {
            case Operadores.CONCATENACION:
                return this.concatenacionCadenas(izq, der);
            case Operadores.DUPLICIDAD:
                return this.duplicarCadenas(izq, der);
            default:
                return new Errores_1.default('ERROR SEMANTICO', 'OPERADOR INVALIDO', this.fila, this.columna);
        }
    };
    /*----------------------------------------------------------CONCATENACION------------------------------------------------- */
    Cadena.prototype.concatenacionCadenas = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.CADENA:
                return this.op2Concatenacion(1, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Concatenacion(2, op2, izq, der);
        }
    };
    Cadena.prototype.op2Concatenacion = function (numero, op2, izq, der) {
        if (numero == 1) {
            //cadena
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.CADENA: //(Cadena & Cadena)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    return izq + '' + der;
                case Tipo_1.tipoDato.CARACTER: //(Cadena & caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    return izq + '' + der;
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores_1.default('SEMANTICO', 'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //caracter
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.CADENA: //(Caracter & Cadena)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    return izq + '' + der;
                case Tipo_1.tipoDato.CARACTER: //(Caracter & caracter)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    return izq + '' + der;
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores_1.default('SEMANTICO', 'ESTA OPERACION NO PUEDE EJECUTARSE CON OTRO TIPO DE DATO QUE NO SEA CADENA', this.fila, this.columna);
            }
        }
    };
    /*----------------------------------------------------------DUPLICIDAD------------------------------------------------- */
    Cadena.prototype.duplicarCadenas = function (izq, der) {
        var _a, _b;
        var op1 = (_a = this.valor1) === null || _a === void 0 ? void 0 : _a.tipoDato.getTipo();
        var op2 = (_b = this.valor2) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo();
        switch (op1 //operador 1
        ) {
            case Tipo_1.tipoDato.CADENA:
                return this.op2Duplicar(1, op2, izq, der);
            case Tipo_1.tipoDato.CARACTER:
                return this.op2Duplicar(2, op2, izq, der);
        }
    };
    Cadena.prototype.op2Duplicar = function (numero, op2, izq, der) {
        if (numero == 1) {
            //cadena
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(Cadena^Numero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    var palabra = izq + '';
                    return palabra.repeat(parseInt(der));
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores_1.default('SEMANTICO', 'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO', this.fila, this.columna);
            }
        }
        else if (numero == 2) {
            //caracter
            switch (op2 //OPERADOR 2
            ) {
                case Tipo_1.tipoDato.ENTERO: //(Caracter^Numero)
                    this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                    var palabra = izq + '';
                    return palabra.repeat(parseInt(der));
                default: //OTROS TIPOS DE DATOS
                    //error
                    return new Errores_1.default('SEMANTICO', 'NO SE PUEDE UTILIZAR OTRO TIPO DE DATO DIFERENTE A ENTERO', this.fila, this.columna);
            }
        }
    };
    return Cadena;
}(Instruccion_1.Instruccion));
exports.default = Cadena;
var Operadores;
(function (Operadores) {
    Operadores[Operadores["CONCATENACION"] = 0] = "CONCATENACION";
    Operadores[Operadores["DUPLICIDAD"] = 1] = "DUPLICIDAD";
})(Operadores = exports.Operadores || (exports.Operadores = {}));

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Identificador = /** @class */ (function (_super) {
    __extends(Identificador, _super);
    function Identificador(identificador, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        return _this;
    }
    Identificador.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('IDENTIFICADOR');
        nodo.agregarHijo(this.identificador + '');
        return nodo;
    };
    Identificador.prototype.interpretar = function (arbol, tabla) {
        var variable = tabla.getVariable(this.identificador);
        if (variable != null) {
            this.tipoDato = variable.gettipo();
            return variable.getvalor();
        }
        else {
            return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' NO EXISTE', this.fila, this.columna);
        }
    };
    return Identificador;
}(Instruccion_1.Instruccion));
exports.default = Identificador;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logicas = void 0;
//relacionales
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Logica = /** @class */ (function (_super) {
    __extends(Logica, _super);
    function Logica(relacion, fila, columna, cond1, cond2) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.loogica = relacion;
        if (!cond2)
            _this.condExcep = cond1;
        else {
            _this.cond1 = cond1;
            _this.cond2 = cond2;
        }
        return _this;
    }
    Logica.prototype.getNodo = function () {
        var _a, _b;
        var nodo = new nodoAST_1.default('LOGICO');
        if (this.condExcep != null) {
            nodo.agregarHijo(this.loogica + '', 'log', this.loogica);
            nodo.agregarHijoAST(this.condExcep.getNodo());
        }
        else {
            nodo.agregarHijoAST((_a = this.cond1) === null || _a === void 0 ? void 0 : _a.getNodo());
            nodo.agregarHijo(this.loogica + '', 'log', this.loogica);
            nodo.agregarHijoAST((_b = this.cond2) === null || _b === void 0 ? void 0 : _b.getNodo());
        }
        return nodo;
    };
    Logica.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        var izq, der, unico;
        izq = der = unico = null;
        if (this.condExcep != null) {
            unico = this.condExcep.interpretar(arbol, tabla);
            if (unico instanceof Errores_1.default)
                return unico;
        }
        else {
            izq = (_a = this.cond1) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
            if (izq instanceof Errores_1.default)
                return izq;
            der = (_b = this.cond2) === null || _b === void 0 ? void 0 : _b.interpretar(arbol, tabla);
            if (der instanceof Errores_1.default)
                return der;
        }
        //inicio comparacion
        switch (this.loogica) {
            case Logicas.AND:
                this.tipoDato.setTipo(Tipo_1.tipoDato.BOOLEANO);
                return izq && der ? true : false;
            case Logicas.OR:
                this.tipoDato.setTipo(Tipo_1.tipoDato.BOOLEANO);
                return izq || der ? true : false;
            case Logicas.NOT:
                this.tipoDato.setTipo(Tipo_1.tipoDato.BOOLEANO);
                return !unico;
        }
    };
    return Logica;
}(Instruccion_1.Instruccion));
exports.default = Logica;
var Logicas;
(function (Logicas) {
    Logicas[Logicas["OR"] = 0] = "OR";
    Logicas[Logicas["AND"] = 1] = "AND";
    Logicas[Logicas["NOT"] = 2] = "NOT";
})(Logicas = exports.Logicas || (exports.Logicas = {}));

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Tipo_1 = require("../TS/Tipo");
var Primitivo = /** @class */ (function (_super) {
    __extends(Primitivo, _super);
    function Primitivo(tipo, valor, fila, columna) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.valor = valor;
        if (tipo.getTipo() == Tipo_1.tipoDato.CADENA) {
            var val = _this.valor.toString();
            _this.valor = val
                .replace('\\n', '\n')
                .replace('\\t', '\t')
                .replace('\\r', '\r')
                .replace('\\\\', '\\')
                .replace("\\'", "'")
                .replace('\\"', '"');
        }
        return _this;
    }
    Primitivo.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('PRIMITIVO');
        nodo.agregarHijo(this.valor + '');
        return nodo;
    };
    Primitivo.prototype.interpretar = function (arbol, tabla) {
        if (this.tipoDato.getTipo() == Tipo_1.tipoDato.BOOLEANO) {
            return this.valor == 'true' ? true : false;
        }
        if (this.tipoDato.getTipo() == Tipo_1.tipoDato.NULO) {
            return null;
        }
        return this.valor;
    };
    return Primitivo;
}(Instruccion_1.Instruccion));
exports.default = Primitivo;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../TS/Tipo":45}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relacionales = void 0;
//aritmeticas
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Relacional = /** @class */ (function (_super) {
    __extends(Relacional, _super);
    function Relacional(relacion, fila, columna, cond1, cond2) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.relacion = relacion;
        _this.cond1 = cond1;
        _this.cond2 = cond2;
        return _this;
    }
    Relacional.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('RELACIONAL');
        nodo.agregarHijoAST(this.cond1.getNodo());
        nodo.agregarHijo(this.relacion + '', 'rel', this.relacion);
        nodo.agregarHijoAST(this.cond2.getNodo());
        return nodo;
    };
    Relacional.prototype.interpretar = function (arbol, tabla) {
        var izq, der;
        izq = this.obtieneValor(this.cond1, arbol, tabla);
        if (izq instanceof Errores_1.default)
            return izq;
        der = this.obtieneValor(this.cond2, arbol, tabla);
        if (der instanceof Errores_1.default)
            return der;
        if ((this.cond1.tipoDato.getTipo() == Tipo_1.tipoDato.CADENA &&
            this.cond2.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA) ||
            (this.cond2.tipoDato.getTipo() == Tipo_1.tipoDato.CADENA &&
                this.cond1.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)) {
            return new Errores_1.default('ERROR SEMANTICO', 'SOLO PUEDE COMPARAR CADENAS CON OTRO TIPO DE DATO', this.fila, this.columna);
        }
        else {
            this.tipoDato.setTipo(Tipo_1.tipoDato.BOOLEANO);
            switch (this.relacion) {
                case Relacionales.IGUAL:
                    return izq == der;
                case Relacionales.DIFERENTE:
                    return izq != der;
                case Relacionales.MENOR:
                    return izq < der;
                case Relacionales.MENORIGUAL:
                    return izq <= der;
                case Relacionales.MAYOR:
                    return izq > der;
                case Relacionales.MAYORIGUAL:
                    return izq >= der;
                default:
                    return 'TIPO DE COMPARACION RELACIONAL INCORRECTO';
            }
        }
    };
    Relacional.prototype.obtieneValor = function (operando, arbol, tabla) {
        var valor = operando.interpretar(arbol, tabla);
        switch (operando.tipoDato.getTipo()) {
            case Tipo_1.tipoDato.ENTERO:
                return parseInt(valor);
            case Tipo_1.tipoDato.DECIMAL:
                return parseFloat(valor);
            case Tipo_1.tipoDato.CARACTER:
                var da = valor + '';
                var res = da.charCodeAt(0);
                return res;
            case Tipo_1.tipoDato.BOOLEANO:
                var dats = valor + '';
                var otr = dats.toLowerCase();
                return parseInt(otr);
            case Tipo_1.tipoDato.CADENA:
                return '' + valor;
        }
    };
    return Relacional;
}(Instruccion_1.Instruccion));
exports.default = Relacional;
var Relacionales;
(function (Relacionales) {
    Relacionales[Relacionales["IGUAL"] = 0] = "IGUAL";
    Relacionales[Relacionales["DIFERENTE"] = 1] = "DIFERENTE";
    Relacionales[Relacionales["MAYOR"] = 2] = "MAYOR";
    Relacionales[Relacionales["MENOR"] = 3] = "MENOR";
    Relacionales[Relacionales["MAYORIGUAL"] = 4] = "MAYORIGUAL";
    Relacionales[Relacionales["MENORIGUAL"] = 5] = "MENORIGUAL";
})(Relacionales = exports.Relacionales || (exports.Relacionales = {}));

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Asignacion = /** @class */ (function (_super) {
    __extends(Asignacion, _super);
    function Asignacion(identificador, valor, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.valor = valor;
        return _this;
    }
    Asignacion.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ASIGNACION');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('=');
        nodo.agregarHijoAST(this.valor.getNodo());
        nodo.agregarHijo(';');
        return nodo;
    };
    Asignacion.prototype.interpretar = function (arbol, tabla) {
        //tomar el tipoDato de la variable
        var variable = tabla.getVariable(this.identificador);
        if (variable != null) {
            var val = this.valor.interpretar(arbol, tabla);
            if (variable.gettipo().getTipo() != this.valor.tipoDato.getTipo()) {
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
            }
            else {
                variable.setvalor(val);
                arbol.actualizarTabla(this.identificador, variable.getvalor(), this.fila.toString(), tabla.getNombre().toString(), this.columna.toString());
                //identificadorm,
                //actualizar valor de la tabla y no crear otra equis des
            }
        }
        else {
            console.log(this.identificador);
            return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' NO EXISTE', this.fila, this.columna);
        }
    };
    return Asignacion;
}(Instruccion_1.Instruccion));
exports.default = Asignacion;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Break = /** @class */ (function (_super) {
    __extends(Break, _super);
    function Break(fila, columna) {
        return _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
    }
    Break.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('BREAK');
        nodo.agregarHijo('break');
        nodo.agregarHijo(';');
        return nodo;
    };
    Break.prototype.interpretar = function (arbol, tabla) {
        return 'ByLy23';
    };
    return Break;
}(Instruccion_1.Instruccion));
exports.default = Break;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../TS/Tipo":45}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condWhile = /** @class */ (function (_super) {
    __extends(condWhile, _super);
    function condWhile(condicion, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.condicion = condicion;
        _this.expresion = expresion;
        return _this;
    }
    condWhile.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('DO_WHILE');
        nodo.agregarHijo('do');
        nodo.agregarHijo('{');
        this.expresion.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.condicion.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo('}');
        return nodo;
    };
    condWhile.prototype.interpretar = function (arbol, tabla) {
        var val = this.condicion.interpretar(arbol, tabla);
        if (val instanceof Errores_1.default)
            return val;
        if (this.condicion.tipoDato.getTipo() != Tipo_1.tipoDato.BOOLEANO) {
            return new Errores_1.default('SEMANTICO', 'DATO DEBE SER BOOLEANO', this.fila, this.columna);
        }
        do {
            var nuevaTabla = new tablaSimbolos_1.default(tabla);
            nuevaTabla.setNombre('Do_While');
            for (var i = 0; i < this.expresion.length; i++) {
                var a = this.expresion[i].interpretar(arbol, nuevaTabla);
                if (a instanceof Errores_1.default) {
                    Listado_Errores_1.listaErrores.push(a);
                    arbol.actualizaConsola(a.returnError());
                }
                if (a instanceof Return_1.default)
                    return a;
                if (a == 'ByLyContinue')
                    break;
                if (a == 'ByLy23')
                    return;
            }
        } while (this.condicion.interpretar(arbol, tabla));
    };
    return condWhile;
}(Instruccion_1.Instruccion));
exports.default = condWhile;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condFor = /** @class */ (function (_super) {
    __extends(condFor, _super);
    function condFor(declasignacion, condicion, actualizacion, instrucciones, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.declaracionAsignacion = declasignacion;
        _this.actualizacion = actualizacion;
        _this.condicion = condicion;
        _this.instrucciones = instrucciones;
        return _this;
    }
    condFor.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('FOR');
        nodo.agregarHijo('for');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.declaracionAsignacion.getNodo());
        nodo.agregarHijo(';');
        nodo.agregarHijoAST(this.condicion.getNodo());
        nodo.agregarHijo(';');
        nodo.agregarHijoAST(this.actualizacion.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        this.instrucciones.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('}');
        return nodo;
    };
    condFor.prototype.interpretar = function (arbol, tabla) {
        var nuevaTabla = new tablaSimbolos_1.default(tabla);
        nuevaTabla.setNombre('For');
        var declaAsig = this.declaracionAsignacion.interpretar(arbol, nuevaTabla);
        if (declaAsig instanceof Errores_1.default)
            return declaAsig;
        var val = this.condicion.interpretar(arbol, nuevaTabla);
        if (val instanceof Errores_1.default)
            return val;
        if (this.condicion.tipoDato.getTipo() != Tipo_1.tipoDato.BOOLEANO) {
            return new Errores_1.default('SEMANTICO', 'DATO DEBE SER BOOLEANO', this.fila, this.columna);
        }
        while (this.condicion.interpretar(arbol, nuevaTabla)) {
            var otraTabla = new tablaSimbolos_1.default(nuevaTabla);
            otraTabla.setNombre('ForDentro');
            for (var i = 0; i < this.instrucciones.length; i++) {
                var a = this.instrucciones[i].interpretar(arbol, otraTabla);
                if (a instanceof Errores_1.default) {
                    Listado_Errores_1.listaErrores.push(a);
                    arbol.actualizaConsola(a.returnError());
                }
                if (a instanceof Return_1.default)
                    return a;
                if (a == 'ByLyContinue')
                    break;
                if (a == 'ByLy23')
                    return;
            }
            var valActualizacion = this.actualizacion.interpretar(arbol, nuevaTabla);
            if (valActualizacion instanceof Errores_1.default)
                return valActualizacion;
        }
    };
    return condFor;
}(Instruccion_1.Instruccion));
exports.default = condFor;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condWhile = /** @class */ (function (_super) {
    __extends(condWhile, _super);
    function condWhile(condicion, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.condicion = condicion;
        _this.expresion = expresion;
        return _this;
    }
    condWhile.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('DO_WHILE');
        nodo.agregarHijo('while');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.condicion.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        this.expresion.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('}');
        return nodo;
    };
    condWhile.prototype.interpretar = function (arbol, tabla) {
        var val = this.condicion.interpretar(arbol, tabla);
        if (val instanceof Errores_1.default)
            return val;
        if (this.condicion.tipoDato.getTipo() != Tipo_1.tipoDato.BOOLEANO) {
            return new Errores_1.default('SEMANTICO', 'DATO DEBE SER BOOLEANO', this.fila, this.columna);
        }
        while (this.condicion.interpretar(arbol, tabla)) {
            var nuevaTabla = new tablaSimbolos_1.default(tabla);
            nuevaTabla.setNombre('While');
            for (var i = 0; i < this.expresion.length; i++) {
                var a = this.expresion[i].interpretar(arbol, nuevaTabla);
                if (a instanceof Errores_1.default) {
                    Listado_Errores_1.listaErrores.push(a);
                    arbol.actualizaConsola(a.returnError());
                }
                if (a instanceof Return_1.default)
                    return a;
                if (a == 'ByLyContinue')
                    break;
                if (a == 'ByLy23')
                    return;
            }
        }
    };
    return condWhile;
}(Instruccion_1.Instruccion));
exports.default = condWhile;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condIf = /** @class */ (function (_super) {
    __extends(condIf, _super);
    function condIf(fila, columna, cond1, condIf, condElse, condElseIf) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.cond1 = cond1;
        _this.condIf = condIf;
        _this.condElse = condElse;
        _this.condElseIf = condElseIf;
        return _this;
    }
    condIf.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('IF');
        nodo.agregarHijo('if');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.cond1.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        this.condIf.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('}');
        if (this.condElse != undefined) {
            nodo.agregarHijo('else');
            nodo.agregarHijo('{');
            this.condElse.forEach(function (element) {
                nodo.agregarHijoAST(element.getNodo());
            });
            nodo.agregarHijo('}');
        }
        if (this.condElseIf != undefined) {
            nodo.agregarHijo('else');
            nodo.agregarHijo('if');
            nodo.agregarHijo('{');
            nodo.agregarHijoAST(this.condElseIf.getNodo());
            nodo.agregarHijo('}');
        }
        return nodo;
    };
    condIf.prototype.interpretar = function (arbol, tabla) {
        var val = this.cond1.interpretar(arbol, tabla);
        if (this.cond1.tipoDato.getTipo() != Tipo_1.tipoDato.BOOLEANO) {
            return new Errores_1.default('SEMANTICO', 'DATO DEBE SER BOOLEANO', this.fila, this.columna);
        }
        if (val) {
            var nuevaTabla = new tablaSimbolos_1.default(tabla);
            nuevaTabla.setNombre('If');
            for (var i = 0; i < this.condIf.length; i++) {
                var a = this.condIf[i].interpretar(arbol, nuevaTabla);
                if (a instanceof Errores_1.default) {
                    Listado_Errores_1.listaErrores.push(a);
                    arbol.actualizaConsola(a.returnError());
                }
                if (a instanceof Return_1.default)
                    return a;
                if (a == 'ByLyContinue')
                    return a;
                if (a == 'ByLy23')
                    return a;
            }
        }
        else {
            if (this.condElse != undefined) {
                var nuevaTabla = new tablaSimbolos_1.default(tabla);
                nuevaTabla.setNombre('else');
                for (var i = 0; i < this.condElse.length; i++) {
                    var a = this.condElse[i].interpretar(arbol, nuevaTabla);
                    if (a instanceof Errores_1.default) {
                        Listado_Errores_1.listaErrores.push(a);
                        arbol.actualizaConsola(a.returnError());
                    }
                    if (a instanceof Return_1.default)
                        return a;
                    if (a == 'ByLyContinue')
                        return a;
                    if (a == 'ByLy23')
                        return a;
                }
            }
            else if (this.condElseIf != undefined) {
                var b = this.condElseIf.interpretar(arbol, tabla);
                if (b instanceof Errores_1.default)
                    return b;
                if (b instanceof Return_1.default)
                    return b;
                if (b == 'ByLyContinue')
                    return b;
                if (b == 'ByLy23')
                    return b;
            }
        }
        /*if (!this.cond2) {
      if (val == true) {
        this.condIf.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      }
    } else {
      if (val == true) {
        this.condIf.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      } else {
        this.condElse?.forEach((valor) => {
          let a = valor.interpretar(arbol, tabla);
          if (a instanceof Errores) return a;
        });
      }
    }*/
    };
    return condIf;
}(Instruccion_1.Instruccion));
exports.default = condIf;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var condIfTernario = /** @class */ (function (_super) {
    __extends(condIfTernario, _super);
    function condIfTernario(cond, conIf, conElse, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.condicion = cond;
        _this.condIf = conIf;
        _this.condElse = conElse;
        return _this;
    }
    condIfTernario.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('TERNARIO');
        nodo.agregarHijoAST(this.condicion.getNodo());
        nodo.agregarHijo('?');
        nodo.agregarHijoAST(this.condIf.getNodo());
        nodo.agregarHijo(':');
        nodo.agregarHijoAST(this.condElse.getNodo());
        return nodo;
    };
    condIfTernario.prototype.interpretar = function (arbol, tabla) {
        var val = this.condicion.interpretar(arbol, tabla);
        if (val instanceof Errores_1.default)
            return val;
        if (this.condicion.tipoDato.getTipo() != Tipo_1.tipoDato.BOOLEANO) {
            return new Errores_1.default('SEMANTICO', 'DATO DEBE SER BOOLEANO', this.fila, this.columna);
        }
        if (Boolean(val)) {
            var ifc = this.condIf.interpretar(arbol, tabla);
            if (ifc instanceof Errores_1.default)
                return ifc;
            this.tipoDato.setTipo(this.condIf.tipoDato.getTipo());
            return ifc;
        }
        else {
            var elsec = this.condElse.interpretar(arbol, tabla);
            if (elsec instanceof Errores_1.default)
                return elsec;
            this.tipoDato.setTipo(this.condElse.tipoDato.getTipo());
            return elsec;
        }
    };
    return condIfTernario;
}(Instruccion_1.Instruccion));
exports.default = condIfTernario;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../TS/Tipo":45}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condSwitch = /** @class */ (function (_super) {
    __extends(condSwitch, _super);
    function condSwitch(fila, columna, expresion, listaCasos, defecto) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.expresion = expresion;
        _this.listaCasos = listaCasos;
        _this.defecto = defecto;
        return _this;
    }
    condSwitch.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('SWITCH');
        nodo.agregarHijo('switch');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        if (this.listaCasos != undefined) {
            this.listaCasos.forEach(function (element) {
                nodo.agregarHijoAST(element.getNodo());
            });
        }
        if (this.defecto != undefined) {
            nodo.agregarHijoAST(this.defecto.getNodo());
        }
        nodo.agregarHijo('}');
        return nodo;
    };
    condSwitch.prototype.interpretar = function (arbol, tabla) {
        if (this.listaCasos != undefined) {
            for (var _i = 0, _a = this.listaCasos; _i < _a.length; _i++) {
                var caso = _a[_i];
                caso.expresionCase = this.expresion;
                var a = caso.interpretar(arbol, tabla);
                if (a instanceof Errores_1.default) {
                    Listado_Errores_1.listaErrores.push(a);
                    arbol.actualizaConsola(a.returnError());
                }
                if (a instanceof Return_1.default)
                    return a;
                if (a == 'ByLyContinue') {
                    Listado_Errores_1.listaErrores.push(new Errores_1.default('SEMANTICO', 'CONTINUE FUERA DE CICLO', this.fila, this.columna));
                    arbol.actualizaConsola(a.returnError());
                }
                if (a == 'ByLy23')
                    return;
            }
            //caso solo casos
        }
        if (this.defecto != undefined) {
            var a = this.defecto.interpretar(arbol, tabla);
            if (a instanceof Errores_1.default) {
                Listado_Errores_1.listaErrores.push(a);
                arbol.actualizaConsola(a.returnError());
            }
            if (a instanceof Return_1.default)
                return a;
            if (a == 'ByLyContinue') {
                Listado_Errores_1.listaErrores.push(new Errores_1.default('SEMANTICO', 'CONTINUE FUERA DE CICLO', this.fila, this.columna));
                arbol.actualizaConsola(a.returnError());
            }
            if (a == 'ByLy23')
                return;
        }
    };
    return condSwitch;
}(Instruccion_1.Instruccion));
exports.default = condSwitch;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../Return":32}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condSwitchCase = /** @class */ (function (_super) {
    __extends(condSwitchCase, _super);
    function condSwitchCase(fila, columna, expresion, instrucciones) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.expresion = expresion;
        _this.instrucciones = instrucciones;
        return _this;
    }
    condSwitchCase.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('CASE');
        nodo.agregarHijo('case');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(':');
        this.instrucciones.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        return nodo;
    };
    condSwitchCase.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        var val = this.expresion.interpretar(arbol, tabla);
        var valExpresion = (_a = this.expresionCase) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
        if (this.expresion.tipoDato.getTipo() ==
            ((_b = this.expresionCase) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo())) {
            if (val == valExpresion) {
                var nuevaTabla = new tablaSimbolos_1.default(tabla);
                nuevaTabla.setNombre('Case');
                for (var i = 0; i < this.instrucciones.length; i++) {
                    var a = this.instrucciones[i].interpretar(arbol, nuevaTabla);
                    if (a instanceof Errores_1.default) {
                        Listado_Errores_1.listaErrores.push(a);
                        arbol.actualizaConsola(a.returnError());
                    }
                    if (a instanceof Return_1.default)
                        return a;
                    if (a == 'ByLyContinue')
                        return a;
                    if (a == 'ByLy23')
                        return a;
                }
            }
        }
        else {
            return new Errores_1.default('SEMANTICO', 'VARIABLE  TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
        }
    };
    return condSwitchCase;
}(Instruccion_1.Instruccion));
exports.default = condSwitchCase;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../../Excepciones/Errores"));
var Listado_Errores_1 = require("../../Excepciones/Listado_Errores");
var tablaSimbolos_1 = __importDefault(require("../../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../../TS/Tipo"));
var Return_1 = __importDefault(require("../Return"));
var condSwitchCase = /** @class */ (function (_super) {
    __extends(condSwitchCase, _super);
    function condSwitchCase(fila, columna, instrucciones) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.instrucciones = instrucciones;
        return _this;
    }
    condSwitchCase.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('DEFAULT');
        nodo.agregarHijo('default');
        nodo.agregarHijo(':');
        this.instrucciones.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        return nodo;
    };
    condSwitchCase.prototype.interpretar = function (arbol, tabla) {
        var nuevaTabla = new tablaSimbolos_1.default(tabla);
        nuevaTabla.setNombre('default');
        for (var i = 0; i < this.instrucciones.length; i++) {
            var a = this.instrucciones[i].interpretar(arbol, nuevaTabla);
            if (a instanceof Errores_1.default) {
                Listado_Errores_1.listaErrores.push(a);
                arbol.actualizaConsola(a.returnError());
            }
            if (a instanceof Return_1.default)
                return a;
            if (a == 'ByLyContinue')
                return a;
            if (a == 'ByLy23')
                return a;
        }
    };
    return condSwitchCase;
}(Instruccion_1.Instruccion));
exports.default = condSwitchCase;

},{"../../Abstracto/Instruccion":4,"../../Abstracto/nodoAST":5,"../../Excepciones/Errores":6,"../../Excepciones/Listado_Errores":7,"../../TS/Tipo":45,"../../TS/tablaSimbolos":46,"../Return":32}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Continue = /** @class */ (function (_super) {
    __extends(Continue, _super);
    function Continue(fila, columna) {
        return _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
    }
    Continue.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('CONTINUE');
        nodo.agregarHijo('continue');
        nodo.agregarHijo(';');
        return nodo;
    };
    Continue.prototype.interpretar = function (arbol, tabla) {
        return 'ByLyContinue';
    };
    return Continue;
}(Instruccion_1.Instruccion));
exports.default = Continue;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../TS/Tipo":45}],25:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var reporteTabla_1 = require("../../Reportes/reporteTabla");
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Simbolo_1 = __importDefault(require("../TS/Simbolo"));
var Tipo_1 = require("../TS/Tipo");
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Declaracion = /** @class */ (function (_super) {
    __extends(Declaracion, _super);
    function Declaracion(tipo, fila, columna, id, valor) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.tipo = tipo;
        _this.identificador = id;
        _this.valor = valor;
        return _this;
    }
    Declaracion.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('DECLARACION');
        nodo.agregarHijo(cambiarTipo_1.default(this.tipo.getTipo()) + '');
        nodo.agregarHijo(this.identificador);
        if (this.valor != undefined) {
            nodo.agregarHijo('=');
            nodo.agregarHijoAST(this.valor.getNodo());
        }
        nodo.agregarHijo(';');
        return nodo;
    };
    Declaracion.prototype.interpretar = function (arbol, tabla) {
        if (this.valor === undefined) {
            switch (this.tipo.getTipo()) {
                case Tipo_1.tipoDato.ENTERO:
                    if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, 0)) ==
                        'La variable existe actualmente') {
                        return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                    }
                    else {
                        if (!arbol.actualizarTabla(this.identificador, '0', this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                            var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, '0', 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                            arbol.listaSimbolos.push(nuevoSimbolo);
                        }
                    }
                    break;
                case Tipo_1.tipoDato.DECIMAL:
                    if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, 0.0)) == 'La variable existe actualmente') {
                        return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                    }
                    else {
                        if (!arbol.actualizarTabla(this.identificador, '0.0', this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                            var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, '0.0', 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                            arbol.listaSimbolos.push(nuevoSimbolo);
                        }
                    }
                    break;
                case Tipo_1.tipoDato.CARACTER:
                    if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, '\u0000')) == 'La variable existe actualmente') {
                        return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                    }
                    else {
                        if (!arbol.actualizarTabla(this.identificador, '\u0000', this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                            var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, '\u0000', 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                            arbol.listaSimbolos.push(nuevoSimbolo);
                        }
                    }
                    break;
                case Tipo_1.tipoDato.CADENA:
                    if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, '')) ==
                        'La variable existe actualmente') {
                        return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                    }
                    else {
                        if (!arbol.actualizarTabla(this.identificador, '', this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                            var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, '', 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                            arbol.listaSimbolos.push(nuevoSimbolo);
                        }
                    }
                    break;
                case Tipo_1.tipoDato.BOOLEANO:
                    if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, true)) == 'La variable existe actualmente') {
                        return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                    }
                    else {
                        if (!arbol.actualizarTabla(this.identificador, 'true', this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                            var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, 'true', 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                            arbol.listaSimbolos.push(nuevoSimbolo);
                        }
                    }
                    break;
            }
        }
        else {
            var val = this.valor.interpretar(arbol, tabla);
            if (this.tipo.getTipo() != this.valor.tipoDato.getTipo()) {
                return new Errores_1.default('SEMANTICO', 'TIPO DE VALOR DIFERENTE', this.fila, this.columna);
            }
            else {
                if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, val)) ==
                    'La variable existe actualmente') {
                    return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                }
                else {
                    if (!arbol.actualizarTabla(this.identificador, val, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                        var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, val, 'Variable', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                        arbol.listaSimbolos.push(nuevoSimbolo);
                    }
                }
            }
        }
    };
    return Declaracion;
}(Instruccion_1.Instruccion));
exports.default = Declaracion;

},{"../../Reportes/cambiarTipo":48,"../../Reportes/reporteTabla":49,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Simbolo":44,"../TS/Tipo":45}],26:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Identificador_1 = __importDefault(require("../Expresiones/Identificador"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Incremento = /** @class */ (function (_super) {
    __extends(Incremento, _super);
    function Incremento(identificador, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador;
        return _this;
    }
    Incremento.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('DECREMENTO');
        nodo.agregarHijoAST(this.identificador.getNodo());
        nodo.agregarHijo('-');
        nodo.agregarHijo('-');
        return nodo;
    };
    Incremento.prototype.interpretar = function (arbol, tabla) {
        //tomar el tipoDato de la variable
        if (this.identificador instanceof Identificador_1.default) {
            var variable = tabla.getVariable(this.identificador.identificador);
            if (variable != null) {
                if (variable.gettipo().getTipo() == Tipo_1.tipoDato.ENTERO ||
                    variable.gettipo().getTipo() == Tipo_1.tipoDato.DECIMAL) {
                    this.tipoDato.setTipo(variable.gettipo().getTipo());
                    var uno = variable.getvalor();
                    uno--;
                    variable.setvalor(uno);
                }
                else {
                    return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' DEBE SER VALOR NUMERICO', this.fila, this.columna);
                }
            }
            else {
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' NO EXISTE', this.fila, this.columna);
            }
        }
        else {
            var valE = this.identificador.interpretar(arbol, tabla);
            if (valE instanceof Errores_1.default)
                return valE;
            if (this.identificador.tipoDato.getTipo() == Tipo_1.tipoDato.ENTERO) {
                this.tipoDato.setTipo(Tipo_1.tipoDato.ENTERO);
                var otro = parseInt(valE);
                otro--;
                return otro;
            }
            else if (this.identificador.tipoDato.getTipo() == Tipo_1.tipoDato.DECIMAL) {
                this.tipoDato.setTipo(Tipo_1.tipoDato.DECIMAL);
                var otro = parseFloat(valE);
                otro--;
                return otro;
            }
            else {
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' DEBE SER VALOR NUMERICO', this.fila, this.columna);
            }
        }
    };
    return Incremento;
}(Instruccion_1.Instruccion));
exports.default = Incremento;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../Expresiones/Identificador":10,"../TS/Tipo":45}],27:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var tablaSimbolos_1 = __importDefault(require("../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Declaracion_1 = __importDefault(require("./Declaracion"));
var Metodos_1 = __importDefault(require("./Metodos"));
var Exec = /** @class */ (function (_super) {
    __extends(Exec, _super);
    function Exec(identificador, parametros, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.parametros = parametros;
        return _this;
    }
    Exec.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('EXEC');
        nodo.agregarHijo('exec');
        nodo.agregarHijo(this.identificador + '');
        nodo.agregarHijo('(');
        this.parametros.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo(')');
        nodo.agregarHijo(';');
        return nodo;
    };
    Exec.prototype.interpretar = function (arbol, tabla) {
        var _a;
        var funcion = arbol.getFuncion(this.identificador);
        if (funcion == null)
            return new Errores_1.default('SEMANTICO', 'NO SE ENCONTRO LA FUNCION', this.fila, this.columna);
        if (funcion instanceof Metodos_1.default) {
            var metodo = funcion;
            if (metodo.parametros.length == ((_a = this.parametros) === null || _a === void 0 ? void 0 : _a.length)) {
                var nuevaTabla = new tablaSimbolos_1.default(arbol.gettablaGlobal());
                for (var param = 0; param < this.parametros.length; param++) {
                    var newVal = this.parametros[param].interpretar(arbol, tabla);
                    if (newVal instanceof Errores_1.default)
                        return newVal;
                    var dec = new Declaracion_1.default(metodo.parametros[param].tipato, metodo.fila, metodo.columna, metodo.parametros[param].identificador);
                    var nuevaDec = dec.interpretar(arbol, nuevaTabla);
                    if (nuevaDec instanceof Errores_1.default)
                        return nuevaDec;
                    var variable = nuevaTabla.getVariable(metodo.parametros[param].identificador);
                    if (variable != null) {
                        if (variable.gettipo().getTipo() !=
                            this.parametros[param].tipoDato.getTipo()) {
                            return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                                metodo.parametros[param].identificador +
                                ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
                        }
                        else {
                            variable.setvalor(newVal);
                            nuevaTabla.setNombre(funcion.identificador);
                        }
                    }
                    else {
                        return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                            metodo.parametros[param].identificador +
                            ' NO EXISTE', this.fila, this.columna);
                    }
                }
                var nuevMet = metodo.interpretar(arbol, nuevaTabla);
                if (nuevMet instanceof Errores_1.default)
                    return nuevMet;
            }
            else {
                return new Errores_1.default('SEMANTICO', 'PARAMETROS NO COINCIDENTES', this.fila, this.columna);
            }
        }
    };
    return Exec;
}(Instruccion_1.Instruccion));
exports.default = Exec;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45,"../TS/tablaSimbolos":46,"./Declaracion":25,"./Metodos":31}],28:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Return_1 = __importDefault(require("./Return"));
var Funciones = /** @class */ (function (_super) {
    __extends(Funciones, _super);
    function Funciones(tipo, fila, columna, identificador, parametros, instrucciones) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.parametros = parametros;
        _this.instrucciones = instrucciones;
        return _this;
    }
    Funciones.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('FUNCION');
        nodo.agregarHijo(cambiarTipo_1.default(this.tipoDato.getTipo()) + '');
        nodo.agregarHijo(this.identificador + '');
        nodo.agregarHijo('(');
        var nuevo = null;
        if (this.parametros.length > 0) {
            nuevo = new nodoAST_1.default('PARAMETROS');
        }
        for (var param = 0; param < this.parametros.length; param++) {
            if (nuevo == null)
                break;
            var vari = cambiarTipo_1.default(this.parametros[param].tipato.getTipo());
            var ide = this.parametros[param].identificador;
            if (vari != null)
                nuevo.agregarHijo(vari);
            if (ide != null)
                nuevo.agregarHijo(ide);
            if (param != this.parametros.length - 1)
                nuevo.agregarHijo(',');
        }
        if (nuevo != null)
            nodo.agregarHijoAST(nuevo);
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        this.instrucciones.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('}');
        return nodo;
    };
    Funciones.prototype.interpretar = function (arbol, tabla) {
        for (var i = 0; i < this.instrucciones.length; i++) {
            var val = this.instrucciones[i].interpretar(arbol, tabla);
            if (val instanceof Errores_1.default)
                return val;
            if (val instanceof Return_1.default) {
                if (val.valor != null) {
                    if (this.tipoDato.getTipo() == val.tipoDato.getTipo())
                        return val.valor;
                    else
                        return new Errores_1.default('SEMANTICO', 'TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
                }
                else {
                    return new Errores_1.default('SEMANTICO', 'DEBE DEVOLVER UN VALOR EN LA FUNCION', this.fila, this.columna);
                }
            }
        }
    };
    return Funciones;
}(Instruccion_1.Instruccion));
exports.default = Funciones;

},{"../../Reportes/cambiarTipo":48,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"./Return":32}],29:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Identificador_1 = __importDefault(require("../Expresiones/Identificador"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Decremento = /** @class */ (function (_super) {
    __extends(Decremento, _super);
    function Decremento(identificador, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador;
        return _this;
    }
    Decremento.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('INCREMENTO');
        nodo.agregarHijoAST(this.identificador.getNodo());
        nodo.agregarHijo('+');
        nodo.agregarHijo('+');
        return nodo;
    };
    Decremento.prototype.interpretar = function (arbol, tabla) {
        //tomar el tipoDato de la variable
        if (this.identificador instanceof Identificador_1.default) {
            var variable = tabla.getVariable(this.identificador.identificador);
            if (variable != null) {
                if (variable.gettipo().getTipo() == Tipo_1.tipoDato.ENTERO ||
                    variable.gettipo().getTipo() == Tipo_1.tipoDato.DECIMAL) {
                    this.tipoDato.setTipo(variable.gettipo().getTipo());
                    var uno = variable.getvalor();
                    uno++;
                    variable.setvalor(uno);
                }
                else {
                    return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' DEBE SER VALOR NUMERICO', this.fila, this.columna);
                }
            }
            else {
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' NO EXISTE', this.fila, this.columna);
            }
        }
        else {
            var valE = this.identificador.interpretar(arbol, tabla);
            if (valE instanceof Errores_1.default)
                return valE;
            if (this.identificador.tipoDato.getTipo() == Tipo_1.tipoDato.ENTERO) {
                this.tipoDato.setTipo(Tipo_1.tipoDato.ENTERO);
                var otro = parseInt(valE);
                otro++;
                return otro;
            }
            else if (this.identificador.tipoDato.getTipo() == Tipo_1.tipoDato.DECIMAL) {
                this.tipoDato.setTipo(Tipo_1.tipoDato.DECIMAL);
                var otro = parseFloat(valE);
                otro++;
                return otro;
            }
            else {
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' DEBE SER VALOR NUMERICO', this.fila, this.columna);
            }
        }
    };
    return Decremento;
}(Instruccion_1.Instruccion));
exports.default = Decremento;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../Expresiones/Identificador":10,"../TS/Tipo":45}],30:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var reporteTabla_1 = require("../../Reportes/reporteTabla");
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var tablaSimbolos_1 = __importDefault(require("../TS/tablaSimbolos"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Declaracion_1 = __importDefault(require("./Declaracion"));
var declaracionListas_1 = __importDefault(require("./declaracionListas"));
var declaracionVectores_1 = __importDefault(require("./declaracionVectores"));
var Funciones_1 = __importDefault(require("./Funciones"));
var Metodos_1 = __importDefault(require("./Metodos"));
var LlamadaFuncMetd = /** @class */ (function (_super) {
    __extends(LlamadaFuncMetd, _super);
    function LlamadaFuncMetd(identificador, parametros, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.parametros = parametros;
        return _this;
    }
    LlamadaFuncMetd.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('LLAMADA');
        nodo.agregarHijo(this.identificador + '');
        nodo.agregarHijo('(');
        this.parametros.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo(')');
        return nodo;
    };
    LlamadaFuncMetd.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        var funcion = arbol.getFuncion(this.identificador);
        if (funcion == null)
            return new Errores_1.default('SEMANTICO', 'NO SE ENCONTRO LA FUNCION', this.fila, this.columna);
        if (funcion instanceof Metodos_1.default) {
            var metodo = funcion;
            if (metodo.parametros.length == ((_a = this.parametros) === null || _a === void 0 ? void 0 : _a.length)) {
                var nuevaTabla = new tablaSimbolos_1.default(arbol.gettablaGlobal());
                for (var param = 0; param < this.parametros.length; param++) {
                    var newVal = this.parametros[param].interpretar(arbol, tabla);
                    if (newVal instanceof Errores_1.default)
                        return newVal;
                    var dec = void 0;
                    if (metodo.parametros[param].arreglo) {
                        dec = new declaracionVectores_1.default(metodo.parametros[param].tipato, metodo.parametros[param].identificador, false, metodo.fila, metodo.columna);
                    }
                    else if (metodo.parametros[param].lista) {
                        dec = new declaracionListas_1.default(metodo.parametros[param].tipato, metodo.parametros[param].identificador, metodo.fila, metodo.columna, metodo.parametros[param].tipato, undefined);
                    }
                    else {
                        dec = new Declaracion_1.default(metodo.parametros[param].tipato, metodo.fila, metodo.columna, metodo.parametros[param].identificador);
                    }
                    var nuevaDec = dec.interpretar(arbol, nuevaTabla);
                    if (nuevaDec instanceof Errores_1.default)
                        return nuevaDec;
                    var variable = nuevaTabla.getVariable(metodo.parametros[param].identificador);
                    if (variable != null) {
                        if (variable.gettipo().getTipo() !=
                            this.parametros[param].tipoDato.getTipo()) {
                            return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                                metodo.parametros[param].identificador +
                                ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
                        }
                        else {
                            variable.setvalor(newVal);
                            nuevaTabla.setNombre(metodo.identificador);
                            if (!arbol.actualizarTabla(this.identificador.toString(), '', this.fila.toString(), nuevaTabla.getNombre().toString(), this.columna.toString())) {
                                var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, '', 'Metodo', 'Void', nuevaTabla.getNombre(), this.fila.toString(), this.columna.toString());
                                arbol.listaSimbolos.push(nuevoSimbolo);
                            }
                        }
                    }
                    else {
                        return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                            metodo.parametros[param].identificador +
                            ' NO EXISTE', this.fila, this.columna);
                    }
                }
                var nuevMet = metodo.interpretar(arbol, nuevaTabla);
                if (nuevMet instanceof Errores_1.default)
                    return nuevMet;
            }
            else {
                return new Errores_1.default('SEMANTICO', 'PARAMETROS NO COINCIDENTES', this.fila, this.columna);
            }
        }
        else if (funcion instanceof Funciones_1.default) {
            var metodo = funcion;
            if (metodo.parametros.length == ((_b = this.parametros) === null || _b === void 0 ? void 0 : _b.length)) {
                var nuevaTabla = new tablaSimbolos_1.default(arbol.gettablaGlobal());
                for (var param = 0; param < this.parametros.length; param++) {
                    var newVal = this.parametros[param].interpretar(arbol, tabla);
                    if (newVal instanceof Errores_1.default)
                        return newVal;
                    var dec = new Declaracion_1.default(metodo.parametros[param].tipato, metodo.fila, metodo.columna, metodo.parametros[param].identificador);
                    var nuevaDec = dec.interpretar(arbol, nuevaTabla);
                    if (nuevaDec instanceof Errores_1.default)
                        return nuevaDec;
                    var variable = nuevaTabla.getVariable(metodo.parametros[param].identificador);
                    if (variable != null) {
                        if (variable.gettipo().getTipo() !=
                            this.parametros[param].tipoDato.getTipo()) {
                            return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                                metodo.parametros[param].identificador +
                                ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
                        }
                        else {
                            variable.setvalor(newVal);
                            nuevaTabla.setNombre(metodo.identificador);
                            if (!arbol.actualizarTabla(metodo.identificador.toString(), newVal, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                                var nuevoSimbolo = new reporteTabla_1.reporteTabla(metodo.identificador, newVal, 'Funcion', cambiarTipo_1.default(this.tipoDato.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                                arbol.listaSimbolos.push(nuevoSimbolo);
                            }
                            //nueva variable
                        }
                    }
                    else {
                        return new Errores_1.default('SEMANTICO', 'VARIABLE ' +
                            metodo.parametros[param].identificador +
                            ' NO EXISTE', this.fila, this.columna);
                    }
                }
                var nuevMet = metodo.interpretar(arbol, nuevaTabla);
                if (nuevMet instanceof Errores_1.default)
                    return nuevMet;
                this.tipoDato = metodo.tipoDato;
                return nuevMet;
            }
            else {
                return new Errores_1.default('SEMANTICO', 'PARAMETROS NO COINCIDENTES', this.fila, this.columna);
            }
        }
    };
    return LlamadaFuncMetd;
}(Instruccion_1.Instruccion));
exports.default = LlamadaFuncMetd;

},{"../../Reportes/cambiarTipo":48,"../../Reportes/reporteTabla":49,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45,"../TS/tablaSimbolos":46,"./Declaracion":25,"./Funciones":28,"./Metodos":31,"./declaracionListas":39,"./declaracionVectores":40}],31:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Return_1 = __importDefault(require("./Return"));
var Metodos = /** @class */ (function (_super) {
    __extends(Metodos, _super);
    function Metodos(tipo, fila, columna, identificador, parametros, instrucciones) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.parametros = parametros;
        _this.instrucciones = instrucciones;
        return _this;
    }
    Metodos.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('METODO');
        nodo.agregarHijo('void');
        nodo.agregarHijo(this.identificador + '');
        nodo.agregarHijo('(');
        var nuevo = null;
        if (this.parametros.length > 0) {
            nuevo = new nodoAST_1.default('PARAMETROS');
        }
        for (var param = 0; param < this.parametros.length; param++) {
            if (nuevo == null)
                break;
            var vari = cambiarTipo_1.default(this.parametros[param].tipato.getTipo());
            var ide = this.parametros[param].identificador;
            if (vari != null)
                nuevo.agregarHijo(vari);
            if (ide != null)
                nuevo.agregarHijo(ide);
            if (param != this.parametros.length - 1)
                nuevo.agregarHijo(',');
        }
        if (nuevo != null)
            nodo.agregarHijoAST(nuevo);
        nodo.agregarHijo(')');
        nodo.agregarHijo('{');
        this.instrucciones.forEach(function (element) {
            nodo.agregarHijoAST(element.getNodo());
        });
        nodo.agregarHijo('}');
        return nodo;
    };
    Metodos.prototype.interpretar = function (arbol, tabla) {
        for (var i = 0; i < this.instrucciones.length; i++) {
            var val = this.instrucciones[i].interpretar(arbol, tabla);
            if (val instanceof Errores_1.default)
                return val;
            if (this.instrucciones[i] instanceof Return_1.default) {
                if (val instanceof Return_1.default) {
                    if (val.valor != null) {
                        return new Errores_1.default('SEMANTICO', 'NO PUEDE DEVOLVER UN VALOR EN UN METODO', this.fila, this.columna);
                    }
                    else
                        break;
                }
                else
                    return new Errores_1.default('SEMANTICO', 'NO PUEDE DEVOLVER UN VALOR EN UN METODO', this.fila, this.columna);
            }
        }
    };
    return Metodos;
}(Instruccion_1.Instruccion));
exports.default = Metodos;

},{"../../Reportes/cambiarTipo":48,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"./Return":32}],32:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Return = /** @class */ (function (_super) {
    __extends(Return, _super);
    function Return(fila, columna, expresion) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.valor = null;
        _this.expresionReturn = expresion;
        return _this;
    }
    Return.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('RETURN');
        nodo.agregarHijo('return');
        if (this.expresionReturn != undefined) {
            nodo.agregarHijoAST(this.expresionReturn.getNodo());
        }
        nodo.agregarHijo(';');
        return nodo;
    };
    Return.prototype.interpretar = function (arbol, tabla) {
        var _a;
        if (this.expresionReturn) {
            this.valor = (_a = this.expresionReturn) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
            this.tipoDato = this.expresionReturn.tipoDato;
        }
        return this;
    };
    return Return;
}(Instruccion_1.Instruccion));
exports.default = Return;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../TS/Tipo":45}],33:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var accesoLista = /** @class */ (function (_super) {
    __extends(accesoLista, _super);
    function accesoLista(identificador, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.expresion = expresion;
        return _this;
    }
    accesoLista.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ACCESO-LISTA');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('[');
        nodo.agregarHijo('[');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(']');
        nodo.agregarHijo(']');
        return nodo;
    };
    accesoLista.prototype.interpretar = function (arbol, tabla) {
        var exp = this.expresion.interpretar(arbol, tabla);
        if (exp instanceof Errores_1.default)
            return exp;
        if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.ENTERO)
            return new Errores_1.default('SEMANTICO', 'TIPO DE DATO DIFERENTE', this.fila, this.columna);
        var ide = tabla.getVariable(this.identificador);
        if (ide != null) {
            this.tipoDato = new Tipo_1.default(ide.gettipo().getTipo());
            return ide.getvalor()[exp];
        }
        return null;
    };
    return accesoLista;
}(Instruccion_1.Instruccion));
exports.default = accesoLista;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],34:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var accesoVector = /** @class */ (function (_super) {
    __extends(accesoVector, _super);
    function accesoVector(identificador, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.expresion = expresion;
        return _this;
    }
    accesoVector.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ACCESO-VECTOR');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('[');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(']');
        return nodo;
    };
    accesoVector.prototype.interpretar = function (arbol, tabla) {
        var exp = this.expresion.interpretar(arbol, tabla);
        if (exp instanceof Errores_1.default)
            return exp;
        if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.ENTERO)
            return new Errores_1.default('SEMANTICO', 'TIPO DE DATO DIFERENTE', this.fila, this.columna);
        var ide = tabla.getVariable(this.identificador);
        if (ide != null) {
            this.tipoDato = new Tipo_1.default(ide.gettipo().getTipo());
            return ide.getvalor()[exp];
        }
        return null;
    };
    return accesoVector;
}(Instruccion_1.Instruccion));
exports.default = accesoVector;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],35:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var agregarLista = /** @class */ (function (_super) {
    __extends(agregarLista, _super);
    function agregarLista(identificador, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.expresion = expresion;
        return _this;
    }
    agregarLista.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ADD-LISTA');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('.');
        nodo.agregarHijo('add');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo(';');
        return nodo;
    };
    agregarLista.prototype.interpretar = function (arbol, tabla) {
        var ide = tabla.getVariable(this.identificador);
        if (ide != null) {
            var arreglo = ide.getvalor();
            var exp = this.expresion.interpretar(arbol, tabla);
            if (exp instanceof Errores_1.default)
                return exp;
            if (ide.gettipo().getTipo() != this.expresion.tipoDato.getTipo())
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
            arreglo.push(exp);
            ide.setvalor(arreglo);
            arbol.actualizarTabla(this.identificador, arreglo, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString());
        }
        else
            return new Errores_1.default('SEMANTICO', "VARIABLE " + this.identificador + " NO EXISTE", this.fila, this.columna);
    };
    return agregarLista;
}(Instruccion_1.Instruccion));
exports.default = agregarLista;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],36:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var asignacionLista = /** @class */ (function (_super) {
    __extends(asignacionLista, _super);
    function asignacionLista(identificador, posicion, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.posicion = posicion;
        _this.expresion = expresion;
        return _this;
    }
    asignacionLista.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ASIGNACION-LISTA');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('[');
        nodo.agregarHijo('[');
        nodo.agregarHijoAST(this.posicion.getNodo());
        nodo.agregarHijo(']');
        nodo.agregarHijo(']');
        nodo.agregarHijo('=');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(';');
        return nodo;
    };
    asignacionLista.prototype.interpretar = function (arbol, tabla) {
        var ide = tabla.getVariable(this.identificador);
        if (ide != null) {
            var pos = this.posicion.interpretar(arbol, tabla);
            if (pos instanceof Errores_1.default)
                return pos;
            if (this.posicion.tipoDato.getTipo() != Tipo_1.tipoDato.ENTERO)
                return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO NUMERICO', this.fila, this.columna);
            var arreglo = ide.getvalor();
            if (pos > arreglo.length)
                return new Errores_1.default('SEMANTICO', 'RANGO FUERA DE LOS LIMITES', this.fila, this.columna);
            var exp = this.expresion.interpretar(arbol, tabla);
            if (exp instanceof Errores_1.default)
                return exp;
            if (ide.gettipo().getTipo() != this.expresion.tipoDato.getTipo())
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
            arreglo[pos] = exp;
            ide.setvalor(arreglo);
            arbol.actualizarTabla(this.identificador, arreglo, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString());
        }
        else
            return new Errores_1.default('SEMANTICO', "VARIABLE " + this.identificador + " NO EXISTE", this.fila, this.columna);
    };
    return asignacionLista;
}(Instruccion_1.Instruccion));
exports.default = asignacionLista;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],37:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var asignacionVector = /** @class */ (function (_super) {
    __extends(asignacionVector, _super);
    function asignacionVector(identificador, posicion, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.posicion = posicion;
        _this.expresion = expresion;
        return _this;
    }
    asignacionVector.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('ASIGNACION-VECTOR');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('[');
        nodo.agregarHijoAST(this.posicion.getNodo());
        nodo.agregarHijo(']');
        nodo.agregarHijo('=');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(';');
        return nodo;
    };
    asignacionVector.prototype.interpretar = function (arbol, tabla) {
        var ide = tabla.getVariable(this.identificador);
        if (ide != null) {
            var pos = this.posicion.interpretar(arbol, tabla);
            if (pos instanceof Errores_1.default)
                return pos;
            if (this.posicion.tipoDato.getTipo() != Tipo_1.tipoDato.ENTERO)
                return new Errores_1.default('SEMANTICO', 'TIPO DE DATO NO NUMERICO', this.fila, this.columna);
            var arreglo = ide.getvalor();
            if (pos > arreglo.length)
                return new Errores_1.default('SEMANTICO', 'RANGO FUERA DE LOS LIMITES', this.fila, this.columna);
            var exp = this.expresion.interpretar(arbol, tabla);
            if (exp instanceof Errores_1.default)
                return exp;
            if (ide.gettipo().getTipo() != this.expresion.tipoDato.getTipo())
                return new Errores_1.default('SEMANTICO', 'VARIABLE ' + this.identificador + ' TIPOS DE DATOS DIFERENTES', this.fila, this.columna);
            arreglo[pos] = exp;
            ide.setvalor(arreglo);
            arbol.actualizarTabla(this.identificador, arreglo, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString());
        }
        else
            return new Errores_1.default('SEMANTICO', "VARIABLE " + this.identificador + " NO EXISTE", this.fila, this.columna);
    };
    return asignacionVector;
}(Instruccion_1.Instruccion));
exports.default = asignacionVector;

},{"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],38:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var casteo = /** @class */ (function (_super) {
    __extends(casteo, _super);
    function casteo(tipo, expresion, fila, columna) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.tipo = tipo;
        _this.expresion = expresion;
        return _this;
    }
    casteo.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('CASTEO');
        nodo.agregarHijo('(');
        nodo.agregarHijo(cambiarTipo_1.default(this.tipo.getTipo()) + '');
        nodo.agregarHijo(')');
        nodo.agregarHijoAST(this.expresion.getNodo());
        return nodo;
    };
    casteo.prototype.interpretar = function (arbol, tabla) {
        var exp = this.expresion.interpretar(arbol, tabla);
        if (exp instanceof Errores_1.default)
            return exp;
        if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.ENTERO) {
            if (this.tipo.getTipo() == Tipo_1.tipoDato.DECIMAL) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                return parseFloat(exp);
            }
            else if (this.tipo.getTipo() == Tipo_1.tipoDato.CADENA) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                return exp.toString();
            }
            else if (this.tipo.getTipo() == Tipo_1.tipoDato.CARACTER) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CARACTER);
                return String.fromCharCode(parseInt(exp));
            }
            else
                return new Errores_1.default('SEMANTICO', 'NO ES POSIBLE EL CASTEO POR TIPO DE DATO', this.fila, this.columna);
        }
        else if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.DECIMAL) {
            if (this.tipo.getTipo() == Tipo_1.tipoDato.ENTERO) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                return parseInt(exp);
            }
            else if (this.tipo.getTipo() == Tipo_1.tipoDato.CADENA) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                return exp.toString();
            }
            else
                return new Errores_1.default('SEMANTICO', 'NO ES POSIBLE EL CASTEO POR TIPO DE DATO', this.fila, this.columna);
        }
        else if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.CARACTER) {
            if (this.tipo.getTipo() == Tipo_1.tipoDato.ENTERO) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                var da = exp + '';
                var res = da.charCodeAt(0);
                return res;
            }
            else if (this.tipo.getTipo() == Tipo_1.tipoDato.DECIMAL) {
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.DECIMAL);
                var da = exp + '';
                var res = da.charCodeAt(0);
                return res;
            }
            else
                return new Errores_1.default('SEMANTICO', 'NO ES POSIBLE EL CASTEO POR TIPO DE DATO', this.fila, this.columna);
        }
        else
            return new Errores_1.default('SEMANTICO', 'NO ES POSIBLE EL CASTEO POR TIPO DE DATO', this.fila, this.columna);
    };
    return casteo;
}(Instruccion_1.Instruccion));
exports.default = casteo;

},{"../../Reportes/cambiarTipo":48,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],39:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var reporteTabla_1 = require("../../Reportes/reporteTabla");
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Simbolo_1 = __importDefault(require("../TS/Simbolo"));
var declaracionListas = /** @class */ (function (_super) {
    __extends(declaracionListas, _super);
    function declaracionListas(tipo, identificador, fila, columna, tipoVector, expresion) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.tipo = tipo;
        _this.identificador = identificador.toLowerCase();
        _this.tipoVector = tipoVector;
        _this.expresion = expresion;
        return _this;
    }
    declaracionListas.prototype.getNodo = function () {
        var _a;
        var nodo = new nodoAST_1.default('LISTAS');
        nodo.agregarHijo('list');
        nodo.agregarHijo('<');
        nodo.agregarHijo(cambiarTipo_1.default(this.tipo.getTipo()) + '');
        nodo.agregarHijo('>');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('=');
        nodo.agregarHijo('new');
        nodo.agregarHijo('list');
        nodo.agregarHijo('<');
        nodo.agregarHijo(cambiarTipo_1.default((_a = this.tipoVector) === null || _a === void 0 ? void 0 : _a.getTipo()) + '');
        nodo.agregarHijo('>');
        nodo.agregarHijo(';');
        return nodo;
    };
    declaracionListas.prototype.interpretar = function (arbol, tabla) {
        var _a, _b;
        if (this.tipoVector != null) {
            if (this.tipo.getTipo() != this.tipoVector.getTipo())
                return new Errores_1.default('SEMANTICO', 'TIPOS DE DATOS DIFERENTES EN DECLARACION', this.fila, this.columna);
            else {
                var arreglo = new Array();
                if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, arreglo)) == 'La variable existe actualmente')
                    return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                else {
                    if (!arbol.actualizarTabla(this.identificador, arreglo.toString(), this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                        var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, arreglo.toString(), 'lista', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                        arbol.listaSimbolos.push(nuevoSimbolo);
                    }
                }
            }
        }
        else {
            var exp = (_a = this.expresion) === null || _a === void 0 ? void 0 : _a.interpretar(arbol, tabla);
            if (exp instanceof Errores_1.default)
                return exp;
            if (this.tipo.getTipo() != ((_b = this.expresion) === null || _b === void 0 ? void 0 : _b.tipoDato.getTipo()))
                return new Errores_1.default('SEMANTICO', 'TIPOS DE DATOS DIFERENTES EN DECLARACION', this.fila, this.columna);
            var arreglo = new Array();
            for (var i = 0; i < exp.length; i++) {
                arreglo.push(exp[i]);
            }
            if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, arreglo)) == 'La variable existe actualmente')
                return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
            else {
                if (!arbol.actualizarTabla(this.identificador, arreglo.toString(), this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                    var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, arreglo.toString(), 'lista', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                    arbol.listaSimbolos.push(nuevoSimbolo);
                }
            }
        }
    };
    return declaracionListas;
}(Instruccion_1.Instruccion));
exports.default = declaracionListas;

},{"../../Reportes/cambiarTipo":48,"../../Reportes/reporteTabla":49,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Simbolo":44}],40:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var reporteTabla_1 = require("../../Reportes/reporteTabla");
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Simbolo_1 = __importDefault(require("../TS/Simbolo"));
var Tipo_1 = require("../TS/Tipo");
var declaracionVectores = /** @class */ (function (_super) {
    __extends(declaracionVectores, _super);
    function declaracionVectores(tipo, identificador, tipoDeclaracion, fila, columna, cantidad, tipoVector, listaValores) {
        var _this = _super.call(this, tipo, fila, columna) || this;
        _this.tipo = tipo;
        _this.identificador = identificador;
        _this.tipoDeclaracion = tipoDeclaracion;
        _this.cantidad = cantidad;
        _this.tipoVector = tipoVector;
        _this.listaValores = listaValores;
        return _this;
    }
    declaracionVectores.prototype.getNodo = function () {
        var _a, _b;
        var nodo = new nodoAST_1.default('VECTORES');
        nodo.agregarHijo(cambiarTipo_1.default(this.tipo.getTipo()) + '');
        nodo.agregarHijo('[');
        nodo.agregarHijo(']');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('=');
        if (this.tipoDeclaracion) {
            nodo.agregarHijo('[');
            nodo.agregarHijoAST((_a = this.cantidad) === null || _a === void 0 ? void 0 : _a.getNodo());
            nodo.agregarHijo(']');
        }
        else {
            nodo.agregarHijo('{');
            (_b = this.listaValores) === null || _b === void 0 ? void 0 : _b.forEach(function (res) {
                nodo.agregarHijoAST(res.getNodo());
                nodo.agregarHijo(',');
            });
            nodo.agregarHijo('}');
        }
        nodo.agregarHijo(';');
        return nodo;
    };
    declaracionVectores.prototype.interpretar = function (arbol, tabla) {
        var _a, _b, _c;
        if (this.tipoDeclaracion) {
            if (this.tipoVector == null)
                return new Errores_1.default('SINTACTICO', 'NO EXISTE TIPO DE DATO DE VECTOR', this.fila, this.columna);
            if (this.tipo.getTipo() != ((_a = this.tipoVector) === null || _a === void 0 ? void 0 : _a.getTipo()))
                return new Errores_1.default('SEMANTICO', 'TIPOS DE DATOS DIFERENTES EN DECLARACION', this.fila, this.columna);
            else {
                var numero = (_b = this.cantidad) === null || _b === void 0 ? void 0 : _b.interpretar(arbol, tabla);
                if (numero instanceof Errores_1.default)
                    return numero;
                if (((_c = this.cantidad) === null || _c === void 0 ? void 0 : _c.tipoDato.getTipo()) != Tipo_1.tipoDato.ENTERO)
                    return new Errores_1.default('SEMANTICO', 'VARIABLE NO ES TIPO ENTERO', this.fila, this.columna);
                var num = parseInt(numero);
                var arreglo = [];
                for (var i = 0; i < num; i++) {
                    arreglo[i] = [];
                }
                if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, arreglo)) == 'La variable existe actualmente')
                    return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
                else {
                    if (!arbol.actualizarTabla(this.identificador, arreglo, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                        var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, arreglo, 'vector', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                        arbol.listaSimbolos.push(nuevoSimbolo);
                    }
                }
            }
        }
        else {
            var arreglo = [];
            if (this.listaValores == null)
                this.listaValores = [];
            for (var i = 0; i < this.listaValores.length; i++) {
                var valor = this.listaValores[i].interpretar(arbol, tabla);
                if (valor instanceof Errores_1.default)
                    return valor;
                if (this.tipo.getTipo() != this.listaValores[i].tipoDato.getTipo())
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO DIFERENTE', this.fila, this.columna);
                arreglo[i] = valor;
            }
            if (tabla.setVariable(new Simbolo_1.default(this.tipo, this.identificador, arreglo)) == 'La variable existe actualmente')
                return new Errores_1.default('SEMANTICO', 'LA VARIABLE ' + this.identificador + ' EXISTE ACTUALMENTE', this.fila, this.columna);
            else {
                if (!arbol.actualizarTabla(this.identificador, arreglo, this.fila.toString(), tabla.getNombre().toString(), this.columna.toString())) {
                    var nuevoSimbolo = new reporteTabla_1.reporteTabla(this.identificador, arreglo, 'vector', cambiarTipo_1.default(this.tipo.getTipo()) + '', tabla.getNombre(), this.fila.toString(), this.columna.toString());
                    arbol.listaSimbolos.push(nuevoSimbolo);
                }
            }
            //declaracion tipo 2
        }
    };
    return declaracionVectores;
}(Instruccion_1.Instruccion));
exports.default = declaracionVectores;

},{"../../Reportes/cambiarTipo":48,"../../Reportes/reporteTabla":49,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Simbolo":44,"../TS/Tipo":45}],41:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Identificador_1 = __importDefault(require("../Expresiones/Identificador"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var funcNativa = /** @class */ (function (_super) {
    __extends(funcNativa, _super);
    function funcNativa(identificador, expresion, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.ENTERO), fila, columna) || this;
        _this.identificador = identificador.toLowerCase();
        _this.expresion = expresion;
        if (expresion instanceof Identificador_1.default)
            _this.ide = expresion.identificador.toString();
        else
            _this.ide = '';
        return _this;
    }
    funcNativa.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('FUNCION-NATIVA');
        nodo.agregarHijo(this.identificador);
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.expresion.getNodo());
        nodo.agregarHijo(')');
        return nodo;
    };
    funcNativa.prototype.interpretar = function (arbol, tabla) {
        var exp = this.expresion.interpretar(arbol, tabla);
        if (exp instanceof Errores_1.default)
            return exp;
        switch (this.identificador) {
            case 'tolowercase':
                if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION TOLOWER', this.fila, this.columna);
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                return exp.toString().toLowerCase();
            case 'touppercase':
                if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION TOUPPER', this.fila, this.columna);
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                return exp.toString().toUpperCase();
            case 'length':
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                var vec = arbol.BuscarTipo(this.ide);
                if (vec == 'lista' || vec == 'vector')
                    return exp.length;
                else if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.CADENA)
                    return exp.length;
                else
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION LENGTH', this.fila, this.columna);
            case 'toint':
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
                if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.DECIMAL ||
                    this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.ENTERO)
                    return Math.trunc(parseFloat(exp));
                else
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION TRUNCATE', this.fila, this.columna);
            case 'typeof':
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                var tipo = arbol.BuscarTipo(this.ide);
                if (tipo == 'lista' || tipo == 'vector')
                    return tipo.toString();
                else
                    return cambiarTipo_1.default(this.expresion.tipoDato.getTipo());
            case 'string':
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                if (this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.DECIMAL ||
                    this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.ENTERO ||
                    this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.BOOLEANO ||
                    this.expresion.tipoDato.getTipo() == Tipo_1.tipoDato.CARACTER)
                    return exp.toString();
                else
                    try {
                        return exp.toString();
                    }
                    catch (error) {
                        return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION TOSTRING', this.fila, this.columna);
                    }
            case 'int':
                if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION INT', this.fila, this.columna);
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                try {
                    return parseInt(exp.toString());
                }
                catch (error) {
                    return new Errores_1.default('SEMANTICO', 'NO SE PUEDE CONVERTIR CADENAS DE CARACTERES A INT', this.fila, this.columna);
                }
            case 'double':
                if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION DOUBLE', this.fila, this.columna);
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                try {
                    return parseFloat(exp.toString());
                }
                catch (error) {
                    return new Errores_1.default('SEMANTICO', 'NO SE PUEDE CONVERTIR CADENAS DE CARACTERES A DOUBLE', this.fila, this.columna);
                }
            case 'boolean':
                if (this.expresion.tipoDato.getTipo() != Tipo_1.tipoDato.CADENA)
                    return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION BOOLEAN', this.fila, this.columna);
                this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.CADENA);
                try {
                    var valor = exp.toString();
                    if (valor == '1' || valor.toLowerCase() == 'true') {
                        return true;
                    }
                    else if (valor == '0' || valor.toLowerCase() == 'false') {
                        return false;
                    }
                    else {
                        return new Errores_1.default('SEMANTICO', 'NO SE PUEDE CONVERTIR ESTA CADENA A BOOLEAN', this.fila, this.columna);
                    }
                }
                catch (error) {
                    return new Errores_1.default('SEMANTICO', 'NO SE PUEDE CONVERTIR ESTA CADENA A BOOLEAN', this.fila, this.columna);
                }
            default:
                return new Errores_1.default('SEMANTICO', 'TIPO DE DATO INCOMPATIBLE CON FUNCION NATIVA', this.fila, this.columna);
        }
    };
    return funcNativa;
}(Instruccion_1.Instruccion));
exports.default = funcNativa;

},{"../../Reportes/cambiarTipo":48,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../Expresiones/Identificador":10,"../TS/Tipo":45}],42:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("../../shared");
var Instruccion_1 = require("../Abstracto/Instruccion");
var nodoAST_1 = __importDefault(require("../Abstracto/nodoAST"));
var Errores_1 = __importDefault(require("../Excepciones/Errores"));
var Tipo_1 = __importStar(require("../TS/Tipo"));
var Print = /** @class */ (function (_super) {
    __extends(Print, _super);
    function Print(expresion, isSalto, fila, columna) {
        var _this = _super.call(this, new Tipo_1.default(Tipo_1.tipoDato.CADENA), fila, columna) || this;
        _this.expresion = expresion;
        _this.isSalto = isSalto;
        return _this;
    }
    Print.prototype.getNodo = function () {
        var nodo = new nodoAST_1.default('IMPRESION');
        nodo.agregarHijo('print');
        nodo.agregarHijo('(');
        nodo.agregarHijoAST(this.expresion[0].getNodo());
        nodo.agregarHijo(')');
        nodo.agregarHijo(';');
        return nodo;
    };
    Print.prototype.interpretar = function (arbol, tabla) {
        this.expresion.forEach(function (expr) {
            var valor = expr.interpretar(arbol, tabla);
            if (valor instanceof Errores_1.default)
                return valor;
            shared_1.setConsole(valor);
            console.log(valor);
            arbol.actualizaConsola(valor + '');
        });
        if (this.isSalto)
            shared_1.setConsole('\n');
    };
    return Print;
}(Instruccion_1.Instruccion));
exports.default = Print;

},{"../../shared":51,"../Abstracto/Instruccion":4,"../Abstracto/nodoAST":5,"../Excepciones/Errores":6,"../TS/Tipo":45}],43:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tablaSimbolos_1 = __importDefault(require("./tablaSimbolos"));
var Metodos_1 = __importDefault(require("../Instrucciones/Metodos"));
var Funciones_1 = __importDefault(require("../Instrucciones/Funciones"));
var reporteTabla_1 = require("../../Reportes/reporteTabla");
var cambiarTipo_1 = __importDefault(require("../../Reportes/cambiarTipo"));
var Arbol = /** @class */ (function () {
    function Arbol(instrucciones) {
        this.consola = '';
        this.instrucciones = instrucciones;
        this.consola = '';
        this.tablaGlobal = new tablaSimbolos_1.default();
        this.errores = new Array();
        this.funciones = new Array();
        this.listaSimbolos = new Array();
    }
    Arbol.prototype.getSimbolos = function () {
        return this.listaSimbolos;
    };
    Arbol.prototype.actualizarTabla = function (identificador, valor, linea, entorno, columna) {
        for (var _i = 0, _a = this.listaSimbolos; _i < _a.length; _i++) {
            var elemento = _a[_i];
            if (elemento.getIdentificador().toString() == identificador.toLowerCase() &&
                elemento.getEntorno().toString() == entorno.toString()) {
                elemento.setValor(valor);
                elemento.setLinea(linea);
                elemento.setColumna(columna);
                return true;
            }
        }
        return false;
    };
    Arbol.prototype.BuscarTipo = function (identificador) {
        for (var _i = 0, _a = this.listaSimbolos; _i < _a.length; _i++) {
            var elemento = _a[_i];
            if (elemento.getIdentificador() == identificador.toLowerCase()) {
                return elemento.getForma().toString();
            }
        }
        return 'as';
    };
    Arbol.prototype.getFuncion = function (identificador) {
        for (var _i = 0, _a = this.funciones; _i < _a.length; _i++) {
            var f = _a[_i];
            if (f instanceof Metodos_1.default) {
                if (identificador.toLowerCase() ==
                    f.identificador.toLowerCase()) {
                    if (!this.actualizarTabla(f.identificador.toString(), '', f.fila.toString(), '', f.columna.toString())) {
                        var nuevoSimbolo = new reporteTabla_1.reporteTabla(f.identificador, '', 'MetodoCreacion', 'void', '', f.fila.toString(), f.columna.toString());
                        this.listaSimbolos.push(nuevoSimbolo);
                    }
                    return f;
                }
            }
            else if (f instanceof Funciones_1.default) {
                if (identificador.toLowerCase() ==
                    f.identificador.toLowerCase()) {
                    if (!this.actualizarTabla(f.identificador.toString(), '', f.fila.toString(), '', f.columna.toString())) {
                        var nuevoSimbolo = new reporteTabla_1.reporteTabla(f.identificador, '', 'FuncionCreacion', cambiarTipo_1.default(f.tipoDato.getTipo()) + '', '', f.fila.toString(), f.columna.toString());
                        this.listaSimbolos.push(nuevoSimbolo);
                    }
                    return f;
                }
            }
        }
    };
    Arbol.prototype.getfunciones = function () {
        return this.funciones;
    };
    Arbol.prototype.setfunciones = function (value) {
        this.funciones = value;
    };
    Arbol.prototype.geterrores = function () {
        return this.errores;
    };
    Arbol.prototype.seterrores = function (value) {
        this.errores = value;
    };
    Arbol.prototype.getinstrucciones = function () {
        return this.instrucciones;
    };
    Arbol.prototype.setinstrucciones = function (value) {
        this.instrucciones = value;
    };
    Arbol.prototype.getconsola = function () {
        return this.consola;
    };
    Arbol.prototype.setconsola = function (value) {
        this.consola = value;
    };
    Arbol.prototype.actualizaConsola = function (uptodate) {
        this.consola = "" + this.consola + uptodate + "\n";
    };
    Arbol.prototype.gettablaGlobal = function () {
        return this.tablaGlobal;
    };
    Arbol.prototype.settablaGlobal = function (value) {
        this.tablaGlobal = value;
    };
    return Arbol;
}());
exports.default = Arbol;

},{"../../Reportes/cambiarTipo":48,"../../Reportes/reporteTabla":49,"../Instrucciones/Funciones":28,"../Instrucciones/Metodos":31,"./tablaSimbolos":46}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Simbolo = /** @class */ (function () {
    function Simbolo(tipo, identificador, valor) {
        this.tipo = tipo;
        this.identificador = identificador.toLowerCase();
        this.valor = valor;
    }
    //getters y setters
    Simbolo.prototype.gettipo = function () {
        return this.tipo;
    };
    Simbolo.prototype.settipo = function (value) {
        this.tipo = value;
    };
    Simbolo.prototype.getidentificador = function () {
        return this.identificador;
    };
    Simbolo.prototype.setidentificador = function (value) {
        this.identificador = value;
    };
    Simbolo.prototype.getvalor = function () {
        return this.valor;
    };
    Simbolo.prototype.setvalor = function (value) {
        this.valor = value;
    };
    return Simbolo;
}());
exports.default = Simbolo;

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipoDato = void 0;
var Tipo = /** @class */ (function () {
    function Tipo(tipos) {
        this.tipos = tipos;
    }
    Tipo.prototype.getTipo = function () {
        return this.tipos;
    };
    Tipo.prototype.setTipo = function (tipo) {
        this.tipos = tipo;
    };
    Tipo.prototype.igual = function (compara) {
        return (this.tipos = compara.tipos);
    };
    return Tipo;
}());
exports.default = Tipo;
var tipoDato;
(function (tipoDato) {
    tipoDato[tipoDato["ENTERO"] = 0] = "ENTERO";
    tipoDato[tipoDato["DECIMAL"] = 1] = "DECIMAL";
    tipoDato[tipoDato["BOOLEANO"] = 2] = "BOOLEANO";
    tipoDato[tipoDato["CARACTER"] = 3] = "CARACTER";
    tipoDato[tipoDato["CADENA"] = 4] = "CADENA";
    tipoDato[tipoDato["VOID"] = 5] = "VOID";
    tipoDato[tipoDato["NULO"] = 6] = "NULO";
})(tipoDato = exports.tipoDato || (exports.tipoDato = {}));

},{}],46:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Tipo_1 = __importStar(require("./Tipo"));
var tablaSimbolos = /** @class */ (function () {
    function tablaSimbolos(anterior) {
        this.tablaAnterior = anterior;
        this.tablaActual = new Map();
        this.tipoDato = new Tipo_1.default(Tipo_1.tipoDato.ENTERO);
        this.nombreDato = '';
    }
    tablaSimbolos.prototype.getAnterior = function () {
        return this.tablaAnterior;
    };
    tablaSimbolos.prototype.setAnterior = function (anterior) {
        this.tablaAnterior = anterior;
    };
    tablaSimbolos.prototype.getTabla = function () {
        return this.tablaActual;
    };
    tablaSimbolos.prototype.setTabla = function (Tabla) {
        this.tablaActual = Tabla;
    };
    tablaSimbolos.prototype.setVariable = function (simbolo) {
        for (var e = this; e != null; e = e.getAnterior()) {
            var encontrado = (e.getTabla().get(simbolo.getidentificador().toLowerCase()));
            if (encontrado != null) {
                return "La variable existe actualmente";
            }
            break;
        }
        this.tablaActual.set(simbolo.getidentificador().toLowerCase(), simbolo);
        return "creada con exito";
    };
    tablaSimbolos.prototype.getVariable = function (id) {
        for (var e = this; e != null; e = e.getAnterior()) {
            var encontrado = e.getTabla().get(id.toLowerCase());
            if (encontrado != null) {
                return encontrado;
            }
        }
        return null;
    };
    tablaSimbolos.prototype.getNombre = function () {
        return this.nombreDato;
    };
    tablaSimbolos.prototype.setNombre = function (nombre) {
        this.nombreDato = nombre;
    };
    return tablaSimbolos;
}());
exports.default = tablaSimbolos;

},{"./Tipo":45}],47:[function(require,module,exports){
(function (process){(function (){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var analizador = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,23],$V1=[1,24],$V2=[1,44],$V3=[1,25],$V4=[1,27],$V5=[1,39],$V6=[1,40],$V7=[1,41],$V8=[1,42],$V9=[1,43],$Va=[1,45],$Vb=[1,46],$Vc=[1,48],$Vd=[1,49],$Ve=[1,50],$Vf=[1,51],$Vg=[1,52],$Vh=[1,53],$Vi=[1,54],$Vj=[1,28],$Vk=[1,29],$Vl=[1,30],$Vm=[1,31],$Vn=[1,32],$Vo=[1,33],$Vp=[1,34],$Vq=[1,36],$Vr=[1,37],$Vs=[1,38],$Vt=[1,57],$Vu=[1,58],$Vv=[1,59],$Vw=[1,60],$Vx=[1,61],$Vy=[1,62],$Vz=[2,5,27,28,31,35,37,38,39,40,41,43,55,59,60,61,62,63,64,65,72,75,76,79,80,81,82,86,88,89,92,95,99,101,102,103,104,105,106],$VA=[42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,77,90,91],$VB=[2,63],$VC=[1,79],$VD=[2,62],$VE=[1,81],$VF=[1,80],$VG=[1,86],$VH=[1,90],$VI=[1,96],$VJ=[1,97],$VK=[1,98],$VL=[1,99],$VM=[1,100],$VN=[1,101],$VO=[1,102],$VP=[1,103],$VQ=[1,104],$VR=[1,105],$VS=[1,106],$VT=[1,107],$VU=[1,108],$VV=[1,109],$VW=[1,110],$VX=[1,111],$VY=[35,49,65,70],$VZ=[9,30,32,42,43,44,45,46,47,48,49,50,51,52,53,54,56,57,67,77,78,90,91],$V_=[2,28],$V$=[1,124],$V01=[1,138],$V11=[9,30],$V21=[9,30,32,53,54,67,77,78,90,91],$V31=[1,165],$V41=[32,67],$V51=[1,168],$V61=[30,32],$V71=[1,174],$V81=[1,178],$V91=[2,5,27,28,31,35,37,38,39,40,41,43,55,59,60,61,62,63,64,65,72,74,75,76,79,80,81,82,86,88,89,92,95,99,101,102,103,104,105,106],$Va1=[9,30,32,42,43,47,48,49,50,51,52,53,54,56,57,67,77,78,90,91],$Vb1=[9,30,32,47,48,49,50,51,52,53,54,56,57,67,77,78,90,91],$Vc1=[1,199],$Vd1=[2,112],$Ve1=[1,233],$Vf1=[1,232],$Vg1=[86,88,89];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"INI":3,"INSTRUCCIONES":4,"EOF":5,"INSTRUCCION":6,"IMPRIMIR":7,"DECLARACION":8,"PTCOMA":9,"ASIGNACION":10,"CONDICIONIF":11,"CONDICIONWHILE":12,"CONDICIONDOWHILE":13,"CONDBREAK":14,"CODCONTINUE":15,"CONDRETURN":16,"CONDSWITCH":17,"CONDINCREMENTO":18,"CONDECREMENTO":19,"CONDFOR":20,"METODOS":21,"LLAMADA":22,"EJECUTAR":23,"FUNCIONES":24,"VECTORES":25,"ASIGVECTORES":26,"RESPRINT":27,"PARABRE":28,"IMPRIMIR_ARGS":29,"PARCIERRA":30,"RESPRINTLN":31,"COMA":32,"EXPRESION":33,"TIPODATO":34,"IDENTIFICADOR":35,"IGUAL":36,"RESINT":37,"RESCHAR":38,"RESBOOL":39,"RESDOUBLE":40,"RESSTRING":41,"MAS":42,"MENOS":43,"POR":44,"DIVI":45,"MOD":46,"COMPARACION":47,"DIFERENTE":48,"MAYOR":49,"MENOR":50,"MAYORIGUAL":51,"MENORIGUAL":52,"AND":53,"OR":54,"NOT":55,"CONCAD":56,"DUPLI":57,"IFTERNARIO":58,"ENTERO":59,"DECIMAL":60,"CADENA":61,"BOOLEANO":62,"CARACTER":63,"RESNULO":64,"CORCHABRE":65,"LISTAVALORES":66,"CORCHCIERRA":67,"ACCESOVECTOR":68,"FUNCNATIVA":69,"PUNTO":70,"RESPARSE":71,"RESIF":72,"BLOQUEINSTRUCCION":73,"RESELSE":74,"RESWHILE":75,"RESDO":76,"INTERROGACION":77,"DOSPUNTOS":78,"RESBREAK":79,"RESCONTINUE":80,"RESRETURN":81,"RESSWITCH":82,"LLAVEABRE":83,"LISTACASOS":84,"DEFECTO":85,"LLAVECIERRA":86,"CASO":87,"RESCASE":88,"RESDEFAULT":89,"MASINC":90,"MENOSDES":91,"RESFOR":92,"DECLASIG":93,"ACTUALIZACION":94,"RESVOID":95,"PARAMETROS":96,"RESLIST":97,"PARLLAMADA":98,"RESEXEC":99,"RESNUEVO":100,"RESLOW":101,"RESUP":102,"RESLENG":103,"RESTRUN":104,"RESROUND":105,"RESTYPE":106,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",9:"PTCOMA",27:"RESPRINT",28:"PARABRE",30:"PARCIERRA",31:"RESPRINTLN",32:"COMA",35:"IDENTIFICADOR",36:"IGUAL",37:"RESINT",38:"RESCHAR",39:"RESBOOL",40:"RESDOUBLE",41:"RESSTRING",42:"MAS",43:"MENOS",44:"POR",45:"DIVI",46:"MOD",47:"COMPARACION",48:"DIFERENTE",49:"MAYOR",50:"MENOR",51:"MAYORIGUAL",52:"MENORIGUAL",53:"AND",54:"OR",55:"NOT",56:"CONCAD",57:"DUPLI",59:"ENTERO",60:"DECIMAL",61:"CADENA",62:"BOOLEANO",63:"CARACTER",64:"RESNULO",65:"CORCHABRE",67:"CORCHCIERRA",70:"PUNTO",71:"RESPARSE",72:"RESIF",74:"RESELSE",75:"RESWHILE",76:"RESDO",77:"INTERROGACION",78:"DOSPUNTOS",79:"RESBREAK",80:"RESCONTINUE",81:"RESRETURN",82:"RESSWITCH",83:"LLAVEABRE",86:"LLAVECIERRA",88:"RESCASE",89:"RESDEFAULT",90:"MASINC",91:"MENOSDES",92:"RESFOR",95:"RESVOID",97:"RESLIST",99:"RESEXEC",100:"RESNUEVO",101:"RESLOW",102:"RESUP",103:"RESLENG",104:"RESTRUN",105:"RESROUND",106:"RESTYPE"},
productions_: [0,[3,2],[4,2],[4,1],[6,1],[6,2],[6,2],[6,1],[6,1],[6,1],[6,1],[6,1],[6,2],[6,1],[6,2],[6,2],[6,1],[6,1],[6,2],[6,2],[6,1],[6,2],[6,2],[6,2],[7,5],[7,5],[29,3],[29,1],[8,2],[8,4],[34,1],[34,1],[34,1],[34,1],[34,1],[10,3],[33,3],[33,3],[33,3],[33,3],[33,3],[33,3],[33,2],[33,3],[33,3],[33,3],[33,3],[33,3],[33,3],[33,3],[33,3],[33,2],[33,3],[33,3],[33,1],[33,1],[33,1],[33,1],[33,1],[33,1],[33,1],[33,3],[33,1],[33,1],[33,1],[33,4],[33,6],[11,5],[11,7],[11,7],[12,5],[13,7],[58,5],[14,2],[15,2],[16,1],[16,2],[17,8],[17,7],[17,7],[84,2],[84,1],[87,4],[85,3],[18,2],[19,2],[20,9],[93,1],[93,1],[94,1],[94,1],[94,1],[21,6],[21,5],[96,4],[96,6],[96,7],[96,4],[96,5],[96,2],[22,4],[22,3],[98,3],[98,1],[23,5],[23,4],[24,6],[24,5],[25,10],[25,8],[66,3],[66,1],[68,4],[26,6],[69,1],[69,1],[69,1],[69,1],[69,1],[69,1],[73,3],[73,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
return $$[$0-1];
break;
case 2: case 80:
if($$[$0]!=false)$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 3: case 81:
this.$=($$[$0]!=false) ?[$$[$0]]:[];
break;
case 4: case 7: case 8: case 9: case 10: case 11: case 13: case 16: case 17: case 20: case 54: case 63: case 64: case 87: case 88: case 89: case 90: case 91: case 114: case 115: case 116: case 117: case 118: case 119:
this.$=$$[$0];
break;
case 5: case 6: case 12: case 14: case 15: case 18: case 19: case 21: case 22: case 41: case 61: case 120:
this.$=$$[$0-1];
break;
case 23:

                                            inicio.listaErrores.push(new errores.default('ERROR SINTACTICO',"Se esperaba un token en esta linea",_$[$0-1].first_line,_$[$0-1].first_column));console.log("sinta ");
                                            this.$=false;
                                        
break;
case 24:
this.$=new print.default($$[$0-2], false,_$[$0-4].first_line,_$[$0-4].first_column);
break;
case 25:
this.$=new print.default($$[$0-2], true,_$[$0-4].first_line,_$[$0-4].first_column);
break;
case 26:

            $$[$0-2].push($$[$0])
            this.$ = $$[$0-2]
        
break;
case 27:

            this.$ = [$$[$0]]
        
break;
case 28:
this.$= new declaracion.default($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column,$$[$0]);
break;
case 29:
this.$= new declaracion.default($$[$0-3],_$[$0-3].first_line,_$[$0-3].first_column,$$[$0-2],$$[$0]);
break;
case 30:
this.$= new Tipo.default(Tipo.tipoDato.ENTERO);
break;
case 31:
this.$= new Tipo.default(Tipo.tipoDato.CARACTER);
break;
case 32:
this.$= new Tipo.default(Tipo.tipoDato.BOOLEANO);
break;
case 33:
this.$= new Tipo.default(Tipo.tipoDato.DECIMAL);
break;
case 34:
this.$= new Tipo.default(Tipo.tipoDato.CADENA);
break;
case 35:
this.$=new asignacion.default($$[$0-2],$$[$0],_$[$0-2].first_line,_$[$0-2].first_column);
break;
case 36:
this.$= new aritmeticas.default(aritmeticas.Operadores.SUMA,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 37:
this.$= new aritmeticas.default(aritmeticas.Operadores.RESTA,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 38:
this.$= new aritmeticas.default(aritmeticas.Operadores.MULTIPLICACION,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 39:
this.$= new aritmeticas.default(aritmeticas.Operadores.DIVISION,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 40:
this.$= new aritmeticas.default(aritmeticas.Operadores.MODULADOR,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 42:
this.$=new aritmeticas.default(aritmeticas.Operadores.MENOSNUM,_$[$0-1].first_line,_$[$0-1].first_column,$$[$0]);
break;
case 43:
this.$= new relacional.default(relacional.Relacionales.IGUAL,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 44:
this.$= new relacional.default(relacional.Relacionales.DIFERENTE,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 45:
this.$= new relacional.default(relacional.Relacionales.MAYOR,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 46:
this.$= new relacional.default(relacional.Relacionales.MENOR,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 47:
this.$= new relacional.default(relacional.Relacionales.MAYORIGUAL,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 48:
this.$= new relacional.default(relacional.Relacionales.MENORIGUAL,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 49:
this.$=new logicas.default(logicas.Logicas.AND,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 50:
this.$=new logicas.default(logicas.Logicas.OR,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 51:
this.$=new logicas.default(logicas.Logicas.NOT,_$[$0-1].first_line,_$[$0-1].first_column,$$[$0]);
break;
case 52:
this.$= new unionCadenas.default(unionCadenas.Operadores.CONCATENACION,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 53:
this.$= new unionCadenas.default(unionCadenas.Operadores.DUPLICIDAD,_$[$0-2].first_line,_$[$0-2].first_column,$$[$0-2],$$[$0]);
break;
case 55:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.ENTERO),$$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 56:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.DECIMAL),$$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 57:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.CADENA),$$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 58:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.BOOLEANO),$$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 59:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.CARACTER),$$[$0].replace(/['"]+/g, ""),_$[$0].first_line,_$[$0].first_column);
break;
case 60:
this.$= new primitivo.default(new Tipo.default(Tipo.tipoDato.NULO),$$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 62:
this.$=new identificador.default($$[$0],_$[$0].first_line,_$[$0].first_column);
break;
case 65:
this.$=new funcNativa.default($$[$0-3],$$[$0-1],_$[$0-3].first_line,_$[$0-3].first_column); 
break;
case 66:
this.$=new funcNativa.default($$[$0-5],$$[$0-1],_$[$0-5].first_line,_$[$0-5].first_column); 
break;
case 67:
this.$= new condIf.default(_$[$0-4].first_line,_$[$0-4].first_column,$$[$0-2],$$[$0],undefined,undefined);
break;
case 68:
this.$= new condIf.default(_$[$0-6].first_line,_$[$0-6].first_column,$$[$0-4],$$[$0-2],$$[$0],undefined);
break;
case 69:
this.$= new condIf.default(_$[$0-6].first_line,_$[$0-6].first_column,$$[$0-4],$$[$0-2],undefined,$$[$0]);
break;
case 70:
this.$=new condWhile.default($$[$0-2],$$[$0],_$[$0-4].first_line,_$[$0-4].first_column);
break;
case 71:
this.$=new condDoWhile.default($$[$0-2],$$[$0-5],_$[$0-6].first_line,_$[$0-6].first_column);
break;
case 72:
this.$=new condTernario.default($$[$0-4],$$[$0-2],$$[$0],_$[$0-4].first_line,_$[$0-4].first_column);
break;
case 73:
this.$=new condBreak.default(_$[$0-1].first_line,_$[$0-1].first_column); 
break;
case 74:
this.$=new condContinue.default(_$[$0-1].first_line,_$[$0-1].first_column); 
break;
case 75:
this.$=new condReturn.default(_$[$0].first_line,_$[$0].first_column); 
break;
case 76:
this.$=new condReturn.default(_$[$0-1].first_line,_$[$0-1].first_column,$$[$0]); 
break;
case 77:
this.$=new condSwitch.default(_$[$0-7].first_line,_$[$0-7].first_column,$$[$0-5],$$[$0-2],$$[$0-1]);
break;
case 78:
this.$=new condSwitch.default(_$[$0-6].first_line,_$[$0-6].first_column,$$[$0-4],$$[$0-1],undefined);
break;
case 79:
this.$=new condSwitch.default(_$[$0-6].first_line,_$[$0-6].first_column,$$[$0-4],undefined,$$[$0-1]);
break;
case 82:
this.$=new condCase.default(_$[$0-3].first_line,_$[$0-3].first_column,$$[$0-2],$$[$0]);
break;
case 83:
this.$=new condDefault.default(_$[$0-2].first_line,_$[$0-2].first_column,$$[$0]);
break;
case 84:
this.$=new Incremento.default($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column);
break;
case 85:
this.$=new Decremento.default($$[$0-1],_$[$0-1].first_line,_$[$0-1].first_column);
break;
case 86:
this.$=new condFor.default($$[$0-6],$$[$0-4],$$[$0-2],$$[$0],_$[$0-8].first_line,_$[$0-8].first_column);
break;
case 92:
this.$=new metodos.default(new Tipo.default(Tipo.tipoDato.VOID),_$[$0-5].first_line,_$[$0-5].first_column,$$[$0-4],$$[$0-2],$$[$0]);
break;
case 93:
this.$=new metodos.default(new Tipo.default(Tipo.tipoDato.VOID),_$[$0-4].first_line,_$[$0-4].first_column,$$[$0-3],[],$$[$0]);
break;
case 94:
$$[$0-3].push({tipato:$$[$0-1],identificador:$$[$0]});this.$=$$[$0-3];
break;
case 95:
$$[$0-5].push({tipato:$$[$0-3],identificador:$$[$0],arreglo:true});this.$=$$[$0-5];
break;
case 96:
$$[$0-6].push({tipato:$$[$0-2],identificador:$$[$0],lista:true});this.$=$$[$0-6];
break;
case 97:
this.$=[{tipato:$$[$0-3],identificador:$$[$0],arreglo:true}];
break;
case 98:
this.$=[{tipato:$$[$0-2],identificador:$$[$0],lista:true}];
break;
case 99:
this.$=[{tipato:$$[$0-1],identificador:$$[$0]}];
break;
case 100:
this.$=new llamadas.default($$[$0-3],$$[$0-1],_$[$0-3].first_line,_$[$0-3].first_column);
break;
case 101:
this.$=new llamadas.default($$[$0-2],[],_$[$0-2].first_line,_$[$0-2].first_column);
break;
case 102: case 110:
$$[$0-2].push($$[$0]);this.$=$$[$0-2];
break;
case 103: case 111:
this.$=[$$[$0]];
break;
case 104:
this.$=new ejecucion.default($$[$0-3],$$[$0-1],_$[$0-4].first_line,_$[$0-4].first_column);
break;
case 105:
this.$=new ejecucion.default($$[$0-2],[],_$[$0-3].first_line,_$[$0-3].first_column);
break;
case 106:
this.$=new funciones.default($$[$0-5],_$[$0-5].first_line,_$[$0-5].first_column,$$[$0-4],$$[$0-2],$$[$0]);
break;
case 107:
this.$=new funciones.default($$[$0-4],_$[$0-4].first_line,_$[$0-4].first_column,$$[$0-3],[],$$[$0]);
break;
case 108:
this.$=new vectores.default($$[$0-9],$$[$0-6],true,_$[$0-9].first_line,_$[$0-9].first_column,$$[$0-1],$$[$0-3]);
break;
case 109:
this.$=new vectores.default($$[$0-7],$$[$0-4],false,_$[$0-7].first_line,_$[$0-7].first_column,undefined,undefined,$$[$0-1]);
break;
case 112:
this.$=new accesoVector.default($$[$0-3],$$[$0-1],_$[$0-3].first_line,_$[$0-3].first_column);
break;
case 113:
this.$=new modiVector.default($$[$0-5], $$[$0-3], $$[$0],_$[$0-5].first_line,_$[$0-5].first_column);
break;
case 121:
this.$=[];
break;
}
},
table: [{2:$V0,3:1,4:2,6:3,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{1:[3]},{2:$V0,5:[1,63],6:64,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($Vz,[2,3]),o($Vz,[2,4]),{9:[1,65]},{9:[1,66]},o($Vz,[2,7]),o($Vz,[2,8]),o($Vz,[2,9]),o($Vz,[2,10]),o($Vz,[2,11]),{9:[1,67]},o($Vz,[2,13]),{9:[1,68]},{9:[1,69]},o($Vz,[2,16]),o($Vz,[2,17]),o($VA,$VB,{9:[1,70]}),{9:[1,71]},o($Vz,[2,20]),{9:[1,72]},{9:[1,73]},{9:[1,74]},{28:[1,75]},{28:[1,76]},{35:[1,77],65:[1,78],70:$VC},o($VA,$VD,{28:$VE,36:$VF,65:[1,82]}),{28:[1,83]},{28:[1,84]},{73:85,83:$VG},{9:[1,87]},{9:[1,88]},{9:[2,75],22:91,28:$V2,33:89,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{28:[1,93]},{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX,90:[1,94],91:[1,95]},{28:[1,112]},{35:[1,113]},{35:[1,114]},o($VY,[2,30]),o($VY,[2,31]),o($VY,[2,32]),o($VY,[2,33]),o($VY,[2,34]),{22:91,28:$V2,33:115,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:116,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:117,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VZ,[2,54]),o($VZ,[2,55]),o($VZ,[2,56]),o($VZ,[2,57]),o($VZ,[2,58]),o($VZ,[2,59]),o($VZ,[2,60]),{22:91,28:$V2,33:119,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,66:118,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VZ,[2,64]),{28:[1,120]},{28:[2,114]},{28:[2,115]},{28:[2,116]},{28:[2,117]},{28:[2,118]},{28:[2,119]},{1:[2,1]},o($Vz,[2,2]),o($Vz,[2,5]),o($Vz,[2,6]),o($Vz,[2,12]),o($Vz,[2,14]),o($Vz,[2,15]),o($Vz,[2,18]),o($Vz,[2,19]),o($Vz,[2,21]),o($Vz,[2,22]),o($Vz,[2,23]),{22:91,28:$V2,29:121,33:122,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,29:123,33:122,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{9:$V_,28:[1,125],36:$V$},{67:[1,126]},{71:[1,127]},{22:91,28:$V2,33:128,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,30:[1,130],33:131,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,98:129,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:132,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:133,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:134,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{75:[1,135]},{2:$V0,4:136,6:3,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,86:[1,137],92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($Vz,[2,73]),o($Vz,[2,74]),{9:[2,76],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},o($VZ,$VD,{28:$VE,65:$V01}),o($VZ,$VB),{70:$VC},{22:91,28:$V2,33:139,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($V11,[2,84]),o($V11,[2,85]),{22:91,28:$V2,33:140,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:141,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:142,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:143,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:144,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:145,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:146,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:147,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:148,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:149,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:150,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:151,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:152,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:153,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:154,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:155,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{8:157,10:158,34:159,35:[1,160],37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,93:156},{28:[1,161]},{28:[1,162]},{30:[1,163],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},o($VZ,[2,42]),o($V21,[2,51],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,56:$VV,57:$VW}),{32:$V31,67:[1,164]},o($V41,[2,111],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),{22:91,28:$V2,33:166,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{30:[1,167],32:$V51},o($V61,[2,27],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),{30:[1,169],32:$V51},{22:91,28:$V2,33:170,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{30:[1,172],34:173,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,96:171,97:$V71},{35:[1,175]},{28:[1,176]},o($V11,[2,35],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),{30:[1,177],32:$V81},o($VZ,[2,101]),o($V61,[2,103],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,67:[1,179],77:$VX},{30:[1,180],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{30:[1,181],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{28:[1,182]},{2:$V0,6:64,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,86:[1,183],92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($V91,[2,121]),{22:91,28:$V2,33:184,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{30:[1,185],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},o($Va1,[2,36],{44:$VK,45:$VL,46:$VM}),o($Va1,[2,37],{44:$VK,45:$VL,46:$VM}),o($VZ,[2,38]),o($VZ,[2,39]),o($VZ,[2,40]),o($Vb1,[2,43],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,44],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,45],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,46],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,47],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,48],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($V21,[2,49],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,56:$VV,57:$VW}),o([9,30,32,54,67,77,78,90,91],[2,50],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,56:$VV,57:$VW}),o($Vb1,[2,52],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),o($Vb1,[2,53],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM}),{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX,78:[1,186]},{9:[1,187]},{9:[2,87]},{9:[2,88]},{35:[1,188]},{36:$VF},{30:[1,190],34:173,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,96:189,97:$V71},{22:91,28:$V2,30:[1,192],33:131,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,98:191,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VZ,[2,41]),o($VZ,[2,61]),{22:91,28:$V2,33:193,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{30:[1,194],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{9:[1,195]},{22:91,28:$V2,33:196,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{9:[1,197]},{9:[2,29],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{30:[1,198],32:$Vc1},{73:200,83:$VG},{35:[1,202],65:[1,201]},{50:[1,203]},{36:[1,204]},{22:91,28:$V2,33:205,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VZ,[2,100]),{22:91,28:$V2,33:206,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VA,$Vd1,{36:[1,207]}),{73:208,83:$VG},{73:209,83:$VG},{22:91,28:$V2,33:210,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($V91,[2,120]),{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,67:[1,211],77:$VX},{83:[1,212]},{22:91,28:$V2,33:213,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{22:91,28:$V2,33:214,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{9:$V_,36:$V$},{30:[1,215],32:$Vc1},{73:216,83:$VG},{30:[1,217],32:$V81},{9:[2,105]},o($V41,[2,110],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),o($VZ,[2,65]),o($Vz,[2,24]),o($V61,[2,26],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),o($Vz,[2,25]),{73:218,83:$VG},{34:219,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,97:[1,220]},o($Vz,[2,107]),{67:[1,221]},o($V61,[2,99]),{34:222,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9},{65:[1,224],100:[1,223]},{30:[1,225],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},o($V61,[2,102],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX}),{22:91,28:$V2,33:226,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($Vz,[2,67],{74:[1,227]}),o($Vz,[2,70]),{30:[1,228],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},o($VZ,$Vd1),{84:229,85:230,87:231,88:$Ve1,89:$Vf1},o([9,30,32,67,77,78,90,91],[2,72],{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW}),{9:[1,234],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{73:235,83:$VG},o($Vz,[2,93]),{9:[2,104]},o($Vz,[2,106]),{35:[1,236],65:[1,237]},{50:[1,238]},{35:[1,239]},{49:[1,240]},{34:241,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9},{22:91,28:$V2,33:119,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,66:242,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($VZ,[2,66]),{9:[2,113],42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX},{11:244,72:$Vj,73:243,83:$VG},{9:[1,245]},{85:246,86:[1,247],87:248,88:$Ve1,89:$Vf1},{86:[1,249]},o($Vg1,[2,81]),{78:[1,250]},{22:91,28:$V2,33:251,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{10:255,18:253,19:254,22:91,28:$V2,33:35,34:92,35:[1,256],37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,94:252,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},o($Vz,[2,92]),o($V61,[2,94]),{67:[1,257]},{34:258,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9},o($V61,[2,97]),{35:[1,259]},{65:[1,260]},{32:$V31,67:[1,261]},o($Vz,[2,68]),o($Vz,[2,69]),o($Vz,[2,71]),{86:[1,262]},o($Vz,[2,78]),o($Vg1,[2,80]),o($Vz,[2,79]),{2:$V0,4:263,6:3,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,77:$VX,78:[1,264]},{30:[1,265]},{30:[2,89]},{30:[2,90]},{30:[2,91]},o($VA,$VD,{28:$VE,36:$VF,65:$V01}),{35:[1,266]},{49:[1,267]},o($V61,[2,98]),{22:91,28:$V2,33:268,34:92,35:$VH,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{9:[2,109]},o($Vz,[2,77]),{2:$V0,6:64,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,86:[2,83],92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{2:$V0,4:269,6:3,7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,27:$V1,28:$V2,31:$V3,33:35,34:26,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,58:47,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,68:55,69:56,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy},{73:270,83:$VG},o($V61,[2,95]),{35:[1,271]},{42:$VI,43:$VJ,44:$VK,45:$VL,46:$VM,47:$VN,48:$VO,49:$VP,50:$VQ,51:$VR,52:$VS,53:$VT,54:$VU,56:$VV,57:$VW,67:[1,272],77:$VX},o($Vg1,[2,82],{7:4,8:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:20,25:21,26:22,34:26,33:35,58:47,68:55,69:56,6:64,2:$V0,27:$V1,28:$V2,31:$V3,35:$V4,37:$V5,38:$V6,39:$V7,40:$V8,41:$V9,43:$Va,55:$Vb,59:$Vc,60:$Vd,61:$Ve,62:$Vf,63:$Vg,64:$Vh,65:$Vi,72:$Vj,75:$Vk,76:$Vl,79:$Vm,80:$Vn,81:$Vo,82:$Vp,92:$Vq,95:$Vr,99:$Vs,101:$Vt,102:$Vu,103:$Vv,104:$Vw,105:$Vx,106:$Vy}),o($Vz,[2,86]),o($V61,[2,96]),{9:[2,108]}],
defaultActions: {57:[2,114],58:[2,115],59:[2,116],60:[2,117],61:[2,118],62:[2,119],63:[2,1],157:[2,87],158:[2,88],192:[2,105],217:[2,104],253:[2,89],254:[2,90],255:[2,91],261:[2,109],272:[2,108]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse (input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    var lex = function () {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

//codigo js
const print=require('./Instrucciones/print');
const primitivo= require('./Expresiones/Primitivo');
const errores= require('./Excepciones/Errores');
const inicio= require('./Excepciones/Listado_Errores');
const aritmeticas= require('./Expresiones/Aritmetica');
const unionCadenas= require('./Expresiones/Cadenas');
const Tipo= require('./TS/Tipo');
const logicas= require("./Expresiones/Logica");
const relacional= require("./Expresiones/Relacional");
const declaracion= require("./Instrucciones/Declaracion");
const identificador=require("./Expresiones/Identificador");
const asignacion= require("./Instrucciones/Asignacion");
const condIf= require("./Instrucciones/Condicionales/condIf");
const condWhile= require("./Instrucciones/Ciclicas/condWhile");
const condDoWhile = require("./Instrucciones/Ciclicas/condDoWhile");
const condTernario= require("./Instrucciones/Condicionales/condIfTernario");
const condBreak= require("./Instrucciones/Break");
const condContinue= require("./Instrucciones/Continue");
const condReturn= require("./Instrucciones/Return");
const condSwitch= require("./Instrucciones/Condicionales/condSwitch");
const condDefault= require("./Instrucciones/Condicionales/condSwitchDefault");
const condCase= require("./Instrucciones/Condicionales/condSwitchCase");
const Incremento= require("./Instrucciones/Incremento");
const Decremento= require("./Instrucciones/Decremento");
const condFor= require("./Instrucciones/Ciclicas/condFor");
const metodos= require("./Instrucciones/Metodos");
const llamadas= require("./Instrucciones/LlamadaFuncMetd");
const ejecucion= require("./Instrucciones/Exec");
const funciones= require("./Instrucciones/Funciones");
const vectores=require('./Instrucciones/declaracionVectores');
const accesoVector= require('./Instrucciones/accesoVector');
const modiVector = require('./Instrucciones/asignacionVector');
const listas = require('./Instrucciones/declaracionListas');
const accesoLista = require('./Instrucciones/accesoLista');
const modiLista = require('./Instrucciones/asignacionLista');
const agregarLista= require('./Instrucciones/agregarLista');
const funcNativa= require('./Instrucciones/funcNativa');
const casteo= require('./Instrucciones/casteo');
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex () {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin (condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState () {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules () {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState (n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState (condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
break;
case 1:
break;
case 2:
break;
case 3:
break;
case 4:return 72;
break;
case 5:return 74;
break;
case 6:return 27;
break;
case 7:return 31;
break;
case 8:return 64
break;
case 9:return 37;
break;
case 10:return 38;
break;
case 11:return 40;
break;
case 12:return 39;
break;
case 13:return 41;
break;
case 14:return 75;
break;
case 15:return 76;
break;
case 16:return 79;
break;
case 17:return 80;
break;
case 18:return 81;
break;
case 19:return 82;
break;
case 20:return 88;
break;
case 21:return 89;
break;
case 22:return 92;
break;
case 23:return 95;
break;
case 24:return 100;
break;
case 25:return 97;
break;
case 26:return 'RESADD';
break;
case 27:return 101; //listo
break;
case 28:return 102; //listo
break;
case 29:return 103; //listo
break;
case 30:return 'RESCAROFPOS';
break;
case 31:return 'RESSUBSTRING';
break;
case 32:return 71;
break;
case 33:return 'RESTOINT'; //listo
break;
case 34:return 'RESTODOU';
break;
case 35:return 106; //listo
break;
case 36:return 83;
break;
case 37:return 32;
break;
case 38:return 86;
break;
case 39:return 54;
break;
case 40:return 53;
break;
case 41:return 56
break;
case 42:return 9;
break;
case 43:return 28;
break;
case 44:return 30;
break;
case 45:return 65;
break;
case 46:return 67;
break;
case 47:return 90
break;
case 48:return 42;
break;
case 49:return 91
break;
case 50:return 43;
break;
case 51:return 45;
break;
case 52:return 44;
break;
case 53:return 46;
break;
case 54:return 47;
break;
case 55:return 52;
break;
case 56:return 51;
break;
case 57:return 36;
break;
case 58:return 48;
break;
case 59:return 55;
break;
case 60:return 50;
break;
case 61:return 49;
break;
case 62:return 57;
break;
case 63:return 77;
break;
case 64:return 78;
break;
case 65:return 70;
break;
case 66: yy_.yytext=yy_.yytext.substr(1,yy_.yyleng-2); return 61; 
break;
case 67:return 60;
break;
case 68:return 59;
break;
case 69:return 63;
break;
case 70:return 62;
break;
case 71:return 35;
break;
case 72:return 5;
break;
case 73:console.log("error Lexico")
break;
}
},
rules: [/^(?:[ \r\t]+)/i,/^(?:\n+)/i,/^(?:\/\/.*)/i,/^(?:[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/])/i,/^(?:if\b)/i,/^(?:else\b)/i,/^(?:print\b)/i,/^(?:println\b)/i,/^(?:null\b)/i,/^(?:int\b)/i,/^(?:char\b)/i,/^(?:double\b)/i,/^(?:boolean\b)/i,/^(?:string\b)/i,/^(?:while\b)/i,/^(?:do\b)/i,/^(?:break\b)/i,/^(?:continue\b)/i,/^(?:return\b)/i,/^(?:switch\b)/i,/^(?:case\b)/i,/^(?:default\b)/i,/^(?:for\b)/i,/^(?:void\b)/i,/^(?:new\b)/i,/^(?:list\b)/i,/^(?:add\b)/i,/^(?:tolowercase\b)/i,/^(?:touppercase\b)/i,/^(?:length\b)/i,/^(?:caracterOfPosition\b)/i,/^(?:substring\b)/i,/^(?:parse\b)/i,/^(?:toint\b)/i,/^(?:todouble\b)/i,/^(?:typeof\b)/i,/^(?:\{)/i,/^(?:,)/i,/^(?:\})/i,/^(?:\|\|)/i,/^(?:&&)/i,/^(?:&)/i,/^(?:;)/i,/^(?:\()/i,/^(?:\))/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\+\+)/i,/^(?:\+)/i,/^(?:--)/i,/^(?:-)/i,/^(?:\/)/i,/^(?:\*)/i,/^(?:%)/i,/^(?:==)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:=)/i,/^(?:!=)/i,/^(?:!)/i,/^(?:<)/i,/^(?:>)/i,/^(?:\^)/i,/^(?:\?)/i,/^(?::)/i,/^(?:\.)/i,/^(?:"[^\"]*")/i,/^(?:[0-9]+(\.[0-9]+)\b)/i,/^(?:[0-9]+\b)/i,/^(?:'[^\']')/i,/^(?:(true|false)\b)/i,/^(?:([a-zA-Z])[a-zA-Z0-9_]*)/i,/^(?:$)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = analizador;
exports.Parser = analizador.Parser;
exports.parse = function () { return analizador.parse.apply(analizador, arguments); };
exports.main = function commonjsMain (args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this)}).call(this,require('_process'))
},{"./Excepciones/Errores":6,"./Excepciones/Listado_Errores":7,"./Expresiones/Aritmetica":8,"./Expresiones/Cadenas":9,"./Expresiones/Identificador":10,"./Expresiones/Logica":11,"./Expresiones/Primitivo":12,"./Expresiones/Relacional":13,"./Instrucciones/Asignacion":14,"./Instrucciones/Break":15,"./Instrucciones/Ciclicas/condDoWhile":16,"./Instrucciones/Ciclicas/condFor":17,"./Instrucciones/Ciclicas/condWhile":18,"./Instrucciones/Condicionales/condIf":19,"./Instrucciones/Condicionales/condIfTernario":20,"./Instrucciones/Condicionales/condSwitch":21,"./Instrucciones/Condicionales/condSwitchCase":22,"./Instrucciones/Condicionales/condSwitchDefault":23,"./Instrucciones/Continue":24,"./Instrucciones/Declaracion":25,"./Instrucciones/Decremento":26,"./Instrucciones/Exec":27,"./Instrucciones/Funciones":28,"./Instrucciones/Incremento":29,"./Instrucciones/LlamadaFuncMetd":30,"./Instrucciones/Metodos":31,"./Instrucciones/Return":32,"./Instrucciones/accesoLista":33,"./Instrucciones/accesoVector":34,"./Instrucciones/agregarLista":35,"./Instrucciones/asignacionLista":36,"./Instrucciones/asignacionVector":37,"./Instrucciones/casteo":38,"./Instrucciones/declaracionListas":39,"./Instrucciones/declaracionVectores":40,"./Instrucciones/funcNativa":41,"./Instrucciones/print":42,"./TS/Tipo":45,"_process":3,"fs":1,"path":2}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function obtenerValor(valor) {
    if (valor != undefined) {
        switch (valor) {
            case 0:
                return 'int';
            case 1:
                return 'double';
            case 2:
                return 'boolean';
            case 3:
                return 'char';
            case 4:
                return 'string';
            case 4:
                return 'void';
            default:
                return 'no';
        }
    }
}
exports.default = obtenerValor;

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporteTabla = void 0;
var reporteTabla = /** @class */ (function () {
    function reporteTabla(identificador, valor, forma, tipo, entorno, linea, columna) {
        this.identificador = identificador.toLowerCase();
        this.forma = forma;
        this.tipo = tipo;
        this.entorno = entorno;
        this.linea = linea;
        this.columna = columna;
        this.valor = valor;
    }
    reporteTabla.prototype.getIdentificador = function () {
        return this.identificador;
    };
    reporteTabla.prototype.getForma = function () {
        return this.forma;
    };
    reporteTabla.prototype.getTipo = function () {
        return this.tipo;
    };
    reporteTabla.prototype.getEntorno = function () {
        return this.entorno;
    };
    reporteTabla.prototype.getLinea = function () {
        return this.linea;
    };
    reporteTabla.prototype.getColumna = function () {
        return this.columna;
    };
    reporteTabla.prototype.getValor = function () {
        return this.valor;
    };
    reporteTabla.prototype.setLinea = function (linea) {
        this.linea = linea;
    };
    reporteTabla.prototype.setColumna = function (col) {
        this.columna = col;
    };
    reporteTabla.prototype.setValor = function (val) {
        this.valor = val;
    };
    reporteTabla.prototype.setEntorno = function (ent) {
        this.entorno = ent;
    };
    return reporteTabla;
}());
exports.reporteTabla = reporteTabla;

},{}],50:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser = require('./Analizador/analizador');
var shared_1 = require("./shared");
var Arbol_1 = __importDefault(require("./Analizador/TS/Arbol"));
var file = document.querySelector('#file');
var open_file = document.querySelector('#open_file');
var clear_file = document.querySelector('#clear_file');
var analize = document.querySelector('#analize');
var compile = document.querySelector('#compile');
var reports = document.querySelector('#reports');
var symbols_table = document.querySelector('#symbols_table');
var errors_table = document.querySelector('#errors_table');
var grammar_table = document.querySelector('#grammar_table');
var show_ast = document.querySelector('#show_ast');
var my_source = document.querySelector('#my_source');
var hideSubmenu = function (selector, idx) {
    document.querySelectorAll(selector)[idx].classList.toggle('submenu--hide');
};
file === null || file === void 0 ? void 0 : file.addEventListener('click', function () {
    hideSubmenu('.submenu', 0);
});
open_file === null || open_file === void 0 ? void 0 : open_file.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file)
        return;
    var reader = new FileReader();
    reader.onload = function (e) {
        var target = e.target;
        if (target !== undefined && target !== null) {
            var content = "" + target.result;
            my_source.value = content;
        }
    };
    reader.readAsText(file);
    hideSubmenu('.submenu', 0);
}, false);
clear_file === null || clear_file === void 0 ? void 0 : clear_file.addEventListener('click', function () {
    hideSubmenu('.submenu', 0);
});
analize === null || analize === void 0 ? void 0 : analize.addEventListener('click', function () {
    shared_1.setConsole('Interpretando la entrada...\n\n');
    var source = my_source.value;
    var result = analize_source(source);
    console.log(result);
});
compile === null || compile === void 0 ? void 0 : compile.addEventListener('click', function () {
    shared_1.setConsole('Compilando la entrada...\n\n');
});
reports === null || reports === void 0 ? void 0 : reports.addEventListener('click', function () {
    hideSubmenu('.submenu', 0);
});
symbols_table === null || symbols_table === void 0 ? void 0 : symbols_table.addEventListener('click', function () { });
errors_table === null || errors_table === void 0 ? void 0 : errors_table.addEventListener('click', function () { });
grammar_table === null || grammar_table === void 0 ? void 0 : grammar_table.addEventListener('click', function () { });
show_ast === null || show_ast === void 0 ? void 0 : show_ast.addEventListener('click', function () { });
var analize_source = function (source) {
    console.log('ANALIZANDO...');
    return new Arbol_1.default(parser.parse(source));
};

},{"./Analizador/TS/Arbol":43,"./Analizador/analizador":47,"./shared":51}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConsole = exports.setResult = void 0;
var setResult = function (res) {
    var textarea = document.querySelector('#my_result');
    var value = textarea.value;
    value += res;
    textarea.value = value;
};
exports.setResult = setResult;
var setConsole = function (res) {
    var textarea = document.querySelector('#my_console');
    var value = textarea.value;
    value += res;
    textarea.value = value;
};
exports.setConsole = setConsole;

},{}]},{},[50])(50)
});
