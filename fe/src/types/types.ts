import { ReactNode } from "react";

export interface Product {
  id: number;
  image: string;
  description: string;
  detail: string;
  name: string;
  rating: number;
  price: number;
  quantitySold: number;
  remainingQuantity: number;
  category: string;
  date: string;
}

export interface Review {
  id: number;
  userId: number,
  userName: string,
  content: string,
  rating: number;
  updated: [number, number, number, number, number, number, number]
}

export interface RoomData {
  data: Room[];
}

export interface MeetingData {
  code: number;
  data: {
    sessionId: string;
    start: string;
    end: string | null;
    meetingId: string;
    duration: number;
    links: {
      get_room: string;
      get_session: string;
    };
    playbackHlsUrl: string;
    id: string;
  };
}

export interface Room {
  roomId: string;
  customRoomId: string;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    name: string;
    discontinuedReason: string | null;
    id: string;
  };
  id: string;
  links: {
    get_room: string;
    get_session: string;
  };
}

export interface Meta {
  createdAt: string;
  width: number;
  height: number;
  format: string;
}

export interface ThumbnailResponse {
  message: string;
  roomId: string;
  meta: Meta;
  filePath: string;
  fileSize: number;
  fileName: string;
}

export interface ChatHistory {
  role: string;
  content: string;
}

export interface CardInfo {
  price: number;
  quantity: number;
  productName: string
  id: number;
  productId: number;
}

export interface OrderRequest {
  userId: number;
  orderDetails: Array<OrderDetail>;
}

export interface OrderDetail {
  productId: number;
  amount: number;
}

export interface Login {
  email: string;
  password: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
}

export interface CartRequestDto {
  userId: number;
  productId?: number;
  quantity: number;
}

export interface ReviewRequestDto {
  userId: number|null;
  productId: number|null;
  content: string;
  rating: number;
}

export interface GetCartReponseDto {
  cartId: number;
  productImage: string;
  price: number;
  productName: string;
  quantity: number;
  productId: number;
  remainingQuantity: number;
}

export interface Cart {
  id: string;
  listCartItem: Array<CartItem>;
}


export interface SignUpInfo {
  name: string;
  email: string; 
  password: string; 
}

export interface InputFieldProps {
  type: string;
  label: string;
  name: string;
  children: ReactNode;
}

export interface GetUserInfoDto {
  id: number;
  name: string;
  email: string;
  avatar: string;
  address: string;
  phone: string;
  dob: string
}

export interface Order {
  id: number;
  createdAt: Date;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  password: string;
  gender: number | null;
  dob:  [number, number, number] | null;
  email: string;
  address: string | null;
  phone: string | null;
  isActive: string | null;
}

export interface CartDetail {
  id: number;
  quantity: number;
  checkIn: [number, number, number];
  checkOut: [number, number, number];
}

export interface OrderResponse {
  id: number;
  user: User;
  digitalSignature: any;
  totalPrice: number;
  verified: boolean;
  createdAt: number[];
  updatedAt: number[];
  isAccepted: boolean;
}

export interface Key {
  id: number;
  publicKey: string;
  createTime: number[];
  endTime: number[];
}

export interface UserAdmin {
  id: number;
  name: string;
  email: string;
  created: number[];
  updated: number[];
}

export interface OrderAdmin {
  id: number;
  user: UserAdmin;
  orderDetails: any[];
  digitalSignature: any;
  verified: boolean;
  totalPrice: number | null;
  createdAt: number[];
  updatedAt: number[];
}