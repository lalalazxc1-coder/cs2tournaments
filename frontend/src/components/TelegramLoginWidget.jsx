import { useEffect, useRef } from 'react';

const TelegramLoginWidget = ({ onAuth, buttonSize = 'large', cornerRadius = 0, requestAccess = 'write' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очищаем контейнер, чтобы кнопка не дублировалась
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';

    // ВАЖНО: Сюда вставь имя своего бота без знака @
    // Например: 'MyGameBot'
    script.setAttribute('data-telegram-login', 'cs2teamrayonskie_bot');

    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius); // 0 for sharp edges
    script.setAttribute('data-request-access', requestAccess);
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    // Функция callback, которую вызывает Telegram после входа
    window.onTelegramAuth = (user) => {
      console.log('Telegram Widget Data:', user);
      if (onAuth) {
        onAuth(user);
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth, buttonSize, cornerRadius, requestAccess]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center py-4 mix-blend-screen"
    />
  );
};

export default TelegramLoginWidget;