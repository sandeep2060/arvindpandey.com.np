'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function BlogSearch() {
	const [query, setQuery] = useState('')

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		// Implement search logic here
		console.log('Searching for:', query)
	}

	return (
		<form onSubmit={handleSearch} className="relative max-w-md mx-auto">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search articles..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="pl-10 pr-24"
			/>
			<Button
				type="submit"
				className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
			>
				Search
			</Button>
		</form>
	)
}
