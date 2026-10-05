import re
from rapidfuzz import process, fuzz
from typing import Dict, Any, List
from .normalizers import normalize_value, normalize_unit
from ..schemas import get_schema

class Extractor:
    def __init__(self):
        self.schema = get_schema()
        
    def _get_section(self, section_id: str):
        for s in self.schema["sections"]:
            if s["id"] == section_id:
                return s
        return None

    def extract(self, transcript: str, section_id: str) -> Dict[str, Any]:
        section = self._get_section(section_id)
        if not section:
            return {"fields": [], "unmatched_segments": transcript, "warnings": [f"Section {section_id} not found."]}

        transcript = transcript.lower().strip()
        fields_def = section.get("fields", [])
        
        # Build anchor mapping
        anchor_map = {}
        all_aliases = []
        for f in fields_def:
            for alias in f.get("aliases", []):
                all_aliases.append(alias.lower())
                anchor_map[alias.lower()] = f
        
        # Sort aliases by length descending for longest match first
        all_aliases.sort(key=len, reverse=True)
        
        # Find anchors in transcript
        found_anchors = []
        remaining_transcript = transcript
        
        # Very basic extraction: search for aliases in string
        # A more robust approach uses regex or sliding window.
        
        # We will split by words and find spans
        words = transcript.split()
        
        idx = 0
        while idx < len(words):
            best_match = None
            best_len = 0
            best_alias = ""
            for alias in all_aliases:
                alias_words = alias.split()
                if len(alias_words) <= len(words) - idx:
                    window = " ".join(words[idx:idx+len(alias_words)])
                    # exact match or very high fuzzy match
                    score = fuzz.ratio(window, alias)
                    if score > 85:
                        if len(alias_words) > best_len:
                            best_match = anchor_map[alias]
                            best_len = len(alias_words)
                            best_alias = alias
            if best_match:
                found_anchors.append({
                    "start_idx": idx,
                    "end_idx": idx + best_len,
                    "field": best_match,
                    "alias": best_alias
                })
                idx += best_len
            else:
                idx += 1
                
        # Now we have anchors. The value for an anchor is the text between it and the next anchor.
        extracted_fields = []
        unmatched_words = []
        
        if not found_anchors:
            unmatched_words = words
        else:
            if found_anchors[0]["start_idx"] > 0:
                unmatched_words.extend(words[0:found_anchors[0]["start_idx"]])
                
            for i, anchor in enumerate(found_anchors):
                start = anchor["end_idx"]
                end = found_anchors[i+1]["start_idx"] if i+1 < len(found_anchors) else len(words)
                raw_val = " ".join(words[start:end])
                
                field_def = anchor["field"]
                val = normalize_value(raw_val, field_def)
                unit = normalize_unit(raw_val, field_def)
                
                # Check for row structures in section 06
                if field_def["type"] == "table_row":
                    # Parse "actual twenty indicated twenty"
                    # Very naive extraction
                    actual_match = re.search(r'actual\s+([\w\s]+?)(?=\s+indicated|$)', raw_val)
                    indicated_match = re.search(r'indicated\s+([\w\s]+)', raw_val)
                    actual_val = normalize_value(actual_match.group(1) if actual_match else "", {"type": "decimal"})
                    indicated_val = normalize_value(indicated_match.group(1) if indicated_match else "", {"type": "decimal"})
                    
                    extracted_fields.append({
                        "key": field_def["key"],
                        "label": field_def["label"],
                        "value": {"actual": actual_val, "indicated": indicated_val},
                        "display_value": f"Actual: {actual_val}, Indicated: {indicated_val}",
                        "raw_text": raw_val,
                        "confidence": "high",
                        "status": "success",
                        "warnings": [],
                        "unit": "kg",
                        "selector": field_def["selector"],
                        "type": "table_row"
                    })
                else:
                    extracted_fields.append({
                        "key": field_def["key"],
                        "label": field_def["label"],
                        "value": val,
                        "display_value": val,
                        "raw_text": raw_val,
                        "confidence": "high" if val else "low",
                        "status": "success" if val else "warning",
                        "warnings": [] if val else ["Could not parse value"],
                        "unit": unit,
                        "selector": field_def["selector"],
                        "type": field_def["type"]
                    })
        
        # deduplicate, last mention wins
        final_fields = {}
        for f in extracted_fields:
            if f["key"] in final_fields:
                f["warnings"].append("Repeated field, last mention kept.")
            final_fields[f["key"]] = f
            
        return {
            "fields": list(final_fields.values()),
            "unmatched_segments": " ".join(unmatched_words),
            "warnings": []
        }
