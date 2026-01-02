import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Дякуємо за підписку! Очікуйте смачні новини 🥐");
  };

  return (
    <footer className="footer-modern">
      <div className="footer-top">
        <div className="footer-container">
          {/* Блок підписки */}
          <div className="footer-subscribe">
            <h3>Приєднуйтесь до клубу гурманів</h3>
            <p>Отримуйте секретні промокоди та новини про свіжу випічку першими.</p>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input type="email" placeholder="Ваш Email" required />
              <button type="submit">Підписатися</button>
            </form>
          </div>

          <div className="footer-grid">
            {/* Контакти */}
            <div className="footer-info">
              <h4 className="footer-logo-text">Bakery Elite</h4>
              <p>📍 м. Івано-Франківськ, вул. Мазепи 10</p>
              <p>📞 +38 (096) 123 45 67</p>
              <div className="social-links">
                <span>Instagram</span> • <span>Facebook</span> • <span>TikTok</span>
              </div>
            </div>

            {/* Google Maps (Embed) */}
            <div className="footer-map">
              <iframe 
                title="Bakery Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.8427773229864!2d24.70753067683933!3d48.91130639655655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4730c16c68a4178f%3A0xc3927d7045b404d0!2z0LLRg9C70LjRhtGPINCS0L7Qu9C-0LTQuNC80LjRgNCwINCc0LDQt9C10L_QuCwgMTAsI9CG0LLQsNC90L4t0KTRgNCw0L3QutGW0LLRgdGM0LosI9CG0LLQsNC90L4t0KTRgNCw0L3QutGW0LLRgdGM0LrQsCDQvtCx0LvQsNGB0YLRjCwgNzYwMDA!5e0!3m2!1suk!2sua!4v1700000000000!5m2!1suk!2sua" 
                width="100%" 
                height="150" 
                style={{ border: 0, borderRadius: '15px' }} 
                allowFullScreen="" 
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Bakery Elite. Створено з любов'ю до випічки ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;