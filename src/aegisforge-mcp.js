#!/usr/bin/env node
/**
 * AegisForge: Unified Native Mobile Reverse Engineering MCP Gateway
 * Fusing Radare2, REA, JADX, APKTool, and ADB for AI Agents on Android/Termux.
 */
import readline from 'node:readline';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const TOOLS = [
  {
    name: "aegis_binary_disasm",
    description: "Disassembles functions, analyzes control flow (CFG), or extracts symbols/strings from an ELF binary or native library using Radare2.",
    inputSchema: {
      type: "object",
      properties: {
        binaryPath: { type: "string", description: "Absolute path to ELF binary or .so file" },
        command: { type: "string", description: "Radare2 analysis command (e.g., 'aaa; afl', 'pdf @main', 'iz', 'iI')" }
      },
      required: ["binaryPath", "command"]
    }
  },
  {
    name: "aegis_r2ai_query",
    description: "Executes AI-assisted binary analysis and queries using Radare2's r2ai / decai plugin (e.g. explain code, find vulnerabilities, or decompile).",
    inputSchema: {
      type: "object",
      properties: {
        binaryPath: { type: "string", description: "Absolute path to ELF binary or library" },
        query: { type: "string", description: "Query or action for r2ai (e.g., '-a solve this function', '-q explain', 'decai')" }
      },
      required: ["binaryPath", "query"]
    }
  },
  {
    name: "aegis_apk_decompile",
    description: "Decompiles Android APK or DEX to high-level Java source code using native Termux JADX.",
    inputSchema: {
      type: "object",
      properties: {
        apkPath: { type: "string", description: "Path to APK file in Termux storage" },
        outputDir: { type: "string", description: "Output directory for extracted Java sources" }
      },
      required: ["apkPath"]
    }
  },
  {
    name: "aegis_apk_unpack",
    description: "Disassembles APK resources, AndroidManifest.xml and Smali bytecode with APKTool.",
    inputSchema: {
      type: "object",
      properties: {
        apkPath: { type: "string", description: "Path to APK file" },
        outputDir: { type: "string", description: "Output folder" }
      },
      required: ["apkPath"]
    }
  },
  {
    name: "aegis_rea_analyze",
    description: "Performs full static overview, web bundle deconstruction, or JS export analysis using REA engine.",
    inputSchema: {
      type: "object",
      properties: {
        targetPath: { type: "string", description: "Target binary, web bundle, or JavaScript folder" },
        action: { type: "string", enum: ["analyze", "analyze-web-bundle", "doctor"], description: "Analysis routine" }
      },
      required: ["targetPath"]
    }
  },
  {
    name: "aegis_adb_telemetry",
    description: "Gathers connected device OS release, CPU ABI, running packages and captures screen via ADB.",
    inputSchema: {
      type: "object",
      properties: {
        serial: { type: "string", description: "ADB device serial (auto-detects if omitted)" },
        action: { type: "string", enum: ["info", "packages", "screen-capture"], description: "Telemetry action" }
      }
    }
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === 'initialize') {
      sendResponse(req.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "AegisForge-MCP", version: "1.0.0" },
        instructions: "AegisForge provides native ARM64 reverse engineering tools (Radare2, JADX, APKTool, REA, ADB) for Termux Android."
      });
    } else if (req.method === 'tools/list') {
      sendResponse(req.id, { tools: TOOLS });
    } else if (req.method === 'tools/call') {
      const { name, arguments: args } = req.params;
      const result = await handleToolCall(name, args || {});
      sendResponse(req.id, result);
    } else {
      sendResponse(req.id, {});
    }
  } catch (err) {}
});

function sendResponse(id, result) {
  if (id === undefined || id === null) return;
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

async function handleToolCall(name, args) {
  try {
    if (name === "aegis_binary_disasm") {
      const cmd = `radare2 -q -c "${args.command}" "${args.binaryPath}"`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 45000 });
      return { content: [{ type: "text", text: stdout || stderr || "Sin salida de Radare2." }] };
    }

    if (name === "aegis_r2ai_query") {
      const isDecai = args.query.trim().startsWith("decai");
      const r2Cmd = isDecai ? args.query : `r2ai ${args.query}`;
      const cmd = `radare2 -q -c "${r2Cmd}" "${args.binaryPath}"`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });
      return { content: [{ type: "text", text: stdout || stderr || "Sin salida de r2ai/decai." }] };
    }

    if (name === "aegis_apk_decompile") {
      const out = args.outputDir || `/data/data/com.termux/files/home/AI-Haklab-Reports/jadx_${Date.now()}`;
      const cmd = `jadx -d "${out}" "${args.apkPath}" --no-res`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 180000 });
      return { content: [{ type: "text", text: `[✔] Decompilado con éxito en: ${out}\n${stdout || stderr || ""}` }] };
    }

    if (name === "aegis_apk_unpack") {
      const out = args.outputDir || `/data/data/com.termux/files/home/AI-Haklab-Reports/apktool_${Date.now()}`;
      const cmd = `apktool d "${args.apkPath}" -o "${out}" -f`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 120000 });
      return { content: [{ type: "text", text: `[✔] Recursos y Smali extraídos en: ${out}\n${stdout || stderr || ""}` }] };
    }

    if (name === "aegis_rea_analyze") {
      const act = args.action || "analyze";
      const cmd = `rea ${act} "${args.targetPath}"`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 90000 });
      return { content: [{ type: "text", text: stdout || stderr || "Sin salida de REA." }] };
    }

    if (name === "aegis_adb_telemetry") {
      const serialArg = args.serial ? `-s ${args.serial}` : "";
      const action = args.action || "info";

      if (action === "screen-capture") {
        const out = `/data/data/com.termux/files/home/AI-Haklab-Reports/screen_${Date.now()}.png`;
        await execAsync(`adb ${serialArg} exec-out screencap -p > "${out}"`, { timeout: 20000 });
        return { content: [{ type: "text", text: `[✔] Captura de pantalla guardada en: ${out}` }] };
      }

      if (action === "packages") {
        const { stdout } = await execAsync(`adb ${serialArg} shell pm list packages -3`, { timeout: 20000 });
        return { content: [{ type: "text", text: `[+] Paquetes de usuario:\n${stdout}` }] };
      }

      const { stdout } = await execAsync(`adb ${serialArg} shell getprop ro.build.version.release && adb ${serialArg} shell getprop ro.product.cpu.abi && adb ${serialArg} shell getprop ro.product.model`, { timeout: 15000 });
      return { content: [{ type: "text", text: `[+] Información de dispositivo:\n${stdout}` }] };
    }

    return { isError: true, content: [{ type: "text", text: `Herramienta ${name} no reconocida.` }] };
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: `Error en ${name}: ${err.message}` }] };
  }
}
