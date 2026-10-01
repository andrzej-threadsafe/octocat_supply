import type { Product } from '../types/Product';

export const roundCurrency = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const getCartUnitPrice = (product: Product) => {
  const discount = product.discount && product.discount > 0 ? product.discount : 0;
  return roundCurrency(product.price * (1 - discount));
};
