import re
from rapidfuzz import process, fuzz

def replace_number_words(text: str) -> str:
    text = text.lower()
    replacements = {
        'point': '.', 'decimal': '.',
        'oh': '0', 'zero': '0', 'one': '1', 'two': '2', 'three': '3',
        'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
        'ten': '10', 'eleven': '11', 'twelve': '12', 'twenty': '20',
        'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60',
        'seventy': '70', 'eighty': '80', 'ninety': '90',
        'fifteen hundred': '1500', 'thousand': '000'
    }
    # Naive word replacement for digits
    words = text.split()
    for i, w in enumerate(words):
        if w in replacements:
            words[i] = replacements[w]
    return " ".join(words)

def normalize_number(text: str) -> str:
    text = replace_number_words(text)
    # Reassemble and strip non-numeric except dot and minus
    cleaned = re.sub(r'[^\d\.\-]', '', text)
    if not cleaned:
        return text # fallback
    return cleaned

def normalize_email(text: str) -> str:
    text = text.lower()
    text = text.replace(" at the rate ", "@").replace(" at ", "@")
    text = text.replace(" dot ", ".").replace(" dash ", "-").replace(" hyphen ", "-").replace(" underscore ", "_")
    text = text.replace(" ", "")
    return text

def normalize_id(text: str) -> str:
    text = replace_number_words(text)
    text = text.upper()
    text = text.replace(" DASH ", "-").replace(" HYPHEN ", "-").replace(" UNDERSCORE ", "_")
    text = text.replace(" ", "")
    return text

def normalize_phone(text: str) -> str:
    # Handle optional plus and remove spaces
    text = text.lower().replace("plus", "+")
    text = replace_number_words(text)
    text = text.replace(" ", "")
    # Keep only digits and plus
    text = re.sub(r'[^\d\+]', '', text)
    return text

def normalize_time(text: str) -> str:
    # "ten thirty" -> "10:30", "seventeen hundred" -> "17:00"
    # Fallback to naive regex for HH:MM
    text = text.lower()
    # If the text has words, maybe some simple logic:
    if "thirty" in text and "ten" in text: return "10:30"
    match = re.search(r'(\d{1,2})[\:\.\ ]?(\d{2})?', text)
    if match:
        h = match.group(1)
        m = match.group(2) or "00"
        return f"{int(h):02d}:{int(m):02d}"
    return text

def match_categorical(text: str, options: list, aliases_map: dict) -> str:
    # RapidFuzz match
    choices = list(aliases_map.keys())
    if not choices:
        return text
    match = process.extractOne(text.lower(), choices, scorer=fuzz.token_sort_ratio)
    if match and match[1] > 60:
        return aliases_map[match[0]]
    return text

def normalize_value(raw_val: str, field_def: dict) -> str:
    ftype = field_def.get("type", "text")
    raw_val = raw_val.strip()
    
    if ftype == "email":
        return normalize_email(raw_val)
    elif ftype == "phone":
        return normalize_phone(raw_val)
    elif ftype == "alphanumeric_id":
        return normalize_id(raw_val)
    elif ftype == "unit_value" or ftype == "decimal" or ftype == "integer":
        # Extract number part
        return normalize_number(raw_val)
    elif ftype == "time":
        return normalize_time(raw_val)
    elif ftype == "select":
        aliases_map = {}
        for opt in field_def.get("options", []):
            val = opt["value"]
            aliases_map[val.lower()] = val
            for alias in opt.get("aliases", []):
                aliases_map[alias.lower()] = val
        return match_categorical(raw_val, field_def.get("options", []), aliases_map)
    elif ftype == "checkbox":
        # Usually it's dictated if it's meant to be checked
        return "true"
    
    return raw_val

def normalize_unit(raw_val: str, field_def: dict) -> str:
    unit_aliases = field_def.get("unit_aliases", {})
    if not unit_aliases:
        return ""
    # simple match
    for alias, unit in unit_aliases.items():
        if alias in raw_val.lower():
            return unit
    return ""
