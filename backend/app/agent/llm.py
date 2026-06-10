import os
from dotenv import load_dotenv

load_dotenv()


def get_llm():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=0,
        )
    else:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0,
        )
