import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Notebook, Page, NotebookBlock, Algorithm
from .executor import execute_python_code


@ensure_csrf_cookie
def index(request):
    """Renders the main interactive 3D notebook application."""
    return render(request, 'pybook/index.html')


@csrf_exempt
def api_run_code(request):
    """
    Executes selected Python code (received as plain text).
    Returns stdout, stderr, execution time, and any matplotlib plot images.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        code_str = data.get('code', '')
        raw_inputs = data.get('inputs', [])
        # Strictly sanitize inputs so only string/scalar values are accepted
        if isinstance(raw_inputs, list):
            inputs = [str(x) for x in raw_inputs if isinstance(x, (str, int, float))]
        else:
            inputs = []

        if not code_str.strip():
            return JsonResponse({'success': False, 'stderr': 'No code selected to execute.'})

        result = execute_python_code(code_str, inputs=inputs)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'success': False, 'stderr': f'Server error: {str(e)}'}, status=500)


def api_algorithms(request):
    """Returns the list of educational Python algorithms."""
    algorithms = Algorithm.objects.all().order_by('category', 'name')
    data = []
    for alg in algorithms:
        data.append({
            'id': alg.id,
            'name': alg.name,
            'category': alg.category,
            'difficulty': alg.difficulty,
            'time_complexity': alg.time_complexity,
            'space_complexity': alg.space_complexity,
            'headline': alg.headline,
            'theory': alg.theory,
            'code': alg.code,
            'sample_output': alg.sample_output,
        })
    return JsonResponse({'algorithms': data})


@csrf_exempt
def api_notebooks(request):
    """Lists notebooks or creates a new one for authenticated student."""
    if request.method == 'GET':
        if request.user.is_authenticated:
            notebooks = Notebook.objects.filter(user=request.user)
            if not notebooks.exists():
                # Create a starter notebook for this logged in user
                nb = Notebook.objects.create(
                    user=request.user,
                    title=f"{request.user.username}'s Python Notes",
                    description='Student notes and practice workbook.',
                    cover_color='navy'
                )
                p1 = Page.objects.create(notebook=nb, page_number=1, title='Study Notes 1', date_str='Day 1')
                NotebookBlock.objects.create(
                    page=p1, order=0, block_type='headline',
                    content='Python Notes & Practice Workbook'
                )
                NotebookBlock.objects.create(
                    page=p1, order=1, block_type='theory',
                    content='Python is an interpreted, high-level, general-purpose programming language.\n'
                            'Select any code text written on these lines and click [Run Code] to execute it.\n'
                            'The output will automatically appear on the next line below.'
                )
                NotebookBlock.objects.create(
                    page=p1, order=2, block_type='code',
                    content='# Example Code (Select & Run):\n'
                            'radius = 5\n'
                            'area = 3.14159 * radius ** 2\n'
                            'print(f"Radius: {radius} -> Circle Area: {area:.2f}")'
                )
                notebooks = Notebook.objects.filter(id=nb.id)
        else:
            notebooks = Notebook.objects.filter(user__isnull=True)[:5]
            if not notebooks.exists():
                nb = Notebook.objects.create(
                    user=None,
                    title='Python Mastery Notebook',
                    description='Interactive notebook for theory and code in text format.',
                    cover_color='navy'
                )
                p1 = Page.objects.create(notebook=nb, page_number=1, title='Study Notes 1', date_str='Day 1')
                NotebookBlock.objects.create(
                    page=p1, order=0, block_type='headline',
                    content='Python Ruled Notebook'
                )
                NotebookBlock.objects.create(
                    page=p1, order=1, block_type='theory',
                    content='Theory notes are formatted in Times New Roman font.\n'
                            'Write theory and code directly in text format on the ruled lines.\n'
                            'Highlight/select the code with your cursor, click [Run Code], and the output appears on the next line!'
                )
                NotebookBlock.objects.create(
                    page=p1, order=2, block_type='code',
                    content='# Python Code Example (Select & Run):\n'
                            'numbers = [1, 2, 3, 4, 5]\n'
                            'squares = [x**2 for x in numbers]\n'
                            'print("Squared numbers:", squares)'
                )
                notebooks = Notebook.objects.filter(id=nb.id)

        data = [{
            'id': nb.id,
            'title': nb.title,
            'description': nb.description,
            'cover_color': nb.cover_color,
            'pages_count': nb.pages.count(),
            'updated_at': nb.updated_at.strftime('%Y-%m-%d %H:%M')
        } for nb in notebooks]
        return JsonResponse({'notebooks': data})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            title = data.get('title', 'New Study Notebook')
            cover_color = data.get('cover_color', 'navy')
            user = request.user if request.user.is_authenticated else None
            nb = Notebook.objects.create(user=user, title=title, cover_color=cover_color)
            p1 = Page.objects.create(notebook=nb, page_number=1, title='Page 1')
            NotebookBlock.objects.create(page=p1, order=0, block_type='headline', content=title)
            NotebookBlock.objects.create(page=p1, order=1, block_type='theory', content='Write notes here...')
            return JsonResponse({'id': nb.id, 'title': nb.title, 'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def api_notebook_detail(request, notebook_id):
    """Retrieves full notebook content or saves the entire notebook with all pages & blocks."""
    notebook = get_object_or_404(Notebook, id=notebook_id)

    if request.method == 'GET':
        pages_data = []
        for p in notebook.pages.all().order_by('page_number'):
            blocks_data = []
            for b in p.blocks.all().order_by('order', 'id'):
                blocks_data.append({
                    'id': b.id,
                    'order': b.order,
                    'block_type': b.block_type,
                    'content': b.content,
                    'output': b.output,
                    'output_image': b.output_image,
                    'is_selected': b.is_selected
                })
            pages_data.append({
                'id': p.id,
                'page_number': p.page_number,
                'title': p.title,
                'date_str': p.date_str,
                'blocks': blocks_data
            })

        return JsonResponse({
            'id': notebook.id,
            'title': notebook.title,
            'description': notebook.description,
            'cover_color': notebook.cover_color,
            'pages': pages_data
        })

    elif request.method in ['POST', 'PUT']:
        try:
            data = json.loads(request.body.decode('utf-8'))
            notebook.title = data.get('title', notebook.title)
            notebook.description = data.get('description', notebook.description)
            notebook.cover_color = data.get('cover_color', notebook.cover_color)

            # Bind to user if logged in so notes are saved for future preparation
            if request.user.is_authenticated and (notebook.user is None or notebook.user == request.user):
                notebook.user = request.user

            notebook.save()

            incoming_pages = data.get('pages', [])
            if incoming_pages:
                current_page_ids = []
                for p_idx, p_data in enumerate(incoming_pages):
                    p_id = p_data.get('id')
                    p_title = p_data.get('title', f"Page {p_idx + 1}")
                    p_date = p_data.get('date_str', '')

                    if p_id and Page.objects.filter(id=p_id, notebook=notebook).exists():
                        page = Page.objects.get(id=p_id, notebook=notebook)
                        page.page_number = p_idx + 1
                        page.title = p_title
                        page.date_str = p_date
                        page.save()
                    else:
                        page = Page.objects.create(
                            notebook=notebook,
                            page_number=p_idx + 1,
                            title=p_title,
                            date_str=p_date
                        )
                    current_page_ids.append(page.id)

                    incoming_blocks = p_data.get('blocks', [])
                    current_block_ids = []
                    for b_idx, b_data in enumerate(incoming_blocks):
                        b_id = b_data.get('id')
                        b_type = b_data.get('block_type', 'theory')
                        b_content = b_data.get('content', '')
                        b_output = b_data.get('output', '')
                        b_image = b_data.get('output_image', '')
                        b_sel = b_data.get('is_selected', False)

                        if b_id and NotebookBlock.objects.filter(id=b_id, page=page).exists():
                            block = NotebookBlock.objects.get(id=b_id, page=page)
                            block.order = b_idx
                            block.block_type = b_type
                            block.content = b_content
                            block.output = b_output
                            block.output_image = b_image
                            block.is_selected = b_sel
                            block.save()
                        else:
                            block = NotebookBlock.objects.create(
                                page=page,
                                order=b_idx,
                                block_type=b_type,
                                content=b_content,
                                output=b_output,
                                output_image=b_image,
                                is_selected=b_sel
                            )
                        current_block_ids.append(block.id)

                    page.blocks.exclude(id__in=current_block_ids).delete()

                notebook.pages.exclude(id__in=current_page_ids).delete()

            return JsonResponse({'success': True, 'message': 'Notebook saved successfully for further preparation!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def api_auth_login(request):
    """User Sign In endpoint."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email,
                'message': f'Welcome back, {user.username}!'
            })
        return JsonResponse({'success': False, 'message': 'Invalid username or password.'}, status=401)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@csrf_exempt
def api_auth_register(request):
    """User Sign Up endpoint."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        email = data.get('email', '').strip()
        if not username or not password:
            return JsonResponse({'success': False, 'message': 'Username and password are required.'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'Username is already taken. Please choose another.'}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        # Do NOT auto-login after register — user must explicitly sign in to open notebook
        return JsonResponse({
            'success': True,
            'registered': True,
            'username': user.username,
            'message': 'Account created successfully! Please sign in to open your notebook.'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@csrf_exempt
def api_auth_logout(request):
    """User Log Out endpoint."""
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out.'})


def api_auth_me(request):
    """Checks current session authentication state."""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'username': request.user.username,
            'email': request.user.email
        })
    return JsonResponse({'authenticated': False})
