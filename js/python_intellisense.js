/**
 * PYTHON INTELLISENSE & AUTO-COMPLETION ENGINE FOR PYNOTEBOOK
 * Supports:
 * - Auto-closing brackets: (), [], {}, "", ''
 * - Smart Tab indentation (4 spaces) & colon auto-indent
 * - Autocomplete suggestions for built-in functions (print(), len(), input(), etc.)
 * - Import module suggestions (math, numpy, statistics, random, datetime, json, etc.)
 * - Dot-method IntelliSense:
 *     name. -> .upper(), .lower(), .strip(), .split(), .replace(), .title()
 *     math. -> .sqrt(), .isqrt(), .floor(), .ceil(), .pi, .pow(), .sin()
 *     statistics. -> .mean(), .median(), .mode(), .stdev(), .variance()
 *     numpy. / np. -> .array(), .zeros(), .linspace(), .arange(), .mean()
 *     list. -> .append(), .pop(), .sort(), .extend(), .remove()
 */

(function () {
  'use strict';

  // Knowledge base of Python Modules, Builtins, and Methods
  const PYTHON_KNOWLEDGE = {
    // Modules suggested after 'import '
    modules: [
      { name: 'math', desc: 'Mathematical functions (sqrt, pow, trig, constants)', type: 'module' },
      { name: 'numpy', desc: 'Numerical computing & arrays (np.array, zeros, mean)', type: 'module' },
      { name: 'statistics', desc: 'Statistical functions (mean, median, mode, stdev)', type: 'module' },
      { name: 'random', desc: 'Random number generators & selections (randint, choice)', type: 'module' },
      { name: 'datetime', desc: 'Date and time manipulation (date, datetime, timedelta)', type: 'module' },
      { name: 'json', desc: 'JSON encoding and decoding', type: 'module' },
      { name: 'sys', desc: 'System-specific parameters and functions', type: 'module' },
      { name: 'os', desc: 'Operating system interface and paths', type: 'module' },
      { name: 're', desc: 'Regular expressions matching operations', type: 'module' },
      { name: 'collections', desc: 'Specialized container datatypes (Counter, deque)', type: 'module' },
      { name: 'itertools', desc: 'Functions creating iterators for efficient looping', type: 'module' }
    ],

    // Built-in functions & keywords
    builtins: [
      { name: 'print()', insertText: 'print()', cursorOffset: -1, desc: 'Prints values to standard output', type: 'func' },
      { name: 'input()', insertText: 'input()', cursorOffset: -1, desc: 'Reads input from user', type: 'func' },
      { name: 'len()', insertText: 'len()', cursorOffset: -1, desc: 'Returns number of items in object', type: 'func' },
      { name: 'range()', insertText: 'range()', cursorOffset: -1, desc: 'Generates arithmetic sequence of numbers', type: 'func' },
      { name: 'int()', insertText: 'int()', cursorOffset: -1, desc: 'Converts value to integer', type: 'func' },
      { name: 'str()', insertText: 'str()', cursorOffset: -1, desc: 'Converts value to string', type: 'func' },
      { name: 'float()', insertText: 'float()', cursorOffset: -1, desc: 'Converts value to floating point', type: 'func' },
      { name: 'list()', insertText: 'list()', cursorOffset: -1, desc: 'Constructs a list', type: 'func' },
      { name: 'dict()', insertText: 'dict()', cursorOffset: -1, desc: 'Constructs a dictionary', type: 'func' },
      { name: 'set()', insertText: 'set()', cursorOffset: -1, desc: 'Constructs an unordered set of unique elements', type: 'func' },
      { name: 'sum()', insertText: 'sum()', cursorOffset: -1, desc: 'Sums items of an iterable', type: 'func' },
      { name: 'min()', insertText: 'min()', cursorOffset: -1, desc: 'Returns smallest item', type: 'func' },
      { name: 'max()', insertText: 'max()', cursorOffset: -1, desc: 'Returns largest item', type: 'func' },
      { name: 'type()', insertText: 'type()', cursorOffset: -1, desc: 'Returns object type', type: 'func' },
      { name: 'sorted()', insertText: 'sorted()', cursorOffset: -1, desc: 'Returns a new sorted list', type: 'func' },
      { name: 'enumerate()', insertText: 'enumerate()', cursorOffset: -1, desc: 'Returns (index, item) pairs', type: 'func' },
      { name: 'zip()', insertText: 'zip()', cursorOffset: -1, desc: 'Iterates multiple iterables in parallel', type: 'func' },
      { name: 'abs()', insertText: 'abs()', cursorOffset: -1, desc: 'Returns absolute value of a number', type: 'func' },
      { name: 'round()', insertText: 'round()', cursorOffset: -1, desc: 'Rounds number to given precision', type: 'func' },
      { name: 'isinstance()', insertText: 'isinstance()', cursorOffset: -1, desc: 'Checks if object is instance of class', type: 'func' }
    ],

    // String methods (suggested after variables like name. or strings)
    stringMethods: [
      { name: 'upper()', insertText: 'upper()', cursorOffset: 0, desc: 'Converts all characters to uppercase', type: 'method' },
      { name: 'lower()', insertText: 'lower()', cursorOffset: 0, desc: 'Converts all characters to lowercase', type: 'method' },
      { name: 'title()', insertText: 'title()', cursorOffset: 0, desc: 'Converts first character of each word to uppercase', type: 'method' },
      { name: 'capitalize()', insertText: 'capitalize()', cursorOffset: 0, desc: 'Capitalizes first character of string', type: 'method' },
      { name: 'strip()', insertText: 'strip()', cursorOffset: 0, desc: 'Removes leading and trailing whitespaces', type: 'method' },
      { name: 'split()', insertText: 'split()', cursorOffset: -1, desc: 'Splits string into a list of words', type: 'method' },
      { name: 'replace()', insertText: 'replace()', cursorOffset: -1, desc: 'Replaces substring with another string', type: 'method' },
      { name: 'find()', insertText: 'find()', cursorOffset: -1, desc: 'Finds index of first occurrence of substring', type: 'method' },
      { name: 'count()', insertText: 'count()', cursorOffset: -1, desc: 'Counts occurrences of substring', type: 'method' },
      { name: 'startswith()', insertText: 'startswith()', cursorOffset: -1, desc: 'Checks if string starts with prefix', type: 'method' },
      { name: 'endswith()', insertText: 'endswith()', cursorOffset: -1, desc: 'Checks if string ends with suffix', type: 'method' },
      { name: 'join()', insertText: 'join()', cursorOffset: -1, desc: 'Concatenates iterable elements using separator', type: 'method' },
      { name: 'isdigit()', insertText: 'isdigit()', cursorOffset: 0, desc: 'Checks if all characters are digits', type: 'method' },
      { name: 'isalpha()', insertText: 'isalpha()', cursorOffset: 0, desc: 'Checks if all characters are letters', type: 'method' },
      { name: 'format()', insertText: 'format()', cursorOffset: -1, desc: 'Formats string with arguments', type: 'method' }
    ],

    // Math module methods
    mathMethods: [
      { name: 'sqrt()', insertText: 'sqrt()', cursorOffset: -1, desc: 'Square root of a number', type: 'method' },
      { name: 'isqrt()', insertText: 'isqrt()', cursorOffset: -1, desc: 'Integer square root', type: 'method' },
      { name: 'floor()', insertText: 'floor()', cursorOffset: -1, desc: 'Largest integer <= x', type: 'method' },
      { name: 'ceil()', insertText: 'ceil()', cursorOffset: -1, desc: 'Smallest integer >= x', type: 'method' },
      { name: 'pow()', insertText: 'pow()', cursorOffset: -1, desc: 'Raises x to power y', type: 'method' },
      { name: 'pi', insertText: 'pi', cursorOffset: 0, desc: 'Mathematical constant π (3.14159...)', type: 'constant' },
      { name: 'e', insertText: 'e', cursorOffset: 0, desc: 'Mathematical constant e (2.71828...)', type: 'constant' },
      { name: 'sin()', insertText: 'sin()', cursorOffset: -1, desc: 'Sine of x (radians)', type: 'method' },
      { name: 'cos()', insertText: 'cos()', cursorOffset: -1, desc: 'Cosine of x (radians)', type: 'method' },
      { name: 'tan()', insertText: 'tan()', cursorOffset: -1, desc: 'Tangent of x (radians)', type: 'method' },
      { name: 'degrees()', insertText: 'degrees()', cursorOffset: -1, desc: 'Converts radians to degrees', type: 'method' },
      { name: 'radians()', insertText: 'radians()', cursorOffset: -1, desc: 'Converts degrees to radians', type: 'method' },
      { name: 'factorial()', insertText: 'factorial()', cursorOffset: -1, desc: 'Factorial of an integer', type: 'method' },
      { name: 'gcd()', insertText: 'gcd()', cursorOffset: -1, desc: 'Greatest common divisor', type: 'method' }
    ],

    // Statistics module methods
    statisticsMethods: [
      { name: 'mean()', insertText: 'mean()', cursorOffset: -1, desc: 'Calculates arithmetic mean (average)', type: 'method' },
      { name: 'median()', insertText: 'median()', cursorOffset: -1, desc: 'Calculates median (middle value)', type: 'method' },
      { name: 'mode()', insertText: 'mode()', cursorOffset: -1, desc: 'Calculates single most common data point', type: 'method' },
      { name: 'stdev()', insertText: 'stdev()', cursorOffset: -1, desc: 'Calculates sample standard deviation', type: 'method' },
      { name: 'variance()', insertText: 'variance()', cursorOffset: -1, desc: 'Calculates sample variance', type: 'method' },
      { name: 'quantiles()', insertText: 'quantiles()', cursorOffset: -1, desc: 'Divides data into equal intervals', type: 'method' }
    ],

    // NumPy methods
    numpyMethods: [
      { name: 'array()', insertText: 'array()', cursorOffset: -1, desc: 'Creates an N-dimensional array', type: 'method' },
      { name: 'zeros()', insertText: 'zeros()', cursorOffset: -1, desc: 'Returns array filled with zeros', type: 'method' },
      { name: 'ones()', insertText: 'ones()', cursorOffset: -1, desc: 'Returns array filled with ones', type: 'method' },
      { name: 'linspace()', insertText: 'linspace()', cursorOffset: -1, desc: 'Returns evenly spaced numbers over interval', type: 'method' },
      { name: 'arange()', insertText: 'arange()', cursorOffset: -1, desc: 'Returns evenly spaced values within range', type: 'method' },
      { name: 'mean()', insertText: 'mean()', cursorOffset: -1, desc: 'Computes arithmetic mean of array', type: 'method' },
      { name: 'std()', insertText: 'std()', cursorOffset: -1, desc: 'Computes standard deviation', type: 'method' },
      { name: 'sin()', insertText: 'sin()', cursorOffset: -1, desc: 'Trigonometric sine element-wise', type: 'method' },
      { name: 'cos()', insertText: 'cos()', cursorOffset: -1, desc: 'Trigonometric cosine element-wise', type: 'method' }
    ],

    // List methods
    listMethods: [
      { name: 'append()', insertText: 'append()', cursorOffset: -1, desc: 'Appends item to the end of list', type: 'method' },
      { name: 'extend()', insertText: 'extend()', cursorOffset: -1, desc: 'Extends list with iterable elements', type: 'method' },
      { name: 'insert()', insertText: 'insert()', cursorOffset: -1, desc: 'Inserts item at specified index', type: 'method' },
      { name: 'remove()', insertText: 'remove()', cursorOffset: -1, desc: 'Removes first item with specified value', type: 'method' },
      { name: 'pop()', insertText: 'pop()', cursorOffset: 0, desc: 'Removes and returns item at index', type: 'method' },
      { name: 'sort()', insertText: 'sort()', cursorOffset: 0, desc: 'Sorts list in ascending order', type: 'method' },
      { name: 'reverse()', insertText: 'reverse()', cursorOffset: 0, desc: 'Reverses the elements of the list in place', type: 'method' },
      { name: 'index()', insertText: 'index()', cursorOffset: -1, desc: 'Returns index of first element with value', type: 'method' },
      { name: 'count()', insertText: 'count()', cursorOffset: -1, desc: 'Returns number of times value appears', type: 'method' }
    ],

    // Dictionary methods
    dictMethods: [
      { name: 'keys()', insertText: 'keys()', cursorOffset: 0, desc: 'Returns view object of dictionary keys', type: 'method' },
      { name: 'values()', insertText: 'values()', cursorOffset: 0, desc: 'Returns view object of dictionary values', type: 'method' },
      { name: 'items()', insertText: 'items()', cursorOffset: 0, desc: 'Returns view object of (key, value) tuple pairs', type: 'method' },
      { name: 'get()', insertText: 'get()', cursorOffset: -1, desc: 'Returns value of specified key', type: 'method' },
      { name: 'update()', insertText: 'update()', cursorOffset: -1, desc: 'Updates dictionary with specified key-value pairs', type: 'method' },
      { name: 'pop()', insertText: 'pop()', cursorOffset: -1, desc: 'Removes element with specified key', type: 'method' }
    ]
  };

  // Pair mappings for auto-closing brackets and quotes
  const BRACKET_PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'"
  };

  // Active dropdown element
  let dropdownEl = null;
  let activeTextarea = null;
  let activeMatches = [];
  let selectedIndex = 0;
  let currentTokenInfo = null;

  // Create Dropdown DOM
  function getOrCreateDropdown() {
    if (!dropdownEl) {
      dropdownEl = document.createElement('div');
      dropdownEl.className = 'intellisense-dropdown';
      document.body.appendChild(dropdownEl);

      // Prevent mousedown from blurring textarea
      dropdownEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
    }
    return dropdownEl;
  }

  // Attach IntelliSense to a Textarea
  function attach(textarea) {
    if (textarea._hasIntellisense) return;
    textarea._hasIntellisense = true;

    // 1. Keydown handler: Bracket auto-pairing, Tab indentation, Enter auto-indent & Navigation
    textarea.addEventListener('keydown', handleKeydown);

    // 2. Input handler: Calculate token & show autocomplete
    textarea.addEventListener('input', handleInput);

    // 3. Blur: Hide dropdown
    textarea.addEventListener('blur', () => {
      setTimeout(hideDropdown, 200);
    });
  }

  // Handle Keydown
  function handleKeydown(e) {
    const textarea = e.target;
    activeTextarea = textarea;

    // If dropdown is active, handle navigation
    if (dropdownEl && dropdownEl.classList.contains('active')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % activeMatches.length;
        renderDropdownList();
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + activeMatches.length) % activeMatches.length;
        renderDropdownList();
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeMatches.length > 0) {
          e.preventDefault();
          commitSuggestion(activeMatches[selectedIndex]);
          return;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideDropdown();
        return;
      }
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // Auto-pairing brackets: (, [, {, ", '
    if (BRACKET_PAIRS[e.key] && start === end) {
      const openChar = e.key;
      const closeChar = BRACKET_PAIRS[e.key];

      // If user is typing closing quote/bracket and next character is already that closing character, step over!
      if ((e.key === ')' || e.key === ']' || e.key === '}' || e.key === '"' || e.key === "'") && val.charAt(start) === e.key) {
        e.preventDefault();
        textarea.setSelectionRange(start + 1, start + 1);
        return;
      }

      e.preventDefault();
      // Insert open and close brackets, set cursor inside
      const newVal = val.substring(0, start) + openChar + closeChar + val.substring(end);
      textarea.value = newVal;
      textarea.setSelectionRange(start + 1, start + 1);
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Step over closing bracket when typing it
    if ((e.key === ')' || e.key === ']' || e.key === '}') && val.charAt(start) === e.key) {
      e.preventDefault();
      textarea.setSelectionRange(start + 1, start + 1);
      return;
    }

    // Backspace: if cursor between (), [], {}, "", '', delete both!
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = val.charAt(start - 1);
      const nextChar = val.charAt(start);
      if (BRACKET_PAIRS[prevChar] === nextChar) {
        e.preventDefault();
        textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
        textarea.setSelectionRange(start - 1, start - 1);
        textarea.dispatchEvent(new Event('input'));
        return;
      }

      // Smart Backspace: Unindent up to 4 spaces if line up to cursor is only whitespace (IDE behavior)
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const textBeforeCursorOnLine = val.substring(lineStart, start);
      if (/^\s+$/.test(textBeforeCursorOnLine) && textBeforeCursorOnLine.length >= 2) {
        const spacesToRemove = textBeforeCursorOnLine.length % 4 === 0 ? 4 : (textBeforeCursorOnLine.length % 4);
        e.preventDefault();
        textarea.value = val.substring(0, start - spacesToRemove) + val.substring(start);
        textarea.setSelectionRange(start - spacesToRemove, start - spacesToRemove);
        textarea.dispatchEvent(new Event('input'));
        return;
      }
    }

    // Tab Key: Insert 4 spaces (Python Standard Indentation)
    if (e.key === 'Tab') {
      e.preventDefault();
      const spaces = '    ';
      textarea.value = val.substring(0, start) + spaces + val.substring(end);
      textarea.setSelectionRange(start + 4, start + 4);
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Enter Key: Auto-indent on colon ':'
    if (e.key === 'Enter') {
      const lines = val.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      const matchIndent = currentLine.match(/^\s*/);
      let indent = matchIndent ? matchIndent[0] : '';

      // If line ends with a colon ':', add 4 more spaces!
      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const insertion = '\n' + indent;
        textarea.value = val.substring(0, start) + insertion + val.substring(end);
        const newPos = start + insertion.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.dispatchEvent(new Event('input'));
        return;
      }
    }
  }

  // Handle Input to Detect Context & Show Suggestions
  function handleInput(e) {
    const textarea = e.target;
    activeTextarea = textarea;

    const pos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, pos);
    const lineBefore = textBefore.split('\n').pop();

    const tokenInfo = extractTokenInfo(lineBefore, pos);
    if (!tokenInfo) {
      hideDropdown();
      return;
    }

    currentTokenInfo = tokenInfo;
    const matches = findMatches(tokenInfo);

    if (matches && matches.length > 0) {
      activeMatches = matches;
      selectedIndex = 0;
      positionAndShowDropdown(textarea, tokenInfo);
    } else {
      hideDropdown();
    }
  }

  // Extract Token & Context from Line
  function extractTokenInfo(lineBefore, cursorPos) {
    // 1. After 'import '
    const importMatch = lineBefore.match(/import\s+([a-zA-Z0-9_]*)$/);
    if (importMatch) {
      return {
        context: 'import',
        query: importMatch[1].toLowerCase(),
        replaceLength: importMatch[1].length
      };
    }

    // 2. Dot notation: e.g. 'name.', 'math.', 'statistics.', 'np.', 'numpy.', 'arr.'
    const dotMatch = lineBefore.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]*)$/);
    if (dotMatch) {
      const objectName = dotMatch[1].toLowerCase();
      const methodQuery = dotMatch[2].toLowerCase();
      return {
        context: 'dot',
        object: objectName,
        query: methodQuery,
        replaceLength: dotMatch[2].length
      };
    }

    // 3. General word (e.g. 'pr' -> print, 'le' -> len, 'in' -> input)
    const wordMatch = lineBefore.match(/([a-zA-Z0-9_]{1,})$/);
    if (wordMatch) {
      const word = wordMatch[1].toLowerCase();
      // Only trigger if at least 1 character
      return {
        context: 'general',
        query: word,
        replaceLength: word.length
      };
    }

    return null;
  }

  // Find Matches from Knowledge Base
  function findMatches(tokenInfo) {
    const { context, object, query } = tokenInfo;

    // Case 1: Import module suggestions
    if (context === 'import') {
      return PYTHON_KNOWLEDGE.modules.filter(m => m.name.toLowerCase().startsWith(query));
    }

    // Case 2: Dot notation (e.g. name.upper(), math.sqrt(), etc.)
    if (context === 'dot') {
      let pool = [];

      if (object === 'math') {
        pool = PYTHON_KNOWLEDGE.mathMethods;
      } else if (object === 'statistics' || object === 'stats') {
        pool = PYTHON_KNOWLEDGE.statisticsMethods;
      } else if (object === 'numpy' || object === 'np') {
        pool = PYTHON_KNOWLEDGE.numpyMethods;
      } else {
        // Default to String and List methods (e.g. name.upper(), text.lower(), items.append())
        pool = [...PYTHON_KNOWLEDGE.stringMethods, ...PYTHON_KNOWLEDGE.listMethods, ...PYTHON_KNOWLEDGE.dictMethods];
      }

      return pool.filter(item => item.name.toLowerCase().startsWith(query));
    }

    // Case 3: General words (builtins and modules)
    if (context === 'general') {
      const pool = [
        ...PYTHON_KNOWLEDGE.builtins,
        ...PYTHON_KNOWLEDGE.modules.map(m => ({
          name: m.name,
          insertText: m.name,
          cursorOffset: 0,
          desc: m.desc,
          type: 'module'
        }))
      ];

      return pool.filter(item => item.name.toLowerCase().startsWith(query));
    }

    return [];
  }

  // Position Dropdown near Cursor on Ruled Notebook Lines
  function positionAndShowDropdown(textarea, tokenInfo) {
    const dropdown = getOrCreateDropdown();

    const rect = textarea.getBoundingClientRect();
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    const lineCount = textBefore.split('\n').length;
    const currentLine = textBefore.split('\n').pop();

    // Calculate position aligned with 36px notebook ruled lines
    const lineHeight = 36;
    const top = window.scrollY + rect.top + (lineCount * lineHeight) + 2;
    // Estimate horizontal offset based on character count on current line
    const approxCharWidth = 10;
    const maxLeft = window.scrollX + rect.left + Math.min(500, currentLine.length * approxCharWidth + 15);

    dropdown.style.top = `${top}px`;
    dropdown.style.left = `${maxLeft}px`;

    renderDropdownList();
    dropdown.classList.add('active');
  }

  // Render Items in Dropdown List
  function renderDropdownList() {
    if (!dropdownEl) return;
    dropdownEl.innerHTML = '';

    activeMatches.slice(0, 8).forEach((item, index) => {
      const row = document.createElement('div');
      row.className = `intellisense-item ${index === selectedIndex ? 'selected' : ''}`;

      const iconClass = item.type === 'func' ? 'icon-func' : item.type === 'method' ? 'icon-method' : item.type === 'module' ? 'icon-module' : 'icon-keyword';
      const iconLabel = item.type === 'func' ? 'fn' : item.type === 'method' ? 'm' : item.type === 'module' ? 'mod' : 'kw';

      row.innerHTML = `
        <div class="intellisense-item-left">
          <span class="intellisense-icon ${iconClass}">${iconLabel}</span>
          <span style="font-weight: 700;">${escapeHtml(item.name)}</span>
        </div>
        <div class="intellisense-desc">${escapeHtml(item.desc || '')}</div>
      `;

      row.addEventListener('click', () => {
        commitSuggestion(item);
      });

      dropdownEl.appendChild(row);
    });
  }

  // Commit / Insert Selected Suggestion into Textarea
  function commitSuggestion(item) {
    if (!activeTextarea || !currentTokenInfo) return;

    const textarea = activeTextarea;
    const pos = textarea.selectionStart;
    const replaceLen = currentTokenInfo.replaceLength || 0;

    const textToInsert = item.insertText || item.name;
    const cursorOffset = item.cursorOffset || 0;

    const val = textarea.value;
    const startPos = pos - replaceLen;
    const newVal = val.substring(0, startPos) + textToInsert + val.substring(pos);

    textarea.value = newVal;

    // Calculate new cursor position (e.g. inside brackets for print() or after method name)
    const newCursorPos = startPos + textToInsert.length + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    hideDropdown();
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  function hideDropdown() {
    if (dropdownEl) {
      dropdownEl.classList.remove('active');
      activeMatches = [];
      currentTokenInfo = null;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===================================================================
  //  PYTHON SYNTAX HIGHLIGHTING OVERLAY ENGINE
  //  Tokenizes Python code and renders coloured spans behind a
  //  transparent textarea so the user sees highlighted code while typing.
  // ===================================================================

  const PY_KEYWORDS = new Set([
    'False','None','True','and','as','assert','async','await',
    'break','class','continue','def','del','elif','else','except',
    'finally','for','from','global','if','import','in','is',
    'lambda','nonlocal','not','or','pass','raise','return','try',
    'while','with','yield'
  ]);

  const PY_BUILTINS = new Set([
    'print','input','len','range','type','str','int','float',
    'list','dict','set','tuple','bool','sum','min','max','abs',
    'round','sorted','enumerate','zip','isinstance','open',
    'map','filter','any','all','vars','dir','id','hex','bin',
    'oct','ord','chr','repr','hash','iter','next','callable'
  ]);

  /**
   * Tokenise one line of Python into an HTML string with coloured spans.
   * Token order matters: comment > string > number > keyword > builtin > operator > default.
   */
  function tokeniseLine(line) {
    let html = '';
    let i = 0;
    const len = line.length;

    while (i < len) {
      // --- Comment (rest of line) ---
      if (line[i] === '#') {
        html += `<span class="phl-cm">${escapeHtml(line.slice(i))}</span>`;
        break;
      }

      // --- Triple-quoted string (open on this line) ---
      if ((line[i] === '"' || line[i] === "'") &&
          line[i + 1] === line[i] && line[i + 2] === line[i]) {
        const q = line[i].repeat(3);
        let end = i + 3;
        while (end < len && line.slice(end, end + 3) !== q) end++;
        end = end < len ? end + 3 : len;
        html += `<span class="phl-st">${escapeHtml(line.slice(i, end))}</span>`;
        i = end;
        continue;
      }

      // --- Single-quoted string ---
      if (line[i] === '"' || line[i] === "'") {
        const q = line[i];
        let end = i + 1;
        while (end < len && line[end] !== q) {
          if (line[end] === '\\') end++; // skip escape
          end++;
        }
        end = end < len ? end + 1 : len;
        html += `<span class="phl-st">${escapeHtml(line.slice(i, end))}</span>`;
        i = end;
        continue;
      }

      // --- Number ---
      if (/[0-9]/.test(line[i]) || (line[i] === '.' && /[0-9]/.test(line[i + 1] || ''))) {
        let end = i;
        while (end < len && /[0-9._xXoObBaAbBcCdDeEfFjJ]/.test(line[end])) end++;
        html += `<span class="phl-nm">${escapeHtml(line.slice(i, end))}</span>`;
        i = end;
        continue;
      }

      // --- Identifier / keyword / builtin ---
      if (/[a-zA-Z_]/.test(line[i])) {
        let end = i;
        while (end < len && /[a-zA-Z0-9_]/.test(line[end])) end++;
        const word = line.slice(i, end);
        if (PY_KEYWORDS.has(word)) {
          html += `<span class="phl-kw">${escapeHtml(word)}</span>`;
        } else if (PY_BUILTINS.has(word)) {
          html += `<span class="phl-bi">${escapeHtml(word)}</span>`;
        } else {
          html += `<span class="phl-id">${escapeHtml(word)}</span>`;
        }
        i = end;
        continue;
      }

      // --- Operator / punctuation ---
      if (/[+\-*/%=<>!&|^~@,.:;()\[\]{}]/.test(line[i])) {
        html += `<span class="phl-op">${escapeHtml(line[i])}</span>`;
        i++;
        continue;
      }

      // --- Whitespace and everything else ---
      html += escapeHtml(line[i]);
      i++;
    }

    return html;
  }

  /** Convert full textarea text to highlighted HTML preserving newlines. */
  function highlightCode(text) {
    return text
      .split('\n')
      .map(line => tokeniseLine(line) || '\u200B') // zero-width space keeps empty lines
      .join('\n');
  }

  /**
   * Attach the syntax-highlight overlay to a code textarea.
   * Creates a sibling <div> that mirrors the textarea's content with coloured spans.
   */
  function attachHighlight(textarea, providedOverlay = null) {
    if (textarea._hasHighlight) return;
    textarea._hasHighlight = true;

    let overlay = providedOverlay;
    if (!overlay) {
      let wrapper = textarea.closest ? textarea.closest('.code-editor-wrapper') : null;
      if (!wrapper && textarea.parentNode) {
        wrapper = document.createElement('div');
        wrapper.className = 'code-editor-wrapper';
        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(textarea);
      }
      if (wrapper) {
        overlay = wrapper.querySelector('.code-highlight-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'code-highlight-overlay';
          overlay.setAttribute('aria-hidden', 'true');
          wrapper.insertBefore(overlay, textarea);
        }
      }
    }

    if (!overlay) return; // fail-safe: never crash if DOM isn't ready

    // Sync helper: re-render overlay and sync scroll
    function syncOverlay() {
      const isCode = textarea.classList.contains('code-mode-green');
      if (!isCode) {
        overlay.style.display = 'none';
        textarea.classList.remove('code-transparent');
        return;
      }
      overlay.style.display = 'block';
      textarea.classList.add('code-transparent');
      overlay.innerHTML = highlightCode(textarea.value);
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    }

    textarea._syncHighlight = syncOverlay;

    // Sync on every input
    textarea.addEventListener('input', syncOverlay);
    // Sync scroll separately
    textarea.addEventListener('scroll', () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });

    // Initial render
    syncOverlay();
  }

  // ===================================================================
  //  Expose Global Module
  // ===================================================================
  window.PythonIntellisense = {
    attach: attach,
    attachHighlight: attachHighlight,
    sync: function(textarea) {
      if (textarea && textarea._syncHighlight) textarea._syncHighlight();
    }
  };

})();
