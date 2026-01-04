import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [bonusCard, setBonusCard] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    address: ''
  });

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Будь ласка, увійдіть у профіль для оформлення замовлення");
      navigate('/profile');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: auth.currentUser.uid,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: totalPrice,
        deliveryMethod: deliveryMethod === 'pickup' ? 'Самовивіз' : 'Доставка',
        paymentMethod: paymentMethod === 'cash' ? 'Готівка' : 'Картка',
        bonusCard: bonusCard || 'Не вказано',
        customerInfo: {
          ...orderData,
          address: deliveryMethod === 'delivery' ? orderData.address : 'Самовивіз з пекарні'
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'catalog'
      };

      await addDoc(collection(db, "orders"), orderPayload);
      
      alert(`Замовлення прийнято! Дякуємо, ${orderData.name}!`);
      clearCart();
      navigate('/profile');
    } catch (error) {
      console.error("Помилка:", error);
      alert("Сталася помилка при збереженні замовлення.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container animate-fade">
        <div className="empty-content-card">
          <div className="empty-illustration">🥨</div>
          <h2 className="empty-title">Ваш кошик ще порожній</h2>
          <p className="empty-text">Оберіть щось смачненьке у нашому каталозі!</p>
          <Link to="/catalog" className="explore-catalog-btn">Перейти до каталогу</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade">
      <h1 className="cart-main-title">Оформлення замовлення</h1>
      
      <div className="cart-grid">
        {/* Список товарів з великими зображеннями */}
        <section className="cart-items-section">
          <div className="section-header-modern">Ваші смаколики ({cartItems.length})</div>
          {cartItems.map((item) => (
            <div key={item.id} className="modern-cart-item-large">
              <div className="item-img-box">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details-box">
                <h3>{item.name}</h3>
                <p className="item-price-large">{item.price} грн</p>
              </div>
              <div className="qty-controls-pro">
                <button onClick={() => addToCart(item)} className="qty-btn-plus">+</button>
                <span className="qty-value">{item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn-icon">🗑️</button>
              </div>
            </div>
          ))}
        </section>

        {/* Форма з великими шрифтами та адресою */}
        <aside className="order-form-section-modern">
          <form onSubmit={handleSubmit} className="checkout-form-pro">
            <h3 className="form-group-title">Контактні дані</h3>
            <div className="input-pro-wrapper">
              <input type="text" placeholder="Ваше ім'я" required 
                onChange={(e) => setOrderData({...orderData, name: e.target.value})} />
              <input type="tel" placeholder="Номер телефону" required 
                onChange={(e) => setOrderData({...orderData, phone: e.target.value})} />
            </div>

            <h3 className="form-group-title">Доставка та оплата</h3>
            <div className="delivery-method-grid">
              <button type="button" className={deliveryMethod === 'pickup' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('pickup')}>Самовивіз</button>
              <button type="button" className={deliveryMethod === 'delivery' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('delivery')}>Доставка</button>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="input-pro-wrapper animate-fade">
                <input type="text" placeholder="Адреса доставки (вул., буд., кв.)" required 
                  onChange={(e) => setOrderData({...orderData, address: e.target.value})} />
              </div>
            )}

            <div className="payment-grid-pro">
              <div className={`pay-pro-option ${paymentMethod === 'cash' ? 'active' : ''}`} 
                   onClick={() => setPaymentMethod('cash')}>
                <span>💵 Готівка</span>
              </div>
              <div className={`pay-pro-option ${paymentMethod === 'card' ? 'active' : ''}`} 
                   onClick={() => setPaymentMethod('card')}>
                <span>💳 Картка</span>
              </div>
            </div>

            <div className="bonus-pro-card">
              <label>Бонусна картка BE-XXXX</label>
              <input type="text" placeholder="Введіть номер" value={bonusCard}
                onChange={(e) => setBonusCard(e.target.value)} />
            </div>

            <div className="datetime-pro-row">
              <input type="date" required min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setOrderData({...orderData, date: e.target.value})} />
              <input type="time" required 
                onChange={(e) => setOrderData({...orderData, time: e.target.value})} />
            </div>

            <div className="summary-pro-footer">
              <div className="total-pro-line">
                <span>Всього до сплати:</span>
                <span className="final-price-value">{totalPrice} грн</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="order-confirm-btn-pro">
                {isSubmitting ? "Обробка..." : "Підтвердити замовлення"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Cart;