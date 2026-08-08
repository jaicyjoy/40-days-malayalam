# 40 Days · Eucharistic Deliverance Prayer

A simple website for Father Daniel’s 40-day Eucharistic Deliverance Prayer journey — so family near and far can follow each day’s virtue, prayer, and task together.

## Open the site

Once GitHub Pages is live:

**https://jaicyjoy.github.io/40-days/**

## Add a new day

1. Open `data/days.json`
2. Add a new object under `days` (copy Day 1’s shape)
3. Update `"currentDay"` to the latest day number
4. Commit and push — the website updates automatically

## Local preview

Open `index.html` in a browser, or from this folder run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`
