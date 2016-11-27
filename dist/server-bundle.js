module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 133);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = require("vue");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/

(function(factory) {

  // Find the global object for export to both the browser and web workers.
  var globalObject = typeof window === 'object' && window ||
                     typeof self === 'object' && self;

  // Setup highlight.js for different environments. First is Node.js or
  // CommonJS.
  if(true) {
    factory(exports);
  } else if(globalObject) {
    // Export hljs globally even when using AMD for cases when this script
    // is loaded with others that may still expect a global hljs.
    globalObject.hljs = factory({});

    // Finally register the global hljs with AMD.
    if(typeof define === 'function' && define.amd) {
      define([], function() {
        return globalObject.hljs;
      });
    }
  }

}(function(hljs) {
  // Convenience variables for build-in objects
  var ArrayProto = [],
      objectKeys = Object.keys;

  // Global internal variables used within the highlight.js library.
  var languages = {},
      aliases   = {};

  // Regular expressions used throughout the highlight.js library.
  var noHighlightRe    = /^(no-?highlight|plain|text)$/i,
      languagePrefixRe = /\blang(?:uage)?-([\w-]+)\b/i,
      fixMarkupRe      = /((^(<[^>]+>|\t|)+|(?:\n)))/gm;

  var spanEndTag = '</span>';

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  // Object map that is used to escape some common HTML characters.
  var escapeRegexMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };

  /* Utility functions */

  function escape(value) {
    return value.replace(/[&<>]/gm, function(character) {
      return escapeRegexMap[character];
    });
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index === 0;
  }

  function isNotHighlighted(language) {
    return noHighlightRe.test(language);
  }

  function blockLanguage(block) {
    var i, match, length, _class;
    var classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    match = languagePrefixRe.exec(classes);
    if (match) {
      return getLanguage(match[1]) ? match[1] : 'no-highlight';
    }

    classes = classes.split(/\s+/);

    for (i = 0, length = classes.length; i < length; i++) {
      _class = classes[i]

      if (isNotHighlighted(_class) || getLanguage(_class)) {
        return _class;
      }
    }
  }

  function inherit(parent, obj) {
    var key;
    var result = {};

    for (key in parent)
      result[key] = parent[key];
    if (obj)
      for (key in obj)
        result[key] = obj[key];
    return result;
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 3)
          offset += child.nodeValue.length;
        else if (child.nodeType === 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: 'stop',
              offset: offset,
              node: child
            });
          }
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset !== highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event === 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + ArrayProto.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event === 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream === original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream === original && stream.length && stream[0].offset === processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event === 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return new RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        var flatten = function(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        };

        if (typeof mode.keywords === 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          objectKeys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\w+/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance == null)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c === 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
        })
        .concat([mode.terminator_end, mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(/*s*/) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      var i, length;

      for (i = 0, length = mode.contains.length; i < length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        while (mode.endsParent && mode.parent) {
          mode = mode.parent;
        }
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : spanEndTag

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      var keyword_match, last_index, match, result;

      if (!top.keywords)
        return escape(mode_buffer);

      result = '';
      last_index = 0;
      top.lexemesRe.lastIndex = 0;
      match = top.lexemesRe.exec(mode_buffer);

      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      var explicit = typeof top.subLanguage === 'string';
      if (explicit && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }

      var result = explicit ?
                   highlight(top.subLanguage, mode_buffer, true, continuations[top.subLanguage]) :
                   highlightAuto(mode_buffer, top.subLanguage.length ? top.subLanguage : undefined);

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (explicit) {
        continuations[top.subLanguage] = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      result += (top.subLanguage != null ? processSubLanguage() : processKeywords());
      mode_buffer = '';
    }

    function startNewMode(mode) {
      result += mode.className? buildSpan(mode.className, '', true): '';
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        if (new_mode.skip) {
          mode_buffer += lexeme;
        } else {
          if (new_mode.excludeBegin) {
            mode_buffer += lexeme;
          }
          processBuffer();
          if (!new_mode.returnBegin && !new_mode.excludeBegin) {
            mode_buffer = lexeme;
          }
        }
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (origin.skip) {
          mode_buffer += lexeme;
        } else {
          if (!(origin.returnEnd || origin.excludeEnd)) {
            mode_buffer += lexeme;
          }
          processBuffer();
          if (origin.excludeEnd) {
            mode_buffer = lexeme;
          }
        }
        do {
          if (top.className) {
            result += spanEndTag;
          }
          if (!top.skip) {
            relevance += top.relevance;
          }
          top = top.parent;
        } while (top !== end_mode.parent);
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var continuations = {}; // keep continuations for sub-languages
    var result = '', current;
    for(current = top; current !== language; current = current.parent) {
      if (current.className) {
        result = buildSpan(current.className, '', true) + result;
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += spanEndTag;
        }
      }
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message && e.message.indexOf('Illegal') !== -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || objectKeys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.filter(getLanguage).forEach(function(name) {
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    return !(options.tabReplace || options.useBR)
      ? value
      : value.replace(fixMarkupRe, function(match, p1) {
          if (options.useBR && match === '\n') {
            return '<br>';
          } else if (options.tabReplace) {
            return p1.replace(/\t/g, options.tabReplace);
          }
      });
  }

  function buildClassName(prevClassName, currentLang, resultLang) {
    var language = currentLang ? aliases[currentLang] : resultLang,
        result   = [prevClassName.trim()];

    if (!prevClassName.match(/\bhljs\b/)) {
      result.push('hljs');
    }

    if (prevClassName.indexOf(language) === -1) {
      result.push(language);
    }

    return result.join(' ').trim();
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var node, originalStream, result, resultNode, text;
    var language = blockLanguage(block);

    if (isNotHighlighted(language))
        return;

    if (options.useBR) {
      node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      node.innerHTML = block.innerHTML.replace(/\n/g, '').replace(/<br[ \/]*>/g, '\n');
    } else {
      node = block;
    }
    text = node.textContent;
    result = language ? highlight(language, text, true) : highlightAuto(text);

    originalStream = nodeStream(node);
    if (originalStream.length) {
      resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      resultNode.innerHTML = result.value;
      result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className = buildClassName(block.className, language, result.language);
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Updates highlight.js global options with values passed in the form of an object.
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    ArrayProto.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  function registerLanguage(name, language) {
    var lang = languages[name] = language(hljs);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function listLanguages() {
    return objectKeys(languages);
  }

  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  hljs.highlight = highlight;
  hljs.highlightAuto = highlightAuto;
  hljs.fixMarkup = fixMarkup;
  hljs.highlightBlock = highlightBlock;
  hljs.configure = configure;
  hljs.initHighlighting = initHighlighting;
  hljs.initHighlightingOnLoad = initHighlightingOnLoad;
  hljs.registerLanguage = registerLanguage;
  hljs.listLanguages = listLanguages;
  hljs.getLanguage = getLanguage;
  hljs.inherit = inherit;

  // Common regexps
  hljs.IDENT_RE = '[a-zA-Z]\\w*';
  hljs.UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
  hljs.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  hljs.C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  hljs.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  hljs.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  hljs.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  hljs.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/
  };
  hljs.COMMENT = function (begin, end, inherits) {
    var mode = hljs.inherit(
      {
        className: 'comment',
        begin: begin, end: end,
        contains: []
      },
      inherits || {}
    );
    mode.contains.push(hljs.PHRASAL_WORDS_MODE);
    mode.contains.push({
      className: 'doctag',
      begin: '(?:TODO|FIXME|NOTE|BUG|XXX):',
      relevance: 0
    });
    return mode;
  };
  hljs.C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$');
  hljs.C_BLOCK_COMMENT_MODE = hljs.COMMENT('/\\*', '\\*/');
  hljs.HASH_COMMENT_MODE = hljs.COMMENT('#', '$');
  hljs.NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE,
    relevance: 0
  };
  hljs.C_NUMBER_MODE = {
    className: 'number',
    begin: hljs.C_NUMBER_RE,
    relevance: 0
  };
  hljs.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: hljs.BINARY_NUMBER_RE,
    relevance: 0
  };
  hljs.CSS_NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE + '(' +
      '%|em|ex|ch|rem'  +
      '|vw|vh|vmin|vmax' +
      '|cm|mm|in|pt|pc|px' +
      '|deg|grad|rad|turn' +
      '|s|ms' +
      '|Hz|kHz' +
      '|dpi|dpcm|dppx' +
      ')?',
    relevance: 0
  };
  hljs.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gimuy]*/,
    illegal: /\n/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  hljs.TITLE_MODE = {
    className: 'title',
    begin: hljs.IDENT_RE,
    relevance: 0
  };
  hljs.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };
  hljs.METHOD_GUARD = {
    // excludes method names from keyword processing
    begin: '\\.\\s*' + hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };

  return hljs;
}));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__App_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuetify__ = __webpack_require__(130);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuetify___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vuetify__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_index__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__store_index__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__router_index__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_vuex_router_sync__ = __webpack_require__(132);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_vuex_router_sync___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_vuex_router_sync__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_highlight_js_lib_languages_scss__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_highlight_js_lib_languages_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_highlight_js_lib_languages_scss__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_highlight_js_lib_languages_xml__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_highlight_js_lib_languages_xml___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_highlight_js_lib_languages_xml__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_highlight_js_lib_languages_javascript__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_highlight_js_lib_languages_javascript___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_highlight_js_lib_languages_javascript__);
/* harmony export (binding) */ __webpack_require__.d(exports, "c", function() { return app; });












__WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js___default.a.registerLanguage('scss', __WEBPACK_IMPORTED_MODULE_8_highlight_js_lib_languages_scss___default.a)
__WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js___default.a.registerLanguage('xml', __WEBPACK_IMPORTED_MODULE_9_highlight_js_lib_languages_xml___default.a)
__WEBPACK_IMPORTED_MODULE_7_highlight_js_lib_highlight_js___default.a.registerLanguage('javascript', __WEBPACK_IMPORTED_MODULE_10_highlight_js_lib_languages_javascript___default.a)

__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6_vuex_router_sync__["sync"])(__WEBPACK_IMPORTED_MODULE_4__store_index__["a" /* default */], __WEBPACK_IMPORTED_MODULE_5__router_index__["a" /* default */])

__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_2_vuetify___default.a)

Object.keys(__WEBPACK_IMPORTED_MODULE_3__components_index__["a" /* default */]).forEach(function (key) {
  __WEBPACK_IMPORTED_MODULE_0_vue___default.a.component(key, __WEBPACK_IMPORTED_MODULE_3__components_index__["a" /* default */][key])
})

var app = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a(__WEBPACK_IMPORTED_MODULE_0_vue___default.a.util.extend({
  router: __WEBPACK_IMPORTED_MODULE_5__router_index__["a" /* default */],
  store: __WEBPACK_IMPORTED_MODULE_4__store_index__["a" /* default */]
}, __WEBPACK_IMPORTED_MODULE_1__App_vue___default.a))

/* harmony reexport (binding) */ __webpack_require__.d(exports, "a", function() { return __WEBPACK_IMPORTED_MODULE_5__router_index__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(exports, "b", function() { return __WEBPACK_IMPORTED_MODULE_4__store_index__["a"]; });



/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      title: ''
    }
  },

  mounted: function mounted () {
    this.$vuetify.init()
  }
};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: ['header']
};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: {
    params: Array,
    default: function () { return []; }
  }
};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: {
    type: {
      type: String,
      required: true
    }
  },

  computed: {
    component: function component () {
      return this[this.type]()
    }
  },

  methods: {
    comp: function comp () {
      return {
        classes: 'red white--text',
        text: 'Component',
        icon: 'widgets'
      }
    },

    directive: function directive () {
      return {
        classes: 'blue white--text',
        text: 'Directive',
        icon: 'polymer'
      }
    },

    function: function function$1 () {
      return {
        classes: 'purple white--text',
        text: 'Function',
        icon: 'functions'
      }
    },

    slot: function slot () {
      return {
        classes: 'orange white--text',
        text: 'Slot',
        icon: 'short_text'
      }
    }
  }
};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: ['doc']
};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      subTitle: ''
    }
  },

  props: {
    title: String
  },

  watch: {
    title: function title () {
      this.determineSubTitle()
    }
  },

  mounted: function mounted () {
    this.determineSubTitle()
  },

  methods: {
    determineSubTitle: function determineSubTitle () {
      switch (true) {
        case this.match('components'):
          this.subTitle = 'Vue components built semmantically&mdash;easy to use, easy to remember'
        break
        case this.match('directives'):
          this.subTitle = 'Vue directives designed to enchance user experience'
        break
        case this.match('functions'):
          this.subTitle = 'Built in functions to customize your user experience'
        break
        case this.match('quick-start'):
          this.subTitle = 'Vue premade templates&mdash;out of the box, ready to go'
        break
        case this.match('tutorial'):
          this.subTitle = 'Learn how to use the Vuetify framework in your first project'
        break
        case this.match('css'):
          this.subTitle = 'CSS classes to help reduce the need for manual class declaration'
        break
        case this.match('layouts'):
          this.subTitle = 'Setup the foundation of your new application in no time'
        break
        default:
          this.subTitle = 'Learn about the Vuetify framework'
        break
      }
    },

    match: function match (str) {
      return this.$route.path.match(str) !== null
    }
  }
};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      items: [
        { href: '/', text: 'About', icon: 'question_answer' },
        { href: '/quick-start', text: 'Quick Start', icon: 'fast_forward' },
        { href: '/overview', text: 'Overview', icon: 'info' },
        {
          parent: { href: '#!', text: 'Components', icon: 'widgets', },
          items: [
            { href: '/components/alerts', text: 'Alerts', icon: 'priority_high' },
            { href: '/components/breadcrumbs', text: 'Breadcrumbs', icon: 'linear_scale' },
            { href: '/components/buttons', text: 'Buttons', icon: 'arrow_forward' },
            { href: '/components/cards', text: 'Cards', icon: 'note' },
            { href: '/components/chips', text: 'Chips', icon: 'label' },
            { href: '/components/collapsible', text: 'Collapsible', icon: 'reorder' },
            { href: '/components/dropdowns', text: 'Dropdowns', icon: 'arrow_drop_down_circle' },
            { href: '/components/footer', text: 'Footer', icon: 'call_to_action' },
            { href: '/components/forms', text: 'Forms', icon: 'text_format' },
            { href: '/components/lists', text: 'Lists', icon: 'format_list_bulleted' },
            { href: '/components/modals', text: 'Modals', icon: 'picture_in_picture' },
            { href: '/components/navbar', text: 'Navbar', icon: 'web' },
            { href: '/components/pagination', text: 'Pagination', icon: 'looks_one' },
            { href: '/components/progress', text: 'Progress', icon: 'trending_flat' },
            { href: '/components/parallax', text: 'Parallax', icon: 'import_export' },
            { href: '/components/sidebar', text: 'Sidebar', icon: 'view_quilt' },
            { href: '/components/slider', text: 'Slider', icon: 'slideshow' },
            { href: '/components/tabs', text: 'Tabs', icon: 'more_horiz' }
          ]
        },
        {
          parent: { href: '#!', text: 'Directives', icon: 'polymer' },
          items: [
            { href: '/directives/badges', text: 'Badges', icon: 'fiber_manual_record' },
            { href: '/directives/tooltips', text: 'Tooltips', icon: 'sms' } ]
        },
        {
          parent: { href: '#!', text: 'Functions', icon: 'functions' },
          items: [
            { href: '/functions/toasts', text: 'Toasts', icon: 'flip_to_front' }
          ]
        },
        {
          parent: { href: '#!', text: 'CSS', icon: 'brush'
          },
          items: [
            { href: '/css/typography', text: 'Typography', icon: 'title' },
            { href: '/css/grid', text: 'Grid', icon: 'grid_on' },
            { href: '/css/colors', text: 'Colors', icon: 'invert_colors' }
          ]
        },
        { href: '/layouts', text: 'Layouts', icon: 'devices' },
        { href: '/bus', text: 'Bus', icon: 'device_hub' }
      ]
    }
  }
};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_highlight_js_lib_highlight_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_highlight_js_lib_highlight_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_highlight_js_lib_highlight_js__);
//
//
//
//
//
//
//

  

	/* harmony default export */ exports["default"] = {
    props: {
      code: String
    },

		mounted: function mounted () {
			this.highlight()
		},

		methods: {
			highlight: function highlight () {
				__WEBPACK_IMPORTED_MODULE_0_highlight_js_lib_highlight_js___default.a.highlightBlock(this.$refs.code)
			}
		}
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: {
    first: Boolean
  },

  computed: {
    styles: function styles () {
      var styles = {}

      if (this.first) {
        styles['margin-top'] = 0
      }

      return styles
    }
  }
};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  props: {
    route: String,
    text: String
  }
};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  mounted: function mounted () {
    this.$emit('view', 'Vuetify')
  },

  preFetch: function preFetch () {
    return {
      title: 'Vuetify | Vue JS 2 Components',
      h1: 'Vuetify',
      meta: {
        description: 'Reusable material design components for Vue JS 2.0.',
        keywords: 'vue, vue 2.0, vue js, material design, vue components, material design components'
      }
    }
  }
};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    var data = {
      alert: true,
      doc: {
        title: 'Alert',
        desc: 'The <code>v-alert</code> component is used to convey information to the user. Designed to stand out, the alerts come in four styles, success, info, warning, and error.',
        types: ['comp', 'slot'],
        params: [
          [
            '<code>&lt;v-alert&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-model</code>',
            '',
            'Accepts v-model attr: [Boolean]'
          ],
          [
            '<code>close</code>',
            'Hides the alert',
            'Default: false'
          ]
        ]
      },
      lorem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      types: [
        'success', 'info', 'warning', 'error'
      ]
    }

    data.types.forEach(function (i) {
      data.doc.params.push([
        ("<code>" + i + "</code>"),
        ("Applies the alert--" + i + " class"),
        'Default: false'
      ])
    })

    return data
  },

  mounted: function mounted () {
    this.$emit('view', 'Alerts')
  }
};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Badge',
        desc: "\n          <p>\n            Badge directives can be applied to any element using the <code>v-badge</code> directive. By default, a badge will use the application's defined <strong class=\"primary--text\">primary color</strong>. Parameters can be passed using the arg, <code>v-badge:arg</code>, modifier, <code>v-badge:2.modifier</code>, or by passing an object by expression, <code>v-badge=\"{ value: 2, overlap: true }\"</code>\n          </p>\n          <p>\n            The color can be changed by using the color--after helper class, or by apply a class that modifies the background of the badged elements <strong>:after</strong> psuedo-selector.\n          </p>",
        types: [
          'directive'
        ],
        params: [
          [
            '<code>v-badge:arg.icon</code>',
            'Specifies the use of an icon',
            'Default: false'
          ],
          [
            '<code>v-badge:arg.left</code>',
            'Positions the badge to the left of the element',
            'Default: false'
          ],
          [
            '<code>v-badge:arg.overlap</code>',
            'Overlaps badge on element',
            'Default: false'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Badges')
  }
};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Breadcrumbs',
        desc: "\n          <p>\n            The <code>v-breadcrumbs</code> component is a navigational helper for pages. It can accept a <strong>Material Icons</strong> icon or character as a divider. An array of objects containing the fields <em>href</em>, <em>text</em> and optional <em>disabled</em> can be passed to the <strong>items</strong> property of the component.  Additionally, a regular slot exists for more control of the breadcrumbs, either utilizing <code>v-breadcrumb</code> or other custom markup.\n          </p>\n        ",
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-breadcrumbs&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>divider</code>',
            'Specifies the dividing character',
            'Default: /'
          ],
          [
            '<code>icon</code>',
            'Specifies that the divider is an icon',
            'Default: false'
          ],
          [
            '<code>items</code>',
            'The array of Breadcrumbs',
            'Allowed properties: href, text, disabled'
          ],
          [
            '<code>&lt;v-breadcrumbs-item&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>disabled</code>',
            'Disables the breadcrumb',
            'Default: false'
          ],
          [
            '<code>item<code>',
            'The item object',
            'Allowed object properties: href, text'
          ]
        ]
      },
      items: [
        {
          href: '#!',
          text: 'Dashboard',
          disabled: false
        },
        {
          href: '#!',
          text: 'Link 1',
          disabled: false
        },
        {
          href: '#!',
          text: 'Link 2',
          disabled: true
        }
      ]
    }
  },
  mounted: function mounted () {
    this.$emit('view', 'Breadcrumbs')
  }
};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Button',
        desc: "\n          <p>\n            The <code>v-btn</code> component replaces the standard html button with a material design theme and a multitude of options. Any color helper class can be used to alter the background or text color. Remember that all event captures must be done using the <strong>.native</strong> modifier.\n          </p>\n        ",
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-btn&gt;',
            '',
            'Base Component'
          ],
          [
            '<code>block</code>',
            'Applies the btn--block class',
            'Default: false'
          ],
          [
            '<code>flat</code>',
            'Applies the btn--flat class',
            'Default: false'
          ],
          [
            '<code>floating</code>',
            'Applies the btn--floating class',
            'Default: false'
          ],
          [
            '<code>icon</code>',
            'Applies the btn--icon class',
            'Default: false'
          ],
          [
            '<code>large</code>',
            'Applies the btn--large class',
            'Default: false'
          ],
          [
            '<code>outline</code>',
            'Applies the btn--outline class',
            'Default: false'
          ],
          [
            '<code>round</code>',
            'Applies the btn--round class',
            'Default: false'
          ],
          [
            '<code>small</code>',
            'Applies the btn--small class',
            'Default: false'
          ],
          [
            '<code>type</code>',
            'Sets the buttons type attribute',
            'Default: false'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Buttons')
  }
};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Card',
        desc: "\n          <p>\n            The <code>v-card</code> component is a versatile component that can be used for anything from a panel to a static image. The <strong>card</strong> component has numerous helper components to make markup as easy as possible. Components that have no listed options use <strong class=\"green--text\">Vue's</strong> functional component option for faster rendering and serve as markup sugar to make building easier.\n          </p>\n        ",
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-card&gt;</code>',
            '',
            'Base Component'
          ],
          [
            '<code>height</code>',
            'Manually define the height of the Card',
            'Type: String'
          ],
          [
            '<code>horizontal</code>',
            'Applies the card--horizontal class',
            'Default: false'
          ],
          [
            '<code>img</code>',
            'Specifies an image background',
            'Type: String'
          ],
          [
            '<code>height</code>',
            'Manually define the height of the Card Title',
            'Type: String'
          ],
          [
            '<code>img</code>',
            'Specifies an image background',
            'Type: String'
          ],
          [
            '<code>&lt;v-card-menu&gt;</code>',
            '',
            'Functional Component'
          ],
          [
            '<code>&lt;v-card-stack&gt;</code>',
            '',
            'Functional Component'
          ],
          [
            '<code>&lt;v-card-actions&gt;</code>',
            '',
            'Functional Component'
          ],
          [
            '<code>&lt;v-card-text&gt;</code>',
            '',
            'Functional Component'
          ],
          [
            '<code>&lt;v-card-title-actions&gt;</code>',
            '',
            'Functional Component'
          ],
          [
            '<code>&lt;v-card-title-text&gt;</code>',
            '',
            'Functional Component'
          ]
        ]
      },
      card_text: 'Lorem ipsum dolor sit amet, brute iriure accusata ne mea. Eos suavitate referrentur ad, te duo agam libris qualisque, utroque quaestio accommodare no qui. Et percipit laboramus usu, no invidunt verterem nominati mel. Dolorem ancillae an mei, ut putant invenire splendide mel, ea nec propriae adipisci. Ignota salutandi accusamus in sed, et per malis fuisset, qui id ludus appareat.',
      title_text: "\n        <p>Card Title</p>\n      "
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Cards')
  }
};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      chip1: true,
      chip2: true,
      chip3: true,
      chip4: true,
      doc: {
        title: 'Chip',
        desc: "The <code>v-chip</code> component is used to convey small pieces of information. Using the <code>close</code> property, the chip becomes interactive, allowing user interaction.",
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-chip&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-model</code>',
            '',
            'Accepts v-model attr: [Boolean]'
          ],
          [
            '<code>close</code>',
            'Removes the chip',
            'Default: false'
          ],
          [
            '<code>label</code>',
            'Applies the chip--label class',
            'Default: false'
          ],
          [
            '<code>outline</code>',
            'Applies the chip--outline class',
            'Default: false'
          ],
          [
            '<code>small</code>',
            'Applies the chip--small class',
            'Default: false'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Chips')
  }
};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Collapsible',
        desc: "The <code>v-collapsible</code> component is useful for reducing vertical space with large amounts of information. The default functionality of the component is to only display one collapsible body at a time, however, with the <code>expandable</code> property, the collapsible can remain open until explicity closed.",
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-collapsible&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>expand</code>',
            'Does not contract when multiple are open',
            'Default: false'
          ],
          [
            '<code>&lt;v-collapsible-header&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-collapsible-body&gt;</code>',
            '',
            'Functional component'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Collapsible')
  }
};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      colors: [
        'red', 'pink', 'purple', 'deep-purple',
        'indigo', 'blue', 'light-blue', 'cyan',
        'teal', 'green', 'light-green', 'lime',
        'yellow', 'amber', 'orange', 'deep-orange',
        'brown', 'blue-grey', 'grey'
      ],
      types: [
        'darken', 'lighten', 'accent'
      ]
    }
  },
  mounted: function mounted () {
    this.$emit('view', 'Colors')
  },

  preFetch: function preFetch () {
    return {
      title: 'Colors',
      meta: {}
    }
  }
};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  mounted: function mounted () {
    this.$emit('view', 'Dropdowns')
  },

  data: function data () {
    return {
      doc: {
        title: 'Dropdown',
        desc: "The <code>v-dropdown</code> component utilizes the v-dropdown directive to link itself to another element. Once binded, clicking the element, or by hovering (if using the <code>hover</code> parameter), the dropdown will reposition absolutely positioned on top of the selected activator.",
        types: [
          'comp', 'slot', 'directive'
        ],
        params: [
          [
            '<code>v-dropdown</code>',
            '',
            'Base component'
          ],
          [
            '<code>id</code>',
            'Sets the id of the dropdown',
            'Required: true'
          ],
          [
            '<code>items</code>',
            'Optionally pass array of items',
            'Type: object'
          ],
          [
            '<code>right</code>',
            'Open dropdown from right',
            'Default: false'
          ]
        ]
      },
      items: [
        {
          href: '#!',
          text: 'Click Me'
        },
        {
          href: '#!',
          text: 'Click Me'
        },
        {
          href: '#!',
          text: 'Click Me'
        },
        {
          href: '#!',
          text: 'Click Me 2'
        }
      ]
    }
  }
};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  mounted: function mounted () {
    this.$emit('view', 'FAQ')
  },

  preFetch: function preFetch () {
    return {
      title: 'FAQ',
      meta: {}
    }
  }
};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Forms',
        desc: 'Soon',
        types: [
          'comp'
        ],
        params: [
          [
            '<code>v-select</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-text-input</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-radio</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-checkbox</code>',
            '',
            'Base component'
          ]
        ]
      },
      input: null,
      multiple: [],
      options: [
        {
          value: 1,
          text: 'Option 1'
        },
        {
          value: 2,
          text: 'Option 2'
        },
        {
          value: 3,
          text: 'Option 3'
        }
      ]
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Forms')
  }
};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Grid',
        desc: 'Soon',
        params: [
          [
            '<code>v-container</code>',
            '',
            'Base component'
          ],
          [
            '<code>fluid</code>',
            'Applies the container--fluid class',
            'Default: false'
          ],
          [
            '<code>v-row</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-col</code>',
            '',
            'Base component'
          ],
          [
            '<code>static attrs</code>',
            'Specify the size of the column',
            'xs:extra small, sm:small, md:medium, lg:large, 1 through 12'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Grid')
  },

  preFetch: function preFetch () {
    return {
      title: 'Grid',
      meta: {}
    }
  }
};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Layouts',
        desc: 'Vuetify supports numerous different pre-defined layouts, right out of the box.',
        params: [
          [
            '<code>v-app</code>',
            '',
            'Base component'
          ],
          [
            '<code>navbar</code>',
            'Variations: top, bottom, top-fixed, bottom-fixed',
            'Default: false'
          ],
          [
            '<code>sidebar</code>',
            'Variations: left, right, left-fixed, right-fixed',
            'Default: false'
          ],
          [
            '<code>footer</code>',
            '',
            'Default: false'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Layouts')
  }
};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  name: 'lists-view',

  data: function data () {
    return {
      doc: {
        title: 'List',
        desc: 'The <code>v-list</code> component is used to display, you guessed it, lists!. Combine the list with a <code>v-badge</code> directive or a <code>v-dropdown</code> to enhance and add functionality.',
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-list&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>&lt;v-list-item&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-item-title&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-item-sub-title&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-action&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-action-title&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-icon&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>&lt;v-list-avatar&gt;</code>',
            '',
            'Functional component'
          ]
        ]
      },
      items: [
        {
          href: '#!',
          text: 'Profile'
        },
        {
          href: '#!',
          text: 'Message'
        },
        {
          href: '#!',
          text: 'Friend Request'
        }
      ]
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Lists')
  }
};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  name: 'modals-view',

  data: function data () {
    return {
      doc: {
        title: 'Modal',
        desc: 'Soon',
        params: []
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Modals')
  }
};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Navbar',
        desc: 'Soon',
        params: [
          [
            '<code>&lt;v-navbar&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>&lt;v-navbar-items&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>items</code>',
            'The array of Navbar items',
            'Allowed properties: href, text'
          ],
          [
            '<code>&lt;v-navbar-item&gt;</code>',
            '',
            'base component'
          ],
          [
            '<code>item</code>',
            'The item object',
            'Allowed object properties: href, text'
          ]
        ]
      },
      items: [
        { text: 'Link', href: '#!' },
        { text: 'Link', href: '#!' },
        { text: 'Link', href: '#!' }
      ]
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Navbar')
  }
};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  mounted: function mounted () {
    this.$emit('view', 'Overview')
  },

  preFetch: function preFetch () {
    return {
      title: 'Overview',
      meta: {}
    }
  }
};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Pagination',
        desc: 'Coming Soon',
        types: [
          'comp'
        ],
        params: [
          [
            '<code>&lt;v-pagination&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>length</code>',
            'The length of the paginator',
            'Default: 0'
          ],
          [
            '<code>round</code>',
            'Applies the pagination--round class',
            'Default: false'
          ],
          [
            '<code>model</code>',
            '',
            'Accepts Vue v-model'
          ] ]
      },
      page: 3,
      page2: 7,
      page3: 4
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Pagination')
  }
};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  name: 'parallax-view',

  data: function data () {
    return {
      doc: {
        title: 'Parallax',
        desc: 'Coming Soon',
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>&lt;v-parallax&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>src</code>',
            'The image to parallax',
            'Required: true'
          ],
          [
            '<code>height</code>',
            'The height of the parallax container',
            'Default: 500'
          ],
          [
            '<code>&lt;v-parallax-content&gt;</code>',
            '',
            'Functional component'
          ],
          [
            '<code>opacity-offset</code>',
            'Sets offset fade for content. Set 0 for none',
            'Default: .7'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Parallax')
  }
};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Progress',
        desc: 'Soon',
        types: ['comp'],
        params: [
          [
            '<code>v-progress</code>',
            '',
            'Base component'
          ],
          [
            '<code>height</code>',
            'Sets the height of the progress bar',
            'Default: 7px'
          ],
          [
            '<code>indeterminate</code>',
            'Applies the progress--indeterminate class',
            'Default: false'
          ],
          [
            '<code>max</code>',
            'Sets the max limit of the progress bar',
            'Default: 0'
          ],
          [
            '<code>min</code>',
            'Sets the min limit of the progress bar',
            'Default: 0'
          ],
          [
            '<code>value</code>',
            'Sets the value of the progress bar',
            'Default: 0'
          ]
        ]
      },

      value: 40
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Progress')
  }
};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  mounted: function mounted () {
    this.$emit('view', 'Quick Start')
  }
};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Sidebar',
        desc: 'The <code>v-sidebar</code> component is what your users will utilize to navigate through the application. The sidebar is pre-configured to work with or without <strong>vue-router</strong> right out the box.',
        params: [
          [
            '<code>&lt;v-sidebar&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>drawer</code>',
            'Applies the navbar--drawer class',
            'Default: false'
          ],
          [
            '<code>fixed</code>',
            'Applies the navbar--fixed class',
            'Default: false'
          ],
          [
            '<code>id</code>',
            'Used for binding the directive',
            'Required: true'
          ],
          [
            '<code>items</code>',
            'Array of navbar items',
            'Item object: parent, text, href, items'
          ],
          [
            '<code>right</code>',
            'Applies the navbar--right class',
            'Used to designate the navbar is located on the right'
          ],
          [
            '<code>fixed</code>',
            'Applies the navbar--fixed class',
            'Default: false'
          ],
          [
            '<code>&lt;v-sidebar-group&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>item</code>',
            'Parent item object',
            'Item object: text, href, icon'
          ],
          [
            '<code>&lt;v-sidebar-items&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>items</code>',
            'Array of navbar items',
            'Same as navbar items property'
          ],
          [
            '<code>&lt;v-sidebar-item&gt;</code>',
            '',
            'Base component'
          ],
          [
            '<code>item</code>',
            'The item object',
            'Item object: text, href, icon'
          ],
          [
            '<code>router</code>',
            'Designates whether to use anchor or router-link',
            'Default: true'
          ]
        ]
      },
      items: [
        { text: 'Link', href: "#!" },
        { text: 'Link', href: "#!" },
        { text: 'Link', href: "#!" }
      ],
      item_group: [
        {
          parent: { text: 'Parent', href: '#!' },
          items: [
            { text: 'Child', href: '#!', icon: 'link' },
            { text: 'Child', href: '#!', icon: 'link' },
            { text: 'Child', href: '#!', icon: 'link' }
          ]
        },
        { text: 'Link', href: "#!" },
        { text: 'Link', href: "#!" },
        { text: 'Link', href: "#!" }
      ]
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Sidebar')
  }
};


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Slider',
        desc: 'Soon',
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>v-slider</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-slider-item</code>',
            '',
            'Base component'
          ],
          [
            '<code>src</code>',
            'The image src',
            'Required: true'
          ]
        ]
      },
      items: [
        {
          src: 'http://hddesktopwallpapers.in/wp-content/uploads/2015/09/cute-almonds-picture-1440x500.jpg'
        },
        {
          src: 'http://hddesktopwallpapers.in/wp-content/uploads/2015/09/sky-hd-picture-1440x500.jpg'
        },
        {
          src: 'https://burlingtonontariobirder.files.wordpress.com/2015/03/cropped-red-tailed-hawk-my-favourite-picture.jpg'
        },
        {
          src: 'http://www.mrwallpaper.com/wallpapers/Space-Planet-Aurora-1366x768.jpg'
        }
      ]
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Slider')
  }
};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  name: 'tabs-view',

  data: function data () {
    return {
      doc: {
        title: 'Tabs',
        desc: 'Soon',
        types: [
          'comp', 'slot'
        ],
        params: [
          [
            '<code>v-tabs</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-tab</code>',
            '',
            'Base component'
          ],
          [
            '<code>href</code>',
            'Assigns a tab-content to the tab',
            'Required: true'
          ],
          [
            '<code>selected</code>',
            'Pre-selects a tab',
            'Default: false'
          ],
          [
            '<code>v-tabs-content-container</code>',
            '',
            'Base component'
          ],
          [
            '<code>v-tabs-content</code>',
            '',
            'Base component'
          ],
          [
            '<code>id</code>',
            'Assigns the id of the tab content',
            'Required: true'
          ]
        ]
      },
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Tabs')
  }
};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Toast',
        desc: 'Soon',
        types: [
          'function'
        ],
        params: [
          [
            '<code>$vuetify.toast</code>',
            '',
            'Base function'
          ],
          [
            '<code>arguments</code>',
            '(content, type, duration, callback)',
            'Types: top, right, left, bottom, snack, callback'
          ]
        ]
      },
      left: ['Left Toast', 'left'],
      right: ['Right Toast', 'right'],
      top: ['Top Toast', 'top'],
      bottom: ['Bottom Toast', 'bottom'],
      snack: ['I\'m a snack toast', 'snack'],
      cb: ['Toast with Callback', 'right', 4000, function () { return alert('Callback'); }],
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Toasts')
  },

  methods: {
    callback: function callback () {
      alert('Alerting!')
    },

    toast: function toast (data) {
      (ref = this.$vuetify.toast).create.apply(ref, data)
      var ref;
    }
  }
};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function data () {
    return {
      doc: {
        title: 'Tooltip',
        desc: 'Soon',
        types: [
          'directive'
        ],
        params: [
          [
            '<code>v-tooltip</code>',
            '',
            'Base directive'
          ],
          [
            '<code>modifiers</code>',
            'top, right, bottom, left',
            'Required: true'
          ],
          [
            '<code>html</code>',
            'The content for the tooltip',
            'Required: true'
          ]
        ]
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Tooltips')
  }
};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  name: 'typography-view',

  data: function data () {
    return {
      doc: {
        title: 'Typography',
        desc: 'Soon',
        types: [],
        params: []
      }
    }
  },

  mounted: function mounted () {
    this.$emit('view', 'Typography')
  }
};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ComponentType_vue__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ComponentType_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__ComponentType_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ComponentHeader_vue__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ComponentHeader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__ComponentHeader_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ComponentExample_vue__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ComponentExample_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__ComponentExample_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ComponentParameters_vue__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ComponentParameters_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__ComponentParameters_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__DocView_vue__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__DocView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__DocView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__MainFooter_vue__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__MainFooter_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__MainFooter_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__MainNav_vue__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__MainNav_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__MainNav_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MainSide_vue__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MainSide_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__MainSide_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__Markup_vue__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__Markup_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__Markup_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__SectionHeader_vue__ = __webpack_require__(57);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__SectionHeader_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__SectionHeader_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__SectionText_vue__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__SectionText_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__SectionText_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__WhatsNext_vue__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__WhatsNext_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__WhatsNext_vue__);













/* harmony default export */ exports["a"] = {
  ComponentType: __WEBPACK_IMPORTED_MODULE_0__ComponentType_vue___default.a,
  ComponentHeader: __WEBPACK_IMPORTED_MODULE_1__ComponentHeader_vue___default.a,
  ComponentExample: __WEBPACK_IMPORTED_MODULE_2__ComponentExample_vue___default.a,
  ComponentParameters: __WEBPACK_IMPORTED_MODULE_3__ComponentParameters_vue___default.a,
  DocView: __WEBPACK_IMPORTED_MODULE_4__DocView_vue___default.a,
  MainFooter: __WEBPACK_IMPORTED_MODULE_5__MainFooter_vue___default.a,
  MainNav: __WEBPACK_IMPORTED_MODULE_6__MainNav_vue___default.a,
  MainSide: __WEBPACK_IMPORTED_MODULE_7__MainSide_vue___default.a,
  Markup: __WEBPACK_IMPORTED_MODULE_8__Markup_vue___default.a,
  SectionHeader: __WEBPACK_IMPORTED_MODULE_9__SectionHeader_vue___default.a,
  SectionText: __WEBPACK_IMPORTED_MODULE_10__SectionText_vue___default.a,
  WhatsNext: __WEBPACK_IMPORTED_MODULE_11__WhatsNext_vue___default.a
};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(129);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_router__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__views_AboutView_vue__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__views_AboutView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__views_AboutView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__views_QuickStartView_vue__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__views_QuickStartView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__views_QuickStartView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__views_OverviewView_vue__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__views_OverviewView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__views_OverviewView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__views_AlertsView_vue__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__views_AlertsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__views_AlertsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__views_BadgesView_vue__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__views_BadgesView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__views_BadgesView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__views_BreadcrumbsView_vue__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__views_BreadcrumbsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__views_BreadcrumbsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__views_ButtonsView_vue__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__views_ButtonsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__views_ButtonsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__views_CardsView_vue__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__views_CardsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__views_CardsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__views_ChipsView_vue__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__views_ChipsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__views_ChipsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__views_CollapsibleView_vue__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__views_CollapsibleView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__views_CollapsibleView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__views_ColorsView_vue__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__views_ColorsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12__views_ColorsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__views_DropdownsView_vue__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__views_DropdownsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_13__views_DropdownsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__views_GridView_vue__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__views_GridView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_14__views_GridView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__views_FaqView_vue__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__views_FaqView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_15__views_FaqView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__views_FormsView_vue__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__views_FormsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_16__views_FormsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__views_LayoutsView_vue__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__views_LayoutsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_17__views_LayoutsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__views_ListsView_vue__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__views_ListsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_18__views_ListsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__views_ModalsView_vue__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__views_ModalsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_19__views_ModalsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__views_NavbarView_vue__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__views_NavbarView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_20__views_NavbarView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__views_ParallaxView_vue__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__views_ParallaxView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_21__views_ParallaxView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__views_PaginationView_vue__ = __webpack_require__(78);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__views_PaginationView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_22__views_PaginationView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__views_ProgressView_vue__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__views_ProgressView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_23__views_ProgressView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__views_SliderView_vue__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__views_SliderView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_24__views_SliderView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__views_SidebarView_vue__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__views_SidebarView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_25__views_SidebarView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__views_TabsView_vue__ = __webpack_require__(84);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__views_TabsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_26__views_TabsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__views_ToastsView_vue__ = __webpack_require__(85);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__views_ToastsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_27__views_ToastsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__views_TooltipsView_vue__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__views_TooltipsView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_28__views_TooltipsView_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__views_TypographyView_vue__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__views_TypographyView_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_29__views_TypographyView_vue__);
































__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router___default.a)

/* harmony default export */ exports["a"] = new __WEBPACK_IMPORTED_MODULE_1_vue_router___default.a({
  base: __dirname,
  mode: 'history',
  scrollBehavior: function () { return ({ y: 0 }); },
  routes: [
    { path: '/', component: __WEBPACK_IMPORTED_MODULE_2__views_AboutView_vue___default.a },
    { path: '/quick-start', component: __WEBPACK_IMPORTED_MODULE_3__views_QuickStartView_vue___default.a },
    { path: '/overview', component: __WEBPACK_IMPORTED_MODULE_4__views_OverviewView_vue___default.a },
    { path: '/components/alerts', component: __WEBPACK_IMPORTED_MODULE_5__views_AlertsView_vue___default.a },
    { path: '/components/breadcrumbs', component: __WEBPACK_IMPORTED_MODULE_7__views_BreadcrumbsView_vue___default.a },
    { path: '/components/buttons', component: __WEBPACK_IMPORTED_MODULE_8__views_ButtonsView_vue___default.a },
    { path: '/components/cards', component: __WEBPACK_IMPORTED_MODULE_9__views_CardsView_vue___default.a },
    { path: '/components/chips', component: __WEBPACK_IMPORTED_MODULE_10__views_ChipsView_vue___default.a },
    { path: '/components/collapsible', component: __WEBPACK_IMPORTED_MODULE_11__views_CollapsibleView_vue___default.a },
    { path: '/components/dropdowns', component: __WEBPACK_IMPORTED_MODULE_13__views_DropdownsView_vue___default.a },
    { path: '/components/forms', component: __WEBPACK_IMPORTED_MODULE_16__views_FormsView_vue___default.a },
    { path: '/components/lists', component: __WEBPACK_IMPORTED_MODULE_18__views_ListsView_vue___default.a },
    { path: '/components/modals', component: __WEBPACK_IMPORTED_MODULE_19__views_ModalsView_vue___default.a },
    { path: '/components/navbar', component: __WEBPACK_IMPORTED_MODULE_20__views_NavbarView_vue___default.a },
    { path: '/components/pagination', component: __WEBPACK_IMPORTED_MODULE_22__views_PaginationView_vue___default.a },
    { path: '/components/parallax', component: __WEBPACK_IMPORTED_MODULE_21__views_ParallaxView_vue___default.a },
    { path: '/components/progress', component: __WEBPACK_IMPORTED_MODULE_23__views_ProgressView_vue___default.a },
    { path: '/components/sidebar', component: __WEBPACK_IMPORTED_MODULE_25__views_SidebarView_vue___default.a },
    { path: '/components/slider', component: __WEBPACK_IMPORTED_MODULE_24__views_SliderView_vue___default.a },
    { path: '/components/tabs', component: __WEBPACK_IMPORTED_MODULE_26__views_TabsView_vue___default.a },
    { path: '/functions/toasts', component: __WEBPACK_IMPORTED_MODULE_27__views_ToastsView_vue___default.a },
    { path: '/directives/badges', component: __WEBPACK_IMPORTED_MODULE_6__views_BadgesView_vue___default.a },
    { path: '/directives/tooltips', component: __WEBPACK_IMPORTED_MODULE_28__views_TooltipsView_vue___default.a },
    { path: '/layouts', component: __WEBPACK_IMPORTED_MODULE_17__views_LayoutsView_vue___default.a },
    { path: '/css/typography', component: __WEBPACK_IMPORTED_MODULE_29__views_TypographyView_vue___default.a },
    { path: '/css/grid', component: __WEBPACK_IMPORTED_MODULE_14__views_GridView_vue___default.a },
    { path: '/css/colors', component: __WEBPACK_IMPORTED_MODULE_12__views_ColorsView_vue___default.a },
    { path: '/faq', component: __WEBPACK_IMPORTED_MODULE_15__views_FaqView_vue___default.a },
    { path: '*', redirect: '/' }
  ]
});
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex__ = __webpack_require__(131);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuex___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vuex__);



__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vuex___default.a)

/* harmony default export */ exports["a"] = new __WEBPACK_IMPORTED_MODULE_1_vuex___default.a.Store({
  state: {},

  actions: {},

  mutations: {}
});

/***/ },
/* 44 */
/***/ function(module, exports) {

module.exports = function(hljs) {
  var IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var KEYWORDS = {
    keyword:
      'in of if for while finally var new function do return void else break catch ' +
      'instanceof with throw case default try this switch continue typeof delete ' +
      'let yield const export super debugger as async await static ' +
      // ECMAScript 6 modules import
      'import from as'
    ,
    literal:
      'true false null undefined NaN Infinity',
    built_in:
      'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
      'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
      'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
      'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
      'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
      'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
      'module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect ' +
      'Promise'
  };
  var EXPRESSIONS;
  var NUMBER = {
    className: 'number',
    variants: [
      { begin: '\\b(0[bB][01]+)' },
      { begin: '\\b(0[oO][0-7]+)' },
      { begin: hljs.C_NUMBER_RE }
    ],
    relevance: 0
  };
  var SUBST = {
    className: 'subst',
    begin: '\\$\\{', end: '\\}',
    keywords: KEYWORDS,
    contains: []  // defined later
  };
  var TEMPLATE_STRING = {
    className: 'string',
    begin: '`', end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  SUBST.contains = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    TEMPLATE_STRING,
    NUMBER,
    hljs.REGEXP_MODE
  ]
  var PARAMS_CONTAINS = SUBST.contains.concat([
    hljs.C_BLOCK_COMMENT_MODE,
    hljs.C_LINE_COMMENT_MODE
  ]);

  return {
    aliases: ['js', 'jsx'],
    keywords: KEYWORDS,
    contains: [
      {
        className: 'meta',
        relevance: 10,
        begin: /^\s*['"]use (strict|asm)['"]/
      },
      {
        className: 'meta',
        begin: /^#!/, end: /$/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      TEMPLATE_STRING,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      NUMBER,
      { // object attr container
        begin: /[{,]\s*/, relevance: 0,
        contains: [
          {
            begin: IDENT_RE + '\\s*:', returnBegin: true,
            relevance: 0,
            contains: [{className: 'attr', begin: IDENT_RE, relevance: 0}]
          }
        ]
      },
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.REGEXP_MODE,
          {
            className: 'function',
            begin: '(\\(.*?\\)|' + IDENT_RE + ')\\s*=>', returnBegin: true,
            end: '\\s*=>',
            contains: [
              {
                className: 'params',
                variants: [
                  {
                    begin: IDENT_RE
                  },
                  {
                    begin: /\(\s*\)/,
                  },
                  {
                    begin: /\(/, end: /\)/,
                    excludeBegin: true, excludeEnd: true,
                    keywords: KEYWORDS,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          { // E4X / JSX
            begin: /</, end: /(\/\w+|\w+\/)>/,
            subLanguage: 'xml',
            contains: [
              {begin: /<\w+\s*\/>/, skip: true},
              {
                begin: /<\w+/, end: /(\/\w+|\w+\/)>/, skip: true,
                contains: [
                  {begin: /<\w+\s*\/>/, skip: true},
                  'self'
                ]
              }
            ]
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: IDENT_RE}),
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            contains: PARAMS_CONTAINS
          }
        ],
        illegal: /\[|%/
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      },
      hljs.METHOD_GUARD,
      { // ES6 class
        className: 'class',
        beginKeywords: 'class', end: /[{;=]/, excludeEnd: true,
        illegal: /[:"\[\]]/,
        contains: [
          {beginKeywords: 'extends'},
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        beginKeywords: 'constructor', end: /\{/, excludeEnd: true
      }
    ],
    illegal: /#(?!!)/
  };
};

/***/ },
/* 45 */
/***/ function(module, exports) {

module.exports = function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var VARIABLE = {
    className: 'variable',
    begin: '(\\$' + IDENT_RE + ')\\b'
  };
  var HEXCOLOR = {
    className: 'number', begin: '#[0-9A-Fa-f]+'
  };
  var DEF_INTERNALS = {
    className: 'attribute',
    begin: '[A-Z\\_\\.\\-]+', end: ':',
    excludeEnd: true,
    illegal: '[^\\s]',
    starts: {
      endsWithParent: true, excludeEnd: true,
      contains: [
        HEXCOLOR,
        hljs.CSS_NUMBER_MODE,
        hljs.QUOTE_STRING_MODE,
        hljs.APOS_STRING_MODE,
        hljs.C_BLOCK_COMMENT_MODE,
        {
          className: 'meta', begin: '!important'
        }
      ]
    }
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'selector-id', begin: '\\#[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'selector-class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'selector-attr', begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'selector-tag', // begin: IDENT_RE, end: '[,|\\s]'
        begin: '\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b',
        relevance: 0
      },
      {
        begin: ':(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)'
      },
      {
        begin: '::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)'
      },
      VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b',
        illegal: '[^\\s]'
      },
      {
        begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b'
      },
      {
        begin: ':', end: ';',
        contains: [
          VARIABLE,
          HEXCOLOR,
          hljs.CSS_NUMBER_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            className: 'meta', begin: '!important'
          }
        ]
      },
      {
        begin: '@', end: '[{;]',
        keywords: 'mixin include extend for if else each while charset import debug media page content font-face namespace warn',
        contains: [
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          HEXCOLOR,
          hljs.CSS_NUMBER_MODE,
          {
            begin: '\\s[A-Za-z0-9_.-]+',
            relevance: 0
          }
        ]
      }
    ]
  };
};

/***/ },
/* 46 */
/***/ function(module, exports) {

module.exports = function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: 'string',
            endsParent: true,
            variants: [
              {begin: /"/, end: /"/},
              {begin: /'/, end: /'/},
              {begin: /[^\s"'=<>`]+/}
            ]
          }
        ]
      }
    ]
  };
  return {
    aliases: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'],
    case_insensitive: true,
    contains: [
      {
        className: 'meta',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      hljs.COMMENT(
        '<!--',
        '-->',
        {
          relevance: 10
        }
      ),
      {
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        begin: /<\?(php)?/, end: /\?>/,
        subLanguage: 'php',
        contains: [{begin: '/\\*', end: '\\*/', skip: true}]
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {name: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: ['css', 'xml']
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {name: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '\<\/script\>', returnEnd: true,
          subLanguage: ['actionscript', 'javascript', 'handlebars', 'xml']
        }
      },
      {
        className: 'meta',
        variants: [
          {begin: /<\?xml/, end: /\?>/, relevance: 10},
          {begin: /<\?\w+/, end: /\?>/}
        ]
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'name', begin: /[^\/><\s]+/, relevance: 0
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(3)

/* template */
var __vue_template__ = __webpack_require__(114)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(4)

/* template */
var __vue_template__ = __webpack_require__(111)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* template */
var __vue_template__ = __webpack_require__(120)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(5)

/* template */
var __vue_template__ = __webpack_require__(91)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(6)

/* template */
var __vue_template__ = __webpack_require__(108)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(7)

/* template */
var __vue_template__ = __webpack_require__(121)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* template */
var __vue_template__ = __webpack_require__(118)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(8)

/* template */
var __vue_template__ = __webpack_require__(95)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(9)

/* template */
var __vue_template__ = __webpack_require__(105)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(10)

/* template */
var __vue_template__ = __webpack_require__(127)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(11)

/* template */
var __vue_template__ = __webpack_require__(99)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* template */
var __vue_template__ = __webpack_require__(96)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(12)

/* template */
var __vue_template__ = __webpack_require__(94)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(13)

/* template */
var __vue_template__ = __webpack_require__(101)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(14)

/* template */
var __vue_template__ = __webpack_require__(109)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(15)

/* template */
var __vue_template__ = __webpack_require__(106)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-32aec740"

module.exports = __vue_exports__


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(16)

/* template */
var __vue_template__ = __webpack_require__(123)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(17)

/* template */
var __vue_template__ = __webpack_require__(100)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-21f936ea"

module.exports = __vue_exports__


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(18)

/* template */
var __vue_template__ = __webpack_require__(104)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(19)

/* template */
var __vue_template__ = __webpack_require__(112)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(20)

/* template */
var __vue_template__ = __webpack_require__(103)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(21)

/* template */
var __vue_template__ = __webpack_require__(119)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(22)

/* template */
var __vue_template__ = __webpack_require__(98)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-1fcc3b4c"

module.exports = __vue_exports__


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(23)

/* template */
var __vue_template__ = __webpack_require__(97)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(24)

/* template */
var __vue_template__ = __webpack_require__(125)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-90cceb0e"

module.exports = __vue_exports__


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(25)

/* template */
var __vue_template__ = __webpack_require__(122)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(26)

/* template */
var __vue_template__ = __webpack_require__(128)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(27)

/* template */
var __vue_template__ = __webpack_require__(115)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(28)

/* template */
var __vue_template__ = __webpack_require__(102)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(29)

/* template */
var __vue_template__ = __webpack_require__(90)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(30)

/* template */
var __vue_template__ = __webpack_require__(124)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(31)

/* template */
var __vue_template__ = __webpack_require__(93)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(32)

/* template */
var __vue_template__ = __webpack_require__(92)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-10e7c3e7"

module.exports = __vue_exports__


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(33)

/* template */
var __vue_template__ = __webpack_require__(113)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(34)

/* template */
var __vue_template__ = __webpack_require__(116)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(35)

/* template */
var __vue_template__ = __webpack_require__(117)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(36)

/* template */
var __vue_template__ = __webpack_require__(107)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* script */
__vue_exports__ = __webpack_require__(37)

/* template */
var __vue_template__ = __webpack_require__(88)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(38)

/* template */
var __vue_template__ = __webpack_require__(110)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-5362613c"

module.exports = __vue_exports__


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(39)

/* template */
var __vue_template__ = __webpack_require__(89)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-050d7e20"

module.exports = __vue_exports__


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = {}

/* styles */

/* script */
__vue_exports__ = __webpack_require__(40)

/* template */
var __vue_template__ = __webpack_require__(126)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}

__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 88 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Default"
    }
  }, [_vm._h('v-tabs', {
    attrs: {
      "id": "tabs"
    }
  }, [_vm._h('v-tabs-tabs', [_vm._h('v-tab', {
    attrs: {
      "href": "tab1",
      "selected": "selected"
    }
  }, ["Tab 1"]), _vm._h('v-tab', {
    attrs: {
      "href": "tab2"
    }
  }, ["Tab 2"]), _vm._h('v-tab', {
    attrs: {
      "href": "tab3"
    }
  }, ["Tab 3"]), _vm._h('v-tab', {
    attrs: {
      "href": "tab4"
    }
  }, ["Tab 4"])]), _vm._h('v-tabs-items', [_vm._h('v-tabs-item', {
    attrs: {
      "id": "tab1"
    }
  }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."]), _vm._h('v-tabs-item', {
    attrs: {
      "id": "tab2"
    }
  }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."]), _vm._h('v-tabs-item', {
    attrs: {
      "id": "tab3"
    }
  }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."]), _vm._h('v-tabs-item', {
    attrs: {
      "id": "tab4"
    }
  }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."])])])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    },
    slot: "markup"
  }, ["<v-tabs id=\"tabs\">\n  <v-tabs-container>\n    <v-tab href=\"tab1\" selected>\n      ...\n    </v-tab>\n  </v-tabs-container>\n  <v-tabs-content-container>\n    <v-tab-content id=\"tab1\">\n      ...\n    </v-tab-content>\n  </v-tabs-content>\n</v-tabs>"])])
},staticRenderFns: []}

/***/ },
/* 89 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', [_vm._h('v-btn', {
    directives: [{
      name: "tooltip",
      rawName: "v-tooltip:top",
      value: ({
        html: 'Top tooptip'
      }),
      expression: "{ html: 'Top tooptip' }",
      arg: "top"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Top"]), _vm._h('v-btn', {
    directives: [{
      name: "tooltip",
      rawName: "v-tooltip:right",
      value: ({
        html: 'Right tooptip'
      }),
      expression: "{ html: 'Right tooptip' }",
      arg: "right"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Right"]), _vm._h('v-btn', {
    directives: [{
      name: "tooltip",
      rawName: "v-tooltip:bottom",
      value: ({
        html: 'Bottom tooptip'
      }),
      expression: "{ html: 'Bottom tooptip' }",
      arg: "bottom"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Bottom"]), _vm._h('v-btn', {
    directives: [{
      name: "tooltip",
      rawName: "v-tooltip:left",
      value: ({
        html: 'Left Tooltip'
      }),
      expression: "{ html: 'Left Tooltip' }",
      arg: "left"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Left"])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    },
    slot: "markup"
  }, ["<v-btn primary v-tooltip:top=\"{ html: 'Top Tooltip' }\">...</v-btn>\n \n<v-btn primary v-tooltip:right=\"{ html: 'Right Tooltip' }\">...</v-btn>\n \n<v-btn primary v-tooltip:bottom=\"{ html: 'Bottom Tooltip' }\">...</v-btn>\n \n<v-btn primary v-tooltip:left=\"{ html: 'Left Tooltip' }\">...</v-btn>"])])
},staticRenderFns: []}

/***/ },
/* 90 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "navbar"
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Variants"
    }
  }, [_vm._h('v-navbar', {
    staticClass: "green"
  }, [_vm._h('v-navbar-logo', {
    staticClass: "hidden-sm-and-down"
  }, ["Navbar"]), _vm._h('v-navbar-items', {
    attrs: {
      "items": _vm.items
    }
  })]), _vm._h('v-navbar', {
    staticClass: "orange"
  }, [_vm._h('v-spacer'), _vm._h('v-navbar-logo', {
    staticClass: "hidden-sm-and-down"
  }, ["Navbar"]), _vm._h('v-navbar-items', {
    attrs: {
      "items": _vm.items
    }
  })]), _vm._h('v-navbar', {
    staticClass: "red"
  }, [_vm._h('v-navbar-items', {
    attrs: {
      "items": _vm.items
    }
  }), _vm._h('v-navbar-logo', {
    staticClass: "hidden-sm-and-down"
  }, [_vm._h('v-spacer'), "Navbar"])])]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-navbar class=\"green\">\n  <v-navbar-logo>Navbar</v-navbar>\n  <v-navbar-items v-bind:items=\"items\"></v-navbar-items>\n</v-navbar>\n \n<v-navbar class=\"yellow\">\n  <v-spacer></v-spacer>\n  <v-navbar-logo>Navbar</v-navbar>\n  <v-navbar-items v-bind:items=\"items\"></v-navbar-items>\n</v-navbar>\n \n<v-navbar class=\"red\">\n  <v-navbar-items v-bind:items=\"items\"></v-navbar-items>\n  <v-navbar-logo>\n    <v-spacer></v-spacer>\n    Navbar\n  </v-navbar>\n</v-navbar>"]), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["data () {\n  return {\n    items: [\n      { text: 'Link', href: '#!' }\n    ]\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 91 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('table', {
    staticClass: "table--component"
  }, [_vm._m(0), _vm._h('tbody', [_vm._l((_vm.params), function(option) {
    return _vm._h('tr', [_vm._l((option), function(td) {
      return _vm._h('td', {
        domProps: {
          "innerHTML": _vm._s(td)
        }
      })
    })])
  })])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('thead', [_vm._h('tr', [_vm._h('th', ["Option"]), _vm._h('th', ["Effect"]), _vm._h('th', ["Remarks"])])])
}]}

/***/ },
/* 92 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('v-parallax', {
    attrs: {
      "src": "https://s-media-cache-ak0.pinimg.com/originals/e1/00/ef/e100ef3699fa021506561d41e392a148.jpg"
    }
  }), _vm._h('markup', {
    slot: "markup"
  }, ["<v-parallax src=\"...\"></v-parallax>"])])
},staticRenderFns: []}

/***/ },
/* 93 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Short"
    }
  }, [_vm._h('v-pagination', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.page),
      expression: "page"
    }],
    attrs: {
      "length": 5
    },
    domProps: {
      "value": (_vm.page)
    },
    on: {
      "input": function($event) {
        _vm.page = $event
      }
    }
  })]), _vm._h('component-example', {
    attrs: {
      "header": "Long"
    }
  }, [_vm._h('v-pagination', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.page2),
      expression: "page2"
    }],
    attrs: {
      "length": 15
    },
    domProps: {
      "value": (_vm.page2)
    },
    on: {
      "input": function($event) {
        _vm.page2 = $event
      }
    }
  })]), _vm._h('component-example', {
    attrs: {
      "header": "Round"
    }
  }, [_vm._h('v-pagination', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.page3),
      expression: "page3"
    }],
    attrs: {
      "length": 4,
      "circle": "circle"
    },
    domProps: {
      "value": (_vm.page3)
    },
    on: {
      "input": function($event) {
        _vm.page3 = $event
      }
    }
  })]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', ["<v-pagination v-bind:length=\"length\" v-model=\"page\"></v-pagination>"]), _vm._h('markup', ["data () {\n  return {\n    length: 5,\n    page: 1\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 94 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "whats-next"
  }, [_vm._h('h2', {
    staticClass: "section-header primary--after"
  }, ["What's Next", _vm._h('v-icon', {
    staticClass: "primary--text",
    attrs: {
      "x-large": "x-large"
    }
  }, ["help_outline"])]), _vm._h('v-alert', {
    attrs: {
      "info": "info"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm8": "sm8"
    }
  }, [_vm._t("default")]), _vm._h('v-col', {
    staticClass: "text-sm-right text-xs-center",
    attrs: {
      "xs12": "xs12",
      "sm4": "sm4"
    }
  }, [_vm._h('v-btn', {
    nativeOn: {
      "click": function($event) {
        _vm.$router.push(_vm.route)
      }
    }
  }, [_vm._s(_vm.text), _vm._h('v-icon', {
    attrs: {
      "right": "right"
    }
  }, ["chevron_right"])])])])])])])
},staticRenderFns: []}

/***/ },
/* 95 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('header', [_vm._h('v-navbar', [_vm._h('div', {
    staticClass: "navbar__side-icon hidden-md-and-up"
  }, [_vm._h('a', {
    directives: [{
      name: "side-bar",
      rawName: "v-side-bar:mainsidebar",
      arg: "mainsidebar"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', ["reorder"])])]), _vm._h('div', {
    staticClass: "navbar__side-title"
  }, [_vm._h('h1', {
    staticClass: "text-xs-center text-md-left",
    domProps: {
      "textContent": _vm._s(_vm.title)
    }
  }), _vm._h('span', {
    staticClass: "hidden-md-and-down",
    domProps: {
      "innerHTML": _vm._s(_vm.subTitle)
    }
  })])])])
},staticRenderFns: []}

/***/ },
/* 96 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('dl', {
    staticClass: "section-text"
  }, [_vm._t("title"), _vm._t("desc")])
},staticRenderFns: []}

/***/ },
/* 97 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "doc"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('dt', {
    slot: "title"
  }, ["FAQ"]), _vm._h('dd', {
    slot: "desc"
  }, ["Soon"])])])])
},staticRenderFns: []}

/***/ },
/* 98 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "On Click"
    }
  }, [_vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:dropdown",
      arg: "dropdown"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Click Dropdown"]), _vm._h('v-dropdown', {
    attrs: {
      "id": "dropdown",
      "items": _vm.items
    }
  }), _vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:dropdown3",
      arg: "dropdown3"
    }],
    attrs: {
      "secondary": "secondary"
    }
  }, ["Click With Labels"]), _vm._h('v-dropdown', {
    attrs: {
      "id": "dropdown3"
    }
  }, [_vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, ["Profile", _vm._h('v-chip', {
    staticClass: "teal white--text right",
    attrs: {
      "label": "label",
      "small": "small"
    }
  }, ["new"])])]), _vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('span', {
    directives: [{
      name: "badge",
      rawName: "v-badge:2",
      arg: "2"
    }]
  }, ["Notifications"])])]), _vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, ["Logout", _vm._h('v-icon', {
    staticClass: "secondary--text right"
  }, ["cloud_off"])])])])]), _vm._h('component-example', {
    attrs: {
      "header": "On Hover"
    }
  }, [_vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:dropdown2",
      arg: "dropdown2"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Hover Dropdown"]), _vm._h('v-dropdown', {
    attrs: {
      "id": "dropdown2",
      "items": _vm.items,
      "right": "right",
      "hover": "hover"
    }
  }), _vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:dropdown4",
      arg: "dropdown4"
    }],
    attrs: {
      "secondary": "secondary"
    }
  }, ["Hover With Labels"]), _vm._h('v-dropdown', {
    attrs: {
      "id": "dropdown4",
      "hover": "hover"
    }
  }, [_vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, ["Profile", _vm._h('v-chip', {
    staticClass: "teal white--text right",
    attrs: {
      "label": "label",
      "small": "small"
    }
  }, ["new"])])]), _vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('span', {
    directives: [{
      name: "badge",
      rawName: "v-badge:2",
      arg: "2"
    }]
  }, ["Notifications"])])]), _vm._h('li', [_vm._h('a', {
    staticClass: "dropdown__item",
    attrs: {
      "href": "#!"
    }
  }, ["Logout", _vm._h('v-icon', {
    staticClass: "secondary--text right"
  }, ["cloud_off"])])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Menus"
    }
  }, [_vm._h('v-card', [_vm._h('v-card-title', {
    staticClass: "blue"
  }, [_vm._h('v-card-title-text', [_vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:menu",
      arg: "menu"
    }],
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', {
    staticClass: "white--text"
  }, ["more_vert"])]), _vm._h('v-dropdown', {
    attrs: {
      "id": "menu",
      "items": _vm.items
    }
  })])]), _vm._h('v-card-text', ["Lorem Ipsum"])]), _vm._h('v-card', [_vm._h('v-card-title', {
    staticClass: "blue"
  }, [_vm._h('v-col-spacer'), _vm._h('v-card-title-actions', [_vm._h('v-btn', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:menu2",
      arg: "menu2"
    }],
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', {
    staticClass: "white--text"
  }, ["more_vert"])]), _vm._h('v-dropdown', {
    attrs: {
      "id": "menu2",
      "items": _vm.items,
      "right": "right"
    }
  })])]), _vm._h('v-card-text', ["Lorem Ipsum"])])]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', ["<v-btn v-dropdown:dropdown=\"options\">\n  ...\n</v-btn>\n<v-dropdown id=\"dropdown\" v-bind:items=\"items\"></v-dropdown>"]), _vm._h('markup', ["data () {\n  return {\n    options: { hover: true },\n    items: [{ text: 'Link', href: '#!' }]\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 99 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h2', {
    staticClass: "section-header secondary--text primary--after",
    style: (_vm.styles)
  }, [_vm._t("default"), _vm._h('v-icon', {
    staticClass: "primary--text",
    attrs: {
      "x-large": "x-large"
    }
  }, ["short_text"])])
},staticRenderFns: []}

/***/ },
/* 100 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Default"
    }
  }, [_vm._h('v-btn', {
    attrs: {
      "small": "small"
    }
  }, ["Small"]), _vm._h('v-btn', ["Normal"]), _vm._h('v-btn', {
    attrs: {
      "large": "large"
    }
  }, ["Large"]), _vm._h('v-btn', {
    attrs: {
      "flat": "flat"
    }
  }, ["Flat"]), _vm._h('v-btn', {
    attrs: {
      "flat": "flat",
      "disabled": "disabled"
    }
  }, ["Disabled"]), _vm._h('v-btn', {
    attrs: {
      "disabled": "disabled"
    }
  }, ["Disabled"])]), _vm._h('component-example', {
    attrs: {
      "header": "Colored"
    }
  }, [_vm._h('v-btn', {
    staticClass: "primary white--text"
  }, ["Primary"]), _vm._h('v-btn', {
    staticClass: "primary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Primary"]), _vm._h('v-btn', {
    staticClass: "secondary white--text"
  }, ["Secondary"]), _vm._h('v-btn', {
    staticClass: "secondary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Secondary"])]), _vm._h('component-example', {
    attrs: {
      "header": "Block"
    }
  }, [_vm._h('div', {
    staticClass: "btn--block-example"
  }, [_vm._h('v-btn', {
    attrs: {
      "block": "block"
    }
  }, ["Default"]), _vm._h('v-btn', {
    staticClass: "primary white--text",
    attrs: {
      "block": "block"
    }
  }, ["Primary"]), _vm._h('v-btn', {
    staticClass: "secondary white--text",
    attrs: {
      "block": "block"
    }
  }, ["Secondary"]), _vm._h('v-btn', {
    attrs: {
      "block": "block",
      "disabled": "disabled"
    }
  }, ["Disabled"])])]), _vm._h('component-example', {
    attrs: {
      "header": "Rounded"
    }
  }, [_vm._h('v-btn', {
    attrs: {
      "round": "round"
    }
  }, ["Default"]), _vm._h('v-btn', {
    staticClass: "primary white--text",
    attrs: {
      "round": "round"
    }
  }, ["Primary"]), _vm._h('v-btn', {
    staticClass: "secondary white--text",
    attrs: {
      "round": "round"
    }
  }, ["Large Secondary"]), _vm._h('v-btn', {
    attrs: {
      "round": "round",
      "disabled": "disabled"
    }
  }, ["Disabled"])]), _vm._h('component-example', {
    attrs: {
      "header": "Outline"
    }
  }, [_vm._h('v-btn', {
    attrs: {
      "outline": "outline"
    }
  }, ["Default"]), _vm._h('v-btn', {
    staticClass: "primary primary--text",
    attrs: {
      "outline": "outline"
    }
  }, ["Primary"]), _vm._h('v-btn', {
    staticClass: "secondary secondary--text",
    attrs: {
      "outline": "outline"
    }
  }, ["Secondary"]), _vm._h('v-btn', {
    attrs: {
      "outline": "outline",
      "disabled": "disabled"
    }
  }, ["Disabled"])]), _vm._h('component-example', {
    attrs: {
      "header": "Floating"
    }
  }, [_vm._h('v-btn', {
    attrs: {
      "small": "small",
      "floating": "floating"
    }
  }, [_vm._h('v-icon', ["event"])]), _vm._h('v-btn', {
    attrs: {
      "floating": "floating"
    }
  }, [_vm._h('v-icon', ["add"])]), _vm._h('v-btn', {
    attrs: {
      "floating": "floating",
      "large": "large"
    }
  }, [_vm._h('v-icon', ["edit"])]), _vm._h('v-btn', {
    attrs: {
      "floating": "floating",
      "disabled": "disabled"
    }
  }, [_vm._h('v-icon', ["remove"])])]), _vm._h('component-example', {
    attrs: {
      "header": "Colored Floating"
    }
  }, [_vm._h('v-btn', {
    staticClass: "purple white--text",
    attrs: {
      "floating": "floating",
      "small": "small"
    }
  }, [_vm._h('v-icon', ["cloud"])]), _vm._h('v-btn', {
    staticClass: "primary white--text",
    attrs: {
      "floating": "floating"
    }
  }, [_vm._h('v-icon', ["attachment"])]), _vm._h('v-btn', {
    staticClass: "secondary white--text",
    attrs: {
      "floating": "floating",
      "large": "large"
    }
  }, [_vm._h('v-icon', ["event"])]), _vm._h('v-btn', {
    attrs: {
      "floating": "floating",
      "large": "large",
      "disabled": "disabled"
    }
  }, [_vm._h('v-icon', ["room"])])]), _vm._h('component-example', {
    attrs: {
      "header": "Icon"
    }
  }, [_vm._h('v-btn', {
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["hearing"])]), _vm._h('v-btn', {
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["computer"])]), _vm._h('v-btn', {
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["headset"])])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-btn>\n  ...\n</v-btn>\n \n<v-btn flat>\n  ...\n</v-btn>\n \n<v-btn primary>\n  ...\n</v-btn>\n \n<v-btn block>\n  ...\n</v-btn>\n \n<v-btn outline>\n  ...\n</v-btn>\n \n<v-btn floating>\n  ...\n</v-btn>\n \n<v-btn icon>\n  <v-icon>profile</v-icon>\n</v-btn>\n \n<v-btn floating icon large>\n  <v-icon>edit</v-icon>\n</v-btn>"])])
},staticRenderFns: []}

/***/ },
/* 101 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "view"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('strong', {
    slot: "title"
  }, ["About"]), _vm._h('div', {
    slot: "desc"
  }, [_vm._h('p', ["Vuetify is a collection of components for VueJS 2.0. It aims to provide clean, reusable and semantic components that help kick start your application. Vuetify utilizes Google's ", _vm._h('strong', ["Material Design"]), " design pattern, taking cues from other popular frameworks such as ", _vm._h('a', {
    attrs: {
      "href": "http://materializecss.com/",
      "target": "_blank"
    }
  }, ["Materialize.css"]), ", ", _vm._h('a', {
    attrs: {
      "href": "https://getmdl.io/",
      "target": "_blank"
    }
  }, ["Material Design Lite"]), ", ", _vm._h('a', {
    attrs: {
      "href": "http://semantic-ui.com/",
      "target": "_blank"
    }
  }, ["Semantic UI"]), " and ", _vm._h('a', {
    attrs: {
      "href": "https://v4-alpha.getbootstrap.com/",
      "target": "_blank"
    }
  }, ["Bootstrap 4"]), "."])])])]), _vm._h('section', [_vm._h('section-header', ["Features"]), _vm._h('v-container', {
    staticClass: "container--fluid"
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["widgets"]), _vm._h('v-list-item-title', ["Vuetify Frontend Components", _vm._h('v-list-item-sub-title', ["The Vuetify core is designed to provide a variety of reusable, plug and play components that fit any project spec."])])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["extension"]), _vm._h('v-list-item-title', ["Semantic Helper Components", _vm._h('v-list-item-sub-title', ["Utilizing the power of Vue's functional components, all class based markup that is used to aid main components, such as a ", _vm._h('em', ["card title"]), ", are accessible using ", _vm._h('code', ["v-card-title"]), " markup, enabling less cluttered files for a miniscule performance cost."])])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["view_quilt"]), _vm._h('v-list-item-title', ["Prototyping Made Easy", _vm._h('v-list-item-sub-title', ["Vuetify was made from the ground up with prototyping in mind. Every component, directive and function all work seemlessly together, allowing you to focus on building your application. With the core philosophy of write less, do more, getting your project off the ground has never been easier."])])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["phone_android"]), _vm._h('v-list-item-title', ["No Sacrifice Mobile Functionality", _vm._h('v-list-item-sub-title', ["Every component and style is designed with mobile in mind. Applications easily transfer from different orientations and screen sizes. From desktop, to tablet or phone, Vuetify just works."])])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["call_split"]), _vm._h('v-list-item-title', ["Separation of Concerns", _vm._h('v-list-item-sub-title', ["Vuetify is built on top of Stylus. This allows you to easily mold the styles of your application. With no component specific styles in the component, your application is smaller, easier to change, and easier to build upon."])])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "primary",
    attrs: {
      "x-large": "x-large"
    }
  }, ["open_in_browser"]), _vm._h('v-list-item-title', ["Built With Server Side Rendering", _vm._h('v-list-item-sub-title', ["Vuetify was built on top of server side renderering. Using an internal bus, all components communicate with each other without the need for registering DOM events."])])])])])])])]), _vm._h('section', [_vm._h('section-header', ["Ecosystem"]), _vm._h('div', {
    staticClass: "section-text"
  }, ["Vuetify also comes with a subset of packages to help expedite the prototyping process, add additional functionality and additional components."]), _vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-icon', ["color_lens"]), _vm._h('v-list-item-title', ["Material Design Color Pack"])]), _vm._h('v-list-item', [_vm._h('v-list-item-icon', ["play_arrow"]), _vm._h('v-list-item-title', ["Vue CLI Templates including SSR"])]), _vm._h('v-list-item', [_vm._h('v-list-item-icon', ["security"]), _vm._h('v-list-item-title', [_vm._h('span', ["Vuetify Admin Components ", _vm._h('v-chip', {
    staticClass: "green white--text",
    attrs: {
      "label": ""
    }
  }, ["Coming Soon"])])])])]), _vm._h('whats-next', {
    attrs: {
      "route": "/quick-start",
      "text": "Quick Start"
    }
  }, ["Select from 4 premade Vuetify vue-cli templates. These are based off of the official releases, pre-configured for the ", _vm._h('strong', ["vuetify"]), " package."])])])
},staticRenderFns: []}

/***/ },
/* 102 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "modals"
    }
  }, [_vm._h('component-example', [_vm._h('v-btn', {
    directives: [{
      name: "modal",
      rawName: "v-modal:modal",
      arg: "modal"
    }],
    attrs: {
      "primary": "primary"
    }
  }, ["Regular"]), _vm._h('v-modal', {
    attrs: {
      "id": "modal"
    }
  }, [_vm._h('v-card', [_vm._h('v-card-text', [_vm._h('p', {
    staticClass: "text-xs-center"
  }, ["What is your age?"]), _vm._h('v-select', {
    attrs: {
      "options": [{
        text: '10-19',
        value: 1
      }, {
        text: '20+',
        value: 2
      }],
      "label": "What is your age?"
    }
  }), _vm._h('p', ["This information is used to improve your experience on our site."])]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    nativeOn: {
      "click": function($event) {
        $event.stopPropagation();
        _vm.$vuetify.bus.pub('modal:close:modal', true)
      }
    }
  }, ["Cancel"]), _vm._h('v-col-spacer'), _vm._h('v-btn', {
    staticClass: "green white--text",
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.$vuetify.bus.pub('modal:close:modal', true)
      }
    }
  }, ["Submit"])])])]), _vm._h('v-btn', {
    directives: [{
      name: "modal",
      rawName: "v-modal:modal2",
      arg: "modal2"
    }],
    attrs: {
      "secondary": "secondary"
    }
  }, ["Bottom"]), _vm._h('v-modal', {
    attrs: {
      "id": "modal2",
      "bottom": "bottom"
    }
  }, [_vm._h('v-card', {
    staticClass: "secondary white--text"
  }, [_vm._h('v-card-actions', [_vm._h('div', ["This is an example of a bottom modal."]), _vm._h('v-col-spacer'), _vm._h('v-btn', {
    staticClass: "primary white--text",
    nativeOn: {
      "click": function($event) {
        $event.preventDefault();
        _vm.$vuetify.bus.pub('modal:close:modal2', true)
      }
    }
  }, ["Close"])])])])])])
},staticRenderFns: []}

/***/ },
/* 103 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Accordion"
    }
  }, [_vm._h('div', [_vm._h('v-collapsible', [_vm._l((5), function(item) {
    return _vm._h('li', [_vm._h('v-collapsible-header', ["Item"]), _vm._h('v-collapsible-body', [_vm._h('v-card', [_vm._h('v-card-text', {
      staticClass: "grey lighten-3"
    }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."])])])])
  })])])]), _vm._h('component-example', {
    attrs: {
      "header": "Expandable"
    }
  }, [_vm._h('div', [_vm._h('v-collapsible', {
    attrs: {
      "expand": "expand"
    }
  }, [_vm._l((5), function(item) {
    return _vm._h('li', [_vm._h('v-collapsible-header', ["Item"]), _vm._h('v-collapsible-body', [_vm._h('v-card', [_vm._h('v-card-text', {
      staticClass: "grey lighten-3"
    }, ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."])])])])
  })])])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-collapsible>\n  <v-collapsible-header>Item</v-collapsible-header>\n  <v-collapsible-body>\n    <v-card>\n      <v-card-text class=\"grey lighten-3\">...</v-card-text>\n    </v-card>\n  </v-collapsible-body>\n</v-collapsible>"])])
},staticRenderFns: []}

/***/ },
/* 104 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "cards"
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Basic"
    }
  }, [_vm._h('div', [_vm._h('v-card', [_vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })])])]), _vm._h('div', [_vm._h('v-card', {
    staticClass: "blue darken-1 white--text"
  }, [_vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Title"
    }
  }, [_vm._h('div', [_vm._h('v-card', [_vm._h('v-card-title', {
    staticClass: "red lighten-1"
  }, [_vm._h('v-card-title-text', {
    staticClass: "white--text"
  }, [_vm._h('v-icon', ["chevron_right"]), "Update"]), _vm._h('v-card-title-actions', [_vm._h('v-btn', {
    staticClass: "white--text",
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', {
    nativeOn: {
      "click": function($event) {
        _vm.$vuetify.toast.create('Upload Me!')
      }
    }
  }, ["cloud_upload"])])])]), _vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    attrs: {
      "flat": "flat"
    }
  }, ["Cancel"]), _vm._h('v-col-spacer'), _vm._h('v-btn', {
    staticClass: "green white--text"
  }, ["Submit", _vm._h('v-icon', {
    attrs: {
      "right": "right"
    }
  }, ["fast_forward"])])])])]), _vm._h('div', [_vm._h('v-card', [_vm._h('v-card-title', {
    staticClass: "green lighten-1"
  }, [_vm._h('v-card-title-text', {
    staticClass: "white--text"
  }, ["Title"]), _vm._h('v-card-title-actions', [_vm._h('v-btn', {
    staticClass: "white--text",
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["remove"])]), _vm._h('v-btn', {
    staticClass: "white--text",
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["add"])]), _vm._h('v-btn', {
    staticClass: "white--text",
    attrs: {
      "icon": "icon"
    }
  }, [_vm._h('v-icon', ["edit"])])])]), _vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Picture"
    }
  }, [_vm._h('div', [_vm._h('v-card', [_vm._h('v-card-title', {
    attrs: {
      "img": "http://www.titanui.com/wp-content/uploads/2013/04/03/Vector-Cartoon-Nature-Background-03.jpg",
      "height": "300px"
    }
  }, [_vm._h('v-card-title-text', {
    staticClass: "white--text"
  }, ["Update"])]), _vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    staticClass: "primary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["View Updates"])])])]), _vm._h('div', [_vm._h('v-card', [_vm._h('v-card-title', {
    attrs: {
      "img": "https://s-media-cache-ak0.pinimg.com/564x/e6/f5/27/e6f5279ad0965b9ccdadc3934429d122.jpg",
      "height": "300px"
    }
  }, [_vm._h('v-card-title-text', {
    staticClass: "white--text"
  }, ["Welcome"])]), _vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text)
    }
  })]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    staticClass: "primary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Get Started"])])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Background"
    }
  }, [_vm._h('div', {
    staticClass: "portrait"
  }, [_vm._h('v-card', {
    attrs: {
      "img": "https://cdn.fstoppers.com/styles/full/s3/lead/2014/11/fstoppers-natural-light-dani-how-to-retouch-dof-bokeh-sharp-facebook-female-fashion-nyc-model-portrait1.jpg",
      "height": "300px"
    }
  }, [_vm._h('v-card-actions', {
    staticClass: "white--text"
  }, ["Picture.png"])])]), _vm._h('div', {
    staticClass: "portrait"
  }, [_vm._h('v-card', {
    attrs: {
      "img": "http://images6.fanpop.com/image/photos/38500000/beautiful-wallpaper-1-beautiful-pictures-38538866-500-313.jpg",
      "height": "300px"
    }
  }, [_vm._h('v-card-actions', {
    staticClass: "white--text"
  }, ["Picture.png"])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Horizontal"
    }
  }, [_vm._h('div', [_vm._h('v-card', {
    attrs: {
      "horizontal": "horizontal"
    }
  }, [_vm._h('v-card-title', {
    attrs: {
      "img": "http://www.titanui.com/wp-content/uploads/2013/04/03/Vector-Cartoon-Nature-Background-03.jpg"
    }
  }), _vm._h('v-card-stack', [_vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text.substr(0, 150))
    }
  })]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    staticClass: "primary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Get Started"])])])])]), _vm._h('div', [_vm._h('v-card', {
    attrs: {
      "horizontal": "horizontal"
    }
  }, [_vm._h('v-card-stack', [_vm._h('v-card-text', [_vm._h('div', {
    domProps: {
      "textContent": _vm._s(_vm.card_text.substr(0, 150))
    }
  })]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    staticClass: "secondary--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Get Started"])])]), _vm._h('v-card-title', {
    attrs: {
      "img": "http://photo.facegfx.com/static/vector/2015/12/28/facegfx-vector-cartoon-sea-and-mountain-views-vector-graphics.jpg"
    }
  })])])]), _vm._h('component-example', {
    attrs: {
      "header": "Colored"
    }
  }, [_vm._h('div', {
    staticClass: "event"
  }, [_vm._h('v-card', {
    staticClass: "blue darken-4 white--text"
  }, [_vm._h('v-card-title', {
    attrs: {
      "height": "200px"
    }
  }, [_vm._h('h5', {
    staticClass: "white--text"
  }, ["Featured Event: ", _vm._h('br'), "\nMay 24, 2016 ", _vm._h('br'), "\n7-11pm"])]), _vm._h('v-card-actions', [_vm._h('v-btn', {
    staticClass: "white--text",
    attrs: {
      "flat": "flat"
    }
  }, ["Add to Calendar"]), _vm._h('v-col-spacer'), _vm._h('v-icon', ["event"])])])])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-card class=\"green\">\n  <v-card-text>\n    ...\n  </v-card-text>\n</v-card>\n \n<v-card>\n  <v-card-title img=\"...\" height=\"300px\">\n    <v-card-title-text>...</v-card-title-text>\n  </v-card-title>   \n  <v-card-text>\n     <p>...</p>\n  </v-card-text>\n  <v-card-actions>\n     <v-btn flat class=\"secondary--text\">...</v-btn>\n  </v-card-actions>\n</v-card>\n \n<v-card horizontal>\n  <v-card-title img=\"...\"></v-card-title>\n  <v-card-stack>\n      <v-card-text>\n          <p>...</p>\n      </v-card-text>\n      <v-card-actions>\n          <v-btn flat class=\"secondary--text\">...</v-btn>\n      </v-card-actions>\n  </v-card-stack>\n</v-card>"])])
},staticRenderFns: []}

/***/ },
/* 105 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('v-sidebar', {
    attrs: {
      "id": "mainsidebar",
      "fixed": "fixed",
      "close-on-click": "close-on-click",
      "items": _vm.items
    }
  }, [_vm._h('div', {
    staticClass: "vuetify",
    slot: "top"
  }, [_vm._h('router-link', {
    staticClass: "sidebar__logo",
    attrs: {
      "to": "/welcome"
    }
  }, [_vm._h('span', {
    staticClass: "v"
  }, ["V"]), _vm._h('span', ["uetify"])])])])
},staticRenderFns: []}

/***/ },
/* 106 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Character"
    }
  }, [_vm._h('v-icon', {
    directives: [{
      name: "badge",
      rawName: "v-badge:6.left",
      arg: "6",
      modifiers: {
        "left": true
      }
    }],
    staticClass: "grey--text text--lighten-1",
    attrs: {
      "large": "large"
    }
  }, ["shopping_cart"]), _vm._h('v-icon', {
    directives: [{
      name: "badge",
      rawName: "v-badge",
      value: ({
        value: '!'
      }),
      expression: "{ value: '!' }"
    }],
    staticClass: "grey--text red--after",
    attrs: {
      "large": "large"
    }
  }, ["mail"])]), _vm._h('component-example', {
    attrs: {
      "header": "Icon"
    }
  }, [_vm._h('v-icon', {
    directives: [{
      name: "badge",
      rawName: "v-badge:done.overlap.icon.left",
      arg: "done",
      modifiers: {
        "overlap": true,
        "icon": true,
        "left": true
      }
    }],
    staticClass: "grey--text text--lighten-1",
    attrs: {
      "large": "large"
    }
  }, ["account_circle"]), _vm._h('v-icon', {
    directives: [{
      name: "badge",
      rawName: "v-badge:notifications.icon.overlap",
      arg: "notifications",
      modifiers: {
        "icon": true,
        "overlap": true
      }
    }],
    staticClass: "grey--text text--darken-1 orange--after",
    attrs: {
      "large": "large"
    }
  }, ["account_box"])]), _vm._h('component-example', {
    attrs: {
      "header": "Inline"
    }
  }, [_vm._h('span', {
    directives: [{
      name: "badge",
      rawName: "v-badge:2.left",
      arg: "2",
      modifiers: {
        "left": true
      }
    }]
  }, ["Examples"]), _vm._h('span', {
    directives: [{
      name: "badge",
      rawName: "v-badge:list.icon",
      arg: "list",
      modifiers: {
        "icon": true
      }
    }],
    staticClass: "green--after"
  }, ["Lists"])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    },
    slot: "markup"
  }, ["<v-icon v-badge:done.overlap.icon.left>...</v-icon>\n \n<v-icon v-badge:5.left>...</v-icon>\n \n<v-icon v-badge=\"{ value: '!', overlap: true }\">...</v-icon>\n \n<v-icon v-badge::notifications.icon.overlap>...</v-icon>"])])
},staticRenderFns: []}

/***/ },
/* 107 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('v-slider', [_vm._l((_vm.items), function(item) {
    return _vm._h('v-slider-item', {
      attrs: {
        "src": item.src
      }
    })
  })]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-slider>\n  <v-slider-item v-for=\"item in items\" v-bind:src=\"item.src\"></v-slider-item>\n</v-slider>"]), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["data () {\n  return {\n    items: [{ src: '...'}, { src: '...'}, { src: '...'}]\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 108 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('span', {
    staticClass: "chip--component"
  }, [_vm._h('v-chip', {
    class: _vm.component.classes,
    attrs: {
      "label": "label"
    }
  }, [_vm._s(_vm.component.text), _vm._h('v-icon', {
    attrs: {
      "right": "right"
    },
    domProps: {
      "textContent": _vm._s(_vm.component.icon)
    }
  })])])
},staticRenderFns: []}

/***/ },
/* 109 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "alerts"
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Contextual"
    }
  }, [_vm._h('v-alert', {
    attrs: {
      "success": "success"
    }
  }, ["This is a success alert. " + _vm._s(_vm.lorem)]), _vm._h('v-alert', {
    attrs: {
      "info": "info"
    }
  }, [" This is an info alert " + _vm._s(_vm.lorem)]), _vm._h('v-alert', {
    attrs: {
      "warning": "warning"
    }
  }, [" This is a warning alert " + _vm._s(_vm.lorem)]), _vm._h('v-alert', {
    attrs: {
      "error": "error"
    }
  }, [" This is a error alert " + _vm._s(_vm.lorem)])]), _vm._h('component-example', {
    attrs: {
      "header": "Closable"
    }
  }, [_vm._h('div', [(!_vm.alert) ? _vm._h('div', {
    staticClass: "text-xs-center"
  }, [_vm._h('v-btn', {
    staticClass: "primary white--text",
    nativeOn: {
      "click": function($event) {
        _vm.alert = true
      }
    }
  }, ["Reset Alert"])]) : _vm._e(), _vm._h('v-alert', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.alert),
      expression: "alert"
    }],
    attrs: {
      "success": "success",
      "close": "close"
    },
    domProps: {
      "value": (_vm.alert)
    },
    on: {
      "input": function($event) {
        _vm.alert = $event
      }
    }
  }, ["This is a success alert that is closable. " + _vm._s(_vm.lorem)])])]), _vm._h('markup', {
    slot: "markup"
  }, [_vm._l((_vm.types), function(type) {
    return [" \n<v-alert " + _vm._s(type) + ">\n  ...\n</v-alert>\n "]
  }), " \n<v-alert success close v-model=\"alert\">\n  ...\n</v-alert>"])])
},staticRenderFns: []}

/***/ },
/* 110 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', [_vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.left)
      }
    }
  }, ["Left"]), _vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.right)
      }
    }
  }, ["Right"]), _vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.top)
      }
    }
  }, ["Top"]), _vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.bottom)
      }
    }
  }, ["Bottom"]), _vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.snack)
      }
    }
  }, ["Snack"]), _vm._h('v-btn', {
    attrs: {
      "secondary": "secondary"
    },
    nativeOn: {
      "click": function($event) {
        _vm.toast(_vm.cb)
      }
    }
  }, ["Callback"])]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-btn v-on:click.native=\"toast(info)\">...</v-btn>\n \n<v-btn v-on:click.native=\"toast(cb)\">...</v-btn>"]), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["data () {\n  return {\n    cb: ['Toast with callback', 'right', 4000, () =>('Callback')],\n    info: ['Toast', 'left'],\n  }\n},\nmethods: {\n  toast (data) {\n    this.$vuetify.toast.create(...data)\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 111 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', [_vm._h('component-header', [_vm._s(_vm.header)]), _vm._h('div', {
    staticClass: "component-example"
  }, [_vm._t("default")])])
},staticRenderFns: []}

/***/ },
/* 112 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "chips-view"
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Default"
    }
  }, [_vm._h('v-chip', ["Chip"]), _vm._h('v-chip', {
    attrs: {
      "small": "small"
    }
  }, [_vm._h('v-icon', ["code"])])]), _vm._h('component-example', {
    attrs: {
      "header": "Colored"
    }
  }, [_vm._h('v-chip', {
    staticClass: "primary white--text"
  }, ["Primary"]), _vm._h('v-chip', {
    staticClass: "secondary white--text"
  }, ["Secondary"]), _vm._h('v-chip', {
    staticClass: "red white--text"
  }, ["Colored Chip"]), _vm._h('v-chip', {
    staticClass: "green white--text"
  }, ["Colored Chip"])]), _vm._h('component-example', {
    attrs: {
      "header": "Icon"
    }
  }, [_vm._h('v-chip', [_vm._h('v-icon', {
    attrs: {
      "left": "left"
    }
  }, ["account_circle"]), "Ranee"]), _vm._h('v-chip', {
    staticClass: "orange white--text"
  }, ["Premium", _vm._h('v-icon', {
    attrs: {
      "right": "right"
    }
  }, ["star"])]), _vm._h('v-chip', {
    staticClass: "primary white--text"
  }, ["1 Year", _vm._h('v-icon', {
    attrs: {
      "right": "right"
    }
  }, ["cake"])]), _vm._h('v-chip', {
    staticClass: "green white--text"
  }, [_vm._h('v-icon', ["done_all"])]), _vm._h('v-chip', {
    staticClass: "teal white--text",
    attrs: {
      "close": "close"
    }
  }, [_vm._h('v-icon', {
    attrs: {
      "left": "left"
    }
  }, ["check_circle"]), "Confirmed"])]), _vm._h('component-example', {
    attrs: {
      "header": "Outline"
    }
  }, [_vm._h('v-chip', {
    staticClass: "secondary secondary--text",
    attrs: {
      "outline": "outline"
    }
  }, ["Outline"]), _vm._h('v-chip', {
    staticClass: "primary primary--text",
    attrs: {
      "outline": "outline"
    }
  }, ["Colored"]), _vm._h('v-chip', {
    staticClass: "red red--text",
    attrs: {
      "outline": "outline"
    }
  }, [_vm._h('v-icon', {
    attrs: {
      "left": "left"
    }
  }, ["build"]), "Icon"])]), _vm._h('component-example', {
    attrs: {
      "header": "Label"
    }
  }, [_vm._h('v-chip', {
    attrs: {
      "label": "label"
    }
  }, ["Label"]), _vm._h('v-chip', {
    staticClass: "pink white--text",
    attrs: {
      "label": "label"
    }
  }, [_vm._h('v-icon', {
    attrs: {
      "left": "left"
    }
  }, ["label"]), "Tags"]), _vm._h('v-chip', {
    staticClass: "red red--text",
    attrs: {
      "label": "label",
      "outline": "outline"
    }
  }, ["Outline"])]), _vm._h('component-example', {
    attrs: {
      "header": "Closable"
    }
  }, [(!_vm.chip1 && !_vm.chip2 && !_vm.chip3 && !_vm.chip4) ? _vm._h('div', {
    staticClass: "text-xs-center"
  }, [_vm._h('v-btn', {
    staticClass: "primary white--text",
    nativeOn: {
      "click": function($event) {
        _vm.chip1 = true, _vm.chip2 = true, _vm.chip3 = true, _vm.chip4 = true
      }
    }
  }, ["Reset Chips"])]) : _vm._e(), _vm._h('v-chip', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.chip1),
      expression: "chip1"
    }],
    attrs: {
      "close": "close"
    },
    domProps: {
      "value": (_vm.chip1)
    },
    on: {
      "input": function($event) {
        _vm.chip1 = $event
      }
    }
  }, ["Closable"]), _vm._h('v-chip', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.chip2),
      expression: "chip2"
    }],
    staticClass: "red white--text",
    attrs: {
      "close": "close"
    },
    domProps: {
      "value": (_vm.chip2)
    },
    on: {
      "input": function($event) {
        _vm.chip2 = $event
      }
    }
  }, ["Remove"]), _vm._h('v-chip', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.chip3),
      expression: "chip3"
    }],
    staticClass: "green green--text",
    attrs: {
      "close": "close",
      "outline": "outline"
    },
    domProps: {
      "value": (_vm.chip3)
    },
    on: {
      "input": function($event) {
        _vm.chip3 = $event
      }
    }
  }, ["Success"]), _vm._h('v-chip', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.chip4),
      expression: "chip4"
    }],
    staticClass: "orange orange--text",
    attrs: {
      "close": "close",
      "outline": "outline",
      "label": "label"
    },
    domProps: {
      "value": (_vm.chip4)
    },
    on: {
      "input": function($event) {
        _vm.chip4 = $event
      }
    }
  }, ["Complete"])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-chip>\n  ...\n</v-chip>\n \n<v-chip label>\n  ...\n</v-chip>\n \n<v-chip outline>\n  <v-icon left>list</v-icon>\n  ...\n</v-chip>\n \n<v-chip small>\n  ...\n</v-chip>\n \n<v-chip close>\n  ...\n</v-chip>"])])
},staticRenderFns: []}

/***/ },
/* 113 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "id": "progress",
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Fixed Width"
    }
  }, [_vm._h('div', [_vm._h('v-progress', {
    attrs: {
      "value": "25",
      "min": "0",
      "max": "100"
    }
  })]), _vm._h('div', [_vm._h('v-progress', {
    attrs: {
      "value": "50",
      "min": "0",
      "max": "100"
    }
  })]), _vm._h('div', [_vm._h('v-progress', {
    attrs: {
      "value": "75",
      "min": "0",
      "max": "100"
    }
  })]), _vm._h('div', [_vm._h('v-progress', {
    attrs: {
      "value": "100",
      "min": "0",
      "max": "100"
    }
  })])]), _vm._h('component-example', {
    attrs: {
      "header": "Indeterminate"
    }
  }, [_vm._h('div', [_vm._h('v-progress', {
    attrs: {
      "indeterminate": "indeterminate"
    }
  })])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-progress value=\"100\" min=\"0\" max=\"100\"></v-progress>\n \n<v-progress indeterminate></v-progress>\n \n<v-progress v-model=\"progress\" min=\"0\" max=\"100\"></v-progress>"])])
},staticRenderFns: []}

/***/ },
/* 114 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('v-app', {
    attrs: {
      "left-fixed-sidebar": "left-fixed-sidebar",
      "top-navbar": "top-navbar"
    }
  }, [_vm._h('main-nav', {
    attrs: {
      "title": _vm.title
    }
  }), _vm._h('main', [_vm._h('main-side'), _vm._h('v-content', [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('transition', {
    attrs: {
      "name": "slide",
      "mode": "out-in"
    }
  }, [_vm._h('router-view', {
    on: {
      "view": function (view) { return _vm.title = view; }
    }
  })])])])]), _vm._h('main-footer')])
},staticRenderFns: []}

/***/ },
/* 115 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Basic"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-title', ["Person"])]), _vm._h('v-list-item', [_vm._h('v-list-item-title', ["Person"])]), _vm._h('v-list-item', [_vm._h('v-list-item-title', ["Person"])])])]), _vm._h('component-example', {
    attrs: {
      "header": "With Icon"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('v-list-item-icon', ["person"]), _vm._h('v-list-item-title', ["Person"])]), _vm._h('v-list-item', [_vm._h('v-list-item-icon', ["person"]), _vm._h('v-list-item-title', ["Person"])]), _vm._h('v-list-item', [_vm._h('v-list-item-icon', ["person"]), _vm._h('v-list-item-title', ["Person"])])])]), _vm._h('component-example', {
    attrs: {
      "header": "With Avatar"
    }
  }, [_vm._h('v-list', [_vm._h('v-list-item', [_vm._h('a', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:dropdown",
      arg: "dropdown"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-list-item-avatar', {
    staticClass: "orange",
    attrs: {
      "large": "large"
    }
  }, ["event"])]), _vm._h('v-dropdown', {
    attrs: {
      "id": "dropdown",
      "items": _vm.items
    }
  }), _vm._h('v-list-item-title', ["Person"])]), _vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    directives: [{
      name: "badge",
      rawName: "v-badge:notifications.icon",
      arg: "notifications",
      modifiers: {
        "icon": true
      }
    }],
    staticClass: "brown",
    attrs: {
      "large": "large"
    }
  }, ["person"]), _vm._h('v-list-item-title', ["Person"]), _vm._h('v-list-item-action', [_vm._h('a', {
    directives: [{
      name: "dropdown",
      rawName: "v-dropdown:menu",
      arg: "menu"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', {
    staticClass: "blue--text",
    attrs: {
      "medium": "medium"
    }
  }, ["edit"])]), _vm._h('v-dropdown', {
    attrs: {
      "id": "menu",
      "items": _vm.items,
      "right": "right"
    }
  })])]), _vm._h('v-list-item', [_vm._h('v-list-item-avatar', {
    staticClass: "green",
    attrs: {
      "large": "large"
    }
  }, ["phone"]), _vm._h('v-list-item-title', [_vm._h('span', ["Person"]), _vm._h('v-list-item-sub-title', ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."])]), _vm._h('v-list-item-action', [_vm._h('v-list-item-action-title', ["Contact"]), _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', {
    staticClass: "grey--text darken-1"
  }, ["email"])])])])])]), _vm._h('markup', {
    slot: "markup"
  }, ["<v-list>\n  <v-list-item>\n    <v-list-item-title>\n      ...\n    </v-list-item-title>  \n  </v-list-item>\n</v-list>\n \n<v-list>\n  <v-list-item>\n    <v-list-item-icon>list</v-list-item-icon>\n    <v-list-item-title>\n      ...\n    </v-list-item-title>\n  </v-list-item>\n</v-list>\n \n<v-list>\n  <v-list-item>\n    <v-list-item-avatar class=\"green\" large>list</v-list-item-avatar>\n    <v-list-item-title>\n      <span>...</span>\n      <v-list-item-sub-title>...</v-list-item-sub-title>\n    </v-list-item-title>\n    <v-list-item-action>\n      <v-list-item-action-title>...</v-list-item-action-title>\n      <a href=\"#!\">\n        <v-icon class=\"grey--text darken-1\">email</v-icon>\n    </v-list-item-action>\n  </v-list-item>\n</v-list>"])])
},staticRenderFns: []}

/***/ },
/* 116 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "view",
    attrs: {
      "id": "quick-start"
    }
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('strong', {
    slot: "title"
  }, ["Getting Started"]), _vm._h('p', {
    slot: "desc"
  }, ["Using one of Vuetify's Vue CLI packages (based on the official examples), get your project started in no time."])])]), _vm._h('section', [_vm._h('section-header', ["Required Files"]), _vm._h('p', {
    staticClass: "section-text"
  }, ["Vuetify only has one dependency, Google's Roboto Font and Material Icons."]), _vm._h('markup', ["<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel=\"stylesheet\" type=\"text/css\">"])]), _vm._h('section', [_vm._h('section-header', ["Global Install"]), _vm._m(0), _vm._h('markup', ["<link href=\"https://unpkg.com/vuetify/dist/vuetify.min.css\" rel=\"stylesheet\" type=\"text/css\">\n<script src=\"https://unpkg.com/vuetify/dist/vuetify.min.js\"></script>"])]), _vm._h('section', [_vm._h('section-header', ["Vue CLI"]), _vm._m(1), _vm._h('v-tabs', {
    attrs: {
      "id": "vue-cli"
    }
  }, [_vm._h('v-tabs-tabs', [_vm._h('v-tab', {
    attrs: {
      "href": "#simple",
      "selected": "selected"
    }
  }, ["Simple HTML ", _vm._h('br'), _vm._h('small', ["(Beginner)"])]), _vm._h('v-tab', {
    attrs: {
      "href": "#webpack"
    }
  }, ["Webpack ", _vm._h('br'), _vm._h('small', ["(Intermediate)"])]), _vm._h('v-tab', {
    attrs: {
      "href": "#webpack-ssr"
    }
  }, ["Webpack SSR ", _vm._h('br'), _vm._h('small', ["(Advanced)"])])]), _vm._h('v-tabs-items', [_vm._h('v-tabs-item', {
    attrs: {
      "id": "simple"
    }
  }, [_vm._h('h4', ["Simple HTML Quick Start"]), _vm._h('p', ["This template is intended for users who want to try out Vue and Vuetify in the most simple way. It contains a basic index.html with no additional functionality. "]), _vm._h('markup', ["vue init vuetifyjs.com/simple"])]), _vm._h('v-tabs-item', {
    attrs: {
      "id": "webpack"
    }
  }, [_vm._h('h4', ["Webpack Quick Start"]), _vm._h('p', ["This template is intended for users who are already familiar with Vue/Webpack. This is a basic setup for Vue with Vuetify.. It is recommended for basic prototyping and mockups."]), _vm._h('markup', ["vue init vuetifyjs.com/webpack"])]), _vm._h('v-tabs-item', {
    attrs: {
      "id": "webpack-ssr"
    }
  }, [_vm._h('h4', ["Webpack SSR Quick Start"]), _vm._h('p', ["This template is for advanced users looking to utilize the new Vue Server Renderer. Based off of structure setup in the VueJS 2 ", _vm._h('a', {
    attrs: {
      "href": "https://github.com/vuejs/vue-hackernews-2.0",
      "target": "_blank"
    }
  }, ["Hackernews"]), " repository, the Vuetify SSR template provides next generation functionality for advanced web applications."]), _vm._h('markup', ["vue init vuetifyjs.com/webpack-ssr"])])])]), _vm._h('h4', ["NPM Install"]), _vm._h('p', {
    staticClass: "section-text"
  }, ["After the vue-cli installation finishes:"]), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["cd <package-name>\nnpm install"]), _vm._m(2), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["cd <package-name>\nyarn"]), _vm._m(3), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["npm run dev"]), _vm._m(4)]), _vm._h('section', [_vm._h('whats-next', {
    attrs: {
      "route": "/overview",
      "text": "Overview"
    }
  }, ["Now that you have your project setup and ready to go, let's go over application structure of the ", _vm._h('strong', ["webpack ssr"]), " template."])])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["To use ", _vm._h('strong', ["Vuetify"]), " globally, just include the file into your ", _vm._h('code', ["index"]), " file of your application after Vue. Vuetify will automatically install into Vue and be ready to use! This will require the dependency above, as well as:"])
},function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["Below are 3 packages forked from the ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["official VueJS templates"]), ". They contain small modifications to help you get started with ", _vm._h('strong', {
    staticClass: "primary--text"
  }, ["Vuetify"]), " even faster. These packages require ", _vm._h('code', ["vue-cli"]), ". For more information on vue-cli, visit the official ", _vm._h('a', {
    attrs: {
      "href": "https://github.com/vuejs/vue-cli",
      "target": "_blank"
    }
  }, ["Github"]), " repository."])
},function (){var _vm=this;
  return _vm._h('p', ["Or alernatively, using Facebook's recently released ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["yarn package manager"]), "."])
},function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["If you are using the ", _vm._h('code', ["simple"]), " vue-cli package, you are ready to go. Simply open up ", _vm._h('code', ["index.html"]), " in any browser. For any other package, type:"])
},function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["into your console. This will start a ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["nodejs"]), " server locally which can be accessed by navigating to ", _vm._h('a', {
    attrs: {
      "href": "http://localhost:8080",
      "target": "_blank"
    }
  }, ["http://localhost:8080"]), " in your browser."])
}]}

/***/ },
/* 117 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc,
      "id": "sidebars"
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Left"
    }
  }, [_vm._h('div', {
    staticClass: "grey lighten-1"
  }, [_vm._h('v-navbar', [_vm._h('div', {
    staticClass: "navbar__side-icon hidden-sm-and-up"
  }, [_vm._h('a', {
    directives: [{
      name: "side-bar",
      rawName: "v-side-bar:doc-sidebar-1",
      arg: "doc-sidebar-1"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', ["reorder"])])]), _vm._h('v-navbar-logo', ["Logo"])]), _vm._h('v-sidebar', {
    staticClass: "white",
    attrs: {
      "id": "doc-sidebar-1",
      "height": "40vh"
    }
  }, [_vm._h('v-sidebar-items', {
    attrs: {
      "items": _vm.items
    }
  })])])]), _vm._h('component-example', {
    attrs: {
      "header": "Drawer"
    }
  }, [_vm._h('div', {
    staticClass: "grey lighten-1"
  }, [_vm._h('v-navbar', [_vm._h('div', {
    staticClass: "navbar__side-icon"
  }, [_vm._h('a', {
    directives: [{
      name: "side-bar",
      rawName: "v-side-bar:doc-sidebar-2",
      arg: "doc-sidebar-2"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', ["reorder"])])]), _vm._h('v-navbar-logo', ["Logo"])]), _vm._h('v-sidebar', {
    staticClass: "white",
    attrs: {
      "id": "doc-sidebar-2",
      "height": "40vh",
      "drawer": "drawer"
    }
  }, [_vm._h('v-sidebar-items', {
    attrs: {
      "items": _vm.items
    }
  })])])]), _vm._h('component-example', {
    attrs: {
      "header": "Item Groups"
    }
  }, [_vm._h('div', {
    staticClass: "grey lighten-1"
  }, [_vm._h('v-navbar', [_vm._h('div', {
    staticClass: "navbar__side-icon hidden-sm-and-up"
  }, [_vm._h('a', {
    directives: [{
      name: "side-bar",
      rawName: "v-side-bar:doc-sidebar-3",
      arg: "doc-sidebar-3"
    }],
    attrs: {
      "href": "#!"
    }
  }, [_vm._h('v-icon', ["reorder"])])]), _vm._h('v-navbar-logo', ["Logo"])]), _vm._h('v-sidebar', {
    staticClass: "white",
    attrs: {
      "id": "doc-sidebar-3",
      "height": "40vh"
    }
  }, [_vm._h('v-sidebar-items', {
    attrs: {
      "items": _vm.item_group
    }
  })])])]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-sidebar height=\"50vh\" v-bind:items=\"items\"></v-sidebar>\n \n<v-sidebar drawer>\n  <v-sidebar-items v-bind:items=\"items\"></v-sidebar>\n</v-sidebar>\n \n<v-sidebar fixed>\n  <v-sidebar-items>\n    <v-sidebar-item v-for=\"item in items\" v-bind:item=\"item\"></v-sidebar-item>\n  </v-sidebar>\n</v-sidebar>"]), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["data () {\n  return {\n    items: [\n      {\n        parent: { text: 'Parent', href: '#!\" '},\n        items: [\n          { text: 'Child', href: '#!', router: false },\n          { text: 'Child', href: '#!' },\n          { text: 'Child', href: '#!', icon: 'list' },\n        ]\n      },\n      { text: 'Link', href: '#!' }\n    ]\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 118 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('v-footer', {
    staticClass: "grey darken-2 white--text"
  }, [_vm._h('div', {
    staticClass: "text-xs-right"
  }, ["© 2016 John Leider"])])
},staticRenderFns: []}

/***/ },
/* 119 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "doc"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('dt', {
    slot: "title"
  }, [_vm._h('strong', ["Colors"])]), _vm._h('dd', {
    slot: "desc"
  }, [_vm._h('div', ["Soon"])])])]), _vm._h('section', {
    attrs: {
      "id": "colors"
    }
  }, [_vm._h('section-header', ["Material Design"]), _vm._h('component-example', {
    attrs: {
      "header": "Classes"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._l((_vm.colors), function(color) {
    return _vm._h('v-col', {
      attrs: {
        "xs6": "xs6",
        "sm6": "sm6",
        "md4": "md4",
        "lg3": "lg3"
      }
    }, [_vm._h('v-card', {
      class: [color],
      attrs: {
        "height": "100px"
      }
    }, [_vm._h('v-card-text', [_vm._h('h3', [_vm._s(color)])])]), _vm._l(([4, 3, 2, 1]), function(n) {
      return _vm._h('v-card', {
        staticClass: "black--text",
        class: [color, 'lighten-' + n]
      }, [_vm._h('v-card-text', [_vm._s(color) + " Lighten-" + _vm._s(n)])])
    }), _vm._l((4), function(n) {
      return _vm._h('v-card', {
        class: [color, 'darken-' + n]
      }, [_vm._h('v-card-text', [_vm._s(color) + " Darken-" + _vm._s(n)])])
    }), _vm._l((4), function(n) {
      return (!['grey', 'blue-grey', 'brown'].includes(color)) ? _vm._h('v-card', {
        staticClass: "black--text",
        class: [color, 'accent-' + n]
      }, [_vm._h('v-card-text', [_vm._s(color) + " Accent-" + _vm._s(n)])]) : _vm._e()
    })])
  })])])])])])
},staticRenderFns: []}

/***/ },
/* 120 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('h6', [_vm._t("default")])
},staticRenderFns: []}

/***/ },
/* 121 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "view"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('dt', {
    domProps: {
      "innerHTML": _vm._s(_vm.doc.title)
    },
    slot: "title"
  }), _vm._h('dd', {
    domProps: {
      "innerHTML": _vm._s(_vm.doc.desc)
    },
    slot: "desc"
  })])]), _vm._h('section', [_vm._h('section-header', ["Examples"]), _vm._t("default")]), _vm._h('section', [_vm._h('section-header', ["Markup"]), _vm._t("markup")]), _vm._h('section', [_vm._h('section-header', ["Parameters"]), _vm._h('component-parameters', {
    attrs: {
      "params": _vm.doc.params
    }
  })])])
},staticRenderFns: []}

/***/ },
/* 122 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Grid",
      "id": "grid"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12"
    }
  }, [_vm._h('v-card', {
    staticClass: "primary"
  }, [_vm._h('v-card-content', ["12"])])]), _vm._l((2), function(i) {
    return _vm._h('v-col', {
      attrs: {
        "xs6": "xs6"
      }
    }, [_vm._h('v-card', {
      staticClass: "secondary"
    }, [_vm._h('v-card-content', ["6"])])])
  }), _vm._l((3), function(i) {
    return _vm._h('v-col', {
      attrs: {
        "xs4": "xs4"
      }
    }, [_vm._h('v-card', {
      staticClass: "primary"
    }, [_vm._h('v-card-content', ["4"])])])
  }), _vm._l((4), function(i) {
    return _vm._h('v-col', {
      attrs: {
        "xs3": "xs3"
      }
    }, [_vm._h('v-card', {
      staticClass: "secondary"
    }, [_vm._h('v-card-content', ["3"])])])
  }), _vm._l((6), function(i) {
    return _vm._h('v-col', {
      attrs: {
        "xs2": "xs2"
      }
    }, [_vm._h('v-card', {
      staticClass: "primary"
    }, [_vm._h('v-card-content', ["2"])])])
  }), _vm._l((12), function(i) {
    return _vm._h('v-col', {
      attrs: {
        "xs1": "xs1"
      }
    }, [_vm._h('v-card', {
      staticClass: "secondary"
    }, [_vm._h('v-card-content', ["1"])])])
  })])])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    },
    slot: "markup"
  }, ["<v-container fluid>\n  <v-row>\n    <v-col xs12 sm6 md4 lg3>\n      ...\n    </v-col>\n    <v-col xs6 offset-xs3>\n      ...\n    </v-col>\n  </v-row>\n</v-container>"])])
},staticRenderFns: []}

/***/ },
/* 123 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Text Dividers"
    }
  }, [_vm._h('v-breadcrumbs', {
    attrs: {
      "divider": "/",
      "items": _vm.items
    }
  }), _vm._h('v-breadcrumbs', {
    attrs: {
      "divider": "-",
      "items": _vm.items
    }
  })]), _vm._h('component-example', {
    attrs: {
      "header": "Icon Dividers"
    }
  }, [_vm._h('v-breadcrumbs', {
    attrs: {
      "icons": "icons",
      "divider": "forward",
      "items": _vm.items
    }
  }), _vm._h('v-breadcrumbs', {
    attrs: {
      "icons": "icons",
      "divider": "chevron_right",
      "items": _vm.items
    }
  })]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "code": "xml"
    }
  }, ["<v-breadcrumbs divider=\"/\" v-bind:items=\"items\"></v-breadcrumbs>\n \n<v-breadcrumbs divider=\"/\">\n  <v-breadcrumbs-item v-for(item in items) v-bind:item=\"item\"></v-breadcrumbs-item>\n</v-breadcrumbs>"]), _vm._h('markup', {
    attrs: {
      "code": "javascript"
    }
  }, ["data () {\n  return {\n    items: [{ href: '#!', text: 'Dashboard', disabled: false}]\n  }\n}"])])])
},staticRenderFns: []}

/***/ },
/* 124 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "view"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('strong', {
    slot: "title"
  }, ["Overview"]), _vm._h('div', {
    slot: "desc"
  }, [_vm._h('p', ["This overview is designed to help you become fluent in the work-flow utilizing ", _vm._h('strong', ["Vuetify"]), ". In this section, you will cover the basics of using the ", _vm._h('code', ["webpack ssr"]), " template. If you have not already installed the ", _vm._h('code', ["webpack ssr"]), " template, please do so ", _vm._h('router-link', {
    attrs: {
      "to": "/quick-start#webpack-ssr"
    }
  }, ["here"]), "."])])])]), _vm._h('section', [_vm._h('section-header', ["Introduction"]), _vm._m(0), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["npm run dev"]), _vm._h('p', {
    staticClass: "section-text"
  }, ["Let's get aquainted with the folder structure which should look like this:"]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["/ project\n  / build\n    - setup-dev-server.js\n    - vue-loader.config.js\n    - webpack.base.config.js\n    - webpack.client.config.js\n    - webpack.server.config.js\n  / dist\n  / public\n  / src\n    / components\n    / router\n    / store\n    / css\n    / views\n    - app.js\n    - App.vue\n    - client-entry.js\n    - critical.js\n    - index.template.html\n    - server-entry.js\n  - .babelrc\n  - .gitignore\n  - README.md\n  - index.html\n  - package.json\n  - server.js"]), _vm._m(1), _vm._h('h3', ["Application"]), _vm._h('div', {
    staticClass: "section-text"
  }, [_vm._m(2), _vm._h('p', ["The markup below tells the application that you have a ", _vm._h('code', ["top navbar"]), " and ", _vm._h('code', ["footer"]), ". Once defined, the content area will be resized to accommodate. For more information on layouts, navigate to the ", _vm._h('router-link', {
    attrs: {
      "to": "/layouts"
    }
  }, ["Layouts"]), " section."])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-app top-navbar footer>\n  <header>\n    <v-navbar>\n      <h1>Portfolio</h1>\n    </v-navbar>\n  </header>\n  <main>\n    <v-content>\n      <v-container>\n        <router-view></router-view>\n      </v-container>\n    </v-content>\n  </main>\n  <v-footer>2016</v-footer>\n</v-app>"]), _vm._h('h3', ["Routing"]), _vm._m(3), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["routes: [\n  { path: '/', component: HomeView },\n  { path: '/about', component: AboutView }\n]"]), _vm._m(4), _vm._h('h3', ["State Control"]), _vm._m(5), _vm._h('markup', {
    attrs: {
      "lang": "js"
    }
  }, ["preFetch (store) {\n  store.dispatch('GET_USER', 2)\n}"]), _vm._m(6), _vm._h('whats-next', {
    attrs: {
      "route": "/layouts",
      "text": "Layouts"
    }
  }, [_vm._h('p', ["Now that you are more familiar with Vuetify and the Vue resources that it utilizes, take a look at the Layout's section and choose a design for your next application!"])])])])
},staticRenderFns: [function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["Now that you have ", _vm._h('strong', ["Vuetify"]), " installed, you are ready to make your first site. Make sure you have your local server running. If you do not, from within your project directory, type:"])
},function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "section-text"
  }, [_vm._h('p', ["The ", _vm._h('strong', ["Build"]), " folder contains all of the webpack specific build configurations for your project. ", _vm._h('strong', ["Src"]), " is where all the development project files reside. Notice that the ", _vm._h('code', ["vuetify ssr"]), " template is out-of-the-box configured to use ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["Vue Router"]), ", ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["Vuex"]), ", and the ", _vm._h('a', {
    attrs: {
      "href": "#!"
    }
  }, ["Vue Server Renderer"]), ". This will allow you to make simple or complex applications that are not only fast/efficient, but ", _vm._h('strong', ["SEO"]), " friendly."])])
},function (){var _vm=this;
  return _vm._h('p', ["Navigate to the ", _vm._h('strong', ["src"]), " folder and open up ", _vm._h('code', ["App.vue"]), ". Vuetify is a semantic-focused framework. The code you write should be easy to remember, and easy to manage. To do this, one of the main components of Vuetify is the ", _vm._h('code', ["v-app"]), " component. This will allow you to define your application layout without any heavy lifting."])
},function (){var _vm=this;
  return _vm._h('p', {
    staticClass: "section-text"
  }, ["Vuetify SSR uses the official Vue Router for controller application flow. Located in ", _vm._h('code', ["/src/route/index.js"]), ", all of your application routes will be defined here."])
},function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "section-text"
  }, [_vm._h('p', ["These routes can be accessed be creating a link to the specified path, or by using Vue Router's ", _vm._h('code', ["<router-link>"]), " component. For more information, review the official Vue Router ", _vm._h('a', {
    attrs: {
      "href": "https://router.vuejs.org/en/",
      "target": "_blank"
    }
  }, ["documentation"]), "."])])
},function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "section-text"
  }, [_vm._h('p', ["State control is managed by the official Vuex library. This follows Facebooks' Reflux design pattern. Navigate to ", _vm._h('code', ["/src/store/index.js"]), ". By default, Vuex is setup to prefetch data for the store before your page is initially rendered. To hook into this functionality, create a ", _vm._h('code', ["preFetch"]), " method on your view component."])])
},function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "section-text"
  }, [_vm._h('p', ["For more information on State Control and Vuex, view the official ", _vm._h('a', {
    attrs: {
      "href": "https://vuex.vuejs.org/en/intro.html",
      "target": "_blank"
    }
  }, ["documentation"]), "."])])
}]}

/***/ },
/* 125 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Selects"
    }
  }, [_vm._h('div', [_vm._h('v-select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.input),
      expression: "input"
    }],
    attrs: {
      "options": _vm.options,
      "id": "test",
      "label": "Testing",
      "name": "test"
    },
    domProps: {
      "value": (_vm.input)
    },
    on: {
      "input": function($event) {
        _vm.input = $event
      }
    }
  })]), _vm._h('div', [_vm._h('v-select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.multiple),
      expression: "multiple"
    }],
    attrs: {
      "options": _vm.options,
      "id": "test4",
      "label": "Testing4",
      "name": "test4",
      "multiple": "multiple"
    },
    domProps: {
      "value": (_vm.multiple)
    },
    on: {
      "input": function($event) {
        _vm.multiple = $event
      }
    }
  })])]), _vm._h('component-example', {
    attrs: {
      "header": "Inputs"
    }
  }, [_vm._h('div', [_vm._h('v-text-input', {
    attrs: {
      "id": "test2",
      "name": "test2",
      "label": "Testing 2"
    }
  })]), _vm._h('div', [_vm._h('v-text-input', {
    attrs: {
      "id": "test3",
      "name": "test3",
      "label": "Testing 3",
      "placeholder": "Testing 3"
    }
  })])]), _vm._h('component-example', {
    attrs: {
      "header": "Radios"
    }
  }, [_vm._h('v-radio', {
    attrs: {
      "id": "test5",
      "name": "test5",
      "label": "Testing 5"
    }
  }), _vm._h('v-radio', {
    attrs: {
      "id": "test6",
      "name": "test5",
      "label": "Testing 6",
      "gap": "gap"
    }
  }), _vm._h('v-radio', {
    attrs: {
      "id": "test62",
      "name": "test52",
      "label": "Testing 62",
      "gap": "gap",
      "checked": "checked",
      "disabled": "disabled"
    }
  }), _vm._h('v-radio', {
    attrs: {
      "id": "test61",
      "name": "test54",
      "label": "Testing 61",
      "disabled": "disabled",
      "checked": "checked"
    }
  }), _vm._h('v-radio', {
    attrs: {
      "id": "test71",
      "name": "test5",
      "label": "Testing 71",
      "disabled": "disabled"
    }
  })]), _vm._h('component-example', {
    attrs: {
      "header": "Checkboxes"
    }
  }, [_vm._h('v-checkbox', {
    attrs: {
      "id": "test7",
      "name": "test7",
      "label": "Testing 7"
    }
  }), _vm._h('v-checkbox', {
    attrs: {
      "id": "test8",
      "name": "test8",
      "label": "Testing 8",
      "filled": "filled"
    }
  }), _vm._h('v-checkbox', {
    attrs: {
      "id": "test9",
      "name": "test9",
      "label": "Testing 9",
      "indeterminate": "indeterminate"
    }
  }), _vm._h('v-checkbox', {
    attrs: {
      "id": "test10",
      "name": "test10",
      "label": "Testing 10",
      "disabled": "disabled"
    }
  }), _vm._h('v-checkbox', {
    attrs: {
      "id": "test10",
      "name": "test10",
      "label": "Testing 10",
      "checked": "checked",
      "disabled": "disabled"
    }
  })]), _vm._h('div', {
    slot: "markup"
  }, [_vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-select>\n  ...\n</v-select>"]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-text-input>\n  ...\n</v-text-input>"]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-radio>\n  ...\n</v-radio>"]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    }
  }, ["<v-checkbox>\n  ...\n</v-checkbox>"])])])
},staticRenderFns: []}

/***/ },
/* 126 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "view"
  }, [_vm._h('section', [_vm._h('section-text', [_vm._h('dt', {
    slot: "title"
  }, ["Typography"]), _vm._h('dd', {
    slot: "desc"
  }, ["Soon"])])]), _vm._h('section', [_vm._h('section-header', ["Examples"]), _vm._h('component-example', {
    attrs: {
      "id": "typo",
      "header": "Headers"
    }
  }, [_vm._h('h1', ["Heading h1"]), _vm._h('h2', ["Heading h2"]), _vm._h('h3', ["Heading h3"]), _vm._h('h4', ["Heading h4"]), _vm._h('h5', ["Heading h5"]), _vm._h('h6', ["Heading h6"])])])])
},staticRenderFns: []}

/***/ },
/* 127 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('div', {
    staticClass: "markup"
  }, [_vm._h('pre', [_vm._h('code', {
    ref: "code",
    class: _vm.code
  }, [_vm._t("default")])])])
},staticRenderFns: []}

/***/ },
/* 128 */
/***/ function(module, exports) {

module.exports={render:function (){var _vm=this;
  return _vm._h('doc-view', {
    attrs: {
      "doc": _vm.doc
    }
  }, [_vm._h('component-example', {
    attrs: {
      "header": "Navbar and Footer"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm4": "sm4"
    }
  }, [_vm._h('div', {
    staticClass: "layout z-depth-1"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm4": "sm4"
    }
  }, [_vm._h('div', {
    staticClass: "layout z-depth-1"
  }, [_vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])]), _vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm4": "sm4"
    }
  }, [_vm._h('div', {
    staticClass: "layout z-depth-1"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])]), _vm._h('div', {
    staticClass: "layout__footer primary"
  }, ["Footer"])])])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Navbar and Sidebar"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm6": "sm6",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('div', {
    staticClass: "layout z-depth-1"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('div', {
    staticClass: "layout__sidebar secondary"
  }, ["Sidebar"]), _vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm6": "sm6",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('div', {
    staticClass: "layout layout--4 z-depth-1"
  }, [_vm._h('div', {
    staticClass: "layout__sidebar secondary"
  }, ["Sidebar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])])])])])])]), _vm._h('component-example', {
    attrs: {
      "header": "Navbar, Sidebar and Footer"
    }
  }, [_vm._h('v-container', {
    attrs: {
      "fluid": "fluid"
    }
  }, [_vm._h('v-row', [_vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm6": "sm6",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('div', {
    staticClass: "layout z-depth-1"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('div', {
    staticClass: "layout__sidebar secondary"
  }, ["Sidebar"]), _vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"])]), _vm._h('div', {
    staticClass: "layout__footer primary"
  }, ["Footer"])])]), _vm._h('v-col', {
    attrs: {
      "xs12": "xs12",
      "sm6": "sm6",
      "md6": "md6",
      "lg6": "lg6"
    }
  }, [_vm._h('div', {
    staticClass: "layout layout--4 z-depth-1"
  }, [_vm._h('div', {
    staticClass: "layout__sidebar secondary"
  }, ["Sidebar"]), _vm._h('div', {
    staticClass: "layout__main"
  }, [_vm._h('nav', {
    staticClass: "navbar primary"
  }, ["Navbar"]), _vm._h('div', {
    staticClass: "layout__content"
  }, ["Content"]), _vm._h('div', {
    staticClass: "layout__footer primary"
  }, ["Footer"])])])])])])]), _vm._h('markup', {
    attrs: {
      "lang": "xml"
    },
    slot: "markup"
  }, ["<v-app top-navbar>\n  <header>\n    <v-navbar></v-nabvar>\n  </header>\n  <main>\n    <v-content>\n      <v-container>\n        <router-view></router-view>\n      </v-container>\n    </v-content>\n  </main>\n</v-app>\n \n<v-app top-navbar left-fixed-sidebar>\n  <header>\n    <v-navbar></v-nabvar>\n  </header>\n  <main>\n    <v-sidebar id=\"sidebar\" fixed close-on-click></v-sidebar>\n    <v-content>\n      <v-container>\n        <router-view></router-view>\n      </v-container>\n    </v-content>\n  </main>\n</v-app>\n \n<v-app top-navbar footer left-sidebar>\n  <header>\n    <v-navbar></v-nabvar>\n  </header>\n  <main>\n    <v-sidebar id=\"sidebar\" fixed close-on-click></v-sidebar>\n    <v-content>\n      <v-container>\n        <router-view></router-view>\n      </v-container>\n    </v-content>\n  </main>\n  <v-footer></v-footer>\n</v-app>"])])
},staticRenderFns: []}

/***/ },
/* 129 */
/***/ function(module, exports) {

module.exports = require("vue-router");

/***/ },
/* 130 */
/***/ function(module, exports) {

module.exports = require("vuetify");

/***/ },
/* 131 */
/***/ function(module, exports) {

module.exports = require("vuex");

/***/ },
/* 132 */
/***/ function(module, exports) {

module.exports = require("vuex-router-sync");

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__app__ = __webpack_require__(2);


var isDev = "production" !== 'production'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
/* harmony default export */ exports["default"] = function (context) {
  
  // set router's location
  __WEBPACK_IMPORTED_MODULE_0__app__["a" /* router */].push(context.url)
  var matchedComponents = __WEBPACK_IMPORTED_MODULE_0__app__["a" /* router */].getMatchedComponents()

  // no matched routes
  if (!matchedComponents.length) {
    return Promise.reject({ code: '404' })
  }

  // Call preFetch hooks on components matched by the route.
  // A preFetch hook dispatches a store action and returns a Promise,
  // which is resolved when the action is complete and store state has been
  // updated.
  return Promise.all(matchedComponents.map(function (component) {
    if (component.preFetch) {
      return component.preFetch(__WEBPACK_IMPORTED_MODULE_0__app__["b" /* store */])
    }
  })).then(function (res) {
    // After all preFetch hooks are resolved, our store is now
    // filled with the state needed to render the app.
    // Expose the state on the render context, and let the request handler
    // inline the state in the HTML response. This allows the client-side
    // store to pick-up the server-side state without having to duplicate
    // the initial data fetching on the client.
    context.initialState = __WEBPACK_IMPORTED_MODULE_0__app__["b" /* store */].state

    var page = res.shift()

    if (page && page.h1) {
      __WEBPACK_IMPORTED_MODULE_0__app__["c" /* app */].title = page.h1
    }

    if (page && page.meta) {
      context.meta = page.meta
      context.title = page.title
    }

    return __WEBPACK_IMPORTED_MODULE_0__app__["c" /* app */]
  })
};


/***/ }
/******/ ]);