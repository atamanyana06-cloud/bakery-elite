import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('Всі');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(docs);
        setFilteredProducts(docs);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category === 'Всі') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  }, [category, products]);

  return (
    <div className="catalog-container animate-fade">
      <header className="catalog-header">
        <span className="catalog-subtitle">Bakery Elite Selection</span>
        <h2 className="catalog-title">Наші Смаколики</h2>
        <div className="title-underline"></div>
      </header>
      
      <div className="filter-buttons">
        {['Всі', 'Круасани', 'Торти', 'Тістечка'].map(cat => (
          <button 
            key={cat} 
            className={category === cat ? 'active-filter' : ''} 
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {loading ? (
          <div className="loading-state">
            <p>Завантаження смаколиків... 🥐</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                {/* Переконайся, що в Firebase поле називається img або image */}
                <img src={product.img || product.image} alt={product.name} />
                <div className="category-tag">{product.category}</div>
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                {/* Додано відображення опису */}
                <p className="description">{product.description || "Ніжний десерт, створений за авторським рецептом нашими майстрами."}</p>
                
                <div className="product-footer">
                  <span className="price">{product.price} грн</span>
                  <button 
                    className="add-to-cart-btn" 
                    onClick={() => addToCart(product)}
                  >
                    <span>У кошик</span>
                    <i className="cart-icon">+</i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Товарів у категорії "{category}" поки немає. 🍊</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;