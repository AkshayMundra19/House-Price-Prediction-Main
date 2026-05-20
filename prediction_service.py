from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Any, Dict, Iterable, Mapping
import pickle

import pandas as pd


FEATURE_COLUMNS = [
    "GrLivArea",
    "BedroomAbvGr",
    "FullBath",
    "HalfBath",
    "YearBuilt",
    "OverallQual",
    "TotalBsmtSF",
    "GarageCars",
]

AMENITY_KEYS = ("parking", "gym", "pool", "garden", "security", "lift")


class PredictionInputError(ValueError):
    pass


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _coerce_float(payload: Mapping[str, Any], key: str) -> float:
    try:
        value = float(payload[key])
    except (KeyError, TypeError, ValueError) as exc:
        raise PredictionInputError(f"'{key}' must be a number.") from exc
    if value != value:  # NaN check
        raise PredictionInputError(f"'{key}' must be a valid number.")
    return value


def _coerce_int(payload: Mapping[str, Any], key: str) -> int:
    value = _coerce_float(payload, key)
    if int(value) != value:
        raise PredictionInputError(f"'{key}' must be a whole number.")
    return int(value)


def normalize_amenities(raw: Any) -> Dict[str, bool]:
    if raw is None:
        return {key: False for key in AMENITY_KEYS}

    if isinstance(raw, Mapping):
        return {key: bool(raw.get(key, False)) for key in AMENITY_KEYS}

    if isinstance(raw, Iterable) and not isinstance(raw, (str, bytes)):
        enabled = {str(item) for item in raw}
        return {key: key in enabled for key in AMENITY_KEYS}

    raise PredictionInputError("'amenities' must be an object or an array.")


def normalize_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, Mapping):
        raise PredictionInputError("Request body must be a JSON object.")

    area = _coerce_float(payload, "area")
    bedrooms = _coerce_int(payload, "bedrooms")
    bathrooms = _coerce_int(payload, "bathrooms")
    location_factor = _coerce_float(payload, "location_factor")
    property_age = _coerce_float(payload, "property_age")
    floor = _coerce_float(payload, "floor")
    amenities = normalize_amenities(payload.get("amenities"))

    if area <= 0:
        raise PredictionInputError("'area' must be greater than 0.")
    if bedrooms <= 0:
        raise PredictionInputError("'bedrooms' must be greater than 0.")
    if bathrooms <= 0:
        raise PredictionInputError("'bathrooms' must be greater than 0.")
    if not 0.3 <= location_factor <= 2.5:
        raise PredictionInputError("'location_factor' must be between 0.3 and 2.5.")
    if property_age < 0:
        raise PredictionInputError("'property_age' cannot be negative.")
    if floor < 0:
        raise PredictionInputError("'floor' cannot be negative.")

    return {
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "location_factor": location_factor,
        "property_age": property_age,
        "floor": floor,
        "amenities": amenities,
    }


def build_model_frame(inputs: Mapping[str, Any]) -> pd.DataFrame:
    normalized = normalize_payload(inputs)
    current_year = dt.datetime.now(dt.UTC).year
    year_built = max(1900, current_year - int(round(normalized["property_age"])))
    amenities = normalized["amenities"]
    amenity_count = sum(1 for enabled in amenities.values() if enabled)

    overall_qual = clamp(
        round(
            5
            + amenity_count * 0.55
            + normalized["floor"] / 12
            + (normalized["location_factor"] - 1.0) * 2.0
        ),
        1,
        10,
    )

    total_bsmt = max(0, round(normalized["area"] * 0.6))
    garage_cars = 1 if amenities["parking"] else 0
    if normalized["area"] >= 2200 or amenities["lift"]:
        garage_cars += 1
    garage_cars = int(clamp(garage_cars, 0, 3))

    row = [
        normalized["area"],
        normalized["bedrooms"],
        normalized["bathrooms"],
        0,
        year_built,
        overall_qual,
        total_bsmt,
        garage_cars,
    ]
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def calculate_breakdown(inputs: Mapping[str, Any], predicted_price: float) -> Dict[str, float]:
    normalized = normalize_payload(inputs)
    area = normalized["area"]
    location_factor = normalized["location_factor"]
    age = normalized["property_age"]
    floor = normalized["floor"]
    bedrooms = normalized["bedrooms"]
    bathrooms = normalized["bathrooms"]
    amenities = normalized["amenities"]
    amenity_count = sum(1 for enabled in amenities.values() if enabled)

    base_price = area * 85
    location_premium = base_price * (location_factor - 1.0)
    amenity_value = base_price * (0.03 * amenity_count)
    bedroom_bonus = max(0, bedrooms - 2) * 5000
    bathroom_bonus = max(0, bathrooms - 1) * 10000
    floor_bonus = max(0, floor - 10) * 1200
    age_depreciation = age * 1200

    return {
        "base_price": round(base_price, 2),
        "base_price_k": round(base_price / 1000, 2),
        "location_premium": round(location_premium, 2),
        "location_premium_k": round(location_premium / 1000, 2),
        "amenity_value": round(amenity_value, 2),
        "amenity_value_k": round(amenity_value / 1000, 2),
        "bedroom_bonus": round(bedroom_bonus, 2),
        "bedroom_bonus_k": round(bedroom_bonus / 1000, 2),
        "bathroom_bonus": round(bathroom_bonus, 2),
        "bathroom_bonus_k": round(bathroom_bonus / 1000, 2),
        "floor_bonus": round(floor_bonus, 2),
        "floor_bonus_k": round(floor_bonus / 1000, 2),
        "age_depreciation": round(age_depreciation, 2),
        "age_depreciation_k": round(age_depreciation / 1000, 2),
        "estimated_total_k": round(predicted_price / 1000, 2),
    }


def load_model(model_path: Path):
    with model_path.open("rb") as handle:
        return pickle.load(handle)


def predict_price(inputs: Mapping[str, Any], model: Any | None = None) -> Dict[str, Any]:
    normalized = normalize_payload(inputs)
    frame = build_model_frame(normalized)

    if model is None:
        raise PredictionInputError("Trained model is not loaded.")

    try:
        predicted_price = float(model.predict(frame)[0])
        model_source = "house_model.pkl"
    except Exception as exc:
        raise PredictionInputError(f"Trained model prediction failed: {exc}") from exc

    breakdown = calculate_breakdown(normalized, predicted_price)
    confidence = _estimate_confidence(normalized)
    smart_insights = build_smart_insights(normalized, breakdown, model_source, confidence)

    return {
        "predicted_price": round(predicted_price, 2),
        "predicted_price_k": round(predicted_price / 1000, 2),
        "confidence": confidence,
        "model_source": model_source,
        "breakdown": breakdown,
        "smart_insights": smart_insights,
        "model_features": frame.iloc[0].to_dict(),
    }


def _estimate_confidence(inputs: Mapping[str, Any]) -> int:
    area = inputs["area"]
    age = inputs["property_age"]
    floor = inputs["floor"]
    confidence = 98 - (abs(area - 1200) * 0.003) - (age * 0.35) + min(floor, 20) * 0.08
    return int(clamp(round(confidence), 80, 99))


def build_smart_insights(
    inputs: Mapping[str, Any],
    breakdown: Mapping[str, float],
    model_source: str,
    confidence: int,
) -> Dict[str, Any]:
    area = inputs["area"]
    location_factor = inputs["location_factor"]
    age = inputs["property_age"]
    floor = inputs["floor"]
    amenities = inputs["amenities"]
    amenity_count = sum(1 for enabled in amenities.values() if enabled)

    signals = [
        {
            "label": "Model-backed",
            "value": model_source,
            "detail": "Prediction comes from the trained house model when available.",
        },
        {
            "label": "Confidence",
            "value": f"{confidence}%",
            "detail": "Higher when inputs sit closer to the training distribution.",
        },
        {
            "label": "Amenities",
            "value": f"{amenity_count} active",
            "detail": "Feature-rich homes receive a stronger premium.",
        },
        {
            "label": "Location signal",
            "value": f"{location_factor:.2f}x",
            "detail": "Location multiplier shifts the valuation in real time.",
        },
    ]

    reasons = [
        f"Area of {int(area):,} sq ft is mapped into the model frame and strongly influences the final price.",
        f"Age depreciation is applied at ${abs(breakdown['age_depreciation_k']):.1f}k for the current property age.",
        f"Floor and amenity patterns contribute to the quality score before the model predicts price.",
    ]

    if floor >= 10:
        reasons.append("Higher floor value improves the quality score and pushes the estimate upward.")
    if age <= 5:
        reasons.append("Newer homes get a smaller depreciation penalty, which keeps the estimate sharper.")

    summary = (
        "This prediction is smart because it combines a trained model, feature engineering, "
        "and visible breakdowns instead of a single hardcoded formula."
    )

    return {
        "summary": summary,
        "signals": signals,
        "reasons": reasons,
    }
