# CzechNews Pulse

Nezávislý agregátor českých médií a tiskový monitor v reálném čase.

![CzechNews Pulse - Náhled aplikace](docs/screenshot.jpg)

## Přehled

CzechNews Pulse shromažďuje a v reálném čase kategorizuje zprávy z předních českých médií a deníků. Aplikace umožňuje číst články v plném znění bez rušivých reklam, ukládat články do záložek, filtrovat dle rubrik i konkrétních zdrojů a personalizovat feed.

### Zahrnutá média v katalogu (19 zdrojů)
- **Seznam Zprávy**
- **Novinky.cz**
- **Deník N**
- **ČT24 (Česká televize)**
- **iDNES.cz**
- **Hospodářské noviny**
- **Aktuálně.cz**
- **iROZHLAS (Český rozhlas)**
- **Respekt**
- **Echo24**
- **Lidovky.cz**
- **ČeskéNoviny.cz (ČTK)**
- **E15.cz**
- **CzechCrunch**
- **Lupa.cz**
- **Deník.cz**
- **Živě.cz**
- **Investigace.cz**
- **FORUM 24**

---

## Bezpečnost a náklady (100% Free & Open Source)

- **Žádné placené API služby jako prerekvizita**: Aplikace funguje okamžitě po spuštění výhradně na bázi otevřených a bezplatných RSS kanálů českých vydavatelství. Žádné povinné platební brány, předplatné ani skryté náklady.
- **Volitelné AI shrnutí**: Obsahuje volitelnou integraci s Google Gemini API (`GEMINI_API_KEY`). Pokud klíč není nastaven, aplikace automaticky a bezchybně používá lokální extraktivní souhrn bez jakýchkoli externích API volání či poplatků.
- **Ochrana proti SSRF (Server-Side Request Forgery)**: Endpoint pro stahování článků (`/api/article-content`) má striktní validaci protokolů a blokuje přístup k interním IP adresám (RFC 1918), loopbacku (`127.0.0.1`, `localhost`) i cloudovým metadatovým službám (`169.254.169.254`).
- **Bezpečnostní HTTP hlavičky**: Server automaticky nastavuje hlavičky `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy` a sanitizuje vstupy.
- **Ochrana soukromí**: Záložky, preference i nastavení aktivních médií jsou uloženy výhradně lokálně v prohlížeči uživatele (`localStorage`). Žádné sledování ani telemetrie.

---

## Lokální spuštění

### Požadavky
- Node.js verze 18 nebo vyšší
- npm / bun

### Instalace a spuštění
```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev

# Sestavení pro produkci
npm run build

# Spuštění produkčního serveru
npm start
```

Aplikace poběží na `http://localhost:3000`.

### Volitelné nastavení proměnných prostředí
Zkopírujte `.env.example` do `.env`:
```bash
cp .env.example .env
```
Pro základní provoz není potřeba nastavovat žádné proměnné.
