# Snake App

Statische Snake-Web-App fuer `wallenstorfer.com` und die zugehoerigen Subdomains. Kein Build-System, kein Framework, keine Server-Logik – einfach HTML, CSS und JavaScript.

## Features

- klassische Snake-Mechanik mit Highscore in `localStorage`
- **Dual-Mode UI** aus einer Codebasis
  - **Desktop:** keyboard-first
  - **Mobile/Android:** touch-first mit grossen Richtungsbuttons
- Start-, Pause- und Neustart-Flow fuer Desktop und Touch optimiert
- optionales Swipe-Handling direkt auf dem Spielfeld
- responsive Layouts fuer Browser und Handy

## Steuerung

### Desktop

- `Pfeil hoch` / `W`: nach oben
- `Pfeil runter` / `S`: nach unten
- `Pfeil links` / `A`: nach links
- `Pfeil rechts` / `D`: nach rechts
- `Leertaste`: pausieren / fortsetzen
- `Enter`: neues Spiel zuruecksetzen
- `Start`: Spiel direkt starten

### Mobile / Android

- `Start`: Spiel starten
- grosse Richtungsbuttons: Steuerung per Touch
- `Pause`: Spiel pausieren / fortsetzen
- `Neu starten`: neues Spiel
- Wischgeste auf dem Spielfeld als Zusatzsteuerung

## Projektstruktur

- `index.html` – Layout, HUD, Overlay, Dual-Mode-UI
- `styles.css` – Desktop-/Mobile-Layout, Touch-UI, responsives Verhalten
- `script.js` – Spiellogik, Eingaben, Highscore, Start-/Pause-Verhalten
- `favicon.svg` – Icon
- `site.webmanifest` – einfache PWA-/Homescreen-Metadaten
- `deploy.sh` – einfacher Deploy auf den Oracle-Host
- `Caddyfile.example` – Beispiel fuer die Webserver-Konfiguration

## Hosting

Die Live-App liegt auf dem Oracle-Host in:

```bash
/var/www/site/public
```

Aktiver Webserver:

- **Caddy**

## Deploy

Lokal aus dem Repo:

```bash
./deploy.sh
```

Standardziel:

- Host: `ubuntu@92.5.80.61`
- Zielpfad: `/var/www/site/public`

Das Script deployed nur die benoetigten Runtime-Dateien und schliesst Repo-/Hilfsdateien aus.

## Domains

Aktuell zeigen folgende Domains direkt auf dieselbe Live-App:

- `https://wallenstorfer.com`
- `https://www.wallenstorfer.com`
- `https://snake.wallenstorfer.com`
- `https://www.snake.wallenstorfer.com`

## Hinweise

- Der Highscore wird im Browser gespeichert.
- Touch-Scrollen auf dem Spielfeld wird abgefangen, damit Gesten nicht vom Browser verschluckt werden.
- Keine Build-Pipeline: aendere die Dateien direkt und deploye danach per `deploy.sh`.
