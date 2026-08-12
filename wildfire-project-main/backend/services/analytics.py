import os
import math
import cv2
import numpy as np
import pandas as pd
from datetime import datetime
from pydantic import BaseModel

class AnalyticsResult(BaseModel):
    current_area: int
    future_area: int
    area_difference: int
    growth_percentage: float
    perimeter: float
    spread_distance: float
    spread_speed: float
    spread_direction: float
    expansion_rate: float
    confidence: float
    risk_score: float
    risk_category: str

class Analytics:
    def calculate_current_fire_area(self, current_mask: np.ndarray) -> int:
        return int(np.sum(current_mask > 0))

    def calculate_future_fire_area(self, future_mask: np.ndarray) -> int:
        return int(np.sum(future_mask > 0))
        
    def calculate_area_difference(self, current_area: int, future_area: int) -> int:
        return future_area - current_area

    def calculate_growth_percentage(self, current_area: int, area_difference: int) -> float:
        if current_area == 0:
            return 0.0
        return (area_difference / current_area) * 100.0

    def calculate_perimeter(self, mask: np.ndarray) -> float:
        mask_uint8 = (mask > 0).astype(np.uint8) * 255
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        perimeter = sum(cv2.arcLength(cnt, True) for cnt in contours)
        return float(perimeter)
        
    def get_centroid(self, mask: np.ndarray):
        m = cv2.moments((mask > 0).astype(np.uint8))
        if m["m00"] != 0:
            cx = m["m10"] / m["m00"]
            cy = m["m01"] / m["m00"]
            return cx, cy
        return None

    def calculate_spread_distance_and_direction(self, current_mask: np.ndarray, future_mask: np.ndarray):
        curr_c = self.get_centroid(current_mask)
        fut_c = self.get_centroid(future_mask)
        if curr_c and fut_c:
            dx = fut_c[0] - curr_c[0]
            dy = fut_c[1] - curr_c[1]
            dist = math.hypot(dx, dy)
            direction = math.degrees(math.atan2(dy, dx))
            if direction < 0:
                direction += 360.0
            return float(dist), float(direction)
        return 0.0, 0.0

    def calculate_spread_speed(self, distance: float, time_interval: float = 1.0) -> float:
        # Assuming speed as distance per unit time (e.g. 1 frame/interval)
        return distance / time_interval

    def calculate_expansion_rate(self, speed: float) -> float:
        return speed * 1.5
        
    def calculate_prediction_confidence(self, future_mask: np.ndarray, prob_map: np.ndarray) -> float:
        mask_bool = future_mask > 0
        if np.any(mask_bool):
            return float(np.mean(prob_map[mask_bool]))
        return 0.0

    def calculate_risk_score(self, future_area: int, growth_percentage: float, confidence: float) -> float:
        # Weighted Risk Score (0-100) based on Fire Area, Growth %, and Probability
        area_score = min(30.0, (future_area / 5000.0) * 30.0)
        growth_score = min(40.0, (growth_percentage / 100.0) * 40.0)
        conf_score = confidence * 30.0
        
        score = area_score + growth_score + conf_score
        return min(100.0, max(0.0, score))

    def determine_risk_category(self, risk_score: float) -> str:
        if risk_score >= 70:
            return "High"
        elif risk_score >= 35:
            return "Medium"
        else:
            return "Low"

    def analyze(self, current_mask: np.ndarray, future_mask: np.ndarray, prob_map: np.ndarray) -> AnalyticsResult:
        current_area = self.calculate_current_fire_area(current_mask)
        future_area = self.calculate_future_fire_area(future_mask)
        area_diff = self.calculate_area_difference(current_area, future_area)
        growth_pct = self.calculate_growth_percentage(current_area, area_diff)
        perimeter = self.calculate_perimeter(future_mask)
        
        dist, direction = self.calculate_spread_distance_and_direction(current_mask, future_mask)
        speed = self.calculate_spread_speed(dist)
        expansion_rate = self.calculate_expansion_rate(speed)
        
        confidence = self.calculate_prediction_confidence(future_mask, prob_map)
        
        risk_score = self.calculate_risk_score(future_area, growth_pct, confidence)
        risk_category = self.determine_risk_category(risk_score)
        
        result = AnalyticsResult(
            current_area=current_area,
            future_area=future_area,
            area_difference=area_diff,
            growth_percentage=growth_pct,
            perimeter=perimeter,
            spread_distance=dist,
            spread_speed=speed,
            spread_direction=direction,
            expansion_rate=expansion_rate,
            confidence=confidence,
            risk_score=risk_score,
            risk_category=risk_category
        )
        
        self._generate_csv(result)
        
        return result

    def _generate_csv(self, result: AnalyticsResult):
        os.makedirs("outputs", exist_ok=True)
        csv_path = "outputs/prediction_results.csv"
        
        data = {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Current Area": result.current_area,
            "Future Area": result.future_area,
            "Area Difference": result.area_difference,
            "Growth %": round(result.growth_percentage, 2),
            "Spread Distance": round(result.spread_distance, 2),
            "Spread Speed": round(result.spread_speed, 2),
            "Direction": round(result.spread_direction, 2),
            "Confidence": round(result.confidence, 4),
            "Risk Score": round(result.risk_score, 2),
            "Risk Level": result.risk_category
        }
        
        df = pd.DataFrame([data])
        
        if os.path.exists(csv_path):
            existing_df = pd.read_csv(csv_path)
            df = pd.concat([existing_df, df], ignore_index=True)
            
        df.to_csv(csv_path, index=False)
        
    def _read_last_metrics(self):
        csv_path = "outputs/prediction_results.csv"
        if not os.path.exists(csv_path):
            return {}

        try:
            df = pd.read_csv(csv_path)
            if df.empty:
                return {}
            row = df.iloc[-1]
            return {
                "area": row.get("area", row.get("Current Area", 0)),
                "distance": row.get("distance", row.get("Spread Distance", 0)),
                "speed": row.get("speed", row.get("Spread Speed", 0)),
                "direction": row.get("direction", row.get("Direction", 0)),
                "risk": row.get("risk", row.get("Risk Level", row.get("Risk Score", 0))),
                "risk_score": row.get("risk_score", row.get("Risk Score", 0)),
            }
        except Exception:
            return {}

    def calculate_area(self):
        metrics = self._read_last_metrics()
        return float(metrics.get("area", 0)) if metrics else 0

    def calculate_distance(self):
        metrics = self._read_last_metrics()
        return float(metrics.get("distance", 0)) if metrics else 0

    def calculate_speed(self):
        metrics = self._read_last_metrics()
        return float(metrics.get("speed", 0)) if metrics else 0

    def calculate_direction(self):
        metrics = self._read_last_metrics()
        return float(metrics.get("direction", 0)) if metrics else 0

    def calculate_risk(self):
        metrics = self._read_last_metrics()
        risk_score = metrics.get("risk_score", metrics.get("risk", 0))
        return float(risk_score) if risk_score is not None else 0
