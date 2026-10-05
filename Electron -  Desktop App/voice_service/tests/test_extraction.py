import pytest
from app.extraction.normalizers import (
    normalize_number, normalize_email, normalize_id, normalize_phone, normalize_time, match_categorical
)
from app.extraction.extractor import Extractor

def test_normalize_number():
    assert normalize_number("two three point four") == "23.4"
    assert normalize_number("fifteen hundred") == "1500"
    assert normalize_number("zero point five") == "0.5"

def test_normalize_email():
    assert normalize_email("r mehta at apexweigh dot com") == "rmehta@apexweigh.com"

def test_normalize_id():
    assert normalize_id("A W S dash three thousand") == "AWS-3000"

def test_normalize_phone():
    assert normalize_phone("plus nine one nine eight seven") == "+91987"

def test_normalize_time():
    assert normalize_time("ten thirty") == "10:30"
    assert normalize_time("14 45") == "14:45"

def test_match_categorical():
    aliases = {"class one": "Class I (Special)", "medium": "Class III (Medium)"}
    assert match_categorical("medium", [], aliases) == "Class III (Medium)"
    
def test_extraction_applicant_section():
    extractor = Extractor()
    res = extractor.extract("applicant name Apex Weigh Systems, contact Rajesh Mehta", "applicant")
    fields = res["fields"]
    assert len(fields) == 2
    keys = [f["key"] for f in fields]
    assert "appName" in keys
    assert "appContact" in keys
    
def test_extraction_accuracy_section():
    extractor = Extractor()
    res = extractor.extract("test point one actual twenty indicated twenty", "accuracy")
    fields = res["fields"]
    assert len(fields) == 1
    assert fields[0]["key"] == "testRow1"
    assert fields[0]["value"]["actual"] == "20"
    assert fields[0]["value"]["indicated"] == "20"
