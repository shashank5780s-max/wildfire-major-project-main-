import torch
import segmentation_models_pytorch as smp

class UNetService:
    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.UNET_PATH = model_path

    def load_model(self):
        self.unet = smp.Unet(
            encoder_name="resnet34",
            encoder_weights=None,
            in_channels=3,
            classes=1
        )
        
        checkpoint = torch.load(
            self.UNET_PATH,
            map_location=self.device
        )
        
        self.unet.load_state_dict(
            checkpoint["model_state_dict"]
        )
        
        self.threshold = checkpoint["threshold"]
        
        self.unet = self.unet.to(self.device)
        self.unet.eval()

    def predict(self, tensor):
        tensor = tensor.to(self.device)
        
        with torch.no_grad():
            pred = self.unet(tensor)
            pred = torch.sigmoid(pred)
            mask = (pred > self.threshold).float()
            
        return pred, mask
