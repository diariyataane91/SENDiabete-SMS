# Guide de déploiement MediSuivi sur VPS (Ubuntu)

## 1. Prérequis
- Un VPS (Sonatel / Orange Business) sous Ubuntu 22.04 LTS.
- Nom de domaine `sen-diabete.com` pointé vers l'IP du VPS (via un enregistrement A pour `www` et `app`).

## 2. Installation des outils
```bash
sudo apt update && sudo apt upgrade -y
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
# Nginx & PM2
sudo apt install -y nginx
sudo npm install -g pm2