#!/usr/bin/env python3
import os
import sys
import html

# Set the root directory and the mount point prefix (the URL base)
ROOT_DIR = "Z:"
MOUNT_POINT = "/"  # This is the base URL for links

def generate_index(directory):
    """
    Generate an index.html file in the given directory that lists all files and folders.
    Folders are linked to their own index.html.
    """
    # Compute the relative URL for the current directory
    rel_dir = os.path.relpath(directory, ROOT_DIR)
    # For the root directory, set relative path to empty string
    if rel_dir == ".":
        rel_dir = ""
    
    # Begin the HTML content
    html_content = [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='UTF-8'>",
        f"  <title>Index of {html.escape(directory)}</title>",
        "  <style>",
        "    body { font-family: Arial, sans-serif; }",
        "    ul { list-style: none; padding-left: 0; }",
        "    li { margin-bottom: 0.5em; }",
        "    a { text-decoration: none; color: #0645AD; }",
        "    a:hover { text-decoration: underline; }",
        "  </style>",
        "</head>",
        "<body>",
        f"  <h1>Index of {html.escape(directory)}</h1>",
        "  <ul>"
    ]

    # List subdirectories and files in sorted order
    try:
        entries = sorted(os.listdir(directory), key=lambda s: s.lower())
    except PermissionError:
        print(f"Permission denied: {directory}")
        return

    # Separate directories and files
    dirs = []
    files = []
    for entry in entries:
        # Skip the index.html file we will generate
        if entry.lower() == "index.html":
            continue
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            dirs.append(entry)
        else:
            files.append(entry)

    # List files first (if any)
    if files:
        html_content.append("    <h2>Files</h2>")
        html_content.append("    <ul>")
        for file in files:
            # Escape file name for HTML
            safe_file = html.escape(file)
            # Construct the hyperlink using the mount point + relative path + file name
            # Use forward slashes in URLs.
            link = os.path.join(MOUNT_POINT, rel_dir, file).replace(os.sep, "/")
            html_content.append(f"      <li><a href='{link}'>{safe_file}</a></li>")
        html_content.append("    </ul>")

    # List subdirectories next (if any)
    if dirs:
        html_content.append("    <h2>Subdirectories</h2>")
        html_content.append("    <ul>")
        for d in dirs:
            safe_d = html.escape(d)
            # Link to the subdirectory's own index.html
            link = os.path.join(MOUNT_POINT, rel_dir, d, "index.html").replace(os.sep, "/")
            html_content.append(f"      <li><a href='{link}'>{safe_d}</a></li>")
        html_content.append("    </ul>")

    # Optionally add a link to the parent directory (if not the root)
    parent = os.path.abspath(os.path.join(directory, ".."))
    if os.path.abspath(directory) != os.path.abspath(ROOT_DIR):
        # Compute the URL for the parent directory's index.html
        parent_rel = os.path.relpath(parent, ROOT_DIR)
        parent_link = os.path.join(MOUNT_POINT, parent_rel, "index.html").replace(os.sep, "/")
        html_content.append(f"    <p><a href='{parent_link}'>Back to parent directory</a></p>")
    else:
        html_content.append("    <p>This is the root directory.</p>")

    html_content.append("</body>")
    html_content.append("</html>")

    # Write the index.html file
    index_path = os.path.join(directory, "index.html")
    try:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write("\n".join(html_content))
        print(f"Generated {index_path}")
    except IOError as e:
        print(f"Error writing {index_path}: {e}")

def main():
    # You can optionally override the ROOT_DIR by a command-line argument.
    root = ROOT_DIR
    if len(sys.argv) > 1:
        root = sys.argv[1]
    
    # Walk the directory tree recursively (bottom-up is useful to ensure subdirectories are processed)
    for current_dir, subdirs, files in os.walk(root):
        generate_index(current_dir)

if __name__ == "__main__":
    main()
