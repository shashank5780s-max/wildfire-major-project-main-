import os
import logging
import numpy as np
import pandas as pd
from typing import List

from ..utils.preprocessing import ImagePreprocessor
from ..utils.visualization import Visualizer
from ..services.unet_service import UNetService
from ..services.convlstm_service import ConvLSTMService
from ..services.analytics import Analytics
from ..schemas.response import PredictionResponse

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class Predictor:
    def __init__(self, 
                 preprocessor: ImagePreprocessor,
                 unet_service: UNetService,
                 convlstm_service: ConvLSTMService,
                 analytics: Analytics):
        self.preprocessor = preprocessor
        self.unet_service = unet_service
        self.convlstm_service = convlstm_service
        self.analytics = analytics

    def predict(self, sequence_paths: List[str]) -> PredictionResponse:
        try:
            if len(sequence_paths) != 5:
                raise ValueError(f"Expected exactly 5 image paths, got {len(sequence_paths)}")

            logger.info("Starting prediction pipeline for 5 thermal images.")

            thermal_images = []
            fire_masks = []

            for path in sequence_paths:
                logger.info(f"Processing image: {path}")
                img, tensor = self.preprocessor.preprocess(path)
                thermal_images.append(img)

                prob_map, mask = self.unet_service.predict(tensor)
                mask_np = mask.squeeze().cpu().numpy()
                fire_masks.append(mask_np)

            logger.info("Running ConvLSTM for future fire prediction.")
            prediction_np, future_mask = self.convlstm_service.predict(fire_masks, thermal_images)

            current_mask = fire_masks[-1]
            logger.info("Calculating fire statistics.")
            analytics_result = self.analytics.analyze(current_mask, future_mask, prediction_np)

            visualizer = Visualizer(output_dir="outputs")
            generated = visualizer.generate_visualizations(
                thermal_img=thermal_images[-1],
                current_mask=current_mask,
                future_mask=future_mask,
                prob_map=prediction_np,
                analytics=analytics_result,
            )

            logger.info("Saving final prediction results to CSV.")
            os.makedirs("outputs", exist_ok=True)
            results_df = pd.DataFrame([{
                "area": analytics_result.current_area,
                "distance": analytics_result.spread_distance,
                "speed": analytics_result.spread_speed,
                "direction": analytics_result.spread_direction,
                "risk": analytics_result.risk_category,
                "risk_score": analytics_result.risk_score,
                "current_fire_area": analytics_result.current_area,
                "future_fire_area": analytics_result.future_area,
                "growth_percentage": analytics_result.growth_percentage,
                "confidence": analytics_result.confidence,
            }])
            results_df.to_csv("outputs/prediction_results.csv", index=False)

            logger.info("Prediction pipeline completed successfully.")

            return {
                "current_fire_mask": "/outputs/current_fire_mask.png",
                "predicted_future_fire": "/outputs/predicted_future_fire.png",
                "future_fire_overlay": "/outputs/future_fire_overlay.png",
                "fire_probability_heatmap": "/outputs/fire_probability_heatmap.png",
                "difference_map": "/outputs/difference_map.png",
                "fire_boundary": "/outputs/fire_boundary.png",
                "fire_direction": "/outputs/fire_direction.png",
                "risk_dashboard": "/outputs/risk_dashboard.png",
                "analytics": {
                    "current_fire_area": analytics_result.current_area,
                    "future_fire_area": analytics_result.future_area,
                    "growth_percentage": analytics_result.growth_percentage,
                    "spread_distance": analytics_result.spread_distance,
                    "spread_speed": analytics_result.spread_speed,
                    "spread_direction": analytics_result.spread_direction,
                    "confidence": analytics_result.confidence,
                    "risk": analytics_result.risk_category,
                    "risk_score": analytics_result.risk_score,
                },
                "generated_files": generated,
            }

        except Exception as e:
            logger.error(f"Error during prediction pipeline: {str(e)}", exc_info=True)
            raise e
