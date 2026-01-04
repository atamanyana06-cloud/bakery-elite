import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  updatePassword, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
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

  const [profileData, setProfileData] = useState({
    displayName: '',
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
          setProfileData(prev => ({ 
            ...prev, 
            ...docSnap.data(),
            displayName: docSnap.data().displayName || currentUser.displayName || '' 
          }));
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
      const qCustom = query(collection(db, "custom_orders"), where("userId", "==", uid));
      const customSnap = await getDocs(qCustom);
      const customList = customSnap.docs.map(doc => ({ id: doc.id, type: 'custom', ...doc.data() }));

      const qGeneral = query(collection(db, "orders"), where("userId", "==", uid));
      const generalSnap = await getDocs(qGeneral);
      const generalList = generalSnap.docs.map(doc => ({ id: doc.id, type: 'catalog', ...doc.data() }));

      const allOrders = [...customList, ...generalList].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.details?.deliveryDate || 0);
        const dateB = new Date(b.createdAt || b.details?.deliveryDate || 0);
        return dateB - dateA;
      });

      setOrders(allOrders);
    } catch (err) {
      console.error("Помилка завантаження замовлень:", err);
    }
    setOrdersLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: profileData.displayName });
        await setDoc(doc(db, "users", userCredential.user.uid), {
          displayName: profileData.displayName,
          email: email,
          createdAt: new Date().toISOString()
        });
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
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: profileData.displayName });
      }

      await setDoc(doc(db, "users", user.uid), {
        displayName: profileData.displayName,
        phone: profileData.phone,
        gender: profileData.gender,
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

  if (loading) return <div className="p-loader">Завантаження...</div>;

  if (!user) {
    return (
      <div className="p-wrapper auth-page">
        <div className="auth-card animate-fade">
          <div className="auth-header">
            <div className="auth-logo">🥐</div>
            <h2 className="auth-title">{isRegistering ? "Реєстрація" : "Вхід до кабінету"}</h2>
          </div>
          <form onSubmit={handleAuth} className="p-form">
            {isRegistering && (
              <div className="p-input-group">
                <label>Ваше Ім'я</label>
                <input type="text" required placeholder="Яна Атаман" 
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} className="modern-input" />
              </div>
            )}
            <div className="p-input-group">
              <label>Email</label>
              <input type="email" required placeholder="example@mail.com" onChange={(e) => setEmail(e.target.value)} className="modern-input" />
            </div>
            <div className="p-input-group">
              <label>Пароль</label>
              <input type="password" required placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="modern-input" />
            </div>
            {authError && <p className="p-msg error">{authError}</p>}
            
            <div className="auth-button-stack">
              <button type="submit" className="p-save-btn-large auth-submit-btn">
                {isRegistering ? "Створити акаунт" : "Увійти"}
              </button>
              <button type="button" className="auth-toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Вже є акаунт? Увійти" : "Немає акаунту? Реєстрація"}
              </button>
            </div>
          </form>
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
            <h3 className="hero-text-large">{profileData.displayName || user.email.split('@')[0]}</h3>
            <p className="hero-text-sub">{user.email}</p>
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
          <h2 className="p-section-title">
             {activeTab === 'loyalty' && "Картка лояльності"}
             {activeTab === 'orders' && "Історія замовлень"}
             {activeTab === 'settings' && "Особистий профіль"}
             {activeTab === 'avatar' && "Ваш аватар"}
          </h2>

          {activeTab === 'loyalty' && (
            <div className="animate-fade">
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

          {/* ВІДНОВЛЕНО ТАБ ЗАМОВЛЕНЬ */}
          {activeTab === 'orders' && (
            <div className="animate-fade">
              {ordersLoading ? <p>Завантаження...</p> : (
                <div className="p-orders-list">
                  {orders.length === 0 ? (
                    <div className="p-empty-state"><p>У вас ще немає замовлень 🥐</p></div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="p-order-item">
                        <div className="order-info">
                          {order.type === 'custom' ? (
                            <>
                              <h4>Торт: {order.details?.flavor}</h4>
                              <p>{order.details?.weight} кг • {order.details?.totalPrice} грн</p>
                            </>
                          ) : (
                            <>
                              <h4>Замовлення №{order.id.slice(0,6)} (Каталог)</h4>
                              <p>{order.totalAmount} грн</p>
                              <div className="order-items-mini">
                                {order.items?.map((item, idx) => (
                                  <span key={idx}>{item.name} x{item.quantity}{idx !== order.items.length - 1 ? ', ' : ''}</span>
                                ))}
                              </div>
                            </>
                          )}
                          <small>Статус: {getStatusInfo(order.status).text}</small>
                        </div>
                        <div className={`status-badge ${getStatusInfo(order.status).class}`}>
                           {getStatusInfo(order.status).text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-settings-container animate-fade">
              <div className="settings-card modern-card">
                <div className="settings-body">
                  <div className="p-input-group">
                    <label>Ім'я та Прізвище</label>
                    <input type="text" value={profileData.displayName} 
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} 
                      placeholder="Як вас звати?" className="modern-input" />
                  </div>
                  <div className="p-input-group">
                    <label>Телефон</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+380..." className="modern-input" />
                  </div>
                  <div className="p-input-group">
                    <label>Стать</label>
                    <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} className="modern-select">
                      <option value="">Не вказано</option>
                      <option value="Чоловіча">Чоловіча</option>
                      <option value="Жіноча">Жіноча</option>
                    </select>
                  </div>
                  <button onClick={handleUpdate} className="p-save-btn-large">Зберегти зміни</button>
                  {message.text && <p className={`p-msg ${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</p>}
                </div>
              </div>
            </div>
          )}

         {activeTab === 'avatar' && (
          <div className="animate-fade">
              <div className="avatar-picker-card">
                <div className="avatar-picker">
                   {avatarOptions.map(emoji => (
                     <button 
                       key={emoji} 
                       className={`avatar-btn ${profileData.avatarUrl === emoji ? 'selected' : ''}`} 
                       onClick={() => setProfileData({...profileData, avatarUrl: emoji})}
                     >
                      {emoji}
                     </button>
                  ))}
              </div>
               {/* ОНОВЛЕНО: Переконайтеся, що клас саме p-save-btn-large */}
              <button onClick={handleUpdate} className="p-save-btn-large">
               Зберегти аватар
           </button>
         </div>
       </div>
     )}
        </main>
      </div>
    </div>
  );
};

export default Profile;