import re

def patch(path, is_en):
    with open(path, 'r') as f:
        content = f.read()
    
    if is_en:
        # Common
        content = re.sub(r'save: "common\.save"', 'save: "Save"', content)
        content = re.sub(r'cancel: "common\.cancel"', 'cancel: "Cancel"', content)
        content = re.sub(r'delete: "common\.delete"', 'delete: "Delete"', content)
        content = re.sub(r'saving: "common\.saving"', 'saving: "Saving..."', content)
        content = re.sub(r'error: "common\.error"', 'error: "Error"', content)
        # Settings
        content = re.sub(r'title: "settings\.organization\.serviceTypes\.title"', 'title: "Service Types"', content)
        content = re.sub(r'subtitle: "settings\.organization\.serviceTypes\.subtitle"', 'subtitle: "Define the types of service your company offers. They are used in leads, proposals, and work orders."', content)
        content = re.sub(r'placeholder: "settings\.organization\.serviceTypes\.placeholder"', 'placeholder: "New service type..."', content)
        content = re.sub(r'add: "settings\.organization\.serviceTypes\.add"', 'add: "Add"', content)
        content = re.sub(r'save: "settings\.organization\.serviceTypes\.save"', 'save: "Save Service Types"', content)
    else:
        # Common
        content = re.sub(r'save: "common\.save"', 'save: "Guardar"', content)
        content = re.sub(r'cancel: "common\.cancel"', 'cancel: "Cancelar"', content)
        content = re.sub(r'delete: "common\.delete"', 'delete: "Eliminar"', content)
        content = re.sub(r'saving: "common\.saving"', 'saving: "Guardando..."', content)
        content = re.sub(r'error: "common\.error"', 'error: "Error"', content)
        # Settings
        content = re.sub(r'title: "settings\.organization\.serviceTypes\.title"', 'title: "Tipos de Servicio"', content)
        content = re.sub(r'subtitle: "settings\.organization\.serviceTypes\.subtitle"', 'subtitle: "Define los tipos de servicio que ofrece tu empresa. Se usan en leads, propuestas y órdenes de trabajo."', content)
        content = re.sub(r'placeholder: "settings\.organization\.serviceTypes\.placeholder"', 'placeholder: "Nuevo tipo de servicio..."', content)
        content = re.sub(r'add: "settings\.organization\.serviceTypes\.add"', 'add: "Agregar"', content)
        content = re.sub(r'save: "settings\.organization\.serviceTypes\.save"', 'save: "Guardar Tipos de Servicio"', content)

    with open(path, 'w') as f:
        f.write(content)

patch('src/i18n/en.ts', True)
patch('src/i18n/es.ts', False)
