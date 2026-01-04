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
          quantity: item.quantity
        })),
        totalAmount: totalPrice,
        deliveryMethod: deliveryMethod === 'pickup' ? 'Самовивіз' : 'Доставка',
        paymentMethod: paymentMethod === 'cash' ? 'Готівка' : 'Картка',
        bonusCard: bonusCard || 'Не вказано',
        customerInfo: orderData,
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
          <h2 className="empty-title">Кошик порожній</h2>
          <p className="empty-text">Оберіть щось смачненьке у нашому каталозі!</p>
          <Link to="/catalog" className="explore-catalog-btn">Перейти до каталогу</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page animate-fade">
      <h1 className="cart-title">Оформлення замовлення</h1>
      
      <div className="cart-grid">
        <section className="cart-items-section">
          <div className="section-header-modern">Ваші смаколики ({cartItems.length})</div>
          {cartItems.map((item) => (
            <div key={item.id} className="modern-cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price} грн</p>
              </div>
              <div className="qty-controls-modern">
                <button onClick={() => addToCart(item)}>+</button>
                <span>{item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn-small">🗑️</button>
              </div>
            </div>
          ))}
        </section>

        <aside className="order-form-section">
          <form onSubmit={handleSubmit} className="checkout-form-modern">
            <h3 className="form-subtitle">Контактні дані</h3>
            <div className="input-modern-group">
              <input type="text" placeholder="Ваше ім'я" required 
                onChange={(e) => setOrderData({...orderData, name: e.target.value})} />
              <input type="tel" placeholder="Телефон" required 
                onChange={(e) => setOrderData({...orderData, phone: e.target.value})} />
            </div>

            <h3 className="form-subtitle">Доставка та оплата</h3>
            <div className="method-selector-modern">
              <button type="button" className={deliveryMethod === 'pickup' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('pickup')}>Самовивіз</button>
              <button type="button" className={deliveryMethod === 'delivery' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('delivery')}>Доставка</button>
            </div>

            <div className="payment-selection">
              <div className={`pay-option ${paymentMethod === 'cash' ? 'active' : ''}`} 
                   onClick={() => setPaymentMethod('cash')}>
                <span>💵 Готівка</span>
              </div>
              <div className={`pay-option ${paymentMethod === 'card' ? 'active' : ''}`} 
                   onClick={() => setPaymentMethod('card')}>
                <span>💳 Картка</span>
              </div>
            </div>

            <div className="bonus-section-modern">
              <label>Бонусна картка BE-XXXX</label>
              <input type="text" placeholder="Введіть номер" value={bonusCard}
                onChange={(e) => setBonusCard(e.target.value)} className="bonus-input-style" />
            </div>

            <div className="datetime-row-modern">
              <input type="date" required min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setOrderData({...orderData, date: e.target.value})} />
              <input type="time" required 
                onChange={(e) => setOrderData({...orderData, time: e.target.value})} />
            </div>

            <div className="cart-summary-footer">
              <div className="total-line-modern">
                <span>Всього до сплати:</span>
                <span className="price-amount-modern">{totalPrice} грн</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="final-order-btn-modern">
                {isSubmitting ? "Оформлення..." : "Підтвердити замовлення"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Cart;