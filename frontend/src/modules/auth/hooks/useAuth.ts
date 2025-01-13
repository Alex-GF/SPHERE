import { useContext, useEffect } from 'react'
import { useLocalStorage } from '../../core/hooks/useLocalStorage'
import { AuthContext } from '../contexts/authContext'
import { USERS_BASE_PATH } from '../api/usersApi'

export interface AuthUserContext {
    user: AuthUser | null
    isAuthenticated: boolean
    token: string | null,
    tokenExpiration: Date | null,
    isLoading: boolean
}

export interface AuthUser {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string
}

export const useAuth = () => {
    const { authUser, setAuthUser } = useContext(AuthContext)
    const { getItem, setItem, removeItem } = useLocalStorage()

    const addUser = (user: AuthUser, token: string, tokenExpiration: Date) => {
        setAuthUser({
            user: user,
            isAuthenticated: true,
            token: token,
            tokenExpiration: tokenExpiration,
            isLoading: false,
        })

        setItem('token', token)
    }

    const removeUser = () => {
        setAuthUser({
            user: null,
            isAuthenticated: false,
            token: null,
            tokenExpiration: null,
            isLoading: false,
        })
        removeItem('token')
    }

    useEffect(() => {
        const token = getItem('token')

        if (token) {
            fetch(`http://localhost:8080${USERS_BASE_PATH}/tokenLogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token}),
            })
                .then((response: Response) => {
                    if (response.ok) {
                        response.json().then((dataResponse) => {
                            const user = dataResponse.data
                            let userData = {
                                id: user.id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                avatar: user.avatar,
                                // plan: user.plan,
                            }
                            addUser(userData, user.token, new Date(user.tokenExpiration))
                        })
                    } else {
                        removeUser()
                    }
                })
                .catch((_error) => {
                    setTimeout(() => {
                        removeUser()
                    }, 5000)
                })
        } else {
            removeUser()
        }
    }, [])

    const login = (user: AuthUser, token: string, tokenExpiration: Date) => {
        addUser(user, token, tokenExpiration)
    }

    const logout = () => {
        removeUser()
    }

    const fetchWithInterceptor = async (
        url: RequestInfo | URL,
        options?: RequestInit
    ) => {
        
        if (authUser.tokenExpiration) {
            const expirationTime = new Date(authUser.tokenExpiration).getTime()
            const currentTime = new Date().getTime()
            const timeDifference = expirationTime - currentTime

            if (timeDifference < 60*60*1000 && timeDifference > 0) { // 1 hour
                fetch(`${import.meta.env.VITE_API_URL}${USERS_BASE_PATH}/tokenLogin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: authUser.token}),
                })
                    .then((response: Response) => {
                        if (response.ok) {
                            response.json().then((dataResponse) => {
                                const user = dataResponse.data
                                let userData = {
                                    id: user.id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    avatar: user.avatar,
                                    // plan: user.plan,
                                }
                                addUser(userData, user.token, user.tokenExpiration)
                            })
                        } else {
                            removeUser()
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        removeUser()
                    })
            }else{
                removeUser();
            }
        }
        
        const response = await fetch(url, options)
        
        return response
    }

    return { authUser, login, logout, setAuthUser, fetchWithInterceptor }
}
