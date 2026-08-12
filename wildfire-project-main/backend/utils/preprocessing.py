import cv2
import torch
import rasterio
import numpy as np

class ImagePreprocessor:
    def preprocess(self, path):
        with rasterio.open(path) as src:
            img = src.read(1)

        img = np.nan_to_num(img)

        img = (img - img.min()) / (img.max() - img.min() + 1e-8)

        img = (img * 255).astype(np.uint8)

        img = cv2.resize(img, (256,256))

        rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)

        tensor = torch.from_numpy(
            rgb.astype(np.float32)/255.0
        ).permute(2,0,1).unsqueeze(0)

        return img, tensor
