import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import '../styles/CakeConstructor.css';

const CakeConstructor = () => {
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Визначення ціни за кілограм
  const PRICE_PER_KG = 1000; 
  const [cake, setCake] = useState({
    
    tiers: 1, // Початково 1 ярус
    flavor: 'Ванільний',
    filling: 'Полуничне конфі',
    color: '#ffffff',
    weight: 1.5, // Початкова вага для 1 ярусу
    deliveryDate: '',
    deliveryTime: '12:00',
    designPhotoUrl: '',
    wishes: '',
    totalPrice: 1500 
  });

  // Функція для визначення мінімальної ваги залежно від ярусів
  const getMinWeight = (tiers) => {
    if (tiers === 1) return 1.5;
    if (tiers === 2) return 3.5;
    if (tiers === 3) return 6;
    return 1.5;
  };
  useEffect(() => {
  const minW = getMinWeight(Number(cake.tiers));
  // Перевірка, щоб вага не була меншою за допустиму для ярусів
  const finalWeight = cake.weight < minW ? minW : cake.weight;
  
  setCake(prev => ({ 
    ...prev, 
    weight: finalWeight,
    totalPrice: Math.round(finalWeight * PRICE_PER_KG) // Розрахунок суми
  }));
}, [cake.tiers, cake.weight]);

  // Ефект для автоматичної зміни ваги при зміні ярусів
  useEffect(() => {
    const minW = getMinWeight(Number(cake.tiers));
    // Якщо поточна вага менша за мінімально допустиму для нових ярусів — оновлюємо її
    if (cake.weight < minW) {
      setCake(prev => ({ ...prev, weight: minW }));
    }
  }, [cake.tiers]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cake.deliveryDate) {
      alert("Будь ласка, оберіть дату виготовлення.");
      return;
    }

    try {
      await addDoc(collection(db, "custom_orders"), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        details: cake,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert("Ваше замовлення надіслано! Менеджер зв'яжеться з вами найближчим часом. 🎂");
    } catch (error) {
      alert("Сталася помилка при замовленні. Спробуйте ще раз.");
    }
  };

  if (loading) return <div className="c-loading">Завантаження конструктора...</div>;

  if (!user) {
    return (
      <div className="c-auth-container">
        <div className="c-lock-card">
          <span className="c-lock-icon">🔒</span>
          <h2>Створення торта доступне лише клієнтам</h2>
          <p>Будь ласка, увійдіть у свій профіль, щоб скористатися конструктором.</p>
          <button onClick={() => navigate('/profile')} className="c-auth-btn">Увійти / Реєстрація</button>
        </div>
      </div>
    );
  }

  return (
    <div className="c-page">
      <div className="c-glass-container">
        <header className="c-intro">
          <h1>Індивідуальний кондитер 🍰</h1>
          <p>Оберіть параметри, а ми створимо шедевр до вашого свята</p>
        </header>

        <form className="c-main-layout" onSubmit={handleOrder}>
       {/* ЛІВА ПАНЕЛЬ: ВІЗУАЛІЗАЦІЯ ТА ЦІНА */}
          <div className="c-left-panel">
            <div className="c-visualizer">
              {[...Array(Number(cake.tiers))].map((_, i) => (
                <div 
                  key={i} 
                  className="cake-level" 
                  style={{ 
                    backgroundColor: cake.color, 
                    width: `${160 - (i * 30)}px`,
                    bottom: `${i * 45}px`,
                    zIndex: 10 - i
                  }}
                ></div>
              ))}
            </div>
            
            <div className="c-info-summary animate-fade">
              <h3 className="summary-title">Вартість замовлення:</h3>
              <div className="price-tag">
                <span className="price-amount">{cake.totalPrice}</span>
                <span className="price-currency">грн</span>
              </div>
              <div className="summary-details">
                <p>⚖️ Вага: <span>{cake.weight} кг</span></p>
                <p>🧁 Смак: <span>{cake.flavor}</span></p>
              </div>
            </div>
          </div>

          {/* Права частина: Налаштування */}
          <div className="c-right-panel">
            <div className="c-form-section">
              <h4>🎨 Параметри торта</h4>
              <div className="c-row">
                <div className="c-input">
                  <label>Яруси: {cake.tiers}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    value={cake.tiers} 
                    onChange={(e) => setCake({...cake, tiers: e.target.value})} 
                  />
                </div>
                {/* НОВИЙ БЛОК: Вибір ваги */}
                <div className="c-input">
                  <label>Вага (кг): {cake.weight}</label>
                  <input 
                    type="range" 
                    min={getMinWeight(Number(cake.tiers))} 
                    max="15" 
                    step="0.5"
                    value={cake.weight} 
                    onChange={(e) => setCake({...cake, weight: e.target.value})} 
                  />
                  <small style={{fontSize: '10px', color: '#8e7d71'}}>
                    Мін. вага для {cake.tiers} ярусів: {getMinWeight(Number(cake.tiers))} кг
                  </small>
                </div>
              </div>

              <div className="c-row">
                <div className="c-input">
                  <label>Колір покриття</label>
                  <input type="color" value={cake.color} onChange={(e) => setCake({...cake, color: e.target.value})} />
                </div>
                <div className="c-input">
                  <label>Смак коржів</label>
                  <select value={cake.flavor} onChange={(e) => setCake({...cake, flavor: e.target.value})}>
                    <option>Ванільний</option>
                    <option>Шоколадний</option>
                    <option>Червоний оксамит</option>
                  </select>
                </div>
              </div>

              <div className="c-row">
                <div className="c-input">
                  <label>Начинка</label>
                  <select value={cake.filling} onChange={(e) => setCake({...cake, filling: e.target.value})}>
                    <option>Полуничне конфі</option>
                    <option>Солона карамель</option>
                    <option>Манго-маракуйя</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="c-form-section">
              <h4>📅 Дата та час отримання</h4>
              <div className="c-row">
                <div className="c-input">
                  <label>Дата</label>
                  <input type="date" required onChange={(e) => setCake({...cake, deliveryDate: e.target.value})} />
                </div>
                <div className="c-input">
                  <label>Бажаний час</label>
                  <input type="time" value={cake.deliveryTime} onChange={(e) => setCake({...cake, deliveryTime: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="c-form-section">
              <h4>📸 Ваші побажання</h4>
              <div className="c-input">
                <label>Посилання на фото дизайну (Pinterest/Instagram)</label>
                <input type="url" placeholder="https://..." onChange={(e) => setCake({...cake, designPhotoUrl: e.target.value})} />
              </div>
              <div className="c-input">
                <label>Додаткові деталі або напис</label>
                <textarea 
                  rows="3" 
                  placeholder="Наприклад: Напис 'З днем народження' золотими літерами..."
                  onChange={(e) => setCake({...cake, wishes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="c-submit-btn">Оформити замовлення</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CakeConstructor;