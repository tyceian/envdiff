# envdiff

> Compare `.env` files across environments and flag missing or mismatched keys.

---

## Installation

```bash
npm install -g envdiff
```

Or use it directly with npx:

```bash
npx envdiff
```

---

## Usage

```bash
envdiff --base .env --compare .env.production
```

**Example output:**

```
✔ DB_HOST         present in both
✖ API_KEY         missing in .env.production
~ LOG_LEVEL       mismatch (.env: "debug" | .env.production: "error")

2 issues found.
```

### Options

| Flag | Description |
|------|-------------|
| `--base` | Path to the base `.env` file |
| `--compare` | Path to the environment file to compare against |
| `--strict` | Exit with code 1 if any issues are found |
| `--json` | Output results as JSON |

```bash
# Compare multiple files
envdiff --base .env --compare .env.staging --compare .env.production

# Use in CI pipelines
envdiff --base .env.example --compare .env --strict
```

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

---

## License

[MIT](LICENSE)