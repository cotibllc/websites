import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '—' in content:
        # Replace spaced em-dash
        content = content.replace(' — ', ' – ')
        # Replace unspaced em-dash with spaced en-dash
        content = content.replace('—', ' – ')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for ext in ('**/*.njk', '**/*.js'):
    for filepath in glob.glob(ext, recursive=True):
        if 'node_modules' not in filepath:
            process_file(filepath)
