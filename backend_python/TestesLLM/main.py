import os
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

def chat_com_groq():
    print("--- Interação com Groq LLM (Backend Python) ---")
    print("(digite 'sair' para encerrar)")
    
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

        messages.append({"role": "user", "content": user_input})

        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False,
            )

            response = completion.choices[0].message.content
            print(f"\nGroq: {response}")
            messages.append({"role": "assistant", "content": response})

        except Exception as e:
            print(f"\nErro ao conectar com Groq: {e}")

if __name__ == "__main__":
    chat_com_groq()
