import {createContext, Dispatch} from 'react';
import {RoomIndexRes} from '@/types/Requests/Rooms/RoomResponses';
import {LocationDescriptorObject} from 'history';
import qs from 'query-string';
import {AxiosRes, Pagination, BaseResponse} from '@/types/Requests/ResponseTemplate';
import {axios} from '@/utils/axiosInstance';
import {BOOKING_TYPE_DAY} from '@/utils/store/global';
import {updateObject} from '@/store/utility';
import {RoomIndexGetParams, RoomUrlParams} from '@/types/Requests/Rooms/RoomRequests';
import {Range} from 'react-input-range';
import _ from 'lodash';

export const MIN_PRICE  = 0;
export const MAX_PRICE  = 10000000;
export const STEP_PRICE = 10000;

export const RoomIndexContext = createContext<IRoomIndexContext | any>(null);

export interface IRoomIndexContext {
  state: RoomIndexState,
  dispatch: Dispatch<RoomIndexAction>,
}

export type RoomIndexAction = { type: 'setRooms', rooms: RoomIndexRes[], meta?: Pagination | null }
  | { type: 'setPrices', price: Range }
  | { type: 'setMeta', meta: Pagination }
  | { type: 'setLoadMore', isLoadMore: boolean }
  | { type: 'setMapOpen', isMapOpen: boolean }
  | { type: 'setRating', ratingLists: number[] }

export type RoomIndexState = {
  readonly rooms: RoomIndexRes[]
  readonly sorts: any
  readonly price: Range,
  readonly ratingLists: number[]
  readonly amenities: number[]
  readonly meta: Pagination | null
  readonly isLoadMore: boolean
  readonly isMapOpen: boolean
}

export const RoomIndexStateInit: RoomIndexState = {
  price: {
    min: MIN_PRICE,
    max: MAX_PRICE,
  },
  rooms: [],
  amenities: [],
  ratingLists: [],
  sorts: null,
  meta: null,
  isLoadMore: false,
  isMapOpen: true,
};

export const RoomIndexReducer = (state: RoomIndexState, action: RoomIndexAction): RoomIndexState => {
  switch (action.type) {
    case 'setRooms':
      return updateObject<RoomIndexState>(state, {
        rooms: action.rooms,
        meta: action.meta || null,
      });
    case 'setPrices':
      return updateObject<RoomIndexState>(state, {
        price: action.price,
      });
    case 'setMeta':
      return updateObject<RoomIndexState>(state, {
        meta: action.meta,
      });
    case 'setLoadMore':
      return updateObject<RoomIndexState>(state, {
        isLoadMore: action.isLoadMore,
      });
    case 'setMapOpen':
      return updateObject<RoomIndexState>(state, {
        isMapOpen: action.isMapOpen,
      });
    case 'setRating':
      return updateObject<RoomIndexState>(state, {
        ratingLists: action.ratingLists,
      });
    default:
      return state;
  }
};

/**
 * Get list of rooms
 * @param {LocationDescriptorObject} location
 * @param {number} page
 * @returns {Promise<BaseResponse<RoomIndexRes[]>>}
 */
export const getRooms = async (location: LocationDescriptorObject, page?: number): Promise<BaseResponse<RoomIndexRes[]>> => {
  const params: RoomUrlParams = qs.parse(location.search!);

  const query: Partial<RoomIndexGetParams> = {
    include: 'details,media,city,district,comforts',
    name: params.name,
    rent_type: params.rent_type,
    check_in: params.check_in,
    check_out: params.check_out,
    number_guest: params.number_of_guests,
    most_popular: params.most_popular,
    price_day_from: params.price_day_from,
    price_day_to: params.price_day_to,
    manager: (typeof params.instant !== 'undefined') ? 1 : 0,
    sort_price_day: (params.lowest_price === null) ? 0 : 1,
    avg_rating: (params.rating && params.rating.length > 0) ? _.split(params.rating, ',')[0] : undefined,
    page
  };

  const url = `rooms?${qs.stringify(query)}`;

  return fetchRoom(url);
};

export const newRoomLocation = (params: RoomUrlParams): LocationDescriptorObject => {
  return {
    pathname: 'rooms',
    search: `?${qs.stringify(params)}`,
  };
};

export const fetchRoom = async (url: string) => {
  const res: AxiosRes<RoomIndexRes[]> = await axios.get(url);
  return res.data;
};

export const loadMoreRooms = (state: RoomIndexState, dispatch: Dispatch<RoomIndexAction>) => {
  const {meta, rooms} = state;
  if (meta !== null) {
    let links = meta!.pagination.links;

    if (!_.isArray(links) && links.next) {
      fetchRoom(links.next).then(data => {
        const meta         = data.meta;
        const roomsNext    = data.data;
        const roomsUpdated = _.concat(rooms, roomsNext);

        dispatch({
          type: 'setRooms',
          rooms: roomsUpdated,
          meta: meta,
        });
      }).catch(err => {
        console.log(err);
      });
    } else {
      dispatch({
        type: 'setLoadMore',
        isLoadMore: false,
      });
    }
  }
};