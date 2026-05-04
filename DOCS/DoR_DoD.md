# ✅ Definition of Ready (DoR) e Definition of Done (DoD)

**Projeto:** API 3 —  de Crédito Inclusivo (DM Card)  
**Equipe:** Galáticos — FATEC SJC | ADS 3 | 2026-1

---

## Definition of Ready (DoR)

> Uma User Story só pode entrar em uma Sprint se **todos** os itens abaixo estiverem marcados.

### Checklist da User Story

- [ ] Tem título claro, descrição bem definida e objetivo compreendido por todos os membros
- [ ] Segue o formato: *"Como \<tipo de usuário\>, quero \<funcionalidade\> para \<valor de negócio\>"*
- [ ] Tem critérios de aceitação escritos e validados com o PO
- [ ] Tem regras de negócio documentadas (texto ou diagrama)
- [ ] Foi estimada pela equipe (Story Points via Planning Poker)
- [ ] Não possui dependências bloqueadoras não resolvidas
- [ ] Compreensão validada com todos os membros do time

### Checklist de Artefatos Correlatos

- [ ] Wireframe ou mockup (Figma) disponível e aprovado
- [ ] Modelo de dados correspondente definido (tabelas e campos)
- [ ] Estratégia de testes definida (o que será testado e como)
- [ ] Endpoint(s) de API documentados (método, rota, payload esperado)
- [ ] Variáveis de ambiente necessárias mapeadas no `.env.example`

---

## Definition of Done (DoD)

> Uma User Story só é considerada **entregue** se **todos** os itens abaixo forem atendidos.

### Código

- [ ] Código versionado no GitHub na branch correta (nunca direto na `main`)
- [ ] Pull Request (PR) aberto para revisão antes do merge
- [ ] Code Review realizado por pelo menos um outro membro da equipe
- [ ] Código comentado desnecessário removido
- [ ] Sem `console.log` ou `print` de debug em produção
- [ ] Variáveis e funções nomeadas de forma clara (sem abreviações obscuras)

### Qualidade e Testes

- [ ] Testes de unidade escritos para as funções críticas de negócio
- [ ] Cobertura de testes mínima de 70% nas funções novas
- [ ] Teste de segurança básico realizado (ex: validação de inputs, SQL Injection)
- [ ] Funcionalidade testada manualmente em ambiente local antes do PR

### Backend (FastAPI / Python)

- [ ] Endpoint documentado automaticamente no Swagger (`/docs`)
- [ ] Validação de schema com Pydantic implementada
- [ ] Queries parametrizadas (sem concatenação de strings SQL)
- [ ] Erros tratados com `try/except` e retorno de HTTP status codes corretos
- [ ] Stack trace **não** exposto no corpo da resposta de erro em produção

### Banco de Dados

- [ ] Migração ou script de criação atualizado caso haja mudança de schema
- [ ] Índices adicionados se a query for para colunas frequentemente filtradas
- [ ] Dados de seed atualizados no `criar_banco_dados.py` se necessário

### Frontend (quando aplicável)

- [ ] Componente responsivo (funciona em desktop e tela de 1280px+)
- [ ] Mensagens de erro exibidas ao usuário de forma amigável
- [ ] Token JWT não exposto no `localStorage` (usar `sessionStorage` ou cookie `httpOnly`)
- [ ] Rota protegida redireciona para login se não autenticado

### Documentação e Processo

- [ ] Branch deletada após merge aprovado
- [ ] Task movida para "Done" no quadro de gestão (Jira/Trello)
- [ ] Burndown atualizado no arquivo `burndown.xlsx`
- [ ] Vídeo de demonstração gravado (para Sprint Review)
- [ ] README ou pasta `docs/` atualizada se houver mudança de instalação/uso

---

## Padrão de Mensagem de Commit

Formato obrigatório para todos os commits:

```
<tipo> (<id_task>): <descrição curta no imperativo>
```

| Tipo | Quando usar |
|---|---|
| `feat` | Adição de nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Atualização de documentação |
| `style` | Formatação sem alterar lógica |
| `refactor` | Refatoração sem alterar funcionalidade |
| `test` | Adição ou modificação de testes |
| `chore` | Atualizações menores de config/dependências |

**Exemplos:**
```
feat (TSK-11): implementar rotas de autenticação JWT
fix (TSK-13): corrigir filtro de estado no dashboard
docs (TSK-01): adicionar dicionário de dados ao repositório
```

---

## Nota sobre o Estado Atual do Projeto

O projeto API-3 está atualmente em fase de protótipo, e nem todas as User Stories atendem aos critérios do DoD. Especificamente:

- **Segurança:** Não há autenticação real implementada; o sistema usa login simulado.
- **Tratamento de Erros:** Não há handler global de exceções configurado para ocultar stack traces consistentemente.
- **Persistência de Dados:** Funcionalidades como histórico de simulações e consultas de IA não estão implementadas, apesar de tabelas placeholders existirem no banco.

Essas violações serão endereçadas em sprints futuras para alcançar o estado final descrito na documentação.
