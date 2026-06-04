import unittest

from prediction_service import (
    AMENITY_KEYS,
    PredictionInputError,
    build_model_frame,
    normalize_payload,
    predict_price,
)


class FakeModel:
    def predict(self, frame):
        return [123456.0]


class PredictionServiceTests(unittest.TestCase):
    def setUp(self):
        self.payload = {
            "area": 1500,
            "bedrooms": 3,
            "bathrooms": 2,
            "location_factor": 1.1,
            "property_age": 4,
            "floor": 8,
            "amenities": ["parking", "garden"],
        }

    def test_normalize_payload_converts_values(self):
        normalized = normalize_payload(self.payload)
        self.assertEqual(normalized["bedrooms"], 3)
        self.assertTrue(normalized["amenities"]["parking"])
        self.assertFalse(normalized["amenities"]["gym"])

    def test_build_model_frame_matches_expected_columns(self):
        frame = build_model_frame(self.payload)
        self.assertEqual(
            list(frame.columns),
            [
                "GrLivArea",
                "BedroomAbvGr",
                "FullBath",
                "HalfBath",
                "YearBuilt",
                "OverallQual",
                "TotalBsmtSF",
                "GarageCars",
            ],
        )
        self.assertEqual(frame.iloc[0]["GrLivArea"], 1500)

    def test_predict_price_uses_model_when_available(self):
        result = predict_price(self.payload, FakeModel())
        self.assertEqual(result["predicted_price"], 123456.0)
        self.assertEqual(result["model_source"], "house_model.pkl")
        self.assertIn("breakdown", result)
        self.assertIn("smart_insights", result)
        self.assertIn("signals", result["smart_insights"])

    def test_predict_price_requires_model(self):
        with self.assertRaises(PredictionInputError):
            predict_price(self.payload, None)

    def test_invalid_payload_raises(self):
        with self.assertRaises(PredictionInputError):
            normalize_payload({"area": "", "bedrooms": 2})


if __name__ == "__main__":
    unittest.main()
