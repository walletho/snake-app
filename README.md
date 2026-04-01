# Snake App

Kleine statische Snake-Web-App ohne Build-Tooling. Die Dateien koennen direkt von einem Webserver ausgeliefert werden.

## Features

- klassische Snake-Mechanik mit Highscore in `localStorage`
- Desktop-Steuerung mit Pfeiltasten oder WASD
- mobile Touch-Steuerung per Wischgeste auf dem Spielfeld
- Pause per Leertaste, Neustart per Enter oder Button
- responsive UI fuer Desktop und Handy

## Steuerung

### Desktop

- `Pfeil hoch` / `W`: nach oben
- `Pfeil runter` / `S`: nach unten
- `Pfeil links` / `A`: nach links
- `Pfeil rechts` / `D`: nach rechts
- `Leertaste`: pausieren / fortsetzen
- `Enter`: neues Spiel starten

### Mobile

- auf dem Spielfeld nach oben, unten, links oder rechts wischen
- kurzer Tap waehrend Pause setzt das Spiel fort
- der Button `Neu starten` startet sofort neu

## Dateien

- `index.html`: Layout und UI-Texte
- `styles.css`: Styling, responsive Layout, Touch-Verhalten
- `script.js`: Spiellogik, Eingaben, Score und Highscore

## Deployment

Die App ist fuer statisches Hosting gedacht.

Beispiel-Deploy:

```bash
rsync -av ./ ubuntu@SERVER:/var/www/site/public/
```

## Hinweise

- Touch-Eingaben werden direkt auf dem Canvas verarbeitet.
- Scrollen auf dem Spielfeld ist deaktiviert, damit Wischgesten nicht vom Browser abgefangen werden.
- Ein Reverse-Move in die eigene Richtung wird wie bei der Tastatur blockiert.
