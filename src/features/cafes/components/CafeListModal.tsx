'use client'

import type { Cafe } from '@/types/cafe'

type CafeListModalProps = {
  cafes: Cafe[]
  onClose: () => void
  onSelectCafe: (cafe: Cafe) => void
}

export function CafeListModal({ cafes, onClose, onSelectCafe }: CafeListModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            登録カフェ一覧 ({cafes.length}件)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-lg px-2"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col gap-3 pr-1">
          {cafes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              登録されているカフェはありません。
            </p>
          ) : (
            cafes.map((cafe) => (
              <button
                key={cafe.id}
                type="button"
                onClick={() => onSelectCafe(cafe)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition flex flex-col gap-1 shadow-sm"
              >
                <h3 className="font-bold text-gray-800 text-base">{cafe.name}</h3>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>🔌 コンセント: {cafe.has_outlet ? 'あり ✅' : 'なし ❌'}</span>
                  <span>📶 Wi-Fi: {cafe.has_wifi ? 'あり ✅' : 'なし ❌'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
