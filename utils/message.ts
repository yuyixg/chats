import { ChatModelPrice } from '@/types/model';

export const calcTokenPrice = (
  priceConfig: ChatModelPrice,
  inputTokenCount: number,
  outTokenCount: number
) => {
  return (
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
