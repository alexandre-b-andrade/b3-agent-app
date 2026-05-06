---
description: Executa testes do B3 Agent — TDD por módulo, Prove-It para bugs
---

# /test — B3 Agent

## Executar todos os testes

```bash
cd b3agent
PYTHONUTF8=1 B3_MOCK_MODE=true python -m pytest tests/test_b3agent.py -v --tb=short
```

## Critério de avanço por módulo

| Módulo | Teste mínimo para avançar |
|---|---|
| M1 portfolio_state | Lê XLSX, gera JSON correto, escreve de volta sem perda |
| M2 sources_rss | ≥3 fontes RSS coletam sem erro, estrutura correta |
| M3 scoring | Score 0-100 para 5 tickers, sem crash |
| M4 agent_run | Pipeline completo com dados mockados, sem erro |
| M5 report_generator | HTML válido, mensagem Telegram ≤3000 chars |
| M6 telegram_bot | /help e /carteira respondem corretamente |
| M7 nota_parser | 2 notas reais da Clear parseadas, campos corretos |
| M8 sources_scraping | ≥50% das fontes retornam dados |
| M9 sources_youtube | Transcrição ou fallback para ≥6 de 12 canais |
| M10 github_actions | Rodada completa no Actions, relatório no Drive, Telegram ok |

## Para bugs: Prove-It pattern

1. Escreva um teste que reproduz o bug (deve FALHAR com o código atual)
2. Confirme que o teste falha
3. Implemente o fix
4. Confirme que o teste passa
5. Execute a suite completa: zero regressões

```bash
# Exemplo: bug no parse_float com vírgula
def test_parse_float_handles_comma_decimal():
    # Este teste deve FALHAR antes do fix
    assert _parse_float("1.234,56") == 1234.56
```

## Estrutura de testes

```
tests/
└── test_b3agent.py    ← suite principal (50 testes)
    ├── TestCostTracker          (9 testes)
    ├── TestPortfolioStateHelpers (9 testes)
    ├── TestScoring              (11 testes)
    ├── TestNotaParser           (7 testes)
    ├── TestReportGenerator      (6 testes)
    ├── TestSourcesRSS           (5 testes)
    └── TestPipelineMock         (1 teste integração)
```

## Convenções de teste

- Testes são independentes — sem estado compartilhado entre testes
- Mock para: API Anthropic, Google Drive, Telegram, yfinance
- Nunca mockar entre funções internas — mockar apenas nas fronteiras do sistema
- `MOCK_MODE=true` isola todo o pipeline de dependências externas
- Todo nome de teste descreve o comportamento: `test_parse_float_handles_brl_format`
