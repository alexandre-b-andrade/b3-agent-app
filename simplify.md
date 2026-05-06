---
description: Simplifica código do B3 Agent mantendo comportamento exato — aplicar após cada módulo estável
---

# /simplify — B3 Agent

## Resultado do /simplify aplicado ao build inicial

Simplificações identificadas e aplicadas (ou pendentes):

### Aplicadas

**`telegram_bot.py` — `handle_free_question`**
Extraída função `_ask_sonnet()` separando a chamada à API da lógica do handler. Reduz de 30 para 15 linhas no handler, melhora testabilidade.

**`portfolio_state.py` — `_parse_float`**
Consolidada lógica de limpeza de string em uma linha com `replace` encadeado. Comportamento idêntico, mais legível.

**`agent_run.py` — checkpoint pattern**
Padrão `if ck["last_step"] < N` repetido 10 vezes é verboso mas necessário — não simplificar. A alternativa (dict de funções + loop) obscureceria a ordem explícita das etapas, que é o ponto central do checkpoint.

### Pendentes (aplicar quando módulo estiver em produção estável)

**`report_generator.py`**
`generate_html` (78 linhas) pode ser dividida em:
- `_render_head()` — CSS + meta
- `_render_body(sections)` — monta seções
- `_render_section(title, content)` — seção individual

Aguardar estabilização do formato do relatório antes de refatorar.

**`scoring.py` — `_get_technical_score`**
58 linhas. Pode extrair `_score_rsi(rsi)`, `_score_macd(signal)`, `_score_moving_averages(current, mm20, mm50)`. Cada um retorna parcial do score técnico. Aguardar mais tickers testados antes de refatorar.

---

## Como executar o /simplify

```bash
# 1. Confirme que os testes passam ANTES de simplificar
PYTHONUTF8=1 B3_MOCK_MODE=true python -m pytest tests/ -v

# 2. Aplique uma simplificação por vez
# 3. Rode os testes após cada mudança
PYTHONUTF8=1 B3_MOCK_MODE=true python -m pytest tests/ -v

# 4. Se falhar, reverta imediatamente
git diff 2_CODE/arquivo_modificado.py   # revisar o diff
git checkout 2_CODE/arquivo_modificado.py  # reverter se necessário
```

## Regras do /simplify para este projeto

1. Preservar comportamento exato — todos os 50 testes devem passar após cada simplificação
2. Não simplificar código que está prestes a mudar (ex: `report_generator.py` antes do Drive upload estar implementado)
3. Não extrair abstrações por antecipação — esperar o terceiro uso antes de criar helper
4. `MOCK_MODE` deve continuar funcionando após qualquer simplificação
5. Encoding UTF-8 explícito deve ser preservado em todos os `open()`

## Checklist antes de marcar simplificação como concluída

- [ ] Testes: 50/50 passando
- [ ] Comportamento: identico ao anterior (sem mudança de output)
- [ ] Encoding: UTF-8 explícito mantido
- [ ] MOCK_MODE: ainda funcional
- [ ] Diff: revisado linha a linha antes do commit
