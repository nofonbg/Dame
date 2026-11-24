# Dame gegen Computer

<a href="/nofonbg/dame/blob/main/LICENSE"><img src="https://camo.githubusercontent.com/6075f03c5eee8cf63c8777a24363bffc0a696b95d90bdd0837d7a93a0667e8e9/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c697a656e7a2d434325323042592d2d4e432d2d5341253230342e302d6c69676874677265793f6c6f676f3d6372656174697665636f6d6d6f6e73266c6f676f436f6c6f723d626c61636b" alt="Lizenz: CC BY-NC-SA 4.0" data-canonical-src="https://img.shields.io/badge/Lizenz-CC%20BY--NC--SA%204.0-lightgrey?logo=creativecommons&amp;logoColor=black" style="max-width: 100%;"></a>
<a href="https://nofonbg.github.io/dame/" rel="nofollow"><img src="https://camo.githubusercontent.com/cecde7126d17540b95bffcffff07d9b08dffd9b512d73bc79d363556a8734c05/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c6976652d2d44656d6f2d6e6f666f6e62672e6769746875622e696f2d3235363365623f6c6f676f3d6769746875627061676573266c6f676f436f6c6f723d7768697465" alt="Live-Demo" data-canonical-src="https://img.shields.io/badge/Live--Demo-nofonbg.github.io-2563eb?logo=githubpages&amp;logoColor=white" style="max-width: 100%;"></a>

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

👉 https://nofonbg.github.io/dame

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
