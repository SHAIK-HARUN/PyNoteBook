import json
from django.test import TestCase, Client
from django.contrib.auth.models import User
from pybook.models import Notebook, Page, NotebookBlock, Algorithm
from pybook.executor import execute_python_code


class PyNotebookTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_executor_input_needs_input(self):
        code = 'name = input("enter a your name: ")\nprint("Hello", name)'
        res = execute_python_code(code, inputs=[])
        self.assertFalse(res['success'])
        self.assertTrue(res['needs_input'])
        self.assertEqual(res['prompt'], 'enter a your name: ')

    def test_executor_input_with_provided_input(self):
        code = 'name = input("enter a your name: ")\nprint("Hello", name)'
        res = execute_python_code(code, inputs=['PythonStudent'])
        self.assertTrue(res['success'])
        self.assertFalse(res['needs_input'])
        self.assertIn('Hello PythonStudent', res['stdout'])

    def test_executor_error(self):
        code = '1 / 0'
        res = execute_python_code(code)
        self.assertFalse(res['success'])
        self.assertIn('ZeroDivisionError', res['stderr'])

    def test_two_sum_algorithm_execution(self):
        """Verifies the exact Two Sum algorithm runs and returns (1, 3)."""
        code = (
            "def twosum(nums, target):\n"
            "    seen = {}\n"
            "    for i, x in enumerate(nums):\n"
            "        if target - x in seen:\n"
            "            return (seen[target - x], i)\n"
            "        seen[x] = i\n"
            "nums = [2, 5, 3, 4, 8, 1]\n"
            "target = 9\n"
            "print(twosum(nums, target))\n"
        )
        res = execute_python_code(code)
        self.assertTrue(res['success'])
        self.assertIn('(1, 3)', res['stdout'])

    def test_string_methods_execution(self):
        """Verifies string methods like name.upper(), name.title()."""
        code = (
            "name = 'harun'\n"
            "print('Upper:', name.upper())\n"
            "print('Title:', name.title())\n"
        )
        res = execute_python_code(code)
        self.assertTrue(res['success'])
        self.assertIn('Upper: HARUN', res['stdout'])
        self.assertIn('Title: Harun', res['stdout'])

    def test_modules_math_and_statistics(self):
        """Verifies standard modules like math and statistics execute properly."""
        code = (
            "import math\n"
            "import statistics\n"
            "scores = [10, 20, 30, 40]\n"
            "print('Sqrt:', math.isqrt(144))\n"
            "print('Mean:', statistics.mean(scores))\n"
        )
        res = execute_python_code(code)
        self.assertTrue(res['success'])
        self.assertIn('Sqrt: 12', res['stdout'])
        self.assertIn('Mean: 25', res['stdout'])

    def test_index_view(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'PyNotebook Portal')
        self.assertContains(response, 'Python Preparation Notebook')
        self.assertContains(response, 'Designed by SHAIK HARUN')
        self.assertContains(response, 'notebook-book is-closed')
        self.assertContains(response, 'Sign In / Register to Open Notebook')

    def test_auth_me_unauthenticated_and_authenticated(self):
        # 1. Unauthenticated -> authenticated is False
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content)
        self.assertFalse(data['authenticated'])

        # 2. Login -> authenticated is True
        user = User.objects.create_user(username='harun_tester', password='PassWord123!')
        self.client.login(username='harun_tester', password='PassWord123!')
        res_auth = self.client.get('/api/auth/me/')
        data_auth = json.loads(res_auth.content)
        self.assertTrue(data_auth['authenticated'])
        self.assertEqual(data_auth['username'], 'harun_tester')

    def test_algorithms_api(self):
        Algorithm.objects.create(
            name='Test Sort',
            category='Sorting',
            time_complexity='O(n)',
            headline='Test Headline',
            theory='Test Theory',
            code='print("Sorted")'
        )
        response = self.client.get('/api/algorithms/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('algorithms', data)
        self.assertTrue(len(data['algorithms']) >= 1)

    def test_run_code_api(self):
        payload = {'code': 'for i in range(3): print(f"Item {i}")'}
        response = self.client.post(
            '/api/run-code/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertIn('Item 0', data['stdout'])
        self.assertIn('Item 1', data['stdout'])
        self.assertIn('Item 2', data['stdout'])

    def test_run_code_api_interactive_input(self):
        code = 'name = input("enter a your name: ")\nprint(f"Welcome, {name}!")'
        payload1 = {'code': code, 'inputs': []}
        res1 = self.client.post('/api/run-code/', data=json.dumps(payload1), content_type='application/json')
        self.assertEqual(res1.status_code, 200)
        data1 = json.loads(res1.content)
        self.assertTrue(data1['needs_input'])
        self.assertEqual(data1['prompt'], 'enter a your name: ')

        # Event dict like {'isTrusted': True} is rejected and still returns needs_input: True
        payload_event = {'code': code, 'inputs': {'isTrusted': True}}
        res_event = self.client.post('/api/run-code/', data=json.dumps(payload_event), content_type='application/json')
        data_event = json.loads(res_event.content)
        self.assertTrue(data_event['needs_input'])

        # Valid input provided -> success
        payload2 = {'code': code, 'inputs': ['Alex']}
        res2 = self.client.post('/api/run-code/', data=json.dumps(payload2), content_type='application/json')
        self.assertEqual(res2.status_code, 200)
        data2 = json.loads(res2.content)
        self.assertTrue(data2['success'])
        self.assertFalse(data2['needs_input'])
        self.assertIn('Welcome, Alex!', data2['stdout'])

    def test_user_registration_login_and_notes_persistence(self):
        """
        User registers with credentials -> logs in -> prepares and saves notes ->
        logs out -> logs in again with same credentials -> prepared notes are preserved!
        """
        # 1. Register user
        reg_payload = {'username': 'shaik_harun', 'password': 'HarunPassword123!', 'email': 'harun@example.com'}
        reg_res = self.client.post('/api/auth/register/', data=json.dumps(reg_payload), content_type='application/json')
        self.assertEqual(reg_res.status_code, 200)
        reg_data = json.loads(reg_res.content)
        self.assertTrue(reg_data['success'])
        # Registration does NOT auto-login; user must sign in explicitly.
        self.assertFalse(reg_data.get('email'))  # no session opened yet

        # 1b. Login after registration (as the portal requires)
        login_after_reg = self.client.post('/api/auth/login/', data=json.dumps(
            {'username': 'shaik_harun', 'password': 'HarunPassword123!'}
        ), content_type='application/json')
        self.assertEqual(login_after_reg.status_code, 200)
        self.assertTrue(json.loads(login_after_reg.content)['success'])

        # 2. Prepare notes in notebook
        nb_res = self.client.get('/api/notebooks/')
        nb_data = json.loads(nb_res.content)
        self.assertTrue(len(nb_data['notebooks']) >= 1)
        nb_id = nb_data['notebooks'][0]['id']

        # Save prepared notes
        save_payload = {
            'title': 'Harun Algorithm Practice Notes',
            'pages': [
                {
                    'id': None,
                    'title': 'Two Sum & Algorithms',
                    'blocks': [
                        {'block_type': 'headline', 'content': 'Two Sum Master Notes'},
                        {'block_type': 'theory', 'content': 'Two Sum solves in O(n) using a hash map seen dictionary.'},
                        {'block_type': 'theory', 'content': 'def twosum(nums, target): return (1, 3)'}
                    ]
                }
            ]
        }
        save_res = self.client.post(f'/api/notebooks/{nb_id}/', data=json.dumps(save_payload), content_type='application/json')
        self.assertEqual(save_res.status_code, 200)
        self.assertTrue(json.loads(save_res.content)['success'])

        # 3. Log out
        self.client.post('/api/auth/logout/')

        # 4. Log in again with the EXACT SAME credentials
        login_payload = {'username': 'shaik_harun', 'password': 'HarunPassword123!'}
        login_res = self.client.post('/api/auth/login/', data=json.dumps(login_payload), content_type='application/json')
        self.assertEqual(login_res.status_code, 200)
        login_data = json.loads(login_res.content)
        self.assertTrue(login_data['success'])

        # 5. Fetch notes -> prepared notes are preserved!
        user_nbs_res = self.client.get('/api/notebooks/')
        user_nbs = json.loads(user_nbs_res.content)['notebooks']
        self.assertTrue(len(user_nbs) >= 1)
        self.assertEqual(user_nbs[0]['title'], 'Harun Algorithm Practice Notes')

        # Check detail
        detail_res = self.client.get(f"/api/notebooks/{user_nbs[0]['id']}/")
        detail_data = json.loads(detail_res.content)
        self.assertEqual(detail_data['title'], 'Harun Algorithm Practice Notes')
        self.assertEqual(detail_data['pages'][0]['title'], 'Two Sum & Algorithms')
        self.assertEqual(detail_data['pages'][0]['blocks'][0]['content'], 'Two Sum Master Notes')

    def test_multiple_python_practice_programs(self):
        """Tests multiple standard practice programs (palindrome, dict comprehension, factorial, lambda)."""
        programs = [
            ("s = 'racecar'\nprint('Palindrome:', s == s[::-1])", "Palindrome: True"),
            ("nums = [1, 2, 3, 4]\nsq = {x: x**2 for x in nums}\nprint(sq)", "{1: 1, 2: 4, 3: 9, 4: 16}"),
            ("fact = lambda n: 1 if n <= 1 else n * fact(n-1)\nprint('Factorial 5:', fact(5))", "Factorial 5: 120"),
            ("try:\n    res = int('not_a_number')\nexcept ValueError:\n    res = 'Caught ValueError'\nprint(res)", "Caught ValueError"),
        ]
        for code, expected_out in programs:
            res = execute_python_code(code)
            self.assertTrue(res['success'], f"Failed for code:\n{code}")
            self.assertIn(expected_out, res['stdout'])

    def test_notebook_block_code_and_output_model_validation(self):
        """Verifies NotebookBlock with block_type='code' and 'output' saves and validates properly."""
        nb = Notebook.objects.create(title='Model Test')
        p = Page.objects.create(notebook=nb, page_number=1)
        b_code = NotebookBlock.objects.create(page=p, order=0, block_type='code', content='print("green code")')
        b_output = NotebookBlock.objects.create(page=p, order=1, block_type='output', output='green code')
        self.assertEqual(b_code.block_type, 'code')
        self.assertEqual(b_output.block_type, 'output')
        b_code.full_clean()
        b_output.full_clean()
