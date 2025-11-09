{
  description = "VTB API Analyzer Pro v2.1 — Чемпион ВТБ-2025";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_20;
        python = pkgs.python312;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python
            openjdk17
            nodejs
            cacert
            git
            wget
            curl
          ];

          shellHook = ''
            export VENV_DIR="$(pwd)/.venv"

            echo "Создаём Python venv в $VENV_DIR..."
            if [ ! -d "$VENV_DIR" ]; then
              ${python}/bin/python -m venv "$VENV_DIR"
              echo "  venv создан"
            fi

            echo "Активируем venv..."
            source "$VENV_DIR/bin/activate"

            # УБРАТЬ --upgrade pip — ОПАСНО!
            # УБРАТЬ npm -g — НЕЛЬЗЯ В NIX!
            # УБРАТЬ wget/tar — НЕСТАБИЛЬНО!

            # Устанавливаем pip через get-pip.py (БЕЗОПАСНО)
            if [ ! -f "$VENV_DIR/bin/pip" ]; then
              echo "  Устанавливаем pip через get-pip.py..."
              curl -s https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
              python /tmp/get-pip.py
            fi

            # НЕ ОБНОВЛЯЕМ pip — он уже есть!
            # pip install --upgrade pip  # УБРАТЬ!

            echo "Устанавливаем backend/requirements.txt..."
            if [ -f "backend/requirements.txt" ]; then
              pip install -r backend/requirements.txt
              echo "  зависимости установлены"
            else
              echo "  ОШИБКА: backend/requirements.txt не найден"
            fi

            # УСТАНАВЛИВАЕМ spectral И newman ЛОКАЛЬНО
            echo "Устанавливаем spectral и newman локально..."
            npm config set prefix "$HOME/.local"
            npm install @stoplight/spectral-cli newman --prefix "$HOME/.local"

            # Kiterunner — вручную, без wget
            echo "Устанавливаем Kiterunner..."
            mkdir -p "$HOME/.local/bin"
            if [ ! -f "$HOME/.local/bin/kiterunner" ]; then
              echo "  Скачиваем kiterunner..."
              curl -L -o /tmp/kr.tar.gz "https://github.com/assetnote/kiterunner/releases/download/v1.5.1/kiterunner_1.5.1_linux_amd64.tar.gz"
              tar -xzf /tmp/kr.tar.gz -C /tmp kiterunner
              mv /tmp/kiterunner "$HOME/.local/bin/kiterunner"
              chmod +x "$HOME/.local/bin/kiterunner"
            fi

            # OWASP ZAP — вручную
            echo "Устанавливаем OWASP ZAP..."
            if [ ! -d "$HOME/zap" ]; then
              mkdir -p "$HOME/zap" "$HOME/.local/bin"
              curl -L -o /tmp/zap.tar.gz "https://github.com/zaproxy/zaproxy/releases/download/v2.15.0/ZAP_2.15.0_Linux.tar.gz"
              tar -xzf /tmp/zap.tar.gz -C "$HOME/zap" --strip-components=1
              cat > "$HOME/.local/bin/zap.sh" << 'EOF'
#!/bin/bash
"$HOME/zap/zap.sh" "$@"
EOF
              chmod +x "$HOME/.local/bin/zap.sh"
            fi

            export PATH="$HOME/.local/bin:$PATH"

            echo ""
            echo "Запуск: uvicorn backend/app:app --reload --host 0.0.0.0 --port 8080"
          '';
        };
      }
    );
}