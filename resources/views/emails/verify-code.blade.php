<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', -apple-system, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
        background-color: #020204;
        background-image:
            /* Слой дымки 1 (Центральный туман) */
            radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 60%),
            /* Слой дымки 2 (Размытые пятна по бокам) */
            radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
            /* СЕТКА (Яркая, 12% видимости) */
            linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
        background-size: 100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px;
        padding: 80px 20px;
    ">
        <tr>
            <td align="center">
                <div style="
                    max-width: 460px; margin: 0 auto;
                    background: radial-gradient(circle at center, rgba(37, 99, 235, 0.2) 0%, transparent 75%);
                    padding: 10px;
                    border-radius: 50px;
                ">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="
                        background-color: rgba(10, 10, 10, 0.7); 
                        border: 1px solid rgba(255, 255, 255, 0.08); 
                        /* Световой блик на верхней грани стекла */
                        border-top: 1px solid rgba(255, 255, 255, 0.3); 
                        border-radius: 40px; 
                        /* Глубокая внешняя и мягкая внутренняя тень */
                        box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02);
                    ">
                        <tr>
                            <td style="padding: 50px 40px; text-align: center;">
                                
                                <h2 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: -1px;">
                                    Верификация
                                </h2>
                                
                                <p style="color: #555555; font-size: 11px; font-weight: 800; margin: 0 0 35px 0; text-transform: uppercase; letter-spacing: 3px;">
                                    Ваш ключ доступа
                                </p>

                                <div style="
                                    background: rgba(0, 0, 0, 0.5); 
                                    border: 1px solid rgba(255, 255, 255, 0.06); 
                                    border-radius: 24px; 
                                    padding: 30px 10px; 
                                    margin-bottom: 35px;
                                    box-shadow: inset 0 4px 15px rgba(0,0,0,0.6);
                                ">
                                    <span style="
                                        color: #ffffff; 
                                        font-size: 52px; 
                                        font-weight: 900; 
                                        letter-spacing: 14px; 
                                        font-family: 'Courier New', monospace; 
                                        margin-left: 14px;
                                        text-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
                                    ">
                                        {{ $code }}
                                    </span>
                                </div>

                                <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 0 0 30px 0; font-weight: 500;">
                                    Введите этот 6-значный код на странице подтверждения. <br>
                                    Ключ действителен в течение <span style="color: #ffffff;">60 секунд</span>.
                                </p>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></td>
                                    </tr>
                                </table>

                                <p style="color: #2a2a2a; font-size: 10px; font-weight: 800; margin: 25px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                                    © 2026 Dev Portfolio. Secure Access.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>