import { ChatModelPrice } from '@/types/model';

export const calcTokenPrice = (
  price: ChatModelPrice,
  inputTokenCount: number,
  outTokenCount: number
) => {
  return (
    calcInputTokenPrice(inputTokenCount, price.input) +
    calcOutTokenPrice(outTokenCount, price.out)
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
