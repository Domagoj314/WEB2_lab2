# PROJEKT2

Demonstracija dviju ranjivosti, svaka s prekidačem za uključivanje/isključivanje:
1. SQL umetanje (SQL Injection) na formi za prijavu
2. CSRF (Cross Site Request Forgery) na promjeni emaila

Tehnologije: Node.js, TypeScript, Express, Pug, PostgreSQL.

## Pokretanje lokalno

1. Instaliraj Node.js (v20+) i PostgreSQL.
2. Kreiraj bazu: `psql -U postgres -c "CREATE DATABASE web2_security;"`
3. U korijenu napravi `.env`:

DB_USER=postgres
DB_HOST=localhost
DB_NAME=web2_security
DB_PASSWORD=<tvoja_lozinka>
DB_PORT=5432

4. `npm install && npm run build && npm run start`
5. Otvori http://localhost:4080

Tablica i korisnici kreiraju se automatski pri pokretanju.

## Korisnici
- admin / admin123
- pero / pero123

## Testiranje
SQL umetanje (/login): checkbox UKLJUČEN → korisničko ime `' OR 1=1--` → prijava kao admin; ISKLJUČEN → napad ne uspije.
CSRF (/profile): zaštita ISKLJUČENA → otvori /attacker → email postane hacked@evil.com; UKLJUČENA → 403.

## Napomena o oblaku
Aplikacija je na Renderu. SQL umetanje se ne može demonstrirati na javnom URL-u jer Renderov WAF blokira SQLi zahtjev (403), pa se SQLi testira lokalno. CSRF radi i u oblaku.