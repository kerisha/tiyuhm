# TIYUHM (This Is Why You Hire Me)

Reads your GitHub history, writes a resume from it, and keeps it current as you ship.

## Run it
1. Node.js (LTS) and npm.
2. Ollama running with the model pulled: `ollama pull gemma4:12b`
3. `cp .env.example .env`
4. `npm install`, then `npm run dev`, then open http://localhost:3000

Reset to first-run by deleting the `data/` folder. `.env`, `owners.config.json` and `data/` are gitignored.

## PDFs
The PDF button uses Puppeteer, which needs its own Chrome. If npm skipped the download, run `npx puppeteer browsers install chrome`.
