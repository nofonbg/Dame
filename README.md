# Dame gegen Computer

<a href="/nofonbg/dame/blob/main/LICENSE"><img src="https://img.shields.io/badge/Lizenz-CC%20BY--NC--SA%204.0-lightgrey?left-color=3c3c3c&logo=creativecommons&logoColor=white&color=black" alt="Lizenz: CC BY-NC-SA 4.0" style="max-width: 100%;"></a>
<a href="https://nofonbg.github.io/Dame/" rel="nofollow"><img src="https://img.shields.io/badge/Live--Demo-nofonbg.github.io-2563eb?left-color=333333&logo=githubpages&logoColor=white" alt="Live-Demo" style="max-width: 100%;"></a>

Ein klassisches **Dame-Spiel** im Browser – Sie spielen **Weiß** (unten), der Computer spielt **Schwarz** (oben).

![Screenshot](docs/dame.jpg)

Erstellt als Studie für die Zuammenarbeit von [thinkingmachines/inkling-2-mini
](https://thinkingmachines.ai/news/inkling-2-mini/) mit [OpenCode](https://opencode.ai/)
## Features

- **Drei Schwierigkeitsstufen**: Leicht, Mittel und Schwer (mit Minimax-Suche und Alpha-Beta-Pruning)
- **Pflichtsprung** und Mehrfachsprünge
- **König-Regelung**: Erreicht eine Figur die gegenüberliegende Reihe, wird sie zum König (★) und darf beliebig weit diagonal ziehen und springen
- **Animierte Züge**: Spielsteine gleiten vom Ausgangs- zum Zielfeld
- **Responsives Design**: Brett und Regelkästen passen sich dem Bildschirm an

## Steuerung

1. Wählen Sie die Schwierigkeit mit dem Schieberegler
2. Klicken Sie auf einen weißen Stein und dann auf ein markiertes Zielfeld
3. Springen ist Pflicht, sobald es möglich ist
4. Der Computer antwortet nach Ihrem Zug automatisch

## Live-Demo

👉 https://nofonbg.github.io/Dame

## Lokal starten

```bash
# Einfach die Datei index.html im Browser öffnen
# oder einen lokalen Server starten:
python3 -m http.server 8000
```

## Dateien

- `index.html` – HTML-Struktur
- `style.css` – Design und Layout
- `script.js` – Spiellogik und KI
