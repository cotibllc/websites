# betacrt.com — Educational Media Index

A Python-based utility that generates browsable HTML index pages for a NAS-mounted educational media library, plus the pre-generated output HTML.

---

## What It Does

`educational/createhtml.py` walks a local NAS directory tree (mounted at `Z:`) and generates an `index.html` in every subdirectory. Each index links to files and subdirectories using the NAS mount point (`/mnt/nas_educational/`) as the URL base.

`educational/index.html` is the pre-generated top-level index browsable via a web server.

---

## Media Library Structure

The NAS library at `/mnt/nas_educational/` is organized into:

| Category | Contents |
|---|---|
| `Fitness/` | P90X, Taebo, Zumba, Yoga, Navy SEAL Workout, Biggest Loser |
| `Videos/Math Tutor/` | Algebra, Matrix Algebra, Statistics, Calculus, Physics |
| `Technology/` | CRISC cert prep, GIAC Security Essentials |
| `OrganizeMe/` | Game Theory (Stanford), Deep Learning (CMU/Michigan), MasterClass, Medical Imaging DL |
| `TonyRobbins_Challenges/` | Breakthrough 2022, Comeback Challenge, Project Next, Time to Thrive |
| `Wim Hof Method/` | 10-week program, breathing, cold immersion, physical exercises |

---

## Usage

### Generate indexes (re-run after adding content)

```bash
python educational/createhtml.py
# or override root directory:
python educational/createhtml.py /path/to/your/media
```

**Requirements:** Python 3. No external dependencies.

### Configuration

Edit the constants at the top of `createhtml.py`:

| Variable | Default | Purpose |
|---|---|---|
| `ROOT_DIR` | `"Z:"` | Local path to the NAS mount |
| `MOUNT_POINT` | `"/"` | URL base prefix for generated links |

### Serving the indexes

The generated `index.html` files are designed to be served from a web server where `/mnt/nas_educational/` maps to actual files. Any static file server (nginx, Apache, Caddy) pointed at the NAS root will work.

---

## Files

```
betacrt.com/
└── educational/
    ├── createhtml.py   ← index generator script
    └── index.html      ← pre-generated top-level index
```
