import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { ToastAndroid } from "react-native";
import axios from "axios";
import { convertApiUrl } from "../config";
import { useEffectOnce } from "./useEffectOnce";
import { ProductProps, CategoryProps } from "./types";

interface ProductContextValue {
  products: ProductProps[] | [];
  categories: CategoryProps[] | [];
  randomProducts: ProductProps[] | [];
  searchString: string | "";
  productLoading: boolean;
  updateSearchString: (_searchString: string) => void;
  updateProductLikes: (_product: ProductProps) => void;
  addProduct: (_product: ProductProps) => void;
  updateProduct: (_product: ProductProps) => void;
  setProductSold: (_product_id: string) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(
  undefined
);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [productFetching, setProductFetching] = useState(false);
  const [products, setProducts] = useState<ProductProps[] | []>([]);
  const [categories, setCategories] = useState<CategoryProps[] | []>([]);
  const [randomProducts, setRandomProducts] = useState<ProductProps[] | []>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [productLoading, setProductLoading] = useState(true);

  const fetchItems = async () => {
    setProductLoading(true);
    try {
      const response = await axios.get(convertApiUrl("product/items"));
      const _products = response.data.products;
      setProducts(_products);
      const _categories = response.data.categories;
      setCategories(_categories);
      setProductLoading(false);
    } catch (error) {
      setProductLoading(false);
      //@ts-ignore
      // console.log(error?.response);
    }
  };

  useEffect(() => {
    if (categories.length === 0 && !productFetching) {
      setProductFetching(true);
      fetchItems();
    }
  },[categories, productFetching]);

  const updateSearchString = (_searchString: string) => {
    setSearchString(_searchString);
  }

  const updateProductLikes = (_product: ProductProps) => {
    var exept_products = products.filter((prod) => prod._id.toString() !== _product._id.toString());
    exept_products.push(_product);
    setProducts(exept_products);
  }

  const addProduct = (_product: ProductProps) => {
    setProducts([_product, ...products]);
  }

  const updateProduct = (_product: ProductProps) => {
    const _allProducts = [...products];
    var newAllProducts = _allProducts.filter((product) => product._id.toString() !== _product._id.toString());
    newAllProducts.push(_product)
    setProducts(newAllProducts);
  }

  const setProductSold = (_product_id: string) => {
    const _allProducts = [...products];
    _allProducts.map((single_product) => {
      if (single_product._id.toString() === _product_id.toString()) {
        single_product.sold = true;
      }
    })
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        randomProducts,
        searchString,
        productLoading,
        updateSearchString,
        updateProductLikes,
        addProduct,
        updateProduct,
        setProductSold
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProduct(): ProductContextValue {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProdcut must be used within a ProductProvider");
  }
  return context;
}
