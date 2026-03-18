# BANCO — CRUD de Productos Financieros

App Angular para gestionar productos financieros bancarios, conectada a una API REST local en Node.js.

## Requisitos previos

- Node.js ≥ 18
- Backend corriendo en `http://localhost:3002` (ver instrucciones del proyecto starter)

## Instalación

```bash
cd banco-app
npm install
```

## Ejecución en desarrollo

```bash
npm start
```

La app estará disponible en [http://localhost:4200](http://localhost:4200).

> El proxy redirige automáticamente `/bp/*` → `http://localhost:3002` para evitar problemas de CORS.

## Funcionalidades

| Acción | Descripción |
|--------|-------------|
| **Listar** | Ver todos los productos con búsqueda y paginación (5/10/20) |
| **Crear** | Formulario con validaciones completas, verificación de ID único |
| **Editar** | Pre-carga los datos del producto para modificarlos |
| **Eliminar** | Confirmación con modal antes de eliminar |

## Endpoints consumidos

| Método | URL | Acción |
|--------|-----|--------|
| GET | `/bp/products` | Obtener todos los productos |
| POST | `/bp/products` | Crear producto |
| PUT | `/bp/products/:id` | Actualizar producto |
| DELETE | `/bp/products/:id` | Eliminar producto |
| GET | `/bp/products/verification/:id` | Verificar si un ID ya existe |

## Validaciones del formulario

- **ID**: 3–10 caracteres, único (verificación en tiempo real contra la API)
- **Nombre**: 5–100 caracteres, requerido
- **Descripción**: 10–200 caracteres, requerido
- **Logo**: requerido (URL o nombre de archivo)
- **Fecha Liberación**: requerida, debe ser >= fecha actual
- **Fecha Revisión**: calculada automáticamente (1 año después de liberación)

## Estructura del proyecto

```
src/app/
├── core/
│   ├── models/product.interface.ts   # Interfaz FinancialProduct
│   └── services/product.service.ts  # Servicio HTTP
├── features/
│   ├── product-list/                 # Lista (Diseño D1/D3)
│   └── product-form/                 # Formulario (Diseño D2)
└── shared/
    └── components/
        └── delete-confirm-modal/     # Modal confirmacion (Diseño D4)
```


# 1. Iniciar el backend (en otra terminal)
cd repo-interview-main
npm install
npm run start:dev    # → corre en http://localhost:3002
# 2. Iniciar el frontend
cd banco-app
npm install
npm start            # → corre en http://localhost:4200