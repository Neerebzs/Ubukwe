# Deployment commands

Follow the steps in order. Do not skip steps.

Do not create, rename, or commit `.env` files. Use the existing files:

- `Nyurwa/.env`
- `Ubukwe/.env`

---

# A. Development (your computer)

Result when finished:

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Postgres and Redis: Docker

---

### Step 1. Open a terminal in the project folder

```bash
cd "c:\Users\user\Desktop\project\ubukwe hub"
```

---

### Step 2. Start Postgres, Redis, and the API

```bash
cd Nyurwa
docker compose up -d --build
```

Wait until this command finishes.

---

### Step 3. Check that the API containers are running

```bash
docker compose ps
```

You should see `postgres`, `redis`, and `backend` as running / healthy.

---

### Step 4. Check that the API is up

```bash
curl http://127.0.0.1:4000/health
```

Expected: a JSON response with `"status": "ok"`.

Windows PowerShell if `curl` is missing:

```powershell
Invoke-WebRequest http://127.0.0.1:4000/health
```

---

### Step 5. Start the frontend

Open a **second** terminal.

```bash
cd "c:\Users\user\Desktop\project\ubukwe hub\Ubukwe"
npm install
npm run dev
```

Leave this terminal open.

---

### Step 6. Open the app

In the browser open:

```text
http://localhost:3000
```

The frontend talks to the API at http://localhost:4000.

---

### Development logs (optional)

API logs (first terminal, inside `Nyurwa`):

```bash
docker compose logs -f backend
```

Press `Ctrl+C` to stop following logs. Containers keep running.

---

### Stop development

Terminal 2 (frontend): press `Ctrl+C`.

Terminal 1 (inside `Nyurwa`):

```bash
docker compose down
```

---

# B. Production (Linux server)

Result when finished:

- Website: https://vownests.com
- API: https://vownests.com/api/
- Only ports 80 and 443 are public

Do these steps on the VPS. Start Nyurwa first, then Ubukwe.

---

### Step 1. Install Docker

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker "$USER"
```

Log out and log back in.

Enable Docker after reboot:

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

### Step 2. Clone the two repositories

```bash
git clone <NYURWA_GITHUB_URL> Nyurwa
git clone <UBUKWE_GITHUB_URL> Ubukwe
```

Replace the two URLs with the real GitHub remotes.

---

### Step 3. Put the existing env files on the server

Copy your existing files onto the server. Do not commit them.

```text
Nyurwa/.env
Ubukwe/.env
```

---

### Step 4. Set production frontend URLs

```bash
export NEXT_PUBLIC_BACKEND_URL=https://vownests.com
export NEXT_PUBLIC_SITE_URL=https://vownests.com
export NEXT_PUBLIC_APP_URL=https://vownests.com
export NEXT_PUBLIC_PLATFORM_HOSTS=localhost,127.0.0.1,vownests.com,www.vownests.com
export DOMAIN=vownests.com
export CERT_NAME=vownests.com
```

---

### Step 5. Start the API (Nyurwa)

```bash
cd Nyurwa
docker compose -f docker-compose.prod.yml up -d --build
```

Wait until this command finishes.

---

### Step 6. Check the API containers

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see `redis` and `backend` as running / healthy.

---

### Step 7. Start Nginx and the frontend (Ubukwe)

```bash
cd ../Ubukwe
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Wait until this command finishes.

---

### Step 8. Check the frontend containers

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see `frontend` and `nginx` as running / healthy.

---

### Step 9. Point DNS to this server

At your DNS provider, set:

```text
A     vownests.com        →  YOUR_SERVER_IP
A     www.vownests.com    →  YOUR_SERVER_IP
```

Wait until DNS resolves.

---

### Step 10. Check HTTP (before SSL)

```bash
curl -I http://vownests.com
curl http://vownests.com/nginx-health
curl http://vownests.com/health
```

The site should load on port 80.

---

### Step 11. Get SSL certificates

Stop Nginx for a minute so Certbot can use port 80:

```bash
cd ~/Ubukwe
docker compose -f docker-compose.prod.yml stop nginx
```

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d vownests.com -d www.vownests.com
```

Certificates will be stored in:

```text
/etc/letsencrypt/live/vownests.com/fullchain.pem
/etc/letsencrypt/live/vownests.com/privkey.pem
```

---

### Step 12. Start Nginx with HTTPS

```bash
cd ~/Ubukwe
LETSENCRYPT_DIR=/etc/letsencrypt \
DOMAIN=vownests.com \
CERT_NAME=vownests.com \
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

---

### Step 13. Confirm HTTPS

```bash
curl -I https://vownests.com
curl -fsS https://vownests.com/health
curl -fsS https://vownests.com/nginx-health
```

Open in a browser:

```text
https://vownests.com
```

---

### Step 14. Confirm only Nginx is public

```bash
sudo ss -tulpn | grep -E ':80|:443|:3000|:4000|:5432|:6379'
```

Expected:

- `80` and `443` are listening
- `3000`, `4000`, `5432`, `6379` are not public on `0.0.0.0`

---

# Production: later operations

These are not part of first-time setup. Use them after the app is already running.

### See logs

```bash
cd Nyurwa
docker compose -f docker-compose.prod.yml logs -f backend
```

```bash
cd Ubukwe
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart after a code update

```bash
cd Nyurwa
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

```bash
cd Ubukwe
git pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Stop production

```bash
cd Nyurwa
docker compose -f docker-compose.prod.yml down
```

```bash
cd Ubukwe
docker compose -f docker-compose.prod.yml down
```

### Start production again (no rebuild)

```bash
cd Nyurwa
docker compose -f docker-compose.prod.yml up -d
```

```bash
cd Ubukwe
docker compose -f docker-compose.prod.yml --env-file .env up -d
```
