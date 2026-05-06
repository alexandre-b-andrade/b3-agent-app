---
description: Implementa o próximo módulo do B3 Agent de forma incremental — build, test, verify, commit
---

# /build — B3 Agent

Implemente o próximo módulo pendente do plan. Para cada módulo:

1. Leia os critérios de conclusão no PLAN.md para o módulo atual
2. Carregue o contexto relevante (módulos já implementados, interfaces definidas)
3. Escreva o código seguindo as convenções do projeto:
   - Encoding UTF-8 explícito em todos os `open()`
   - Secrets sempre via `os.environ.get()` ou `config.py`
   - `MOCK_MODE` respeitado para isolar dependências externas
   - Docstrings em todos os módulos e funções públicas
4. Execute os testes do módulo: `PYTHONUTF8=1 B3_MOCK_MODE=true python -m pytest tests/ -v --tb=short`
5. Verifique que todos os testes anteriores ainda passam (zero regressões)
6. Se falhar, corrija antes de avançar — nunca acumule falhas
7. Faça commit com mensagem descritiva: `feat(modulo): implementa X`
8. Marque o módulo como concluído no PLAN.md e avance para o próximo

## Ordem dos módulos

```
M1  portfolio_state     ← base: leitura/escrita XLSX e JSON
M2  sources_rss         ← fontes simples: RSS + Google Finance
M3  scoring             ← sistema de pontuação 0-100
M4  agent_run           ← pipeline completo com mocks
M5  report_generator    ← HTML + mensagem Telegram
M6  telegram_bot        ← comandos + perguntas livres
M7  nota_parser         ← PDF Clear → OPERAÇÕES
M8  sources_scraping    ← sites adicionais
M9  sources_youtube     ← transcrições YouTube
M10 github_actions      ← workflows + produção
```

## Antes de escrever qualquer código

- Leia a Spec v1.2 (seção correspondente ao módulo)
- Leia as interfaces definidas no PLAN.md para o módulo
- Confirme que os módulos dependentes já passaram nos seus testes

## Regras de escopo

Toque apenas o que o módulo atual requer. Se identificar algo a melhorar em outro módulo, registre como issue — não corrija durante o build do módulo atual.

## Conventions

```python
# config.py é sempre o ponto central de configuração
from config import ANTHROPIC_API_KEY, MODEL_HAIKU, MOCK_MODE

# Secrets nunca hardcoded
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)  # correto
client = anthropic.Anthropic(api_key="sk-ant-...")        # NUNCA

# MOCK_MODE isola dependências externas
if MOCK_MODE:
    return _mock_response()
return _real_api_call()

# encoding explícito
with open("file.json", encoding="utf-8") as f:
    data = json.load(f)
```
