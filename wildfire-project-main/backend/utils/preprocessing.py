import os
import numpy as np
import rasterio
import torch
from PIL import Image
from torchvision import transforms

class ImagePreprocessor:
    def __init__(self, image_size=256):
        self.image_size = image_size

        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
        ])

    def preprocess(self, image_path):
        ext = os.path.splitext(image_path)[1].lower()

        if ext in (".tif", ".tiff"):
            with rasterio.open(image_path) as src:
                image = src.read(1).astype(np.float32)
                image = np.nan_to_num(image)
        elif ext in (".jpg", ".jpeg"):
            with Image.open(image_path) as img:
                image = np.array(img.convert("L"), dtype=np.float32)
        else:
            raise ValueError(f"Unsupported image format: {ext}")

        if image.ndim != 2:
            raise ValueError(
                f"Expected a single grayscale band, got shape {image.shape}"
            )

        image_min = float(image.min())
        image_max = float(image.max())

        if image_max > image_min:
            image = (image - image_min) / (image_max - image_min)
        else:
            image = np.zeros_like(image, dtype=np.float32)

        image_uint8 = (image * 255).clip(0, 255).astype(np.uint8)
        image_rgb = np.stack([image_uint8] * 3, axis=-1)

        pil_image = Image.fromarray(image_rgb)
        tensor = self.transform(pil_image).unsqueeze(0)

        return image_rgb, tensor
