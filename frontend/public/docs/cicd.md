name: API Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Analyzer
        run: |
          docker run --rm \
            -v $(pwd)/specs:/specs \
            vtb-api-analyzer \
            /specs/openapi.yaml