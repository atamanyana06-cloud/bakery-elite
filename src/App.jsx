import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import Preloader from './pages/Preloader';
import Header from './components/Header.jsx';
import Slider from './components/Slider.jsx';
import Catalog from './pages/Catalog.jsx';
import Cart from './components/Cart.jsx';
import CartButton from './components/CartButton.jsx';
import Profile from './pages/Profile.jsx';
import CakeConstructor from './pages/CakeConstructor.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

// --- 1. КОМПОНЕНТ ПЕРЕХОДУ ДО КАТАЛОГУ (ЗАМІСТЬ СІТКИ) ---
const CatalogCTA = () => (
  <section className="catalog-cta animate-fade">
    <div className="cta-content">
      <span className="cta-subtitle">Наші шедеври</span>
      <h2 className="cta-title">Відкрийте світ вишуканої випічки</h2>
      <p className="cta-text">
        Від хрустких круасанів до авторських тортів — кожен виріб створений, щоб дарувати вам насолоду.
      </p>
      <Link to="/catalog" className="cta-button">Перейти до каталогу 🥐</Link>
    </div>
  </section>
);

// --- 2. КОМПОНЕНТ ГРАНДІОЗНОЇ ІСТОРІЇ ---
const AboutTimeline = () => {
  const events = [
    { 
      year: '2015', 
      title: 'Народження легенди', 
      desc: 'Все почалося з однієї маленької печі та нестримного бажання створювати ідеальні круасани. Ми вірили, що справжня якість не потребує реклами.',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000' 
    },
    { 
      year: '2019', 
      title: 'Визнання міста', 
      desc: 'Bakery Elite отримала статус "Найкраща крафтова пекарня". Наші черги стали довшими, а посмішки клієнтів — головною нагородою.',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000'
    },
    { 
      year: '2022', 
      title: 'Цифрова еволюція', 
      desc: 'Ми запустили унікальний конструктор тортів, давши можливість кожному стати творцем свого свята. Технології зустрілися з традиціями.',
      img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000'
    },
    { 
      year: '2025', 
      title: 'Нова ера', 
      desc: 'Відкриття Клубу Гурманів та запуск VIP-системи лояльності. Ми продовжуємо писати історію Bakery Elite разом з вами.',
      img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000'
    }
  ];

  return (
    <section className="grand-history">
      <div className="history-header">
        <span className="subtitle">Bakery Elite Heritage</span>
        <h2 className="main-title">Наша грандіозна історія</h2>
      </div>
      <div className="grand-timeline">
        <div className="vertical-line"></div>
        {events.map((event, index) => (
          <div key={index} className={`history-row ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="history-image-box animate-fade-in">
              <img src={event.img} alt={event.title} />
              <div className="year-badge">{event.year}</div>
            </div>
            <div className="history-content-box">
              <div className="node-marker"></div>
              <h3>{event.title}</h3>
              <p>{event.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- 3. КОМПОНЕНТ COOKIE-БАНЕРА ---
const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return (
    <div className="cookie-banner animate-slide-up">
      <div className="cookie-text">Ми використовуємо cookies, щоб зробити ваш досвід максимально солодким. 🥐</div>
      <div className="cookie-buttons">
        <button className="btn-pref">Налаштування</button>
        <button className="btn-reject" onClick={() => setIsVisible(false)}>Відхилити</button>
        <button className="btn-accept" onClick={() => setIsVisible(false)}>Прийняти все</button>
      </div>
    </div>
  );
};

// --- ГОЛОВНА ФУНКЦІЯ APP ---
function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <CartProvider>
      {!isLoaded ? (
        <Preloader onComplete={() => setIsLoaded(true)} />
      ) : (
        <Router>
          <div className="app-wrapper animate-fade">
            <Header />
            <CartButton />
            
            <main className="content">
              <Routes>
                {/* ГОЛОВНА СТОРІНКА */}
                <Route path="/" element={
                  <>
                    <Slider />
                    <CatalogCTA /> {/* Блок з кнопкою замість сітки товарів */}
                    <AboutTimeline />
                  </>
                } />
                
                {/* СТОРІНКА КАТАЛОГУ */}
                <Route path="/catalog" element={<Catalog />} />
                
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/constructor" element={<CakeConstructor />} />
              </Routes>
            </main>

            <Footer />
            <CookieBanner />
          </div>
        </Router>
      )}
    </CartProvider>
  );
}

export default App;