export interface UserProps {
    _id: string;
    avatar: string;
    cover: string;
    fullname: string;
    email: string;
    username: string;
    title: string;
    bio: string;
}

export interface CategoryProps {
    _id: string;
    cat_title: string;
    cat_img: string;
}

export interface MediaProps {
    media_type: string;
    uri: string;
}

export interface LikeProps {
    user_id: string;
}

export interface FeedbackProps {
    user_id: string;
    rate: number | 0;
    comment: string | null;
}

export interface ProductProps {
    _id: string;
    owner: UserProps;
    category: CategoryProps;
    title: string;
    medias: MediaProps[] | [];
    size: string;
    price: number;
    currency: string;
    reduced_price: number;
    description: string;
    likes: { user_id: string }[] | [];
    feedbacks: FeedbackProps[] | [];
    sold: boolean;
    is_recycle: boolean;
}

export interface ProfileFeedbackProps {
    product: ProductProps;
    rate: number;
    comment: string;
}

export interface FollowingProps {
    user: UserProps;
    topProduct: ProductProps | null;
}

export interface CartProps {
    seller: UserProps;
    products: ProductProps[] | [];
}

export interface OrderProps {
    _id: string;
    seller: UserProps,
    product: ProductProps,
    orderTime: Date,
    shipped: boolean,
    readyPick: boolean,
    delivered: boolean,
}

export interface MessageProps {
    receiver_id: string;
    sender_id: string;
    is_faindi: boolean;
    is_rate?: boolean | false;
    product_id?: string | null;
    is_read: boolean;
    content: string;
    medias: MediaProps[] | [];
    created_at: string;
}

export interface ChatProps {
    user: UserProps;
    messages: MessageProps[] | [];
    updated_at: string;
    unread_count: number;
    is_seller: boolean;
}

export interface NotificationProps {
    sender: UserProps,
    notify_type: string,
    content: string,
    rate: number,
    price: number
}