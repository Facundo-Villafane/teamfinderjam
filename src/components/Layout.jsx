import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AppHeader } from './layout/AppHeader'
import { NavigationMenu } from './layout/NavigationMenu'

const Layout = ({ user, isAdmin }) => {
  const [showMenu, setShowMenu] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setShowMenu(!showMenu)
  const closeMenu = () => setShowMenu(false)

  return (
    <div className="min-h-screen bg-gray-900">
      <AppHeader 
        user={user} 
        isAdmin={isAdmin} 
        onMenuToggle={toggleMenu}
        currentPath={location.pathname}
      />
      
      <NavigationMenu 
        isOpen={showMenu} 
        onClose={closeMenu}
        user={user}
        isAdmin={isAdmin}
        currentPath={location.pathname}
      />
      
      <main className="p-4">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout