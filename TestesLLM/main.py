import os
from dotenv import load_dotenv
from groq import Groq

# Carregar variáveis de ambiente do arquivo .env na raiz do projeto
# Como estamos na pasta TestesLLM, subimos um nível para encontrar o .env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

# Buscar a chave GroqKey1
api_key = os.getenv("GroqKey1")

if not api_key:
    print("Erro: A chave 'GroqKey1' não foi encontrada no arquivo .env")
    exit(1)

# Inicializar o cliente Groq
client = Groq(api_key=api_key)

def chat_com_groq():
    print("--- Interação com Groq LLM Iniciada (digite 'sair' para encerrar) ---")
    
    # Histórico de mensagens para manter o contexto (opcional, mas recomendado para chat)
    messages = [
        {"role": "system", "content": "Você é um assistente útil e conciso."}
    ]

    while True:
        user_input = input("\nVocê: ")
        
        if user_input.lower() in ['sair', 'exit', 'quit']:
            print("Encerrando chat...")
            break

        if not user_input.strip():
            continue

        # Adicionar mensagem do usuário ao histórico
        messages.append({"role": "user", "content": user_input})

        try:
            # Chamar a API do Groq
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile", # Modelo padrão potente
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False,
            )

            # Obter a resposta
            response = completion.choices[0].message.content
            print(f"\nGroq: {response}")

            # Adicionar resposta da IA ao histórico
            messages.append({"role": "assistant", "content": response})

        except Exception as e:
            print(f"\nErro ao conectar com Groq: {e}")

if __name__ == "__main__":
    chat_com_groq()
