import os
import matplotlib
matplotlib.use("Agg")
import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt

class ConvLSTMCell(nn.Module):

    def __init__(self,input_channels,hidden_channels,kernel_size=3):

        super().__init__()

        padding=kernel_size//2

        self.hidden_channels=hidden_channels

        self.conv=nn.Conv2d(
            input_channels+hidden_channels,
            4*hidden_channels,
            kernel_size,
            padding=padding
        )

    def forward(self,x,h,c):

        combined=torch.cat([x,h],dim=1)

        gates=self.conv(combined)

        i,f,o,g=torch.chunk(gates,4,dim=1)

        i=torch.sigmoid(i)
        f=torch.sigmoid(f)
        o=torch.sigmoid(o)
        g=torch.tanh(g)

        c=f*c+i*g

        h=o*torch.tanh(c)

        return h,c

class ConvLSTM(nn.Module):

    def __init__(self):

        super().__init__()

        self.hidden_channels=32

        self.cell=ConvLSTMCell(

            input_channels=1,

            hidden_channels=self.hidden_channels

        )

        self.output=nn.Conv2d(

            self.hidden_channels,

            1,

            kernel_size=1

        )

    def forward(self,x):

        batch,seq,ch,h,w=x.size()

        hidden=torch.zeros(

            batch,

            self.hidden_channels,

            h,

            w,

            device=x.device

        )

        cell=torch.zeros_like(hidden)

        for t in range(seq):

            hidden,cell=self.cell(

                x[:,t],

                hidden,

                cell

            )

        return self.output(hidden)

class ConvLSTMService:

    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.CONVLSTM_PATH = model_path
        self.convlstm = None

    def load_model(self):
        self.convlstm = ConvLSTM().to(self.device)

        checkpoint = torch.load(

            self.CONVLSTM_PATH,

            map_location=self.device

        )

        # Supports both checkpoint formats
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            self.convlstm.load_state_dict(checkpoint["model_state_dict"])
        else:
            self.convlstm.load_state_dict(checkpoint)

        self.convlstm.eval()

    def predict(self, fire_masks, thermal_images=None):
        sequence = np.array(
            fire_masks,
            dtype=np.float32
        )

        sequence = torch.tensor(sequence)

        sequence = sequence.unsqueeze(1)

        sequence = sequence.unsqueeze(0)

        sequence = sequence.to(self.device)

        with torch.no_grad():

            prediction = self.convlstm(sequence)

            prediction = torch.sigmoid(prediction)

        future_mask = (
            prediction > 0.5
        ).float()

        future_mask = future_mask.squeeze().cpu().numpy()
        prediction_np = prediction.squeeze().cpu().numpy()

        os.makedirs("outputs", exist_ok=True)
        
        np.save("outputs/probability_map.npy", prediction_np)
        np.save("outputs/future_mask.npy", future_mask)
        
        plt.imsave("outputs/predicted_future_fire.png", future_mask, cmap="gray")
        
        if thermal_images is not None and len(thermal_images) > 0:
            plt.figure(figsize=(5,5))
            plt.imshow(thermal_images[-1], cmap="inferno")
            plt.imshow(
                future_mask,
                alpha=0.4,
                cmap="jet"
            )
            plt.axis("off")
            plt.savefig("outputs/future_fire_overlay.png", bbox_inches='tight', pad_inches=0)
            plt.close()
            
        return prediction_np, future_mask
