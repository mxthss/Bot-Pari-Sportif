#!/usr/bin/env powershell
# 🚀 Auto-Push Script - Pushes all changes to GitHub automatiquement

$projectPath = "C:\Users\matab\Documents\bot pari\football-predictor-clean"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "📦 Football Predictor - Auto Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aller au dossier du projet
cd $projectPath

# Vérifier si on est dans un repo git
if (!(Test-Path .git)) {
    Write-Host "❌ Pas dans un repo git!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repo git détecté" -ForegroundColor Green

# 1. Ajouter tous les changements
Write-Host ""
Write-Host "1️⃣  Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Fichiers ajoutés" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du git add" -ForegroundColor Red
    exit 1
}

# 2. Vérifier s'il y a des changements
$status = git status --porcelain
if ($status.Count -eq 0) {
    Write-Host ""
    Write-Host "ℹ️  Aucun changement à commiter" -ForegroundColor Cyan
    exit 0
}

# 3. Créer un commit
Write-Host ""
Write-Host "2️⃣  Création du commit..." -ForegroundColor Yellow
$commitMessage = "Update: $timestamp"
git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Commit créé: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

# 4. Pull les derniers changements
Write-Host ""
Write-Host "3️⃣  Récupération des derniers changements..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Conflits possibles - resolve manually" -ForegroundColor Yellow
}

# 5. Pusher les changements
Write-Host ""
Write-Host "4️⃣  Push vers GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Push réussi!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Tous les changements sont poussés!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Render va redéployer automatiquement dans 1-2 minutes" -ForegroundColor Cyan
