# ACODE TACTICAL GIT OPERATIONS GUIDE

## 1. Verify Remote Origin
Ensure the project is linked to the correct repository:
```bash
git remote -v
```

## 2. Check Status
See which files are modified:
```bash
git status
```

## 3. Stage Changes
Add all modified files to the commit:
```bash
git add .
```

## 4. Commit
Create a descriptive commit message:
```bash
git commit -m "chore: <your-descriptive-message>"
```

## 5. Push
Push your changes to the main branch:
```bash
git push origin main
```

## Authentication (Handling Push Failures)
If `git push` fails due to authentication, your PAT (Personal Access Token) may have expired or not be configured.

Use HTTPS with a PAT as the password:
```bash
git remote set-url origin https://<YOUR_GITHUB_USERNAME>:<YOUR_PAT>@github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
```
(Replace placeholders with your own credentials.)
