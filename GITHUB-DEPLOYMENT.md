# Deploy MD Shohan's portfolio to GitHub Pages

Target site: https://md-sh0han.github.io/PORTFOLIO/
Repository to create: https://github.com/MD-SH0HAN/PORTFOLIO
GitHub account: https://github.com/MD-SH0HAN

## Important: use a separate repository named `PORTFOLIO`

Your existing `MD-SH0HAN/MD-SH0HAN` repository is your GitHub profile repository. GitHub Pages project-site URLs use the repository name as the final URL segment. To publish at `https://md-sh0han.github.io/PORTFOLIO/`, create a **new public repository named exactly `PORTFOLIO`** under `MD-SH0HAN`. Do not replace or rename your profile repository.

## Option A — GitHub website (copy/upload)

1. Sign in to GitHub as `MD-SH0HAN`.
2. Open https://github.com/new.
3. Set **Owner** to `MD-SH0HAN`.
4. Set **Repository name** to `PORTFOLIO`.
5. Choose **Public**. Leave "Add a README", `.gitignore`, and license unchecked (the package already contains these files).
6. Click **Create repository**.
7. Extract `MD-Shohan-GitHub-Pages-Ready.zip` on your computer.
8. Open the extracted `PORTFOLIO` folder. Upload the *contents of that folder* to the repository root—not the enclosing folder itself. Keep the folder structure (`assets`, `documents`, `scripts`, `.github`).
9. If GitHub's web uploader does not preserve the hidden `.github` folder, create the workflow manually:
   - In the new repository choose **Add file → Create new file**.
   - Enter the filename `.github/workflows/deploy-pages.yml`.
   - Copy the complete contents from `.github/workflows/deploy-pages.yml` in the extracted package into the editor.
   - Commit directly to `main`.
10. Open **Settings → Pages**.
11. Under **Build and deployment → Source**, choose **GitHub Actions**.
12. Open the **Actions** tab and wait for **Deploy portfolio to GitHub Pages** to finish successfully.

The deploy workflow runs the structural checks, JavaScript syntax checks, and Chromium browser tests before publishing. A push to `main` automatically publishes future updates.

## Option B — GitHub Desktop (recommended for the complete folder tree)

1. Create the public `PORTFOLIO` repository using steps 1–6 above.
2. In GitHub Desktop, clone `MD-SH0HAN/PORTFOLIO` to your computer.
3. Copy every item from the extracted package's `PORTFOLIO` folder into the cloned repository, including the hidden `.github` folder. Merge folders if prompted; do not nest a second `PORTFOLIO` directory.
4. Commit the changes with a message such as `Deploy portfolio website`.
5. Click **Push origin**.
6. Set **Settings → Pages → Source** to **GitHub Actions**, then watch the Actions tab for a successful deployment.

## Expected repository-root layout

The `index.html` file must be at the repository root. It must not be inside another `Portfolio/` folder.

```text
PORTFOLIO/
├── index.html
├── 404.html
├── styles.css
├── animations.css
├── advanced-animations.css
├── final-interactions.css
├── script.js
├── animations.js
├── advanced-animations.js
├── final-interactions.js
├── Profile Photo.webp
├── assets/
├── documents/
├── scripts/
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml
│       └── portfolio-quality.yml
└── README.md
```

## Final URL

After the deployment workflow succeeds, visit:

https://md-sh0han.github.io/PORTFOLIO/

The first deployment may take several minutes. If it does not appear, open **Actions**, inspect the failed workflow step, and confirm that **Settings → Pages → Source** is set to **GitHub Actions**.

## Notes

- The site is a static HTML/CSS/JavaScript portfolio. No npm build, backend server, API key, or environment file is required.
- The site already uses the `/PORTFOLIO/` canonical URL and metadata; its relative CSS, JavaScript, image, PDF, and document paths are compatible with the project-site root.
- The workflow deploys a curated public site artifact. Development scripts and workflow files remain in the GitHub repository but are not copied into the public website.
- Do not upload secrets, `.env` files, cloud credentials, Terraform state, or private keys.
- GitHub Pages is public. Anything in the deployed artifact can be viewed by visitors.
