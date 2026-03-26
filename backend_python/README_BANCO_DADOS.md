# 🗄️ Script de Criação do Banco de Dados

## Como usar

### 1️⃣ Primeira execução (criar o banco)

```bash
cd backend_python
python criar_banco_dados.py
```

Este comando irá:
- ✅ Criar o arquivo `credito_inclusivo.db` na pasta `database/`
- ✅ Criar todas as tabelas (11 tabelas)
- ✅ Criar todos os índices (8 índices)
- ✅ Inserir dados iniciais:
  - 1 usuário admin
  - 27 estados brasileiros
  - 29 séries de indicadores do BCB

### 2️⃣ Para próximas execuções

O script usa `CREATE TABLE IF NOT EXISTS` e `INSERT OR IGNORE`, então é seguro rodar novamente. Ele não vai duplicar dados.

### 📁 Estrutura criada

```
Banco: SQLite 3
Arquivo: database/credito_inclusivo.db
Codificação: UTF-8

TABELAS:
├─ AUTENTICAÇÃO
│  ├─ usuario (1 registro)
│  └─ sessao
├─ DIMENSÕES
│  ├─ dim_uf (27 registros)
│  └─ dim_serie (29 registros)
├─ FATOS
│  ├─ fact_serie_temporal
│  └─ fact_simulacao_risco
└─ OPERACIONAIS
   ├─ ranking_oportunidade
   ├─ consulta_ia
   └─ log_auditoria
```

### 🔑 Chaves e Índices

**Foreign Keys** (habilitadas via PRAGMA):
- usuario_id → usuario.id
- sigla_uf → dim_uf.sigla_uf
- id_serie → dim_serie.id_serie

**Índices** para otimizar queries dinâmicas:
- `idx_fst_uf` - para filtros por estado
- `idx_fst_data` - para filtros por data
- `idx_fst_serie_data` - para séries temporais
- `idx_rank_score` - ordenação por score
- E mais 4 índices...

### 👤 Usuário Admin

```
Email: admin@dm.com.br
Senha (HASH): SUBSTITUIR_PELO_HASH_BCRYPT
```

⚠️ **TODO**: Antes de usar em produção, gere um hash bcrypt para a senha.

### 📊 Séries do BCB Incluídas

**Crédito e Inadimplência:**
- 20542, 20540, 20541: Saldos de crédito
- 20631, 20633, 20634: Concessões
- 21082, 21083, 21084: Inadimplência
- 20714, 20715: Taxas de juros
- 20783: Spread bancário
- 29037, 29038, 19882: Endividamento

**Macroeconomia:**
- 433, 13522: IPCA
- 11, 432, 4390: Selic
- 1, 3697: Dólar
- 24369: Desemprego
- 1207, 22099: PIB

**Mercado:**
- 7: Ibovespa
- 189: IGP-M
- 226: TR
- 196: Poupança

### 🔗 Próximas Etapas

Para popular com dados reais:
```bash
python etl_bcb.py
```

### 📝 Notas Técnicas

- **PRAGMA foreign_keys = ON**: Foreign keys habilitadas
- **PRAGMA journal_mode = WAL**: Write-Ahead Logging para melhor concorrência
- **PRIMARY KEY composta** em fact_serie_temporal para evitar duplicatas
- **Timestamps automáticos** via `datetime('now')`

### 🆘 Troubleshooting

**Erro: "database is locked"**
- Feche outros programas acessando o banco (DBeaver, etc)

**Erro: "permission denied"**
- Verifique permissões da pasta `database/`

**Precisa reiniciar?**
- Deletes o arquivo `credito_inclusivo.db` e rode o script novamente

---

✅ Script pronto para produção!
