# Pokédex Angular

Aplicación web interactiva de Pokédex desarrollada con Angular 20 que consume la PokeAPI para mostrar información detallada sobre Pokémon.

---

## 👥 Integrantes del Grupo

- **David Vigoya**
- **Rony Trespalacios**

---

## 📋 Descripción General del Proyecto

Este proyecto es una Pokédex completa e interactiva construida con Angular que permite a los usuarios explorar, buscar, filtrar y gestionar información sobre Pokémon. La aplicación consume múltiples servicios de la **PokeAPI** para proporcionar una experiencia rica y detallada, incluyendo estadísticas, evoluciones, tipos, habilidades y un juego interactivo para adivinar Pokémon.

### Propósito y Alcance

El propósito principal de este proyecto es demostrar las capacidades de Angular en la construcción de aplicaciones web modernas, implementando:

- Arquitectura de componentes standalone
- Consumo eficiente de APIs REST
- Gestión de estado con servicios y observables
- Lazy loading de rutas para optimización de rendimiento
- Persistencia de datos con LocalStorage
- Visualización de datos con gráficos interactivos

El alcance incluye funcionalidades de consulta, búsqueda avanzada, gestión de favoritos y un mini-juego educativo sobre Pokémon.

---

## 🏗️ Estructura del Proyecto

```
Pokedex-Angular/
├── src/
│   ├── app/
│   │   ├── app.ts                    # Componente raíz de la aplicación
│   │   ├── app.routes.ts             # Configuración de rutas con lazy loading
│   │   ├── app.config.ts             # Configuración de providers
│   │   └── pokedex/
│   │       ├── components/           # Componentes reutilizables
│   │       │   ├── shared/
│   │       │   │   └── navbar/       # Barra de navegación global
│   │       │   ├── pokemon-basic-card/      # Tarjeta básica de Pokémon
│   │       │   ├── pokemon-modal-card/      # Modal con detalles completos
│   │       │   ├── filter-panel/            # Panel de filtros avanzados
│   │       │   ├── navigation-buttons/      # Botones de paginación
│   │       │   ├── stats-chart/             # Gráfico de estadísticas
│   │       │   ├── pokemon-silhouette/      # Silueta para el juego
│   │       │   ├── guess-input/             # Input del juego
│   │       │   └── guess-hints/             # Pistas progresivas
│   │       ├── pages/                # Páginas principales
│   │       │   ├── landing-page/     # Página de inicio
│   │       │   ├── list-page/        # Lista paginada con búsqueda
│   │       │   ├── filters-page/     # Búsqueda con filtros avanzados
│   │       │   ├── favorites-page/   # Pokémon favoritos
│   │       │   └── guess-page/       # Juego de adivinanzas
│   │       ├── services/             # Servicios de la aplicación
│   │       │   ├── pokemon.ts                # Servicio de consumo de PokeAPI
│   │       │   ├── favorites.service.ts      # Gestión de favoritos
│   │       │   ├── search.service.ts         # Búsqueda global reactiva
│   │       │   └── pokemon-utils.service.ts  # Utilidades y helpers
│   │       └── interfaces/
│   │           └── pokemon.model.ts  # Interfaces TypeScript
│   ├── assets/                       # Recursos estáticos (iconos, imágenes)
│   └── styles.css                    # Estilos globales con TailwindCSS
├── dist/                             # Archivos compilados para producción
├── package.json                      # Dependencias y scripts
└── angular.json                      # Configuración de Angular CLI
```

---

## ⚡ Funcionalidades Principales

### 1. **Lista de Pokémon (List Page)**
- ✅ Visualización paginada de Pokémon (21 por página)
- ✅ Búsqueda instantánea por nombre
- ✅ Navegación entre páginas (Anterior/Siguiente)
- ✅ Click en tarjeta para ver detalles completos
- ✅ Agregar/remover favoritos desde la lista

### 2. **Búsqueda Avanzada (Filters Page)**
- ✅ Filtrado por múltiples tipos de Pokémon (lógica AND)
- ✅ Filtrado por generación (Gen I a Gen VIII)
- ✅ Filtrado por rango de altura (en metros)
- ✅ Filtrado por rango de peso (en kilogramos)
- ✅ Filtrado por hábitat
- ✅ Resultados en tiempo real con paginación local
- ✅ Contador de resultados encontrados
- ✅ Panel lateral deslizable con todos los filtros

### 3. **Pokémon Favoritos (Favorites Page)**
- ✅ Lista de todos los Pokémon marcados como favoritos
- ✅ Persistencia en LocalStorage
- ✅ Sincronización automática en toda la aplicación
- ✅ Opción para limpiar todos los favoritos
- ✅ Actualización reactiva al agregar/remover favoritos

### 4. **Detalles de Pokémon (Modal)**
- ✅ Información completa: ID, nombre, tipos, altura, peso
- ✅ Descripción oficial de la Pokédex
- ✅ Hábitat natural
- ✅ Estadísticas base con gráfico radar interactivo
- ✅ Habilidades del Pokémon
- ✅ Debilidades calculadas según tipos
- ✅ Cadena evolutiva completa (clickeable)
- ✅ Galería de sprites con rotación automática
- ✅ Navegación dentro del modal (Pokémon anterior/siguiente)
- ✅ Botón de favoritos integrado

### 5. **Juego de Adivinanzas (Guess Page)**
- ✅ Selección aleatoria de Pokémon (primeras 3 generaciones)
- ✅ Silueta del Pokémon a adivinar
- ✅ Sistema de intentos con historial
- ✅ Pistas progresivas según número de intentos:
  - Intento 1+: Tipo(s) del Pokémon
  - Intento 2+: Generación
  - Intento 3+: Altura
  - Intento 4+: Peso
  - Intento 5+: Letras reveladas progresivamente
- ✅ Opción para revelar la respuesta
- ✅ Botón para cargar nuevo Pokémon
- ✅ Estadísticas visualizadas en gráfico radar

### 6. **Navegación Global**
- ✅ Barra de navegación responsive
- ✅ Búsqueda global desde cualquier página
- ✅ Menú hamburguesa para dispositivos móviles
- ✅ Rutas con lazy loading para optimización

---

## 🛠️ Tecnologías y Dependencias

### Tecnologías Principales
- **Angular 20.3.0** - Framework principal
- **TypeScript 5.9.2** - Lenguaje de programación
- **TailwindCSS 4.1.14** - Framework de estilos
- **RxJS 7.8.0** - Programación reactiva
- **ng2-charts 8.0.0** - Gráficos con Chart.js

### Dependencias de Desarrollo
```json
{
  "@angular/cli": "^20.3.4",
  "@angular/compiler-cli": "^20.3.0",
  "typescript": "~5.9.2",
  "jasmine-core": "~5.9.0",
  "karma": "~6.4.0"
}
```

### APIs Consumidas
El proyecto consume **más de 3 servicios** de la PokeAPI:
1. **Pokemon API** - Información básica y detallada de Pokémon
2. **Species API** - Descripción, hábitat y cadena evolutiva
3. **Type API** - Información de tipos y relaciones de daño
4. **Evolution Chain API** - Cadena evolutiva completa

---

## 🚀 Pasos para la Ejecución

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Angular CLI (se instalará con las dependencias)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/DvigoyaL/Pokedex-Angular.git
   cd Pokedex-Angular
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
  ```bash
    ng serve
  ```

4. **Abrir en el navegador**
   
   Navega a [http://localhost:4200/](http://localhost:4200/)
   
   La aplicación se recargará automáticamente cuando realices cambios en el código.

### Compilar para Producción

```bash
  ng build
```

Los archivos compilados se generarán en el directorio `dist/` optimizados para producción.


---

## 🎯 Arquitectura y Patrones de Diseño

### Componentes Standalone
Todos los componentes utilizan la nueva arquitectura standalone de Angular, eliminando la necesidad de módulos NgModule tradicionales.

### Servicios Singleton
Los servicios están configurados con `providedIn: 'root'` para asegurar una única instancia en toda la aplicación.

### Programación Reactiva
Uso extensivo de RxJS con operadores como:
- `switchMap` - Para encadenar llamadas HTTP
- `forkJoin` - Para paralelizar múltiples requests
- `catchError` - Para manejo robusto de errores
- `BehaviorSubject` - Para gestión de estado reactivo

### Lazy Loading
Las rutas principales implementan lazy loading para optimizar el tiempo de carga inicial.

### Gestión de Estado
- **FavoritesService** con BehaviorSubject para sincronización reactiva
- **SearchService** para búsqueda global compartida
- **LocalStorage** para persistencia de datos

---

## 📊 Consumo de APIs

### Flujo de Datos Típico

1. **Obtener lista de Pokémon**
   ```
   GET https://pokeapi.co/api/v2/pokemon?limit=21&offset=0
   ```

2. **Obtener detalles completos**
   ```
   GET https://pokeapi.co/api/v2/pokemon/{id}/
   GET https://pokeapi.co/api/v2/pokemon-species/{id}/
   GET https://pokeapi.co/api/v2/type/{id}/
   GET https://pokeapi.co/api/v2/evolution-chain/{id}/
   ```

3. **Procesamiento**
   - Combinar datos de múltiples endpoints
   - Calcular debilidades según tipos
   - Aplanar cadena evolutiva
   - Formatear descripciones

---

## 🎨 Características Destacadas

### Performance
- ✅ ChangeDetection OnPush en componentes clave
- ✅ Lazy loading de rutas
- ✅ Paginación eficiente
- ✅ Caché de resultados en servicios

### UX/UI
- ✅ Diseño responsive con TailwindCSS
- ✅ Animaciones y transiciones suaves
- ✅ Feedback visual en todas las acciones
- ✅ Estados de carga y manejo de errores
- ✅ Modal navegable con teclado (ESC para cerrar)

### Código Limpio
- ✅ TypeScript con tipado estricto
- ✅ Separación de responsabilidades
- ✅ Componentes reutilizables
- ✅ Interfaces bien definidas
- ✅ Manejo consistente de errores

---

## 📝 Notas de Desarrollo

### Uso de IA
Durante el desarrollo se utilizó asistencia de inteligencia artificial para:
- Optimización de consultas RxJS
- Sugerencias de patrones de diseño
- Resolución de problemas específicos

Todos los integrantes del equipo comprenden completamente el código y pueden explicar cada funcionalidad implementada.

---

## 👨‍💻 Autores

Este proyecto fue desarrollado como proyecto final para demostrar:
- Consumo de APIs REST
- Desarrollo web moderno
- Arquitectura de aplicaciones Angular
- Gestión de estado en aplicaciones SPA

**Desarrollado por:** David Vigoya y Rony Trespalacios

---

## 📄 Licencia

Este proyecto fue creado con fines educativos.

---

## 🔗 Enlaces Útiles

- [Angular Documentation](https://angular.dev)
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
- [RxJS Documentation](https://rxjs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Chart.js Documentation](https://www.chartjs.org)
