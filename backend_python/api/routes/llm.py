from fastapi import APIRouter, HTTPException
import os
import sqlite3
import json
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from groq import Groq
import logging

from api.config import DB_FILENAME
from dotenv import load_dotenv

router = APIRouter()
logger = logging.getLogger(__name__)

# Carregar env da raiz
root_dotenv = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(root_dotenv)

# Caminho do banco de dados
DIRETORIO_BANCO = Path(__file__).resolve().parent.parent.parent.parent / "database"
db_path = DIRETORIO_BANCO / DB_FILENAME

# Inicializar o cliente Groq
api_key = os.getenv("GroqKey1")
client = Groq(api_key=api_key) if api_key else None


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

class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: Optional[str]
    history: List[Dict[str, Any]]


@router.post("/chat", response_model=ChatResponse)
async def chat_with_llm(request: ChatRequest):
    global client
    if not client:
        api_key = os.getenv("GroqKey1")
        if api_key:
            client = Groq(api_key=api_key)
        else:
            raise HTTPException(status_code=500, detail="Chave da API do Groq (GroqKey1) não configurada no servidor.")
        
    messages = [
        {
            "role": "system",
            "content": "Você é um agente técnico de IA para consulta de dados de crédito inclusivo. REGRAS CRÍTICAS:\n1. Cada estado e o Brasil possuem IDs de série ÚNICOS. NUNCA reutilize o id_serie de um estado para outro (ex: o ID do Acre não serve para Minas Gerais).\n2. Se o usuário perguntar sobre um estado (ex: MG, SP), SEMPRE chame primeiro get_series(abrangencia='MG') para descobrir os IDs corretos daquele estado.\n3. Para o nível nacional, chame get_series(abrangencia='Brasil').\n4. Use data_inicio e data_fim em get_history para filtrar datas quando especificado.\n5. Responda apenas baseado nos dados."
        }
    ]
    
    # Adicionar histórico anterior
    for msg in request.history:
        # Apenas passamos para frente o que for de user e assistant para simplificar (sem os tools)
        # Se você quiser manter os tool_calls na requisição, a tipagem ficaria mais complexa
        if msg.role in ["user", "assistant"]:
            messages.append({"role": msg.role, "content": msg.content})
            
    # Adicionar a nova mensagem do usuário
    messages.append({"role": "user", "content": request.message})
    
    try:
        while True:
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
                # Continua o loop do While para o próximo step
            else:
                final_answer = response_message.content
                # O histórico vai ser retornado para o frontend, podemos formatar de forma mais amigável se quisermos
                # Filtramos as messages retornadas para ter um formato simples de user e assistant
                return {
                    "response": final_answer,
                    "history": messages
                }

    except Exception as e:
        logger.error(f"Erro na comunicação com a API LLM: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar a requisição LLM: {str(e)}")
