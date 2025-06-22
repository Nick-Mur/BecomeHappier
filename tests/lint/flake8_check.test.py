# Тест на отсутствие ошибок линтера для views.py и models.py
# Используется flake8
import subprocess

def test_flake8_clean():
    result = subprocess.run([
        'flake8',
        'backend/api/views.py',
        'backend/api/models.py'
    ], capture_output=True, text=True)
    assert result.returncode == 0, f"Flake8 errors:\n{result.stdout}\n{result.stderr}" 