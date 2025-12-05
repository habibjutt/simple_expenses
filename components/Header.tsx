'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import ExpenseModal from './expense-modal'

const Header = () => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const { data: session, isPending } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut()
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="flex justify-between items-center py-4 px-6">
          <div className="font-bold text-lg">Simple Expenses</div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex justify-between items-center py-4 px-6">
        <div className="flex items-center gap-8">
          <div className="font-bold text-lg">Simple Expenses</div>
          {session ? (
            <nav className="flex gap-6">
              <Link
                href="/expenses"
                className="text-gray-700 hover:text-black transition-colors"
              >
                Expenses
              </Link>
            </nav>
          ) : null}
        </div>

        <div>
          {isPending ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : session ? (
            <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {session.user.name || session.user.email}
                  <span className="text-xs">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <button type="button" onClick={() => setShowExpenseModal(true)} className="w-full text-left bg-transparent border-none p-0 m-0 cursor-pointer">
                    Create Expense Account
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-sm text-gray-600">
                    {session.user.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ExpenseModal open={showExpenseModal} setOpen={setShowExpenseModal} />
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header