export enum SOSState {
  IDLE = 'IDLE',
  GETTING_LOCATION = 'GETTING_LOCATION',
  FINDING_HOSPITALS = 'FINDING_HOSPITALS',
  CONTACTING = 'CONTACTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Hospital {
  name: string;
  address: string;
  phone: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}