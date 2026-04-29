#!/usr/bin/env python3
"""
Div Tag Counter and Validator
Counts <div> and </div> tags in TypeScript/TSX/JS/JSX files
and validates that they match properly.
Also runs TypeScript compiler to check for unclosed tag errors.
"""

import re
import os
import subprocess
import sys
from pathlib import Path

# File extensions to scan
TARGET_EXTENSIONS = {'.tsx', '.ts', '.jsx', '.js', '.html'}

def find_relevant_files(root_dir):
    """Find all TypeScript/JavaScript/HTML files in the project."""
    relevant_files = []
    for ext in TARGET_EXTENSIONS:
        relevant_files.extend(Path(root_dir).rglob(f'*{ext}'))
    # Filter out node_modules and hidden directories
    relevant_files = [
        f for f in relevant_files
        if 'node_modules' not in str(f) and 
           not any(part.startswith('.') for part in f.parts)
    ]
    return sorted(relevant_files)

def count_div_tags(file_path):
    """Count opening and closing div tags in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  ⚠️  Error reading {file_path}: {e}")
        return 0, 0, []
    
    # Find all <div> opening tags (but not </div>)
    # Match <div followed by space, >, or / (for self-closing)
    opening_pattern = r'<div(?!\s*/>)\b'
    opening_matches = list(re.finditer(opening_pattern, content, re.IGNORECASE))
    
    # Find all </div> closing tags
    closing_pattern = r'</div\s*>'
    closing_matches = list(re.finditer(closing_pattern, content, re.IGNORECASE))
    
    # Find self-closing divs <div/>
    self_closing_pattern = r'<div\s*/>'
    self_closing_matches = list(re.finditer(self_closing_pattern, content, re.IGNORECASE))
    
    opening_count = len(opening_matches) - len(self_closing_matches)
    closing_count = len(closing_matches)
    
    # Get line numbers for matches
    lines = content.split('\n')
    match_lines = []
    
    for match in opening_matches:
        line_num = content[:match.start()].count('\n') + 1
        if match.group(0) != '<div/>':
            match_lines.append((line_num, 'OPEN', match.group(0)))
    
    for match in closing_matches:
        line_num = content[:match.start()].count('\n') + 1
        match_lines.append((line_num, 'CLOSE', match.group(0)))
    
    return opening_count, closing_count, sorted(match_lines)

def validate_div_balance(root_dir):
    """Validate div tag balance across all files."""
    print("=" * 70)
    print("DIV TAG COUNTER AND VALIDATOR")
    print("=" * 70)
    print(f"\nScanning directory: {root_dir}\n")
    
    files = find_relevant_files(root_dir)
    
    print(f"Found {len(files)} relevant files to scan\n")
    print("-" * 70)
    
    total_open = 0
    total_close = 0
    file_results = []
    
    for file_path in files:
        rel_path = file_path.relative_to(root_dir)
        open_count, close_count, match_lines = count_div_tags(file_path)
        total_open += open_count
        total_close += close_count
        
        status = "✅ BALANCED" if open_count == close_count else "❌ MISMATCH"
        file_results.append({
            'path': str(rel_path),
            'open': open_count,
            'close': close_count,
            'status': status,
            'matches': match_lines
        })
    
    # Print per-file results
    for result in file_results:
        print(f"\n  {result['path']}")
        print(f"    <div> tags: {result['open']}")
        print(f"    </div> tags: {result['close']}")
        print(f"    Status: {result['status']}")
        
        if result['matches'] and len(result['matches']) <= 20:
            print(f"    Tag locations:")
            for line_num, tag_type, tag_text in result['matches']:
                indicator = ">>>" if tag_type == 'OPEN' else "<<<"
                print(f"      Line {line_num:4d} {indicator} {tag_text}")
    
    # Print summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"\n  Total <div> tags:     {total_open}")
    print(f"  Total </div> tags:    {total_close}")
    
    balanced_files = sum(1 for r in file_results if r['status'] == '✅ BALANCED')
    unbalanced_files = sum(1 for r in file_results if r['status'] == '❌ MISMATCH')
    
    print(f"\n  Balanced files:       {balanced_files}")
    print(f"  Unbalanced files:     {unbalanced_files}")
    
    if total_open == total_close:
        print(f"\n  ✅ OVERALL: All div tags are balanced!")
    else:
        diff = abs(total_open - total_close)
        tag_type = "opening" if total_open > total_close else "closing"
        print(f"\n  ❌ OVERALL: MISMATCH! {diff} unmatched {tag_type} div tag(s)")
    
    # List unbalanced files with detailed tag info
    if unbalanced_files > 0:
        print(f"\n  Unbalanced files:")
        for result in file_results:
            if result['status'] == '❌ MISMATCH':
                diff = result['open'] - result['close']
                print(f"\n    - {result['path']} (diff: {diff:+d})")
                print(f"      <div>: {result['open']}, </div>: {result['close']}")
            
            # Show problematic line details for TSX files
            if result['path'].endswith('.tsx') or result['path'].endswith('.ts'):
                print(f"      Tag locations (last 10):")
                for line_num, tag_type_tag, tag_text in result['matches'][-10:]:
                    indicator = ">>>" if tag_type_tag == 'OPEN' else "<<<"
                    print(f"        Line {line_num:4d} {indicator} {tag_text}")
    
    return total_open, total_close

def run_typescript_check(root_dir):
    """Run TypeScript compiler to check for JSX/TSX errors."""
    print("\n" + "=" * 70)
    print("TYPESCRIPT COMPILER CHECK")
    print("=" * 70)
    
    tsconfig_path = Path(root_dir) / 'tsconfig.json'
    
    if not tsconfig_path.exists():
        print("\n  ⚠️  No tsconfig.json found. Skipping TypeScript check.")
        return None
    
    print(f"\n  Using tsconfig: {tsconfig_path}")
    print(f"  Running: npx tsc --noEmit\n")
    
    try:
        result = subprocess.run(
            ['npx', 'tsc', '--noEmit'],
            cwd=root_dir,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("  ✅ TypeScript: No errors found!")
        else:
            print(f"  ❌ TypeScript: {result.returncode} error(s) found\n")
            print(result.stdout)
            if result.stderr:
                print(result.stderr)
            
            # Check for JSX-specific errors
            jsx_errors = [
                line for line in (result.stdout + result.stderr).split('\n')
                if any(keyword in line.lower() for keyword in ['jsx', 'div', 'unclosed', 'expected', 'expression'])
            ]
            
            if jsx_errors:
                print("\n  🔍 JSX/div-related errors:")
                for err in jsx_errors:
                    if err.strip():
                        print(f"    {err}")
        
        return result.returncode
    
    except subprocess.TimeoutExpired:
        print("  ⚠️  TypeScript check timed out after 60 seconds")
        return None
    except FileNotFoundError:
        print("  ⚠️  TypeScript compiler not found. Run 'bun install' first.")
        return None

def main():
    # Set project root
    project_root = Path(__file__).parent
    
    # Count div tags
    total_open, total_close = validate_div_balance(project_root)
    
    # Run TypeScript check
    ts_result = run_typescript_check(project_root)
    
    # Final summary
    print("\n" + "=" * 70)
    print("FINAL REPORT")
    print("=" * 70)
    print(f"\n  Div tags balanced: {'✅ YES' if total_open == total_close else '❌ NO'}")
    print(f"  TypeScript errors: {'❌ YES' if ts_result and ts_result != 0 else '✅ NO' if ts_result == 0 else '⚠️  UNKNOWN'}")
    
    if total_open == total_close and (not ts_result or ts_result == 0):
        print("\n  ✅ All checks passed!")
        sys.exit(0)
    else:
        print("\n  ⚠️  Some checks failed. Please review above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
