---
description: Checklist de lançamento incremental do B3 Agent — 5 ships em ordem
---

# /ship — B3 Agent

O projeto é lançado em 5 ships incrementais. Cada ship tem um critério de go/no-go claro.

---

## Ship 1 — Bot Telegram responde /help e /carteira

**O que funciona:** bot em polling, comandos básicos, leitura de portfolio_state.json local.
**O que NÃO está ativo:** pipeline de recomendações, notas de corretagem.

### Checklist go/no-go

- [ ] `python 2_CODE/telegram_bot.py` inicia sem erro
- [ ] `/help` responde com lista de comandos
- [ ] `/carteira` retorna snapshot da carteira inicial (BBAS3, VALE3, CVCB3, CASH)
- [ ] `/status` retorna custo zero (nenhuma rodada ainda)
- [ ] `/stop VALE3 64.50` atualiza portfolio_state.json e confirma
- [ ] Pergunta livre recebe resposta do Sonnet (custo registrado)
- [ ] Secrets verificados no GitHub: ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

### Rollback
Parar o processo do bot. Nenhum dado permanente foi alterado.

---

## Ship 2 — Pipeline completo via /rodar

**O que funciona:** rodada manual completa, relatório HTML salvo localmente, mensagem Telegram com link.
**O que NÃO está ativo:** Google Drive upload, rodada automática diária.

### Checklist go/no-go

- [ ] `/rodar` no Telegram aciona `daily_run.yml` via workflow_dispatch
- [ ] Pipeline completa as 10 etapas sem erro
- [ ] Relatório HTML criado em `3_OUTPUTS/` com custo detalhado no cabeçalho
- [ ] Mensagem Telegram recebida com carteira + recomendações + link
- [ ] Mensagem ≤ 3000 caracteres
- [ ] Custo da rodada exibido corretamente
- [ ] `portfolio_state.json` e `agent_memory.json` commitados no repo
- [ ] Posições BBAS3, VALE3, CVCB3 avaliadas nas recomendações

### Rollback
Reverter commits do agente: `git revert HEAD`. O `portfolio_state.json` volta ao estado anterior.

---

## Ship 3 — Atualização de carteira via /atualizar

**O que funciona:** parsing de notas da Clear, atualização do B3_DATABASE.xlsx no Drive, reconciliação da carteira.

### Checklist go/no-go

- [ ] Depositar nota real da Clear em `/B3 Agent/Notas de Corretagem/2026/`
- [ ] `/atualizar` no Telegram aciona `update_portfolio.yml`
- [ ] Nota processada sem erro: todos os campos extraídos corretamente
- [ ] Aba OPERAÇÕES atualizada no Drive
- [ ] Aba CARTEIRA HOJE atualizada com novo snapshot
- [ ] `portfolio_state.json` reflete a nova posição
- [ ] Nota não é reprocessada em segundo acionamento (idempotente)
- [ ] Erro em nota inválida: mensagem de erro clara no Telegram, carteira não alterada

### Rollback
Remover nome da nota de `agent_memory.json["processed_notas"]` e reverter manualmente as linhas adicionadas no XLSX.

---

## Ship 4 — Rodada automática diária via GitHub Actions

**O que funciona:** cron 16h UTC (13h BRT) em dias úteis, verificação de feriados, checkpoint de retomada.

### Checklist go/no-go

- [ ] Aguardar próximo dia útil às 13h BRT
- [ ] GitHub Actions executa `daily_run.yml` automaticamente
- [ ] Log do Actions: todas as 10 etapas concluídas com sucesso
- [ ] Relatório HTML criado no Drive (não sobrescrito)
- [ ] Mensagem Telegram recebida automaticamente
- [ ] Em feriado: mensagem de ausência de pregão enviada
- [ ] Simular falha na etapa 5: checkpoint salvo, próxima execução retoma da etapa 5

### Rollback
Desativar o workflow no GitHub: Actions → daily_run.yml → Disable workflow.

---

## Ship 5 — Todas as fontes ativas (scraping + YouTube)

**O que funciona:** todas as 12 fontes de sites + 12 canais YouTube + leitura de Info do Mercado.

### Checklist go/no-go

- [ ] Pelo menos 8 das 12 fontes de scraping retornam dados
- [ ] Pelo menos 6 dos 12 canais YouTube: transcrição ou fallback
- [ ] PDF de relatório manual processado da pasta Info do Mercado
- [ ] Fontes indisponíveis listadas no relatório HTML (não causam falha)
- [ ] Custo total da rodada com todas as fontes: verificar dentro do esperado
- [ ] Rate limit: nenhum IP bloqueado após 5 rodadas consecutivas

### Rollback
Desativar fontes problemáticas em `sources_scraping.py` comentando da lista. O pipeline continua com as fontes disponíveis.

---

## Decisão go/no-go geral

**GO** se: todos os itens do checklist do ship atual marcados, zero falhas nos testes, custo dentro do esperado.

**NO-GO** se: qualquer item crítico não passou, erro não tratado no pipeline, ou custo acima de US$ 0.50 por rodada.
