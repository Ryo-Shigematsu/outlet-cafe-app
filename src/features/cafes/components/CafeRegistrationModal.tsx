'use client'

import type { FormEvent } from 'react'

type CafeRegistrationModalProps = {
  cafeName: string
  hasOutlet: boolean
  hasWifi: boolean
  onCafeNameChange: (name: string) => void
  onHasOutletChange: (hasOutlet: boolean) => void
  onHasWifiChange: (hasWifi: boolean) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function CafeRegistrationModal({
  cafeName,
  hasOutlet,
  hasWifi,
  onCafeNameChange,
  onHasOutletChange,
  onHasWifiChange,
  onClose,
  onSubmit,
}: CafeRegistrationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">新規カフェ登録</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="cafe-name" className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              id="cafe-name"
              type="text"
              value={cafeName}
              onChange={(event) => onCafeNameChange(event.target.value)}
              placeholder="例: カフェ・ベローチェ 天神店"
              required
              className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOutlet}
                onChange={(event) => onHasOutletChange(event.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              コンセントあり
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWifi}
                onChange={(event) => onHasWifiChange(event.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              Wi-Fiあり
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
            >
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
