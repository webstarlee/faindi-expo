import { ProductProps } from "../hooks/types";

export function checkIsLike(_product: ProductProps, userId: string) {
  if (userId) {
    const liked = _product.likes.filter((like) => like.user_id.toString() === userId.toString());
    if (liked.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

const currencies = [
  {"symbol": "$", "name": "USD"},
  {"symbol": "€", "name": "EUR"},
  {"symbol": "£", "name": "GBP"}
];

export function getCurrencySymbol(currency_name: string) {
  const currency = currencies.filter((_currency) => _currency.name.toUpperCase() === currency_name.toUpperCase())[0]
  return currency.symbol;
}

export function getCurrencyName(currency_symbol: string) {
  const currency = currencies.filter((_currency) => _currency.symbol === currency_symbol)[0]
  return currency.name;
}