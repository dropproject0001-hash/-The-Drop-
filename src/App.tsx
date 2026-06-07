/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-[#080810] text-[#f1f5f9] flex flex-col items-center justify-center font-sans space-y-4">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-2">DropPin Ops</h1>
      <div className="flex items-center space-x-2 text-[#6366f1]">
        <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse"></div>
        <p className="font-mono text-sm tracking-wider uppercase">System Brain Online</p>
      </div>
      <p className="text-[#94a3b8] text-sm mt-8 max-w-sm text-center">
        The preview is currently showing the idle state. Awaiting your command to proceed with the build sequence.
      </p>
    </div>
  );
}
