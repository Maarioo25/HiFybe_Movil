# HiFybe – App Móvil 📱🎧

Este repositorio contiene la **aplicación móvil** de **HiFybe**, una red social musical que conecta a personas según su ubicación y gustos musicales, gracias a la integración con Spotify. La app está desarrollada con **React Native** y **Expo**, y se conecta al backend de HiFybe para ofrecer una experiencia social y musical completa desde el móvil.

- 🔗 Repositorio: [HiFybe\_Movil](https://github.com/Maarioo25/HiFybe_Movil)
- 🚀 Web desplegada: [https://mariobueno.info](https://mariobueno.info)
- 🚀 Backend desplegado: [https://api.mariobueno.info](https://api.mariobueno.info)
- 📽️ Presentación: [Ver en Canva](https://www.canva.com/design/DAGqML3KOHU/Gmd0HagvLIDl1Kx24MKn_w/view?utm_content=DAGqML3KOHU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=haca5c05453)

---

## 🚀 Tecnologías principales

| Tecnología           | Descripción                                                        |
| -------------------- | ------------------------------------------------------------------ |
| **React Native**     | Framework para construir apps móviles nativas con JavaScript.      |
| **Expo**             | Plataforma que acelera el desarrollo con React Native.             |
| **React Navigation** | Librería de navegación para manejar stacks y tabs.                 |
| **AsyncStorage**     | Almacenamiento local para guardar tokens JWT y preferencias.       |
| **Axios**            | Cliente HTTP para comunicarse con el backend.                      |
| **i18next**          | Sistema de traducción multilingüe.                                 |
| **Spotify API**      | Integración para obtener perfil, playlists y reproducir canciones. |

---

## 📁 Estructura del proyecto

```
.
├── android/             # Configuración específica de Android
├── assets/              # Imágenes, fuentes y otros recursos estáticos
├── components/          # Componentes reutilizables (barra, botones, etc.)
├── context/             # Contextos globales (AuthContext, PlayerContext...)
├── data/                # Archivos estáticos como listas locales
├── public/              # Recursos públicos si aplica
├── screens/             # Vistas principales de la app (Home, Login, Perfil...)
├── services/            # Comunicación con el backend y Spotify
├── utils/               # Funciones auxiliares, helpers
├── App.js               # Entrada principal de la app
├── StackNavigator.js    # Configuración de navegación
├── app.json             # Configuración de Expo
├── index.js             # Registro de la app
```

---

## 🔐 Autenticación

* Autenticación local y mediante Spotify.
* Los tokens JWT se almacenan en `AsyncStorage` y se envían como `Authorization: Bearer <token>`.
* Redirección OAuth manejada mediante `AuthSession` y esquemas personalizados (`hifybe-movil://callback`).

---

## 🌍 Funcionalidades clave

* 🌐 Visualizar usuarios cercanos mediante geolocalización
* 🎧 Reproductor musical integrado con Spotify
* 💬 Chat entre amigos con canciones compartidas
* 📍 Mapa interactivo con avatars y canciones en tiempo real
* 🧑‍🤝‍🧑 Sistema de amistad y solicitudes
* 📁 Visualización de playlists públicas y privadas
* 🌐 Soporte multilenguaje

---

## 🧪 Ejecución local

```bash
# Clonar el repositorio
git clone https://github.com/Maarioo25/HiFybe_Movil.git
cd HiFybe_Movil

# Instalar dependencias
npm install

#Hacer build de la carpeta android.
npx expo prebuild

# Ejecutar en modo desarrollo
npx expo run:android
```

> Asegurate de tener Java JDK 17 o superior
> Asegurate de tener en local.properties de la carpeta android la ruta de tu Android SDK

---

## 📜 Licencia

Este proyecto ha sido desarrollado como parte de un **proyecto de final de grado**. Su uso, distribución y modificación están prohibidos sin autorización expresa del autor.

---

## 🤝 Contacto

**Mario Bueno López**
📧 [mariobueno060@gmail.com](mailto:mariobueno060@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/mario-bueno-l%C3%B3pez-a35181250/)
💻 [HiFybe Web](https://github.com/Maarioo25/HiFybe_FrontEnd)
🛠️ [HiFybe Backend](https://github.com/Maarioo25/HiFybe_BackEnd)
