# Docker GitHub Integration Setup

This setup automatically pulls your code from GitHub and builds it in Docker. No need to have local source files!

## Prerequisites

- Docker Desktop installed
- GitHub account with your repository

## Configuration Steps

### 1. Update docker-compose.yml

Edit `docker-compose.yml` and update the `app` service build args:

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      GITHUB_REPO: https://github.com/YOUR_USERNAME/ManageByHR.git
      BRANCH: master
```

**Replace:**
- `YOUR_USERNAME` - Your GitHub username
- `ManageByHR` - Your repository name
- `master` - Branch to pull (e.g., main, develop)

### 2. (Optional) For Private Repositories

If your GitHub repo is private, you need to pass GitHub credentials:

```yaml
args:
  GITHUB_REPO: https://YOUR_TOKEN@github.com/YOUR_USERNAME/ManageByHR.git
  BRANCH: master
```

Or use SSH:
```yaml
args:
  GITHUB_REPO: git@github.com:YOUR_USERNAME/ManageByHR.git
  BRANCH: master
```

## Usage

### First Time / After Code Changes

```powershell
docker-compose up --build
```

This will:
1. ✅ Clone latest code from GitHub
2. ✅ Build with Maven
3. ✅ Start MySQL + App
4. ✅ Run on port 8080

### Just Restart (No Code Changes)

```powershell
docker-compose up
```

### Stop Everything

```powershell
docker-compose down
```

## Workflow

```
1. Make code changes locally
   git add -A
   git commit -m "your message"
   git push origin master

2. Rebuild Docker (pulls latest code)
   docker-compose up --build

3. Access app at: http://localhost:8080
```

## Verify It's Working

When Docker starts, you should see:
```
managebyhR_app  | ✅ APPLICATION READY
managebyhR_app  | Access at: http://localhost:9899
```

## Troubleshooting

**"Could not clone repository"**
- Check GitHub repo URL is correct
- For private repos, verify GitHub token has access

**"Build failed"**
- Check Maven compilation errors
- Verify pom.xml is correct in your GitHub repo

**"Connection refused"**
- Make sure Docker daemon is running
- Check port 8080 is not in use

## Benefits

✅ Always uses latest code from GitHub  
✅ No need to manually copy files  
✅ Perfect for CI/CD pipelines  
✅ Team members can deploy from same source  
✅ Version control integrated with deployment
