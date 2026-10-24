import json
import logging
import time
from typing import Dict, Any, Optional
from groq import Groq, GroqError, RateLimitError, APIConnectionError, APIStatusError
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.timeout = settings.GROQ_TIMEOUT
        self.max_retries = settings.GROQ_MAX_RETRIES
        self._client: Optional[Groq] = None

    @property
    def client(self) -> Groq:
        if self._client is None:
            if not self.api_key:
                raise ValueError("GROQ_API_KEY is not configured in backend environment.")
            self._client = Groq(api_key=self.api_key, timeout=self.timeout)
        return self._client

    def chat_completion(
        self,
        messages: list,
        response_json: bool = True,
        temperature: float = 0.1,
        max_tokens: int = 3500
    ) -> Dict[str, Any]:
        """
        Execute Groq chat completion with retries, model fallback, and JSON parsing.
        """
        attempts = 0
        last_error = None
        models_to_try = [self.model, "llama-3.3-70b-versatile", "openai/gpt-oss-120b", "gemma2-9b-it", "qwen/qwen3.8-27b"]
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(models_to_try))
        current_model_idx = 0
        
        while attempts < self.max_retries:
            attempts += 1
            try:
                active_model = candidate_models[current_model_idx % len(candidate_models)]
                kwargs = {
                    "model": active_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                if response_json:
                    kwargs["response_format"] = {"type": "json_object"}

                response = self.client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content or ""
                
                if response_json:
                    try:
                        parsed = json.loads(content)
                        return parsed
                    except json.JSONDecodeError as jde:
                        logger.warning(f"Failed to parse JSON response on attempt {attempts}: {jde}. Content: {content[:200]}")
                        clean_content = content.strip()
                        if "```json" in clean_content:
                            clean_content = clean_content.split("```json")[1].split("```")[0].strip()
                        elif "```" in clean_content:
                            clean_content = clean_content.split("```")[1].split("```")[0].strip()
                        return json.loads(clean_content)
                else:
                    return {"text": content}

            except RateLimitError as rle:
                last_error = f"Groq rate limit exceeded: {str(rle)}"
                current_model_idx += 1
                logger.warning(f"Groq RateLimit on attempt {attempts}. Switching candidate model. Retrying in {1.5 * attempts}s...")
                time.sleep(1.5 * attempts)
            except APIConnectionError as ace:
                last_error = f"Network connection error contacting Groq API: {str(ace)}"
                logger.warning(f"Groq APIConnectionError on attempt {attempts}. Retrying...")
                time.sleep(1.5)
            except APIStatusError as ase:
                last_error = f"Groq status {ase.status_code}: {ase.message}"
                logger.error(f"Groq APIStatusError {ase.status_code}: {ase.message}")
                if ase.status_code in [401, 403]:
                    # Authentication failure, do not retry
                    raise RuntimeError("Authentication failed with Groq API. Please verify GROQ_API_KEY.")
                time.sleep(1)
            except Exception as e:
                last_error = str(e)
                logger.error(f"Unexpected Groq execution error on attempt {attempts}: {str(e)}")
                time.sleep(1)

        raise RuntimeError(f"Groq inference failed after {self.max_retries} attempts: {last_error}")

groq_service = GroqService()
