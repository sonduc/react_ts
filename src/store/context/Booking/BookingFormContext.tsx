import {updateObject} from '@/store/utility';
import {RoomIndexRes} from '@/types/Requests/Rooms/RoomResponses';
import {createContext, Dispatch} from 'react';
import {formatTime} from '@/utils/mixins';
import {BookingPriceCalculatorReq} from '@/types/Requests/Booking/BookingRequests';
import {AxiosRes} from '@/types/Requests/ResponseTemplate';
import {BookingPriceCalculatorRes} from '@/types/Requests/Booking/BookingResponses';
import {axios} from '@/utils/axiosInstance';

export const BookingFormContext = createContext<IBookingFormContext | any>(null);

export interface IBookingFormContext {
  state: BookingFormState,
  dispatch: Dispatch<BookingFormAction>
}

export type BookingFormState = {
  readonly room: RoomIndexRes | null;
  readonly price?: BookingPriceCalculatorRes | null
  readonly coupon: string;
  readonly discount: number;
}

export type BookingFormAction = { type: 'setRoom', room: RoomIndexRes, price: BookingPriceCalculatorRes }
  | { type: 'setCoupon', coupon: string, discount: number }
  | { type: 'removeCoupon' }

export const BookingFormStateInit: BookingFormState = {
  room: null,
  coupon: '',
  discount: 0,
  price: null,
};

export interface IBookingFormParams {
  checkin: string;
  checkout: string;
  checkin_hour: number;
  checkout_hour: number;
  checkout_minute?: number;
  checkin_minute?: number;
  hosting_id: number;
  number_guests: number;
  booking_type: number;
}

export const BookingFormReducer = (state: BookingFormState, action: BookingFormAction): BookingFormState => {
  switch (action.type) {
    case 'setRoom':
      return updateObject<BookingFormState>(state, {
        room: action.room,
        price: action.price,
      });
    case 'setCoupon':
      return updateObject<BookingFormState>(state, {
        coupon: action.coupon,
        discount: action.discount,
      });
    case 'removeCoupon':
      return updateObject<BookingFormState>(state, {
        coupon: '',
        discount: 0,
      });
    default:
      return state;
  }
};

export const priceCalculator = async (params: IBookingFormParams, state: BookingFormState): Promise<any> => {
  let additional_fee = 0;
  let discount       = 0;
  let CI             = '';
  let CO             = '';
  try {
    CI = formatTime(params.checkin, params.checkin_hour, params.checkin_minute);
    CO = formatTime(params.checkout, params.checkout_hour, params.checkout_minute);
  } catch (e) {
    console.error(e);
  }

  const data: BookingPriceCalculatorReq = {
    room_id: params.hosting_id,
    checkin: CI,
    checkout: CO,
    additional_fee: additional_fee,
    number_of_guests: params.number_guests,
    booking_type: params.booking_type,
    price_discount: discount,
  };

  const response: AxiosRes<BookingPriceCalculatorRes> = await axios.post('bookings/price-calculator', data);
  const info: AxiosRes<RoomIndexRes>                  = await axios.get(`rooms/${params.hosting_id}?include=details,media`);

};

export const priceCalculate = async (params: IBookingFormParams) => {
  let additional_fee = 0;
  let discount       = 0;
  let CI             = '';
  let CO             = '';
  try {
    CI = formatTime(params.checkin, params.checkin_hour, params.checkin_minute);
    CO = formatTime(params.checkout, params.checkout_hour, params.checkout_minute);
  } catch (e) {
    console.error(e);
  }

  const data: BookingPriceCalculatorReq = {
    room_id: params.hosting_id,
    checkin: CI,
    checkout: CO,
    additional_fee: additional_fee,
    number_of_guests: params.number_guests,
    booking_type: params.booking_type,
    price_discount: discount,
  };

  const res: AxiosRes<BookingPriceCalculatorRes> = await axios.post('bookings/price-calculator', data);

  return res.data;
};

export const getRoomBookingForm = async (params: IBookingFormParams) => {
  const res: AxiosRes<RoomIndexRes> = await axios.get(`rooms/${params.hosting_id}?include=details,media`);

  return res.data;
};
