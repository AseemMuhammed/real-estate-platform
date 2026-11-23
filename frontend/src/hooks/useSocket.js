import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const useSocket = (handlers = {}) => {
    const { token } = useAuth();
    const handlersRef = useRef(handlers);
    const socketRef = useRef(null);

    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        if (!token) return undefined;

        const socket = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        const events = ['receiveMessage', 'messageDeleted', 'chatDeleted', 'newInquiry', 'typing'];
        events.forEach((event) => {
            socket.on(event, (payload) => handlersRef.current[event]?.(payload));
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    return socketRef;
};

export default useSocket;
