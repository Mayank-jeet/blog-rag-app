from tavily import TavilyClient
import os

client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def search_web(query: str, max_results: int = 3) -> dict:
    return client.search(query=query, max_results=max_results, include_answer=True)