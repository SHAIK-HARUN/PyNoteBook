/**
 * PYNOTEBOOK: Ruled Notebook with Times New Roman Theory,
 * Seamless Text-Format Code & Run Selected Code on Next Line.
 * Powered by Django Backend (manage.py)
 */

(function () {
  'use strict';

  // Global App State
  const State = {
    notebookId: null,
    title: 'Python Practice Notebook',
    pages: [],
    currentPageIndex: 0,
    selectedCode: '',
    selectedBlockIndex: null,
    user: null,
    isSaving: false,
    algorithms: []
  };

  // DOM Cache
  const DOM = {
    notebookBook: document.getElementById('notebookBook'),
    bookCover: document.getElementById('bookCover'),
    notebookPage: document.getElementById('notebookPage'),
    stationeryBar: document.getElementById('stationeryBar'),
    stationeryBarLocked: document.getElementById('stationeryBarLocked'),
    btnUnlockPrompt: document.getElementById('btnUnlockPrompt'),
    blocksContainer: document.getElementById('blocksContainer'),
    notebookTitleInput: document.getElementById('notebookTitleInput'),
    pageTitleInput: document.getElementById('pageTitleInput'),
    pageNumberDisplay: document.getElementById('pageNumberDisplay'),
    pageIndicatorPill: document.getElementById('pageIndicatorPill'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnRunGlobal: document.getElementById('btnRunGlobal'),
    btnSaveGlobal: document.getElementById('btnSaveGlobal'),
    btnOpenCover: document.getElementById('btnOpenCover'),
    floatingRunPill: document.getElementById('floatingRunPill'),
    notebookSelector: document.getElementById('notebookSelector'),
    btnNewNotebook: document.getElementById('btnNewNotebook'),
    // Auth elements
    authBtnTrigger: document.getElementById('authBtnTrigger'),
    authModal: document.getElementById('authModal'),
    btnCloseAuth: document.getElementById('btnCloseAuth'),
    userDisplayCapsule: document.getElementById('userDisplayCapsule'),
    userTag: document.getElementById('userTag'),
    btnLogout: document.getElementById('btnLogout'),
    authForm: document.getElementById('authForm'),
    authUsernameInput: document.getElementById('authUsername'),
    authPasswordInput: document.getElementById('authPassword'),
    authEmailInput: document.getElementById('authEmail'),
    authEmailGroup: document.getElementById('authEmailGroup'),
    authSubmitBtn: document.getElementById('authSubmitBtn'),
    tabSignIn: document.getElementById('tabSignIn'),
    tabSignUp: document.getElementById('tabSignUp'),
    // Algorithms
    algorithmsModal: document.getElementById('algorithmsModal'),
    algorithmsList: document.getElementById('algorithmsList'),
    toast: document.getElementById('toastNotice'),
    toastText: document.getElementById('toastText')
  };


  const LINE_HEIGHT_PX = 36;
  let currentAuthMode = 'login'; // 'login' or 'register'

  // =================================================================
  // CLIENT-SIDE NETLIFY & OFFLINE ADAPTER
  // Seamless LocalStorage persistence + Pyodide in-browser execution
  // Automatically activates if Django backend is not present (e.g. on Netlify)
  // =================================================================
  const NetlifyAdapter = {
    pyodide: null,
    pyodideLoading: null,

    async getPyodide() {
      if (this.pyodide) return this.pyodide;
      if (this.pyodideLoading) return this.pyodideLoading;
      if (typeof loadPyodide === 'function') {
        this.pyodideLoading = (async () => {
          try {
            const py = await loadPyodide();
            this.pyodide = py;
            return py;
          } catch (err) {
            console.warn('Pyodide could not be loaded:', err);
            return null;
          }
        })();
        return this.pyodideLoading;
      }
      return null;
    },

    getUsers() {
      try {
        return JSON.parse(localStorage.getItem('pynotebook_users') || '{}');
      } catch (e) { return {}; }
    },

    saveUsers(users) {
      localStorage.setItem('pynotebook_users', JSON.stringify(users));
    },

    getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem('pynotebook_current_user') || 'null');
      } catch (e) { return null; }
    },

    setCurrentUser(user) {
      if (user) {
        localStorage.setItem('pynotebook_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('pynotebook_current_user');
      }
    },

    getUserNotebooks(username) {
      const key = `pynotebook_data_${username}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
      } catch (e) {}

      // Default initial notebook
      const initial = [{
        id: 'nb_1',
        title: 'Python Preparation Notebook',
        pages_count: 1,
        pages: [{
          page_number: 1,
          title: 'Page 1 - Study Notes',
          blocks: [
            {
              id: 1,
              order: 0,
              block_type: 'headline',
              content: 'Python Preparation Notes & Algorithms',
              output: ''
            },
            {
              id: 2,
              order: 1,
              block_type: 'theory',
              content: 'Theory notes are written line by line in Times New Roman on the ruled notebook lines.\nThere is no separate container box for code - code is written in plain text format right on the lines.\nSimply select or highlight any code text with your cursor and click [Run Selected Code].\nThe execution output will automatically appear on the next line below!',
              output: ''
            },
            {
              id: 3,
              order: 2,
              block_type: 'code',
              content: '# Python Code Example (Select & Run)\ndef twosum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        complement = target - x\n        if complement in seen:\n            return seen[complement], i\n        seen[x] = i\n\nnums = [2, 5, 3, 4, 8, 1]\ntarget = 9\nprint(twosum(nums, target))',
              output: ''
            },
            {
              id: 4,
              order: 3,
              block_type: 'output',
              content: '',
              output: '(1, 3)\n'
            }
          ]
        }]
      }];
      this.saveUserNotebooks(username, initial);
      return initial;
    },

    saveUserNotebooks(username, notebooks) {
      const key = `pynotebook_data_${username}`;
      localStorage.setItem(key, JSON.stringify(notebooks));
    },

    algorithms: [
      {
        id: 1,
        name: 'Binary Search Algorithm',
        category: 'Searching',
        difficulty: 'Beginner',
        time_complexity: 'O(log n)',
        space_complexity: 'O(1)',
        headline: 'Binary Search in Sorted Array',
        theory: 'Binary Search is an efficient algorithm for finding an item from a sorted list.\nIt works by repeatedly dividing the search interval in half.\n1. Compare the target value to the middle element.\n2. If equal, search is complete.\n3. If target is less than middle, narrow interval to lower half.\n4. Otherwise, narrow to upper half.',
        code: 'def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    steps = 0\n    while low <= high:\n        steps += 1\n        mid = (low + high) // 2\n        print(f"Step {steps}: checking index {mid} -> value {arr[mid]}")\n        if arr[mid] == target:\n            return mid, steps\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1, steps\n\nnumbers = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]\ntarget = 23\nprint(f"Searching for {target} in: {numbers}")\nidx, count = binary_search(numbers, target)\nprint(f"Result: Found at index {idx} in only {count} steps!")',
        sample_output: 'Searching for 23 in: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]\nStep 1: checking index 5 -> value 23\nResult: Found at index 5 in only 1 steps!'
      },
      {
        id: 2,
        name: 'Bubble Sort Algorithm',
        category: 'Sorting',
        difficulty: 'Beginner',
        time_complexity: 'O(n²)',
        space_complexity: 'O(1)',
        headline: 'Bubble Sort with Pass Visualization',
        theory: 'Bubble Sort repeatedly steps through the list, compares adjacent elements\nand swaps them if they are in the wrong order.\nThe pass through the list is repeated until the list is completely sorted.\nBest Case: O(n) with swap flag optimization.',
        code: 'def bubble_sort(arr):\n    a = arr.copy()\n    n = len(a)\n    print("Initial Array:", a)\n    for i in range(n):\n        swapped = False\n        for j in range(0, n - i - 1):\n            if a[j] > a[j + 1]:\n                a[j], a[j + 1] = a[j + 1], a[j]\n                swapped = True\n        print(f"Pass {i + 1}: {a}")\n        if not swapped:\n            break\n    return a\n\ndata = [64, 34, 25, 12, 22, 11, 90]\nsorted_data = bubble_sort(data)\nprint("Final Sorted Array:", sorted_data)',
        sample_output: 'Initial Array: [64, 34, 25, 12, 22, 11, 90]\nPass 1: [34, 25, 12, 22, 11, 64, 90] ...\nFinal Sorted Array: [11, 12, 22, 25, 34, 64, 90]'
      },
      {
        id: 3,
        name: 'Fibonacci Dynamic Programming',
        category: 'Recursion & DP',
        difficulty: 'Intermediate',
        time_complexity: 'O(n)',
        space_complexity: 'O(n)',
        headline: 'Fibonacci with Memoization (Top-Down DP)',
        theory: 'Calculating Fibonacci recursively takes O(2ⁿ) exponential time.\nBy storing previously computed values (Memoization), we reduce complexity to linear O(n).\nFormula: F(n) = F(n-1) + F(n-2) with F(0)=0 and F(1)=1.',
        code: 'def fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)\n    return memo[n]\n\nterms = [0, 1, 5, 10, 20, 30, 40]\nprint("Fibonacci Numbers Calculated via Memoization:")\nfor t in terms:\n    print(f"F({t:2d}) = {fib_memo(t):,}")',
        sample_output: 'F( 0) = 0\nF( 1) = 1\nF( 5) = 5\nF(10) = 55\nF(20) = 6,765\nF(30) = 832,040\nF(40) = 102,334,155'
      },
      {
        id: 5,
        name: 'Stack Data Structure (LIFO)',
        category: 'Data Structures',
        difficulty: 'Beginner',
        time_complexity: 'O(1) push/pop',
        space_complexity: 'O(n)',
        headline: 'Custom Stack Class with Underflow/Overflow Protection',
        theory: 'A Stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle.\nOperations:\n- push(item): Inserts an item to the top.\n- pop(): Removes and returns the top item.\n- peek(): Views top item without removing.',
        code: 'class Stack:\n    def __init__(self, capacity=10):\n        self.capacity = capacity\n        self.items = []\n\n    def push(self, item):\n        if len(self.items) >= self.capacity:\n            raise OverflowError("Stack overflow!")\n        self.items.append(item)\n        print(f"Pushed: {item} | Stack: {self.items}")\n\n    def pop(self):\n        if not self.items:\n            raise IndexError("Stack underflow!")\n        popped = self.items.pop()\n        print(f"Popped: {popped} | Remaining: {self.items}")\n        return popped\n\ns = Stack()\ns.push(\'Python\')\ns.push(\'Django\')\ns.push(\'Algorithms\')\ns.pop()\ns.push(\'Web Development\')',
        sample_output: 'Pushed: Python | Stack: [\'Python\']\nPushed: Django | Stack: [\'Python\', \'Django\']\nPushed: Algorithms | Stack: [\'Python\', \'Django\', \'Algorithms\']\nPopped: Algorithms | Remaining: [\'Python\', \'Django\']\nPushed: Web Development'
      }
    ]
  };


  // Initialize
  async function init() {
    setupEventListeners();
    // Warm up Pyodide in background so execution is instant when user runs code!
    if (typeof loadPyodide === 'function') {
      NetlifyAdapter.getPyodide().catch(() => {});
    }
    await checkAuth();
    if (State.user) {
      await loadNotebooksList();
    }
    await loadAlgorithms();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // 3D Book Cover open (Only open if user is logged in, otherwise show auth modal!)
    if (DOM.btnOpenCover) DOM.btnOpenCover.addEventListener('click', tryOpenNotebook);
    if (DOM.bookCover) DOM.bookCover.addEventListener('click', tryOpenNotebook);
    if (DOM.btnUnlockPrompt) DOM.btnUnlockPrompt.addEventListener('click', openAuthModal);

    // Notebook Switcher dropdown & New Notebook button
    if (DOM.notebookSelector) {
      DOM.notebookSelector.addEventListener('change', async (e) => {
        if (!State.user) {
          openAuthModal();
          showToast('Please sign in or register first. The notebook opens only after login.');
          return;
        }
        const chosenId = e.target.value;
        if (chosenId && chosenId !== String(State.notebookId)) {
          await saveNotebookToDjango(true);
          await loadNotebookDetail(chosenId);
        }
      });
    }
    if (DOM.btnNewNotebook) {
      DOM.btnNewNotebook.addEventListener('click', handleNewNotebook);
    }

    // Top action buttons
    const btnAddHeadline = document.getElementById('btnAddHeadline');
    if (btnAddHeadline) btnAddHeadline.addEventListener('click', () => addBlock('headline'));

    const btnAddTheory = document.getElementById('btnAddTheory');
    if (btnAddTheory) btnAddTheory.addEventListener('click', () => addBlock('theory'));

    const btnAddCodeText = document.getElementById('btnAddCodeText');
    if (btnAddCodeText) btnAddCodeText.addEventListener('click', () => addBlock('code'));

    // Inline inserter buttons on notebook page
    const btnInlineHeadline = document.getElementById('btnInlineHeadline');
    if (btnInlineHeadline) btnInlineHeadline.addEventListener('click', () => addBlock('headline'));

    const btnInlineTheory = document.getElementById('btnInlineTheory');
    if (btnInlineTheory) btnInlineTheory.addEventListener('click', () => addBlock('theory'));

    const btnInlineCodeText = document.getElementById('btnInlineCodeText');
    if (btnInlineCodeText) btnInlineCodeText.addEventListener('click', () => addBlock('code'));

    // Code execution triggers
    DOM.btnRunGlobal.addEventListener('click', (e) => {
      e.preventDefault();
      runSelectedCode(null);
    });
    if (DOM.floatingRunPill) {
      DOM.floatingRunPill.addEventListener('click', (e) => {
        e.preventDefault();
        runSelectedCode(null);
      });
    }

    // Page navigation
    DOM.btnPrevPage.addEventListener('click', () => turnPage(-1));
    DOM.btnNextPage.addEventListener('click', () => turnPage(1));
    document.getElementById('btnNewPage').addEventListener('click', addNewPage);

    // Save
    DOM.btnSaveGlobal.addEventListener('click', () => saveNotebookToDjango(false));

    // Title input
    DOM.notebookTitleInput.addEventListener('input', (e) => {
      State.title = e.target.value;
    });

    // Auth modal controls
    if (DOM.authBtnTrigger) DOM.authBtnTrigger.addEventListener('click', openAuthModal);
    if (DOM.btnCloseAuth) DOM.btnCloseAuth.addEventListener('click', closeAuthModal);
    if (DOM.tabSignIn) DOM.tabSignIn.addEventListener('click', () => switchAuthTab('login'));
    if (DOM.tabSignUp) DOM.tabSignUp.addEventListener('click', () => switchAuthTab('register'));
    if (DOM.authForm) DOM.authForm.addEventListener('submit', handleAuthSubmit);
    if (DOM.btnLogout) DOM.btnLogout.addEventListener('click', handleLogout);

    // Algorithms Modal
    document.getElementById('btnOpenAlgorithms').addEventListener('click', openAlgorithmsModal);
    document.getElementById('btnCloseAlgorithms').addEventListener('click', closeAlgorithmsModal);
    DOM.algorithmsModal.addEventListener('click', (e) => {
      if (e.target === DOM.algorithmsModal) closeAlgorithmsModal();
    });

    // Auto-save every 25 seconds for student note persistence
    setInterval(() => {
      if (State.notebookId) saveNotebookToDjango(true);
    }, 25000);
  }

  // 3D Book Open & Close Gates
  function tryOpenNotebook(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!State.user) {
      openAuthModal();
      showToast('Notebook is closed. Please sign in or register to open and practice your notes.');
      return;
    }
    openNotebook();
  }

  function openNotebook() {
    if (!State.user) {
      console.warn('Strict Guard: Without signin, notebook will not open.');
      closeNotebook();
      return;
    }
    if (DOM.notebookBook) {
      DOM.notebookBook.classList.remove('is-closed');
      DOM.notebookBook.classList.add('is-open');
    }
    if (DOM.notebookPage) {
      DOM.notebookPage.style.display = 'flex';
    }
    if (DOM.stationeryBar) {
      DOM.stationeryBar.style.display = 'flex';
    }
    if (DOM.stationeryBarLocked) {
      DOM.stationeryBarLocked.style.display = 'none';
    }
    if (DOM.bookCover) {
      DOM.bookCover.classList.add('opened');
      showToast(`Welcome, ${State.user.username}! Your personal notebook is now open.`);
    }
  }

  function closeNotebook() {
    if (DOM.bookCover) {
      DOM.bookCover.classList.remove('opened');
    }
    if (DOM.notebookBook) {
      DOM.notebookBook.classList.remove('is-open');
      DOM.notebookBook.classList.add('is-closed');
    }
    if (DOM.notebookPage) {
      DOM.notebookPage.style.display = 'none';
    }
    if (DOM.stationeryBar) {
      DOM.stationeryBar.style.display = 'none';
    }
    if (DOM.stationeryBarLocked) {
      DOM.stationeryBarLocked.style.display = 'flex';
    }
  }

  // Check User Authentication
  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me/');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          State.user = data;
          updateAuthUI(true, data.username);
          openNotebook();
          await loadNotebooksList();
          return;
        }
      }
    } catch (e) {
      // Offline / Netlify mode
    }

    // Check LocalStorage session for Netlify
    const localUser = NetlifyAdapter.getCurrentUser();
    if (localUser && localUser.username) {
      State.user = localUser;
      updateAuthUI(true, localUser.username);
      openNotebook();
      await loadNotebooksList();
    } else {
      State.user = null;
      updateAuthUI(false);
      closeNotebook();
    }
  }

  function updateAuthUI(isLoggedIn, username = '') {
    if (isLoggedIn) {
      DOM.authBtnTrigger.style.display = 'none';
      DOM.userDisplayCapsule.style.display = 'inline-flex';
      DOM.userTag.textContent = `User: ${username}`;
      if (DOM.btnOpenCover) {
        DOM.btnOpenCover.innerHTML = 'Open Personal Notebook &rarr;';
      }
    } else {
      DOM.authBtnTrigger.style.display = 'inline-flex';
      DOM.userDisplayCapsule.style.display = 'none';
      if (DOM.btnOpenCover) {
        DOM.btnOpenCover.innerHTML = 'Sign In / Register to Open Notebook &rarr;';
      }
    }
  }

  // Load Notebooks List & Detail from Django or Netlify LocalStorage
  async function loadNotebooksList(selectId = null) {
    let nbs = [];
    try {
      const res = await fetch('/api/notebooks/');
      if (res.ok) {
        const data = await res.json();
        nbs = data.notebooks || [];
      }
    } catch (err) {
      // Netlify / LocalStorage mode
    }

    if (nbs.length === 0 && State.user) {
      nbs = NetlifyAdapter.getUserNotebooks(State.user.username);
    }

    if (DOM.notebookSelector) {
      DOM.notebookSelector.innerHTML = '';
      nbs.forEach(nb => {
        const opt = document.createElement('option');
        opt.value = nb.id;
        opt.textContent = `${nb.title} (${nb.pages_count || (nb.pages ? nb.pages.length : 1)}p)`;
        DOM.notebookSelector.appendChild(opt);
      });
    }

    if (nbs.length > 0) {
      const targetId = selectId || nbs[0].id;
      if (DOM.notebookSelector) DOM.notebookSelector.value = targetId;
      await loadNotebookDetail(targetId);
    }
  }

  async function handleNewNotebook() {
    if (!State.user) {
      openAuthModal();
      showToast('Please sign in or register to create and save new notebooks.');
      return;
    }

    const title = prompt('Enter a title for your new study notebook:', 'Python Study Notes') || 'My Study Notebook';
    try {
      const res = await fetch('/api/notebooks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          showToast(`Created notebook: "${title}"!`);
          await loadNotebooksList(data.id);
          return;
        }
      }
    } catch (e) {
      // Fall through to Netlify adapter
    }

    // LocalStorage creation
    const userNbs = NetlifyAdapter.getUserNotebooks(State.user.username);
    const newId = 'nb_' + Date.now();
    const newNb = {
      id: newId,
      title: title,
      pages_count: 1,
      pages: [{
        page_number: 1,
        title: 'Page 1 - Notes',
        blocks: [
          { id: 1, order: 0, block_type: 'headline', content: title, output: '' },
          { id: 2, order: 1, block_type: 'theory', content: 'Write your notes here in Times New Roman...', output: '' }
        ]
      }]
    };
    userNbs.push(newNb);
    NetlifyAdapter.saveUserNotebooks(State.user.username, userNbs);
    showToast(`Created notebook: "${title}"!`);
    await loadNotebooksList(newId);
  }

  async function loadNotebookDetail(id) {
    try {
      const res = await fetch(`/api/notebooks/${id}/`);
      if (res.ok) {
        const data = await res.json();
        State.notebookId = data.id;
        State.title = data.title;
        State.pages = data.pages || [];
        State.currentPageIndex = 0;
        DOM.notebookTitleInput.value = State.title;
        renderCurrentPage();
        return;
      }
    } catch (err) {
      // LocalStorage mode
    }

    if (State.user) {
      const userNbs = NetlifyAdapter.getUserNotebooks(State.user.username);
      const found = userNbs.find(n => String(n.id) === String(id)) || userNbs[0];
      if (found) {
        State.notebookId = found.id;
        State.title = found.title;
        State.pages = found.pages || [];
        State.currentPageIndex = 0;
        DOM.notebookTitleInput.value = State.title;
        renderCurrentPage();
      }
    }
  }

  // Render Current Page
  function renderCurrentPage() {
    const page = State.pages[State.currentPageIndex];
    if (!page) {
      DOM.blocksContainer.innerHTML = '<div style="padding: 20px; color: #94a3b8; font-family: var(--font-theory);">Empty page. Click + Theory to start writing notes!</div>';
      return;
    }

    DOM.pageTitleInput.value = page.title || `Page ${State.currentPageIndex + 1}`;
    DOM.pageNumberDisplay.textContent = `${State.currentPageIndex + 1}`;
    DOM.pageIndicatorPill.textContent = `Page ${State.currentPageIndex + 1} of ${State.pages.length}`;

    DOM.blocksContainer.innerHTML = '';
    (page.blocks || []).forEach((block, index) => {
      const blockEl = createBlockElement(block, index);
      DOM.blocksContainer.appendChild(blockEl);
    });

    hideFloatingRunPill();
  }

  // Create DOM Element for Each Line/Block
  function createBlockElement(block, index) {
    const row = document.createElement('div');
    row.className = 'notebook-block-row';
    row.dataset.blockIndex = index;

    // Margin Column (Left of red line)
    const marginCol = document.createElement('div');
    marginCol.className = 'block-margin-col';

    const isCodeBlock = block.block_type === 'code' || 
      (block.block_type !== 'headline' && block.block_type !== 'output' && (
        Boolean(block.content && (
          block.content.trim().startsWith('#') || 
          block.content.trim().startsWith('def ') || 
          block.content.trim().startsWith('import ') || 
          block.content.trim().startsWith('from ') || 
          block.content.trim().startsWith('class ') || 
          block.content.trim().startsWith('for ') || 
          block.content.trim().startsWith('while ') || 
          block.content.includes('print(') || 
          block.content.includes('input(') || 
          block.content.includes(' = ')
        ))
      ));

    const tag = document.createElement('span');
    if (block.block_type === 'headline') {
      tag.className = 'block-tag tag-headline';
      tag.textContent = 'H1';
    } else if (block.block_type === 'output') {
      tag.className = 'block-tag tag-output';
      tag.textContent = 'OUT';
    } else if (isCodeBlock) {
      tag.className = 'block-tag tag-code-green';
      tag.textContent = 'CODE';
    } else {
      tag.className = 'block-tag tag-theory';
      tag.textContent = 'NOTE';
    }
    marginCol.appendChild(tag);

    const lineNo = document.createElement('span');
    lineNo.className = 'block-line-number';
    lineNo.textContent = `L${index + 1}`;
    marginCol.appendChild(lineNo);

    // Content Column (Right of red line)
    const contentCol = document.createElement('div');
    contentCol.className = 'block-content-col';

    // Controls on hover (move up, move down, delete)
    const controls = document.createElement('div');
    controls.className = 'block-controls';
    controls.innerHTML = `
      <button class="block-btn-icon" title="Move Up" onclick="window.PyNotebook.moveBlock(${index}, -1)">&uarr;</button>
      <button class="block-btn-icon" title="Move Down" onclick="window.PyNotebook.moveBlock(${index}, 1)">&darr;</button>
      <button class="block-btn-icon delete" title="Delete Line" onclick="window.PyNotebook.deleteBlock(${index})">&times;</button>
    `;
    contentCol.appendChild(controls);

    // BLOCK TYPES:
    // 1. Headline
    if (block.block_type === 'headline') {
      const wrapper = document.createElement('div');
      wrapper.className = 'headline-block';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'headline-input';
      input.value = block.content || '';
      input.placeholder = 'Topic / Headline in Times New Roman...';
      input.addEventListener('input', (e) => {
        block.content = e.target.value;
      });
      wrapper.appendChild(input);
      contentCol.appendChild(wrapper);

    // 2. Theory & Code in Text Format (Times New Roman on ruled lines)
    } else if (block.block_type === 'theory' || block.block_type === 'code') {
      const wrapper = document.createElement('div');
      wrapper.className = 'theory-block';

      const editorWrapper = document.createElement('div');
      editorWrapper.className = 'code-editor-wrapper';

      const overlay = document.createElement('div');
      overlay.className = 'code-highlight-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      const textarea = document.createElement('textarea');
      textarea.className = isCodeBlock ? 'theory-textarea code-mode-green' : 'theory-textarea';
      textarea.value = block.content || '';
      textarea.placeholder = isCodeBlock 
        ? 'Write Python code line by line here in green text (select and run)...' 
        : 'Write theory notes here line by line in Times New Roman...';

      // Auto-resize strictly to 36px ruled lines
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        const rawVal = textarea.value || '';
        // If not focused and has trailing newline(s), measure without trailing empty lines
        const isFocused = document.activeElement === textarea;
        const valToMeasure = isFocused ? rawVal : rawVal.replace(/\n+$/, '');
        const linesFromNewlines = valToMeasure ? valToMeasure.split('\n').length : 1;
        const scrollHeight = textarea.scrollHeight;
        const linesFromScroll = Math.ceil(scrollHeight / LINE_HEIGHT_PX);
        const totalLines = Math.max(1, linesFromNewlines, linesFromScroll);
        const targetHeight = totalLines * LINE_HEIGHT_PX;
        textarea.style.height = targetHeight + 'px';
      };

      textarea.addEventListener('input', (e) => {
        block.content = e.target.value;
        adjustHeight();
        const nowCode = block.block_type === 'code' || 
          e.target.value.trim().startsWith('#') || 
          e.target.value.trim().startsWith('def ') || 
          e.target.value.trim().startsWith('import ') || 
          e.target.value.trim().startsWith('from ') || 
          e.target.value.trim().startsWith('class ') || 
          e.target.value.trim().startsWith('for ') || 
          e.target.value.trim().startsWith('while ') || 
          e.target.value.includes('print(') || 
          e.target.value.includes('input(') || 
          e.target.value.includes(' = ');
        if (nowCode) {
          textarea.classList.add('code-mode-green');
          tag.className = 'block-tag tag-code-green';
          tag.textContent = 'CODE';
        } else if (block.block_type !== 'code') {
          textarea.classList.remove('code-mode-green');
          tag.className = 'block-tag tag-theory';
          tag.textContent = 'NOTE';
        }
        if (window.PythonIntellisense && window.PythonIntellisense.sync) {
          window.PythonIntellisense.sync(textarea);
        }
      });
      setTimeout(() => {
        adjustHeight();
        if (window.PythonIntellisense && window.PythonIntellisense.sync) {
          window.PythonIntellisense.sync(textarea);
        }
      }, 10);

      // Assemble nodes into DOM hierarchy BEFORE attaching listeners
      editorWrapper.appendChild(overlay);
      editorWrapper.appendChild(textarea);
      wrapper.appendChild(editorWrapper);
      contentCol.appendChild(wrapper);

      // Attach Python IntelliSense, auto-brackets, method completions & syntax highlighting
      if (window.PythonIntellisense) {
        window.PythonIntellisense.attach(textarea);
        window.PythonIntellisense.attachHighlight(textarea, overlay);
      }

      // CODE SELECTION DETECTION:
      // When student highlights/selects code in text format, show floating run pill & activate Run button!
      const handleSelection = (e) => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value.substring(start, end);

        if (text && text.trim().length > 0) {
          State.selectedCode = text.trim();
          State.selectedBlockIndex = index;
          positionFloatingRunPill(textarea, e);
          DOM.btnRunGlobal.classList.add('pulse-glow');
        } else {
          hideFloatingRunPill();
          DOM.btnRunGlobal.classList.remove('pulse-glow');
        }
      };

      textarea.addEventListener('mouseup', handleSelection);
      textarea.addEventListener('keyup', handleSelection);
      textarea.addEventListener('select', handleSelection);

      textarea.addEventListener('blur', () => {
        adjustHeight();
        if (window.PythonIntellisense && window.PythonIntellisense.sync) {
          window.PythonIntellisense.sync(textarea);
        }
        // Delay hiding slightly so clicking the floating pill registers
        setTimeout(() => {
          if (!document.activeElement.closest('.floating-run-pill')) {
            hideFloatingRunPill();
          }
        }, 300);
      });

    // 3. Output Block (Placed on Next Line - user may give input directly in output section!)
    } else if (block.block_type === 'output') {
      const outputCard = document.createElement('div');

      if (block.is_waiting_input) {
        outputCard.className = 'output-next-line-block output-brown-theme output-waiting-input';
        outputCard.innerHTML = `
          <div class="output-header-strip">
            <span>Program Execution &mdash; Enter Input Below:</span>
            <span class="pulse-tag">Awaiting Input...</span>
          </div>
          <div class="output-text-content">
            <span class="stdout-prefix">${escapeHtml(block.output || '')}</span>
            <span class="inline-input-wrapper">
              <input type="text" class="terminal-inline-input" id="terminalInlineInput" placeholder="Type input here and press Enter...">
              <button class="btn-inline-submit" id="btnSubmitInlineInput">Submit Enter</button>
            </span>
          </div>
        `;

        setTimeout(() => {
          const inputField = outputCard.querySelector('#terminalInlineInput');
          const submitBtn = outputCard.querySelector('#btnSubmitInlineInput');
          if (inputField) {
            inputField.focus();
            const doSubmit = () => {
              const val = inputField.value;
              block.is_waiting_input = false;
              if (activeExecution) {
                activeExecution.inputs.push(val);
                runSelectedCode(activeExecution.inputs);
              }
            };
            if (submitBtn) submitBtn.addEventListener('click', doSubmit);
            inputField.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                doSubmit();
              }
            });
          }
        }, 30);

      } else {
        const isErr = block.output && (block.output.includes('Error') || block.output.includes('Traceback'));
        outputCard.className = `output-next-line-block output-brown-theme ${isErr ? 'has-error' : ''}`;
        outputCard.innerHTML = `
          <div class="output-header-strip">
            <span>Execution Output (Next Line)</span>
            <span>Captured on Ruled Lines</span>
          </div>
          <div class="output-text-content">${escapeHtml(block.output || '')}</div>
        `;
      }

      if (block.output_image) {
        const img = document.createElement('img');
        img.src = block.output_image;
        img.className = 'output-plot-img';
        img.alt = 'Rendered Matplotlib Chart';
        outputCard.appendChild(img);
      }

      contentCol.appendChild(outputCard);
    }

    row.appendChild(marginCol);
    row.appendChild(contentCol);
    return row;
  }

  // Position Floating Run Selected Code Pill directly above the selected code text
  function positionFloatingRunPill(textarea, event) {
    if (!DOM.floatingRunPill) return;

    const rect = textarea.getBoundingClientRect();
    DOM.floatingRunPill.style.top = `${window.scrollY + rect.top - 40}px`;
    DOM.floatingRunPill.style.left = `${window.scrollX + rect.left + 80}px`;
    DOM.floatingRunPill.classList.add('active');
  }

  function hideFloatingRunPill() {
    if (DOM.floatingRunPill) {
      DOM.floatingRunPill.classList.remove('active');
    }
  }

  // Active Interactive Execution Session (when code calls input())
  let activeExecution = null;

  // EXECUTE SELECTED CODE & PLACE OUTPUT ON NEXT LINE
  async function runSelectedCode(inputsToPass = null) {
    if (!State.user) {
      openAuthModal();
      showToast('Notebook is closed. Please sign in or register to open notebook and run code.');
      return;
    }

    const page = State.pages[State.currentPageIndex];
    if (!page) return;

    // Guard: Ensure inputsToPass is strictly an Array, never an Event object
    if (!Array.isArray(inputsToPass)) {
      inputsToPass = null;
    }

    let codeToRun;
    let targetBlockIndex;

    if (inputsToPass !== null && activeExecution) {
      // Continuing an interactive execution session with user input
      codeToRun = activeExecution.code;
      targetBlockIndex = activeExecution.targetBlockIndex;
      activeExecution.inputs = inputsToPass;
    } else {
      // Fresh execution
      codeToRun = State.selectedCode;
      targetBlockIndex = State.selectedBlockIndex;

      // If no text is highlighted with mouse, check if any block has Python code
      if (!codeToRun || !codeToRun.trim()) {
        for (let i = 0; i < page.blocks.length; i++) {
          const b = page.blocks[i];
          if (b.block_type !== 'headline' && b.block_type !== 'output' && b.content.trim()) {
            codeToRun = b.content;
            targetBlockIndex = i;
            break;
          }
        }
      }

      if (!codeToRun || !codeToRun.trim()) {
        showToast('Please select/highlight the code you want to run with your cursor.');
        return;
      }

      activeExecution = {
        code: codeToRun,
        targetBlockIndex: targetBlockIndex,
        inputs: []
      };
    }

    // Visual loading indicator
    DOM.btnRunGlobal.innerHTML = '<span class="spinner"></span> Running...';
    DOM.btnRunGlobal.disabled = true;

    try {
      let result = null;

      // 1. Try Django backend first if available
      try {
        const response = await fetch('/api/run-code/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: activeExecution.code,
            inputs: activeExecution.inputs
          })
        });
        if (response.ok) {
          result = await response.json();
        }
      } catch (backendErr) {
        // Django backend not reachable (e.g. deployed on Netlify)
      }

      // 2. If backend not reached, execute directly in browser via Pyodide
      if (!result) {
        DOM.btnRunGlobal.innerHTML = '<span class="spinner"></span> Executing in Browser...';
        const pyodide = await NetlifyAdapter.getPyodide();
        if (pyodide) {
          try {
            // Set up stdout & stderr capturing
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
            // Run user Python code asynchronously
            await pyodide.runPythonAsync(activeExecution.code);
            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            const stderr = pyodide.runPython("sys.stderr.getvalue()");
            result = {
              success: !stderr,
              stdout: stdout,
              stderr: stderr,
              execution_time: '0.04s (In-Browser Pyodide)'
            };
          } catch (pyErr) {
            result = {
              success: false,
              stderr: String(pyErr),
              execution_time: '0.01s'
            };
          }
        } else {
          result = {
            success: false,
            stderr: 'Python runner is initializing. Please wait a moment and click Run again.',
            execution_time: '0.00s'
          };
        }
      }

      // Check if Python program is requesting input() from the student!
      if (result && result.needs_input) {
        showToast('Please type your input directly in the output section below:');

        const nextIndex = targetBlockIndex + 1;
        let nextBlock = page.blocks[nextIndex];

        if (nextBlock && nextBlock.block_type === 'output') {
          nextBlock.output = result.stdout || result.prompt || '';
          nextBlock.is_waiting_input = true;
        } else {
          const newOutputBlock = {
            id: null,
            order: nextIndex,
            block_type: 'output',
            content: '',
            output: result.stdout || result.prompt || '',
            output_image: '',
            is_selected: false,
            is_waiting_input: true
          };
          page.blocks.splice(nextIndex, 0, newOutputBlock);
        }

        renderCurrentPage();
        return;
      }

      let outputContent = '';
      if (result && result.success) {
        outputContent = result.stdout || '(Executed with no standard output)';
        showToast(`Executed in ${result.execution_time}! Output placed on next line.`);
      } else {
        outputContent = (result && (result.stderr || result.error)) || 'Execution Error';
        showToast('Finished with execution error.');
      }

      // Check if next block is already an output block
      const nextIndex = targetBlockIndex + 1;
      const nextBlock = page.blocks[nextIndex];

      if (nextBlock && nextBlock.block_type === 'output') {
        // Update existing output line
        nextBlock.output = outputContent;
        nextBlock.output_image = (result && result.plot_image) || '';
        nextBlock.is_waiting_input = false;
      } else {
        // Insert NEW output block on the NEXT LINE!
        const newOutputBlock = {
          id: null,
          order: nextIndex,
          block_type: 'output',
          content: '',
          output: outputContent,
          output_image: (result && result.plot_image) || '',
          is_selected: false,
          is_waiting_input: false
        };
        page.blocks.splice(nextIndex, 0, newOutputBlock);
      }

      // Re-render blocks so output shows cleanly on next line
      renderCurrentPage();
      activeExecution = null;

    } catch (err) {
      console.error('Execution error:', err);
      showToast('Error during code execution: ' + (err.message || err));
      activeExecution = null;
    } finally {
      DOM.btnRunGlobal.innerHTML = 'Run Selected Code';
      DOM.btnRunGlobal.disabled = false;
      DOM.btnRunGlobal.classList.remove('pulse-glow');
      hideFloatingRunPill();
    }
  }

  // Adding Blocks (Headline, Theory/Text, Code in text format)
  function addBlock(type) {
    if (!State.user) {
      openAuthModal();
      showToast('Notebook is closed. Please sign in or register to open and write notes.');
      return;
    }

    if (!Array.isArray(State.pages) || State.pages.length === 0) {
      State.pages = [{
        id: null,
        page_number: 1,
        title: 'Page 1',
        blocks: []
      }];
      State.currentPageIndex = 0;
    }

    let page = State.pages[State.currentPageIndex];
    if (!page) {
      page = State.pages[0];
      State.currentPageIndex = 0;
    }
    if (!Array.isArray(page.blocks)) {
      page.blocks = [];
    }

    const newBlock = {
      id: null,
      order: page.blocks.length,
      block_type: type === 'headline' ? 'headline' : (type === 'code' ? 'code' : 'theory'),
      content: '',
      output: '',
      output_image: '',
      is_selected: false
    };

    if (type === 'headline') {
      newBlock.content = 'New Chapter / Topic Headline';
    } else if (type === 'theory') {
      newBlock.content = 'Write theory notes here line by line in Times New Roman...';
    } else if (type === 'code') {
      // Code in green text format directly on notebook lines
      newBlock.content = '# Python Code Example (Select & Run):\n' +
                         'def calculate_power(base, exp):\n' +
                         '    return base ** exp\n\n' +
                         'result = calculate_power(2, 8)\n' +
                         'print("2 raised to power 8 is:", result)';
    }

    page.blocks.push(newBlock);
    renderCurrentPage();

    // Auto-focus new line
    const newIdx = page.blocks.length - 1;
    setTimeout(() => {
      const el = document.querySelector(`[data-block-index="${newIdx}"] textarea, [data-block-index="${newIdx}"] input`);
      if (el) el.focus();
    }, 40);

    const typeLabel = type === 'headline' ? 'Headline' : (type === 'code' ? 'Code line (in Green)' : 'Theory line (Times New Roman)');
    showToast(`Added ${typeLabel} on notebook lines.`);
  }

  // 3D Page Turn Animation
  function turnPage(direction) {
    if (!State.user) {
      openAuthModal();
      showToast('Please sign in or register first. The notebook opens only after login.');
      return;
    }

    const target = State.currentPageIndex + direction;
    if (target < 0 || target >= State.pages.length) {
      showToast(direction > 0 ? 'You are on the last page. Click [+ Page] to add Page 2, 3!' : 'You are on Page 1.');
      return;
    }

    const animClass = direction > 0 ? 'page-anim-forward' : 'page-anim-backward';
    DOM.notebookPage.classList.add(animClass);

    setTimeout(() => {
      State.currentPageIndex = target;
      renderCurrentPage();
      DOM.notebookPage.classList.remove(animClass);
    }, 600);
  }

  function addNewPage() {
    if (!State.user) {
      openAuthModal();
      showToast('Please sign in or register to open notebook and add pages.');
      return;
    }

    const newPageNum = State.pages.length + 1;
    const newPage = {
      id: null,
      page_number: newPageNum,
      title: `Page ${newPageNum}`,
      date_str: `Lesson ${newPageNum}`,
      blocks: [
        {
          id: null,
          order: 0,
          block_type: 'headline',
          content: `Page ${newPageNum} Topic`
        },
        {
          id: null,
          order: 1,
          block_type: 'theory',
          content: 'Continue your preparation and study notes here line by line...'
        }
      ]
    };

    State.pages.push(newPage);
    State.currentPageIndex = State.pages.length - 1;

    DOM.notebookPage.classList.add('page-anim-forward');
    setTimeout(() => {
      renderCurrentPage();
      DOM.notebookPage.classList.remove('page-anim-forward');
      showToast(`Folded to Page ${newPageNum}!`);
    }, 550);
  }

  // Save Notebook to Django Database for Further Preparation
  async function saveNotebookToDjango(silent = false) {
    if (State.isSaving || !State.notebookId) return;

    if (!State.user && !silent) {
      openAuthModal();
      showToast('Please sign in or register to save your notes permanently for further preparation.');
      return;
    }

    State.isSaving = true;

    if (!silent) DOM.btnSaveGlobal.innerHTML = 'Saving...';

    try {
      const payload = {
        title: State.title,
        pages: State.pages
      };

      let savedToServer = false;
      try {
        const res = await fetch(`/api/notebooks/${State.notebookId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) savedToServer = true;
        }
      } catch (err) {
        // LocalStorage fallback
      }

      // Always sync to LocalStorage as well!
      if (State.user) {
        const userNbs = NetlifyAdapter.getUserNotebooks(State.user.username);
        const idx = userNbs.findIndex(n => String(n.id) === String(State.notebookId));
        if (idx >= 0) {
          userNbs[idx].title = State.title;
          userNbs[idx].pages = State.pages;
        } else {
          userNbs.push({ id: State.notebookId, title: State.title, pages: State.pages });
        }
        NetlifyAdapter.saveUserNotebooks(State.user.username, userNbs);
      }

      if (!silent) {
        showToast(State.user 
          ? `Notes saved to your account (${State.user.username})!` 
          : 'Notebook saved!');
      }
    } catch (err) {
      console.error('Error saving notebook:', err);
      if (!silent) showToast('Error saving notebook.');
    } finally {
      State.isSaving = false;
      if (!silent) DOM.btnSaveGlobal.innerHTML = 'Save Notes';
    }
  }

  // AUTHENTICATION MODAL & HANDLING
  function openAuthModal() {
    DOM.authModal.classList.add('active');
  }

  function closeAuthModal() {
    DOM.authModal.classList.remove('active');
  }

  function switchAuthTab(mode) {
    currentAuthMode = mode;
    if (mode === 'login') {
      DOM.tabSignIn.classList.add('active');
      DOM.tabSignUp.classList.remove('active');
      DOM.authEmailGroup.style.display = 'none';
      DOM.authSubmitBtn.textContent = 'Sign In to Save Notes';
    } else {
      DOM.tabSignIn.classList.remove('active');
      DOM.tabSignUp.classList.add('active');
      DOM.authEmailGroup.style.display = 'block';
      DOM.authSubmitBtn.textContent = 'Create Student Account';
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const username = DOM.authUsernameInput.value.trim();
    const password = DOM.authPasswordInput.value.trim();
    const email = DOM.authEmailInput ? DOM.authEmailInput.value.trim() : '';

    if (!username || !password) {
      showToast('Please enter both username and password.');
      return;
    }

    DOM.authSubmitBtn.disabled = true;
    DOM.authSubmitBtn.textContent = 'Authenticating...';

    const url = currentAuthMode === 'login' ? '/api/auth/login/' : '/api/auth/register/';
    const bodyData = { username, password };
    if (currentAuthMode === 'register') bodyData.email = email;

    let authSuccess = false;
    let authData = null;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        authData = await res.json();
        authSuccess = authData.success;
      }
    } catch (err) {
      // LocalStorage Auth fallback for Netlify
    }

    if (!authData) {
      const users = NetlifyAdapter.getUsers();
      if (currentAuthMode === 'register') {
        if (users[username]) {
          showToast('Notice: Username already taken. Please choose another.');
          DOM.authSubmitBtn.disabled = false;
          DOM.authSubmitBtn.textContent = 'Create Student Account';
          return;
        }
        users[username] = { username, password, email };
        NetlifyAdapter.saveUsers(users);
        switchAuthTab('login');
        if (DOM.authUsernameInput) DOM.authUsernameInput.value = username;
        if (DOM.authPasswordInput) DOM.authPasswordInput.value = '';
        showToast(`Account created for "${username}"! Now sign in to open your notebook.`);
        DOM.authSubmitBtn.disabled = false;
        DOM.authSubmitBtn.textContent = 'Sign In to Save Notes';
        return;
      } else {
        if (users[username] && users[username].password === password) {
          authSuccess = true;
          authData = { success: true, username: username, email: users[username].email };
          NetlifyAdapter.setCurrentUser(authData);
        } else {
          showToast('Notice: Invalid username or password.');
          DOM.authSubmitBtn.disabled = false;
          DOM.authSubmitBtn.textContent = 'Sign In to Save Notes';
          return;
        }
      }
    }

    if (authSuccess) {
      if (currentAuthMode === 'register' && authData.registered) {
        switchAuthTab('login');
        if (DOM.authUsernameInput) DOM.authUsernameInput.value = authData.username;
        if (DOM.authPasswordInput) DOM.authPasswordInput.value = '';
        showToast(`Account created for "${authData.username}"! Now sign in to open your notebook.`);
        DOM.authSubmitBtn.disabled = false;
        DOM.authSubmitBtn.textContent = 'Sign In to Save Notes';
        return;
      }
      State.user = { username: authData.username, email: authData.email };
      NetlifyAdapter.setCurrentUser(State.user);
      updateAuthUI(true, authData.username);
      closeAuthModal();
      openNotebook();
      showToast(`Welcome, ${authData.username}! Your personal notebook is now open.`);
      await loadNotebooksList();
    } else {
      showToast(`Notice: ${authData ? authData.message : 'Authentication failed.'}`);
    }

    DOM.authSubmitBtn.disabled = false;
    DOM.authSubmitBtn.textContent = currentAuthMode === 'login' ? 'Sign In to Save Notes' : 'Create Student Account';
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout/', { method: 'POST' });
    } catch (e) {
      // Netlify / Offline
    }
    NetlifyAdapter.setCurrentUser(null);
    State.user = null;
    updateAuthUI(false);
    closeNotebook();
    if (DOM.blocksContainer) DOM.blocksContainer.innerHTML = '';
    if (DOM.notebookSelector) DOM.notebookSelector.innerHTML = '<option value="">Notebook is Closed</option>';
    showToast('Signed out successfully. Notebook is now closed. Sign in or register to open.');
  }

  // Educational Algorithms Library
  async function loadAlgorithms() {
    try {
      const res = await fetch('/api/algorithms/');
      if (res.ok) {
        const data = await res.json();
        if (data.algorithms && data.algorithms.length > 0) {
          State.algorithms = data.algorithms;
          renderAlgorithmsList();
          return;
        }
      }
    } catch (err) {
      // Local algorithms fallback
    }
    State.algorithms = NetlifyAdapter.algorithms;
    renderAlgorithmsList();
  }

  function renderAlgorithmsList() {
    if (!DOM.algorithmsList) return;
    DOM.algorithmsList.innerHTML = '';
    State.algorithms.forEach(alg => {
      const card = document.createElement('div');
      card.className = 'algorithm-card';
      card.innerHTML = `
        <div class="alg-info">
          <h4>${alg.name}</h4>
          <div class="alg-meta">
            <span>Category: ${alg.category}</span>
            <span class="alg-complexity">Time: ${alg.time_complexity}</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.PyNotebook.insertAlgorithm(${alg.id})">
          + Insert into Notes
        </button>
      `;
      DOM.algorithmsList.appendChild(card);
    });
  }

  function insertAlgorithm(algId) {
    if (!State.user) {
      openAuthModal();
      showToast('Please sign in or register to open notebook and insert algorithms.');
      return;
    }

    const alg = State.algorithms.find(a => a.id === algId);
    if (!alg) return;

    const page = State.pages[State.currentPageIndex];
    if (!page) addNewPage();

    // 1. Headline
    page.blocks.push({
      id: null,
      order: page.blocks.length,
      block_type: 'headline',
      content: alg.headline || alg.name
    });

    // 2. Theory in Times New Roman
    page.blocks.push({
      id: null,
      order: page.blocks.length,
      block_type: 'theory',
      content: alg.theory
    });

    // 3. Code in green text format right below theory line
    page.blocks.push({
      id: null,
      order: page.blocks.length,
      block_type: 'code',
      content: `# ${alg.name} Implementation:\n${alg.code}`
    });

    closeAlgorithmsModal();
    renderCurrentPage();
    showToast(`Inserted "${alg.name}"! Select the green code and click [Run Code] to see brown output on the next line.`);
  }

  function openAlgorithmsModal() {
    if (!State.user) {
      openAuthModal();
      showToast('Please sign in or register first. The notebook opens only after login.');
      return;
    }
    DOM.algorithmsModal.classList.add('active');
  }

  function closeAlgorithmsModal() {
    DOM.algorithmsModal.classList.remove('active');
  }

  // Toast Notification
  function showToast(msg) {
    if (!DOM.toast) return;
    DOM.toastText.textContent = msg;
    DOM.toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 3400);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Global methods
  window.PyNotebook = {
    moveBlock: (index, direction) => {
      const page = State.pages && State.pages[State.currentPageIndex];
      if (!page || !page.blocks) return;
      const target = index + direction;
      if (target < 0 || target >= page.blocks.length) return;
      const temp = page.blocks[index];
      page.blocks[index] = page.blocks[target];
      page.blocks[target] = temp;
      renderCurrentPage();
    },
    deleteBlock: (index) => {
      const page = State.pages && State.pages[State.currentPageIndex];
      if (!page || !page.blocks) return;
      page.blocks.splice(index, 1);
      renderCurrentPage();
      showToast('Line deleted.');
    },
    insertAlgorithm: insertAlgorithm
  };

  document.addEventListener('DOMContentLoaded', init);

})();
