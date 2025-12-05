'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Session, type User, type AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
	user: User | null
	session: Session | null
	loading: boolean
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const syncSession = async (event: AuthChangeEvent, session: Session | null) => {
			try {
				await fetch('/auth/callback', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ event, session }),
				})
			} catch (error) {
				console.error('Failed to sync auth session:', error)
			}
		}

		const checkSession = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession()
				setSession(session)
				setUser(session?.user ?? null)
				setLoading(false)

				if (session) {
					await syncSession('SIGNED_IN', session)
				}
			} catch (error) {
				console.error('Error checking session:', error)
				setLoading(false)
			}
		}

		checkSession()

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				setSession(session)
				setUser(session?.user ?? null)
				setLoading(false)

				if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
					await syncSession(event, session)
				}
			}
		)

		return () => subscription.unsubscribe()
	}, [])

	const signIn = async (email: string, password: string) => {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				throw error
			}

			// Refresh after successful login
			const { data: { session } } = await supabase.auth.getSession()
			setSession(session)
			setUser(session?.user ?? null)

		} catch (error) {
			console.error('Sign in error:', error)
			throw error
		}
	}

	const signOut = async () => {
		try {
			await supabase.auth.signOut()
			setUser(null)
			setSession(null)
			router.push('/')
		} catch (error) {
			console.error('Sign out error:', error)
		}
	}

	return (
		<AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
