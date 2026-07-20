import { useSandboxStore } from '../store/sandboxStore';

export function useSandbox() {
  const code = useSandboxStore((s) => s.code);
  const sandboxState = useSandboxStore((s) => s.sandboxState);
  const evalInSandbox = useSandboxStore((s) => s.evalInSandbox);
  const setCode = useSandboxStore((s) => s.setCode);
  const replaceCode = useSandboxStore((s) => s.replaceCode);

  return { code, sandboxState, evalInSandbox, setCode, replaceCode };
}
