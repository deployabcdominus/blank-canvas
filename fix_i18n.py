import re

def update_file(filepath, locale):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Define the new blocks
    if locale == 'en':
        catalogs = """    catalogs: {
      title: "Catalogs",
      subtitle: "Manage standard lists for your operation",
      add: "Add",
      adding: "Adding...",
      addSuccess: '"{label}" added to {title}',
      addError: "Error adding item",
      updateSuccess: "Updated successfully",
      updateError: "Error updating item",
      deleteSuccess: '"{label}" deleted',
      deleteError: "Error deleting item",
      defaultCannotDelete: "Default values cannot be deleted",
      noItems: "No items. Add the first one below.",
      placeholder: "Add new {title}...",
      pressEnter: "Press Enter or the button to add. Values with 🔒 are defaults and cannot be deleted.",
      defaultValue: "Default value",
      save: "Save",
      cancel: "Cancel",
    },"""
        pricing = """    pricing: {
      title: "Your Subscription",
      currentPlan: "Current plan:",
      paymentOverdue: "Payment Overdue",
      overdueTitle: "Your subscription has a pending payment",
      overdueSubtitle: "Please update your payment method to avoid service suspension.",
      updatePayment: "Update Payment Method",
      manageSub: "Manage Subscription (Invoices, Payment Method)",
      recommended: "Recommended",
      current: "Current",
      perMonth: "/mo",
      downgrade: "Downgrade",
      upgrade: "Upgrade",
      viewUpgrade: "View upgrade plans",
      successTitle: "🎉 Thank you for trusting us!",
      successDesc: "Your plan is now active. Enjoy all features.",
      loginRequired: "You must be logged in",
      portalError: "Could not open the portal",
      paymentError: "Could not start payment",
      plans: {
        start: {
          tagline: "Freelancers / Self-employed",
          features: ["CRM + Manual Management", "Up to 3 users", "Standard labels", "File uploads", "Basic security"],
        },
        pro: {
          tagline: "Small & Medium Businesses",
          features: ["Everything in Start, plus:", "Digital signature portal", "Mockup generator", "Advanced automation", "Custom dictionaries", "Daily backup", "Up to 15 users"],
        },
        elite: {
          tagline: "Enterprise & Multi-team",
          features: ["Everything in Pro, plus:", "Pro Plans & Annotations", "Unlimited fields", "Subcontractors / Logistics", "API & Webhooks", "Full Audit Logs", "Unlimited users", "Priority support"],
        },
      }
    },"""
        mfa = """    mfa: {
      title: "Multi-Factor Authentication (MFA)",
      subtitle: "Add an extra layer of security to your account using an authenticator app.",
      enabledSuccess: "MFA enabled successfully",
      invalidCode: "Invalid code. Please try again.",
      factorRemoved: "MFA factor removed",
      verified: "Verified",
      disable: "Disable",
      notEnabled: "MFA is not enabled",
      recommend: "We recommend enabling MFA to protect your account from unauthorized access.",
      enable: "Enable MFA",
      scanQr: "Scan the QR code with your authenticator app",
      scanInstructions: "Open Google Authenticator, Authy, or similar and scan this code, then enter the 6-digit verification code below.",
      verifyAndActivate: "Verify & Activate",
      cancel: "Cancel",
      authenticatorApp: "Authenticator App",
    },"""
    else:
        catalogs = """    catalogs: {
      title: "Catálogos",
      subtitle: "Gestiona las listas estándar para tu operación",
      add: "Agregar",
      adding: "Agregando...",
      addSuccess: '"{label}" agregado a {title}',
      addError: "Error al agregar",
      updateSuccess: "Actualizado correctamente",
      updateError: "Error al actualizar",
      deleteSuccess: '"{label}" eliminado',
      deleteError: "Error al eliminar",
      defaultCannotDelete: "Los valores predeterminados no se pueden eliminar",
      noItems: "No hay items. Agrega el primero abajo.",
      placeholder: "Agregar nuevo {title.toLowerCase()}...",
      pressEnter: "Presiona Enter o el botón para agregar. Los valores con 🔒 son predeterminados y no se pueden eliminar.",
      defaultValue: "Valor predeterminado",
      save: "Guardar",
      cancel: "Cancelar",
    },"""
        pricing = """    pricing: {
      title: "Tu Suscripción",
      currentPlan: "Plan actual:",
      paymentOverdue: "Pago Pendiente",
      overdueTitle: "Tu suscripción tiene un pago pendiente",
      overdueSubtitle: "Por favor, actualiza tu método de pago para evitar la suspensión del servicio.",
      updatePayment: "Actualizar Método de Pago",
      manageSub: "Gestionar Suscripción (Facturas, Método de Pago)",
      recommended: "Recomendado",
      current: "Actual",
      perMonth: "/mes",
      downgrade: "Bajar plan",
      upgrade: "Upgrade",
      viewUpgrade: "Ver planes de upgrade",
      successTitle: "🎉 ¡Gracias por confiar en nosotros!",
      successDesc: "Tu plan ya está activo. Disfruta de todas las funciones.",
      loginRequired: "Debes iniciar sesión",
      portalError: "No se pudo abrir el portal",
      paymentError: "No se pudo iniciar el pago",
      plans: {
        start: {
          tagline: "Auto-empleados / Freelance",
          features: ["CRM + Gestión Manual", "Hasta 3 usuarios", "Etiquetas estándar", "Subida de archivos", "Seguridad básica"],
        },
        pro: {
          tagline: "Pequeñas y Medianas Empresas",
          features: ["Todo en Start, más:", "Portal de firma digital", "Generador de Mockups", "Automatización avanzada", "Diccionarios personalizados", "Backup diario", "Hasta 15 usuarios"],
        },
        elite: {
          tagline: "Empresas con múltiples equipos",
          features: ["Todo en Pro, más:", "Planos y Anotaciones Pro", "Campos ilimitados", "Subcontratistas / Logística", "API y Webhooks", "Audit Logs completos", "Usuarios ilimitados", "Soporte prioritario"],
        },
      }
    },"""
        mfa = """    mfa: {
      title: "Autenticación de Dos Factores (MFA)",
      subtitle: "Agrega una capa extra de seguridad a tu cuenta usando una aplicación de autenticación.",
      enabledSuccess: "MFA activado correctamente",
      invalidCode: "Código inválido. Inténtalo de nuevo.",
      factorRemoved: "Factor MFA eliminado",
      verified: "Verificado",
      disable: "Desactivar",
      notEnabled: "MFA no está activado",
      recommend: "Recomendamos activar MFA para proteger tu cuenta de accesos no autorizados.",
      enable: "Activar MFA",
      scanQr: "Escanea el código QR con tu app de autenticación",
      scanInstructions: "Abre Google Authenticator, Authy o similar y escanea este código, luego ingresa el código de 6 dígitos abajo.",
      verifyAndActivate: "Verificar y Activar",
      cancel: "Cancelar",
      authenticatorApp: "App de Autenticación",
    },"""

    # 1. Replace catalogs block
    # Match from catalogs: { until the next top level sibling (integrations: {)
    content = re.sub(r'catalogs: \{.*?integrations: \{', catalogs + '\n    integrations: {', content, flags=re.DOTALL)
    
    # 2. Add pricing and mfa before the end of the settings object
    # The settings object ends before dashboard: {
    content = re.sub(r'    profile: \{.*?\}\n  \},', lambda m: m.group(0)[:-4] + '\n' + pricing + '\n' + mfa + '\n    }\n  },', content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/i18n/en.ts', 'en')
update_file('src/i18n/es.ts', 'es')
