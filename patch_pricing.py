import re

def patch(path, is_en):
    with open(path, 'r') as f:
        content = f.read()
    
    if is_en:
        content = re.sub(r'successTitle: "settings\.pricing\.successTitle"', 'successTitle: "🎉 Thank you for trusting us!"', content)
        content = re.sub(r'successDesc: "settings\.pricing\.successDesc"', 'successDesc: "Your plan is now active. Enjoy all features."', content)
        content = re.sub(r'loginRequired: "settings\.pricing\.loginRequired"', 'loginRequired: "You must be logged in"', content)
        content = re.sub(r'paymentError: "settings\.pricing\.paymentError"', 'paymentError: "Could not start payment"', content)
        content = re.sub(r'portalError: "settings\.pricing\.portalError"', 'portalError: "Could not open the portal"', content)
    else:
        content = re.sub(r'successTitle: "settings\.pricing\.successTitle"', 'successTitle: "🎉 ¡Gracias por confiar en nosotros!"', content)
        content = re.sub(r'successDesc: "settings\.pricing\.successDesc"', 'successDesc: "Tu plan ya está activo. Disfruta de todas las funciones."', content)
        content = re.sub(r'loginRequired: "settings\.pricing\.loginRequired"', 'loginRequired: "Debes iniciar sesión"', content)
        content = re.sub(r'paymentError: "settings\.pricing\.paymentError"', 'paymentError: "No se pudo iniciar el pago"', content)
        content = re.sub(r'portalError: "settings\.pricing\.portalError"', 'portalError: "No se pudo abrir el portal"', content)

    with open(path, 'w') as f:
        f.write(content)

patch('src/i18n/en.ts', True)
patch('src/i18n/es.ts', False)
