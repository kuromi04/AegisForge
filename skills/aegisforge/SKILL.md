---
name: aegisforge
description: >
  Suite táctica y MCP Gateway de ingeniería inversa nativa en Termux (Android ARM64).
  Permite desensamblar ejecutables ELF nativos con Radare2 (r2), descompilar APKs
  a Java con JADX, inspeccionar recursos y Smali con APKTool, analizar aplicaciones
  Web/JavaScript con REA, y auditar dispositivos conectados vía ADB sin consumir memoria RAM de modelos locales.
allowed-tools:
  - Bash(aegisforge, radare2, r2mcp, jadx, apktool, rea, adb)
  - Read
  - Glob
  - Grep
---

# AegisForge: Native Mobile Reverse Engineering Suite

AegisForge unifica las herramientas de ingeniería inversa más avanzadas de la industria adaptadas de forma 100% nativa para Android/Termux mediante el protocolo MCP (Model Context Protocol).

## 🚀 Capacidades Principales

1. **Análisis de Binarios Nativos (Radare2 / r2mcp):**
   - Desensamblado de funciones C/C++ y Rust en arquitecturas ARM64/x86.
   - Gráficos de flujo de control (CFG) y detección de strings hardcodeados.
2. **Decompilación Móvil (JADX & APKTool):**
   - Conversión de bytecode DEX/APK a código fuente Java navegable.
   - Decodificación completa de `AndroidManifest.xml`, recursos y Smali.
3. **Auditoría Multi-Plataforma (REA Engine):**
   - Reconstrucción de empaquetados JS/Electron y extracción de sourcemaps.
4. **Telemetría e Inyección ADB:**
   - Detección de arquitectura, volcado de memoria y captura de pantalla forense.

## 💻 Uso desde Terminal

```bash
# Iniciar consola interactiva
aegisforge

# Desensamblar binario con Radare2
aegisforge r2 /ruta/al/binario "aaa; afl"

# Decompilar APK con JADX
aegisforge jadx /ruta/a/la/app.apk

# Desempaquetar APK con APKTool
aegisforge apktool /ruta/a/la/app.apk

# Iniciar servidor MCP para agentes
aegisforge mcp
```
