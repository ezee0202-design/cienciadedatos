import json
from pathlib import Path
nb = json.loads(Path('e:/TPO - CIENCIA DE DATOS/APP 2/notebooks/data_analysis.ipynb').read_text(encoding='utf-8'))
first_code = [c for c in nb['cells'] if c['cell_type']=='code'][0]['source']
s = '\n'.join(first_code)
print(s[:1200])
compile(s,'<test>','exec')
print('\nCompile OK')
