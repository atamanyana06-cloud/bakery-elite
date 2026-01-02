import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Header.css';

function Header() {
  const { cartCount } = useCart();
  const location = useLocation(); // Потрібно для підсвічування активного пункту

  // Ліва частина меню
  const leftMenu = [
    { id: 1, name: 'Головна', path: '/' },
    { id: 2, name: 'Каталог', path: '/catalog' }
  ];

  // Права частина меню (Шлях змінено на /constructor)
  const rightMenu = [
    { id: 3, name: 'Конструктор торта', path: '/constructor' },
    { id: 4, name: 'Профіль', path: '/profile' }
  ];

  return (
    <header className="header-container">
      <nav className="header-nav">
        
        {/* Ліва частина */}
        <ul className="nav-group">
          {leftMenu.map(item => (
            <li key={item.id} className="nav-link">
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Центральний логотип */}
        <Link to="/" className="header-logo">
          <div className="logo-badge">
             <span className="logo-emoji">🥐</span>
             <h1 className="logo-title">BAKERY ELITE</h1>
          </div>
        </Link>

        {/* Права частина */}
        <ul className="nav-group">
          {rightMenu.map(item => (
            <li key={item.id} className="nav-link">
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.name}
                {/* Відображаємо кількість товарів біля іконки профілю або як окремий індикатор */}
                {item.name === 'Профіль' && cartCount > 0 && (
                  <span className="cart-badge-mini">{cartCount}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

      </nav>
    </header>
  );
}

export default Header;