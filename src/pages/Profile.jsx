import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  updatePassword, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from "firebase/firestore";
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('loyalty');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // Поля профілю відповідно до ваших налаштувань
  const [profileData, setProfileData] = useState({
    phone: '',
    gender: '',
    favoriteFilling: 'Шоколад',
    avatarUrl: '',
    newPassword: ''
  });

  const avatarOptions = ['🥐', '🧁', '🍰', '🥨', '🍪', '🍩', '🥯', '🥞', '🍫', '☕'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...docSnap.data() }));
        }
        fetchUserOrders(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserOrders = async (uid) => {
    setOrdersLoading(true);
    try {
      const q = query(collection(db, "custom_orders"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);
    } catch (err) {
      console.error("Помилка завантаження замовлень:", err);
    }
    setOrdersLoading(false);
  };

  // Перевірка 48 годин для скасування
  const canCancel = (deliveryDate) => {
    if (!deliveryDate) return false;
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffInHours = (delivery - now) / (1000 * 60 * 60);
    return diffInHours > 48;
  };

  const handleCancelOrder = async (orderId, deliveryDate) => {
    if (!canCancel(deliveryDate)) {
      alert("На жаль, замовлення вже неможливо скасувати (до дати менше 48 годин).");
      return;
    }

    const reason = prompt("Будь ласка, вкажіть причину відмови:");
    if (!reason) return;

    try {
      const orderRef = doc(db, "custom_orders", orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date().toISOString()
      });
      alert("Замовлення успішно скасовано.");
      fetchUserOrders(user.uid);
    } catch (error) {
      alert("Сталася помилка при скасуванні замовлення.");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError("Помилка авторизації. Перевірте дані.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await setDoc(doc(db, "users", user.uid), {
        phone: profileData.phone,
        gender: profileData.gender,
        favoriteFilling: profileData.favoriteFilling,
        avatarUrl: profileData.avatarUrl
      }, { merge: true });

      if (profileData.newPassword) {
        await updatePassword(user, profileData.newPassword);
      }

      setMessage({ text: 'Дані успішно оновлено!', type: 'success' });
      setProfileData(prev => ({ ...prev, newPassword: '' }));
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { text: 'Очікує', class: 's-pending' };
      case 'cooking': return { text: 'Готується', class: 's-cooking' };
      case 'done': return { text: 'Готово', class: 's-done' };
      case 'cancelled': return { text: 'Скасовано', class: 's-cancelled' };
      default: return { text: 'Прийнято', class: 's-default' };
    }
  };

  if (loading) return <div className="p-loader">Завантаження профілю...</div>;

  if (!user) {
    return (
      <div className="p-wrapper">
        <div className="auth-card animate-fade">
          <h2 className="p-title">{isRegistering ? "Реєстрація" : "Вхід до кабінету"}</h2>
          <form onSubmit={handleAuth} className="p-form">
            <div className="p-input-group">
              <label>Ваш Email</label>
              <input type="email" required onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="p-input-group">
              <label>Пароль</label>
              <input type="password" required onChange={(e) => setPassword(e.target.value)} />
            </div>
            {authError && <p className="p-msg error">{authError}</p>}
            <button type="submit" className="p-save-btn">{isRegistering ? "Створити акаунт" : "Увійти"}</button>
          </form>
          <p className="p-toggle" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Вже є акаунт? Увійти" : "Немає аккаунту? Реєстрація"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-wrapper">
      <div className="p-card animate-fade">
        <aside className="p-sidebar">
          <div className="p-avatar-display">{profileData.avatarUrl || '👤'}</div>
          <div className="p-user-meta">
            <h3 className="hero-text-large" style={{fontSize: '1.3rem'}}>
              {user.displayName || user.email.split('@')[0]}
            </h3>
            <p className="hero-text-sub" style={{fontSize: '0.9rem'}}>{user.email}</p>
          </div>
          <nav className="p-nav-menu">
            <button className={activeTab === 'loyalty' ? 'active' : ''} onClick={() => setActiveTab('loyalty')}>💎 Картка</button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📜 Мої замовлення</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>⚙️ Налаштування</button>
            <button className={activeTab === 'avatar' ? 'active' : ''} onClick={() => setActiveTab('avatar')}>🖼️ Аватар</button>
          </nav>
          <button className="p-logout-btn" onClick={() => signOut(auth)}>Вийти</button>
        </aside>

        <main className="p-main-content">
          {activeTab === 'loyalty' && (
            <div className="animate-fade">
              <h2 className="p-section-title">Картка лояльності</h2>
              <div className="p-barcode-card">
                <div className="p-card-header">
                  <span>BAKERY ELITE • VIP</span>
                  <div className="p-status-pill">Новачок</div>
                </div>
                <div className="p-card-body">
                  <h1>{orders.filter(o => o.status === 'done').length * 10} балів</h1>
                  <p>10 балів за кожне виконане замовлення!</p>
                </div>
                <div className="p-barcode-container">
                  <div className="barcode-visual">
                    {[...Array(22)].map((_, i) => (
                      <div key={i} className="barcode-line" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
                    ))}
                  </div>
                  <span className="barcode-number">BE-{user.uid.slice(0, 10).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fade">
              <h2 className="p-section-title">Історія замовлень</h2>
              {ordersLoading ? <p>Оновлення списку...</p> : (
                <div className="p-orders-list">
                  {orders.length === 0 ? (
                    <div className="p-empty-state"><p>У вас ще немає замовлень 🥐</p></div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="p-order-item">
                        <div className="order-info">
                          <h4>Торт: {order.details.flavor}</h4>
                          <p>{order.details.weight} кг • {order.details.totalPrice} грн</p>
                          <small>Доставка: {order.details.deliveryDate}</small>
                          {order.status === 'pending' && !canCancel(order.details.deliveryDate) && (
                            <div className="c-warning-text">⚠️ Термін скасування минув</div>
                          )}
                        </div>
                        <div className="order-status-box">
                          <span className={`status-badge ${getStatusInfo(order.status).class}`}>
                            {getStatusInfo(order.status).text}
                          </span>
                          {order.status === 'pending' && (
                            <button 
                              className={`p-cancel-btn ${!canCancel(order.details.deliveryDate) ? 'disabled' : ''}`}
                              onClick={() => handleCancelOrder(order.id, order.details.deliveryDate)}
                              disabled={!canCancel(order.details.deliveryDate)}
                            >
                              Скасувати
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ВІДНОВЛЕНИЙ ТАБ НАЛАШТУВАНЬ */}
          {activeTab === 'settings' && (
            <div className="p-settings-container animate-fade">
              <div className="settings-card modern-card">
                <div className="settings-header">
                  <span className="settings-icon">👤</span>
                  <h4>Особисті дані</h4>
                </div>
                
                <div className="settings-body">
                  <div className="p-input-group">
                    <label>Телефон</label>
                    <input 
                      type="tel" 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                      placeholder="+380..." 
                      className="modern-input"
                    />
                  </div>

                  <div className="p-input-group">
                    <label>Стать</label>
                    <select 
                      value={profileData.gender} 
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="modern-select"
                    >
                      <option value="">Не вказано</option>
                      <option value="Чоловіча">Чоловіча</option>
                      <option value="Жіноча">Жіноча</option>
                    </select>
                  </div>

                  <button onClick={handleUpdate} className="p-save-btn-large">
                    Зберегти
                  </button>

                  {message.text && (
                    <p className={`p-msg ${message.type === 'success' ? 'success' : 'error'}`}>
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="animate-fade">
              <h2 className="p-section-title">Ваш аватар</h2>
              <div className="avatar-picker-card">
                <div className="avatar-picker">
                  {avatarOptions.map(emoji => (
                    <button 
                      key={emoji} 
                      className={`avatar-btn ${profileData.avatarUrl === emoji ? 'selected' : ''}`}
                      onClick={() => setProfileData({...profileData, avatarUrl: emoji})}
                    >{emoji}</button>
                  ))}
                </div>
                <button onClick={handleUpdate} className="p-save-btn" style={{maxWidth: '280px', margin: '30px auto 0'}}>Зберегти вибір</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;