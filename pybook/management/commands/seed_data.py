from django.core.management.base import BaseCommand
from pybook.models import Algorithm, Notebook, Page, NotebookBlock


class Command(BaseCommand):
    help = 'Seeds educational Python algorithms and a starter notebook'

    def handle(self, *args, **options):
        # Educational algorithms
        algorithms_data = [
            {
                'name': 'Binary Search Algorithm',
                'category': 'Searching',
                'difficulty': 'Beginner',
                'time_complexity': 'O(log n)',
                'space_complexity': 'O(1)',
                'headline': 'Binary Search in Sorted Array',
                'theory': (
                    "Binary Search is an efficient algorithm for finding an item from a sorted list.\n"
                    "It works by repeatedly dividing the search interval in half.\n"
                    "1. Compare the target value to the middle element.\n"
                    "2. If equal, search is complete.\n"
                    "3. If target is less than middle, narrow interval to lower half.\n"
                    "4. Otherwise, narrow to upper half."
                ),
                'code': (
                    "def binary_search(arr, target):\n"
                    "    low = 0\n"
                    "    high = len(arr) - 1\n"
                    "    steps = 0\n"
                    "    while low <= high:\n"
                    "        steps += 1\n"
                    "        mid = (low + high) // 2\n"
                    "        print(f\"Step {steps}: checking index {mid} -> value {arr[mid]}\")\n"
                    "        if arr[mid] == target:\n"
                    "            return mid, steps\n"
                    "        elif arr[mid] < target:\n"
                    "            low = mid + 1\n"
                    "        else:\n"
                    "            high = mid - 1\n"
                    "    return -1, steps\n\n"
                    "numbers = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]\n"
                    "target = 23\n"
                    "print(f\"Searching for {target} in: {numbers}\")\n"
                    "idx, count = binary_search(numbers, target)\n"
                    "print(f\"Result: Found at index {idx} in only {count} steps!\")"
                ),
                'sample_output': 'Searching for 23 in: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91]\nStep 1: checking index 5 -> value 23\nResult: Found at index 5 in only 1 steps!'
            },
            {
                'name': 'Bubble Sort Algorithm',
                'category': 'Sorting',
                'difficulty': 'Beginner',
                'time_complexity': 'O(n²)',
                'space_complexity': 'O(1)',
                'headline': 'Bubble Sort with Pass Visualization',
                'theory': (
                    "Bubble Sort repeatedly steps through the list, compares adjacent elements\n"
                    "and swaps them if they are in the wrong order.\n"
                    "The pass through the list is repeated until the list is completely sorted.\n"
                    "Best Case: O(n) with swap flag optimization."
                ),
                'code': (
                    "def bubble_sort(arr):\n"
                    "    a = arr.copy()\n"
                    "    n = len(a)\n"
                    "    print(\"Initial Array:\", a)\n"
                    "    for i in range(n):\n"
                    "        swapped = False\n"
                    "        for j in range(0, n - i - 1):\n"
                    "            if a[j] > a[j + 1]:\n"
                    "                a[j], a[j + 1] = a[j + 1], a[j]\n"
                    "                swapped = True\n"
                    "        print(f\"Pass {i + 1}: {a}\")\n"
                    "        if not swapped:\n"
                    "            break\n"
                    "    return a\n\n"
                    "data = [64, 34, 25, 12, 22, 11, 90]\n"
                    "sorted_data = bubble_sort(data)\n"
                    "print(\"Final Sorted Array:\", sorted_data)"
                ),
                'sample_output': 'Initial Array: [64, 34, 25, 12, 22, 11, 90]\nPass 1: [34, 25, 12, 22, 11, 64, 90] ...\nFinal Sorted Array: [11, 12, 22, 25, 34, 64, 90]'
            },
            {
                'name': 'Fibonacci Dynamic Programming',
                'category': 'Recursion & DP',
                'difficulty': 'Intermediate',
                'time_complexity': 'O(n)',
                'space_complexity': 'O(n)',
                'headline': 'Fibonacci with Memoization (Top-Down DP)',
                'theory': (
                    "Calculating Fibonacci recursively takes O(2ⁿ) exponential time.\n"
                    "By storing previously computed values (Memoization), we reduce complexity to linear O(n).\n"
                    "Formula: F(n) = F(n-1) + F(n-2) with F(0)=0 and F(1)=1."
                ),
                'code': (
                    "def fib_memo(n, memo={}):\n"
                    "    if n in memo:\n"
                    "        return memo[n]\n"
                    "    if n <= 0:\n"
                    "        return 0\n"
                    "    elif n == 1:\n"
                    "        return 1\n"
                    "    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)\n"
                    "    return memo[n]\n\n"
                    "terms = [0, 1, 5, 10, 20, 30, 40]\n"
                    "print(\"Fibonacci Numbers Calculated via Memoization:\")\n"
                    "for t in terms:\n"
                    "    print(f\"F({t:2d}) = {fib_memo(t):,}\")"
                ),
                'sample_output': 'F( 0) = 0\nF( 1) = 1\nF( 5) = 5\nF(10) = 55\nF(20) = 6,765\nF(30) = 832,040\nF(40) = 102,334,155'
            },
            {
                'name': 'Matplotlib Sine & Cosine Visualization',
                'category': 'Data Science & Plots',
                'difficulty': 'Intermediate',
                'time_complexity': 'O(n)',
                'space_complexity': 'O(n)',
                'headline': 'Interactive Signal Plot with Matplotlib & NumPy',
                'theory': (
                    "Matplotlib and NumPy allow seamless scientific computing and visualization.\n"
                    "Here we generate 500 samples of Sine and Cosine waves with styling\n"
                    "and plot them directly inside our ruled notebook page."
                ),
                'code': (
                    "import numpy as np\n"
                    "import matplotlib.pyplot as plt\n\n"
                    "x = np.linspace(0, 4 * np.pi, 300)\n"
                    "y_sin = np.sin(x)\n"
                    "y_cos = np.cos(x)\n\n"
                    "plt.figure(figsize=(8, 3.5), facecolor='#fbfbf8')\n"
                    "plt.plot(x, y_sin, label='Sine Wave sin(x)', color='#2563eb', linewidth=2.5)\n"
                    "plt.plot(x, y_cos, label='Cosine Wave cos(x)', color='#e11d48', linewidth=2, linestyle='--')\n"
                    "plt.title('Harmonic Oscillations in Python', fontsize=12, fontweight='bold', pad=10)\n"
                    "plt.xlabel('Angle (Radians)', fontsize=10)\n"
                    "plt.ylabel('Amplitude', fontsize=10)\n"
                    "plt.grid(True, linestyle=':', alpha=0.6)\n"
                    "plt.legend(loc='upper right')\n"
                    "plt.tight_layout()\n"
                    "plt.show()\n"
                    "print(\"Harmonic plot rendered successfully on notebook paper!\")"
                ),
                'sample_output': 'Harmonic plot rendered successfully on notebook paper!'
            },
            {
                'name': 'Stack Data Structure (LIFO)',
                'category': 'Data Structures',
                'difficulty': 'Beginner',
                'time_complexity': 'O(1) push/pop',
                'space_complexity': 'O(n)',
                'headline': 'Custom Stack Class with Underflow/Overflow Protection',
                'theory': (
                    "A Stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle.\n"
                    "Operations:\n"
                    "- push(item): Inserts an item to the top.\n"
                    "- pop(): Removes and returns the top item.\n"
                    "- peek(): Views top item without removing."
                ),
                'code': (
                    "class Stack:\n"
                    "    def __init__(self, capacity=10):\n"
                    "        self.capacity = capacity\n"
                    "        self.items = []\n\n"
                    "    def push(self, item):\n"
                    "        if len(self.items) >= self.capacity:\n"
                    "            raise OverflowError(\"Stack overflow!\")\n"
                    "        self.items.append(item)\n"
                    "        print(f\"Pushed: {item} | Stack: {self.items}\")\n\n"
                    "    def pop(self):\n"
                    "        if not self.items:\n"
                    "            raise IndexError(\"Stack underflow!\")\n"
                    "        popped = self.items.pop()\n"
                    "        print(f\"Popped: {popped} | Remaining: {self.items}\")\n"
                    "        return popped\n\n"
                    "s = Stack()\n"
                    "s.push('Python')\n"
                    "s.push('Django')\n"
                    "s.push('Algorithms')\n"
                    "s.pop()\n"
                    "s.push('Web Development')"
                ),
                'sample_output': 'Pushed: Python | Stack: [\'Python\']\nPushed: Django | Stack: [\'Python\', \'Django\']\nPushed: Algorithms | Stack: [\'Python\', \'Django\', \'Algorithms\']\nPopped: Algorithms | Remaining: [\'Python\', \'Django\']\nPushed: Web Development'
            }
        ]

        for item in algorithms_data:
            Algorithm.objects.update_or_create(
                name=item['name'],
                defaults=item
            )
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(algorithms_data)} algorithms.'))

        # Check starter notebook
        if not Notebook.objects.exists():
            nb = Notebook.objects.create(
                title='Python Preparation Notebook',
                description='Interactive ruled notebook with Times New Roman theory and text-format code execution.',
                cover_color='navy'
            )
            p1 = Page.objects.create(notebook=nb, page_number=1, title='Page 1 - Study Notes', date_str='Lesson 1')
            NotebookBlock.objects.create(
                page=p1, order=0, block_type='headline',
                content='Python Preparation Notes & Algorithms'
            )
            NotebookBlock.objects.create(
                page=p1, order=1, block_type='theory',
                content=(
                    "Theory notes are written line by line in Times New Roman on the ruled notebook lines.\n"
                    "There is no separate container box for code — code is written in plain text format right on the lines.\n"
                    "Simply select or highlight any code text with your cursor and click [Run Selected Code].\n"
                    "The execution output will automatically appear on the next line below!"
                )
            )
            NotebookBlock.objects.create(
                page=p1, order=2, block_type='code',
                content=(
                    "# Python Code Example (Select & Run):\n"
                    "def calculate_stats(scores):\n"
                    "    total = sum(scores)\n"
                    "    avg = total / len(scores)\n"
                    "    return total, avg\n\n"
                    "test_scores = [88, 92, 79, 95, 85]\n"
                    "total, average = calculate_stats(test_scores)\n"
                    "print(f\"Scores: {test_scores}\")\n"
                    "print(f\"Total: {total} | Average: {average:.2f}%\")"
                )
            )
            NotebookBlock.objects.create(
                page=p1, order=3, block_type='output',
                content='',
                output='Scores: [88, 92, 79, 95, 85]\nTotal: 439 | Average: 87.80%'
            )
            self.stdout.write(self.style.SUCCESS('Created default starter notebook.'))
