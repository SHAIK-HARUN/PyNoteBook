import sys
import io
import time
import base64
import traceback
import builtins


class NeedsInput(Exception):
    """Raised when Python code requests input() but no input is available in the queue."""
    def __init__(self, prompt: str):
        self.prompt = prompt


def execute_python_code(code_str: str, inputs: list = None, timeout_sec: int = 10) -> dict:
    """
    Executes Python code safely with interactive input() support, capturing stdout, stderr,
    execution time, and any generated matplotlib plots as base64 images.
    """
    start_time = time.time()
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()

    old_stdout = sys.stdout
    old_stderr = sys.stderr

    plot_base64 = None

    if inputs is None or not isinstance(inputs, list):
        inputs = []
    else:
        # Sanitize: only accept valid string/scalar inputs (ignore serialized event dicts)
        inputs = [str(x) for x in inputs if isinstance(x, (str, int, float))]
    input_queue = list(inputs)

    def custom_input(prompt: str = "") -> str:
        # Write prompt to stdout so it appears in the output sequence
        if prompt:
            sys.stdout.write(str(prompt))
            sys.stdout.flush()

        if input_queue:
            val = str(input_queue.pop(0))
            # Echo input value to stdout followed by newline, matching terminal behavior
            sys.stdout.write(val + "\n")
            sys.stdout.flush()
            return val
        else:
            # Need input from user!
            raise NeedsInput(prompt=str(prompt))

    try:
        # Prepare environment
        sys.stdout = stdout_capture
        sys.stderr = stderr_capture

        # Configure matplotlib for non-interactive backend
        try:
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            plt.clf()
            plt.close('all')
        except ImportError:
            plt = None

        # Custom builtins with our custom interactive input()
        custom_builtins = dict(builtins.__dict__)
        custom_builtins['input'] = custom_input

        # Custom global scope
        safe_globals = {
            '__name__': '__main__',
            '__doc__': None,
            '__builtins__': custom_builtins,
            'input': custom_input,
        }

        # Execute code
        exec(code_str, safe_globals)

        # Check if any matplotlib figure was created
        if plt is not None and plt.get_fignums():
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
            buf.seek(0)
            plot_base64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')
            plt.close('all')

        execution_time = round(time.time() - start_time, 3)
        return {
            'success': True,
            'needs_input': False,
            'prompt': '',
            'stdout': stdout_capture.getvalue(),
            'stderr': stderr_capture.getvalue(),
            'plot_image': plot_base64,
            'execution_time': f"{execution_time}s",
            'error': None
        }

    except NeedsInput as ni:
        execution_time = round(time.time() - start_time, 3)
        return {
            'success': False,
            'needs_input': True,
            'prompt': ni.prompt,
            'stdout': stdout_capture.getvalue(),
            'stderr': '',
            'plot_image': None,
            'execution_time': f"{execution_time}s",
            'error': None
        }

    except Exception as exc:
        execution_time = round(time.time() - start_time, 3)
        err_msg = traceback.format_exc()
        existing_stderr = stderr_capture.getvalue()
        full_stderr = f"{existing_stderr}\n{err_msg}".strip() if existing_stderr else err_msg
        return {
            'success': False,
            'needs_input': False,
            'prompt': '',
            'stdout': stdout_capture.getvalue(),
            'stderr': full_stderr,
            'plot_image': None,
            'execution_time': f"{execution_time}s",
            'error': str(exc)
        }
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
