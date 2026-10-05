import json
from pathlib import Path
from pydantic import BaseModel
from typing import Dict, Any, List

class VoiceSchema(BaseModel):
    sections: List[Dict[str, Any]]

SCHEMA_DICT = {
    "sections": [
        {
            "id": "applicant",
            "title": "Applicant & Manufacturer Details",
            "example": "applicant name Apex Weigh Systems, contact Rajesh Mehta, same as applicant",
            "fields": [
                {
                    "key": "appName",
                    "label": "Applicant Name",
                    "aliases": ["applicant name", "submitter name", "name of applicant", "applicant", "submitting entity"],
                    "type": "text",
                    "selector": "#appName",
                    "speak_template": "Applicant name: {value}"
                },
                {
                    "key": "appContact",
                    "label": "Contact Person",
                    "aliases": ["contact person", "contact", "attention to", "person in charge"],
                    "type": "text",
                    "selector": "#appContact",
                    "speak_template": "Contact person: {value}"
                },
                {
                    "key": "appEmail",
                    "label": "Email Address",
                    "aliases": ["email address", "email", "mail"],
                    "type": "email",
                    "selector": "#appEmail",
                    "speak_template": "Email: {value}"
                },
                {
                    "key": "appAddress",
                    "label": "Applicant Address",
                    "aliases": ["applicant address", "address", "company address"],
                    "type": "text",
                    "selector": "#appAddress",
                    "speak_template": "Address: {value}"
                },
                {
                    "key": "appCountry",
                    "label": "Country",
                    "aliases": ["country", "applicant country"],
                    "type": "text",
                    "selector": "#appCountry",
                    "speak_template": "Country: {value}"
                },
                {
                    "key": "appPhone",
                    "label": "Phone Number",
                    "aliases": ["phone number", "phone", "mobile", "telephone", "contact number"],
                    "type": "phone",
                    "selector": "#appPhone",
                    "speak_template": "Phone: {value}"
                },
                {
                    "key": "appSubRef",
                    "label": "Submission Reference No.",
                    "aliases": ["submission reference number", "submission reference", "reference number"],
                    "type": "alphanumeric_id",
                    "selector": "#appSubRef",
                    "speak_template": "Submission reference: {value}"
                },
                {
                    "key": "appRegNo",
                    "label": "Manufacturer Reg. Number",
                    "aliases": ["manufacturer registration number", "registration number", "reg number"],
                    "type": "alphanumeric_id",
                    "selector": "#appRegNo",
                    "speak_template": "Registration number: {value}"
                },
                {
                    "key": "sameAsApplicant",
                    "label": "Same as Applicant",
                    "aliases": ["manufacturer same as applicant", "same as applicant", "manufacturer is same as applicant"],
                    "type": "checkbox",
                    "selector": "#sameAsApplicant",
                    "speak_template": "Manufacturer same as applicant."
                },
                {
                    "key": "mfrName",
                    "label": "Manufacturer Name",
                    "aliases": ["manufacturer name", "name of manufacturer", "manufacturer"],
                    "type": "text",
                    "selector": "#mfrName",
                    "speak_template": "Manufacturer name: {value}"
                },
                {
                    "key": "mfrCountry",
                    "label": "Country of Manufacture",
                    "aliases": ["country of manufacture", "manufacturer country"],
                    "type": "text",
                    "selector": "#mfrCountry",
                    "speak_template": "Country of manufacture: {value}"
                },
                {
                    "key": "mfrAddress",
                    "label": "Manufacturer Address",
                    "aliases": ["manufacturer address", "address of manufacturer"],
                    "type": "text",
                    "selector": "#mfrAddress",
                    "speak_template": "Manufacturer address: {value}"
                }
            ]
        },
        {
            "id": "instrument",
            "title": "Instrument Identification",
            "example": "instrument type platform scale, model AWS-3000",
            "fields": [
                {
                    "key": "instType",
                    "label": "Instrument Type",
                    "aliases": ["instrument type", "type of instrument", "type"],
                    "type": "select",
                    "options": [
                        {"value": "Electronic weighing instrument", "aliases": ["electronic weighing instrument", "electronic scale"]},
                        {"value": "Platform scale", "aliases": ["platform scale"]},
                        {"value": "Weighbridge", "aliases": ["weighbridge", "vehicle scale"]},
                        {"value": "Counter Scale", "aliases": ["counter scale"]},
                        {"value": "Precision Balance", "aliases": ["precision balance"]},
                        {"value": "Other NAWI", "aliases": ["other nawi", "other"]}
                    ],
                    "selector": "#instType",
                    "speak_template": "Instrument type: {value}"
                },
                {
                    "key": "instModel",
                    "label": "Model / Type Designation",
                    "aliases": ["model", "model designation", "type designation"],
                    "type": "alphanumeric_id",
                    "selector": "#instModel",
                    "speak_template": "Model: {value}"
                },
                {
                    "key": "instSerial",
                    "label": "Serial Number",
                    "aliases": ["serial number", "serial"],
                    "type": "alphanumeric_id",
                    "selector": "#instSerial",
                    "speak_template": "Serial number: {value}"
                },
                {
                    "key": "instSampleId",
                    "label": "Identification / Sample ID",
                    "aliases": ["sample id", "identification", "sample identification"],
                    "type": "alphanumeric_id",
                    "selector": "#instSampleId",
                    "speak_template": "Sample ID: {value}"
                },
                {
                    "key": "instTradeName",
                    "label": "Instrument Trade Name",
                    "aliases": ["trade name", "instrument trade name"],
                    "type": "text",
                    "selector": "#instTradeName",
                    "speak_template": "Trade name: {value}"
                },
                {
                    "key": "instSampleCount",
                    "label": "Number of Samples Received",
                    "aliases": ["number of samples received", "number of samples", "sample count"],
                    "type": "integer",
                    "selector": "#instSampleCount",
                    "speak_template": "Samples received: {value}"
                },
                {
                    "key": "instIntendedUse",
                    "label": "Intended Use",
                    "aliases": ["intended use", "use"],
                    "type": "text",
                    "selector": "#instIntendedUse",
                    "speak_template": "Intended use: {value}"
                },
                {
                    "key": "instEnvPlace",
                    "label": "Place / Environment of Intended Use",
                    "aliases": ["place of intended use", "environment of intended use", "intended environment"],
                    "type": "text",
                    "selector": "#instEnvPlace",
                    "speak_template": "Environment: {value}"
                }
            ]
        },
        {
            "id": "environment",
            "title": "Laboratory / Environmental Conditions",
            "example": "location room 104, start time ten thirty, temperature twenty three point four degrees celsius",
            "fields": [
                {
                    "key": "envLocation",
                    "label": "Location / Room",
                    "aliases": ["location", "room", "location room"],
                    "type": "text",
                    "selector": "#envLocation",
                    "speak_template": "Location: {value}"
                },
                {
                    "key": "envStartTime",
                    "label": "Test Start Time",
                    "aliases": ["test start time", "start time"],
                    "type": "time",
                    "selector": "#envStartTime",
                    "speak_template": "Start time: {value}"
                },
                {
                    "key": "envEndTime",
                    "label": "Test End Time (Estimated)",
                    "aliases": ["test end time", "end time", "estimated end time"],
                    "type": "time",
                    "selector": "#envEndTime",
                    "speak_template": "End time: {value}"
                },
                {
                    "key": "envTemp",
                    "label": "Ambient Temperature",
                    "aliases": ["ambient temperature", "temperature"],
                    "type": "unit_value",
                    "unit_options": ["°C", "°F", "K"],
                    "unit_aliases": {"celsius": "°C", "degrees celsius": "°C", "degrees c": "°C", "fahrenheit": "°F", "degrees fahrenheit": "°F", "kelvin": "K"},
                    "selector": "#envTemp",
                    "speak_template": "Temperature: {value}"
                },
                {
                    "key": "envRH",
                    "label": "Relative Humidity (RH)",
                    "aliases": ["relative humidity", "humidity", "rh"],
                    "type": "unit_value",
                    "unit_options": ["%", "%RH"],
                    "unit_aliases": {"percent": "%", "percentage": "%", "percent rh": "%RH"},
                    "selector": "#envRH",
                    "speak_template": "Humidity: {value}"
                },
                {
                    "key": "envPress",
                    "label": "Atmospheric Pressure",
                    "aliases": ["atmospheric pressure", "pressure"],
                    "type": "unit_value",
                    "unit_options": ["hPa", "mbar", "kPa", "mmHg", "inHg"],
                    "unit_aliases": {"hectopascals": "hPa", "h p a": "hPa", "millibars": "mbar", "kilopascals": "kPa"},
                    "selector": "#envPress",
                    "speak_template": "Pressure: {value}"
                },
                {
                    "key": "envNotes",
                    "label": "Environmental Observations",
                    "aliases": ["environmental observations", "observations", "notes", "vibration notes"],
                    "type": "text",
                    "selector": "#envNotes",
                    "speak_template": "Notes: {value}"
                }
            ]
        },
        {
            "id": "specifications",
            "title": "Technical Specifications",
            "example": "accuracy class three, maximum capacity 3000 kilograms",
            "fields": [
                {
                    "key": "specClass",
                    "label": "Accuracy Class",
                    "aliases": ["accuracy class", "class"],
                    "type": "select",
                    "options": [
                        {"value": "Class I (Special)", "aliases": ["class one", "special", "class 1"]},
                        {"value": "Class II (High)", "aliases": ["class two", "high", "class 2"]},
                        {"value": "Class III (Medium)", "aliases": ["class three", "medium", "class 3"]},
                        {"value": "Class IIII (Ordinary)", "aliases": ["class four", "ordinary", "class 4"]}
                    ],
                    "selector": "#specClass",
                    "speak_template": "Class: {value}"
                },
                {
                    "key": "specMax",
                    "label": "Maximum Capacity (Max)",
                    "aliases": ["maximum capacity", "max capacity", "max"],
                    "type": "unit_value",
                    "unit_options": ["kg", "g", "mg", "t", "lb", "oz"],
                    "unit_aliases": {"kilograms": "kg", "kilos": "kg", "grams": "g", "milligrams": "mg", "tons": "t", "tonnes": "t", "pounds": "lb", "ounces": "oz"},
                    "selector": "#specMax",
                    "speak_template": "Maximum capacity: {value}"
                },
                {
                    "key": "specMin",
                    "label": "Minimum Capacity (Min)",
                    "aliases": ["minimum capacity", "min capacity", "min"],
                    "type": "unit_value",
                    "unit_options": ["kg", "g", "mg", "t", "lb", "oz"],
                    "unit_aliases": {"kilograms": "kg", "kilos": "kg", "grams": "g", "milligrams": "mg", "tons": "t", "tonnes": "t", "pounds": "lb", "ounces": "oz"},
                    "selector": "#specMin",
                    "speak_template": "Minimum capacity: {value}"
                },
                {
                    "key": "specE",
                    "label": "Verification Scale Interval (e)",
                    "aliases": ["verification scale interval", "scale interval e", "interval e", "e"],
                    "type": "unit_value",
                    "unit_options": ["kg", "g", "mg", "t", "lb", "oz"],
                    "unit_aliases": {"kilograms": "kg", "kilos": "kg", "grams": "g", "milligrams": "mg", "tons": "t", "tonnes": "t", "pounds": "lb", "ounces": "oz"},
                    "selector": "#specE",
                    "speak_template": "Verification interval: {value}"
                },
                {
                    "key": "specD",
                    "label": "Actual Scale Interval (d)",
                    "aliases": ["actual scale interval", "scale interval d", "interval d", "d"],
                    "type": "unit_value",
                    "unit_options": ["kg", "g", "mg", "t", "lb", "oz"],
                    "unit_aliases": {"kilograms": "kg", "kilos": "kg", "grams": "g", "milligrams": "mg", "tons": "t", "tonnes": "t", "pounds": "lb", "ounces": "oz"},
                    "selector": "#specD",
                    "speak_template": "Actual interval: {value}"
                },
                {
                    "key": "specTare",
                    "label": "Maximum Tare (T)",
                    "aliases": ["maximum tare", "max tare", "tare"],
                    "type": "unit_value",
                    "unit_options": ["kg", "g", "mg", "t", "lb", "oz"],
                    "unit_aliases": {"kilograms": "kg", "kilos": "kg", "grams": "g", "milligrams": "mg", "tons": "t", "tonnes": "t", "pounds": "lb", "ounces": "oz"},
                    "selector": "#specTare",
                    "speak_template": "Maximum tare: {value}"
                },
                {
                    "key": "specTareDevice",
                    "label": "Tare Device Type",
                    "aliases": ["tare device type", "tare device"],
                    "type": "select",
                    "options": [
                        {"value": "Subtractive Tare", "aliases": ["subtractive tare", "subtractive"]},
                        {"value": "Additive Tare", "aliases": ["additive tare", "additive"]},
                        {"value": "Preset Tare", "aliases": ["preset tare", "preset"]},
                        {"value": "No Tare Device", "aliases": ["no tare device", "no tare"]}
                    ],
                    "selector": "#specTareDevice",
                    "speak_template": "Tare device: {value}"
                },
                {
                    "key": "specLoadCellType",
                    "label": "Load Cell Type",
                    "aliases": ["load cell type"],
                    "type": "text",
                    "selector": "#specLoadCellType",
                    "speak_template": "Load cell type: {value}"
                },
                {
                    "key": "specLoadCellCount",
                    "label": "Number of Load Cells",
                    "aliases": ["number of load cells", "load cell count"],
                    "type": "integer",
                    "selector": "#specLoadCellCount",
                    "speak_template": "Load cells: {value}"
                },
                {
                    "key": "specReceptorGeometry",
                    "label": "Load Receptor Geometry",
                    "aliases": ["load receptor geometry", "receptor geometry"],
                    "type": "select",
                    "options": [
                        {"value": "Rectangular", "aliases": ["rectangular", "square"]},
                        {"value": "Circular", "aliases": ["circular"]},
                        {"value": "Triangular", "aliases": ["triangular"]},
                        {"value": "Other", "aliases": ["other"]}
                    ],
                    "selector": "#specReceptorGeometry",
                    "speak_template": "Geometry: {value}"
                },
                {
                    "key": "specSupportPoints",
                    "label": "Number of Support Points",
                    "aliases": ["number of support points", "support points"],
                    "type": "integer",
                    "selector": "#specSupportPoints",
                    "speak_template": "Support points: {value}"
                },
                {
                    "key": "specDimensions",
                    "label": "Platform Dimensions",
                    "aliases": ["platform dimensions", "dimensions"],
                    "type": "text",
                    "selector": "#specDimensions",
                    "speak_template": "Dimensions: {value}"
                },
                {
                    "key": "specPower",
                    "label": "Power Supply",
                    "aliases": ["power supply", "power"],
                    "type": "text",
                    "selector": "#specPower",
                    "speak_template": "Power supply: {value}"
                },
                {
                    "key": "specDisplay",
                    "label": "Display / Indication Type",
                    "aliases": ["display type", "indication type", "display"],
                    "type": "select",
                    "options": [
                        {"value": "7-Segment LED (Green/Red)", "aliases": ["7 segment led", "seven segment led", "led"]},
                        {"value": "Backlit Graphic LCD", "aliases": ["backlit graphic lcd", "lcd"]},
                        {"value": "TFT Touch Display", "aliases": ["tft touch display", "touch display", "tft"]},
                        {"value": "Mechanical Dial", "aliases": ["mechanical dial", "dial"]}
                    ],
                    "selector": "#specDisplay",
                    "speak_template": "Display: {value}"
                },
                {
                    "key": "specOperatingMode",
                    "label": "Operating Mode",
                    "aliases": ["operating mode", "mode"],
                    "type": "select",
                    "options": [
                        {"value": "Static Weighing", "aliases": ["static weighing", "static"]},
                        {"value": "Checkweighing", "aliases": ["checkweighing"]},
                        {"value": "Parts Counting", "aliases": ["parts counting", "counting"]}
                    ],
                    "selector": "#specOperatingMode",
                    "speak_template": "Operating mode: {value}"
                },
                {
                    "key": "specFirmware",
                    "label": "Software / Firmware Version",
                    "aliases": ["software version", "firmware version", "firmware", "software"],
                    "type": "text",
                    "selector": "#specFirmware",
                    "speak_template": "Firmware: {value}"
                },
                {
                    "key": "specTempRange",
                    "label": "Manufacturer's Declared Range",
                    "aliases": ["temperature range", "declared range", "manufacturer declared range"],
                    "type": "text",
                    "selector": "#specTempRange",
                    "speak_template": "Temperature range: {value}"
                }
            ]
        },
        {
            "id": "accuracy",
            "title": "Initial Accuracy & Error Testing",
            "example": "test point one actual twenty indicated twenty, point two actual seven fifty indicated seven fifty",
            "fields": [
                {
                    "key": "testRow1",
                    "label": "Test Point 1 (Min)",
                    "aliases": ["test point one", "point one", "min", "minimum"],
                    "type": "table_row",
                    "selector": "#accuracyTestTable tbody tr:nth-child(1)",
                    "speak_template": "Point 1, actual {actual} kg, indicated {indicated} kg."
                },
                {
                    "key": "testRow2",
                    "label": "Test Point 2 (1/4 Max)",
                    "aliases": ["test point two", "point two", "quarter max", "one quarter max"],
                    "type": "table_row",
                    "selector": "#accuracyTestTable tbody tr:nth-child(2)",
                    "speak_template": "Point 2, actual {actual} kg, indicated {indicated} kg."
                },
                {
                    "key": "testRow3",
                    "label": "Test Point 3 (1/2 Max)",
                    "aliases": ["test point three", "point three", "half max"],
                    "type": "table_row",
                    "selector": "#accuracyTestTable tbody tr:nth-child(3)",
                    "speak_template": "Point 3, actual {actual} kg, indicated {indicated} kg."
                },
                {
                    "key": "testRow4",
                    "label": "Test Point 4 (3/4 Max)",
                    "aliases": ["test point four", "point four", "three quarter max", "three quarters max"],
                    "type": "table_row",
                    "selector": "#accuracyTestTable tbody tr:nth-child(4)",
                    "speak_template": "Point 4, actual {actual} kg, indicated {indicated} kg."
                },
                {
                    "key": "testRow5",
                    "label": "Test Point 5 (Max)",
                    "aliases": ["test point five", "point five", "max", "maximum"],
                    "type": "table_row",
                    "selector": "#accuracyTestTable tbody tr:nth-child(5)",
                    "speak_template": "Point 5, actual {actual} kg, indicated {indicated} kg."
                }
            ]
        }
    ]
}

def get_schema() -> Dict[str, Any]:
    return SCHEMA_DICT
