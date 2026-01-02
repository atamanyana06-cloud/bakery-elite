import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    address: ''
  });

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = deliveryMethod === 'pickup' ? 'Самовивіз' : 'Доставка';
    alert(`Дякуємо, ${orderData.name}! Замовлення (${method}) прийнято на ${orderData.date} о ${orderData.time}.`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <span className="empty-icon">🥨</span>
        <h2>Кошик порожній</h2>
        <Link to="/catalog" className="return-btn">Перейти до випічки</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Оформлення замовлення</h1>
      
      <div className="cart-grid">
        {/* Ліва частина: Список товарів */}
        <section className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.id} className="modern-cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price} грн</p>
                <div className="qty-actions">
                  <button onClick={() => addToCart(item)}>+</button>
                  <span>{item.quantity} шт.</span>
                  <button onClick={() => removeFromCart(item.id)} className="remove-link">Видалити</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Права частина: Форма доставки та оплати */}
        <aside className="order-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Дані для отримання</h3>
            
            <input type="text" placeholder="Ваше ім'я" required 
              onChange={(e) => setOrderData({...orderData, name: e.target.value})} />
            
            <input type="tel" placeholder="Номер телефону" required 
              onChange={(e) => setOrderData({...orderData, phone: e.target.value})} />

            <div className="method-selector">
              <button type="button" 
                className={deliveryMethod === 'pickup' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('pickup')}>Самовивіз</button>
              <button type="button" 
                className={deliveryMethod === 'delivery' ? 'active' : ''} 
                onClick={() => setDeliveryMethod('delivery')}>Доставка</button>
            </div>

            {deliveryMethod === 'delivery' && (
              <input type="text" placeholder="Адреса доставки" required 
                onChange={(e) => setOrderData({...orderData, address: e.target.value})} />
            )}

            <div className="datetime-row">
              <label>
                Дата готовності:
                <input type="date" required min={new Date().toISOString().split('T')[0]} 
                  onChange={(e) => setOrderData({...orderData, date: e.target.value})} />
              </label>
              <label>
                Час:
                <input type="time" required 
                  onChange={(e) => setOrderData({...orderData, time: e.target.value})} />
              </label>
            </div>

            <div className="cart-total-footer">
              <div className="total-line">
                <span>Загальна сума:</span>
                <span className="price-amount">{totalPrice} грн</span>
              </div>
              <button type="submit" className="final-order-btn">Підтвердити замовлення</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Cart;