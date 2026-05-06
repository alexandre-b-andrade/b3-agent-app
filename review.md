---
description: Review de código do B3 Agent em cinco eixos antes de avançar para o próximo módulo
---

# /review — B3 Agent

## Resultado do review automático (realizado durante o build inicial)

**Veredicto: APROVADO com observações**

50/50 testes passando. Sem vulnerabilidades críticas. Um TODO pendente documentado.

---

### Problemas críticos
Nenhum.

### Problemas importantes

- `agent_run.py:359` — TODO: upload para Google Drive ainda não implementado. O relatório é salvo localmente em `3_OUTPUTS/`. Implementar no Ship 2 (seção 8.7 da Spec).
- `scoring.py` — `_get_technical_score` faz chamada yfinance em runtime. Em produção, se yfinance falhar, o score cai para neutro (10.0) silenciosamente. Adicionar logging de fallback.
- `telegram_bot.py` — `cmd_stop` não valida se o novo stop é razoável (ex: stop acima do preço atual em compra). Adicionar validação básica no Ship 2.

### Sugestões

- `report_generator.py` — `generate_html` e `generate_telegram_message` têm mais de 80 linhas. Candidatas a extração de helpers quando o módulo estiver estável.
- `portfolio_state.py` — `_build_state` poderia usar `dataclasses` para as posições, melhorando a clareza das interfaces entre módulos.
- `agent_run.py` — O checkpoint não persiste o HTML gerado (etapa 7) por ser muito grande. Documentar explicitamente que a etapa 7 sempre re-gera o HTML se retomada.

### O que está bem feito

- Separação clara de responsabilidades: cada módulo tem uma única função
- `CostTracker` rastreia custo por etapa e expõe HTML e texto para os dois canais
- Política tudo-ou-nada no parser de notas evita estado inconsistente
- MOCK_MODE isola completamente as integrações externas nos testes
- Encoding UTF-8 explícito em todos os `open()` — sem surpresas no Windows
- Feriados da B3 em arquivo separado, atualizável sem tocar no código

---

## Como executar o review

```bash
# Cinco eixos automatizados
PYTHONUTF8=1 B3_MOCK_MODE=true python -m pytest tests/ -v

# Verificação de secrets hardcoded
grep -rn "sk-ant-\|password=\|TOKEN=" 2_CODE/

# Verificação de open() sem encoding
grep -rn "open(" 2_CODE/ | grep -v "encoding"

# Funções longas (>50 linhas)
python -c "
import ast, sys
from pathlib import Path
for f in Path('2_CODE').glob('*.py'):
    tree = ast.parse(f.read_text(encoding='utf-8'))
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            size = (node.end_lineno or 0) - node.lineno
            if size > 50:
                print(f'{f.name}:{node.lineno} {node.name} ({size} linhas)')
"
```
