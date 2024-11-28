import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

export const userData: User[] = [
    {
        id: uuidv4(),
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
        email: 'user1@example.com',
        password: 'password1',
        name: 'User One',
        phone: '123-456-7890',
        avatar: 'avatar1.png',
        token: null,
        tokenExpiration: null
    },
    {
        id: uuidv4(),
        createdAt: new Date('2023-02-01T10:00:00Z'),
        updatedAt: new Date('2023-02-01T10:00:00Z'),
        email: 'user2@example.com',
        password: 'password2',
        name: 'User Two',
        phone: '123-456-7891',
        avatar: 'avatar2.png',
        token: null,
        tokenExpiration: null
    },
    {
        id: uuidv4(),
        createdAt: new Date('2023-03-01T10:00:00Z'),
        updatedAt: new Date('2023-03-01T10:00:00Z'),
        email: 'user3@example.com',
        password: 'password3',
        name: 'User Three',
        phone: '123-456-7892',
        avatar: 'avatar3.png',
        token: null,
        tokenExpiration: null
    },
    {
        id: uuidv4(),
        createdAt: new Date('2023-04-01T10:00:00Z'),
        updatedAt: new Date('2023-04-01T10:00:00Z'),
        email: 'user4@example.com',
        password: 'password4',
        name: 'User Four',
        phone: '123-456-7893',
        avatar: 'avatar4.png',
        token: null,
        tokenExpiration: null
    }
]