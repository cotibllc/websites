#!/usr/bin/env python3
import os
import sys
import html

# Set the root directory and the mount point prefix (the URL base)
ROOT_DIR = "Z:"
MOUNT_POINT = "/"  # This is the base URL for links

ICON_FOLDER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
ICON_FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>'
ICON_VIDEO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>'
ICON_AUDIO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
ICON_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 2 14 9 20 9"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
ICON_SEARCH = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'

def get_icon(filename):
    ext = os.path.splitext(filename)[1].lower()
    video_exts = {'.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.iso', '.img'}
    audio_exts = {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'}
    doc_exts = {'.pdf', '.epub', '.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.md'}
    
    if ext in video_exts:
        return 'video'
    elif ext in audio_exts:
        return 'audio'
    elif ext in doc_exts:
        return 'document'
    else:
        return 'file'

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
    
    directory_name = os.path.basename(directory) if rel_dir != "" else "Educational Media"
    directory_escaped = html.escape(directory_name)
    
    # Construct breadcrumbs
    breadcrumbs_html = []
    home_link = MOUNT_POINT.replace(os.sep, "/")
    if not home_link.endswith("/"):
        home_link += "/"
    home_index_link = home_link + "index.html"
    
    if rel_dir == "":
        breadcrumbs_html.append("<span class='breadcrumb-item'>Home</span>")
    else:
        breadcrumbs_html.append(f"<a href='{home_index_link}'>Home</a>")
        parts = rel_dir.split(os.sep)
        accumulated = []
        for i, part in enumerate(parts):
            accumulated.append(part)
            if i == len(parts) - 1:
                breadcrumbs_html.append(f"<span class='breadcrumb-separator'>/</span>")
                breadcrumbs_html.append(f"<span class='breadcrumb-item'>{html.escape(part)}</span>")
            else:
                part_link = os.path.join(MOUNT_POINT, *accumulated, "index.html").replace(os.sep, "/")
                breadcrumbs_html.append(f"<span class='breadcrumb-separator'>/</span>")
                breadcrumbs_html.append(f"<a href='{part_link}'>{html.escape(part)}</a>")
                
    breadcrumbs_str = "\n      ".join(breadcrumbs_html)

    # Begin the HTML content
    html_content = [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='UTF-8'>",
        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        f"  <title>Index of {directory_escaped}</title>",
        "  <style>",
        "    :root {",
        "      --bg: #0b0f19;",
        "      --card-bg: #151d30;",
        "      --card-hover: #1e2942;",
        "      --text: #f3f4f6;",
        "      --text-muted: #9ca3af;",
        "      --accent: #6366f1;",
        "      --accent-hover: #4f46e5;",
        "      --border: #2d3748;",
        "    }",
        "    * { box-sizing: border-box; margin: 0; padding: 0; }",
        "    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: var(--bg); color: var(--text); line-height: 1.5; padding: 2rem 1.5rem; }",
        "    .container { max-width: 1200px; margin: 0 auto; }",
        "    header { margin-bottom: 2rem; }",
        "    .breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem; }",
        "    .breadcrumb a { color: var(--accent); text-decoration: none; transition: color 0.2s; }",
        "    .breadcrumb a:hover { color: var(--accent-hover); text-decoration: underline; }",
        "    .breadcrumb-separator { color: var(--border); }",
        "    h1 { font-size: 1.75rem; font-weight: 700; word-break: break-all; margin-bottom: 1.5rem; }",
        "    .search-container { position: relative; margin-bottom: 2rem; }",
        "    .search-input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; background-color: var(--card-bg); border: 1px solid var(--border); border-radius: 0.5rem; color: var(--text); font-size: 1rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }",
        "    .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }",
        "    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; stroke: var(--text-muted); }",
        "    .section-title { font-size: 1.2rem; font-weight: 600; color: var(--text-muted); margin-bottom: 1rem; padding-bottom: 0.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem; }",
        "    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }",
        "    .card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background-color: var(--card-bg); border: 1px solid var(--border); border-radius: 0.5rem; text-decoration: none; color: var(--text); transition: background-color 0.2s, transform 0.2s, border-color 0.2s; }",
        "    .card:hover { background-color: var(--card-hover); border-color: var(--accent); transform: translateY(-2px); }",
        "    .card-icon { flex-shrink: 0; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; border-radius: 0.375rem; }",
        "    .card-icon svg { width: 1.25rem; height: 1.25rem; }",
        "    .icon-folder { background-color: rgba(99, 102, 241, 0.15); color: var(--accent); }",
        "    .icon-file { background-color: rgba(156, 163, 175, 0.15); color: var(--text-muted); }",
        "    .icon-video { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; }",
        "    .icon-audio { background-color: rgba(16, 185, 129, 0.15); color: #10b981; }",
        "    .icon-document { background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; }",
        "    .card-info { min-width: 0; }",
        "    .card-name { font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
        "    .no-results { display: none; text-align: center; padding: 3rem; color: var(--text-muted); background-color: var(--card-bg); border: 1px dashed var(--border); border-radius: 0.5rem; }",
        "    footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: center; font-size: 0.85rem; color: var(--text-muted); }",
        "    footer a { color: var(--accent); text-decoration: none; }",
        "    footer a:hover { text-decoration: underline; }",
        "  </style>",
        "</head>",
        "<body>",
        "  <div class='container'>",
        "    <header>",
        "      <div class='breadcrumb'>",
        f"        {breadcrumbs_str}",
        "      </div>",
        f"      <h1>Index of {directory_escaped}</h1>",
        "    </header>",
        "    <div class='search-container'>",
        f"      {ICON_SEARCH}",
        "      <input type='text' id='search-input' class='search-input' placeholder='Search files and subdirectories...'>",
        "    </div>",
        "    <div id='no-results' class='no-results'>No matching files or subdirectories found.</div>"
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

    # List subdirectories first
    if dirs:
        html_content.append("    <div id='directories-section'>")
        html_content.append("      <h2 class='section-title'>Subdirectories</h2>")
        html_content.append("      <div class='grid'>")
        for d in dirs:
            safe_d = html.escape(d)
            link = os.path.join(MOUNT_POINT, rel_dir, d, "index.html").replace(os.sep, "/")
            html_content.append(f"        <a href='{link}' class='card dir-item'>")
            html_content.append(f"          <div class='card-icon icon-folder'>{ICON_FOLDER}</div>")
            html_content.append("          <div class='card-info'>")
            html_content.append(f"            <div class='card-name'>{safe_d}</div>")
            html_content.append("          </div>")
            html_content.append("        </a>")
        html_content.append("      </div>")
        html_content.append("    </div>")

    # List files next
    if files:
        html_content.append("    <div id='files-section'>")
        html_content.append("      <h2 class='section-title'>Files</h2>")
        html_content.append("      <div class='grid'>")
        for file in files:
            safe_file = html.escape(file)
            link = os.path.join(MOUNT_POINT, rel_dir, file).replace(os.sep, "/")
            icon_type = get_icon(file)
            if icon_type == 'video':
                icon_svg = ICON_VIDEO
                icon_cls = 'icon-video'
            elif icon_type == 'audio':
                icon_svg = ICON_AUDIO
                icon_cls = 'icon-audio'
            elif icon_type == 'document':
                icon_svg = ICON_DOC
                icon_cls = 'icon-document'
            else:
                icon_svg = ICON_FILE
                icon_cls = 'icon-file'
                
            html_content.append(f"        <a href='{link}' class='card file-item'>")
            html_content.append(f"          <div class='card-icon {icon_cls}'>{icon_svg}</div>")
            html_content.append("          <div class='card-info'>")
            html_content.append(f"            <div class='card-name'>{safe_file}</div>")
            html_content.append("          </div>")
            html_content.append("        </a>")
        html_content.append("      </div>")
        html_content.append("    </div>")

    if not dirs and not files:
        html_content.append("    <div class='no-results' style='display: block;'>This directory is empty.</div>")

    html_content.append("    <footer>")
    html_content.append("      Powered by <a href='https://www.cotib.com' target='_blank' rel='noopener noreferrer'>COTIB LLC</a> | ")
    html_content.append("      Visit <a href='https://www.cotib.com' target='_blank' rel='noopener noreferrer'>cotib.com</a> | ")
    html_content.append("      <a href='https://www.theitxp.com' target='_blank' rel='noopener noreferrer'>theitxp.com</a>")
    html_content.append("    </footer>")
    html_content.append("  </div>")
    
    # Javascript search script
    html_content.append("  <script>")
    html_content.append("    document.getElementById('search-input').addEventListener('input', function(e) {")
    html_content.append("      const query = e.target.value.toLowerCase().trim();")
    html_content.append("      const items = document.querySelectorAll('.card');")
    html_content.append("      let hasVisibleDir = false;")
    html_content.append("      let hasVisibleFile = false;")
    html_content.append("      ")
    html_content.append("      items.forEach(function(item) {")
    html_content.append("        const name = item.querySelector('.card-name').textContent.toLowerCase();")
    html_content.append("        if (name.includes(query)) {")
    html_content.append("          item.style.display = 'flex';")
    html_content.append("          if (item.classList.contains('dir-item')) hasVisibleDir = true;")
    html_content.append("          if (item.classList.contains('file-item')) hasVisibleFile = true;")
    html_content.append("        } else {")
    html_content.append("          item.style.display = 'none';")
    html_content.append("        }")
    html_content.append("      });")
    html_content.append("      ")
    html_content.append("      const dirSection = document.getElementById('directories-section');")
    html_content.append("      const fileSection = document.getElementById('files-section');")
    html_content.append("      const noResults = document.getElementById('no-results');")
    html_content.append("      ")
    html_content.append("      if (dirSection) {")
    html_content.append("        dirSection.style.display = hasVisibleDir ? 'block' : 'none';")
    html_content.append("      }")
    html_content.append("      if (fileSection) {")
    html_content.append("        fileSection.style.display = hasVisibleFile ? 'block' : 'none';")
    html_content.append("      }")
    html_content.append("      if (noResults) {")
    html_content.append("        noResults.style.display = (!hasVisibleDir && !hasVisibleFile) ? 'block' : 'none';")
    html_content.append("      }")
    html_content.append("    });")
    html_content.append("  </script>")
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
