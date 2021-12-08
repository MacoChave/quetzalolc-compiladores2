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
var grammar = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,6],$V2=[5,8,12],$V3=[1,25],$V4=[1,24],$V5=[1,26],$V6=[1,17],$V7=[1,18],$V8=[1,19],$V9=[1,20],$Va=[1,21],$Vb=[1,22],$Vc=[1,23],$Vd=[1,29],$Ve=[11,13],$Vf=[1,30],$Vg=[1,31],$Vh=[1,32],$Vi=[1,33],$Vj=[1,34],$Vk=[1,35],$Vl=[1,36],$Vm=[1,37],$Vn=[1,38],$Vo=[1,39],$Vp=[1,40],$Vq=[1,41],$Vr=[1,42],$Vs=[1,43],$Vt=[1,44],$Vu=[11,13,19,20,22,23,24,25,26,27,28,29,30,31,32,33,34],$Vv=[11,13,19,20],$Vw=[11,13,19,20,22,23,24,25,26,27],$Vx=[11,13,19,20,22,23,24,25,26,27,28,29,33],$Vy=[11,13,19,20,22,23,24,25,26,27,28,29,30,31,33];
var parser = {trace: function trace () { },
yy: {},
symbols_: {"error":2,"START":3,"INSTRUCCIONES":4,"EOF":5,"INSTRUCCION":6,"PRINT":7,"print":8,"(":9,"PRINT_ARGS":10,")":11,"println":12,",":13,"EXPR":14,"PRIMITIVA":15,"OP_LOGICA":16,"OP_RELACIONAL":17,"OP_ARITMETICA":18,"&&":19,"||":20,"!":21,"!=":22,"==":23,"<":24,"<=":25,">":26,">=":27,"+":28,"-":29,"*":30,"/":31,"^":32,"&":33,"%":34,"entero":35,"decimal":36,"cadena":37,"caracter":38,"true":39,"false":40,"null":41,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",8:"print",9:"(",11:")",12:"println",13:",",19:"&&",20:"||",21:"!",22:"!=",23:"==",24:"<",25:"<=",26:">",27:">=",28:"+",29:"-",30:"*",31:"/",32:"^",33:"&",34:"%",35:"entero",36:"decimal",37:"cadena",38:"caracter",39:"true",40:"false",41:"null"},
productions_: [0,[3,2],[4,2],[4,1],[6,1],[7,4],[7,4],[10,3],[10,1],[14,1],[14,1],[14,1],[14,1],[16,3],[16,3],[16,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,2],[15,1],[15,1],[15,1],[15,1],[15,1],[15,1],[15,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

            this.$ = $$[$0-1];
            return this.$
        
break;
case 2:
 
            $$[$0-1].push($$[$0])
            this.$ = $$[$0-1]
        
break;
case 3: case 8:
 this.$ = [$$[$0]] 
break;
case 4: case 9: case 10: case 11: case 12:
 this.$ = $$[$0] 
break;
case 5:
 this.$ = new Print($$[$0-1], _$[$0-3].first_line, _$[$0-3].first_column) 
break;
case 6:
 this.$ = new Print($$[$0-1], _$[$0-3].first_line, _$[$0-3].first_column, true) 
break;
case 7:

            $$[$0-2].push($$[$0])
            this.$ = $$[$0-2]
        
break;
case 13:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.AND, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 14:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.OR, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 15:
 this.$ = new Operacion($$[$0], $$[$0], Operador.NOT, _$[$0-1].first_line, _$[$0-1].first_column) 
break;
case 16:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.DIFERENTE, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 17:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.IGUAL, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 18:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MENOR, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 19:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MENOR_IGUAL, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 20:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MAYOR, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 21:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MAYOR_IGUAL, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 22:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.SUMA, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 23:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.RESTA, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 24:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MULTIPLICACION, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 25:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.DIVISION, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 26:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.REPETIR, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 27:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.CONCAT, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 28:
 this.$ = new Operacion($$[$0-2], $$[$0], Operador.MODULO, _$[$0-2].first_line, _$[$0-2].first_column) 
break;
case 29:
 this.$ = $$[$0-1] 
break;
case 30:
 this.$ = new Operacion($$[$0], $$[$0], Operador.NEGATIVO, _$[$0-1].first_line, _$[$0-1].first_column) 
break;
case 31:
 this.$ = new Primitive(Number($$[$0]), Type.INT, _$[$0].first_column, _$[$0].first_column) 
break;
case 32:
 this.$ = new Primitive(Number($$[$0]), Type.DOUBLE, _$[$0].first_column, _$[$0].first_column) 
break;
case 33:
 this.$ = new Primitive($$[$0], Type.STRING, _$[$0].first_column, _$[$0].first_column) 
break;
case 34:
 this.$ = new Primitive($$[$0], Type.CHAR, _$[$0].first_column, _$[$0].first_column) 
break;
case 35:
 this.$ = new Primitive(true, Type.BOOLEAN, _$[$0].first_column, _$[$0].first_column) 
break;
case 36:
 this.$ = new Primitive(false, Type.BOOLEAN, _$[$0].first_column, _$[$0].first_column) 
break;
case 37:
 this.$ = new Primitive(null, Type.NULL, _$[$0].first_column, _$[$0].first_column) 
break;
}
},
table: [{3:1,4:2,6:3,7:4,8:$V0,12:$V1},{1:[3]},{5:[1,7],6:8,7:4,8:$V0,12:$V1},o($V2,[2,3]),o($V2,[2,4]),{9:[1,9]},{9:[1,10]},{1:[2,1]},o($V2,[2,2]),{9:$V3,10:11,14:12,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,10:27,14:12,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{11:[1,28],13:$Vd},o($Ve,[2,8],{19:$Vf,20:$Vg,22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vu,[2,9]),o($Vu,[2,10]),o($Vu,[2,11]),o($Vu,[2,12]),o($Vu,[2,31]),o($Vu,[2,32]),o($Vu,[2,33]),o($Vu,[2,34]),o($Vu,[2,35]),o($Vu,[2,36]),o($Vu,[2,37]),{9:$V3,14:45,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:46,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:47,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{11:[1,48],13:$Vd},o($V2,[2,5]),{9:$V3,14:49,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:50,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:51,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:52,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:53,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:54,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:55,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:56,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:57,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:58,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:59,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:60,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:61,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:62,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:63,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},{9:$V3,14:64,15:13,16:14,17:15,18:16,21:$V4,29:$V5,35:$V6,36:$V7,37:$V8,38:$V9,39:$Va,40:$Vb,41:$Vc},o($Vv,[2,15],{22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),{11:[1,65],19:$Vf,20:$Vg,22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt},o($Vu,[2,30]),o($V2,[2,6]),o($Ve,[2,7],{19:$Vf,20:$Vg,22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vv,[2,13],{22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o([11,13,20],[2,14],{19:$Vf,22:$Vh,23:$Vi,24:$Vj,25:$Vk,26:$Vl,27:$Vm,28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,16],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,17],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,18],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,19],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,20],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vw,[2,21],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,33:$Vs,34:$Vt}),o($Vx,[2,22],{30:$Vp,31:$Vq,32:$Vr,34:$Vt}),o($Vx,[2,23],{30:$Vp,31:$Vq,32:$Vr,34:$Vt}),o($Vy,[2,24],{32:$Vr,34:$Vt}),o($Vy,[2,25],{32:$Vr,34:$Vt}),o([11,13,19,20,22,23,24,25,26,27,28,29,30,31,32,33],[2,26],{34:$Vt}),o([11,13,19,20,22,23,24,25,26,27,33],[2,27],{28:$Vn,29:$Vo,30:$Vp,31:$Vq,32:$Vr,34:$Vt}),o($Vu,[2,28]),o($Vu,[2,29])],
defaultActions: {7:[2,1]},
parseError: function parseError (str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
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
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

    const { Attribute } = require('../scripts/expressions/attribute')
    const { Objeto } = require('../scripts/expressions/object')
    const { Operacion, Operador } = require('../scripts/expressions/operation')
    const { Primitive } = require('../scripts/expressions/primitive')
    const { Print } = require('../scripts/instructions/print')
    const { Type } = require('../scripts/ast/type')
    const { setConsole } = require('../scripts/shared')
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
case 0:// COMENTARIO SIMPLE
break;
case 1:// COMENTARIO MULTIPLE
break;
case 2:return 8;
break;
case 3:return 12;
break;
case 4:return 41;
break;
case 5:return 39;
break;
case 6:return 40;
break;
case 7:return 9;
break;
case 8:return 11;
break;
case 9:return '[';
break;
case 10:return ']';
break;
case 11:return 13;
break;
case 12:return '.';
break;
case 13:return 28;
break;
case 14:return 29;
break;
case 15:return 30;
break;
case 16:return 31;
break;
case 17:return 34;
break;
case 18:return 27;
break;
case 19:return 25;
break;
case 20:return 26;
break;
case 21:return 24;
break;
case 22:return 22;
break;
case 23:return 23;
break;
case 24:return 19;
break;
case 25:return 20;
break;
case 26:return 21;
break;
case 27:return 33;
break;
case 28:return 32;
break;
case 29:return 36;
break;
case 30:return 35;
break;
case 31:return 'identificador';
break;
case 32:
                            yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2)
                            return 37
                        
break;
case 33:
                            yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2)
                            return 38
                        
break;
case 34:// TABS, RETORNO Y SALTOS
break;
case 35:// Espacios en blanco
break;
case 36: setConsole(`Error léxico (${yy_.yytext}), en la línea ${yy_.yylloc.first_line} y columna ${yy_.yylloc.first_column}\n`) 
break;
case 37:return 5;
break;
}
},
rules: [/^(?:[/][*][^]*[*][/])/i,/^(?:[/][/].*)/i,/^(?:print\b)/i,/^(?:println\b)/i,/^(?:null\b)/i,/^(?:true\b)/i,/^(?:false\b)/i,/^(?:\()/i,/^(?:\))/i,/^(?:\[)/i,/^(?:\])/i,/^(?:,)/i,/^(?:\.)/i,/^(?:\+)/i,/^(?:-)/i,/^(?:\*)/i,/^(?:\/)/i,/^(?:%)/i,/^(?:>=)/i,/^(?:<=)/i,/^(?:>)/i,/^(?:<)/i,/^(?:!=)/i,/^(?:==)/i,/^(?:&&)/i,/^(?:\|\|)/i,/^(?:!)/i,/^(?:&)/i,/^(?:\^)/i,/^(?:[0-9]+([.][0-9]+)\b)/i,/^(?:[0-9]+\b)/i,/^(?:([a-zA-Z])[a-zA-Z0-9_]*)/i,/^(?:("((\\([\'\"\\bfnrtv]))|([^\"\\]+))"))/i,/^(?:('((\\([\'\"\\bfnrtv]))|([^\"\\]+))'))/i,/^(?:[\t\n\r]+)/i,/^(?:\s+)/i,/^(?:.)/i,/^(?:$)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37],"inclusive":true}}
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
exports.parser = grammar;
exports.Parser = grammar.Parser;
exports.parse = function () { return grammar.parse.apply(grammar, arguments); };
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
},{"../scripts/ast/type":8,"../scripts/expressions/attribute":9,"../scripts/expressions/object":10,"../scripts/expressions/operation":11,"../scripts/expressions/primitive":12,"../scripts/instructions/print":13,"../scripts/shared":14,"_process":3,"fs":1,"path":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_1 = require("./ast/ast");
var scope_1 = require("./ast/scope");
var shared_1 = require("./shared");
var grammar = require('../jison/grammar');
var analize = document.querySelector('#analize');
var compile = document.querySelector('#compile');
var reports = document.querySelector('#reports');
var symbols_table = document.querySelector('#symbols_table');
var errors_table = document.querySelector('#errors_table');
var grammar_table = document.querySelector('#grammar_table');
var show_ast = document.querySelector('#show_ast');
var my_source = document.querySelector('#my_source');
analize === null || analize === void 0 ? void 0 : analize.addEventListener('click', function () {
    shared_1.setConsole('Interpretando la entrada...\n\n');
    var source = my_source.value;
    var result = analize_source(source);
    console.log(result);
    var globalScope = new scope_1.Scope(null);
    var ast = new ast_1.AST(result);
    result.forEach(function (res) {
        res.exec(globalScope, ast);
    });
});
compile === null || compile === void 0 ? void 0 : compile.addEventListener('click', function () {
    shared_1.setConsole('Compilando la entrada...\n\n');
    var source = my_source.value;
    var result = analize_source(source);
    console.log(result);
    var globalScope = new scope_1.Scope(null);
    var ast = new ast_1.AST(result);
    result.forEach(function (res) {
        res.translate(globalScope, ast);
    });
});
reports === null || reports === void 0 ? void 0 : reports.addEventListener('click', function () {
    var _a;
    (_a = document.querySelector('#submenu')) === null || _a === void 0 ? void 0 : _a.classList.toggle('submenu--hide');
});
symbols_table === null || symbols_table === void 0 ? void 0 : symbols_table.addEventListener('click', function () { });
errors_table === null || errors_table === void 0 ? void 0 : errors_table.addEventListener('click', function () { });
grammar_table === null || grammar_table === void 0 ? void 0 : grammar_table.addEventListener('click', function () { });
show_ast === null || show_ast === void 0 ? void 0 : show_ast.addEventListener('click', function () { });
var analize_source = function (source) {
    console.log('ANALIZANDO...');
    return grammar.parse(source);
};

},{"../jison/grammar":4,"./ast/ast":6,"./ast/scope":7,"./shared":14}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
var AST = /** @class */ (function () {
    function AST(instructions) {
        this.instructions = instructions;
        this.structs = [];
        this.functions = [];
    }
    return AST;
}());
exports.AST = AST;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
var Scope = /** @class */ (function () {
    function Scope(preview) {
        this.table = {};
        this.preview = preview;
    }
    Scope.prototype.addScope = function (id, symbol) { };
    Scope.prototype.deleteScope = function (id) {
        return false;
    };
    Scope.prototype.exist = function (id) {
        return false;
    };
    Scope.prototype.existInCurrent = function (id) { };
    Scope.prototype.getSymbol = function (id) { };
    Scope.prototype.replace = function (id, newSymbol) { };
    return Scope;
}());
exports.Scope = Scope;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
var Type;
(function (Type) {
    Type[Type["STRING"] = 0] = "STRING";
    Type[Type["CHAR"] = 1] = "CHAR";
    Type[Type["INT"] = 2] = "INT";
    Type[Type["DOUBLE"] = 3] = "DOUBLE";
    Type[Type["BOOL"] = 4] = "BOOL";
    Type[Type["VOID"] = 5] = "VOID";
    Type[Type["STRUCT"] = 6] = "STRUCT";
    Type[Type["NULL"] = 7] = "NULL";
    Type[Type["ATTRIBUTO"] = 8] = "ATTRIBUTO";
    Type[Type["ARRAY"] = 9] = "ARRAY";
})(Type = exports.Type || (exports.Type = {}));

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
var Attribute = /** @class */ (function () {
    function Attribute(id, value, line, column) {
        this.id = id;
        this.value = value;
        this.line = line;
        this.column = column;
    }
    return Attribute;
}());
exports.Attribute = Attribute;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Objeto = void 0;
var scope_1 = require("../ast/scope");
var Objeto = /** @class */ (function () {
    function Objeto(id, text, line, column, attributes, objetos) {
        this.id = id;
        this.text = text;
        this.line = line;
        this.column = column;
        this.attributes = attributes;
        this.objetos = objetos;
        this.scope = new scope_1.Scope(null);
    }
    return Objeto;
}());
exports.Objeto = Objeto;

},{"../ast/scope":7}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operacion = exports.Operador = void 0;
var type_1 = require("../ast/type");
var shared_1 = require("../shared");
var Operador;
(function (Operador) {
    Operador[Operador["SUMA"] = 0] = "SUMA";
    Operador[Operador["RESTA"] = 1] = "RESTA";
    Operador[Operador["MULTIPLICACION"] = 2] = "MULTIPLICACION";
    Operador[Operador["DIVISION"] = 3] = "DIVISION";
    Operador[Operador["MODULO"] = 4] = "MODULO";
    Operador[Operador["NEGATIVO"] = 5] = "NEGATIVO";
    Operador[Operador["REPETIR"] = 6] = "REPETIR";
    Operador[Operador["CONCAT"] = 7] = "CONCAT";
    Operador[Operador["MAYOR"] = 8] = "MAYOR";
    Operador[Operador["MENOR"] = 9] = "MENOR";
    Operador[Operador["MAYOR_IGUAL"] = 10] = "MAYOR_IGUAL";
    Operador[Operador["MENOR_IGUAL"] = 11] = "MENOR_IGUAL";
    Operador[Operador["IGUAL"] = 12] = "IGUAL";
    Operador[Operador["DIFERENTE"] = 13] = "DIFERENTE";
    Operador[Operador["OR"] = 14] = "OR";
    Operador[Operador["AND"] = 15] = "AND";
    Operador[Operador["NOT"] = 16] = "NOT";
    Operador[Operador["DESCONOCIDO"] = 17] = "DESCONOCIDO";
})(Operador = exports.Operador || (exports.Operador = {}));
var Operacion = /** @class */ (function () {
    function Operacion(op_izq, op_der, operador, line, column) {
        this.op_izq = op_izq;
        this.op_der = op_der;
        this.operador = operador;
        this.line = line;
        this.column = column;
    }
    Operacion.prototype.getType = function (scope, tree) {
        var value = this.getValue(scope, tree);
        if (typeof value === 'boolean')
            return type_1.Type.BOOL;
        else if (typeof value === 'string')
            return type_1.Type.STRING;
        else if (typeof value === 'number') {
            if (this.isInt(Number(value)))
                return type_1.Type.INT;
            return type_1.Type.DOUBLE;
        }
        else if (value === null)
            return type_1.Type.NULL;
        return type_1.Type.VOID;
    };
    Operacion.prototype.getValue = function (scope, tree) {
        if (this.operador !== Operador.NEGATIVO &&
            this.operador !== Operador.NOT) {
            var op1 = this.op_izq.getValue(scope, tree);
            var op2 = this.op_der.getValue(scope, tree);
            /* ********** ********** **********
             * ARITMETICAS
             ********** ********** ********** */
            if (this.operador === Operador.SUMA) {
                if (typeof op1 === 'number' && typeof op2 === 'number')
                    return op1 + op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba sumar int o double");
                    return null;
                }
            }
            else if (this.operador === Operador.RESTA) {
                if (typeof op1 === 'number' && typeof op2 === 'number')
                    return op1 - op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba restar int o double");
                    return null;
                }
            }
            else if (this.operador === Operador.MULTIPLICACION) {
                if (typeof op1 === 'number' && typeof op2 === 'number')
                    return op1 * op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba multiplicar int o double");
                    return null;
                }
            }
            else if (this.operador === Operador.DIVISION) {
                if (typeof op1 === 'number' && typeof op2 === 'number') {
                    if (op2 === 0) {
                        shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): " + op1 + " no es divisible entre 0");
                        return null;
                    }
                    return op1 / op2;
                }
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba dividir int o double");
                    return null;
                }
            }
            else if (this.operador === Operador.MODULO) {
                if (typeof op1 === 'number' && typeof op2 === 'number') {
                    if (op2 === 0) {
                        shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): " + op1 + " no es divisible entre 0");
                        return null;
                    }
                    return op1 % op2;
                }
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba dividir int o double");
                    return null;
                }
            }
            else if (this.operador === Operador.REPETIR) {
                if (typeof op1 === 'string' && typeof op2 === 'number') {
                    return op1.repeat(op2);
                }
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba operar (string, int)");
                    return null;
                }
            }
            else if (this.operador === Operador.CONCAT) {
                if (typeof op1 === 'string' && typeof op2 === 'string')
                    return "" + op1 + op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (): Se esperaba concatenar string");
                    return null;
                }
            }
            else if (this.operador === Operador.AND) {
                /* ********** ********** **********
                 * LÓGICAS
                 ********** ********** ********** */
                if (typeof op1 === 'boolean' && typeof op2 === 'boolean')
                    return op1 && op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (): Se esperaba operar boolean");
                    return null;
                }
            }
            else if (this.operador === Operador.OR) {
                if (typeof op1 === 'boolean' && typeof op2 === 'boolean')
                    return op1 || op2;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (): Se esperaba operar boolean");
                    return null;
                }
            }
            else if (this.operador === Operador.IGUAL) {
                /* ********** ********** **********
                 * RELACIONALES
                 ********** ********** ********** */
                return op1 == op2;
            }
            else if (this.operador === Operador.DIFERENTE) {
                return op1 != op2;
            }
            else if (this.operador === Operador.MENOR) {
                return op1 < op2;
            }
            else if (this.operador === Operador.MENOR_IGUAL) {
                return op1 <= op2;
            }
            else if (this.operador === Operador.MAYOR) {
                return op1 > op2;
            }
            else if (this.operador === Operador.MAYOR_IGUAL) {
                return op1 >= op2;
            }
        }
        else {
            /* ********** ********** **********
             * UNARIOS
             ********** ********** ********** */
            var op1 = this.op_izq.getValue(scope, tree);
            if (this.operador == Operador.NEGATIVO) {
                if (typeof (op1 === 'number'))
                    return op1 * -1;
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba que " + op1 + " sea tipo int o double");
                    return null;
                }
            }
            else if (this.operador == Operador.NOT) {
                if (typeof (op1 === 'boolean'))
                    return !Boolean(op1);
                else {
                    shared_1.setConsole("Error sem\u00E1ntico (" + this.line + "," + this.column + "): Se esperaba que " + op1 + " sea tipo boolean");
                    return null;
                }
            }
        }
        return null;
    };
    Operacion.prototype.translate = function (scope, tree) {
        throw new Error('Method not implemented.');
    };
    Operacion.prototype.isInt = function (n) {
        return Number(n) === n && n % 1 === 0;
    };
    return Operacion;
}());
exports.Operacion = Operacion;

},{"../ast/type":8,"../shared":14}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primitive = void 0;
var type_1 = require("../ast/type");
var Primitive = /** @class */ (function () {
    function Primitive(value, type, line, column) {
        this.line = line;
        this.type = type;
        this.column = column;
        this.value = value;
    }
    Primitive.prototype.getType = function (scope, tree) {
        // TODO: Return this.type & match to Operation class
        var value = this.getValue(scope, tree);
        if (typeof value === 'boolean')
            return type_1.Type.BOOL;
        else if (typeof value === 'string')
            return type_1.Type.STRING;
        else if (typeof value === 'number') {
            if (this.isInt(Number(value)))
                return type_1.Type.INT;
            return type_1.Type.DOUBLE;
        }
        else if (value === null)
            return type_1.Type.NULL;
        return type_1.Type.VOID;
    };
    Primitive.prototype.getValue = function (scope, tree) {
        return this.value;
    };
    Primitive.prototype.translate = function (scope, tree) {
        throw new Error('Method not implemented.');
    };
    Primitive.prototype.isInt = function (n) {
        return Number(n) === n && n % 1 === 0;
    };
    return Primitive;
}());
exports.Primitive = Primitive;

},{"../ast/type":8}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Print = void 0;
var shared_1 = require("../shared");
var Print = /** @class */ (function () {
    function Print(expressions, line, column, newLine) {
        if (newLine === void 0) { newLine = false; }
        this.expressions = expressions;
        this.line = line;
        this.column = column;
        this.newLine = newLine;
    }
    Print.prototype.exec = function (scope, tree) {
        var _this = this;
        this.expressions.forEach(function (expr) {
            var value = expr.getValue(scope, tree);
            if (value !== null) {
                shared_1.setConsole(value);
            }
            else
                shared_1.setConsole("Error sem\u00E1ntico (" + _this.line + ", " + _this.column + "): No se pueden imprimir valores nulos");
        });
        if (this.newLine)
            shared_1.setConsole('\n');
    };
    Print.prototype.translate = function (scope, tree) {
        throw new Error('Method not implemented.');
    };
    return Print;
}());
exports.Print = Print;

},{"../shared":14}],14:[function(require,module,exports){
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

},{}]},{},[5])(5)
});
