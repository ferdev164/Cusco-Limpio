// Conexión socket.io-client al backend

import { io } from 'socket.io-client';
import { API_ORIGIN } from '../../../config';

export const socket = io(API_ORIGIN, { autoConnect: true });
