import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

@Injectable()
export class QRCodeService {
  private readonly defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  /**
   * Génère un QR code sous forme de data URL (base64)
   */
  async generateQRCodeDataURL(
    data: string,
    options?: QRCodeOptions,
  ): Promise<string> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    return QRCode.toDataURL(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    });
  }

  /**
   * Génère un QR code sous forme de Buffer (PNG)
   */
  async generateQRCodeBuffer(
    data: string,
    options?: QRCodeOptions,
  ): Promise<Buffer> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    return QRCode.toBuffer(data, {
      type: 'png',
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    });
  }

  /**
   * Génère un QR code sous forme de string SVG
   */
  async generateQRCodeSVG(
    data: string,
    options?: QRCodeOptions,
  ): Promise<string> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    return QRCode.toString(data, {
      type: 'svg',
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    });
  }
}
