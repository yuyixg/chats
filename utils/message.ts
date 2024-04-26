import { ChatModelPriceConfig } from '@/types/model';
import Decimal from 'decimal.js';

export const calcTokenPrice = (
  priceConfig: ChatModelPriceConfig,
  inputTokenCount: number,
  outTokenCount: number
) => {
  return new Decimal(
    calcInputTokenPrice(inputTokenCount, priceConfig.input) +
      calcOutTokenPrice(outTokenCount, priceConfig.out)
  );
};

export const calcInputTokenPrice = (
  inputTokenCount: number,
  inputPrice: number
) => {
  return inputTokenCount * inputPrice;
};

export const calcOutTokenPrice = (outTokenCount: number, outPrice: number) => {
  return outTokenCount * outPrice;
};
