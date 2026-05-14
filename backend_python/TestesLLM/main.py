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

# Buscar a chave GroqKey1
api_key = os.getenv("GroqKey1")

if not api_key:
    print("Erro: A chave 'GroqKey1' não foi encontrada nos arquivos .env")
    exit(1)

# Inicializar o cliente Groq
client = Groq(api_key=api_key)

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

def get_history(id_serie, sigla_uf=None, limit=24):
    """Lista o histórico completo de dados de uma série temporal."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if sigla_uf:
            cursor.execute("""
                SELECT data_referencia as data, valor 
                FROM fact_serie_temporal 
                WHERE id_serie = ? AND sigla_uf = ?
                ORDER BY data_referencia DESC
                LIMIT ?
            """, (id_serie, sigla_uf, limit))
        else:
            cursor.execute("""
                SELECT data_referencia as data, valor 
                FROM fact_serie_temporal 
                WHERE id_serie = ? AND sigla_uf IS NULL
                ORDER BY data_referencia DESC
                LIMIT ?
            """, (id_serie, limit))
            
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
                    "sigla_uf": {
                        "type": "string",
                        "description": "Sigla da UF (ex: 'SP', 'RJ') para indicadores estaduais. Para indicadores nacionais ('Brasil'), omita ou passe nulo.",
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
            "content": "Você é um agente de inteligência artificial técnico e direto, especializado em consultar e responder perguntas baseadas estritamente nos dados de um projeto de crédito inclusivo. Você possui acesso a ferramentas para buscar os estados (UFs), as séries temporais (indicadores) e os históricos de dados. Sempre que o usuário pedir dados de algum estado ou série, identifique os parâmetros e chame as funções necessárias. Use apenas as informações que as ferramentas retornarem para compor sua resposta."
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
            # Primeira chamada para permitir que o modelo decida se usa ferramentas
            response = client.chat.completions.create(
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
                            sigla_uf=function_args.get("sigla_uf"),
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
                
                # Segunda chamada com o resultado das funções
                second_response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    temperature=0.3,
                    max_tokens=2048,
                )
                
                final_answer = second_response.choices[0].message.content
                print(f"\nAgente: {final_answer}")
                messages.append({"role": "assistant", "content": final_answer})

            else:
                final_answer = response_message.content
                print(f"\nAgente: {final_answer}")
                messages.append({"role": "assistant", "content": final_answer})

        except Exception as e:
            print(f"\nErro ao conectar com Groq: {e}")

if __name__ == "__main__":
    chat_com_groq()
