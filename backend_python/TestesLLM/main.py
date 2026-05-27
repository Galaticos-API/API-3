import os
import sqlite3
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# Tentar carregar o .env da raiz do projeto (dois níveis acima)
# e o .env da pasta backend_python (um nível acima)
# O GroqKey1 está na raiz.
root_dotenv = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
backend_dotenv = os.path.join(os.path.dirname(__file__), '..', '.env')

load_dotenv(root_dotenv)
load_dotenv(backend_dotenv)

class FallbackGroqClient:
    def __init__(self):
        self.clients = []
        self.current_index = 0
        self._initialized = False

    def _initialize_clients(self):
        if self._initialized:
            return
            
        self.api_keys = []
        for i in range(1, 6):
            key = os.getenv(f"GroqKey{i}")
            if key and key.strip():
                self.api_keys.append((f"GroqKey{i}", key.strip()))
        
        self.clients = []
        for name, key in self.api_keys:
            try:
                self.clients.append({
                    "name": name,
                    "client": Groq(api_key=key)
                })
            except Exception as e:
                print(f"Erro ao instanciar o cliente Groq para a chave {name}: {e}")
                
        self._initialized = True

    def execute_with_fallback(self, **kwargs):
        self._initialize_clients()
        
        if not self.clients:
            raise RuntimeError("Nenhuma chave de API do Groq válida configurada (esperadas chaves de GroqKey1 a GroqKey5 no arquivo .env).")
            
        attempts = 0
        max_attempts = len(self.clients)
        last_error = None
        
        while attempts < max_attempts:
            client_info = self.clients[self.current_index]
            client_name = client_info["name"]
            client_obj = client_info["client"]
            
            try:
                response = client_obj.chat.completions.create(**kwargs)
                return response
            except Exception as e:
                last_error = e
                print(f"\n[!] Falha na chamada com a chave {client_name}. Erro: {e}. Tentando a próxima chave disponível...")
                self.current_index = (self.current_index + 1) % len(self.clients)
                attempts += 1
                
        raise RuntimeError(f"Todas as chaves da API do Groq falharam ou atingiram o limite. Último erro: {str(last_error)}")

# Inicializar o gerenciador de fallback do Groq
fallback_client = FallbackGroqClient()
fallback_client._initialize_clients()

if not fallback_client.clients:
    print("Erro: Nenhuma chave da API do Groq (GroqKey1 a GroqKey5) foi encontrada nos arquivos .env")
    exit(1)

# Caminho do banco de dados SQLite
db_path = Path(__file__).resolve().parent.parent.parent / "database" / "credito_inclusivo.db"

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_ufs():
    """Retorna todos os estados do Brasil para popular Selects e Filtros."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT sigla_uf, nome, regiao_br FROM dim_uf ORDER BY nome ASC")
        rows = cursor.fetchall()
        return json.dumps([dict(row) for row in rows])
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        conn.close()

def get_series(abrangencia=None, limit=30):
    """Retorna o catálogo de séries/indicadores disponíveis no banco."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if abrangencia:
            cursor.execute("""
                SELECT id_serie, nome_indicador, categoria 
                FROM dim_serie 
                WHERE ativo = 1 AND abrangencia = ?
                ORDER BY categoria, nome_indicador
                LIMIT ?
            """, (abrangencia, limit))
        else:
            cursor.execute("""
                SELECT id_serie, nome_indicador, categoria, abrangencia 
                FROM dim_serie 
                WHERE ativo = 1
                ORDER BY categoria, abrangencia, nome_indicador
                LIMIT ?
            """, (limit,))
        rows = cursor.fetchall()
        return json.dumps([dict(row) for row in rows])
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        conn.close()

def get_history(id_serie, data_inicio=None, data_fim=None, limit=24):
    """Lista o histórico completo de dados de uma série temporal."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = "SELECT data_referencia as data, valor FROM fact_serie_temporal WHERE id_serie = ?"
        params = [id_serie]
        
        if data_inicio:
            query += " AND data_referencia >= ?"
            params.append(data_inicio)
        if data_fim:
            query += " AND data_referencia <= ?"
            params.append(data_fim)
            
        query += " ORDER BY data_referencia DESC LIMIT ?"
        params.append(limit)
            
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return json.dumps([dict(row) for row in rows])
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        conn.close()

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_ufs",
            "description": "Retorna todos os estados do Brasil com suas siglas (sigla_uf) e nomes.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_series",
            "description": "Retorna o catálogo de séries/indicadores disponíveis. Informa o id_serie e se é estadual ou nacional (abrangencia).",
            "parameters": {
                "type": "object",
                "properties": {
                    "abrangencia": {
                        "type": "string",
                        "description": "Filtre por 'Brasil' ou por uma UF específica (ex: 'SP', 'RJ'). Omitir para ver todas as abrangências.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Quantidade máxima de resultados a retornar. Padrão é 30.",
                    }
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_history",
            "description": "Lista o histórico de dados (data e valor) de uma série temporal. Retorna sempre os dados mais recentes primeiro.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id_serie": {
                        "type": "integer",
                        "description": "ID numérico da série. Identificador necessário para buscar dados.",
                    },
                    "data_inicio": {
                        "type": "string",
                        "description": "Filtro opcional de data inicial no formato YYYY-MM-DD (ex: '2018-01-01').",
                    },
                    "data_fim": {
                        "type": "string",
                        "description": "Filtro opcional de data final no formato YYYY-MM-DD.",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Quantidade máxima de registros a retornar. Padrão é 24 (últimos 2 anos).",
                    }
                },
                "required": ["id_serie"],
            },
        },
    }
]

available_functions = {
    "get_ufs": get_ufs,
    "get_series": get_series,
    "get_history": get_history,
}

def chat_com_groq():
    print("--- Agente de IA com Groq (Acesso aos Dados) ---")
    print("(digite 'sair' para encerrar)")
    
    messages = [
        {
            "role": "system",
            "content": "Você é um agente técnico de IA para consulta de dados de crédito inclusivo. REGRAS CRÍTICAS:\n1. Cada estado e o Brasil possuem IDs de série ÚNICOS. NUNCA reutilize o id_serie de um estado para outro (ex: o ID do Acre não serve para Minas Gerais).\n2. Se o usuário perguntar sobre um estado (ex: MG, SP), SEMPRE chame primeiro get_series(abrangencia='MG') para descobrir os IDs corretos daquele estado.\n3. Para o nível nacional, chame get_series(abrangencia='Brasil').\n4. Use data_inicio e data_fim em get_history para filtrar datas quando especificado.\n5. Responda apenas baseado nos dados."
        }
    ]

    while True:
        try:
            user_input = input("\nVocê: ")
        except EOFError:
            break
            
        if user_input.lower() in ['sair', 'exit', 'quit']:
            print("Encerrando chat...")
            break

        if not user_input.strip():
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            while True:
                response = fallback_client.execute_with_fallback(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    tools=tools,
                    tool_choice="auto",
                    temperature=0.1,
                    max_tokens=2048,
                )

                response_message = response.choices[0].message
                tool_calls = response_message.tool_calls

                # Se o modelo decidiu chamar alguma função
                if tool_calls:
                    tool_calls_dict = []
                    for t in tool_calls:
                        tool_calls_dict.append({
                            "id": t.id,
                            "type": t.type,
                            "function": {
                                "name": t.function.name,
                                "arguments": t.function.arguments
                            }
                        })
                    
                    messages.append({
                        "role": response_message.role,
                        "content": response_message.content,
                        "tool_calls": tool_calls_dict
                    })
                    
                    # Se o agente enviou um texto explicando a ação antes da ferramenta, a gente imprime
                    if response_message.content:
                        print(f"\nAgente (Pensando): {response_message.content}")
                    
                    for tool_call in tool_calls:
                        function_name = tool_call.function.name
                        function_to_call = available_functions[function_name]
                        function_args = json.loads(tool_call.function.arguments)
                        
                        print(f"[*] Agente chamando ferramenta: {function_name}({function_args})")
                        
                        if function_name == "get_ufs":
                            function_response = function_to_call()
                        elif function_name == "get_series":
                            function_response = function_to_call(
                                abrangencia=function_args.get("abrangencia"),
                                limit=function_args.get("limit", 30)
                            )
                        elif function_name == "get_history":
                            function_response = function_to_call(
                                id_serie=function_args.get("id_serie"),
                                data_inicio=function_args.get("data_inicio"),
                                data_fim=function_args.get("data_fim"),
                                limit=function_args.get("limit", 24)
                            )

                        messages.append(
                            {
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": function_response,
                            }
                        )
                    # O loop continua para o agente processar o resultado e decidir o que fazer
                else:
                    final_answer = response_message.content
                    print(f"\nAgente: {final_answer}")
                    messages.append({"role": "assistant", "content": final_answer})
                    break

        except Exception as e:
            print(f"\nErro ao conectar com Groq: {e}")

if __name__ == "__main__":
    chat_com_groq()
