import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { convertApiUrl } from "../config";
import {
  ProductProps,
  FollowingProps,
  ProfileFeedbackProps,
  CartProps,
  OrderProps,
} from "./types";
import { useAuth } from "./AuthContext";

interface ProfileContextValue {
  ownProducts: ProductProps[] | [];
  likeProducts: ProductProps[] | [];
  feedbacks: ProfileFeedbackProps[] | [];
  followings: FollowingProps[] | [];
  carts: CartProps[] | [];
  orders: OrderProps[] | [];
  totalRate: number | 0;
  totalFeedbackCount: number | 0;
  addOwnProduct: (_product: ProductProps) => void;
  updateOwnProduct: (_product: ProductProps) => void;
  addFollowing: (_following: FollowingProps) => void;
  removeFollowing: (__followingId: string) => void;
  addCart: (_cart: CartProps) => void;
  updateCart: (_seller_id: string, _product: ProductProps) => void;
  remmoveCart: (_seller_id: string) => void;
  addOrder: (_orders: OrderProps[]) => void;
  setOrderDeleivered: (_order_id: string) => void;
  updateLikeProducts: (_product: ProductProps) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, authToken } = useAuth();
  const [isFetching, setIsFetching] = useState(false);
  const [ownProducts, setOwnProducts] = useState<ProductProps[] | []>([]);
  const [likeProducts, setLikeProducts] = useState<ProductProps[] | []>([]);
  const [feedbacks, setFeedbacks] = useState<ProfileFeedbackProps[] | []>([]);
  const [followings, setFollowings] = useState<FollowingProps[] | []>([]);
  const [carts, setCarts] = useState<CartProps[] | []>([]);
  const [orders, setOrders] = useState<OrderProps[] | []>([]);
  const [totalRate, setTotalRate] = useState<number>(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState<number>(0);

  const resetProfileData = () => {
    setOwnProducts([]);
    setLikeProducts([]);
    setFeedbacks([]);
    setFollowings([]);
    setCarts([]);
    setOrders([]);
    setTotalRate(0);
    setTotalFeedbackCount(0);
    setIsFetching(false);
  }

  const updateItems = (
    _ownProducts: ProductProps[] | [],
    _likeProducts: ProductProps[] | [],
    _feedbacks: ProfileFeedbackProps[] | [],
    _followings: FollowingProps[] | [],
    _carts: CartProps[] | [],
    _orders: OrderProps[] | [],
    _totalRate: number | 0,
    _totalFeedbackCount: number | 0
  ) => {
    setOwnProducts(_ownProducts);
    setLikeProducts(_likeProducts);
    setFeedbacks(_feedbacks);
    setFollowings(_followings);
    setCarts(_carts);
    setOrders(_orders);
    setTotalRate(_totalRate);
    setTotalFeedbackCount(_totalFeedbackCount);
  };

  const addOrder = (_orders: OrderProps[]) => {
    const oldOrders = [...orders];
    const finalOrders = oldOrders.concat(_orders);
    setOrders(finalOrders);
  };

  const setOrderDeleivered = (_order_id: string) => {
    const orderData = [...orders];
    orderData.filter((order) => {
      if (order._id.toString() === _order_id.toString()) {
        order.delivered = true;
      }
    });

    setOrders(orderData);
  };

  const addCart = (_cart: CartProps) => {
    setCarts([_cart, ...carts]);
  };

  const updateCart = (_seller_id: string, _product: ProductProps) => {
    const cartsData = [...carts];
    cartsData.filter((cart) => {
      if (cart.seller._id.toString() === _seller_id.toString()) {
        const existProds = cart.products.filter(
          (prod) => prod._id.toString() === _product._id.toString()
        );
        if (existProds.length > 0) {
          const cartProducts = cart.products.filter(
            (prod) => prod._id.toString() !== _product._id.toString()
          );
          cart.products = cartProducts;
        } else {
          const updatedProducts = [...cart.products, _product];
          cart.products = updatedProducts;
        }
      }
    });
    const filterEmptyCart = cartsData.filter(
      (cart) => cart.products.length > 0
    );
    setCarts(filterEmptyCart);
  };

  const remmoveCart = (_seller_id: string) => {
    const cartsData = [...carts].filter(
      (__cart) => __cart.seller._id.toString() !== _seller_id.toString()
    );
    setCarts(cartsData);
  };

  const addFollowing = (_following: FollowingProps) => {
    setFollowings([_following, ...followings]);
  };

  const removeFollowing = (_followingId: string) => {
    const filteredFollowings = followings.filter(
      (following) => following.user._id.toString() !== _followingId.toString()
    );
    setFollowings(filteredFollowings);
  };

  const addOwnProduct = (_product: ProductProps) => {
    setOwnProducts([_product, ...ownProducts]);
  };

  const updateOwnProduct = (_product: ProductProps) => {
    const _ownProducts = [...ownProducts];
    var newOwnProducts = _ownProducts.filter(
      (product) => product._id.toString() !== _product._id.toString()
    );
    newOwnProducts.push(_product);
    setOwnProducts(newOwnProducts);
  };

  const updateLikeProducts = (_product: ProductProps) => {
    var exist_products = likeProducts.filter((prod) => prod._id.toString() === _product._id.toString());
    if (exist_products.length>0) {
      var exept_products = likeProducts.filter((prod) => prod._id.toString() !== _product._id.toString());
      setLikeProducts(exept_products);
    } else {
      setLikeProducts([...likeProducts, _product])
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get(convertApiUrl("profile/items"), {
        headers: { "x-access-token": authToken },
      });
      const _ownProducts = response.data.own_products;
      const _like_products = response.data.like_products;
      const _feedbacks = response.data.feedbacks;
      const _followings = response.data.followings;
      const _carts = response.data.carts;
      const _orders = response.data.orders;
      const _total_rate = response.data.total_rate;
      const _total_feedback_count = response.data.total_feedback_count;
      updateItems(
        _ownProducts,
        _like_products,
        _feedbacks,
        _followings,
        _carts,
        _orders,
        _total_rate,
        _total_feedback_count
      );
    } catch (error: any) {
      console.log(error?.response);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isFetching && authToken) {
      setIsFetching(true);
      fetchItems();
    }
  }, [isAuthenticated, isFetching, authToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("calling reset all here")
      resetProfileData();
    }
  }, [isAuthenticated]);

  return (
    <ProfileContext.Provider
      value={{
        ownProducts,
        likeProducts,
        feedbacks,
        followings,
        carts,
        orders,
        totalRate,
        totalFeedbackCount,
        addOwnProduct,
        updateOwnProduct,
        addFollowing,
        removeFollowing,
        addCart,
        updateCart,
        remmoveCart,
        addOrder,
        setOrderDeleivered,
        updateLikeProducts
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProdcut must be used within a ProductProvider");
  }
  return context;
}
