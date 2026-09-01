# Exact GitHub Upload Steps

## First time only

1. Install Git.
2. Create a GitHub account if you do not already have one.
3. Open a terminal inside this project folder.

Check Git:

```bash
git --version
```

Configure your public commit identity:

```bash
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR_GITHUB_EMAIL"
```

## Create the repository locally

From the folder that contains this README:

```bash
git init
git branch -M main
git status
```

`git init` creates Git metadata in a hidden `.git` directory.

`git branch -M main` renames the current branch to `main`.

`git status` shows tracked/untracked/modified files. It does not upload anything.

## First commit

```bash
git add .
git status
git commit -m "feat: add job application tracker learning project"
```

`git add .` puts the current changes into the staging area.

A commit is a named snapshot of staged changes.

## Create the remote repository on GitHub

On GitHub:

1. Click **New repository**.
2. Repository name: `job-application-tracker`
3. Description: `Job application tracker built with Java Spring Boot, REST, JPA and a vanilla JavaScript frontend.`
4. Choose **Public**.
5. Do **not** add another README or `.gitignore` because this project already contains them.
6. Click **Create repository**.

GitHub will show a repository URL. Use your own URL in the following command:

```bash
git remote add origin https://github.com/YOUR_USERNAME/job-application-tracker.git
git push -u origin main
```

`origin` is just the conventional nickname for the remote GitHub repository.

`-u origin main` links your local `main` branch with GitHub's `main`, so later you can usually run only:

```bash
git push
```

## Normal workflow after each feature

```bash
git status
git add .
git commit -m "feat: add status filter"
git push
```

Never commit passwords, API keys, `.env` files, production database files, or private customer data.
