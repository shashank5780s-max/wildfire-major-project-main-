import os
import cv2
import math
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from typing import Dict
from ..services.analytics import AnalyticsResult

class Visualizer:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_visualizations(self, 
                                thermal_img: np.ndarray, 
                                current_mask: np.ndarray, 
                                future_mask: np.ndarray, 
                                prob_map: np.ndarray, 
                                analytics: AnalyticsResult) -> Dict[str, str]:
        
        generated_files = {}

        # 1. Current Fire Mask
        path_current = os.path.join(self.output_dir, "current_fire_mask.png")
        plt.imsave(path_current, current_mask, cmap='gray')
        generated_files["current_fire_mask"] = path_current

        # 2. Predicted Future Fire
        path_future = os.path.join(self.output_dir, "predicted_future_fire.png")
        plt.imsave(path_future, future_mask, cmap='gray')
        generated_files["predicted_future_fire"] = path_future

        # 3. Fire Probability Heatmap
        path_heatmap = os.path.join(self.output_dir, "fire_probability_heatmap.png")
        plt.figure(figsize=(6, 5))
        plt.imshow(prob_map, cmap='jet')
        plt.colorbar(label='Probability')
        plt.title("Fire Probability Heatmap")
        plt.axis('off')
        plt.savefig(path_heatmap, bbox_inches='tight')
        plt.close()
        generated_files["fire_probability_heatmap"] = path_heatmap

        # 4. Future Fire Overlay
        path_overlay = os.path.join(self.output_dir, "future_fire_overlay.png")
        plt.figure(figsize=(6, 6))
        
        if len(thermal_img.shape) == 2:
            plt.imshow(thermal_img, cmap='inferno')
        else:
            plt.imshow(thermal_img)
            
        colors = [(1, 0, 0, 0), (1, 0, 0, 0.6)]
        cmap_red = mcolors.LinearSegmentedColormap.from_list('custom_red', colors, N=2)
        plt.imshow(future_mask, cmap=cmap_red)
        plt.axis('off')
        plt.title("Future Fire Overlay")
        plt.savefig(path_overlay, bbox_inches='tight', pad_inches=0)
        plt.close()
        generated_files["future_fire_overlay"] = path_overlay

        # 5. Difference Map
        path_diff = os.path.join(self.output_dir, "difference_map.png")
        h, w = current_mask.shape
        diff_img = np.zeros((h, w, 3), dtype=np.uint8)
        
        diff_img[(current_mask > 0) & (future_mask == 0)] = [0, 0, 255]     # Blue
        diff_img[(current_mask == 0) & (future_mask > 0)] = [255, 0, 0]     # Red
        diff_img[(current_mask > 0) & (future_mask > 0)] = [255, 255, 255]  # White
        
        plt.imsave(path_diff, diff_img)
        generated_files["difference_map"] = path_diff

        # 6. Fire Boundary
        path_boundary = os.path.join(self.output_dir, "fire_boundary.png")
        mask_uint8 = (future_mask > 0).astype(np.uint8) * 255
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        boundary_img = np.zeros((h, w, 3), dtype=np.uint8)
        cv2.drawContours(boundary_img, contours, -1, (0, 255, 0), 2)
        plt.imsave(path_boundary, boundary_img)
        generated_files["fire_boundary"] = path_boundary

        # 7. Fire Direction
        path_direction = os.path.join(self.output_dir, "fire_direction.png")
        dir_img = np.zeros((h, w, 3), dtype=np.uint8)
        
        def get_centroid(mask):
            m = cv2.moments((mask > 0).astype(np.uint8))
            if m["m00"] != 0:
                return (int(m["m10"] / m["m00"]), int(m["m01"] / m["m00"]))
            return None
            
        c_curr = get_centroid(current_mask)
        c_fut = get_centroid(future_mask)
        
        if c_curr and c_fut:
            cv2.arrowedLine(dir_img, c_curr, c_fut, (255, 255, 0), 3, tipLength=0.3)
            text_pos = (min(c_curr[0], c_fut[0]), max(c_curr[1], c_fut[1]) + 20)
            cv2.putText(dir_img, f"{analytics.spread_direction:.1f} deg", 
                        text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        plt.imsave(path_direction, dir_img)
        generated_files["fire_direction"] = path_direction

        # 8. Risk Dashboard Image
        path_dashboard = os.path.join(self.output_dir, "risk_dashboard.png")
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.axis('off')
        
        text_content = (
            f"Risk Dashboard\n\n"
            f"Current Area: {analytics.current_area} px\n"
            f"Future Area: {analytics.future_area} px\n"
            f"Growth: {analytics.growth_percentage:.2f} %\n"
            f"Spread Distance: {analytics.spread_distance:.2f} px\n"
            f"Spread Speed: {analytics.spread_speed:.2f} px/t\n"
            f"Direction: {analytics.spread_direction:.2f} deg\n"
            f"Risk Score: {analytics.risk_score:.2f}\n"
            f"Risk Level: {analytics.risk_category}\n"
            f"Confidence: {analytics.confidence:.4f}\n"
        )
        
        ax.text(0.1, 0.5, text_content, fontsize=14, va='center', ha='left', family='monospace')
        plt.savefig(path_dashboard, bbox_inches='tight')
        plt.close()
        generated_files["risk_dashboard"] = path_dashboard

        return generated_files

    # Fallbacks for old API references
    def heatmap(self): pass
    def overlay(self): pass
    def boundary(self): pass
    def difference(self): pass
    def save(self): pass
